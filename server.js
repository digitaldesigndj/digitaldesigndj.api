var app = require('express')()
	, clientio = require('socket.io').listen(8880)
	, server = require('http').createServer(app)
	, io = require('socket.io').listen(server)
	, port = 9779;

server.listen( port );
console.log( 'server listening on port:' + port );

app.get('/', function (req, res) {
	res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function (pub_socket) {
	console.log( 'admin conneted' );
	pub_socket.on('senttext', function (data) {
		console.log(data);
		clientio.sockets.emit('news', { messageFromControl: data } );
	});
	clientio.sockets.emit('news', { messageFromControl: 'publishing server connected' } );
});

clientio.sockets.on('connection', function (socket) {
	console.log( 'client connected' );
	socket.emit('news', { messageFromControl: 'connected to broadcast source' } );
});

