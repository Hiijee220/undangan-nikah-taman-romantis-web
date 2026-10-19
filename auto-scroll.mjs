export function createAutoScroller({position,limit,move,request,cancel,change=()=>{},speed=28}){
 let running=false,frame=null,last=null,current=0,startAt=null,wait=0;
 function pause(){running=false;if(frame!==null)cancel(frame);frame=null;last=null;change(false)}
 function tick(now){
  if(!running)return;
  if(startAt===null)startAt=now+wait;
  if(now<startAt){frame=request(tick);return}
  if(last===null)last=now;
  current=Math.min(limit(),current+Math.min(50,Math.max(0,now-last))*speed/1000);last=now;move(current);
  if(current>=limit()-1){pause();return}frame=request(tick);
 }
 return {get running(){return running},pause,start(delay=0){if(running||position()>=limit()-1)return;current=position();last=null;startAt=null;wait=delay;running=true;change(true);frame=request(tick)},setSpeed(value){speed=value}};
}
