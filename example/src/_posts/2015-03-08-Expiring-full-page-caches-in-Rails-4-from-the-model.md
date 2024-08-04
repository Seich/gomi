---
layout: post
title: "Expiring full-page caches in Rails 4 from the model"
---

Recently I was struggling with Rail’s full-page cache. Ever since it was moved out of core I can’t seem to get sweepers to work correctly. After fiddling around for several hours I finally found the best solution possible (excluding sweepers, that is), invalidating the cache on the model’s callbacks. Here’s how it looks:

``` ruby
class Ad < ActiveRecord::Base
  after_save :clear_cache
  after_destroy :clear_cache

  def clear_cache
        ActionController::Base.expire_page('/ads.json')
  end
end
```

There’s a couple of gotchas:

1. You can’t use the nice syntax that’s available on controllers when you use `expire_page`, you have to pass the route to the file as a string. I couldn’t get it to work any other way (You could use url helpers to come up with this route, I suppose).
2. You have to make sure to expire any additional pages that might have changed base on the model’s relationship since this won’t handle it for you.

Other than these 2 things it’s pretty straight-forward and easy to use. I hope I don’t have to use full page caching again any time soon.
