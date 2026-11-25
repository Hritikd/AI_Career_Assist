import {voiceSession} from './voice-session.js';
import {catalog,listingText,compareText,drill} from './market.js';
import {samples} from './guide.js';

const el = id => document.getElementById(id);
const greetings = {
  'en-IN': ['Hi, I’m Mira. What would you like to figure out about work today?', 'I want to change roles', 'Practise an interview with me', 'Help me decide if a job fits'],
  'hi-IN': ['नमस्ते, मैं मीरा हूँ। आज काम या करियर के बारे में क्या बात करना चाहेंगे?', 'मुझे काम बदलना है', 'इंटरव्यू की प्रैक्टिस करें', 'क्या यह नौकरी मेरे लिए सही है?'],
  'kn-IN': ['ನಮಸ್ಕಾರ, ನಾನು ಮೀರಾ. ಇಂದು ನಿಮ್ಮ ಕೆಲಸದ ಬಗ್ಗೆ ಏನು ಮಾತನಾಡಲು ಬಯಸುತ್ತೀರಿ?', 'ಬೇರೆ ಕೆಲಸ ಹುಡುಕುತ್ತಿದ್ದೇನೆ', 'ಸಂದರ್ಶನ ಅಭ್ಯಾಸ ಮಾಡೋಣ', 'ಈ ಕೆಲಸ ನನಗೆ ಸರಿಹೊಂದುತ್ತದೆಯೇ?']
};
const blank = () => ({language:'en-IN',turns:[],opening:'',action:'',done:false,suggested:'',draft:'',shortlist:[],surface:'jobs',contextName:'',dismissed:'',jobNotes:{}});
const caseMode = location.pathname.replace(/\/$/, '') === '/apna';
const storageKey = caseMode ? 'daystep.shortlist-case' : 'daystep.studio';
function initialState(){
  const base=blank();
  if(caseMode)Object.assign(base,{shortlist:['dispatch','support'],opening:compareText(['dispatch','support']),contextName:'Two saved jobs in Bengaluru',surface:'saved'});
  return base;
}
if(caseMode){
  greetings['en-IN'][0]='You’ve saved dispatch and customer support. Which matters more in your next job: predictable hours, the kind of work, or something else?';
  greetings['hi-IN'][0]='आपने डिस्पैच और कस्टमर सपोर्ट की नौकरियाँ चुनी हैं। आपके लिए तय समय ज़्यादा ज़रूरी है, काम का प्रकार, या कुछ और?';
  greetings['kn-IN'][0]='ನೀವು ಡಿಸ್ಪ್ಯಾಚ್ ಮತ್ತು ಗ್ರಾಹಕ ಬೆಂಬಲದ ಕೆಲಸಗಳನ್ನು ಉಳಿಸಿದ್ದೀರಿ. ನಿಮಗೆ ನಿಗದಿತ ಸಮಯ ಮುಖ್ಯವೇ, ಕೆಲಸದ ಸ್ವರೂಪವೇ ಅಥವಾ ಬೇರೆ ಏನಾದರೂ?';
}
let state = initialState();
try {
  const stored = JSON.parse(localStorage.getItem(storageKey));
  if(stored && greetings[stored.language] && Array.isArray(stored.turns)) state = {...state,...stored};
} catch {}
let busy=false, voiceMode=false, playback=0, failed=false;
function save(){try{localStorage.setItem(storageKey,JSON.stringify(state))}catch{el('live').textContent='This browser could not save your conversation.'}}
function sayStatus(text){el('live').textContent=text}
function node(tag,text,cls){const n=document.createElement(tag);n.textContent=text;if(cls)n.className=cls;return n}
function control(text,fn,cls='secondary'){const b=node('button',text,cls);b.type='button';b.onclick=fn;return b}
function bubble(role,text,evidence){
  const b=node('div','','bubble'+(role==='user'?' me':''));b.append(node('b',role==='user'?'You':'Mira'),document.createTextNode(text));
  if(evidence)b.append(node('blockquote',evidence));
  if(role==='assistant' && text!==greetings[state.language][0]){
    b.append(document.createElement('br'),control('Use as next step',()=>{
      state.suggested=text.slice(0,800);save();draw();const editor=el('actionBox').querySelector('textarea');editor?.focus();
    },'text'));
  }return b;
}
function draw(){
  const feed=el('feed');feed.replaceChildren(bubble('assistant',greetings[state.language][0]),...state.turns.map(t=>bubble(t.role,t.text,t.evidence)));
  feed.scrollTop=feed.scrollHeight;
  const starts=el('starters');starts.replaceChildren();starts.className='chips';
  if(!caseMode && !state.turns.length)for(const prompt of greetings[state.language].slice(1))starts.append(control(prompt,()=>send(prompt),'chip'));
  if(!caseMode && !state.turns.length)starts.append(control('Try a sample voice note',sampleVoice,'chip'));
  el('lang').value=state.language;el('posting').value=state.opening;el('message').value=state.draft;
  const box=el('actionBox');box.replaceChildren();
  if(state.action){
    box.append(node('p',state.action),control(state.done?'Reopen action':'Mark complete',()=>{state.done=!state.done;save();draw()}));
    box.append(control('Copy action',async()=>{try{await navigator.clipboard.writeText(state.action);sayStatus('Action copied.')}catch{sayStatus('Select the action text to copy it.')}}));
    if(state.done)box.append(node('small','Completed'));
  }
  if(state.suggested && state.suggested!==state.action){
    const note=node('textarea','');note.value=state.suggested;note.maxLength=800;note.setAttribute('aria-label','Edit suggested next step');
    const jobs=catalog.filter(i=>i.kind==='jobs'&&state.opening.includes(i.title));
    const target=node('select','');target.setAttribute('aria-label','Attach next step to an opening');
    target.append(new Option('Personal next step',''));
    for(const job of jobs)target.append(new Option(job.title,job.id));
    if(jobs.length===1)target.value=jobs[0].id;
    box.append(node('p','Mira’s suggestion'),note);
    if(jobs.length)box.append(node('small','Save with an opening'),target);
    box.append(control('Save this step',()=>{
      if(!note.value.trim())return;
      state.action=note.value.trim();state.suggested='';state.done=false;
      if(target.value){
        state.jobNotes[target.value]={question:state.action,answer:''};
        if(!state.shortlist.includes(target.value))state.shortlist.push(target.value);
      }
      save();draw();sayStatus(target.value?'Saved on the opening in My shortlist.':'Your next step is saved on this device.');
    }));
  }else if(!state.action)box.append(node('p','When you find something worth trying, you can save it here and come back to it.'));
  if(caseMode)paintCasePrompts();
  el('contextTag').hidden=!state.contextName;el('contextTag').textContent=state.contextName;el('retry').hidden=!failed;paintMarket();lock(busy);
}
function lock(on){
  busy=on;const capturing=handsFree.active;
  for(const id of ['send','lang','discuss','restart','listen','sample','posting','message']) el(id).disabled=on||capturing;
  el('mic').disabled=on&&!capturing;
  el('retry').disabled=on||capturing;
  for(const b of document.querySelectorAll('#starters button,#casePrompts button,.market button')) b.disabled=on||capturing;
}
async function api(route,data,options={}){
  const response=await fetch('/api/'+route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:options.signal ? AbortSignal.any([options.signal,AbortSignal.timeout(28000)]) : AbortSignal.timeout(28000)});
  const result=await response.json();if(!response.ok)throw Error(result.error||'Try again.');return result;
}
function stopAudio(){playback++;el('player').pause();el('player').hidden=true;document.body.classList.remove('speaking')}
async function hear(text){
  stopAudio();const id=playback;
  try{sayStatus('Preparing Mira’s voice…');const {audio}=await api('voice',{operation:'speak',language:state.language,text});
    if(id!==playback)return;
    const player=el('player');player.src='data:audio/wav;base64,'+audio;player.hidden=false;
    try{await player.play();document.body.classList.add('speaking');sayStatus('Mira is speaking. Tap Speak to interrupt.')}catch{sayStatus('Tap play to hear Mira.')}
  }catch{if(id===playback)sayStatus('Audio is unavailable. You can still read and reply.')}
}
el('player').onended=()=>{document.body.classList.remove('speaking');sayStatus('Your turn.')};
async function send(text,retry=false,voiceOptions=null){
  if((!voiceOptions&&(busy||handsFree.active))||!text.trim())return;
  stopAudio();if(!retry)state.turns.push({role:'user',text:text.trim().slice(0,1500)});
  state.draft='';failed=false;save();lock(true);draw();sayStatus('Mira is thinking…');
  try{
    const tail=state.turns.slice(-20).map(({role,text})=>({role,text}));
    const first=state.turns[0];
    if(state.turns.length>20 && first.role==='user')tail.unshift({role:'user',text:first.text});
    const data=await api('conversation',{turns:tail,opening:state.opening,language:state.language,action:state.action},voiceOptions||{});
    if(voiceOptions?.signal.aborted)return;
    state.turns.push({role:'assistant',text:data.reply,evidence:data.evidence});state.suggested=data.action||'';
    save();lock(false);draw();sayStatus('Your turn.');
    if(voiceOptions)return data.reply;
    if(voiceMode)await hear(data.reply);
  }catch{if(voiceOptions?.signal.aborted)return;failed=true;lock(false);draw();sayStatus('Mira couldn’t finish. Retry your saved message or send a correction.');if(voiceOptions)throw Error('Voice turn failed')}
}
el('retry').onclick=()=>send(state.turns.at(-1).text,true);
el('composer').onsubmit=e=>{e.preventDefault();send(el('message').value)};
el('message').oninput=e=>{state.draft=e.target.value;save()};
el('message').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();send(el('message').value)}};
el('listen').onclick=()=>{voiceMode=true;hear(state.turns.filter(t=>t.role==='assistant').at(-1)?.text||greetings[state.language][0])};
el('lang').onchange=e=>{stopAudio();state.language=e.target.value;save();draw()};
for(const [i,s] of samples.entries())el('sample').append(new Option(s.role,i));
el('sample').onchange=e=>{if(e.target.value!==''){state.opening=samples[Number(e.target.value)].copy;el('posting').value=state.opening;save()}};
el('posting').oninput=e=>{state.opening=e.target.value;save()};
el('discuss').onclick=()=>{if(state.opening.trim().length<20){sayStatus('Add a job description first.');return}send(greetings[state.language][3])};
el('restart').onclick=()=>{if(!confirm('Clear this conversation and saved action on this device?'))return;stopAudio();state=initialState();voiceMode=false;failed=false;el('sample').value='';save();draw();sayStatus('Ready for a new conversation.')};
const handsFree=voiceSession({
  api,language:()=>state.language,status:sayStatus,
  onTurn:(text,options)=>send(text,false,options),
  onState:on=>{
    voiceMode=false;
    el('mic').textContent=on?'End voice chat':'Speak to Mira';
    el('talkNow').textContent=on?'End voice chat':'Speak with Mira';
    document.body.classList.toggle('recording',on);
    lock(on);
  }
});
el('mic').onclick=()=>{
  if(handsFree.active){handsFree.end('Voice chat ended.');return}
  if(!busy){stopAudio();handsFree.start()}
};
window.addEventListener('pagehide',()=>handsFree.end('Voice chat ended.'));
document.addEventListener('visibilitychange',()=>{if(document.hidden)handsFree.end('Voice paused while this tab is hidden.')});
failed=state.turns.at(-1)?.role==='user';

