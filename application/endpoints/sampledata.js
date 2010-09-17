var couchdb  = require('../libs/node-couchdb/lib/couchdb'),
    client   = couchdb.createClient(5984, 'localhost'),
    db       = client.db('unionpacific'),
    sys      = require('sys'),
	spawn    = require('child_process').spawn;
	//match    = require('../data/match'),
	//game     = require('../data/game'),
	//user     = require('../data/user');

exports.endpoints = function(app)
{
	app.get('/', initialize);
}

function initialize(req, res, next)
{
	
	db.remove();
	db.create();
	
	var couchapp = spawn('couchapp', ['push', './couchapp', 'unionpacific']);
	
	couchapp.on('exit', function (code) 
	{
		if (code !== 0) 
		{
			console.log('\n\ncouchapp push failed ' + code + '\n\n');
		}
		else
		{
			console.log('\n\ncouchapp push complete \n\n');
		}
	});
	
	next({"ok":true, "message":"done"});
}