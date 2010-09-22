module.exports = function Project()
{
	this.name          = null;
	this.is_complete   = false;
	this.stakeholders  = [];
	this.checklist     = [];
	this.type          = "project";
	this.created_on    = new Date();
}