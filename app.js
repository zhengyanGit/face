const express = require('express'); // 引入 express 模块
var app = require('express')();
var fs = require('fs');
var http = require('http');
var https = require('https');

var httpServer = http.createServer(app);
var httpsServer = https.createServer({
	key: fs.readFileSync('./privatekey.pem'),
	cert: fs.readFileSync('./certificate.pem')
}, app);

var PORT = 80;
var SSLPORT = 443;

app.use(express.static('./src')); // 告诉 express 示例， 静态文件的位置

httpServer.listen(PORT, function () {
	console.log('HTTP Server is running on: http://localhost:%s', PORT);
});
httpsServer.listen(SSLPORT, function () {
	console.log('HTTPS Server is running on: https://localhost:%s', SSLPORT);
});

// 访问路径
app.get('/:name', function (req, res) {
	if (req.protocol === 'https') {
		res.send('./index.html');
	} else {
		res.send('http:' + req.params.name);
	}
});