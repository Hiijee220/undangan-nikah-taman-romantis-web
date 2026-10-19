import {defaults} from './defaults.js?v=polish-3';

export function splitParents(value='') {
 const parts=String(value).split(/\s*(?:&|＆|\bdan\b)\s*/i).map(v=>v.trim()).filter(Boolean);
 return {fatherName:parts[0]||'',motherName:parts.slice(1).join(' & ')};
}
function completeBaptism(result,saved) {
 const legacy=splitParents(saved.parentsNames);
 result.fatherName=String(saved.fatherName||legacy.fatherName||defaults.fatherName).trim();
 result.motherName=String(saved.motherName||legacy.motherName||defaults.motherName).trim();
 for(const n of [1,2,3])if(!String(result[`journey${n}Text`]||'').trim())result[`journey${n}Text`]=defaults[`journey${n}Text`];
 for(const key of ['coverImage','childImage','familyImage','closingImage'])if(result[key]==='./garden.webp')result[key]=defaults[key];
 return result;
}
// Keep this invitation's saved data, photos and revision when updating the presentation.
export function baptismContent(saved={}) {
 if(saved.contentType==='baptisan')return completeBaptism({...defaults,...saved},saved);
 const result={...defaults};
 for(const [key,value] of Object.entries(saved))if(value!=null&&(/Image(Id)?$|Ids$/.test(key)||['coverId','heroId','theme','musicUrl','musicTitle','revision'].includes(key)))result[key]=value;
 return completeBaptism(result,{});
}
