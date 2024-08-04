---
layout: post
title: "Installing Gitea on Dokku"
---

I've been meaning to backup my GitHub repos somewhere for a while. I recently
discovered that Gitea can mirror them and will keep them updated. I am running
Dokku on my dedicated server and pretty much run everything I can think of
there. Gitea was a bit tricky to install so here are some notes.

You start by creating the app:

```
; dokku app:create gitea
```

Once that's done, we can initialize it from the docker image:

```
; dokku git:from-image gitea gitea/gitea:latest
```

This is a good time to set the correct domain name and mount the Gitea
directories.

```
; dokku domains:add gitea git.example.org
; dokku storage:ensure-directory gitea
; dokku storage:mount gitea /var/lib/dokku/data/storage/gitea:/data
```

We can rebuild the app now:

```
; dokku ps:rebuild gitea
```

Dokku will get some ports wrong sometimes, we should check those:

```
; dokku proxy:report gitea
=====> gitea proxy information
       Proxy enabled:                 true
       Proxy port map:                http:22:22 http:3000:3000
       Proxy type:                    nginx

```

Those look somewhat wrong, lets fix them:

```
; dokku proxy:ports-remove gitea http:3000:3000 http:22:22
; dokku proxy:ports-add gitea http:80:3000
```

We can enable LetsEncrypt now:

```
; dokku letsencrypt:enable gitea
```

That's pretty much it! Seems a lot simpler once I've written it down.
If you want to change the config file you can go ahead and edit it + restart the
app:

```
; sudo vim /var/lib/dokku/data/storage/gitea/gitea/conf/app.ini
; dokku ps:restart gitea
```

Cheers!
