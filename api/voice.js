const languages = new Set(['en-IN', 'hi-IN', 'kn-IN']);
const mediaTypes = new Map([
  ['audio/webm', 'webm'], ['audio/ogg', 'ogg'], ['audio/mp4', 'mp4'], ['audio/wav', 'wav']
]);
export default async function voice(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({error:'Use POST.'});
  const {operation, language, text, audio, mime} = req.body || {};
  if (!languages.has(language)) return res.status(400).json({error:'Choose a supported language.'});
  const headers = {'api-subscription-key':process.env.SARVAM_API_KEY};
  let body, endpoint;
  if (operation === 'speak' && typeof text === 'string' && text.trim().length && text.length <= 1600) {
    endpoint = 'text-to-speech';
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify({text, target_language_code:language, model:'bulbul:v3', speaker:'shubh'});
  } else if (operation === 'listen' && typeof audio === 'string' && audio.length > 40 && audio.length <= 2600000 && mediaTypes.has(mime)) {
    endpoint = 'speech-to-text';
    body = new FormData();
    body.set('file', new Blob([Buffer.from(audio,'base64')], {type:mime}), 'turn.'+mediaTypes.get(mime));
    body.set('model','saaras:v3');
    body.set('mode','transcribe');
    body.set('language_code',language);
  } else return res.status(400).json({error:'Use a short recording or a short reply.'});
  if (!process.env.SARVAM_API_KEY) return res.status(503).json({error:'Voice is unavailable.'});
  try {
    const response = await fetch('https://api.sarvam.ai/'+endpoint,{method:'POST',headers,body,signal:AbortSignal.timeout(23000)});
    if (!response.ok) return res.status(502).json({error:'Voice provider could not process this turn.',status:response.status});
    const data = await response.json();
    if(operation==='speak' && data.audios?.[0]) return res.status(200).json({audio:data.audios[0]});
    if(operation==='listen' && data.transcript?.trim()) return res.status(200).json({text:data.transcript.trim()});
    return res.status(422).json({error:'No clear speech detected. Try again or type.'});
  } catch {return res.status(503).json({error:'Voice timed out. Try again or type.'});}
}
