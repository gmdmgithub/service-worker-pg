// Make sure service workers are supported
if ('serviceWorker' in navigator) {
  console.log('service worker supported');
  // register on load a window
  window.addEventListener('load', () => { 
    navigator.serviceWorker  //first of all registration in nesseccary to perform service workers
      .register('../sw_cached_pages.js')
      // .register('../sw_cached_site.js')
      .then(reg => console.log('Service Worker: Registered (Pages)',reg))
      .catch(err => console.log(`Service Worker: Error: ${err}`));
  });
}