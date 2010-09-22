/* Copyright (c) 2009 Marak Squires - http://github.com/marak/node_mailer
 
Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:
 
The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.
 
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/


var tcp = require('net');
var sys = require('sys');

var email = {
  send: function (options) {
    var options      = typeof(options)          == "undefined" ? {} : options;
    options.to       = typeof(options.to)       == "undefined" ? "marak.squires@gmail.com" : options.to;
    options.toName   = typeof(options.toName)   == "undefined" ? "" : options.toName;
    options.fromName = typeof(options.fromName) == "undefined" ? "" : options.fromName;
    options.from     = typeof(options.from)     == "undefined" ? "obama@whitehouse.gov" : options.from;
    options.subject  = typeof(options.subject)  == "undefined" ? "node_mailer test email" : options.subject;
    options.body     = typeof(options.body)     == "undefined" ? "hello this is a test email from the node_mailer" : options.body;  
    options.host     = typeof(options.host)     == "undefined" ? "localhost" : options.host;
    options.domain   = typeof(options.domain)   == "undefined" ? "localhost" : options.domain;
    options.port     = typeof(options.port)     == "undefined" ? 25 : options.port;
        
    var self = this;

    var connection = tcp.createConnection(options.port, options.host);
    connection.setEncoding('utf8');
    connection.addListener("connect", function () {
      connection.write("helo " + options.domain + "\r\n");
      
      if(options.authentication === "login") 
      {
        connection.write("auth login\r\n");
        connection.write(options.username + "\r\n");
        connection.write(options.password + "\r\n");
      }
      
      connection.write("mail from: " + options.from + "\r\n");
      connection.write("rcpt to: " + options.to + "\r\n");
      connection.write("data\r\n");
      connection.write("From: " + options.fromName + "<" + options.from + ">\r\n");
      connection.write("To: " + options.toName + "<" + options.to + ">\r\n");
      connection.write("Subject: " + options.subject + "\r\n");
      connection.write("Content-Type: text/html\r\n");
      connection.write("\r\n");
      connection.write(email.wordwrap(options.body) + "\r\n");
      connection.write(".\r\n");
      connection.write("quit\r\n");
      connection.end();
    });

    connection.addListener("data", function (data) 
	{
		if(!email.parseResponse(data))
			sys.puts("ERR " + data);
    });
  },

	parseResponse:function(data)
	{
		// SMTP Replies:
		// http://www.greenend.org.uk/rjk/2000/05/21/smtp-replies.html
		
		var d = data.trim().split("\r\n");
		var commandStatus = true;
		
		d.forEach(function(item)
		{
			var replyCode = parseInt(item.substr(0, 3));
			switch(replyCode)
			{
				case 200: // (nonstandard success response, see rfc876)
				case 211: // System status, or system help reply
				case 214: // Help message
				case 220: // <domain> Service ready
				case 221: // <domain> Service closing transmission channel
				case 250: // Requested mail action okay, completed
				case 251: // User not local; will forward to <forward-path>
				case 354: // Start mail input; end with <CRLF>.<CRLF>
					commandStatus = commandStatus && true;
					break;
					
				default:
					commandStatus = false;
					break;
				/*
				case 421: // <domain> Service not available, closing transmission channel
				case 450: // Requested mail action not taken: mailbox unavailable
				case 451: // Requested action aborted: local error in processing
				case 452: // Requested action not taken: insufficient system storage
				case 500: // Syntax error, command unrecognised
				case 501: // Syntax error in parameters or arguments
				case 502: // Command not implemented
				case 503: // Bad sequence of commands
				case 504: // Command parameter not implemented
				case 521: // <domain> does not accept mail (see rfc1846)
				case 530: // Access denied (???a Sendmailism)
				case 550: // Requested action not taken: mailbox unavailable
				case 551: // User not local; please try <forward-path>
				case 552: // Requested mail action aborted: exceeded storage allocation
				case 553: // Requested action not taken: mailbox name not allowed
				case 554: // Transaction failed
					return false;
				*/
			}
		});
		
		return commandStatus;
  },
  
  wordwrap:function(str){
    var m = 80;
    var b = "\r\n";
    var c = false;
    var i, j, l, s, r;
    str += '';
    if (m < 1) {
      return str;
    }
    for (i = -1, l = (r = str.split(/\r\n|\n|\r/)).length; ++i < l; r[i] += s) {
      for(s = r[i], r[i] = ""; s.length > m; r[i] += s.slice(0, j) + ((s = s.slice(j)).length ? b : "")){
        j = c == 2 || (j = s.slice(0, m + 1).match(/\S*(\s)?$/))[1] ? m : j.input.length - j[0].length || c == 1 && m || j.input.length + (j = s.slice(m).match(/^\S*/)).input.length;
      }
    }
    return r.join("\n");
  }
}

exports.send = email.send;
