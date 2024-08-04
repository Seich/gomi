---
layout: post
title: "A Semantic Grid with Zurb's Foundation"
---

<p><a href="http://foundation.zurb.com">Foundation</a> is great. I love it, I use it whenever I am building anything big. My favorite feature and the one key thing that has kept me as a fan for so long has been it's grid. I feel like it's the best grid we have available so far.</p>

<p>
    My favorite thing about that grid you ask? Apart from just being plainly awesome? Well, it's the semantic option. I know you probably haven't put much thought into it but, don't you feel like grid classes tend to clutter the html? I do, and I hate it. Enter the mixins!
</p>

<h2>The Mixins</h2>
<p>
    To alleviate this issue, Foundation gives us a set of really handy mixins which allow you to build a really semantic grid. It's as flexible as it can be and just as easy to use (I'd argue that if you're familiar with sass, it's just plainly easier and requires less typing).
</p>

<p>To demonstrate, I'll be showing you how to build this:</p>
<div>
    <img src="http://f.cl.ly/items/08411t3C1f393p3W2B0G/Screen%20Shot%202013-10-11%20at%2012.45.18%20PM.png" alt="Demo">
</div>

<p>As you can see, it's a very simple layout. It'd be really easy to build it using the grid classes, it's even easier to build it using the mixins. Here's my markup:</p>

``` html
<article>
  <header>
    <h1>Hello World</h1>
  </header>

  <div>
      <img src="http://lorempixel.com/300/400/">
  </div>

  <p>
    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Exercitationem, voluptatibus, deserunt, facilis iusto sapiente impedit praesentium laudantium minus voluptas numquam incidunt corrupti sequi laboriosam magnam officia perspiciatis quas quam quaerat!
  </p>
</article>
```
<p>As you can see it's pretty standard except the elements lack classes and such. Much prettier than usual in my opinion.</p>

<p>Here's my CSS:</p>

``` scss
@import "foundation/components/global";
@import "foundation/components/grid";

$total-columns: 5;
article {
  @include grid-row;

  header {
    @include grid-row;

    h1 {
      @include grid-column(5);
    }
  }

  div {
    @include grid-column(2);
  }

  p {
    @include grid-column(3);
  }
}
```

<p>Awesome, right? Here I am the grid-column and grid-row mixins to create the grid directly in my CSS. All you have to do is import the mixins. There are also many options to customize the grid, in this case I changed the number of columns from the default 12, to 5. I am also nesting rows, all from the CSS, leaving the HTML to describe it's thing. </p>

<h3>Side note:</h3>
<p>I hadn't notice that in this case you're putting a row directly inside another row, this isn't ideal as it can cause alignment issues. Ideally you'd have the header inside full width column to prevent this. I don't think it matters in this example but in anything more complex it might be a pain to debug.</p>

<p>Thanks to <a href="https://twitter.com/smiley">@smiley</a> for the heads up!</p>

<h2>Conclusion</h2>
<p>I feel like this technique is a great way to simplify the HTML and further decouple it from it's CSS. They've been several similar things before such as the <a href="http://semantic.gs/">Semantic Grid</a> which experimented with this idea. Foundation has a much more powerful grid so, it being able to work this way as well makes me really happy.</p>
