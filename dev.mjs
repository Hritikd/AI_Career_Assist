import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {basename,extname} from 'node:path';
import coach from './api/coach.js';
http.createServer(async(req,res)=>{
 const path=new URL(req.url,'http://localhost').pathname;
 if(path==='/api/coach'){try{let data='';for await(const chunk of req){data+=chunk;if(data.length>30000)throw Error()}req.body=JSON.parse(data||'{}');res.status=n=>{res.statusCode=n;return res};res.json=obj=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(obj))};await coach(req,res)}catch{res.writeHead(400).end()}return}
 const file=path==='/'?'index.html':basename(path);
 try{const data=await readFile(new URL('./public/'+file,import.meta.url));res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css'})[extname(file)]||'text/plain');res.end(data)}catch{res.writeHead(404).end()}
}).listen(Number(process.env.PORT || (process.argv.includes('--port') && process.argv[process.argv.indexOf('--port')+1]))||3000,'0.0.0.0');
