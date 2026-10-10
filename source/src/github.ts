import {cleanSettings, Settings} from './config';
export const repository='Hiijee220/undangan-nikah-taman-romantis-web';
const api='https://api.github.com/repos/'+repository;
let token='',dataSha='';
export function logout(){token='';dataSha='';location.replace('./admin.html');}
async function call(path:string,init:RequestInit={}){
 if(!token)throw new Error('Silakan login kembali.');
 const r=await fetch(api+path,{...init,headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',Authorization:'Bearer '+token,'Content-Type':'application/json',...init.headers}});
 if(!r.ok){
  if(r.status===401){token='';throw new Error('Token tidak valid atau sudah kedaluwarsa. Masuk kembali.');}
  if(r.status===409||r.status===422)throw new Error('Data berubah di sesi lain. Muat ulang halaman dan login kembali sebelum menyimpan.');
  if(r.status===403)throw new Error('Akses ditolak. Periksa izin Contents: Read and write dan batas API GitHub.');
  throw new Error('GitHub gagal merespons ('+r.status+'). Coba lagi.');
 }
 return r.json();
}
function decode(value:string){return new TextDecoder().decode(Uint8Array.from(atob(value.replace(/\s/g,'')),c=>c.charCodeAt(0)));}
function encode(value:string){return bytesBase64(new TextEncoder().encode(value));}
function bytesBase64(bytes:Uint8Array){let out='';for(let i=0;i<bytes.length;i+=32768)out+=String.fromCharCode(...bytes.subarray(i,i+32768));return btoa(out);}
export async function login(secret:string):Promise<Settings>{
 token=secret.trim();
 try{
  const repo=await call('');
  if(repo.full_name.toLowerCase()!==repository.toLowerCase()||!repo.permissions?.push)throw new Error('Akun ini tidak memiliki izin menulis repositori undangan.');
  const file=await call('/contents/data.json?ref=main');
  dataSha=file.sha;
  return cleanSettings(JSON.parse(decode(file.content)));
 }catch(e){token='';dataSha='';throw e;}
}
export async function saveSettings(data:Settings){
 const clean=cleanSettings(data);
 // A static public repository cannot hold private, disabled bank information.
 if(!clean.giftEnabled)clean.bankAccounts=[];
 const result=await call('/contents/data.json',{method:'PUT',body:JSON.stringify({branch:'main',message:'Update invitation from admin',sha:dataSha,content:encode(JSON.stringify(clean,null,2)+'\n')})});
 dataSha=result.content.sha;
 return clean;
}
export async function upload(file:File,audio:boolean){
 const ext=file.name.split('.').pop()?.toLowerCase()||'';
 const allowed=audio?['mp3','m4a','ogg']:['jpg','jpeg','png','webp'];
 if(!allowed.includes(ext)||file.size>(audio?15000000:8000000))throw new Error('Format atau ukuran file tidak didukung.');
 const bytes=new Uint8Array(await file.arrayBuffer());
 if(!audio){const ok=ext==='png'?bytes[0]===137&&bytes[1]===80:ext==='webp'?new TextDecoder().decode(bytes.subarray(8,12))==='WEBP':bytes[0]===255&&bytes[1]===216;if(!ok)throw new Error('Isi file tidak sesuai format gambar.');}
 const path='uploads/'+crypto.randomUUID()+'.'+(ext==='jpeg'?'jpg':ext);
 await call('/contents/'+path,{method:'PUT',body:JSON.stringify({branch:'main',message:'Upload invitation '+(audio?'music':'photo'),content:bytesBase64(bytes)})});
 return './'+path;
}
// Keep the existing editor's interface, with persistence handled by GitHub.
export async function request(path:string,init:RequestInit){
 try{
  if(path==='/api/settings'){
   const value=JSON.parse(String(init.body));
   await saveSettings(value.data);
   return Response.json({version:value.version+1});
  }
  const file=(init.body as FormData).get('file');
  if(!(file instanceof File))throw new Error('Pilih file terlebih dahulu.');
  return Response.json({url:await upload(file,path==='/api/audio')});
 }catch(e){return Response.json({error:e instanceof Error?e.message:'Gagal menyimpan.'},{status:400});}
}
