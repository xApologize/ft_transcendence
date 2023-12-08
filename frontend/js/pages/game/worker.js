let lastFixedUpdate = new Date().getTime();

// worker.js
setInterval(function() {
    postMessage('');
}, 1000 / 50);
