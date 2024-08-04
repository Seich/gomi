---
layout: post
title: "Hiding elements when they lose focus with jQuery"
---

There's no standard way of hiding an element when it loses it's 'focus' using Javascript or jQuery. Here's how I've been  doing it lately:

``` javascript
$(".userMenu a").on("click", function() {
  $(".loginForm").stop().fadeToggle(100, "linear", function() {
    $("body").on("click.loginform", function(e) {
      if($(e.target).parents('.loginForm, .userMenu').length === 0) {
        $('.loginForm').fadeToggle(100);
        $("body").off(".loginform");
      }
    });
  });
});
```

As you can see, it's fairly straight forward. Basically, when you click the button that shows the element, it toggle's the target element's visibility. When it is visible, an event is bound to the body, so whenever it is clicked, it checks if the click was on the element or if it wasn't. If it wasn't on the element, we hide the element and remove the event from the body. If it was on the element, nothing happens.

So far, I like this method a lot, mostly because it is simple and gets things done quickly.
