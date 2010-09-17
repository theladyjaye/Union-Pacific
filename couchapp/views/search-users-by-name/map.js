function(doc)
{
	if(doc.type == "user")
	{
		emit(doc.first.toLowerCase() + " " + doc.last.toLowerCase(), null);
	}
}