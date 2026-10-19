import {defaults} from './defaults.js?v=baptisan-1';
// Reuse this invitation's storage while keeping legacy wedding text out of baptism pages.
export function baptismContent(saved={}) {
 if(saved.contentType==='baptisan')return {...defaults,...saved};
 const result={...defaults};
 for(const [key,value] of Object.entries(saved)) {
  if(value!=null && (/Image(Id)?$|Ids$/.test(key)||['coverId','heroId','theme','musicUrl','musicTitle','revision','bankName','accountNumber','accountHolder'].includes(key)))result[key]=value;
 }
 return result;
}
