module.exports = function Task(name)
{
	this.name          = name ? name : null;
	this.is_complete   = false; 
	this.category      = null;
	this.type          = "task";
	this.created_on    = new Date();
}