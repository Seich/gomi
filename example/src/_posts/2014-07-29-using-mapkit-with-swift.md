---
layout: post
title: "Using MapKit with Swift"
redirect_from:
  - /2014/08/29/using-mapkit-with-swift.html
---
I've been using Swift a lot lately. I wanted to start making iOS apps a while ago but Objective-C is frankly, not worth the trouble. Swift on the other hand is actually fun to use and I love experiencing how the language evolves.

This weekend I started working on a small app I've wanted for a while but got stuck when it came to implementing a map with MapKit. I couldn't find documentation or code samples on how to do it anywhere. Turns out that it's not hard at all! It took very little fiddling around before I figured it out. Here's how I did it:

## First, create a new project
I started with a __Single View Application__.

![New Project Screen](/files/2014-07-29-using-mapkit/step_1.png)
Then added a MKMapView to the view controller. After that, imported `MapKit` into the view controller's code. Finally, I added a new reference outlet to the map called _map_.


<video controls>
    <source src="/files/2014-07-29-using-mapkit/swiftmaps_step_1.mp4" type="video/mp4; codecs=avc1.42E01E,mp4a.40.2">
    <source src="/files/2014-07-29-using-mapkit/swiftmaps_step_1.webm" type="video/webm; codecs=vp8,vorbis">
</video>

## Setup your desired location
Now our map is ready to display a location. You'll need a couple of things to set it to the right place. First, you need a location in the form of a latitude and longitude and a CLLocationCoordinate2D.

``` swift
var location = CLLocationCoordinate2D(
    latitude: 16.40,
    longitude: -86.34
)
```

Now, we need to tell the map what the area spanned by the region is. For this we use `MKCoordinateSpanMake`. Which, as you probably guessed, creates a `MKCoordinateSpan`.

``` swift
var span = MKCoordinateSpanMake(1, 1)
```

After that we just need to define the region using these two things:

``` swift
var region = MKCoordinateRegion(center: location, span: span)
```

And finally, we set this region to the map:

``` swift
map.setRegion(region, animated: true)
```

## Bonus: Adding an annotation
Adding an annotation is actually quite easy. We start by creating a new MKPointAnnotation instance. It'll display the default red pin which, might not be as pretty but it'll get the job done.

``` swift
var annotation = MKPointAnnotation()
```

Afterwards, we can set it's coordinates, title and subtitle to place it wherever we want and to add the text it's callout will display when tapped.

``` swift
annotation.coordinate = location
annotation.title = "Roatan"
annotation.subtitle = "Honduras"
```

Finally, we add it to the map like this:

``` swift
map.addAnnotation(annotation)
```

Here's my final code:

``` swift
import UIKit
import MapKit

class ViewController: UIViewController {

    @IBOutlet weak var map: MKMapView!
    override func viewDidLoad() {
        super.viewDidLoad()

        var location = CLLocationCoordinate2D(
            latitude: 16.40,
            longitude: -86.34
        )

        var span = MKCoordinateSpanMake(0.5, 0.5)
        var region = MKCoordinateRegion(center: location, span: span)

        map.setRegion(region, animated: true)

        var annotation = MKPointAnnotation()
        annotation.coordinate = location
        annotation.title = "Roatan"
        annotation.subtitle = "Honduras"

        map.addAnnotation(annotation)
    }
}
```

And here's what my app looks like:
<img src="/files/2014-07-29-using-mapkit/final.png" alt="Final product" class="small">
## Additional Resources

[Location and Maps Programming Guide](https://developer.apple.com/library/ios/documentation/userexperience/Conceptual/LocationAwarenessPG/AnnotatingMaps/AnnotatingMaps.html)
