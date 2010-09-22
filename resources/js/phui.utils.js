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
	},	
	format_time: function(date)
	{
		date = new Date(date);

		var hours = date.getHours() + 1,
			minutes = date.getMinutes().toString(),
			meridian = "am";

 		if(hours > 12)
		{
			hours = hours % 12;
			meridian = "pm";
		}

		if(minutes.length < 2)
		{
			minutes = "0" + minutes;
		}

		return hours + ":" + minutes + " " + meridian;
	},
	elapsed_time: function(created_at)
	{
		var now 	= new Date(),
			created = new Date();

		created.setFullYear(created_at.substr(0, 4));
		created.setMonth(created_at.substr(5, 2) - 1);
		created.setDate(created_at.substr(8, 2));
		created.setHours(created_at.substr(11, 2));
		created.setMinutes(created_at.substr(14, 2));
		created.setSeconds(created_at.substr(17, 2));			

		now.setHours(now.getHours() - 1);
		var age_in_seconds = (now.getTime() - created.getTime()) / 1000;

		var s = function(n) { 
			return n == 1 ? '' : 's' 
		};

	    if (age_in_seconds < 0) 
		{
	        return 'just now';
	    }
	    if (age_in_seconds < 60) 
		{
	        var n = age_in_seconds;
	        return n + ' second' + s(n) + ' ago';
	    }
	    if (age_in_seconds < 60 * 60) 
		{
	        var n = Math.floor(age_in_seconds/60);
	        return n + ' minute' + s(n) + ' ago';
	    }
	    if (age_in_seconds < 60 * 60 * 24) 
		{
	        var n = Math.floor(age_in_seconds/60/60);
	        return n + ' hour' + s(n) + ' ago';
	    }
	    if (age_in_seconds < 60 * 60 * 24 * 7)
	 	{
	        var n = Math.floor(age_in_seconds/60/60/24);
	        return n + ' day' + s(n) + ' ago';
	    }
	    if (age_in_seconds < 60 * 60 * 24 * 31) 
		{
	        var n = Math.floor(age_in_seconds/60/60/24/7);
	        return n + ' week' + s(n) + ' ago';
	    }
	    if (age_in_seconds < 60 * 60 * 24 * 365) 
		{
	        var n = Math.floor(age_in_seconds/60/60/24/31);
	        return n + ' month' + s(n) + ' ago';
	    }
	    var n = Math.floor(age_in_seconds/60/60/24/365);

	    return n + ' year' + s(n) + ' ago';
	}
};