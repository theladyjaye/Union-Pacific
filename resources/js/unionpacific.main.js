$(function() {		
	// setup jq modal
	$(".jqmWindow").jqm();

	// stakeholders fbk autocomplete for project form
	var t5 = new $.TextboxList('#fbk-stakeholders-project', {unique: true, plugins: {autocomplete: {
						minLength: 1,
						queryRemote: true,
						remote: {url: '/api/search/users'}
					}}});
					
	// stakeholders fbk autocomplete for additional stakeholders form
	var t6 = new $.TextboxList('#fbk-add-stakeholders', {unique: true, plugins: {autocomplete: {
						minLength: 1,
						queryRemote: true,
						remote: {url: '/api/search/users'}
					}}});


	// add project navigation
	$("#nav-add-project").click(function() {
		var $frm = $("#frm-add-project");
		
		$frm[0].reset();
		$frm.find(".holder .bit-box").remove();
		$("#modal-add-project").jqmShow();
		return false;
	});

	// set up groups in add project form
	$.get("/api/groups", function(json) {
		var output = [],
			group = {};
				
		for(var i = 0, len = json.groups.length; i < len; i++)
		{
			group = json.groups[i];
			output.push('<input type="checkbox" name="groups" value="' + group._id + '" />' + group.name);
			
			utils.categories.push(group.name);
		}
		
		$("#add-project-groups").html(output.join(""));
	});

	// add project form functionality
	$("#frm-add-project").find("input[name=name]").keyup(function() {
		var $btn_add = $("#frm-add-project").find(".btn-add");
		if($(this).val() != "")
		{
			$btn_add.removeClass("disable");
		}
		else
		{
			$btn_add.addClass("disable");
		}
	}).end().find(".btn-submit").click(function() {
		var $this = $(this);
		
		if(!$this.hasClass("disable"))
		{
			var obj = phui.utils.querystring_to_object($("#frm-add-project").serialize());
			obj.stakeholders = obj.stakeholders.split(","); // turn stakeholders into array
			
			$.post("/api/projects", obj, function(response) {
				if(response.ok)
				{
					// redirect to new project
					$(".jqmWindow").jqmHide();
					document.location.href = "/#/project/" + response.id;
				}
			});
		}
		
		return false;
	});
	
	// add task form functionality
	$("#frm-add-task").find("input[name=name]").keyup(function() {
		var $btn_add = $("#frm-add-task").find(".btn-add");
		if($(this).val() != "")
		{
			$btn_add.removeClass("disable");
		}
		else
		{
			$btn_add.addClass("disable");
		}
	}).end().find(".btn-submit").click(function() {
		var $this = $(this),
			project_id = document.location.hash.split("/").slice(-1);
		
		if(!$this.hasClass("disable"))
		{
			
			var $frm = $("#frm-add-task"),
				$dd_category = $("#dd-category"),
				obj = {"name": $frm.find("input[name=name]").val()};

			if($dd_category.val() == -1)
			{
				var category = $frm.find(".input-category").val();
				obj.category = category || "Generic";
			}
			else
			{
				obj.category = $dd_category.val();
			}
			
			
			$.post("/api/projects/" + project_id + "/checklist", obj, function(response) {
				if(response.ok)
				{
					// add task to list
					var li = '<li id="' + response.id + '" class="task"><a href="#" class="btn-delete">x</a><div class="task-details"><span class="title">' + obj.name + '</span><span class="category">' + obj.category + '</span><a href="#" class="is_complete"><span class="mark-as-complete">mark as complete</span><span class="mark-as-incomplete">mark as incomplete</span></a></div></li>';
					
					$(li).insertBefore("#project .tasks li:last");
					
					if(obj.category != "-1")
					{
						// add new category to list
						utils.categories.push({"name": obj.category});
					}
					
					$(".jqmWindow").jqmHide();
					
					check_for_completion();			
				}
			});
		}
		
		return false;
	});

	$("#frm-add-stakeholders").find(".btn-submit").click(function() {
		var $frm = $("#frm-add-stakeholders"),
			project_id = document.location.hash.split("/").slice(-1);
		
		var obj = phui.utils.querystring_to_object($frm.serialize());
		obj.stakeholders = obj.stakeholders.split(","); // turn stakeholders into array
		
		if(obj.stakeholders)
		{
			add_stakeholder(obj.stakeholders);
		}
		
		function add_stakeholder(stakeholders)
		{
			$.post("/api/projects/" + project_id + "/stakeholders", {"email": stakeholders.pop()}, function(response) {
				// add to stakeholder project list
				if(response.ok)
				{
					$("#project .stakeholders ul").append('<li><a href="#" class="btn-delete">x</a> <span class="email">' + response.email + '</span></li>');
				}
				
				if(stakeholders.length)
				{					
					add_stakeholder(stakeholders);
				}
				else
				{
					$("#modal-add-stakeholders").jqmHide();
				}
			});
		}
		return false;
	});

	// dd category change
	$("#dd-category").change(function() {
		var $this = $(this),
			$input_category = $this.next(".input-category");
		
		if($this.val() == "-1")
		{
			$input_category.show().focus();			
		}
		else
		{
			$input_category.hide();
		}
	});

	// mark task as complete || incomplete
	$("#project").delegate(".task .is_complete", "click", function() {
		
		var $this = $(this),
			$task = $this.parents(".task");
			
		if(!$(".project-detail-container").hasClass("status-verification"))
		{				
			var	task_id = $task.attr("id"),
				status = $task.hasClass("complete") ? "incomplete" : "complete",
				project_id = document.location.hash.split("/").slice(-1);
		
			$.post("/api/projects/" + project_id + "/checklist/" + task_id + "/" + status, function(response) {
				$task.toggleClass("complete");
				check_for_completion();			
			});
		}
		else
		{
			$task.toggleClass("complete");
			check_for_verification();
		}
		return false;
	}).delegate("#btn-complete", "click", function() {
		if(!$(this).hasClass("disable"))
		{
			var project_id = document.location.hash.split("/").slice(-1);
			
			// fire complete emails
			$.post("/api/projects/" + project_id + "/complete", function(response) {
				if(response.ok)
				{
					// redirect to dashboard
					document.location.href = "/#/dashboard";
				}
			});
		}
		return false;
	}).delegate(".task .btn-delete", "click", function() { // delete task
		var $this = $(this),
			$task = $this.parents(".task"),
			task_id = $task.attr("id"),
			project_id = document.location.hash.split("/").slice(-1),
			task_len = $("#project").find(".task").length;

		// can only delete a task if there are more than one tasks
		if(task_len > 1)
		{
			$.ajax({
				url: "/api/projects/" + project_id + "/checklist/" + task_id,
				type: "DELETE",
				success: function(response) {
					$task.animate({
						"opacity": 0
					}, 200, function() {
						$(this).remove();
						check_for_completion();	
					});
				}
			});
		}
		return false;
	}).delegate(".category", "click", function() {
		
		if(!$(".project-detail-container").hasClass("status-verification"))
		{
			var category = $(this).text().toLowerCase(),
				$task_list = $("#project ul"),
				$task_list_items = $task_list.find("li.task");
		
			if($task_list.hasClass("filtered"))
			{
				$task_list_items.fadeIn();
				$task_list.removeClass("filtered");
			}
			else
			{		
				$task_list_items.each(function() {
					if($(this).find(".category").text().toLowerCase() == category)
					{
						$(this).fadeIn();
					}
					else
					{
						$(this).fadeOut();
					}
				});
			
				$task_list.addClass("filtered");
			}
		}
	
		return false;
	}).delegate(".btn-add-task", "click", function() {
		var $frm = $("#frm-add-task");
		
		$frm[0].reset();
		utils.setup_categories();
		$frm.find(".input-category").hide();
		$("#modal-add-task").jqmShow();
		
		return false;
	}).delegate(".btn-add-stakeholders", "click", function() {
		var $frm = $("#frm-add-stakeholders");
		
		$frm[0].reset();
		$("#modal-add-stakeholders").jqmShow();
		
		return false;
	}).delegate(".stakeholders .btn-delete", "click", function() { // delete stakeholder
		var $this = $(this),
			$li = $this.parents("li"),
			$email = $li.find(".email"),
			email = $email.text(),
			project_id = document.location.hash.split("/").slice(-1);
			
		$.ajax({
			url: "/api/projects/" + project_id + "/stakeholders/" + email,
			type: "DELETE",
			success: function(response) {
				$li.animate({
					"opacity": 0
				}, 200, function() {
					$(this).remove();
				});
			}
		});	
	
		return false;	
	}).delegate(".btn-project-status", "click", function() {
		var $incomplete_tasks = $("#project .tasks li.task:not(.complete)"),
			ary_incomplete_task_ids = [],
			hash = document.location.hash,
			project_id = hash.split("/").slice(-1),
			token = phui.utils.querystring_to_object(hash.substr(hash.indexOf("?") + 1));
		
		if(project_id && token)
		{		
			// get ids of incomplete tasks into an array
			$incomplete_tasks.each(function() {
				ary_incomplete_task_ids.push($(this).attr("id"));
			});
		
			$.post("/api/project/" + project_id + "/verify/" + token, {"unverified": ary_incomplete_task_ids}, function(response) {
				console.log(response);
				document.location.href = "/#/dashboard";
			});
		}
		return false;
	});

	// block project
	$("#block-project").delegate(".btn-back", "click", function() {
		$("#block-project").fadeOut();
	});

	// run sammy
	app.run("#/dashboard");
	
	
	
});

