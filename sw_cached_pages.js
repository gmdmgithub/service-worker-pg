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
            cache.addAll(cacheAssets);//main function - addAll
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

//call activated event here we clean old cache - if any exists
self.addEventListener('activate', (event) => {
    console.log('service Worker activated - remove old caches');
    event.waitUntil(
        caches.keys()
        .then(cacheNames => {  ///we remove all other than current cache
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

self.addEventListener('fetch', differentApproach);

// //call fetch event -offline
// self.addEventListener('fetch', event => {
//     console.log('service worker is fetching');
//     //if we are offline cache and respond form cache
//     event.respondWith(
//         fetch(event.request) //in this place we just fetch the request - in case of problem (catch on promise) take from cache
//         .catch(() => 
//             caches.match(event.request)));/// in case of error load
// });


//call fetch event -always - if not in cache take from request!!
function differentApproach(event){
    console.log("service worker fetching - approach with first checking cache (version is important!!)")

    //check cache and respond form cache
    event.respondWith(
        caches.match(event.request)
        .then(cacheRequest =>{
            console.log('response is here');
            return cacheRequest || fetch(event.request);
        })
    )
}