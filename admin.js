import{auth,db,CONTENT_COLLECTION,ADMIN_EMAIL}from"./firebase.js";
import{defaults}from"./defaults.js?v=audio-8";
import {baptismContent} from "./content.mjs?v=audio-8";
import{saveContent}from"./persistence.mjs";
import{cleanContent,firebaseError,safeImage}from"./validation.mjs?v=music-5";
import{GoogleAuthProvider,signInWithPopup,onAuthStateChanged,signOut,setPersistence,browserLocalPersistence,signInWithEmailAndPassword,sendPasswordResetEmail,sendEmailVerification}from"https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import{doc,getDoc,setDoc,runTransaction}from"https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {createPhotoLoader,rememberPhoto,mapPhotos} from './photo-cache.mjs?v=music-5';

const fieldGroups=[
  ["Sampul & Nama Tamu",[["childName","Nama panggilan anak"],["initials","Inisial atau simbol sampul"],["baptismLabel","Judul sampul baptisan"],["guestHeading","Sapaan tamu"],["guestNote","Catatan nama tamu","textarea"],["openButtonText","Tulisan tombol buka"]]],
  ["Ayat Alkitab",[["greeting","Isi ayat pembuka","textarea"],["verseReference","Sumber ayat pembuka"],["secondVerse","Isi ayat kedua","textarea"],["secondVerseReference","Sumber ayat kedua"]]],
  ["Profil Anak",[["childRole","Label profil anak"],["childFullName","Nama lengkap anak"],["childDescription","Keterangan anak / tanggal lahir","textarea"],["childInstagramLabel","Tulisan Instagram anak / keluarga"],["childInstagramUrl","Link Instagram anak / keluarga","url"]]],
  ["Orang Tua & Wali Baptis",[["familyRole","Label orang tua"],["fatherName","Nama ayah (beserta gelar)"],["motherName","Nama ibu (beserta gelar)"],["godparentsNames","Nama wali baptis (boleh kosong)","textarea"],["familyInstagramLabel","Tulisan Instagram keluarga"],["familyInstagramUrl","Link Instagram keluarga","url"]]],
  ["Pengantar Baptisan",[["childLabel","Label bagian anak"],["childTitle","Judul profil anak"],["story","Kalimat undangan","textarea"]]],
  ["Tanggal Utama",[["eventLabel","Tulisan Save the date"],["eventTitle","Judul bagian acara"],["date","Tanggal baptisan","date"],["eventStartTime","Jam mulai untuk hitung mundur","time"],["mapsButtonText","Tulisan tombol Maps"]]],
  ["Ibadah Baptisan",[["ceremonyTitle","Nama acara"],["ceremonyTime","Waktu baptisan"],["ceremonyVenue","Nama tempat baptisan"],["ceremonyAddress","Alamat baptisan","textarea"],["ceremonyMapsUrl","Link Google Maps baptisan","url"]]],
  ["Syukuran (Opsional)",[["showReception","Tampilkan syukuran","select"],["receptionTitle","Nama acara"],["receptionTime","Waktu syukuran"],["receptionVenue","Nama tempat syukuran"],["receptionAddress","Alamat syukuran","textarea"],["receptionMapsUrl","Link Google Maps syukuran","url"]]],
  ["Galeri",[["galleryLabel","Tulisan Our Gallery"],["galleryTitle","Judul galeri"],["galleryBlessing","Ayat / doa di atas galeri","textarea"],["galleryBlessingReference","Sumber ayat galeri"]]],
  ["Cerita 1",[["journey1Year","Tahun / tanggal cerita 1"],["journey1Title","Judul cerita 1"],["journey1Text","Isi cerita 1","textarea"]]],
  ["Cerita 2",[["journey2Year","Tahun / tanggal cerita 2"],["journey2Title","Judul cerita 2"],["journey2Text","Isi cerita 2","textarea"]]],
  ["Cerita 3",[["journey3Year","Tahun / tanggal cerita 3"],["journey3Title","Judul cerita 3"],["journey3Text","Isi cerita 3","textarea"]]],
  ["Judul Cerita",[["journeyLabel","Tulisan Our Story"],["journeyTitle","Judul bagian cerita"]]],
  ["Ucapan & RSVP",[["rsvpLabel","Tulisan Ucapan & RSVP"],["rsvpTitle","Judul RSVP"],["rsvpText","Penjelasan RSVP","textarea"],["rsvpButtonText","Tulisan tombol kirim"]]],
  ["Gulir Otomatis",[["autoScrollEnabled","Mulai otomatis setelah undangan dibuka","select"],["autoScrollSpeed","Kecepatan gulir","scroll-speed"]]],
  ["Musik",[["musicTitle","Judul musik"],["musicUrl","Link MP3, OGG, YouTube, atau Google Drive","url"]]],
  ["Penutup & Sosial Media",[["closingLabel","Tulisan penutup"],["footerText","Ucapan terima kasih","textarea"],["closingCredit","Tulisan kecil paling bawah"],["whatsappUrl","Link WhatsApp","url"],["instagramUrl","Link Instagram","url"]]],
  ["Menu & Hitung Mundur",[["navHome","Menu Home"],["navChild","Menu Anak"],["navEvent","Menu Acara"],["navGallery","Menu Galeri"],["navRsvp","Menu Ucapan"],["countdownDay","Label hari"],["countdownHour","Label jam"],["countdownMinute","Label menit"],["countdownSecond","Label detik"]]]
];


