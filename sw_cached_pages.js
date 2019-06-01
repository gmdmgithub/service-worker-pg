const cacheName = 'v1';

//first way - specific what you want
const cacheAssets = [
    'index.html','about.html',
    '/css/style.css','/js/main.js'
];

//call install event
self.addEventListener('install', (event) => {
    console.log('service Worker installed');
    event.waitUntil(
        caches.open(cacheName)
        .then(cache => {
            cache.addAll(cacheAssets);
            console.log('cacheting files', cacheAssets);
        })
        .then(() => {
            console.log("don't wait anymore");
            self.skipWaiting();
        })
        .catch(err => {
            console.log('Problem occurs', err);
        })
    );
});

//call activated event
//here we clean old cache - if any
self.addEventListener('activate', (event) => {
    console.log('service Worker activated - remove old caches');
    event.waitUntil(
        caches.keys().then(cacheNames => {  ///we remove all other than current cache
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

//call fetch event -offline
self.addEventListener('fetch', event => {
    console.log('service worker is fetching');
    //if we are offline cache and respond form cache
    event.respondWith(
        fetch(event.request) //in this place we just fetch the request
        .catch(() => 
            caches.match(event.request)));/// in case of error load
});