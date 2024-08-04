---
layout: post
title: "You've Gotta Love Deferreds"
---
Deferreds are awesome. They are such a simple solution to a really hard problem. Keeping things async in javascript can get hard sometimes. I recently wrote some code that looked like this:

``` javascript
var settings = {
	template: 'todo.hbs',
	data_src: '/todo.json'
};

var template;

var getting_template;
var getting_data;

if ('template' in settings) {
	getting_template = $.get(settings.template);

	getting_template.done(function(t) {
		template = t;
	});

	if ('data_src' in settings) {
		getting_data = $.get(settings.data_src);
		getting_data.done(function(data) {
			render(template, data);
		});
	} else {
		getting_template.done(function(t) {
			render(t, {});
		});
	}
} else {
	render('', {});
}
```

(I am pretty sure it wasn't necessarily as ugly but, I don't quite remember.)

As you can see, even though I am making use of the deferreds returned by the `$.get` function. This could be cleaned up a lot by using even more deferreds.

Here's more or less what the code ended up looking like:

``` javascript
var settings = {
	template: 'todo.hbs',
	data_src: '/todo.json'
};

var templateDefer = new $.Deferred();
var dataDefer; = new $.Deferred();

if ('template' in settings) {
	$.get(settings.template, function(template) {
		templateDefer.resolve(template);
	});
} else {
	templateDefer.resolve('');
}

if ('data_src' in settings) {
	$.get(settings.data_src, function(data) {
		dataDefer.resolve(data);
	});
} else {
	dataDefer.resolve({});
}

$.when(templateDefer, dataDefer).done(function(template, data) {
	render(template, data);
});
```

I basically kept everything async using stand-alone deferreds. Turns out jQuery has really handy deferred util built-in, all you have to do is create a new one (`new $.Deferred()`). The other handy thing built into jQuery is the `$.when` method, you can basically pass in a bunch of deferreds and you'd get a single one that responds when all of them respond in a particular way. That way, you can basically say, when they are all done, do this.

I shall try experimenting a lot more with these tools, they are pretty easy to use and pack in, so much functionality.
## Recommended links
Here's a couple of recommended links, in case you want to learn more about deffereds, in particular, those built into jQuery:

- [jQuery's Deferred Object Documentation](http://api.jquery.com/category/deferred-object/)
- [jQuery Deferreds promises asynchronous bliss](http://vvv.tobiassjosten.net/javascript/jquery-deferreds-promises-asynchronous-bliss/)
- [Promises A+ Spec](http://promises-aplus.github.io/promises-spec/)


