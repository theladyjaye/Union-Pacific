var couchdb    = require('../libs/node-couchdb/lib/couchdb'),
    client     = couchdb.createClient(5984, 'localhost'),
    db         = client.db('unionpacific'),
    formidable = require('formidable'),
	Project    = require('../data/Project'),
	Task       = require('../data/Task');
	
exports.endpoints = function(app)
{
	app.get('/', getProjects);
	app.post('/', createProject);
	
	// Add Item
	app.post('/:id/checklist', addItem);
	//app.del('/:id/checklist', deleteItem);
}

function addItem(req, res, next)
{
	if(req.headers["content-length"] > 0)
	{
		var form = req.form = new formidable.IncomingForm;
		form.parse(req, function(err, fields, files)
		{
			var project_id = req.params.id;
			
			db.getDoc(encodeURIComponent(project_id), function(projectError, project)
			{
				if(projectError == null)
				{
					var task = new Task(fields.name.trim());
					
					if(typeof fields.category != "undefined")
						task.category = fields.category.trim();
						
					task.generateId();
					
					for(var i in project.checklist)
					{
						var item = project.checklist[i];
						
						if(item._id == task._id)
						{
							next({"ok":false, "message":"item already exists in project"});
							return;
						}
					}
					
					project.checklist.push(task);
					
					db.saveDoc(project, function(error, data)
					{
						if(error == null)
							next({"ok":true, "id":data.id});
						else
							next({"ok":false, "message":"unable to add task to project"});
					});
				}
				else
				{
					next({"ok":false, "message":"invalid project"});
				}
			});
		});
	}
	else
	{
		next({"ok":false, "message":"invalid request"});
	}
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
			project.name         = fields.name.trim();
			project.stakeholders = fields.stakeholders;
			
			if(typeof fields.groups != "undefined")
			{
				var totalGroups  = fields.groups.length;
				var currentGroup = 0;
				
				fields.groups.forEach(function(group)
				{
					// this is a totally async operation, so we gotta get a bit fancy, inside out time.
					db.getDoc(encodeURIComponent(group), function(groupDocError, groupDoc)
					{
						if(groupDocError == null)
							project.checklist = project.checklist.concat(groupDoc.items);
							
						currentGroup = currentGroup + 1;
						
						if(currentGroup == totalGroups)
						{
							db.saveDoc(project, function(error, data)
							{
								if(error == null)
									next({"ok":true, "id":data.id});
								else
									next({"ok":false, "message":"unable to save project"});
							});
						}
					})
				});
			}
		});
	}
	else
	{
		next({"ok":false, "message":"invalid request"});
	}
}