const imageSlots=[
  ["coverId","Foto sampul utama","hero"],["childImageId","Foto anak","childName"],["familyImageId","Foto keluarga","familyName"],["story1ImageId","Foto cerita 1","story-1"],["story2ImageId","Foto cerita 2","story-2"],["story3ImageId","Foto cerita 3","story-3"]
];

let data={...defaults};const $=selector=>document.querySelector(selector);
function setStatus(message,bad=false){const element=$("#status");element.textContent=message;element.classList.toggle("error",bad)}
function setLoginStatus(message,bad=false){const element=$("#loginStatus");element.textContent=message;element.classList.toggle("error",bad)}
function esc(value=""){return String(value).replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]))}

async function prepareAuth(){await setPersistence(auth,browserLocalPersistence)}
$("#loginBtn").onclick=async()=>{try{setLoginStatus("Membuka login Google...");await prepareAuth();const provider=new GoogleAuthProvider();provider.setCustomParameters({prompt:"select_account"});await signInWithPopup(auth,provider)}catch(error){setLoginStatus(firebaseError(error),true)}};
$("#emailLoginForm").onsubmit=async event=>{event.preventDefault();try{setLoginStatus("Sedang masuk...");await prepareAuth();await signInWithEmailAndPassword(auth,$("#adminEmail").value.trim(),$("#adminPassword").value)}catch(error){setLoginStatus(firebaseError(error),true)}finally{$("#adminPassword").value=""}};
$("#resetPasswordBtn").onclick=async()=>{const email=$("#adminEmail").value.trim();if(!email)return setLoginStatus("Masukkan email admin terlebih dahulu.",true);try{await sendPasswordResetEmail(auth,email);setLoginStatus("Link reset password telah dikirim ke email admin.")}catch(error){setLoginStatus(firebaseError(error),true)}};
$("#logoutBtn").onclick=()=>signOut(auth);

let revision=0,ready=false,busy=false;
function collectDraft(){new FormData($('#contentForm')).forEach((value,key)=>data[key]=value);data.theme=$('#theme').value;return cleanContent(data);}
async function persistContent(){if(!ready)throw new Error('Data belum dimuat. Login dan periksa aturan penyimpanan terlebih dahulu.');const clean=collectDraft();const nextRevision=await saveContent(doc(db,CONTENT_COLLECTION,'content'),revision,clean,action=>runTransaction(db,action));revision=nextRevision;data={...clean,revision};}
async function operation(action){if(busy)return;busy=true;$('#contentForm').inert=true;try{await action()}catch(error){setStatus(firebaseError(error),true)}finally{busy=false;$('#contentForm').inert=false;}}
onAuthStateChanged(auth,async user=>{ready=false;$('#editor').hidden=true;$('#login').hidden=false;$('#verifyEmailBtn').hidden=true;$('#user').textContent=user?.email||'Silakan masuk';if(!user)return;if(user.email?.toLowerCase()!==ADMIN_EMAIL){setLoginStatus('Akun ini bukan admin undangan.',true);await signOut(auth);return;}if(!user.emailVerified){$('#verifyEmailBtn').hidden=false;setLoginStatus('Verifikasi email admin terlebih dahulu, atau masuk dengan akun Google yang sama.',true);return;}try{const snapshot=await getDoc(doc(db,CONTENT_COLLECTION,'content'));const saved=snapshot.exists()?snapshot.data():{};data=baptismContent(saved);revision=Number(saved.revision||0);ready=true;$('#login').hidden=true;$('#editor').hidden=false;await render();}catch(error){setLoginStatus(firebaseError(error),true);}});
$('#verifyEmailBtn').onclick=async()=>{try{if(auth.currentUser?.email?.toLowerCase()!==ADMIN_EMAIL)throw new Error('Masuk menggunakan email admin terlebih dahulu.');await sendEmailVerification(auth.currentUser);setLoginStatus('Email verifikasi dikirim. Setelah verifikasi, muat ulang dan login kembali.');}catch(error){setLoginStatus(firebaseError(error),true);}};

