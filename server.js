const http = require('http');
const url = require('url');
const fs = require('fs');


http.createServer((request, response) => {
  let urlAddress = request.url;
  let q = url.parse(urlAddress, true);
  let filePath = '';

  if(q.pathname.includes('documentation')) {
    filePath = (__dirname + '/documentation.html');
  } else {
    filePath = 'index.html';
  }

  fs.appendFile('log.txt', 'Url: ' + urlAddress + 
    '\nTimestamp: ' + new Date() + '\n\n', (err) => {
    if(err) {
      console.log(err);
    } else {
      console.log('Added to log.');
    }
  });

  fs.readFile(filePath, (err, data) => {
    if(err) {
      throw err;
    }
  
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(data);
  response.end();
  });

}).listen(8080);

console.log('My server is running on Port 8080.');