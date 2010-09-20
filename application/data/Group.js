var Group = function() {
  	this.name          = null;
	this.items         = [];
	this.type          = "group";
	this.created_on    = new Date();
};

Group.prototype.addTask = function(task)
{
	task.category = this.name;
	task.generateId();
	this.items.push(task);
}

module.exports = Group;