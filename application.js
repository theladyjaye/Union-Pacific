require.paths.unshift("/usr/local/lib/node");

var connect      = require('connect'),
	defaults     = require('./application/endpoints/default'),
	sampledata   = require('./application/endpoints/sampledata'),
	search       = require('./application/endpoints/search'),
	project      = require('./application/endpoints/project');
	groups       = require('./application/endpoints/groups');
	

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

server.use("/api/sampledata/", connect.router(sampledata.endpoints));
server.use("/api/search/", connect.router(search.endpoints));
server.use("/api/projects/", connect.router(project.endpoints));
server.use("/api/groups/", connect.router(groups.endpoints));

server.use(defaults.defaultResponse);
server.use(defaults.renderResponse);


server.listen(80);

console.log('Union Pacific server listening on port 80');