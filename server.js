var app              = require('express')()
	, server         = require('http').createServer(app)
	, io             = require('socket.io').listen(server)
	, events         = require('events')
	, cronJob        = require('cron').CronJob
	, $              = require('jquery')
	, eventEmitter   = new events.EventEmitter()
	, lastfm         = {}
	, total          = 0
	, current_track  = ''
	, username       = "DigitalDesignDj"
	, lastfm_api_key = 'c7b66efb5c1869ed420b3275da989fab';

server.listen(9779);

app.get('/', function (req, res) {
	res.sendfile(__dirname + '/index.html');
});

function pollLastFm(){
	$.ajax({
		url: 'http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=' + encodeURIComponent(username) + '&api_key=' + encodeURIComponent(lastfm_api_key) + '&format=json',
		dataType: "jsonp",
		success: function (data) {
			var api_total = data.recenttracks['@attr'].total;
			console.log( api_total );
			if( total !== api_total ){
				total = api_total;
				current_track = data.recenttracks.track[0].name;
				io.sockets.emit('news', data );
				console.log( 'new played song' );
			}else{
				console.log( data.recenttracks.track[0].name );
				if( data.recenttracks.track[0]['@attr'].nowplaying ) {
					var api_current_track = data.recenttracks.track[0].name;
					if( current_track !== api_current_track ){
						current_track = api_current_track;
						io.sockets.emit('news', data );
						console.log( 'newsong' );
					}
				}
			}
			lastfm = data;
		}
	});
}

new cronJob('*/5 * * * * *', function(){
	// console.log('Polling LastFM');
	pollLastFm();
}, null, true);

io.sockets.on('connection', function (socket) {
	socket.emit('news', lastfm);
});
