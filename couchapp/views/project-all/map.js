function(doc)
{
	if(doc.type == "project")
	{
		emit([doc.name, doc.created_on], null);
	}
}