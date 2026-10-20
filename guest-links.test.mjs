import assert from 'node:assert/strict';
import {registerGuestLink,resolveGuestName,invitationLink,normalizeGuestName,guestRegistry,DEFAULT_GUEST} from './guest-links.mjs';
import {saveContent} from './persistence.mjs';
let saved={revision:7,childName:'Joel',coverId:'preserved-photo'},updates=0;
const run=async action=>action({
 get:async()=>({exists:()=>true,data:()=>structuredClone(saved)}),
 update:(_,value)=>{saved={...saved,...value};updates++},
 set:(_,value)=>{saved=structuredClone(value)}
});
const name='Keluarga Tombeng & Momongan';
const code=await registerGuestLink('content',name,run,()=>'AbC12_xY');
assert.equal(code,'AbC12_xY');assert.equal(saved.revision,7);assert.equal(saved.coverId,'preserved-photo');
assert.equal(await registerGuestLink('content',name,run,()=>{throw Error('must reuse')}),code);assert.equal(updates,1);
let sequence=0;
const second=await registerGuestLink('content','Tamu kedua',run,()=>++sequence===1?code:'New12_34');assert.equal(second,'New12_34');
assert.equal(resolveGuestName('?g='+code,saved),name);
assert.equal(resolveGuestName('?to='+encodeURIComponent(name),saved),name);
assert.equal(resolveGuestName('?v=legacy&to=Budi%20dan%20Ibu',saved),'Budi dan Ibu');
assert.equal(resolveGuestName('?g=missing1',saved),DEFAULT_GUEST);
assert.equal(resolveGuestName('?g=toString',saved),DEFAULT_GUEST);
assert.deepEqual(guestRegistry({bad:'Name',Good1234:[],Valid123:'Name'}),{Valid123:'Name'});
const base='https://hiijee220.github.io/undangan-nikah-taman-romantis-web/';
assert.equal(invitationLink(base+'admin.html?v=old'),base);
const short=invitationLink(base+'admin.html?v=old',code);assert.equal(short,base+'?g='+code);assert.ok(!short.includes('to=')&&!short.includes('&v='));
assert.equal(new URL(short).searchParams.get('g'),code);
assert.throws(()=>normalizeGuestName(' '));assert.throws(()=>normalizeGuestName('a'.repeat(101)));
assert.equal(normalizeGuestName('  Budi   & Ibu '),'Budi & Ibu');
await assert.rejects(registerGuestLink('content','Tamu ketiga',run,()=>code),/belum dapat/);
assert.equal(await saveContent('content',7,{childName:'Updated',coverId:'preserved-photo',revision:7},run),8);
assert.equal(saved.guestLinks[code],name);assert.equal(saved.guestLinks[second],'Tamu kedua');
await assert.rejects(saveContent('content',7,{childName:'Stale'},run),/sesi lain/);
console.log('PASS: short shared guest codes, reuse and collision handling, saved names across devices, legacy links, and registry preservation during content saves.');
