import assert from 'node:assert/strict';
import {starter} from '../src/data.js';
const base='http://localhost:3000/api';
async function session(){const r=await fetch(base+'/session');return{cookie:r.headers.get('set-cookie').split(';')[0],csrf:(await r.json()).csrf};}
const a=await session(),b=await session();
async function request(s,path,method='GET',body,csrf=s.csrf){const r=await fetch(base+path,{method,headers:{Cookie:s.cookie,'Content-Type':'application/json','x-csrf-token':csrf},body:body?JSON.stringify(body):undefined});return {status:r.status,data:await r.json()};}
assert.equal((await request(a,'/projects','POST',starter(),'invalid')).status,403);
assert.equal((await request(a,'/projects','POST',{name:'bad'})).status,400);
const created=await request(a,'/projects','POST',starter());assert.equal(created.status,200);const id=created.data.id;
assert.equal((await request(b,'/projects/'+id)).status,404);
assert.equal((await request(b,'/projects/'+id,'PUT',created.data)).status,404);
assert.equal((await request(a,'/projects/'+id)).data.name,'Woodland Escape');
const updated=await request(a,'/projects/'+id,'PUT',{...created.data,name:'Updated world'});assert.equal(updated.data.version,2);
assert.equal((await request(a,'/roblox/settings','POST',{apiKey:'x',universeId:'invalid',placeId:'0'})).status,400);
assert.equal((await request(a,'/roblox/publish','POST',{projectId:id})).status,400);
assert.equal((await request(a,'/projects/'+id,'DELETE')).status,200);
assert.equal((await request(a,'/projects/'+id)).status,404);
console.log('PASS: CSRF, validation, create/read/update/delete, ownership isolation, integration errors.');
