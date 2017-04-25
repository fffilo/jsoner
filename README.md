JSONer
======

Render JSON objects in HTML with a collapsible navigation...

#### Usage

	var o = { foo: "bar" }
	var j = new JSONer(o);
	document.body.appendChild(j.toElement());
