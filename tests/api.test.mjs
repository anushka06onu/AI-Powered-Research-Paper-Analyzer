import test from 'node:test';
import assert from 'node:assert/strict';
import analyze from '../api/analyze.js';
import chat from '../api/chat.js';
function response(){return {code:0,body:null,setHeader(){},status(code){this.code=code;return this;},json(body){this.body=body;return this;}};}
const analysis={title:'Test',authors:[],abstract_summary:'Source summary',methodology:'Source method',key_contributions:[],keywords:[],future_work:[]};
test('API rejects invalid requests and never invents fallback analysis',async()=>{
 const r=response();await analyze({method:'GET'},r);assert.equal(r.code,405);
 const bad=response();await analyze({method:'POST',body:{pdf:'not-pdf'}},bad);assert.equal(bad.code,400);
 const key=process.env.GEMINI_API_KEY;delete process.env.GEMINI_API_KEY;
 try{const missing=response();await analyze({method:'POST',body:{pdf:Buffer.from('%PDF-1.4\nfictional fixture').toString('base64')}},missing);assert.equal(missing.code,503);assert.equal(missing.body.analysis,undefined);}finally{if(key!==undefined)process.env.GEMINI_API_KEY=key;}
});
test('valid provider response is returned; invalid provider data fails closed',async()=>{
 const original=globalThis.fetch,key=process.env.GEMINI_API_KEY;process.env.GEMINI_API_KEY='test-placeholder';
 try{
  globalThis.fetch=async(url,options)=>{assert.ok(!url.includes('test-placeholder'));assert.equal(options.headers['x-goog-api-key'],'test-placeholder');return {ok:true,json:async()=>({candidates:[{content:{parts:[{text:JSON.stringify(analysis)}]}}]})};};
  const r=response();await analyze({method:'POST',body:{pdf:Buffer.from('%PDF-1.4 fixture').toString('base64')}},r);assert.equal(r.code,200);assert.deepEqual(r.body.analysis,analysis);
  globalThis.fetch=async()=>({ok:true,json:async()=>({candidates:[{content:{parts:[{text:'{}'}]}}]})});
  const bad=response();await analyze({method:'POST',body:{pdf:Buffer.from('%PDF-1.4 fixture').toString('base64')}},bad);assert.equal(bad.code,502);
 }finally{globalThis.fetch=original;if(key===undefined)delete process.env.GEMINI_API_KEY;else process.env.GEMINI_API_KEY=key;}
});
test('chat cannot run without an analysis',async()=>{const r=response();await chat({method:'POST',body:{messages:[]}},r);assert.equal(r.code,400);});
