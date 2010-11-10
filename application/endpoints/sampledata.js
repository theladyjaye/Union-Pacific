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
	
	// Tech Department
	var u1 = new User();
	    u1._id   = "aventurella@blitzagency.com";
	    u1.first = "Adam";
	    u1.last  = "Venturella";
	    u1.title = "Senior Software Developer";
	
	var u2 = new User();
		u2._id   = "ptobias@blitzagency.com";
		u2.first = "Phil";
		u2.last  = "Tobias";
		u2.title = "Software Developer";
		
	var u3 = new User();
		u3._id   = "ataylor@blitzagency.com";
		u3.first = "Aubrey";
		u3.last  = "Taylor";
		u3.title = "Software Developer";
		
	var u4 = new User();
		u4._id   = "elouie@blitzagency.com";
		u4.first = "Erick";
		u4.last  = "Louie";
		u4.title = "Software Devloper";
			
	var u5 = new User();
		u5._id   = "srettinger@blitzagency.com";
		u5.first = "Steve";
		u5.last  = "Rettinger";
		u5.title = "Senior Developer";
		
	var u6 = new User();
		u6._id   = "dpetrone@blitzagency.com";
		u6.first = "Dino";
		u6.last  = "Petrone";
		u6.title = "Senior Flash Developer";
		
	var u7 = new User();
		u7._id   = "yflomin@blitzagency.com";
		u7.first = "Yosef";
		u7.last  = "Flomin";
		u7.title = "Software Developer";
	
	var u8 = new User();
		u8._id   = "nsmith@blitzagency.com";
		u8.first = "Nathanael";
		u8.last  = "Smith";
		u8.title = "Junior Developer";
	
	var u9 = new User();
		u9._id   = "ngedrich@blitzagency.com";
		u9.first = "Noah";
		u9.last  = "Gedrich";
		u9.title = "Senior Director, Technology";
		
	// Project Management
	var u10 = new User();
		u10._id   = "bdon@blitzagency.com";
		u10.first = "Brian";
		u10.last  = "Don";
		u10.title = "Senior Project Manager";
	
	var u11 = new User();
		u11._id   = "aburgess@blitzagency.com";
		u11.first = "Amanda";
		u11.last  = "Burgess";
		u11.title = "Project Manager";
	
	var u12 = new User();
		u12._id   = "mpark@blitzagency.com";
		u12.first = "Molly";
		u12.last  = "Park";
		u12.title = "Senior Program Manager";
		
	var u13 = new User();
		u13._id   = "rferrante@blitzagency.com";
		u13.first = "Robert";
		u13.last  = "Ferrante";
		u13.title = "Senior Program Manager";
	
	var u14 = new User();
		u14._id   = "rferrante@blitzagency.com";
		u14.first = "Robert";
		u14.last  = "Ferrante";
		u14.title = "Senior Program Manager";
	
	var u15 = new User();
		u15._id   = "vhoy@blitzagency.com";
		u15.first = "Vanessa";
		u15.last  = "Hoy";
		u15.title = "Senior Program Manager";
	
	var u16 = new User();
		u16._id   = "kmccann@blitzagency.com";
		u16.first = "Kimberly";
		u16.last  = "McCann";
		u16.title = "Project Manager";

	var u17 = new User();
		u17._id   = "kzaninovich@blitzagency.com";
		u17.first = "Kim";
		u17.last  = "Zaninovich";
		u17.title = "Executive Producer";
		
	var u18 = new User();
		u18._id   = "mholzmiller@blitzagency.com";
		u18.first = "Michael";
		u18.last  = "Holzmiller";
		u18.title = "Project Manager";
	
	var u19 = new User();
		u19._id   = "ltoneman@blitzagency.com";
		u19.first = "Laura";
		u19.last  = "Toneman";
		u19.title = "Director, Project Management";
	
	var u20 = new User();
		u20._id   = "ccotillo@blitzagency.com";
		u20.first = "Courtnie";
		u20.last  = "Cotillo";
		u20.title = "Project Coordinator";
	
	var u21 = new User();
		u21._id   = "derek@blitzagency.com";
		u21.first = "Derek";
		u21.last  = "van den Bosch";
		u21.title = "Vice President, Delivery";

	var u22 = new User();
		u22._id   = "mmarich@blitzagency.com";
		u22.first = "Melissa";
		u22.last  = "Marich";
		u22.title = "Project Manager";
		
	// UX
	var u23 = new User();
		u23._id   = "ccefalu@blitzagency.com";
		u23.first = "Celeste";
		u23.last  = "Cefalu";
		u23.title = "Senior User Experience";
	
	var u24 = new User();
		u24._id   = "sharris@blitzagency.com";
		u24.first = "Sy";
		u24.last  = "Harris";
		u24.title = "User Experience Architect";

	var u25 = new User();
		u25._id   = "trichards@blitzagency.com";
		u25.first = "Tim";
		u25.last  = "Richards";
		u25.title = "Vice President, User Experience";
		
	var u26 = new User();
		u26._id   = "cerdman@blitzagency.com";
		u26.first = "Charles";
		u26.last  = "Erdman";
		u26.title = "User Experience Lead";
		
	// Design
	var u27 = new User();
		u27._id   = "aphoenix@blitzagency.com";
		u27.first = "Andru";
		u27.last  = "Phoenix";
		u27.title = "Interactive Senior Designer";

	var u28 = new User();
		u28._id   = "dwilliams@blitzagency.com";
		u28.first = "Dave";
		u28.last  = "Williams";
		u28.title = "Art Director";
	
	var u29 = new User();
		u29._id   = "eperez@blitzagency.com";
		u29.first = "Eric";
		u29.last  = "Perez";
		u29.title = "Group Creative Director";

	var u30 = new User();
		u30._id   = "esquire@blitzagency.com";
		u30.first = "Evan";
		u30.last  = "Squire";
		u30.title = "Designer";
		
	var u31 = new User();
		u31._id   = "gcordial@blitzagency.com";
		u31.first = "Gilbert";
		u31.last  = "Cordial";
		u31.title = "Senior Designer";
		
	var u32 = new User();
		u32._id   = "jliu@blitzagency.com";
		u32.first = "Jancy";
		u32.last  = "Liu";
		u32.title = "Senior Designer";
	
	var u33 = new User();
		u33._id   = "jquon@blitzagency.com";
		u33.first = "Jarrett";
		u33.last  = "Quon";
		u33.title = "Senior Designer";

	var u34 = new User();
		u34._id   = "jesguia@blitzagency.com";
		u34.first = "Josh";
		u34.last  = "Esguia";
		u34.title = "Creative Director";
		
	var u35 = new User();
		u35._id   = "mmurray@blitzagency.com";
		u35.first = "Matt";
		u35.last  = "Murray";
		u35.title = "Associate Creative Director";
		
	var u36 = new User();
		u36._id   = "nrodriguez@blitzagency.com";
		u36.first = "Nicolle";
		u36.last  = "Rodriguez";
		u36.title = "Junior Designer";
	
	var u37 = new User();
		u37._id   = "phikiji@blitzagency.com";
		u37.first = "Paul";
		u37.last  = "Hikiji";
		u37.title = "Senior Art Director";
		
	var u38 = new User();
		u38._id   = "plee@blitzagency.com";
		u38.first = "Paul";
		u38.last  = "Lee";
		u38.title = "Design Director";
	
	var u39 = new User();
		u39._id   = "satkinson@blitzagency.com";
		u39.first = "Stacey";
		u39.last  = "Atkinson";
		u39.title = "Designer";
	
	var u40 = new User();
		u40._id   = "tgip@blitzagency.com";
		u40.first = "Thanh";
		u40.last  = "Gip";
		u40.title = "Designer";
		
	
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
		g1.addTask(new Task("CSS is compressed"));
		g1.addTask(new Task("JavaScript is minified"));
		g1.addTask(new Task("BLITZ controlled tracking has been implemented"));
	
	var g2       = new Group();
		g2._id   = 'group/plugin';
		g2.name  = "Plugin";
		g2.addTask(new Task("If full plugin deployment, check title tags"));
		g2.addTask(new Task("Check Navigation"));
		g2.addTask(new Task("Check random/rapid input stability"));
		g2.addTask(new Task("Confirm flash var handling in different browsers"));
	
	var g3       = new Group();
		g3._id   = 'group/server';
		g3.name  = "Server";
		g3.addTask(new Task("404 Handling"));
		g3.addTask(new Task("Application views do not throw exceptions - no errors"));
	
	var g4       = new Group();
		g4._id   = 'group/ux';
		g4.name  = "User Experience";
		g4.addTask(new Task("Application behaves appropriately according to latest agreed upon functionality"));
		
		
	var g5       = new Group();
		g5._id   = 'group/polish';
		g5.name  = "Polish";
		g5.addTask(new Task("Client Provided Logos Correct"));
		g5.addTask(new Task("Copy is correct"));
		g5.addTask(new Task("Titles are correct application wide"));
		g5.addTask(new Task("Navigation is functional"));
		g5.addTask(new Task("Are copyright and registered trademark symbols in their proper positions"));
		
		
	//p1.checklist = g1.items.concat(g2.items);
	//p2.checklist = g1.items.concat(g3.items);
	//p3.checklist = g2.items;
	//p4.checklist = g1.items;
	//p5.checklist = g4.items;
	
	db.saveDoc(g1);
	db.saveDoc(g2);
	db.saveDoc(g3);
	db.saveDoc(g4);
	db.saveDoc(g5);
	
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
	db.saveDoc(u11);
	db.saveDoc(u12);
	db.saveDoc(u13);
	db.saveDoc(u14);
	db.saveDoc(u15);
	db.saveDoc(u16);
	db.saveDoc(u17);
	db.saveDoc(u18);
	db.saveDoc(u19);
	db.saveDoc(u20);
	db.saveDoc(u21);
	db.saveDoc(u22);
	db.saveDoc(u23);
	db.saveDoc(u24);
	db.saveDoc(u25);
	db.saveDoc(u26);
	db.saveDoc(u27);
	db.saveDoc(u28);
	db.saveDoc(u29);
	db.saveDoc(u30);
	db.saveDoc(u31);
	db.saveDoc(u32);
	db.saveDoc(u33);
	db.saveDoc(u34);
	db.saveDoc(u35);
	db.saveDoc(u36);
	db.saveDoc(u37);
	db.saveDoc(u38);
	db.saveDoc(u39);
	db.saveDoc(u40);
	
	// Projects
	//db.saveDoc(p1);
	//db.saveDoc(p2);
	//db.saveDoc(p3);
	//db.saveDoc(p4);
	//db.saveDoc(p5);
	
	next({"ok":true, "message":"done"});
}