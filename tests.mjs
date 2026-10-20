import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {defaults} from './defaults.js';
import {cleanContent,cleanRsvp,safeLink,safeImage} from './validation.mjs';
import {saveContent} from './persistence.mjs';
for(const file of ['app.js','admin.js','firebase.js','defaults.js','validation.mjs','persistence.mjs'])execFileSync(process.execPath,['--check',file]);
assert.equal(cleanContent(defaults).theme,'sky');
assert.equal(safeLink('javascript:alert(1)'),'');
assert.equal(safeLink('https://user:password@example.com/'),'');
assert.equal(safeImage('data:image/svg+xml;base64,AAAA'),'');
assert.equal(safeImage('./garden.webp'),'./garden.webp');
assert.equal(safeImage('data:image/jpeg;base64,AAAA'),'data:image/jpeg;base64,AAAA');
assert.throws(()=>cleanContent({...defaults,musicUrl:'javascript:alert(1)'}));
assert.throws(()=>cleanContent({...defaults,openingIds:['a','b','c','d','e']}));
assert.throws(()=>cleanContent({...defaults,galleryIds:Array(11).fill('a')}));
assert.throws(()=>cleanContent({...defaults,theme:'other'}));
assert.deepEqual(cleanRsvp({name:' Jeivan ',message:' Selamat ♥ ',attendance:'hadir',guestCount:'4'}),{name:'Jeivan',message:'Selamat ♥',attendance:'hadir',guestCount:4});
assert.equal(cleanRsvp({name:'Tamu',message:'Selamat',attendance:'ragu',guestCount:'4'}).guestCount,0);
assert.throws(()=>cleanRsvp({name:'',message:'',attendance:'hadir',guestCount:0}));
assert.throws(()=>cleanRsvp({name:'Tamu',message:'Selamat',attendance:'hadir',guestCount:5}));
let stored=null,writes=0;
const runner=async action=>action({get:async()=>({exists:()=>!!stored,data:()=>stored}),set:(_,value)=>{stored=value;writes++}});
assert.equal(await saveContent('content',0,{childName:'A'},runner),1);
assert.equal(await saveContent('content',1,{childName:'B'},runner),2);
await assert.rejects(saveContent('content',1,{childName:'Stale'},runner),/sesi lain/);
assert.equal(stored.childName,'B');assert.equal(writes,2);
const app=await readFile('app.js','utf8'),admin=await readFile('admin.js','utf8'),html=await readFile('index.html','utf8'),adminHtml=await readFile('admin.html','utf8'),firebase=await readFile('firebase.js','utf8');
assert.ok(app.includes('/invitationTamanRomantis/'));assert.ok(app.includes('/invitationTamanRomantisResponses'));
for(const source of [app,admin,firebase]){
 assert.ok(!source.includes('doc(db,"invitation",'));
 assert.ok(!source.includes('/invitationResponses'));
 assert.ok(!source.includes('api.github.com'));
 assert.ok(!source.includes('chatgpt.site'));
}
for(const id of ['openInvitation','countdown','childPhoto','familyPhoto','ceremonyMaps','receptionMaps','gallery','timeline','rsvpForm','wishes','lightbox','musicButton'])assert.ok(html.includes('id="'+id+'"'),id);
for(const id of ['loginBtn','emailLoginForm','resetPasswordBtn','copyGuestLink','theme','imageSlots','openingUpload','galleryUpload','contentForm','logoutBtn'])assert.ok(adminHtml.includes('id="'+id+'"'),id);
assert.equal((adminHtml.match(/<option value="(sky|forest|rose|navy|sage|terracotta)"/g)||[]).length,6);
for(const match of html.matchAll(/data-k="([^"]+)"/g))assert.ok(match[1] in defaults||match[1]==='dateDisplay',match[1]);
for(const match of admin.matchAll(/\[\[?"([A-Za-z0-9]+)","/g))if(match[1] in defaults)assert.notEqual(defaults[match[1]],undefined);
const rules=await readFile('firestore-additions.rules','utf8');
assert.ok(rules.includes('request.auth.token.email_verified == true'));
assert.ok(rules.includes("request.resource.data.keys().hasOnly(['name','message','attendance','guestCount','createdAt'])"));
assert.ok(!rules.includes('match /{document=**}'));
console.log('PASS: JS syntax; all reference sections/themes; namespace isolation; safe links/photos; RSVP validation; preserved revision conflicts; admin/rule consistency.');

const {baptismContent}=await import('./content.mjs');
const legacy=baptismContent({groom:'Old',story:'Wedding',ceremonyTitle:'Akad',theme:'rose',revision:5,coverId:'cover-old'});
assert.equal(legacy.contentType,'baptisan');assert.equal(legacy.childName,'Nama Anak');assert.equal(legacy.ceremonyTitle,'Ibadah Baptisan');assert.equal(legacy.theme,'rose');assert.equal(legacy.coverId,'cover-old');assert.equal(legacy.revision,5);
assert.equal(baptismContent({contentType:'baptisan',childName:'Joel'}).childName,'Joel');
assert.ok(admin.includes('["showReception","Tampilkan syukuran","select"]'));
assert.ok(html.includes('id="receptionCard"'));
console.log('PASS: baptism migration, editable child/family fields and optional thanksgiving.');

assert.equal(safeImage('./baby-placeholder.svg'),'./baby-placeholder.svg');
assert.ok(html.includes('ceremonyMapFrame'));assert.ok(html.includes('baptism.css'));

const parents=await import('./content.mjs');
assert.deepEqual(parents.splitParents('Jeivan S. Momongan S.Kom&Charine G. Berentian S.Ak'),{fatherName:'Jeivan S. Momongan S.Kom',motherName:'Charine G. Berentian S.Ak'});
const filled=baptismContent({contentType:'baptisan',parentsNames:'Ayah & Ibu',journey2Text:'  ',journey3Text:'',revision:18,coverId:'cover-saved'});
assert.equal(filled.fatherName,'Ayah');assert.equal(filled.motherName,'Ibu');assert.ok(filled.journey2Text.length>100);assert.ok(filled.journey3Text.length>100);assert.equal(filled.revision,18);assert.equal(filled.coverId,'cover-saved');
assert.equal(baptismContent({contentType:'baptisan',journey2Text:'Cerita pribadi'}).journey2Text,'Cerita pribadi');
assert.equal(baptismContent({contentType:'baptisan',parentsNames:'Lama & Lama',fatherName:'Baru',motherName:'Ibu Baru'}).fatherName,'Baru');
assert.ok(!admin.includes('Menu Hadiah'));assert.ok(!admin.includes('Hadiah & Rekening'));assert.ok(!admin.includes('Konfirmasi Hadiah'));assert.ok(!html.includes('id="gift"'));assert.ok(!app.includes('$("#toggleGift")'));assert.ok(!admin.includes('["closingImageId","Foto penutup"'));
console.log('PASS: centered split parent names; populated blank stories preserving custom text/photos/revision; gift removed from public/admin.');

const {createPhotoLoader,mapPhotos}=await import('./photo-cache.mjs');
let calls=0,active=0,peak=0;const savedPhotos=new Map();
const loader=createPhotoLoader(async id=>{calls++;active++;peak=Math.max(peak,active);await new Promise(resolve=>setTimeout(resolve,5));active--;return `photo-${id}`},{read:id=>savedPhotos.get(id)||'',write:(id,url)=>savedPhotos.set(id,url)});
assert.deepEqual(await Promise.all([loader('one'),loader('one')]),['photo-one','photo-one']);assert.equal(calls,1);
await Promise.all(Array.from({length:12},(_,i)=>loader('id-'+i)));assert.equal(peak,4);
let repeatCalls=0;const repeat=createPhotoLoader(async()=>{repeatCalls++;return 'network'},{read:id=>savedPhotos.get(id)||'',write:()=>{}});
assert.equal(await repeat('one'),'photo-one');assert.equal(repeatCalls,0);
const blocked=createPhotoLoader(async()=> 'online-photo',{read:()=>{throw Error('blocked')},write:()=>{throw Error('quota')}});
assert.equal(await blocked('online'),'online-photo');
let tries=0;const retry=createPhotoLoader(async()=>{if(++tries===1)throw Error('offline');return 'recovered'},{read:()=>'',write:()=>{}});
assert.equal(await retry('same','fallback'),'fallback');assert.equal(await retry('same','fallback'),'recovered');
assert.deepEqual(await mapPhotos([3,1,2],async n=>n*2),[6,2,4]);
// A stalled family photo cannot delay the already downloaded cover.
const hydrateCode=app.slice(app.indexOf('async function hydrateImages(){'),app.indexOf('function startHero'));
let releaseFamily;const stalled=new Promise(resolve=>releaseFamily=resolve),painted=[];
const hydrate=new Function('content','getImage','setBackground','setImage','startHero','mapPhotos','renderGallery','renderTimeline','observeReveals',hydrateCode+';return hydrateImages();');
const hydration=hydrate({coverId:'cover',coverImage:'fallback',familyImageId:'family',gallery:[]},id=>id==='family'?stalled:Promise.resolve('cover-data'),(selector,url)=>painted.push([selector,url]),()=>{},()=>{},mapPhotos,()=>{},()=>{},()=>{});
await new Promise(resolve=>setImmediate(resolve));assert.deepEqual(painted[0],['#coverPhoto','cover-data']);releaseFamily('family-data');await hydration;
console.log('PASS: cover paints independently; parallel requests capped at four; duplicate downloads avoided; repeat cache hits; failed cache and network recovery; photo order preserved.');

const {createAutoScroller}=await import('./auto-scroll.mjs');
let offset=0,callback=null,activeState=false;
const scroller=createAutoScroller({position:()=>offset,limit:()=>100,move:value=>offset=value,request:fn=>{callback=fn;return 1},cancel:()=>callback=null,change:value=>activeState=value,speed:20});
const frame=time=>{const fn=callback;callback=null;fn?.(time)};
scroller.start(1800);assert.ok(scroller.running);frame(0);frame(1700);assert.equal(offset,0);frame(1800);frame(1850);assert.equal(offset,1);scroller.pause();assert.equal(callback,null);assert.equal(activeState,false);
scroller.start();frame(2000);frame(12000);assert.equal(offset,2); // Background-tab gaps cannot jump the page.
for(let time=12050;time<18000&&scroller.running;time+=50)frame(time);
assert.equal(scroller.running,false);assert.ok(offset>=99&&offset<=100);
const upgraded=baptismContent({contentType:'baptisan',musicRelease:'mary-v1',musicUrl:'https://example.com/old.mp3'});assert.equal(upgraded.musicUrl,defaults.musicUrl);assert.equal(upgraded.musicRelease,defaults.musicRelease);
const customized=baptismContent({contentType:'baptisan',musicRelease:defaults.musicRelease,musicUrl:'https://example.com/new.mp3'});assert.equal(customized.musicUrl,'https://example.com/new.mp3');
assert.throws(()=>cleanContent({...defaults,autoScrollSpeed:'invalid'}));
assert.ok(html.includes('id="autoScrollButton"'));assert.ok(app.includes("document.addEventListener('visibilitychange'"));
const groupsCode=admin.slice(admin.indexOf('const fieldGroups='),admin.indexOf('const imageSlots=')),fieldsCode=admin.slice(admin.indexOf('function renderFields()'),admin.indexOf('const imageUrl='));
const target={innerHTML:''};new Function('data','$','esc',groupsCode+fieldsCode+';renderFields();')(defaults,()=>target,v=>String(v??''));
assert.ok(target.innerHTML.includes('<select name="autoScrollSpeed">'));assert.ok(target.innerHTML.includes('value="slow"'));assert.ok(!target.innerHTML.includes('type="scroll-speed"'));
console.log('PASS: automatic scroll delay, pause, speed and page-end stop; no jump after tab gaps; music upgrade and later admin overrides; generated speed controls.');

await import('./guest-links.test.mjs');
