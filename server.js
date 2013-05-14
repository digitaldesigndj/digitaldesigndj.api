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

var connectCounter = 0;

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
	connectCounter++; console.log( 'client connected ' + connectCounter );
	socket.emit('news', { messageFromControl: 'connected' } );
});

clientio.of('/api').on('disconnection', function() { connectCounter--; console.log( 'client disconnected ' + connectCounter ); });

// twit.stream('statuses/sample', function(stream) {
// 	stream.on('data', function (data) {
// 		// console.log(data);
// 		clientio.sockets.emit('news', { messageFromControl: data } );
// 	});
// });

twit.stream('user', {track:'BTtoronto'}, function(stream) {
  stream.on('data', function (data) {
    console.log(data);
    clientio.sockets.emit('news', { messageFromControl: data.text } );
  });
  stream.on('end', function (response) {
    // Handle a disconnection
    console.log( 'disconnected');
  });
  stream.on('destroy', function (response) {
    // Handle a 'silent' disconnection from Twitter, no end/error event fired
    console.log( 'silent disconnect');
  });
  // Disconnect stream after five seconds
  // setTimeout(stream.destroy, 5000);
});

var lastfm;
var username       = "DigitalDesignDj";
var lastfm_api_key = 'c7b66efb5c1869ed420b3275da989fab';
var hb         = require('handlebars');
var $          = require('jquery');
var cronJob    = require('cron').CronJob;

new cronJob('/4 * * * * *', function(){
  console.log('Polling LastFM');
  $.ajax({
    url: 'http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=' + encodeURIComponent(username) + '&api_key=' + encodeURIComponent(lastfm_api_key) + '&format=json',
    dataType: "json",
    success: function(data) {
      if (data) {
        console.log(data);
        if( data !== lastfm ){
          lastfm = data;
          clientio.sockets.emit('news', { lastfm: data } );
        }
      } else {
        console.log(data);
      }
    }
  });
}, null, true, "America/Chicago");
