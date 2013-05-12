## DigitalDesignDj API

Right now, I am using this space for a sockets io exeriment.

This code has been tightly linked to what I am doing in the /digitaldesigndj.com repo. The client side connection currently lives in that repo. `src/scripts/socket.js` and `<p id="broadcast"></p>`

I have a local interface `index.html` where I can type into a text field. Via sockets IO the text is delivered back to the server. Then the events are broadcast out on a public socket that digitaldesigndj.com subscribes to.

Sockets work in pure client side js, so for deployment on the internet I needed a way to create seperate sockets for publishing and broadcasting. (Otherwise risk hackers publishing to all visitors with a few lines in the web inspector console)

Security and live publishing is the focus of this experiment so far.

### Sockets Server

Admin Interface - Text field that uses sockets to push data

Server - Takes data from private socket and pushes it out on public API

2 Sockets
	Admin Interface :9779
		Only accessible on local network
	Client Interface /api
		For the world

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
