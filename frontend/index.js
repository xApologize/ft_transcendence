const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 3001;

const server = http.createServer((req, res) => {
    console.log(req.url);

    // if (!req.url.includes('.')) {
    //     req.url = '/index.html';
    // }

    // If the requested URL doesn't have a known file extension, redirect to index.html
    if (!/\.(html|js|css|jpg|png|map|json|glb|mp3|wav|flac|ogg)$/.test(req.url)) {
        req.url = '/index.html';
    }

    const filePath = path.join(__dirname, req.url);

    // Determine the content type based on the file extension
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = {
        '.html': 'text/html',
        '.js': 'text/javascript', // Set the content type for JavaScript files
        '.css': 'text/css',
		'.mp3': 'audio/mpeg'
    };

    const type = contentType[extname] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.log("Couldn't open file");
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('File not found');
            console.log(__dirname);
        } else {
            res.writeHead(200, { 'Content-Type': type }); // Set the appropriate content type
            res.end(data);
        }
    });
});

server.listen(port, () => {
    console.log(`\nHosted on: http://localhost:${port}/`);
});
