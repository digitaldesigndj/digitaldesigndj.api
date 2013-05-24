// var app = require('express')
// 	// Redirected with nginx to /apiclea
// 	, socketio = require('socket.io')
// 	, clientio = socketio.listen(8880)
// 	, server = require('http').createServer(app)
// 	, io = socketio.listen(server)
// 	, port = 9779;

// var connectCounter = 0;

// configure /api here
// clientio.set('resource','/api/socket.io');
// console.log( '' );

// // admin interface
// server.listen( port );
// console.log( 'admin interface listening on port:' + port );

// // admin interface route
// app.get('/', function (req, res) {
// 	res.sendfile(__dirname + '/index.html');
// });

// Socket connection to the admin interface
// io.sockets.on('connection', function (socket) {
// 	console.log( 'admin conneted' );
// 	socket.on('senttext', function (data) {
// 		console.log(data);
// 		clientio.sockets.emit('news', { messageFromControl: data } );
// 	});
// 	clientio.sockets.emit('news', { messageFromControl: 'publishing server connected' } );
// });

// Publish changes to the admin system on the public socket
// of('/api') is an important gotcha
// clientio.of('/api').on('connection', function (socket) {
// 	console.log( 'client connected' );
// 	// connectCounter++; console.log( 'client connected ' + connectCounter );
// 	socket.emit('news', { messageFromControl: 'connected' } );
// 	pollLastFm();
// });

var io = require('socket.io').listen(8880);

io.sockets.on('connection', function (socket) {
	socket.emit('update', { hello: 'world' });
	// socket.on('my other event', function (data) {
	// 	console.log(data);
	// });
});

var lastfm = {};
var total = 0;
var username       = "DigitalDesignDj";
var lastfm_api_key = 'c7b66efb5c1869ed420b3275da989fab';
var $              = require('jquery');
// var hb             = require('handlebars');


function pollLastFm(){
	$.ajax({
		url: 'http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=' + encodeURIComponent(username) + '&api_key=' + encodeURIComponent(lastfm_api_key) + '&format=json',
		dataType: "jsonp",
		success: function (data) {
			console.log(data.recenttracks['@attr'].total); //.@attr.total);
			lastfm = data;
		}
	});
	return lastfm
}

var cronJob    = require('cron').CronJob;

new cronJob('* * * * * *', function(){
	console.log('Polling LastFM');
	pollLastFm();
	if( lastfm.recenttracks ){
		console.log( lastfm );
		var current = lastfm.recenttracks['@attr'].total;
		if( total !== current ){
			total = current;
			socket.emit('update', { 'lastfm': lastfm } );
		}
	}
//	var current = lastfm.recenttracks['@attr'].total;
	console.log( current );
	
	// console.log( pollLastFm() ); // .recenttracks['@attr'].total );
}, null, true);
