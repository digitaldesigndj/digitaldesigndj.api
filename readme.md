## DigitalDesignDj API

Welcome,

### What is it?

I am scrobbling my Spotify songs played information to LastFm. This little app lets me broadcast changes as they occour (as I listen to songs). Eventually these broadcasts will be consumed by digitaldesigndj.com.

### A more techninal explination

This application polls LastFM every 5s and stores the result. If the currently playing song has changed, or the total play count increases, the data is sent to connected clients via socket io. The current dataset is also provided when a new connection is established.

### How to make it go:

You will need [NodeJs](http://nodejs.org/download/)

1. Clone the repo


	git clone https://github.com/digitaldesigndj/digitaldesigndj.api

1. Go into the repo


	cd digitaldesigndj.api

1. Install Deps


	npm install

1. Start the server


	node server.js

1. Profit!


	http://localhost:9779


<!-- ### Purpose of appilication

You should be able to see what I am listening to with Spotify in a live fashion. With a maximum 60s of delay.

This app should poll lastfm every min and recieve a json array. When new clients connect to a websocket, the app will send the user the latest json. When the server is polled and the data changes, the update is sent to all clients.

The current widget system on digitaldesigndj.com polls from the client side, if I got a rush of traffic, I would hit the rate limit for github and lastfm (Each client making thier own request.)
 -->

<!-- 
### Client Side

This code has been tightly linked to what I am doing in the /digitaldesigndj.com repo. The client side connection currently lives in that repo. `src/scripts/socket.js` and `<p id="broadcast"></p>`

`socket.js`

```js
$(function(){
	var livesocket = io.connect('http://digitaldesigndj.com/', {resource:'api/socket.io'});
	livesocket.on('news', function (data) {
		 console.log(data);
		$('#broadcast').text(data.messageFromControl);
	});
});
```

### Admin interface

I have a local interface `index.html` where I can type into a text field. Via sockets IO the text is delivered back to the server. Then the events are broadcast out on a public socket that digitaldesigndj.com subscribes to.

`index.html`

	<script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js" ></script>
	<script src="/socket.io/socket.io.js"></script>
	<script>
	$(function(){
		var socket     = io.connect('http://192.168.0.7:9779');
		var text_field = $('#text').select();
		var lastentry  = "";
		text_field.keyup(function(event) {
			if( text_field.val() != lastentry ) {
				socket.emit('senttext', text_field.val() );
			}
		});
	});
	</script>
	<input id="text" value="" />

Sockets work in pure client side js, so for deployment on the internet I needed a way to create seperate sockets for publishing and broadcasting. (Otherwise risk hackers publishing to all visitors with a few lines in the web inspector console)

### Sockets Server

Server - Takes data from private socket and pushes it out on public API

`server.js`

```js
var app = require('express')()
	// Port 8880 redirected with nginx to /api
	, clientio = require('socket.io').listen(8880)
	, server = require('http').createServer(app)
	, io = require('socket.io').listen(server)
	, port = 9779;

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
```

### Webserver Config

It took some special configuration to comply with the same origin policy when it came time to test things live.

Using nginx:

	server {
		listen   80; ## listen for ipv4; this line is default and implied
		# listen   [::]:80 default_server ipv6only=on; ## listen for ipv6

		# root /home/pi/www;
		root /home/pi/digitaldesigndj.com/out;
		index index.html index.htm;

		# Make site accessible from http://localhost/
		server_name localhost;

		location /api/ {
				proxy_pass http://localhost:8880;
				proxy_http_version 1.1;
				proxy_set_header Upgrade $http_upgrade;
				proxy_set_header Connection "upgrade";
		}

		error_page 404 /404.html;

	}
 -->