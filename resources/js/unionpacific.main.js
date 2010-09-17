$(function() {		
	// run sammy
	app.run("#/dashboard");
	
});

function change_page(page_id)
{
	$(".page").filter(function() {
		return $(this).attr("id") != page_id;
	}).fadeOut();
	
	$("#" + page_id).delay(300).fadeIn();
	
	change_nav(page_id);
}

function change_nav(page_id)
{
	$("#nav").find("a").removeClass("on");
	$("#nav a[href=#/" + page_id + "]").addClass("on");
}

// sammy
var app = $.sammy(function() {
	// turn off logging
    Sammy.log = this.log = function() {};
	
	// routes
	this.get("#/dashboard", function() {
		change_page("dashboard");
		/*
		$.getJSON("/matches", function(json) {
			if(json.ok && json.matches)
			{
				$("#lobby .game-table").html("").render_template({
					"name": "match",
					"data": {"matches": json.matches},
					"complete": function() {
						change_page("lobby");			
					}
				});
			}
		});
		*/
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
