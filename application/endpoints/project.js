var couchdb    = require('../libs/node-couchdb/lib/couchdb'),
    client     = couchdb.createClient(5984, 'localhost'),
    db         = client.db('unionpacific'),
    formidable = require('formidable'),
	Project    = require('../data/Project');
	
exports.endpoints = function(app)
{
	app.get('/', getProjects);
	app.post('/', createProject);
	
	// Add Item
	//app.post('/:id/:task', addItem);
	//app.delete('/:id/:task', deleteItem);
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
	if(req.headers["content-length"] > 0)
	{
		var form = req.form = new formidable.IncomingForm;
		
		form.parse(req, function(err, fields, files)
		{
			var project          = new Project();
			project.name         = fields.name;
			project.stakeholders = fields.stakeholders;
			
			db.saveDoc(project, function(error, data)
			{
				if(error == null)
				{
					next({"ok":true, "id":data.id});
				}
				else
				{
					next({"ok":false, "message":"unable to save project"});
				}
			});
		});
	}
	else
	{
		next({"ok":false, "message":"invalid request"});
	}
}