//caching the entire site
const cacheName = 'v2';

const staticCache = 's_v1';

const cacheAssets = [
    'fallback.html',
    '/css/style.css', '/js/main.js'
];


// cache size limit function
const limitCacheSize = (name, size) => {
    caches.open(name).then(cache => {
      cache.keys().then(keys => {
        if(keys.length > size){
          cache.delete(keys[0]).then(limitCacheSize(name, size));
        }
      });
    });
  };

//call install event
self.addEventListener('install', (event) => {
    console.log('service Worker install');
    //now we do not set cache on install event - just in fetch event we will add each element

    //but the exception for the fallback
    event.waitUntil(
        caches.open(staticCache)
        .then(cache => {
            cache.addAll(cacheAssets); //main function - addAll
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
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => { //possible better use of filter
                    if (cache !== cacheName && cache !== staticCache) {
                        console.log('old service worker cleaning');
                        return caches.delete(cache);
                    }
                })
            )
        })
    )
});

//call fetch event -offline - request first

// self.addEventListener('fetch', requestFirst)

self.addEventListener('fetch', cacheFirst)

function requestFirst( event) {
    console.log('service worker is fetching - request first approach');
    //if we are offline catch and respond form cache
    //but when we are online we make a copy of response to the cache - better way
    event.respondWith(
        fetch(event.request)
        .then(res => {
            //clone the response
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
}

function cacheFirst (event){
    console.log('service worker is fetching - cache first approach');
    event.respondWith(
    caches.match(event.request).then(cacheRes => {
      return cacheRes || fetch(event.request).then(fetchRes => {
        return caches.open(cacheName).then(cache => {
            cache.put(event.request.url, fetchRes.clone());
            console.log("cacheFirst");
            limitCacheSize(cacheName, 2) //TODO - is two for test
          return fetchRes;
        })
      });
    }).catch(() => {
        console.log("serving fallback page - offline");

        //only url with pages (in this case html pages) should be returned 
        // problem protect ie for the image to be serve as fallback
        
        if(event.request.url.indexOf(".html") >-1){
            return caches.match('/fallback.html')
        }
    })
  );
}