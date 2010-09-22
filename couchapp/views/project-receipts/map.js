function(doc)
{
	if(doc.type == "receipt")
	{
		emit([doc.project, doc.user], null);
	}
}