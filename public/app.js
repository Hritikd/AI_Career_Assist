import {samples,assess,review,task,localReply} from './guide.js';
const $=s=>document.querySelector(s), key='daystep.v1', fresh=()=>({step:0,job:'',context:'',draft:'',history:[],decision:'',done:false});
let s=fresh(),pending=false,token=0;
try{const old=JSON.parse(localStorage.getItem(key));if(old&&[0,1,2].includes(old.step)&&typeof old.job==='string'&&Array.isArray(old.history))s={...s,...old}}catch{}
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
function save(){try{localStorage.setItem(key,JSON.stringify(s))}catch{$('#saveStatus').textContent='Storage unavailable. Keep this tab open.'}}
function notify(t){$('#status').textContent=t;setTimeout(()=>{if($('#status').textContent===t)$('#status').textContent=''},2600)}
function button(action,label,secondary=false){return '<button type="button" data-act="'+action+'" class="'+(secondary?'secondary':'primary')+'">'+label+'</button>'}
function field(id,label,value,placeholder,max,rows=3){return '<label for="'+id+'">'+label+'</label><textarea id="'+id+'" maxlength="'+max+'" rows="'+rows+'" placeholder="'+esc(placeholder)+'">'+esc(value)+'</textarea>'}
function card(r){return '<span class="tag">'+esc(r.source)+'</span><h2>'+esc(r.title)+'</h2><blockquote>'+esc(r.quote)+'</blockquote><p class="msg">'+esc(r.body)+'</p>'}
function talk(){return '<hr><details '+(s.history.length?'open':'')+'><summary>Ask your coach a question</summary>'+s.history.map(h=>'<p class="msg"><strong>'+esc(h.who)+'</strong>'+esc(h.text)+'</p>').join('')+field('question','Your question',s.question||'','Can I use a college project as experience?',800,2)+button('chat','Ask coach',true)+'</details>'}
const labels=['Check fit','Rehearse','Take action'];
function render(){
 $('#steps').innerHTML=labels.map((l,i)=>'<li class="'+(i===s.step?'current':'')+'"><b>'+(i<s.step?'✓':i+1)+'</b>'+l+'</li>').join('');
 const w=$('#work');
 if(s.step===0)w.innerHTML='<h2>Start with an opening</h2><p>Paste the parts of the job that matter to you, or choose a sample.</p>'+field('job','Job description',s.job,'Role, responsibilities, shifts, and requirements…',6000,4)+field('context','What matters to you?',s.context,'For example: I work in retail. I can only do day shifts and want to move into operations.',1600)+button('fit','Check my fit');
 if(s.step===1)w.innerHTML=card(s.fit)+'<div class="actions">'+button('edit','Edit my details',true)+button('plan','Go straight to my decision',true)+'</div><hr><h2>Try the work</h2><p>'+esc(task(s.job))+'</p>'+field('draft','Your practice answer',s.draft,'What would you do first, and why?',3000,4)+button('review','Get feedback')+(s.feedback?'<hr>'+card(s.feedback)+'<div class="actions">'+button('plan','Choose my next step')+'</div>':'')+talk();
 if(s.step===2)w.innerHTML='<h2>'+ (s.done?'Next step completed':'Choose your next step')+'</h2><p>Keep a decision you can act on when you return.</p><label for="decision">My decision</label><select id="decision">'+['Ask the recruiter a question','Prepare my application','Practise one more example','Pass on this opening'].map(x=>'<option '+(s.decision===x?'selected':'')+'>'+x+'</option>').join('')+'</select>'+field('note','My action note',s.note||'','Write the question, example or reason you want to remember.',1200)+'<div class="actions">'+button('complete',s.done?'Reopen my action':'Mark action complete')+button('back','Back to rehearsal',true)+'</div>'+(!s.done?'<details><summary>Set a calendar reminder</summary><label for="when">Remind me on this date</label><input id="when" type="date">'+button('calendar','Download calendar event',true)+'</details>':'')+talk();
 $('#sideTitle').textContent=s.step?'My opening':'Try a sample job';
 $('#sideDesc').textContent=s.step?'Your saved context for this session.':'Explore the workshop with a fictional opening.';
 $('#examples').innerHTML=s.step?'<strong>Job description</strong><p class="msg">'+esc(s.job)+'</p><strong>My priorities</strong><p class="msg">'+esc(s.context)+'</p>':samples.map((r,i)=>'<button class="sample" data-sample="'+i+'"><strong>'+r.role+'</strong><small>'+r.employer+'</small></button>').join('');
}
function actionNote(decision){if(decision==='Ask the recruiter a question')return 'Could you clarify this part of the posting for me? “'+(s.fit?.quote||'')+'”';if(decision==='Prepare my application')return s.draft?'Review this practice example for my application: '+s.draft:'Write one truthful example that matches a responsibility in this posting.';if(decision==='Practise one more example')return task(s.job);return 'Record the reason this opening does not fit my priorities.'}
document.addEventListener('input',e=>{const id=e.target.id;if(['job','context','draft','question','note','decision'].includes(id)){s[id]=e.target.value;if(id==='draft')s.feedback=null;if(id==='decision'){s.note=actionNote(s.decision);$('#note').value=s.note;s.done=false;render()}save()}});
async function coach(mode,fallback){try{const response=await fetch('/api/coach',{method:'POST',signal:AbortSignal.timeout(20500),headers:{'Content-Type':'application/json'},body:JSON.stringify({mode,job:s.job,context:s.context,draft:s.draft,question:s.question||'',history:s.history.slice(-4).map(h=>({...h,text:h.text.slice(0,900)}))})});if(!response.ok)throw Error();return await response.json()}catch{return {...fallback(),source:'Guided coaching · AI unavailable'}}}
function wordCheck(id,min){if((s[id]||'').trim().length>=min)return true;$('#'+id).focus();notify('Please add a little more detail.');return false}
document.addEventListener('click',async e=>{
 const el=e.target.closest('button');if(!el||pending)return;
 if(el.dataset.sample!==undefined){s.job=samples[Number(el.dataset.sample)].copy;save();render();$('#context').focus();return}
 const a=el.dataset.act;
 if(a==='edit')s.step=0;else if(a==='back')s.step=1;
 else if(a==='plan'){s.step=2;s.decision||='Ask the recruiter a question';s.note??=actionNote(s.decision)}
 else if(a==='complete'){if(!wordCheck('note',5))return;s.done=!s.done}
 else if(a==='calendar'){const date=$('#when').value;if(!date){$('#when').focus();return}const d=date.replaceAll('-','');const blob=new Blob([['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Daystep//Career action//EN','BEGIN:VEVENT','UID:'+crypto.randomUUID()+'@daystep','DTSTAMP:'+new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,''),'DTSTART;VALUE=DATE:'+d,'SUMMARY:Daystep - '+s.decision,'BEGIN:VALARM','TRIGGER:-PT0M','ACTION:DISPLAY','DESCRIPTION:Review your career action','END:VALARM','END:VEVENT','END:VCALENDAR'].join('\r\n')],{type:'text/calendar'});const u=URL.createObjectURL(blob),link=document.createElement('a');link.href=u;link.download='daystep-action.ics';link.click();setTimeout(()=>URL.revokeObjectURL(u),1000);return}
 else if(['fit','review','chat'].includes(a)){
 if(a==='fit'&&(!wordCheck('job',20)||!wordCheck('context',5))||a==='review'&&!wordCheck('draft',4)||a==='chat'&&!wordCheck('question',2))return;
 pending=true;const t=++token;const question=s.question;const fitChanged=s.fitJob!==s.job||s.fitContext!==s.context;
 document.querySelectorAll('button,textarea,select').forEach(x=>x.disabled=true);el.textContent='Thinking…';
 const r=await coach(a,()=>a==='fit'?assess(s.job,s.context):a==='review'?review(s.draft):{body:localReply(question,s)});
 if(t!==token)return;pending=false;
 if(a==='fit'){if(fitChanged){s.history=[];s.feedback=null;s.draft='';s.note=null;s.decision='';s.done=false}s.fit=r;s.fitJob=s.job;s.fitContext=s.context;s.step=1}
 if(a==='review')s.feedback=r;
 if(a==='chat'){s.history.push({who:'You',text:question},{who:r.source,text:r.body});s.history=s.history.slice(-16);s.question=''}
 $('#reset').disabled=false;
 }else return;
 save();render();if(a==='review')$('#work hr:nth-last-of-type(2)')?.scrollIntoView({block:'center'});else if(a!=='chat')$('#work').scrollIntoView({block:'start'});
});
$('#reset').onclick=()=>{if(pending||!confirm('Clear this saved workspace and start again?'))return;s=fresh();save();render()};render();
