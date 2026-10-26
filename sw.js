// Service worker de Cuaderno de Rutina: guarda la app para abrir rápido y sin conexión.
const VERSION='2026.10.26-4';
const CACHE='rutina-'+VERSION;
const ASSETS=['./','index.html','anim3d.js','male.glb','lib/three.min.js','lib/GLTFLoader.js','manifest.webmanifest',
  'icons/icon-192.png','icons/icon-512.png','icons/maskable-512.png','icons/apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('rutina-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
// fin del descanso: el service worker espera y avisa aunque la app esté en segundo plano o la pantalla apagada
let restT=null, restDone=null;
const restClear=()=>{if(restT){clearTimeout(restT); restT=null} if(restDone){restDone(); restDone=null}};
self.addEventListener('message',e=>{const d=e.data;
  if(d==='skip') return self.skipWaiting();
  if(d&&d.type==='rest-cancel') return restClear();
  if(d&&d.type==='rest'){restClear(); const ms=Math.max(0,Math.min(d.end-Date.now(),290000));
    e.waitUntil(new Promise(res=>{restDone=res; restT=setTimeout(async()=>{restT=null;
      try{const cs=await self.clients.matchAll({type:'window',includeUncontrolled:true});
        if(!cs.some(c=>c.visibilityState==='visible')) await self.registration.showNotification('Descanso terminado',{body:'Arrancá la próxima serie',tag:'descanso',renotify:true,vibrate:[300,120,300,120,300],icon:'icons/icon-192.png',badge:'icons/icon-192.png'});
      }catch(err){} restDone=null; res()},ms)}));
  }
});
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return;
  const u=new URL(r.url);
  if(u.origin===location.origin){
    e.respondWith(caches.match(r,{ignoreSearch:true}).then(hit=>hit||fetch(r).then(res=>{if(res.ok){const cp=res.clone(); caches.open(CACHE).then(c=>c.put(r,cp))} return res}).catch(()=>r.mode==='navigate'?caches.match('index.html'):Response.error())));
  } else if(/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){
    e.respondWith(caches.open('rutina-fonts').then(c=>c.match(r).then(hit=>{const net=fetch(r).then(res=>{c.put(r,res.clone()); return res}).catch(()=>hit); return hit||net})));
  }
});

// tocar la notificación de fin de descanso abre la app
self.addEventListener('notificationclick',e=>{e.notification.close(); e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{const c=cs[0]; return c?c.focus():self.clients.openWindow('./')}))});
