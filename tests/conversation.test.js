import assert from 'node:assert/strict';
import test from 'node:test';
import conversation from '../api/conversation.js';
import voice from '../api/voice.js';
function res(){return {setHeader(){},status(n){this.code=n;return this},json(x){this.body=x;return this}}}
test('conversation retains the corrected constraint and rejects a fabricated job quote',async t=>{
 const r=res(), previous=process.env.SARVAM_API_KEY;process.env.SARVAM_API_KEY='test';
 t.after(()=>{if(previous===undefined)delete process.env.SARVAM_API_KEY;else process.env.SARVAM_API_KEY=previous});
 t.mock.method(globalThis,'fetch',async(_,opts)=>{const {messages}=JSON.parse(opts.body);assert.equal(messages.at(-1).content,'Actually evenings are fine');return {ok:true,json:async()=>({choices:[{message:{content:JSON.stringify({reply:'What time can you start?',action:'Ask about start times',evidence:'Imaginary salary'})}}]})}});
 await conversation({method:'POST',body:{turns:[{role:'user',text:'Day shifts only'},{role:'assistant',text:'Which hours?'},{role:'user',text:'Actually evenings are fine'}]}},r);
 assert.equal(r.code,200);assert.equal(r.body.evidence,'');
});
test('voice rejects unexpected audio types',async()=>{const r=res();await voice({method:'POST',body:{operation:'listen',language:'en-IN',mime:'text/html',audio:'A'.repeat(100)}},r);assert.equal(r.code,400)});
