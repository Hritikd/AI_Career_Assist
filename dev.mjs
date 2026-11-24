import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {basename,extname} from 'node:path';
import coach from './api/coach.js';
import voice from './api/voice.js';
import conversation from './api/conversation.js';
const routes={'/api/coach':coach,'/api/voice':voice,'/api/conversation':conversation};
http.createServer(async(req,res)=>{
 const path=new URL(req.url,'http://localhost').pathname;
 if(routes[path]){try{let data='';for await(const chunk of req){data+=chunk;if(data.length>2800000)throw Error()}req.body=JSON.parse(data||'{}');res.status=n=>{res.statusCode=n;return res};res.json=obj=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(obj))};await routes[path](req,res)}catch{res.writeHead(400).end()}return}
 const file=path==='/'?'index.html':basename(path);
 try{const data=await readFile(new URL('./public/'+file,import.meta.url));res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css'})[extname(file)]||'text/plain');res.end(data)}catch{res.writeHead(404).end()}
}).listen(Number(process.env.PORT || (process.argv.includes('--port') && process.argv[process.argv.indexOf('--port')+1]))||3000,'0.0.0.0');
