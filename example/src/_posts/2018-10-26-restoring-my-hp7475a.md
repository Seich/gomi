---
layout: post
title: "Restoring my HP7475A to it’s former glory"
---

Recently I’ve become obsessed with generative art. As usual I dove in head first.
I love old HP gear so seeing the HP 7475a as one of the most recommended plotters
around made it a no brainer. Everyone seems to recommend avoiding getting one with
a HPIB port; This makes them a lot cheaper than their serial counterparts. I
managed to get one for 10 bucks!

![My HP7475a in all of it's current glory](/files/2018-10-26-restoring-my-hp7475a/hp7475a.jpeg)

A couple of weeks later it came in through the door. It’s a beautiful machine.
It’s big and built like a tank, it feels ridiculous. I love this machine. It
came with a couple of missing bits, the pen carousel was broken, it runs on top
of a Geneva drive and the small gear was broken (it actually pulverized when I
first tried moving it around).

<video playsinline muted="muted" autoplay="autoplay" preload="auto" loop="loop">
    <source src="/files/2018-10-26-restoring-my-hp7475a/gear-breaking.mp4" type="video/mp4">
</video>

Luckily Geneva drives are well documented and this one was a textbook example so
designing and 3D printing a replacement was super straightforward.

![The newly 3d printed replacement gear](/files/2018-10-26-restoring-my-hp7475a/new-gear.jpeg)

Once that was in the pen drive came back to life and worked brilliantly. It
seems to use bumping into the first position to figure out where it’s at making
it noisy and hilarious to use.

<script src="https://gumroad.com/js/gumroad.js"></script>

<a class="gumroad-button" href="https://gum.co/hp7475adrive">Download Geneva Drive</a>

<video playsinline muted="muted" autoplay="autoplay" preload="auto" loop="loop">
    <source src="/files/2018-10-26-restoring-my-hp7475a/new-gear-working.mp4" type="video/mp4">
</video>

Once the carousel was working as expected I could tackle a bigger issue, pens.
It turns out plotter pens aren’t nearly as common as one would hope. They are
hard to find and really expensive so I decided to figure out a more maintainable
solution. Luckily my plotter came with a couple of dried up pens and some
not-so-dried ones so I could use them to figure out what I should look up for in
a pen replacement. I first thought a ballpoint pen would be a good replacement,
they are cheap, easy to find and replace, and some draw pretty nice lines.

![A 3d printed ballpoint pen holder shaped like a plotter pen](/files/2018-10-26-restoring-my-hp7475a/ballpoint-holder.jpeg)

I 3D printed a ballpoint pen holder shaped like a plotter pen. I got a couple of
cheap ballpoint pens and stole their ink cartridges and went to town. It worked
well but the vibrations seem to yield some shaggy lines. I decided to try
something closer to the original next, I thought a felt tipped pen would
probably be a better closer-to-the-real-deal option so I made an adapter for one
of these Stabilo pens:

![A 3d printed plotter pen holder for a Stabilo pen](/files/2018-10-26-restoring-my-hp7475a/stabilo-holder.jpeg)

<a class="gumroad-button" href="https://seich.gumroad.com/l/qhiekx">Download Stabilo Adapter</a>

At the end I really liked how the ballpoint pen worked but I think I can still
get a better line out of a finer Stabilo pen. Yet to test it so it'll have to
wait for a later post.

<video playsinline muted="muted" autoplay="autoplay" preload="auto" loop="loop">
    <source src="/files/2018-10-26-restoring-my-hp7475a/ballpoint-pen-plot.mp4" type="video/mp4">
</video>

## HPIB

HPIB is an awesome little protocol that’s not very common outside of test
equipment. The adapters are weird and expensive. If you have old test equipment
lying around you might benefit from getting one along with a new plotter just
cause. Don’t let that scare you away. I personally use an old prologix HPIB to
Serial USB adapter and it works great. No regrets. Don't destroy an old plotter
before giving this a go.
