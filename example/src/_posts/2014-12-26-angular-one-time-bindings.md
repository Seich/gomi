---
layout: post
title: "Angular.js One-way bindings"
---
This week I discovered One-way bindings in Angular.

Angular's one-way bindings are a great way to improve your app's performance. Here's what the documentation says about them:

<blockquote>
	<p>
	One-time expressions will stop recalculating once they are stable, which happens after the first digest if the expression result is a non-undefined value.
	</p>
	-<cite><a href="https://docs.angularjs.org/guide/expression#one-time-binding">Expressions, Angular Developer Guide</a></cite>
</blockquote>
	
This means that by using them, once the value is not undefined, the bound value is removed from the watch list and thus isn't processed anymore during the digest cycle.

{% raw %}
The syntax is pretty straight forward and very easy to use. All you have to do is prepend `::` before the value in the binding like this: `{{ ::user.name }}`. Once the value is set to the user's name, it won't be watched for changes anymore.
{% endraw %}

Great, huh?

You can use them as part of expressions and directives as well so, go crazy!

## Read More!

[Exploring Angular 1.3: One-time bindings](http://blog.thoughtram.io/angularjs/2014/10/14/exploring-angular-1.3-one-time-bindings.html)

[One-time binding, Angular Developers Guide](https://docs.angularjs.org/guide/expression#one-time-binding)
	