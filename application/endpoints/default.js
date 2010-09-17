exports.defaultResponse = function(req, res, next)
{
	next({"ok":true, "message":"Welcome to Union Pacific", "version":"0.1"});
}

exports.renderResponse = function(err, req, res, next)
{
	if(err)
		data = err;
	
	var out  = JSON.stringify(data);
		res.writeHead(200, {
			'Content-Type': 'text/html',
			'Content-Length': out.length
		});
		res.end(out, 'utf8');
}

