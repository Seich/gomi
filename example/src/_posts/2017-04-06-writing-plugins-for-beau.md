---
layout: post
title: "Writing Plugins for Beau"
---

Currently Beau allows plugins to do two different transformations. You can change the request settings right before they are used to make the request and you can transform the response after the request is finished. This covers all use cases I've come up with so far. I'll go over the basics or writing a plugin in this post.

## The Plugin
The first step is writing the plugin. A Beau plugin is a Javascript class that defines any of these methods: `preRequest(requestSettings, originalRequest)` and `postResponse(response)`. They can also receive settings as part of their `beau.yml`configuration. Here's the basic skeleton for a new plugin:

``` javascript
class MyPlugin {
    constructor(settings = {}) {
        this.settings = settings;
    }

    preRequest(req, orig) {}

    postResponse(res) {}

}

module.exports = MyPlugin;
```

All you are missing is a basic `package.json` to finish the module (just run `npm init` and go through the steps). Once that's done you can install your plugin globally and use it as part of your `beau.yml` like this:

 ``` yaml
Host: http://localhost:9000
    plugins:
        - MyPlugin:
            data:
                name: Sergio
            secret: ssh

GET /profile:
    alias: profile

GET /:
    skip_jwt: true
    alias: home
```

Our plugin will generate a jwt using the secret and data settings and send that along with every request. If `skip_jwt: true` is part of the request's configuration it won't attach the header. First I'll install `jsonwebtoken`:

    npm install jsonwebtoken -S

Now all I need is to modify the preRequest so that it changes the headers and includes an Authorization with the bearer token:

``` javascript
preRequest(req, orig) {
    let token = jwt.sign(this.settings.data || {}, this.settings.secret);

    req.headers.Authorization = `Bearer ${token}`;
}
```

This will attach the authorization header to every request. We should also handle the case were certain requests don't need the  header. In this case, I'll just check if the original request configuration has the field:

``` javascript
preRequest(req, orig) {
    if (orig.skip_jwt) {
        return;
    }

    let token = jwt.sign(this.settings.data || {}, this.settings.secret);

    req.headers.Authorization = `Bearer ${token}`;
}
```

That's it. Like I said before, it's pretty simple. This plugin as-is allows us for automatic token generation for certain requests. We can get as fancy or keep it as simple as we want. For now, I'll publish that plugin as [beau-jwt](https://github.com/Seich/beau-jwt) and will make more improvements as I see fit.

## Conclusion
Writing a plugin is pretty easy. Beau doesn't really do much so modifying requests is pretty straightforward and allows for nice, clean configuration files. Hopefully someone will think of cool things to do with these.
