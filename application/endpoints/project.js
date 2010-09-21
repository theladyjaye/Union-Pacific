var couchdb    = require('../libs/node-couchdb/lib/couchdb'),
    client     = couchdb.createClient(5984, 'localhost'),
    db         = client.db('unionpacific'),
    formidable = require('formidable'),
	Project    = require('../data/Project'),
	Task       = require('../data/Task');
	
exports.endpoints = function(app)
{
	app.get('/:id', getProject);
	
	app.get('/', getProjects);
	
	app.post('/', createProject);
	app.post('/:id/checklist', addItem);
	app.post('/:id/stakeholders', addStakeholder);
	app.post('/:id/checklist/:taskId/complete', taskComplete);
	app.post('/:id/checklist/:taskId/incomplete', taskIncomplete);
	
	app.del('/:id/checklist/:taskId', deleteItem);
	
	// the router sees '.' as a the file extension, so we will just run with it rather than regexing it
	app.del('/:id/stakeholders/:email.:tld', deleteStakeholder); 
}


function taskIncomplete(req, res, next)
{
	var project_id = req.params.id.toLowerCase();
	var task_id    = req.params.taskId.toLowerCase();
	changeTaskStatus(project_id, task_id, false, next);
}

function taskComplete(req, res, next)
{
	var project_id = req.params.id.toLowerCase();
	var task_id    = req.params.taskId.toLowerCase();
	changeTaskStatus(project_id, task_id, true, next);
}

function changeTaskStatus(project_id, task_id, to_status, next)
{
	// here is where this structure sorta gets us... This for loop is meh...
	// also we are forced to resave the whole object... bla...
	db.getDoc(encodeURIComponent(project_id), function(projectError, project)
	{
		if(projectError == null)
		{
			var didUpdateTask = false;
			for(var i in project.checklist)
			{
				var task = project.checklist[i];
				
				if(task._id == task_id)
				{
					task.is_complete = to_status;
					didUpdateTask = true;
					break;
				}
			}
			
			if(didUpdateTask)
			{
				db.saveDoc(project, function(error, data)
				{
					if(error == null)
						next({"ok":true, "id":data.id, "rev":data.rev});
					else
						next({"ok":false, "message":"unable to update task status"});
				});
			}
			else
			{
				next({"ok":false, "message":"invalid task"});
			}
		}
		else
		{
			next({"ok":false, "message":"invalid project"});
		}
	});
}




function getProject(req, res, next)
{
	var project_id = req.params.id.toLowerCase();
	db.getDoc(encodeURIComponent(project_id), function(projectError, project)
	{
		if(projectError == null)
		{
			next({"ok":true, "project":project});
		}
		else
		{
			next({"ok":false, "message":"invalid project"});
		}
	});
}

function addStakeholder(req, res, next)
{
	if(req.headers["content-length"] > 0)
	{
		var project_id = req.params.id.toLowerCase();
		var form       = req.form = new formidable.IncomingForm;
		
		form.parse(req, function(err, fields, files)
		{
			db.getDoc(encodeURIComponent(project_id), function(projectError, project)
			{
				if(projectError == null)
				{
					var email = fields.email.trim();
					
					db.getDoc(email, function(userError, user)
					{
						if(userError == null)
						{
							for(var i in project.stakeholders)
							{
								var stakeholder = project.stakeholders[i];

								if(stakeholder == email)
								{
									next({"ok":false, "message":"stakeholder already exists"});
									return;
								}
							}
							
							project.stakeholders.push(email);
							
							db.saveDoc(project, function(error, data)
							{
								if(error == null)
									next({"ok":true, "id":data.id, "rev":data.rev});
								else
									next({"ok":false, "message":"unable to add stakeholder to project"});
							});
						}
						else
						{
							next({"ok":false, "message":"invalid user"});
						}
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

function deleteStakeholder(req, res, next)
{
	var project_id = req.params.id.toLowerCase();
	var email      = req.params.email.toLowerCase()+"."+req.params.tld.toLowerCase();
	
	db.getDoc(encodeURIComponent(project_id), function(projectError, project)
	{
		if(projectError == null)
		{
			var stakeholdersLength = project.stakeholders.length;
			var targetIndex = -1;
			var newStakeholders = [];
			
			for(var i = 0; i < stakeholdersLength; i++)
			{
				var stakeholder = project.stakeholders[i];
				if(stakeholder != email)
				{
					newStakeholders.push(stakeholder);
				}
				else
				{
					targetIndex = i;
				}
			}
			
			if(targetIndex > -1)
			{
				project.stakeholders = newStakeholders;
				
				db.saveDoc(project, function(saveError, saveData)
				{
					if(saveError == null)
						next({"ok":true, "id":saveData.id, "rev":saveData.rev});
					else
						next({"ok":false, "message":"failed remove stakeholder"});
				});
			}
			else
			{
				next({"ok":false, "message":"stakeholder not found in project"});
			}
		}
		else
		{
			next({"ok":false, "message":"invalid project"});
		}
	});
}

function deleteItem(req, res, next)
{
	var project_id = req.params.id.toLowerCase();
	var task_id    = req.params.taskId.toLowerCase();
	
	db.getDoc(encodeURIComponent(project_id), function(projectError, project)
	{
		if(projectError == null)
		{
			var checklistLength = project.checklist.length;
			var targetIndex = -1;
			var newChecklist = [];
			
			for(var i = 0; i < checklistLength; i++)
			{
				var task = project.checklist[i];
				if(task._id != task_id)
				{
					newChecklist.push(task);
				}
				else
				{
					targetIndex = i;
				}
			}
			
			if(targetIndex > -1)
			{
				project.checklist = newChecklist;
				db.saveDoc(project, function(saveError, saveData)
				{
					if(saveError == null)
						next({"ok":true, "id":saveData.id, "rev":saveData.rev});
					else
						next({"ok":false, "message":"failed remove task"});
				});
			}
			else
			{
				next({"ok":false, "message":"task not found in project"});
			}
		}
		else
		{
			next({"ok":false, "message":"invalid project"});
		}
	});
}
function addItem(req, res, next)
{
	if(req.headers["content-length"] > 0)
	{
		var form = req.form = new formidable.IncomingForm;
		form.parse(req, function(err, fields, files)
		{
			var project_id = req.params.id.toLowerCase();
			
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