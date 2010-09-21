$(function() {		
	// setup jq modal
	$(".jqmWindow").jqm();
	
	// setup user autocomplete
//	$.facebooklist('.fbk-stakeholders', '#preadded', '#facebook-auto',{url:'/api/search/users',cache:1}, 10, {userfilter:0,casesensetive:0});
	
	var t5 = new $.TextboxList('#fbk-stakeholders-project', {unique: true, plugins: {autocomplete: {
						minLength: 1,
						queryRemote: true,
						remote: {url: '/api/search/users'}
					}}});
	
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
		
		utils.categories = json.groups;
		
		for(var i = 0, len = json.groups.length; i < len; i++)
		{
			group = json.groups[i];
			output.push('<input type="checkbox" name="groups" value="' + group._id + '" />' + group.name);
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
					
					// add new category to list
					//utils.categories.push({response.id: obj.category});
					
					$(".jqmWindow").jqmHide();
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
			$task = $this.parents(".task"),
			task_id = $task.attr("id"),
			status = $task.hasClass("complete") ? "incomplete" : "complete",
			project_id = document.location.hash.split("/").slice(-1);
		
		$.post("/api/projects/" + project_id + "/checklist/" + task_id + "/" + status, function(response) {
			$task.toggleClass("complete");
		});
		
		return false;
	}).delegate(".task .btn-delete", "click", function() {
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
					});
				}
			});
		}
		return false;
	}).delegate(".btn-add-task", "click", function() {
		var $frm = $("#frm-add-task");
		
		$frm[0].reset();
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
	});

	// run sammy
	app.run("#/dashboard");
	
});

function change_page(page_id)
{
	$(".page").filter(function() {
		return $(this).attr("id") != page_id;
	}).fadeOut();
	
	$("#" + page_id).delay(300).fadeIn();
	
	//change_nav(page_id);
}
/*
function change_nav(page_id)
{
	$("#nav").find("a").removeClass("on");
	$("#nav a[href=#/" + page_id + "]").addClass("on");
}
*/

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
					"data": json.project,
					"complete": function() {
						// setup categories
						utils.setup_categories();
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
			categories.push('<option value="' + utils.categories[i].name + '">' + utils.categories[i].name + '</option>');			
		}
		
		categories.push('<option value="-1">Create New Category</option>');
		
		$("#dd-category").html(categories.join(""));
	}
};
// END UTILS
