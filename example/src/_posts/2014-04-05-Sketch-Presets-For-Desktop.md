---
layout: post
title: "Sketch Presets for Desktop Screens"
---
I've been using [Sketch](http://bohemiancoding.com/sketch/) to create mock ups for clients lately. So far so good. Today, I wanted to create art board presets for common desktop screen sizes. It took me a little while to find out how to organize them into folders. Luckily for me, Jan Drewniak has a [blog post](http://j4n.co/blog/custom-sketch-art-board-presets) detailing how to do just this.

> Sketch actually keeps these artboard presets in an artboards.sketchpreset file located somewhere on your mac. If you're using the App Store version of Sketch, then the file is located here:

	~/Library/Containers/com.bohemiancoding.sketch/Data/Library/Application  Support/sketch/

Here's my presets:

	<dict>
		<key>name</key>
		<string>Desktop</string>
		<key>presets</key>
		<array>
			<string>Retina Displays</string>
			<dict>
				<key>width</key>
				<integer>2880</integer>
				<key>name</key>
				<string>15-inch</string>
				<key>height</key>
				<integer>1800</integer>
			</dict>
			<dict>
				<key>width</key>
				<integer>2560</integer>
				<key>name</key>
				<string>13-inch</string>
				<key>height</key>
				<integer>1600</integer>
			</dict>
			<string>4:3</string>
			<dict>
				<key>width</key>
				<integer>1600</integer>
				<key>name</key>
				<string>Large 4:3</string>
				<key>height</key>
				<integer>1200</integer>
			</dict>
			<dict>
				<key>width</key>
				<integer>1280</integer>
				<key>name</key>
				<string>Medium 4:3</string>
				<key>height</key>
				<integer>1024</integer>
			</dict>
			<string>16:9</string>
			<dict>
				<key>width</key>
				<integer>1920</integer>
				<key>name</key>
				<string>Large 16:9</string>
				<key>height</key>
				<integer>1080</integer>
			</dict>
			<dict>
				<key>width</key>
				<integer>1600</integer>
				<key>name</key>
				<string>Medium 16:9</string>
				<key>height</key>
				<integer>900</integer>
			</dict>
			<dict>
				<key>width</key>
				<integer>1366</integer>
				<key>name</key>
				<string>Small 16:9</string>
				<key>height</key>
				<integer>768</integer>
			</dict>
		</array>
	</dict>

I have categories for: Retina, 16:9 and 5:4 displays. Only listing the ones I've used recently and might re-use in the future.