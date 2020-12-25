const staticCacheName = 'site-static-v14';
const dynamicCacheName='site-dynamic-v16';
const assets =[
    '/',
    '/index.html',
    '/js/app.js',
    '/js/ui.js',
    '/js/materialize.min.js',
    '/css/styles.css',
    '/css/materialize.min.css',
    '/img/dish.png',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://fonts.gstatic.com/s/materialicons/v67/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2',
    '/pages/fallback.html'
];
//cache size limit function
const limitCachedSize = (name,size) => {
    caches.open(name).then(cache =>{
        cache.keys().then(keys=>{
            if(keys.length > size){
                cache.delete(keys[0]).then(limitCachedSize(name,size))
            }
        })
    })
};
//install service worker
self.addEventListener('install', evt => {
//console.log('service worker has been installed')
evt.waitUntil(
    caches.open(staticCacheName)   //OPEN THIS CACHE IF EXIST AND IF NOT THEN IT WILL  CREATE AND OPEN
    .then(cache=>{
    console.log('caching shell assets');
    cache.addAll(assets);   //pre-cached assets
    })
);
});
//activate service worker
self.addEventListener('activate', evt => {
   // console.log('service worker has been activated',evt);
   evt.waitUntil(
       caches.keys().then(keys =>{
          // console.log(keys);  //keys are all the caches made previously
          return Promise.all(keys
        .filter(key =>key !== staticCacheName && key !== dynamicCacheName)//filtering all caches and check if it is equal to recent --stay in array else
        .map(key =>caches.delete(key))   //returns a promis -->delete remaning all
          )
       })
   );
});

//fetch event 
self.addEventListener('fetch', evt=>{
    if(evt.request.url.indexOf('firestore.googleapis.com')=== -1){
    
   //console.log('fetch event',evt);
   evt.respondWith(
       caches.match(evt.request).then(cacheRes =>{
           return cacheRes || fetch(evt.request).then(fetchRes =>{      
                return caches.open(dynamicCacheName).then(cache =>{    
                    cache.put(evt.request.url,fetchRes.clone());    //taking response and adding to our cache  
                    //check if cache is oversized here and put limit
                    limitCachedSize(dynamicCacheName, 3);
                    return fetchRes;
                })
            })
        }).catch(()=>{
             if(evt.request.url.indexOf('.html') > -1){
                return caches.match('/pages/fallback.html')
             }  
    })
   );
}
});



