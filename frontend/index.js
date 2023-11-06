var http = require('http'),
    fs = require('fs');

http.createServer(function (req, res) {

    if(req.url.indexOf('.html') != -1){ //req.url has the pathname, check if it conatins '.html'

      fs.readFile(__dirname + req.url, function (err, data) {
        if (err) console.log(err);
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        res.end();
      });

    }

    if(req.url.indexOf('.js') != -1){ //req.url has the pathname, check if it conatins '.js'

      fs.readFile(__dirname + req.url, function (err, data) {
        if (err) console.log(err);
        res.writeHead(200, {'Content-Type': 'text/javascript'});
        res.write(data);
        res.end();
      });

    }

    if(req.url.indexOf('.css') != -1){ //req.url has the pathname, check if it conatins '.css'

      fs.readFile(__dirname + req.url, function (err, data) {
        if (err) console.log(err);
        res.writeHead(200, {'Content-Type': 'text/css'});
        res.write(data);
        res.end();
      });

    }
	
}).listen(3001);

// }).listen(3001, '127.0.0.1');
// console.log('Server running at http://127.0.0.1:3001/');

// const http = require('http');
// const fs = require('fs');
// const path = require('path');

// const port = 3001;

// const server = http.createServer((req, res) => {
// 	const filePath = path.join(__dirname, 'index.html');
// 	fs.readFile(filePath, (err, data) => {
// 		if (err)
// 			console.log("Couldn't open HTML file");
// 		else {
// 			res.writeHead(200, { 'Content-Type': 'text/html' });
// 			res.end(data);
// 		}
// 	});
// });

// server.listen(port, () => {
// 	console.log(`\nHosted on: http://localhost:${port}/`); // Link should be clickable in the terminal this way
// });
