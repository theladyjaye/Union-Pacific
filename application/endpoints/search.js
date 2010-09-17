var couchdb  = require('../libs/node-couchdb/lib/couchdb'),
    client   = couchdb.createClient(5984, 'localhost'),
    db       = client.db('unionpacific');
	
exports.endpoints = function(app)
{
	app.get('/users/:name', getUsers);
}

function getUsers(req, res, next)
{
	db.view("application", "search-users-by-name", {"include_docs":true, "startkey":req.params.name, "endkey":req.params.name+"\u9999"}, function(error, data)
	{
		if(error == null)
		{
			results = [];
			
			data.rows.forEach(function(row){
				results.push(row.doc);
			});
			
			next({"ok":true, "matches":results});
		}
		else
		{
			next({"ok":false, "message":error.message});
		}
	});
}