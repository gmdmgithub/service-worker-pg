const cacheName = 'v1';

//first way - specific what you want
const cacheAsstes = [
    'index.html',
    'about.html',
    '/css/style.css',
    '/js/main.js'
];

//call install event
self.addEventListener('install', (event) => {
    console.log('service Worker installed');

    event.waitUntil(
        caches.open(cacheName)
        .then(cache => {

            cache.addAll(cacheAsstes);
            console.log('cacheing files', cacheAsstes);

        })
        .then(() => {
            console.log('dont wait anymore');

            self.skipWaiting();
        })
        .catch(err => {
            console.log('Problem occure', err);

        })
    );

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
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request)));
});