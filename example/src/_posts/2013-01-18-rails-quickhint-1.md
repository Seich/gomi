---
layout: post
title: "Creating a model while skipping validations in Rails"
---

This certainly needs some background. I've been working on a random rails project for the better part of the last couple of months.
This project uses devise to manage logins and user registration. Recently registrations started failing in the site which, didn't
make sense since they had been working fine for a while. So I started digging into it.

According to rails the user url didn't exist so it couldn't redirect back to the homepage after a successful registration.
After much digging around the stack trace I finally figured it out. Turns out that when a devise user is created a user profile is created along with it(this is specific to my application). But, that's normal, what started causing problems was that the profile had a validation for a unique username, which blank, wasn't (since the username is only supposed to be set after registration).

So, what's the solution? Easy, all I had to make sure of was that when I created the user profile I disabled validations for the user profile model. Here's how I did it:

<p>user.rb</p>

``` ruby
class User < ActiveRecord::Base
  after_create :create_profile
  has_one :user_profile, :dependent => :destroy

  def create_profile
    self.build_user_profile
    self.user_profile.save(:validate => false)
  end
end
```

<p>user_profile.rb</p>
``` ruby
class UserProfile < ActiveRecord::Base
  belongs_to :user

  attr_accessible :username
  validates_uniqueness_of :username
end
```
<p>This bug took around 2 hours to fix, I guess not all errors in rails are as descriptive and easy to follow as they should. But at the end of it all, it's my fault for not paying attention.</p>
