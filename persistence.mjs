// Injectable transaction runner keeps conflict handling testable without credentials.
export async function saveContent(ref,expectedRevision,data,run){
 return run(async transaction=>{
  const snapshot=await transaction.get(ref);
  const current=snapshot.exists()?Number(snapshot.data().revision||0):0;
  if(current!==expectedRevision)throw new Error('Data berubah di sesi lain. Muat ulang sebelum menyimpan agar perubahan tidak tertimpa.');
  transaction.set(ref,{...data,revision:current+1});
  return current+1;
 });
}
