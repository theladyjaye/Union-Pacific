var phui = phui || {};

phui.utils = 
{
	querystring_to_object: function(querystring)
	{
		var result = {};
		
		querystring.replace(/([^=&]+)=([^&]*)/g, function(match, key, value) {
			result[unescape(key)] = unescape(value);
		});
		
		return result;
	}
};