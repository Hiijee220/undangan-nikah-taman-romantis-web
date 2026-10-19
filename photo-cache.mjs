// Uploaded photo IDs are unique; keep bounded, best-effort copies for repeat visits.
let databasePromise;
function database(){
 if(!globalThis.indexedDB)return Promise.resolve(null);
 if(!databasePromise)databasePromise=new Promise(resolve=>{
  const request=indexedDB.open('baptism-taman-photo-cache-v1',1);
  request.onupgradeneeded=()=>request.result.createObjectStore('photos',{keyPath:'id'});
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>resolve(null);
  request.onblocked=()=>resolve(null);
 });
 return databasePromise;
}
async function cachedPhoto(id){try{const db=await database();if(!db)return '';return await new Promise(resolve=>{const request=db.transaction('photos').objectStore('photos').get(id);request.onsuccess=()=>{const item=request.result,ttl=/-\d{13}-/.test(id)?7*864e5:6e4;resolve(item&&Date.now()-item.savedAt<ttl?item.url:'')};request.onerror=()=>resolve('')})}catch{return ''}}
export async function rememberPhoto(id,url){if(!id||!url)return;try{const db=await database();if(!db)return;const store=db.transaction('photos','readwrite').objectStore('photos');store.put({id,url,savedAt:Date.now()});const all=store.getAll();all.onsuccess=()=>{const items=all.result.sort((a,b)=>b.savedAt-a.savedAt);for(const item of items.slice(40))store.delete(item.id)}}catch{/* Cache failure must never block an upload or a photo. */}}
export function createPhotoLoader(fetchPhoto,{read=cachedPhoto,write=rememberPhoto,valid=value=>value}={}){
 const pending=new Map();let active=0;const queue=[];
 function network(action){return new Promise((resolve,reject)=>{queue.push({action,resolve,reject});pump()})}
 function pump(){while(active<4&&queue.length){const job=queue.shift();active++;Promise.resolve().then(job.action).then(job.resolve,job.reject).finally(()=>{active--;pump()})}}
 return function load(id,backup=''){
  if(!id)return Promise.resolve(backup);
  if(!pending.has(id)){
   const task=(async()=>{
    const cached=valid(await Promise.race([Promise.resolve().then(()=>read(id)).catch(()=>''),new Promise(resolve=>setTimeout(()=>resolve(''),180))]));if(cached)return cached;
    const url=valid(await network(()=>fetchPhoto(id)));if(!url)throw new Error('Foto belum tersedia.');
    void Promise.resolve().then(()=>write(id,url)).catch(()=>{});return url;
   })();
   pending.set(id,task);task.catch(()=>pending.delete(id));
  }
  return pending.get(id).catch(()=>backup);
 };
}
export async function mapPhotos(items,load,limit=4){
 const result=new Array(items.length);let next=0;
 await Promise.all(Array.from({length:Math.min(limit,items.length)},async()=>{
  while(next<items.length){const index=next++;result[index]=await load(items[index],index)}
 }));
 return result;
}