async function sampleVoice(){
  if(busy || handsFree.active)return;
  stopAudio();lock(true);sayStatus('Preparing a sample voice note…');
  const demo={'en-IN':'I work in a shop in Bengaluru. I like solving problems, but I want fewer customer calls. What job could I try?', 'hi-IN':'मैं एक दुकान में काम करता हूँ। मुझे समस्याएँ सुलझाना पसंद है लेकिन मैं ग्राहकों के कम कॉल लेना चाहता हूँ। कौन सा काम आज़माऊँ?', 'kn-IN':'ನಾನು ಬೆಂಗಳೂರಿನ ಒಂದು ಅಂಗಡಿಯಲ್ಲಿ ಕೆಲಸ ಮಾಡುತ್ತೇನೆ. ಸಮಸ್ಯೆಗಳನ್ನು ಪರಿಹರಿಸಲು ಇಷ್ಟ, ಆದರೆ ಗ್ರಾಹಕರ ಕರೆಗಳು ಕಡಿಮೆ ಇರಬೇಕು. ಯಾವ ಕೆಲಸ ಪ್ರಯತ್ನಿಸಬಹುದು?'};
  try{
    const {audio}=await api('voice',{operation:'speak',language:state.language,text:demo[state.language]});
    sayStatus('Transcribing the sample with Sarvam…');
    const {text}=await api('voice',{operation:'listen',language:state.language,mime:'audio/wav',audio});
    lock(false);voiceMode=true;await send(text);
  }catch{lock(false);sayStatus('Sample voice is unavailable. You can still start with a suggested question.')}
}

