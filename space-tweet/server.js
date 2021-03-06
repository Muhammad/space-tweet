/**
* SpaceTweet
*
* @author Jacob Thornton <jacob@twitter.com>
* @license The MIT license.
* this is file is a hastey mashup of Guillermo Rauch's server from socket.io and Rick Olson's twitter-node
*/

var http = require('http'), 
		url = require('url'),
		fs = require('fs'),
		io = require('../lib/socket.io'),
		sys = require('sys'),
		TwitterNode = require('../lib').TwitterNode,
    path = require("path")
		
send404 = function(res){
	res.writeHead(404);
	res.write('404');
	res.end();
},
		
server = http.createServer(function(req, res){
	// your normal server code
	var uri = url.parse(req.url).pathname;
	switch (uri){
		case '/':
					res.writeHead(200, {'Content-Type': 'text/html'});
					res.write(fs.readFileSync(__dirname + uri+'viz.html', 'utf8'), 'utf8');
					res.end();
			break;
			
		default:
			if (/\.(js|html|swf)$/.test(uri)){
				try {
					var swf = uri.substr(-4) == '.swf';
					res.writeHead(200, {'Content-Type': swf ? 'application/x-shockwave-flash' : ('text/' + (uri.substr(-3) == '.js' ? 'javascript' : 'html'))});
					res.write(fs.readFileSync(__dirname + uri, swf ? 'binary' : 'utf8'), swf ? 'binary' : 'utf8');
					res.end();
				} catch(e){ 
					send404(res); 
				}				
				break;
			}
			else{
        var filename = path.join(process.cwd(), uri);  
        path.exists(filename, function(exists) {  
          if(!exists) {  
              res.sendHeader(404, {"Content-Type": "text/plain"});  
              res.write("404 Not Found\n");  
              res.close();  
              return;  
          }  
    
          fs.readFile(filename, "binary", function(err, file) {  
              if(err) {  
                  res.sendHeader(500, {"Content-Type": "text/plain"});  
                  res.write(err + "\n");  
                  res.close();  
                  return;  
              }  
    
              res.sendHeader(200);  
              res.write(file, "binary");  
              res.close();  
          });  
        });
			}
	}
});

server.listen(8080);
		
// socket.io, I choose you
// simplest chat application evar
var json = JSON.stringify, clients = [];

var twit = new TwitterNode({
  user: 'spacetweeeet', 
  password: 'twitter123',  
  track: ['lame', 'bad', 'dumb', 'good', 'cool', 'awesome']
});

var broadcast = function(tweet){ 
  listener.broadcast({tweet: tweet});
};

var listener = io.listen(server, {
  
  onClientConnect: function(client){
    if(!clients.length){
      //wait to stream until 1 connection is made
      twit.addListener('tweet', broadcast).stream();
    }
		clients.push(client);
	},
	
	onClientDisconnect: function(client){
	 clients.splice(clients.indexOf(client), 0);
	}
	
});



