import {mergeGuestLinks} from './guest-links.mjs?v=share-9';
// Injectable transaction runner keeps conflict handling testable without credentials.
export async function saveContent(ref,expectedRevision,data,run){
 return run(async transaction=>{
  const snapshot=await transaction.get(ref);
  const current=snapshot.exists()?Number(snapshot.data().revision||0):0;
  if(current!==expectedRevision)throw new Error('Data berubah di sesi lain. Muat ulang sebelum menyimpan agar perubahan tidak tertimpa.');
  const guestLinks=mergeGuestLinks(data.guestLinks,snapshot.exists()?snapshot.data().guestLinks:undefined);
  transaction.set(ref,{...data,...(Object.keys(guestLinks).length?{guestLinks}:{}),revision:current+1});
  return current+1;
 });
}
