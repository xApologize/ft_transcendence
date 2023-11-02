const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 3001;

const server = http.createServer((req, res) => {
  const filePath = path.join(__dirname, 'index.html');
  fs.readFile(filePath, (err, data) => {
    if (err)
      console.log("Couldn't open HTML file");
    else {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    }
  });
});

server.listen(port, () => {
  console.log(`\nHosted on: http://localhost:${port}/`); // Link should be clickable in the terminal this way
});