// check all tasks in task list to see if project is completed
function check_for_completion()
{
	var $btn_complete = $("#btn-complete"),
		$tasks = $("#project .tasks li.task"),
		$complete_tasks = $("#project .tasks li.task.complete"),
		task_len = $tasks.length,
		complete_task_len = $complete_tasks.length,
		is_complete = false;
		
	if(complete_task_len >= task_len)
	{
		$btn_complete.removeClass("disable");
		is_complete = true;
	}
	else
	{
		$btn_complete.addClass("disable");
		is_complete = false;
	}
	
	return is_complete;
}

function check_for_verification()
{
	var $btn = $("#project .btn-project-status"),
		$tasks = $("#project .tasks li.task"),
		$complete_tasks = $("#project .tasks li.task.complete"),
		task_len = $tasks.length,
		complete_task_len = $complete_tasks.length,
		is_complete = false;
		
	if(complete_task_len >= task_len)
	{
		$btn.removeClass("incomplete");
		is_complete = true;
	}
	else
	{
		$btn.addClass("incomplete");
		is_complete = false;
	}
	
	return is_complete;
}

function change_page(page_id)
{
	$(".page").filter(function() {
		return $(this).attr("id") != page_id;
	}).fadeOut();
	
	$("#" + page_id).delay(300).fadeIn();
}

