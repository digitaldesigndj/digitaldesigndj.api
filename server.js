var app = require('express')()
	// Redirected with nginx to /api
	, clientio = require('socket.io').listen(8880)
	, server = require('http').createServer(app)
	, io = require('socket.io').listen(server)
	, port = 9779;

// Twitter Setup
var twitter = require('ntwitter');

var twit = new twitter({
	consumer_key: 'R96RyfVvpZu9JpbBtfrJzg'
	, consumer_secret: '0O2YWco9k6dCkpO6vj2zIokpsmjUfdfRphV0UZ6as'
	, access_token_key: '13287232-xZ7pAsI21qDFxoS26xPCrEBtw9aANUWxW4EZFNuez'
	, access_token_secret: '7qrf1B6voo53duPpgOfFZ5obdgPhmscWelCV4eKAsE'
});


// configure /api here
clientio.set('resource','/api/socket.io');
console.log( '' )

// admin interface
server.listen( port );
console.log( 'admin interface listening on port:' + port );

// admin interface route
app.get('/', function (req, res) {
	res.sendfile(__dirname + '/index.html');
});

// Socket connection to the admin interface
io.sockets.on('connection', function (socket) {
	console.log( 'admin conneted' );
	socket.on('senttext', function (data) {
		console.log(data);
		clientio.sockets.emit('news', { messageFromControl: data } );
	});
	clientio.sockets.emit('news', { messageFromControl: 'publishing server connected' } );
});

// Publish changes to the admin system on the public socket
// of('/api') is an important gotcha
clientio.of('/api').on('connection', function (socket) {
	console.log( 'client connected' );
	socket.emit('news', { messageFromControl: 'connected' } );
});

twit.stream('statuses/sample', function(stream) {
	stream.on('data', function (data) {
		console.log(data);
		clientio.sockets.emit('news', { twitter: data } );
	});
});