function openCoach(context,name,prompt){
  if(busy||handsFree.active)return;
  state.opening=context;state.contextName=name;save();
  el('coachPanel').scrollIntoView({behavior:'smooth',block:'start'});
  send(prompt);
}
function paintCasePrompts(){
  const host=el('casePrompts');
  host.hidden=false;host.replaceChildren();
  const suggestions=state.turns.length?[
    ['Change my hours','Actually, I need to finish by 4 pm every weekday and cannot work nights. Can either listing confirm those hours?'],
    ['Draft my recruiter question','Write one short question I can send to clarify the scheduling uncertainty.'],
    ['Test the skill for free','I cannot spend money. Give me one small dispatch exercise I can try now and wait for my answer.']
  ]:[
    ['I need day shifts','I work in retail in Bengaluru. I need day shifts and fewer customer calls. Which of these two jobs should I explore first, and why?'],
    ['I enjoy customer calls','I enjoy handling customer complaints and I can work rotating nights. Which of these two jobs should I explore first, and why?']
  ];
  for(const [label,prompt] of suggestions)host.append(control(label,()=>send(prompt),'chip'));
}
function paintMarket(){
  const surface=state.surface, ids=state.shortlist;
  document.querySelectorAll('[data-tab]').forEach(b=>{
    b.setAttribute('aria-pressed',String(b.dataset.tab===surface));
    b.onclick=()=>{state.surface=b.dataset.tab;save();paintMarket()};
  });
  const listings=el('listings');listings.replaceChildren();
  const items=catalog.filter(i=>surface==='saved'?ids.includes(i.id):i.kind===surface);
  if(!items.length)listings.append(node('p','Save a job or course to compare it here.'));
  for(const item of items){
    const card=node('article','','listing');
    card.append(node('small',item.org),node('h3',item.title),node('small',item.meta),node('p',item.terms));
    const more=node('details','');more.append(node('summary','Listing details'),node('p',item.detail));
    const actions=node('div','','listingActions');
    actions.append(control(ids.includes(item.id)?'Remove from shortlist':'Save',()=>{
      state.shortlist=ids.includes(item.id)?ids.filter(id=>id!==item.id):[...ids,item.id];save();paintMarket();
    },'chip'));
    const purpose=item.kind==='jobs'?'Rehearse for this job':item.id==='excel'?'Try the free task':'Check if it’s worth it';
    actions.append(control(purpose,()=>{
      const prompt=item.kind==='jobs'?'Act as an interviewer for this opening. Ask me one realistic question and let me try.':item.id==='excel'?'Give me this dispatch exercise to solve. Wait for my answer.':'Help me decide whether paying for this course makes sense. Ask what you need to know about my goal.';
      const context=listingText(item.id)+(item.id==='excel'?'\nPractice exercise: '+drill:item.id==='ops'?'\nFree alternative: '+listingText('excel'):'');
      openCoach(context,item.title+' · '+(item.kind==='jobs'?'Interview rehearsal':'Learning'),prompt);
    },'secondary'));
    if(item.id==='ops')actions.append(control('Prepare a counsellor question',()=>{
      openCoach(listingText('ops')+'\nOther option: '+listingText('excel'),'Learning · Counsellor preparation','Help me prepare one question for a counsellor before I spend ₹4,800. Use what I have told you and give me a message I can save.');
    },'chip'));
    card.append(more,actions);
    const saved=state.jobNotes[item.id];
    if(saved){
      const followup=node('details','');followup.append(node('summary','My follow-up'),node('p',saved.question));
      const answer=node('textarea','');answer.maxLength=800;answer.value=saved.answer;
      answer.placeholder='What did the recruiter say?';answer.setAttribute('aria-label','Recruiter reply for '+item.title);
      answer.oninput=()=>{saved.answer=answer.value;save()};
      followup.append(answer,control('Recheck this opening',()=>{
        if(!answer.value.trim()){answer.focus();return}
        openCoach(listingText(item.id),item.title+' · Recruiter follow-up','I asked: '+saved.question.slice(0,400)+' My note from the recruiter: '+answer.value.trim()+'. Recheck this opening against my priorities. Distinguish my note from the published listing.');
      },'secondary'));
      card.append(followup);
    }
    listings.append(card);
  }
  const host=el('touchpoint');host.replaceChildren();
  const jobIds=ids.filter(id=>catalog.some(i=>i.id===id&&i.kind==='jobs'));
  const kind=surface==='learn'?'learning':jobIds.length>=2?'compare':'';
  if(!kind||state.dismissed===kind)return;
  const wrap=node('div','','marketPrompt');
  wrap.append(node('p',kind==='compare'?'You saved two openings with different shift patterns. Want to compare them?':'Unsure whether you need a paid course? Compare it with the free dispatch exercise.'));
  wrap.append(control(kind==='compare'?'Compare with Mira':'Compare learning options',()=>{
    openCoach(kind==='compare'?compareText(jobIds):compareText(['excel','ops']),kind==='compare'?'My shortlist · Job comparison':'Learning · Free or paid',kind==='compare'?'Compare my saved jobs. What is the biggest tradeoff for me?':'Compare these learning options and help me choose based on my goal and budget.');
  }),control('Dismiss',()=>{state.dismissed=kind;save();paintMarket()},'text'));host.append(wrap);
}
if(caseMode){
  document.title='A shortlist, a shift, a decision · Daystep for Apna';
  el('deskNav').textContent='Open career desk';el('deskNav').href='/';
  const welcome=document.querySelector('.welcome');
  welcome.querySelector('.eyebrow').textContent='HRITIK DATTA  /  APNA PRODUCT ASSIGNMENT';
  welcome.querySelector('h1').innerHTML='Which shift fits<br> <em>your life?</em>';
  welcome.querySelector('p:last-of-type').textContent='Try a retail worker’s shortlist. Dispatch runs 9 am–6 pm with occasional driver calls. Customer support involves inbound calls and rotating nights. Tell Mira what matters to you.';
  document.querySelector('.heroLink').textContent='Choose a starting point';
  const layout=document.querySelector('.layout'),market=document.querySelector('.market');
  market.before(layout);
  el('actionBox').parentElement.append(makeReviewLinks());
  market.style.marginTop='20px';
}
function makeReviewLinks(){
  const group=node('nav','','reviewLinks');
  group.setAttribute('aria-label','Assignment materials');
  group.append(node('h2','Inside the submission'));
  for(const [title,path] of [['Product decisions & field notes','/product-decisions.html'],['Communication & engagement plan','/engagement-plan.html']]){
    const link=node('a',title);link.href=path;group.append(link);
  }
  return group;
}
draw();

el('talkNow').onclick=()=>{el('coachPanel').scrollIntoView({block:'start'});if(!busy||handsFree.active)el('mic').click()};