// sammy
var app = $.sammy(function() {
	// turn off logging
    Sammy.log = this.log = function() {};
	
	// routes
	this.get("#/dashboard", function() {
		change_page("dashboard");
		
		$.getJSON("/api/projects", function(json) {
			if(json.ok && json.projects)
			{
				$("#projects").html("").render_template({
					"name": "project",
					"data": json.projects,
					"complete": function() {
						$dashboard_lis = $("#dashboard").find("li").css({"opacity": 0});	
						$dashboard_lis.each(function(i) {
							$(this).delay(i * 150).animate({
								"opacity": 1
							}, 250);
						});		
					}
				});
			}
		});
	}).get("#/project/:project", function(context) { // project
		change_page("project");
		
		$.getJSON("/api/projects/" + context.params["project"], function(json) {
			if(json.ok && json.project)
			{
				$("#project").html("").render_template({
					"name": "project-detail",
					"data": json,
					"complete": function() {
						// setup categories
						utils.categories = utils.get_categories_for_page();
						utils.setup_categories();
						// check if all tasks are completed
						check_for_completion();
						
						if(context.params["token"])
						{							
							// verify token
							$.get("/api/projects/" + context.params["project"] + "/verify/" + context.params["token"], function(response) {
								if(response.ok) // valid token
								{
									$("#project").addClass("status-verification");
									$("#project .tasks li").removeClass("complete");
								}
								else // invalid token, show block
								{
									$("#block-project").show();
								}
							});							
						}
						else
						{
							if(json.project.is_complete)
							{
								$("#block-project").show();
							}
						}
					}
				});
			}
		});
	});
});

// UTILS
var utils = 
{
	sanitize_project_name: function(name) 
	{
		return name.toLowerCase().replace(/\s/, "-");
	},
	get_additional_stakeholders_count: function(stakeholders)
	{
		var max = 3,
			len = stakeholders.length;
		
		return (len > max) ? "plus " + (len - max) + " more" : "";
	},
	categories: [],
	setup_categories: function()
	{
		var categories = [];
		
		for(var i = 0, len = utils.categories.length; i < len; i++)
		{
			categories.push('<option value="' + utils.categories[i] + '">' + utils.categories[i] + '</option>');			
		}
		
		categories.push('<option value="-1">Create New Category</option>');
		
		$("#dd-category").html(categories.join(""));
	},
	get_categories_for_page: function() {
		var $categories = $("#project li.task .category"),
			categories = utils.categories,
			category = "";
		
		$categories.each(function() {
			category = $(this).text();
			if($.inArray(category, categories) == -1)
			{
				categories.push(category);
			}
		});
		
		return categories;
	}
};
// END UTILS
