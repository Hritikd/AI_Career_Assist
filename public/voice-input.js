// Buffer short pauses inside an utterance. Drop leading silence while keeping
// a little pre-roll so a quiet first syllable survives the speech threshold.
export class TurnBuffer {
  constructor(rate) {
    this.rate=rate;
    this.frames=[];
    this.count=0;
    this.elapsed=0;
    this.quiet=0;
    this.voiced=0;
    this.started=false;
    this.floor=0.002;
  }
  push(frame) {
    const ms=1000*frame.length/this.rate;
    this.elapsed+=ms;
    let energy=0;
    for(const value of frame) energy+=value*value;
    const rms=Math.sqrt(energy/frame.length);
    const speech=rms>Math.max(0.009,this.floor*3);
    if(!speech)this.floor=this.floor*0.97+Math.min(rms,0.018)*0.03;
    this.frames.push(frame);
    this.count+=frame.length;
    if(!this.started){
      this.voiced=speech?this.voiced+ms:0;
      if(this.voiced>=100)this.started=true;
      while(!this.started&&this.count>this.rate*0.55&&this.frames.length>1)this.count-=this.frames.shift().length;
    }
    this.quiet=speech?0:this.quiet+ms;
    if(!this.started&&this.elapsed>=20000)return 'idle';
    if(this.started&&this.quiet>=1750)return 'complete';
    return 'listen';
  }
}
export function wavParts(frames,rate){
  const length=frames.reduce((sum,f)=>sum+f.length,0);
  const pcm=new Float32Array(length);
  let offset=0;
  for(const f of frames){pcm.set(f,offset);offset+=f.length}
  const parts=[];
  for(let start=0;start<length;start+=rate*22){
    const end=Math.min(length,start+rate*22);
    const count=Math.ceil((end-start)*16000/rate);
    const buffer=new ArrayBuffer(44+2*count),view=new DataView(buffer);
    const chars=(at,s)=>{for(let i=0;i<s.length;i++)view.setUint8(at+i,s.charCodeAt(i))};
    chars(0,'RIFF');view.setUint32(4,36+2*count,true);chars(8,'WAVE');chars(12,'fmt ');
    view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);
    view.setUint32(24,16000,true);view.setUint32(28,32000,true);view.setUint16(32,2,true);view.setUint16(34,16,true);
    chars(36,'data');view.setUint32(40,2*count,true);
    for(let i=0;i<count;i++){
      const pos=start+Math.floor(i*rate/16000),next=Math.min(end,Math.max(pos+1,start+Math.floor((i+1)*rate/16000)));
      let sum=0;for(let j=pos;j<next;j++)sum+=pcm[j];
      view.setInt16(44+2*i,Math.max(-1,Math.min(1,sum/(next-pos)))*32767,true);
    }
    parts.push(buffer);
  }
  return parts;
}
