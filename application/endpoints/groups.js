var couchdb    = require('../libs/node-couchdb/lib/couchdb'),
    client     = couchdb.createClient(5984, 'localhost'),
    db         = client.db('unionpacific'),
    formidable = require('formidable'),
    Group      = require('../data/Group'),
    Task       = require('../data/Task');
	
exports.endpoints = function(app)
{
	app.get('/', getGroups);
	
	app.get('/:name', getGroupItems);
	// Disabled until 1.1
	//app.post('/', createGroup);
	//app.post('/:name', addToGroup);
	//app.del('/:name', removeFromGroup);
}

function getGroups(req, res, next)
{
	db.view("application", "groups-all", {"include_docs":true}, function(error, data)
	{
		if(error == null)
		{
			results = [];
			
			data.rows.forEach(function(row){
				results.push({_id:row.doc._id, name:row.doc.name});
			});
			
			next({"ok":true, "groups":results});
		}
		else
		{
			next({"ok":false, "message":error.message});
		}
	});
}


function createGroup(req, res, next)
{
	if(req.headers["content-length"] > 0)
	{
		var form = req.form = new formidable.IncomingForm;
		
		form.parse(req, function(err, fields, files)
		{	
			var group   = new Group(); 
			group.label = fields.label;
			group.addItem();
		});
	}
	else
	{
		next({"ok":false, "message":"invalid request"});
	}
}

function addToGroup(req, res, next)
{
	next({"ok":true});
}

function removeFromGroup(req, res, next)
{
	next({"ok":true});
}

function getGroupItems(req, res, next)
{
	db.view("application", "search-users-by-name", {"include_docs":true, "startkey":req.params.name, "endkey":req.params.name+"\u9999"}, function(error, data)
	{
		if(error == null)
		{
			results = [];
			
			data.rows.forEach(function(row){
				results.push(row.doc);
			});
			
			next({"ok":true, "matches":results});
		}
		else
		{
			next({"ok":false, "message":error.message});
		}
	});
}