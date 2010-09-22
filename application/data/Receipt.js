module.exports = function Receipt()
{
	this.user          = null;
	this.project       = null;
	this.type          = "receipt";
	this.verified_on   = null;
	this.created_on    = new Date();
}