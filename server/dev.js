import http from 'node:http';
import analyze from '../api/analyze.js';
import chat from '../api/chat.js';
http.createServer(async (req,res)=>{
  res.status=(code)=>{res.statusCode=code;return res;};
  res.json=(data)=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(data));};
  const handler={'/api/analyze':analyze,'/api/chat':chat}[req.url];
  if(!handler)return res.status(404).json({detail:'Not found'});
  let body='';
  for await (const chunk of req){body+=chunk;if(Buffer.byteLength(body)>4.2*1024*1024)return res.status(413).json({detail:'File too large'});}
  req.body=body;await handler(req,res);
}).listen(3001,()=>console.log('Local analysis API: http://localhost:3001'));
