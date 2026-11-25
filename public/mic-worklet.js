class MicrophoneFrames extends AudioWorkletProcessor {
  constructor(){
    super();this.buffer=new Float32Array(1024);this.used=0;
  }
  process(inputs){
    for(const sample of inputs[0]?.[0]||[]){
      this.buffer[this.used++]=sample;
      if(this.used===this.buffer.length){
        this.port.postMessage(this.buffer,[this.buffer.buffer]);
        this.buffer=new Float32Array(1024);this.used=0;
      }
    }
    return true;
  }
}
registerProcessor('microphone-frames',MicrophoneFrames);
