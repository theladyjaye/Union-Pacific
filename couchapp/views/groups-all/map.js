function(doc)
{
	if(doc.type == "group")
	{
		emit(doc._id, null);
	}
}