var hashlib = require("../libs/hashlib");
var Task = function(name)
{
	this.name          = name ? name : null;
	this.is_complete   = false; 
	this.category      = null;
	this.type          = "task";
	this.created_on    = new Date();
}

Task.prototype.generateId = function()
{
	this._id = hashlib.md5(JSON.stringify({category:this.category.toLowerCase(), name:this.name.toLowerCase()}));
}

module.exports = Task;