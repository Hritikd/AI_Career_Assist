import {TurnBuffer,wavParts} from './voice-input.js';

function base64(buffer){
  const bytes=new Uint8Array(buffer);let value='';
  for(let i=0;i<bytes.length;i+=8192)value+=String.fromCharCode(...bytes.subarray(i,i+8192));
  return btoa(value);
}
export function voiceSession({api,language,onTurn,status,onState}){
  let current=null;
  function end(message){
    const session=current;if(!session)return;
    current=null;
    session.abort.abort();
    session.track?.getTracks().forEach(t=>t.stop());
    session.context.close().catch(()=>{});
    onState(false);
    status(message);
  }
  function listen(session){
    if(session!==current)return;
    session.buffer=new TurnBuffer(session.context.sampleRate);
    session.phase='listen';
    for(const t of session.track.getAudioTracks())t.enabled=true;
    status('Listening. Pause when you’ve finished your thought.');
  }
  async function finish(session){
    const {buffer}=session;session.phase='reply';
    for(const t of session.track.getAudioTracks())t.enabled=false;
    try{
      const options={signal:session.abort.signal};
      const texts=[];
      status('Transcribing your turn…');
      for(const part of wavParts(buffer.frames,buffer.rate)){
        const r=await api('voice',{operation:'listen',language:language(),mime:'audio/wav',audio:base64(part)},options);
        if(session!==current)return;
        texts.push(r.text);
      }
      const reply=await onTurn(texts.join(' '),options);
      if(session!==current)return;
      status('Preparing Mira’s reply…');
      const {audio}=await api('voice',{operation:'speak',language:language(),text:reply},options);
      if(session!==current)return;
      const bytes=Uint8Array.from(atob(audio),c=>c.charCodeAt(0));
      const decoded=await session.context.decodeAudioData(bytes.buffer);
      if(session!==current)return;
      const player=session.context.createBufferSource();player.buffer=decoded;
      player.connect(session.context.destination);
      player.onended=()=>listen(session);
      status('Mira is speaking. Your microphone resumes after her reply.');
      player.start();
    }catch{
      if(current===session)end('Voice paused. You can restart or continue by typing.');
    }
  }
  async function start(){
    if(current)return;
    let session;
    try{
      const Audio=window.AudioContext||window.webkitAudioContext;
      session={context:new Audio(),abort:new AbortController(),phase:'starting'};current=session;
      onState(true);status('Opening microphone…');
      await session.context.resume();
      if(current!==session)return;
      const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
      if(current!==session){stream.getTracks().forEach(t=>t.stop());return}
      session.track=stream;
      await session.context.audioWorklet.addModule('/mic-worklet.js');
      if(current!==session)return;
      const source=session.context.createMediaStreamSource(stream);
      const frames=new AudioWorkletNode(session.context,'microphone-frames');
      const mute=session.context.createGain();mute.gain.value=0;
      source.connect(frames).connect(mute).connect(session.context.destination);
      session.nodes=[source,frames,mute];
      frames.port.onmessage=({data})=>{
        if(session!==current||session.phase!=='listen')return;
        const state=session.buffer.push(data);
        if(state==='idle')end('Conversation paused after silence. Tap Speak to resume.');
        else if(state==='complete')void finish(session);
        else if(session.buffer.elapsed>120000)end('Voice paused after two minutes of continuous sound. Try a shorter turn.');
      };
      listen(session);
    }catch{if(current===session&&session)end('Microphone unavailable. Allow microphone access or type your reply.');else if(!session)status('This browser does not support hands-free audio. You can type your reply.')}
  }
  return {start,end,get active(){return Boolean(current)}};
}
