---
layout: post
title: "Organizing a Javascript MVC Project"
---

<p> 
I've been doing a lot of javascript development lately. My work as a frontend developer for Laureate has forced me to seriously how we organize the frontend code so it's easy to work with and hard for us to make mistakes.
</p>

<p>
As it stands, I developed the frontend structure of the project (I am not sure if I am allowed to share it) we are currently building. We use <a href="http://www.canjs.us">can.js</a> as our MVC framework of choice and use <a href="http://www.gruntjs.com/">grunt</a> to stick all the files together and check them for errors. All this, in the effort to be as agile as possible.
</p>

<p>
Coming up with a structure was pretty hard but, I think out current structure works pretty well. Our folder structure looks somewhat like this:
</p>

<pre>
    -Project
        -Application
            -Assets
                -Images
                -Css
            -Javascript
                -Models
                -Views
                -Controllers
                -libs
                    -Plugins
                    jQuery.js
                app.js
        -dist
            -app.min.js
            -libs.min.js
        index.html
        grunt.js
</pre>

<p>
It might look complicated, but it's actually fairly simple. I'll try to break it down, show how we use grunt to generate <code>app.min.js</code> and <code>libs.min.js</code> and how they all generally fit in together.
</p>

<h2>Folder &amp; File Structure</h2>
<p>
The folder structure is fairly straight forward. Inside the <code>Application</code> folder we hold all of our important files. The only important folder here is the one called <code>Javascript</code>, this is where we store all of our Models, Views and Controllers which at the end, make up our entire application. You can have more folders inside of these and grunt can still fetch all of their contents to build up the final files.
</p>

<p>
Here's what a raw controller inside this folder looks like:
</p>

<pre>
<code data-language="javascript">
;(function(namespace, undefined) {
  'use strict';
  var ControllerName = can.Control({
    'init': function(element, options) {
      var self = this;
      // Actual code stuff
    }
  });

  namespace.Controllers = namespace.Controllers || {};
  namespace.Controllers.ControllerName = ControllerName;
}(this));
</code>
</pre>

<p>
As you can see the only thing we are doing which isn't immediately obvious is to add the controller to the namespace's Controller object. In our case, this is the window object. This is great because we don't populate the global namespace with every single controller and because we can access any controller like this: <code>Controllers.ControllerName</code>. We do the same for models:
</p>

<pre>
<code data-language="javascript">
;(function(namespace, undefined) {
  'use strict';
  var ModelName = can.Model({
    findOne: 'GET /getModel'
  }, {});

  namespace.Models = namespace.Models || {};
  namespace.Models.ModelName = ModelName;
}(this));
</code>
</pre>

<p>
In our case, views are simple .ejs files so there's nothing special about how we define them, although you could compile them to javascript and tell grunt to minimize it along with the whole code which would probably faster to load in the long run.
</p>

<p>
Now that we have our files in place, let's move into using grunt to generate the finalized application files will be using in production.
</p>

<h2>Grunt</h2>
<p>Here's what an example grunt file would look like:</p>
<pre>
<code data-language="javascript">
module.exports = function(grunt) {
  grunt.initConfig({
    concat: {
      app: {
        src: [
          'Application/Assets/Javascript/controllers/**/*.js', 
          'Application/Assets/Javascript/models/**/*.js', 
          'Application/Assets/Javascript/app.js'
        ],
        dest: 'dist/app.js'
      },
      libs: {
        src: [
          'Application/Assets/Javascript/libs/jQuery.js', 
          'Application/Assets/Javascript/libs/plugins/**/*.js'
        ],
        dest: 'dist/libs.js'
      }
    },
    min: {
      app: {
        src: ['&lt;config:concat.app.dest&gt;'],
        dest: 'dist/app.min.js'
      },
      libs: {
        src: ['&lt;config:concat.libs.dest&gt;'],
        dest: 'dist/libs.min.js'
      }
    }
  });

  grunt.registerTask('default', 'concat min');
};
</code>
</pre>

<p>This particular grunt file doesn't do much. When you call the <code>grunt</code> command it'll concatenate all of the files in the javascript folder (except for the views) and all of the libraries into two files, libs.js and app.js (and their minimized equivalents). These can be included directly into the html to have the final application files.</p>

<h2>That's it</h2>
<p>I hope this is somewhat useful to someone, it actually took me a while to find something I was comfortable with so try experimenting with variations and let me know about it. This is how I currently do things but, I am sure there are places where I can improve the design. This mostly revolves around keeping the global namespace as clean as possible and making files that can be easily concatenated to save space when you have to finalized copy which, I think are generally good goals.</p>