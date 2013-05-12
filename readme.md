## DigitalDesignDj API

Right now, I am using this space for a sockets io exeriment.

Currently its a new feature on DigitalDesignDj.com where I can type into the local only text field and the events are sent to all connected clients on digitaldesigndj.com

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