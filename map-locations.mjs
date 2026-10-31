// Only embed a pin derived from the supplied link, never from an address search.
// The short link below was resolved to its Google Maps redirect on 2026-10-31.
const resolvedPins={
  'https://maps.app.goo.gl/HvYR4E3dMQeP8DkZA':[1.4262216,124.9857088]
};
function coordinates(value=''){
 const match=String(value).trim().match(/^(?:loc:)?\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/i);
 if(!match)return null;
 const lat=Number(match[1]),lng=Number(match[2]);
 return Number.isFinite(lat)&&Number.isFinite(lng)&&Math.abs(lat)<=90&&Math.abs(lng)<=180?[lat,lng]:null;
}
export function mapLocation(value=''){
 let url;try{url=new URL(String(value).trim())}catch{return {link:'',embed:'',pin:null}}
 if(url.protocol!=='https:'||url.username||url.password)return {link:'',embed:'',pin:null};
 const link=url.href,host=url.hostname.toLowerCase();
 const short=host==='maps.app.goo.gl'||host==='goo.gl';
 const google=host==='www.google.com'||host==='google.com'||host==='maps.google.com';
 if(!short&&!google)return {link:'',embed:'',pin:null};
 if(google&&!/^\/maps(?:\/|$)/.test(url.pathname)&&host!=='maps.google.com')return {link:'',embed:'',pin:null};
 let pin=short?resolvedPins[url.origin+url.pathname]||null:null;
 if(!pin)pin=coordinates(url.searchParams.get('q')||url.searchParams.get('query')||url.searchParams.get('destination')||'');
 if(!pin&&google){
  let decoded='';try{decoded=decodeURIComponent(url.pathname+url.search)}catch{}
  const match=decoded.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  if(match)pin=coordinates(match[1]+','+match[2]);
 }
 const embed=pin?'https://www.google.com/maps?q='+encodeURIComponent(pin.join(','))+'&z=17&output=embed':'';
 return {link,embed,pin};
}
export function eventMap(content,kind){
 // Each event has its own location; a shared legacy link can point to the wrong event.
 return mapLocation(content?.[kind+'MapsUrl']||'');
}
