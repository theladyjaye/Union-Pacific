$(function() {		
	// setup jq modal
	$(".jqmWindow").jqm();
	
	// setup user autocomplete
	$.facebooklist('#stakeholders', '#preadded', '#facebook-auto',{url:'/api/search/users',cache:1}, 10, {userfilter:0,casesensetive:0});

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
			$.post("/api/projects", $("#frm-add-project").serialize(), function(response) {
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
						
					}
				});
			}
		});
	});
	
	/*.get("#/schedule", function() {
		// reset form
		$("#frm-new-game")[0].reset();
		
		$.getJSON("/games", function(json) {
			if(json.ok && json.games)
			{
				var $dd_game = $("#dd-game").html("");
				
				for(var i = 0, len = json.games.length, game; i < len; i++)
				{
					game = json.games[i];

					$("<option />", {
						"value": game._id.split("/")[1],
						"html": game.label + " | " + utils.get_console(game.platform).toUpperCase()
					}).appendTo($dd_game);
				}
				change_page("schedule");			
			}
		});
	}).get("#/profile", function() {
		$.post("/matches/scheduled", {username: "xXHitmanXx"}, function(json) {
			if(json.ok)
			{
				$("#profile .game-table").html("").render_template({
					"name": "match",
					"path": template_path,
					"data": {"matches": json.matches,
							 "is_profile": true
							},
					"complete": function() {
						change_page("profile");			
					}
				});
			}
		}, 'json');
	});
	*/
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
	}
};
// END UTILS
