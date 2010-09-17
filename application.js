require.paths.unshift("/usr/local/lib/node");

var connect      = require('connect'),
	defaults     = require('./application/endpoints/default');
	
//var main         = require('./endpoints/main');
//var matches      = require('./endpoints/matches');
//var games        = require('./endpoints/games');
//var sampledata   = require('./endpoints/sampledata');


var server = connect.createServer(
	//form({ keepExtensions: false }),
	connect.logger({ buffer: true })
);

var vhost = connect.vhost('unionpacific', server);

server.use("/", connect.staticProvider(__dirname + '/'));
server.use("/resources/css", connect.staticProvider(__dirname + '/resources/css'));
server.use("/resources/imgs", connect.staticProvider(__dirname + '/resources/imgs'));
server.use("/resources/js", connect.staticProvider(__dirname + '/resources/js'));
server.use("/resources/templates", connect.staticProvider(__dirname + '/resources/templates'));

//server.use("/api/sampledata/", connect.router(sampledata.endpoints));
//server.use("/games/", connect.router(games.endpoints));
//server.use("/matches/", connect.router(matches.endpoints));


server.use(defaults.defaultResponse);
server.use(defaults.renderResponse);

//server.use("/session/", connect.router(session.endpoints));

server.listen(80);

console.log('Union Pacific server listening on port 80');