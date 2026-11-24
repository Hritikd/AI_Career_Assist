import test from 'node:test';
import assert from 'node:assert/strict';
import {assess,samples,review,task,localReply} from '../public/guide.js';
import handler from '../api/coach.js';
test('day-only constraint cites exact conflicting line',()=>{const job=samples[1].copy,r=assess(job,'Day shifts only');assert.match(r.title,/Clarify/);assert.ok(job.includes(r.quote));assert.match(r.quote,/night shifts/)});
test('optional night shift is not flagged as conflict',()=>assert.doesNotMatch(assess('Night shifts are optional. Handle complaints.','Day shifts only').title,/Clarify/));
test('different roles receive different rehearsal tasks',()=>assert.equal(new Set(samples.map(s=>task(s.copy))).size,3));
test('uncertain answer gets a smaller first step',()=>assert.match(review("I don't know").title,/smaller/));
test('draft feedback quotes candidate and avoids invented accomplishments',()=>{const r=review('Look at logs.');assert.equal(r.quote,'Look at logs.');assert.doesNotMatch(r.body,/you tested|you verified/i)});
test('budget question offers free practice',()=>assert.match(localReply("I cannot pay",{}),/free/));
const payload={mode:'fit',job:samples[1].copy,context:'day shifts only'};
async function call(body){let code,output;await handler({method:'POST',body},{setHeader(){},status(n){code=n;return this},json(x){output=x}});return {code,output}}
test('server enforces request shape',async()=>assert.equal((await call({...payload,job:'x'})).code,400));
test('absent provider and fabricated evidence fail to guided mode',async t=>{const original=process.env.SARVAM_API_KEY;delete process.env.SARVAM_API_KEY;try{assert.equal((await call(payload)).code,503);process.env.SARVAM_API_KEY='test';t.mock.method(globalThis,'fetch',async()=>({ok:true,json:async()=>({choices:[{message:{content:JSON.stringify({title:'Fit',quote:'Invented text',body:'Guess'})}}]})}));assert.equal((await call(payload)).code,503)}finally{if(original===undefined)delete process.env.SARVAM_API_KEY;else process.env.SARVAM_API_KEY=original}});
test('server returns grounded provider output',async t=>{const original=process.env.SARVAM_API_KEY;process.env.SARVAM_API_KEY='test';try{const r={title:'Ask about shifts',quote:'Rotating night shifts are required.',body:'Ask whether a day schedule is available.'};t.mock.method(globalThis,'fetch',async()=>({ok:true,json:async()=>({choices:[{message:{content:JSON.stringify(r)}}]})}));assert.deepEqual(await call(payload),{code:200,output:r})}finally{if(original===undefined)delete process.env.SARVAM_API_KEY;else process.env.SARVAM_API_KEY=original}});
