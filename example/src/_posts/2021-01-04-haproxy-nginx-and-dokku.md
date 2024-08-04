---
layout: post
title: "Haproxy, Nginx and Dokku"
---

I just finished setting up a wordpress site for my sister over the past weekend.
I usually setup some plugins to automatically block bruteforce attempts on these
since they are so common. Everything went smooth as usual until I checked in on
it the next morning and found myself blocked. I checked the logs and it turns
out it banned the reverse proxy's ip.

I am using Haproxy as a reverse proxy / load balancer for the entire server but
the ssl is handled by dokku which means Haproxy runs in tcp mode and doesn't do
much other than route the traffic. Dokku also has a reverse proxy which it uses
to handle domains, it uses Nginx for this.

It turns out Haproxy can't add requests to an https request that terminates on a
different server. This makes sense but wasn't obvious from the get go, the easy
solution was to use the proxy protocol so that Haproxy and Nginx can agree on
which ip is which.

Here's how to do it:

First, we need to tell Haproxy to use the proxy protocol. All we have to do is
add `send-proxy` to the server option. This will send over all of the info Nginx
will need to find the correct ip.

```
backend web
        mode tcp
        server web-http dokku send-proxy
```

Next we need to tell Nginx to actually use that info. This is done by adding the
`proxy_protocol` parameter to the listen option.

```
server {
  listen      443 ssl proxy_protocol http2;
  ...
}
```

Finally, we need to set the request's `X-Forwarded-For` header to the real ip.
We can achieve this by adding a new conf file in
`/etc/nginx/conf.d/set_real_ip.conf`. You can name it whatever you want, it
should look something like this:

```
set_real_ip_from  10.0.0.0/8;
set_real_ip_from  172.0.0.0/8;
real_ip_header proxy_protocol;
```

You should list off all of the proxies that are part of the chain here.
`proxy_protocol` will take care to set the `X-Forwarded-For` ip to the correct
value automatically.
