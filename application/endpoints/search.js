var couchdb  = require('../libs/node-couchdb/lib/couchdb'),
    client   = couchdb.createClient(5984, 'localhost'),
    db       = client.db('unionpacific');
	
exports.endpoints = function(app)
{
	app.get('/users/:name', getUsers);
}

function getUsers(req, res, next)
{
	var name = req.params.name.toLowerCase();
	
	db.view("application", "search-users-by-name", {"include_docs":true, "startkey":name, "endkey":name+"\u9999"}, function(error, data)
	{
		if(error == null)
		{
			results = [];
			
			data.rows.forEach(function(row){
				results.push({"caption": row.doc.first + " " + row.doc.last, "value": row.doc._id})
				//results.push(row.doc);
			});
			
			next({"ok":true, "matches":results});
			
		}
		else
		{
			next({"ok":false, "message":error.message});
		}
	});
}