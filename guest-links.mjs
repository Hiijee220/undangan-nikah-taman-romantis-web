export const DEFAULT_GUEST='Bapak/Ibu/Saudara/i';
const CODE=/^[A-Za-z0-9_-]{8}$/;
export function normalizeGuestName(value){
 const name=String(value||'').trim().replace(/\s+/g,' ');
 if(!name||name.length>100)throw new Error('Isi nama tamu maksimal 100 karakter.');
 return name;
}
export function guestRegistry(value){
 if(!value||typeof value!=='object'||Array.isArray(value))return {};
 return Object.fromEntries(Object.entries(value).filter(([code,name])=>CODE.test(code)&&typeof name==='string'&&name.trim()&&name.length<=100));
}
export function mergeGuestLinks(older,newer){return {...guestRegistry(older),...guestRegistry(newer)}}
export function resolveGuestName(search,content={}){
 const params=new URLSearchParams(search),legacy=params.get('to')?.trim();
 if(legacy)return legacy.slice(0,100);
 const code=params.get('g'),registry=guestRegistry(content.guestLinks);
 return CODE.test(code||'')&&Object.hasOwn(registry,code)?registry[code]:DEFAULT_GUEST;
}
export function invitationLink(locationHref,code=''){
 const url=new URL('./',locationHref);if(code){if(!CODE.test(code))throw new Error('Kode tamu tidak valid.');url.searchParams.set('g',code)}
 return url.href;
}
export function randomGuestCode(){
 const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',bytes=crypto.getRandomValues(new Uint8Array(8));
 return Array.from(bytes,n=>alphabet[n%64]).join('');
}
export async function registerGuestLink(ref,value,run,makeCode=randomGuestCode){
 const name=normalizeGuestName(value);
 return run(async transaction=>{
  const snapshot=await transaction.get(ref);if(!snapshot.exists())throw new Error('Simpan data undangan dahulu sebelum membuat tautan tamu.');
  const registry=guestRegistry(snapshot.data().guestLinks);
  const existing=Object.entries(registry).find(([,saved])=>saved===name);if(existing)return existing[0];
  if(Object.keys(registry).length>=2000)throw new Error('Batas 2.000 tautan tamu tercapai.');
  let code;for(let i=0;i<20;i++){const candidate=makeCode();if(CODE.test(candidate)&&!Object.hasOwn(registry,candidate)){code=candidate;break}}
  if(!code)throw new Error('Kode tamu belum dapat dibuat. Coba lagi.');
  transaction.update(ref,{guestLinks:{...registry,[code]:name}});
  return code;
 });
}
