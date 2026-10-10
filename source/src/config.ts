export const themes=[
 {id:'garden',name:'Enchanted Garden',description:'Taman klasik, bunga pastel, kabut, dan perjalanan kamera.'},
 {id:'rose',name:'Rose Romance',description:'Bingkai bunga merah muda dan lengkungan lembut.'},
 {id:'royal',name:'Royal Midnight',description:'Biru malam, bintang, dan ornamen emas.'},
 {id:'editorial',name:'Modern Editorial',description:'Komposisi majalah, warna krem, dan tipografi tegas.'},
 {id:'sage',name:'Sage Botanical',description:'Nuansa hijau zaitun, kertas alami, dan bingkai botani.'},
 {id:'lavender',name:'Lavender Dream',description:'Ungu lembut, cahaya senja, dan aksen bunga romantis.'}
];
export const musicPresets=[{url:'./audio/serene.mp3',name:'Serene — instrumental lembut'},{url:'./audio/waltz.mp3',name:'Petal Waltz — instrumental romantis'}];
export type BankAccount={id:string;bank:string;number:string;holder:string};
export const defaults={title:'The Wedding of',groom:'Nama Mempelai',bride:'Nama Mempelai',groomFull:'[Nama lengkap mempelai]',brideFull:'[Nama lengkap mempelai]',groomParents:'[Nama orang tua mempelai]',brideParents:'[Nama orang tua mempelai]',date:'',time:'',ceremony:'Pemberkatan / Akad',ceremonyVenue:'[Nama tempat pemberkatan / akad]',ceremonyAddress:'[Alamat lengkap]',receptionDate:'',receptionTime:'',receptionVenue:'[Nama tempat resepsi]',receptionAddress:'[Alamat lengkap]',mapUrl:'',rsvpPhone:'',story:'Setiap langkah membawa kami pada hari ini. Dengan penuh sukacita, kami ingin merayakan awal perjalanan baru bersama Anda.',greeting:'Dengan penuh rasa syukur, kami mengundang Bapak / Ibu / Saudara/i untuk hadir dan memberikan doa restu pada hari pernikahan kami.',closing:'Kehadiran dan doa Anda adalah hadiah terindah bagi kami.',theme:'garden',themeLabel:'Enchanted Garden',groomPhoto:'',bridePhoto:'',coverPhoto:'',musicUrl:'./audio/serene.mp3',musicEnabled:true,musicVolume:0.35,gallery1:'',gallery2:'',draft:true,giftEnabled:false,giftTitle:'Wedding Gift',giftMessage:'Doa restu Anda adalah hadiah terindah. Apabila ingin mengirimkan tanda kasih, Anda dapat menggunakan rekening berikut.',bankAccounts:[] as BankAccount[]};
export type Settings=typeof defaults;
export function publicSettings(settings:Settings):Settings{return {...settings,bankAccounts:settings.giftEnabled?settings.bankAccounts:[]};}
export function cleanSettings(value:unknown):Settings{
 if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Data tidak valid.');
 const v=value as Record<string,unknown>,result={...defaults};
 for(const key of Object.keys(defaults) as (keyof Settings)[]){
  if(key==='bankAccounts')continue;
  if(key==='draft'||key==='musicEnabled'||key==='giftEnabled'){if(typeof v[key]!=='boolean')throw new Error('Pengaturan tidak valid.');result[key]=v[key] as boolean;continue;}
  if(key==='musicVolume'){if(typeof v[key]!=='number'||!Number.isFinite(v[key])||v[key]<0||v[key]>1)throw new Error('Volume harus 0–100%.');result.musicVolume=v[key] as number;continue;}
  if(typeof v[key]!=='string'||(v[key] as string).length>4000)throw new Error('Kolom '+key+' tidak valid.');
  (result as Record<string,unknown>)[key]=(v[key] as string).trim();
 }
 if(!themes.some(t=>t.id===result.theme))throw new Error('Tema tidak tersedia.');
 if(result.mapUrl&&!safeUrl(result.mapUrl))throw new Error('Gunakan tautan HTTPS.');
 if(result.musicUrl&&!safeUrl(result.musicUrl)&&!musicPresets.some(p=>p.url===result.musicUrl)&&!/^\.\/uploads\/[a-z0-9-]+\.(mp3|m4a|ogg)$/.test(result.musicUrl))throw new Error('Tautan musik tidak valid.');
 for(const key of ['groomPhoto','bridePhoto','coverPhoto','gallery1','gallery2'] as const){if(result[key]&&!/^\.\/uploads\/[a-z0-9-]+\.(jpg|png|webp)$/.test(result[key])&&!safeUrl(result[key]))throw new Error('Tautan foto tidak valid.');}
 if(result.rsvpPhone&&!/^\+?[0-9]{8,16}$/.test(result.rsvpPhone))throw new Error('Nomor WhatsApp harus berisi 8–16 angka.');
 if(!Array.isArray(v.bankAccounts)||v.bankAccounts.length>6)throw new Error('Maksimal 6 rekening.');
 const ids=new Set<string>();
 result.bankAccounts=v.bankAccounts.map(a=>{if(!a||typeof a!=='object')throw new Error('Rekening tidak valid.');const account=a as Record<string,unknown>;for(const k of ['id','bank','number','holder'])if(typeof account[k]!=='string')throw new Error('Lengkapi informasi rekening.');const id=(account.id as string).trim(),bank=(account.bank as string).trim(),number=(account.number as string).replace(/[\s-]/g,''),holder=(account.holder as string).trim();if(!/^[a-z0-9-]{1,80}$/.test(id)||ids.has(id)||!bank||bank.length>80||!holder||holder.length>120||!/^\d{5,30}$/.test(number))throw new Error('Lengkapi bank, nama pemilik, dan nomor rekening (5–30 angka).');ids.add(id);return {id,bank,number,holder};});
 return result;
}
function safeUrl(v:string){try{const u=new URL(v);return u.protocol==='https:'&&!u.username&&!u.password}catch{return false}}
