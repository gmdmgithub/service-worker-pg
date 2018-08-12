//caching the entire site
const cacheName = 'v2';


//call install event
self.addEventListener('install', (event) => {
    console.log('service Worker installed');
    //now we do not set cache on install event
});

//call activated event
//here we clean old cache - if any
self.addEventListener('activate', (event) => {
    console.log('service Worker activated - rmove old caches');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => { //possible better use of filter
                    if (cache !== cacheName) {
                        console.log('old service worker cleaning');
                        return caches.delete(cache);
                    }
                })
            )
        })
    )

});

//call fatch event -offline
self.addEventListener('fetch', event => {
    console.log('service worker is fetching');
    //if we are offline ctach and respond form cache
    //but when we are online we make a copy of response to the cache - better way
    event.respondWith(
        fetch(event.request)
        .then(res => {
            //clon the respnse
            const resClone = res.clone();
            //open the Cache - browser
            caches.open(cacheName)
                .then(cache => {
                    //adding the response to cache
                    cache.put(event.request, resClone);
                });
            return res;
        })
        .catch(() => caches.match(event.request)));
});