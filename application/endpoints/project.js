var fs         = require('fs'),
    mustache   = require('../libs/mustache'),
    couchdb    = require('../libs/node-couchdb/lib/couchdb'),
    client     = couchdb.createClient(5984, 'localhost'),
    db         = client.db('unionpacific'),
    formidable = require('formidable'),
	Project    = require('../data/Project'),
	Task       = require('../data/Task'),
    Receipt    = require('../data/Receipt'),
    email      = require("../libs/node_mailer");
    
	
exports.endpoints = function(app)
{
	app.get('/:id', getProject);
	
	app.get('/', getProjects);
	app.get('/:id/verify/:token', verifyToken);
	
	app.post('/', createProject);
	app.post('/:id/checklist', addItem);
	
	app.post('/:id/complete', projectComplete);
	app.post('/:id/incomplete', projectComplete);
	
	app.post('/:id/verify/:token', projectVerify);
	
	app.post('/:id/stakeholders', addStakeholder);
	app.post('/:id/checklist/:taskId/complete', taskComplete);
	app.post('/:id/checklist/:taskId/incomplete', taskIncomplete);
	
	app.del('/:id/checklist/:taskId', deleteItem);
	
	// the router sees '.' as a the file extension, so we will just run with it rather than regexing it
	app.del('/:id/stakeholders/:email.:tld', deleteStakeholder); 
}

function verifyToken(req, res, next)
{
	var project_id = req.params.id.toLowerCase();
	var token      = req.params.token.toLowerCase();
	
	db.getDoc(encodeURIComponent(token), function(receiptError, receipt)
	{
		if(receiptError == null)
		{
			if(receipt.project != project_id)
			{
				next({"ok":false, "message":"token does not match project assignment"});
			}
			else
			{
				next({"ok":true});
			}
		}
		else
		{
			next({"ok":false, "message":"token does not exist"});
		}
	});
}

function projectComplete(req, res, next)
{
	var project_id = req.params.id.toLowerCase();
	db.getDoc(encodeURIComponent(project_id), function(projectError, project)
	{
		if(projectError == null)
		{
			project.is_complete = true;
			
			db.saveDoc(project, function(saveError, saveData)
			{
				if(saveError == null)
				{
					project.stakeholders.forEach(function(stakeholder)
					{
						var receipt     = new Receipt();
						receipt.user    = stakeholder;
						receipt.project = project._id;
						
						db.saveDoc(receipt, function(receiptError, receiptData)
						{
							sendCompleteEmail(stakeholder, project.name, receiptData.id);
						});
					})
					
					next({"ok":true, "id":saveData.id, "rev":saveData.rev});
				}
				else
				{
					next({"ok":false, "message":"failed remove task"});
				}
			});
		}
		else
		{
			next({"ok":false, "message":"invalid project"});
		}
	});
}

function sendCompleteEmail(address, projectTitle, token)
{
	/*
	var basepath = fs.realpathSync('./application/templates');
	
	fs.readFile(basepath + '/email.project-complete.template', function (err, data) 
	{
		if (err) throw err;
		
		email.send({
		    host           : "mail.blitzagency.com",              // smtp server hostname
		    port           : "25",                     // smtp server port
		    domain         : "blitz.local",            // domain used by client to identify itself to server
		    authentication : "no auth",        // auth login is supported; anything else is no auth
		    //username       : "YXZlbnR1cmVsbGFAYmxpdHphZ2VuY3kuY29t",       // Base64 encoded username
		    //password       : "YmFzc2V0dDMxNA==",       // Base64 encoded password
		    to             : address,
		    from           : "unionpacific@blitzagency.com",
		    fromName       : "Union Pacific",
		    subject        : "Union Pacific - " + projectTitle + " is ready for verification",
		    body           : mustache.to_html(data.toString(), {"projectName":projectTitle, "token":token})
		  });
	});
	*/
}

function sendVerifyCompleteEmail(address, projectTitle)
{
	/*
	var basepath = fs.realpathSync('./application/templates');
	
	fs.readFile(basepath + '/email.project-verify-complete.template', function (err, data) 
	{
		if (err) throw err;
		
		email.send({
		    host           : "mail.blitzagency.com",              // smtp server hostname
		    port           : "25",                     // smtp server port
		    domain         : "blitz.local",            // domain used by client to identify itself to server
		    authentication : "no auth",        // auth login is supported; anything else is no auth
		    //username       : "YXZlbnR1cmVsbGFAYmxpdHphZ2VuY3kuY29t",       // Base64 encoded username
		    //password       : "YmFzc2V0dDMxNA==",       // Base64 encoded password
		    to             : address,
		    from           : "unionpacific@blitzagency.com",
		    fromName       : "Union Pacific",
		    subject        : "Union Pacific - " + projectTitle + " is Verified",
		    body           : mustache.to_html(data.toString(), {"projectName":projectTitle})
		  });
	});
	*/
}

function projectVerify(req, res, next)
{
	var project_id = req.params.id.toLowerCase();
	var token      = req.params.token.toLowerCase();
	var form       = req.form = new formidable.IncomingForm;
	
	form.parse(req, function(err, fields, files)
	{
		db.getDoc(encodeURIComponent(project_id), function(projectError, project)
		{
			if(projectError == null)
			{
				db.getDoc(encodeURIComponent(token), function(receiptError, receipt)
				{
					if(receiptError == null)
					{
						if(receipt.project != project_id)
						{
							next({"ok":false, "message":"token does not match project assignment"});
						}
						else
						{
							db.view("application", "project-receipts", {"include_docs":true, "startkey":[project._id, null], "endkey":[project._id, {}]}, function(error, data)
							{
								if(error == null)
								{
									var projectIsVerified = true;
									var stakeholders      = [];
									
									data.rows.forEach(function(row)
									{
										if(row.doc._id != receipt._id)
										{
											var receiptVerified = typeof(row.doc.verified_on) == "undefined" ? false : true;
											stakeholders.push(row.doc.user);
											
											projectIsVerified = projectIsVerified && receiptVerified;
										}
									});
									
									receipt.verified_on = new Date();
									
									db.saveDoc(receipt, function(saveError, saveData)
									{
										if(saveError == null)
										{
											stakeholders.push(receipt.user);
											
											if(projectIsVerified)
											{
												stakeholders.forEach(function(stakeholder)
												{
													sendVerifyCompleteEmail(stakeholder, project.name);
												});
											}
											
											next({"ok":true});
										}
										else
										{
											next({"ok":false, "message":"unable to update token receipt"});
										}
										
									});
								}
								else
								{
									next({"ok":false, "message":error.message});
								}
							});
						}
					}
					else
					{
						next({"ok":false, "message":"token does not exist"});
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
			if(project.is_complete == true)
			{
				next({"ok":false, "message":"project has been marked complete, unable to change status of tasks"});
				return;
			}
			else
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
//					var email = fields.email.trim();
					var email = trim(fields.email);
					
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
									next({"ok":true, "id":data.id, "rev":data.rev, "email": email});
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
//					var task = new Task(fields.name.trim());
					var task = new Task(trim(fields.name));
					
					if(typeof fields.category != "undefined")
					{
//						task.category = fields.category.trim();
						task.category = trim(fields.category);
					}
						
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
//			project.name         = fields.name.trim();
			project.name		 = trim(fields.name);
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

function trim(str)
{
	return str ? str.toString().replace(/^\s*/, "").replace(/\s*$/, "") : "";
}