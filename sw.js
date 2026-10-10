// Service worker de Cuaderno de Rutina: guarda la app para abrir rápido y sin conexión.
const VERSION='2026.10.09-6';
const CACHE='rutina-'+VERSION;
const ASSETS=['./','index.html','anim3d.js','male.glb','lib/three.min.js','lib/GLTFLoader.js','manifest.webmanifest',
  'icons/icon-192.png','icons/icon-512.png','icons/maskable-512.png','icons/apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('rutina-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('message',e=>{if(e.data==='skip') self.skipWaiting()});
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return;
  const u=new URL(r.url);
  if(u.origin===location.origin){
    e.respondWith(caches.match(r,{ignoreSearch:true}).then(hit=>hit||fetch(r).then(res=>{if(res.ok){const cp=res.clone(); caches.open(CACHE).then(c=>c.put(r,cp))} return res}).catch(()=>r.mode==='navigate'?caches.match('index.html'):Response.error())));
  } else if(/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){
    e.respondWith(caches.open('rutina-fonts').then(c=>c.match(r).then(hit=>{const net=fetch(r).then(res=>{c.put(r,res.clone()); return res}).catch(()=>hit); return hit||net})));
  }
});