function renderFields(){$("#fields").innerHTML=fieldGroups.map(([title,fields])=>`<section class="field-group"><h3>${esc(title)}</h3><div class="field-group-grid">${fields.map(([key,label,type])=>`<label class="field ${type==="textarea"?"field-wide":""}"><span>${esc(label)}</span>${type==="scroll-speed"?`<select name="${key}">${[["slow","Pelan"],["normal","Sedang"],["fast","Cepat"]].map(([value,title])=>`<option value="${value}" ${data[key]===value?"selected":""}>${title}</option>`).join("")}</select>`:type==="select"?`<select name="${key}"><option value="yes" ${data[key]!=="no"?"selected":""}>Ya</option><option value="no" ${data[key]==="no"?"selected":""}>Tidak</option></select>`:type==="textarea"?`<textarea name="${key}">${esc(data[key])}</textarea>`:`<input name="${key}" type="${type||"text"}" value="${esc(data[key])}">`}</label>`).join("")}</div></section>`).join("")}
const imageUrl=createPhotoLoader(async id=>{const snapshot=await getDoc(doc(db,CONTENT_COLLECTION,id));return snapshot.exists()?snapshot.data().dataUrl:''},{valid:safeImage});
async function render(){renderFields();$("#theme").value=data.theme||"sky";document.documentElement.dataset.theme=data.theme||"sky";$("#imageSlots").innerHTML=imageSlots.map(([key,label])=>`<label class="upload-card"><span>${esc(label)}</span><input type="file" data-image-slot="${key}" accept="image/jpeg,image/png,image/webp,image/heic,image/heif"><img class="single-preview" data-preview="${key}" alt="Pratinjau ${esc(label)}" loading="lazy" decoding="async" hidden></label>`).join("");
  document.querySelectorAll("[data-image-slot]").forEach(input=>input.onchange=event=>operation(()=>uploadSingle(event.target)));
  setStatus("Memuat kembali semua foto tersimpan...");
  const results=await Promise.all([
    mapPhotos(imageSlots,async([key])=>{const id=data[key];if(!id)return 0;const url=await imageUrl(id),preview=document.querySelector(`[data-preview="${key}"]`);if(url){preview.src=url;preview.hidden=false;return 0}return 1}),
    renderCollection('openingIds','#openingThumbs'),
    renderCollection('galleryIds','#galleryThumbs')
  ]);
  const failed=results[0].reduce((sum,n)=>sum+n,0)+results[1]+results[2];
  setStatus(failed?`${failed} pratinjau belum termuat. Muat ulang halaman untuk mencoba lagi.`:'Semua foto dan fitur berhasil dimuat kembali.',!!failed);
}
async function renderCollection(key,selector){
 const ids=Array.isArray(data[key])?[...data[key]]:[],target=$(selector),batch=Symbol();target.photoBatch=batch;
 target.innerHTML=ids.map((id,index)=>`<div><img data-thumb="${index}" alt="Foto ${index+1}" loading="lazy" decoding="async" hidden><span data-loading="${index}">Memuat foto…</span><button type="button" data-remove="${key}:${index}">Hapus</button></div>`).join('');
 target.querySelectorAll('[data-remove]').forEach(button=>button.onclick=()=>operation(()=>removeCollectionImage(key,Number(button.dataset.remove.split(':')[1]))));
 const failures=await mapPhotos(ids,async(id,index)=>{const url=await imageUrl(id),preview=target.querySelector(`[data-thumb="${index}"]`),label=target.querySelector(`[data-loading="${index}"]`);if(target.photoBatch!==batch||!preview||!label)return 0;if(url){preview.src=url;preview.hidden=false;label.hidden=true;return 0}label.textContent='Pratinjau belum termuat';return 1});
 return failures.reduce((sum,n)=>sum+n,0);
}
async function removeCollectionImage(key,index){collectDraft();const ids=Array.isArray(data[key])?data[key]:[],id=ids[index];try{ids.splice(index,1);data[key]=ids;await persistContent();await renderCollection(key,key==="openingIds"?"#openingThumbs":"#galleryThumbs");setStatus("Foto berhasil dihapus.")}catch(error){setStatus(firebaseError(error),true)}}

