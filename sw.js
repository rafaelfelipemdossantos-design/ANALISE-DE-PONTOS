// Service Worker — para publicar uma nova versão, troque o número em V
const V='analisador-v2',SHELL=['./','index.html','manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./favicon-32.png','./apple-touch-icon.png'],CDN=[];
self.addEventListener('install',e=>e.waitUntil(caches.open(V).then(c=>Promise.all([c.addAll(SHELL),...CDN.map(u=>c.add(new Request(u,{mode:'no-cors'})).catch(()=>{}))])).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('analisador-')&&x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);if(u.origin!==location.origin&&!/cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com/.test(u.host))return;
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(hit=>{
    const net=fetch(e.request).then(r=>{if(r&&(r.ok||r.type==='opaque')){const cp=r.clone();caches.open(V).then(c=>c.put(e.request,cp))}return r}).catch(()=>hit);
    return hit||net;
  }));
});
