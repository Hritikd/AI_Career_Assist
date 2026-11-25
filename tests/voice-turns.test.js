import test from 'node:test';
import assert from 'node:assert/strict';
import {TurnBuffer,wavParts} from '../public/voice-input.js';
import {voiceSession} from '../public/voice-session.js';
const frame=(value)=>new Float32Array(1600).fill(value);
function feed(turn,count,value){let result;for(let i=0;i<count;i++)result=turn.push(frame(value));return result}
test('pauses inside a sentence stay in the same turn; sustained silence ends it',()=>{
 const turn=new TurnBuffer(16000);
 feed(turn,4,.08);assert.equal(feed(turn,12,0),'listen');feed(turn,4,.08);
 assert.equal(feed(turn,18,0),'complete');
});
test('silent mic idles without uploading, long speech splits into independent WAVs',()=>{
 const turn=new TurnBuffer(16000);assert.equal(feed(turn,200,0),'idle');
 const chunks=wavParts([new Float32Array(48000*25)],48000);
 assert.deepEqual(chunks.map(b=>new DataView(b).getUint32(40,true)),[22*32000,3*32000]);
});
test('one start supports two spoken turns and ending releases the track',async t=>{
 let port,source,stopped=false,requests=0,turns=0;
 const track={enabled:true,stop:()=>{stopped=true}};
 const connection={connect(){return connection}};
 class Context{
  sampleRate=16000;audioWorklet={addModule:async()=>{}};
  async resume(){}async close(){}async decodeAudioData(){return {}}
  createGain(){return {...connection,gain:{}}}
  createMediaStreamSource(){return connection}
  createBufferSource(){source={...connection,start(){}};return source}
 }
 const globals={window:{AudioContext:Context},navigator:{mediaDevices:{getUserMedia:async()=>{requests++;return {getTracks:()=>[track],getAudioTracks:()=>[track]}}}},AudioWorkletNode:class{constructor(){this.port=port={}}connect(){return connection}}};
 for(const [key,value] of Object.entries(globals)){const old=Object.getOwnPropertyDescriptor(globalThis,key);Object.defineProperty(globalThis,key,{value,configurable:true});t.after(()=>old?Object.defineProperty(globalThis,key,old):delete globalThis[key])}
 const s=voiceSession({api:async(_,body)=>body.operation==='listen'?{text:'my question'}:{audio:'AAAA'},language:()=> 'en-IN',onTurn:async()=>{turns++;return 'reply'},status(){},onState(){}});
 await s.start();
 for(let turn=1;turn<=2;turn++){
  for(let i=0;i<5;i++)port.onmessage({data:frame(.08)});
  for(let i=0;i<18;i++)port.onmessage({data:frame(0)});
  await new Promise(resolve=>setImmediate(resolve));assert.equal(turns,turn);assert.equal(track.enabled,false);
  source.onended();assert.equal(track.enabled,true);
 }
 assert.equal(requests,1);s.end('Done');assert.equal(stopped,true);assert.equal(s.active,false);
});