const MAX_INPUT_SIZE=10*1024*1024;
function loadPhoto(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onerror=()=>reject(new Error("Foto tidak dapat dibaca."));reader.onload=()=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error("Format foto belum didukung browser. Gunakan JPG, PNG, atau WebP."));image.src=reader.result};reader.readAsDataURL(file)})}
function canvasBlob(canvas,quality){return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error("Foto gagal dikompres.")),"image/jpeg",quality))}
async function compress(file){if(!file)throw new Error("Tidak ada foto yang dipilih.");if(file.size>MAX_INPUT_SIZE)throw new Error(`Ukuran ${file.name} melebihi batas 10 MB.`);const image=await loadPhoto(file),max=1500,scale=Math.min(1,max/Math.max(image.naturalWidth,image.naturalHeight)),canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));const context=canvas.getContext("2d");context.fillStyle="#fff";context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(image,0,0,canvas.width,canvas.height);let quality=.82,blob=await canvasBlob(canvas,quality);while(blob.size>560000&&quality>.32){quality-=.1;blob=await canvasBlob(canvas,quality)}if(blob.size>650000)throw new Error("Foto masih terlalu besar setelah dikompres. Pilih foto lain.");return await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error("Hasil foto tidak dapat diproses."));reader.readAsDataURL(blob)})}
function uniqueId(prefix){return`${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`}
async function saveImage(id,file){const dataUrl=await compress(file);await setDoc(doc(db,CONTENT_COLLECTION,id),{dataUrl,updatedAt:new Date().toISOString()});void rememberPhoto(id,dataUrl);return id}
async function uploadSingle(input){collectDraft();const file=input.files?.[0],key=input.dataset.imageSlot;if(!file)return;try{setStatus(`Memproses ${file.name}...`);const defaultId=imageSlots.find(slot=>slot[0]===key)?.[2]||uniqueId("photo"),isCoupleSlot=key==="childImageId"||key==="familyImageId",id=uniqueId(defaultId);await saveImage(id,file);data[key]=id;if(key==="coverId")data.heroId=id;await persistContent();await render();setStatus("Foto berhasil diunggah dan langsung aktif.")}catch(error){setStatus(firebaseError(error),true)}finally{input.value=""}}
async function uploadCollection(input,key,limit){collectDraft();const files=Array.from(input.files||[]);if(!files.length)return;try{const current=Array.isArray(data[key])?data[key]:[],allowed=files.slice(0,Math.max(0,limit-current.length));if(!allowed.length)throw new Error(`Batas maksimal ${limit} foto sudah tercapai.`);for(let index=0;index<allowed.length;index++){setStatus(`Memproses foto ${index+1}/${allowed.length}...`);const id=uniqueId(key==="galleryIds"?"gallery":"opening");await saveImage(id,allowed[index]);current.push(id)}data[key]=current;await persistContent();await renderCollection(key,key==="openingIds"?"#openingThumbs":"#galleryThumbs");setStatus("Semua foto berhasil diunggah.")}catch(error){setStatus(firebaseError(error),true)}finally{input.value=""}}
$("#openingUpload").onchange=event=>operation(()=>uploadCollection(event.target,"openingIds",4));$("#galleryUpload").onchange=event=>operation(()=>uploadCollection(event.target,"galleryIds",10));
$("#theme").onchange=event=>{data.theme=event.target.value;document.documentElement.dataset.theme=data.theme};
$("#copyGuestLink").onclick=async()=>{const name=$("#guestNameInput").value.trim();if(!name)return setStatus("Masukkan nama tamu terlebih dahulu.",true);const base=location.href.replace(/admin\.html.*$/,'');const url=`${base}?v=baptisan-joel-1&to=${encodeURIComponent(name)}`;try{await navigator.clipboard.writeText(url);setStatus("Link tamu berhasil disalin. Tempelkan di WhatsApp dan tunggu pratinjau muncul sebelum dikirim.")}catch{setStatus(url)}};
$("#contentForm").onsubmit=async event=>{event.preventDefault();if(busy)return;busy=true;$("#contentForm").inert=true;try{new FormData(event.currentTarget).forEach((value,key)=>data[key]=value);data.theme=$("#theme").value;setStatus("Menyimpan semua perubahan...");await persistContent();setStatus("Semua perubahan berhasil disimpan dan langsung aktif.")}catch(error){setStatus(firebaseError(error),true)}finally{busy=false;$("#contentForm").inert=false}};
