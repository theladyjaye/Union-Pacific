var couchdb    = require('../libs/node-couchdb/lib/couchdb'),
    client     = couchdb.createClient(5984, 'localhost'),
    db         = client.db('unionpacific'),
    formidable = require('formidable');
	
exports.endpoints = function(app)
{
	app.get('/', getProjects);
	app.post('/', createProject);
}

function getProjects(req, res, next)
{
	db.view("application", "project-all", {"include_docs":true}, function(error, data)
	{
		if(error == null)
		{
			results = [];
			
			data.rows.forEach(function(row){
				results.push(row.doc);
			});
			
			next({"ok":true, "projects":results});
		}
		else
		{
			next({"ok":false, "message":error.message});
		}
	});
}

function createProject(req, res, next)
{
	
}