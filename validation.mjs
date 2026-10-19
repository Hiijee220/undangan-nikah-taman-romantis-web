export const THEMES=['sky','forest','rose','navy','sage','terracotta'];
export function safeLink(value){
 if(!value)return '';
 try{const url=new URL(String(value));return url.protocol==='https:'&&!url.username&&!url.password?url.href:''}catch{return ''}
}
export function safeImage(value){
 if(typeof value!=='string')return '';
 if(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value)&&value.length<900000)return value;
 if(/^\.\/(garden\.webp|baby-placeholder\.svg|uploads\/[a-z0-9-]+\.(jpg|png|webp))$/.test(value))return value;
 return safeLink(value);
}
export function cleanContent(value){
 if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Data undangan tidak valid.');
 const data={...value};
 if(!THEMES.includes(data.theme))throw new Error('Pilih tema yang tersedia.');
 for(const [key,val]of Object.entries(data)){
  if(typeof val==='string'){
   if(val.length>5000)throw new Error('Teks terlalu panjang: '+key);
   if((/Url$/.test(key)||key==='musicUrl')&&val&&!safeLink(val))throw new Error('Gunakan tautan HTTPS untuk '+key+'.');
   if(/Image$/.test(key)&&val&&!safeImage(val))throw new Error('Tautan foto tidak valid.');
   if(/Id$/.test(key)&&!['appId'].includes(key)&&val&&!/^[a-zA-Z0-9-]{1,100}$/.test(val))throw new Error('ID foto tidak valid.');
  }
 }
 for(const [key,max]of [['openingIds',4],['galleryIds',10]]){
  if(!Array.isArray(data[key])||data[key].length>max||data[key].some(id=>typeof id!=='string'||!/^[a-zA-Z0-9-]{1,100}$/.test(id)))throw new Error('Daftar foto tidak valid.');
 }
 if(data.date&&!/^\d{4}-\d{2}-\d{2}$/.test(data.date))throw new Error('Tanggal tidak valid.');
 if(data.eventStartTime&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(data.eventStartTime))throw new Error('Jam tidak valid.');
 return data;
}
export function cleanRsvp(value){
 const name=String(value.name||'').trim(),message=String(value.message||'').trim(),attendance=String(value.attendance||'');
 if(!name||name.length>80||!message||message.length>500||!['hadir','tidak_hadir','ragu'].includes(attendance))throw new Error('Lengkapi nama, ucapan, dan kehadiran.');
 const guestCount=attendance==='hadir'?Number(value.guestCount):0;
 if(!Number.isInteger(guestCount)||guestCount<0||guestCount>4||(attendance==='hadir'&&guestCount<1))throw new Error('Jumlah tamu harus 1–4 orang.');
 return {name,message,attendance,guestCount};
}
export function firebaseError(error){
 const code=String(error?.code||'');
 if(code.includes('permission-denied'))return 'Akses penyimpanan belum diizinkan. Tambahkan aturan khusus undangan ini melalui panduan pengaturan.';
 if(code.includes('unauthorized-domain'))return 'Tambahkan hiijee220.github.io pada Authentication → Settings → Authorized domains di Firebase.';
 if(code.includes('operation-not-allowed'))return 'Aktifkan metode login Google atau Email/Password pada Firebase Authentication.';
 if(code.includes('invalid-credential')||code.includes('wrong-password')||code.includes('user-not-found'))return 'Email atau password belum benar. Gunakan reset password jika akun admin sudah dibuat.';
 if(code.includes('popup-blocked')||code.includes('popup-closed'))return 'Login Google belum selesai. Buka admin langsung di Safari/Chrome atau gunakan login email.';
 return error?.message||'Terjadi kesalahan. Silakan coba lagi.';
}
