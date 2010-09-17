var couchdb  = require('../libs/node-couchdb/lib/couchdb'),
    client   = couchdb.createClient(5984, 'localhost'),
    db       = client.db('unionpacific'),
    sys      = require('sys'),
	spawn    = require('child_process').spawn,
	User    = require('../data/User');
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
	
	var u1 = new User();
	    u1._id   = "aventurella@blitzagency.com";
	    u1.first = "Adam";
	    u1.last  = "Venturella";
	    u1.title = "Lorem Ipsum Dolor";
	
	var u2 = new User();
		u2._id   = "ptobias@blitzagency.com";
		u2.first = "Phil";
		u2.last  = "Tobias";
		u2.title = "Lorem Ipsum Dolor";
		
	var u3 = new User();
		u3._id   = "ataylor@blitzagency.com";
		u3.first = "Aubrey";
		u3.last  = "Taylor";
		u3.title = "Lorem Ipsum Dolor";
		
	var u4 = new User();
		u4._id   = "elouie@blitzagency.com";
		u4.first = "Erick";
		u4.last  = "Louie";
		u4.title = "Lorem Ipsum Dolor";
			
	var u5 = new User();
		u5._id   = "srettinger@blitzagency.com";
		u5.first = "Steve";
		u5.last  = "Rettinger";
		u5.title = "Lorem Ipsum Dolor";
				
	var u6 = new User();
		u6._id   = "bdon@blitzagency.com";
		u6.first = "Brian";
		u6.last  = "Don";
		u6.title = "Lorem Ipsum Dolor";
					
	var u7 = new User();
		u7._id   = "dpetrone@blitzagency.com";
		u7.first = "Dino";
		u7.last  = "Petrone";
		u7.title = "Lorem Ipsum Dolor";
	
	db.saveDoc(u1);
	db.saveDoc(u2);
	db.saveDoc(u3);
	db.saveDoc(u4);
	db.saveDoc(u5);
	db.saveDoc(u6);
	db.saveDoc(u7);
	
	next({"ok":true, "message":"done"});
}