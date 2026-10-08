const fallbackTitle='New booking request';

self.addEventListener('push',event=>{
  let payload={};
  try{payload=event.data?event.data.json():{}}catch(error){payload={body:event.data?.text?.()||''}}
  const data=payload.data||{};
  const title=payload.title||fallbackTitle;
  const body=payload.body||payload.message||'A booking is waiting for your confirmation.';
  event.waitUntil(self.registration.showNotification(title,{body,tag:payload.tag||('cabana-pending-'+(data.requestId||Date.now())),renotify:true,data:{type:'open-pending-request',requestId:data.requestId||payload.requestId||null}}));
});

self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const requestId=event.notification.data?.requestId||null;
  event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
    const target=list.find(client=>client.url.includes('/'))||list[0];
    if(target){
      target.postMessage({type:'open-pending-request',requestId});
      return target.focus();
    }
    return clients.openWindow('./#view=dashboard&pending='+encodeURIComponent(requestId||''));
  }));
});
