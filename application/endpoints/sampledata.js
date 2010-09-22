var couchdb    = require('../libs/node-couchdb/lib/couchdb'),
    client     = couchdb.createClient(5984, 'localhost'),
    db         = client.db('unionpacific'),
    sys        = require('sys'),
	spawn      = require('child_process').spawn,
	User       = require('../data/User'),
	Project    = require('../data/Project'),
	Group      = require('../data/Group'),
	Task       = require('../data/Task');
	

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
	
	var u8 = new User();
		u8._id   = "aburgess@blitzagency.com";
		u8.first = "Amanda";
		u8.last  = "Burgess";
		u8.title = "Lorem Ipsum Dolor";
	
	var u9 = new User();
		u9._id   = "mpark@blitzagency.com";
		u9.first = "Molly";
		u9.last  = "Park";
		u9.title = "Lorem Ipsum Dolor";
	
	var u10 = new User();
		u10._id   = "yflomin@blitzagency.com";
		u10.first = "Yosef";
		u10.last  = "Flomin";
		u10.title = "Lorem Ipsum Dolor";
		
	
	var p1              = new Project();
		p1.name         = "Zoobles";
		p1.stakeholders = [u8._id, u7._id];
	
	var p2              = new Project();
		p2.name         = "Halo Waypoint";
		p2.stakeholders = [u6._id, u5._id, u3._id, u2._id, u1._id];
	
	var p3              = new Project();
		p3.name         = "Disney Mobile";
		p3.stakeholders = [u9._id, u2._id, u1._id];
		
	var p4              = new Project();
		p4.name         = "Lincoln MKZ";
		p4.stakeholders = [u8._id, u7._id, u10._id];
		
	var p5              = new Project();
		p5.name         = "Union Pacific";
		p5.stakeholders = [u1._id, u2._id];
		
	
	var g1       = new Group();
		g1._id   = 'group/html';
		g1.name  = "Html";
		g1.addTask(new Task("Check title tags"));
		g1.addTask(new Task("Check Navigation"));
		g1.addTask(new Task("Displays properly in IE 6"));
		g1.addTask(new Task("Displays properly in IE 7"));
		g1.addTask(new Task("Displays properly in IE 8"));
		g1.addTask(new Task("Displays properly in Firefox (win)"));
		g1.addTask(new Task("Displays properly in Firefox (mac)"));
		g1.addTask(new Task("Displays properly in Chrome (win)"));
		g1.addTask(new Task("Displays properly in Chrome (mac)"));
		g1.addTask(new Task("Displays properly in Safari (mac)"));
	
	var g2       = new Group();
		g2._id   = 'group/flash';
		g2.name  = "Flash";
		g2.addTask(new Task("Check title tags"));
		g2.addTask(new Task("Check Navigation"));
	
	var g3       = new Group();
		g3._id   = 'group/server';
		g3.name  = "Server";
		g3.addTask(new Task("404 Handling"));
	
	var g4       = new Group();
		g4._id   = 'group/sparklelord';
		g4.name  = "Sparklelord";
		g4.addTask(new Task("Does it sparkle?"));
		g4.addTask(new Task("Does it sap the magic force from all things nearby?"));
		g4.addTask(new Task("Is it Hitler, Atomic Bombs, and Seabiscuit wrapped in a vegan burrito?"));
		g4.addTask(new Task("Is it Lord of the Rings with Owls?"));
	
	
	
	p1.checklist = g1.items.concat(g2.items);
	p2.checklist = g1.items.concat(g3.items);
	p3.checklist = g2.items;
	p4.checklist = g1.items;
	p5.checklist = g4.items;
	
	db.saveDoc(g1);
	db.saveDoc(g2);
	db.saveDoc(g3);
	db.saveDoc(g4);
	
	// Users
	db.saveDoc(u1);
	db.saveDoc(u2);
	db.saveDoc(u3);
	db.saveDoc(u4);
	db.saveDoc(u5);
	db.saveDoc(u6);
	db.saveDoc(u7);
	db.saveDoc(u8);
	db.saveDoc(u9);
	db.saveDoc(u10);
	
	// Projects
	db.saveDoc(p1);
	db.saveDoc(p2);
	db.saveDoc(p3);
	db.saveDoc(p4);
	db.saveDoc(p5);
	
	next({"ok":true, "message":"done"});
}