---
layout: post
title: "Using mailgun to receive emails with Phabricator"
---
[Phabricator](http://phabricator.com) is awesome. We recently started trying it out for [2build.it](http://2build.it) (more like, this morning) and we all ([Jorge](http://jorge.caballeromurillo.com) and I) agreed it's awesome. 

The setup is pretty straight-forward and only took like 20 minutes. The one thing I got stuck on though, was the emailing. It took me forever to realise that you're supposed to restart the emailing daemons for the configuration to stick. It is my fault but, this wasn't mentioned anywhere in the documentation. Btw, here's how you do it:

	./bin/phd restart

Right from the Phabricator folder.

Moving on.

Now that sending was settled there was one huge thing that wasn't working. Inbound emails. I tried working with postfix but, it was too painful and after a couple of hours I didn't get anywhere. The [documentation](https://secure.phabricator.com/book/phabricator/article/configuring_inbound_email/) talks about using sendgrid to achieve it but, I already have a mailgun account and according to the configuration Phabricator should be able to use mailgun as well. So, I had to do some research.

It turns out you can use mailgun to do this but, there's zero documentation about it. Luckily, I found the [commit](https://secure.phabricator.com/rPa9612fac24a9eb97ad3f611d84dfedbce98d17ad) where this functionality was added and figured it out on my own. Here's the three step guide to getting it done.

## Step 1
You have to configure you domain's MX records to point to mailgun. You can find more information [here](http://documentation.mailgun.com/user_manual.html#verifying-your-domain).

## Step 2
Go to your setup your mailgun configuration by going to the mailgun config (http://example.com/config/group/mailgun/) and adding your API key and your domain.

## Step 3
We're almost done. Now, all we have to do is tell mailgun to send received emails your way. To do this all you have to do is create a new route (go here: [https://mailgun.com/cp/routes](https://mailgun.com/cp/routes)). Give it a priority and a filter that'll work for you (I used 0 as a priority and `catch_all()` for a filter). For the action, forward it to your Phabricator installation with the endpoint '/mail/mailgun'. Like this: `forward("http://example.com/mail/mailgun/")`.


That is all. Your emails should now allow you to interact with Phabricator.