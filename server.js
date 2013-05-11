var app = require('express')()
	, server = require('http').createServer(app)
	, io = require('socket.io').listen(server)
	, port = 9779;

server.listen( port );
console.log( 'server listening on port:' + port );

app.get('/', function (req, res) {
	res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) {
	socket.on('senttext', function (data) {
		console.log(data);
		socket.broadcast.emit('news', { messageFromControl: data } );
	});
	socket.emit('news', { messageFromControl: 'server connected' } );
});
