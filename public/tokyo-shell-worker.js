// Replaced with the exact build's verified UI asset graph after bundling.
self.addEventListener('install',event=>event.waitUntil(Promise.reject(Error('Build not prepared'))));
