const http = require('http');
const fs = require('fs');

const config = {
    index: '/index.html',
    host: '127.0.0.1',
    port: 3333,
    contentType: {
        html: 'text/html',
        js: 'text/javascript',
        css: 'text/css',
        jpg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        ico: 'image/ico',
        txt: 'text/plain',
        json: 'application/json',
    }
}

const server = http.createServer(function(req, res) {
    let reqUrl = req.url;
    if (reqUrl === '/') {
        reqUrl = config.index;
    }
    const filePath = __dirname + reqUrl;
    const ext = reqUrl.split('.').pop();
    fs.readFile(filePath, function(err, data) {
        if (err) {
            res.writeHeader(404, {'content-type': config.contentType[ext]});
            res.write('<h1>404 Not Found</h1>');
            res.end();
        } else {
            res.writeHeader(200, {'content-type': config.contentType[ext]});
            res.write(data);
            res.end();
        }
    });
});

server.listen(config.port, config.host, function() {
    console.log(config.host + ':' + config.port);
});

