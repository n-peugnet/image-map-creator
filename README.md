# Image Map Creator

This is a simple map creator tool made with the p5.js library. I want it
to be easy to use for both the end user and the developper.

![demo gif](images/image-map-creator.gif)

## Features

Here is the list of all the features of this app :

_The checked ones are implemented, the others are the ones I plan to add in the future_

-   [x] drag&drop a picture on the canvas
-   [x] draw rectangular areas
-   [x] draw circular areas (by dragging left)
-   [ ] draw polygon areas
-   [x] set the desired url for an area
-   [ ] show a menu by right-clicking on an area with these options :
	-   [ ] set url
	-   [ ] delete
	-   [ ] move forward
	-   [ ] move backwards
-   [ ] differents mouse modes :
	-   [x] draw mode
	-   [ ] move mode
	-   [ ] select mode
	-   [ ] resize mode ?
	-   [ ] erase mode ?
-   [ ] differents drawing modes for rectangles :
	-   [x] dram from edges
	-   [ ] draw from center (with `alt`)
	-   [ ] draw square (with `shift`)
-   [ ] differents drawing modes for circles :
	-   [ ] draw from edges
	-   [x] draw from center
-   [ ] gui with these options :
	-   [ ] select mouse mode
	-   [ ] select shape mode
	-   [ ] export the result as a usable html map
	-   [ ] export the result as a usable svg map

## How to Integrate it

You just need to import `p5.js`, `p5.dom.js` and the files of `/src` in
your html page. Then instantiate the p5 object like this :

```JavaScript
var iMap = new p5(imageMapCreator, "div-1");
```
For more details on the instance mode of p5 see [the p5 documentation](https://p5js.org/examples/instance-mode-instance-container.html)

You can also see the detailled example in the `/examples` folder.