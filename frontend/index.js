const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 3001;

const server = http.createServer((req, res) => {
    console.log(req.url);
    const filePath = path.join(__dirname, req.url);

    // Determine the content type based on the file extension
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = {
        '.html': 'text/html',
        '.js': 'text/javascript', // Set the content type for JavaScript files
        '.css': 'text/css',
        '.jpg': 'image/jpg',
        '.png': 'image/png',
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
