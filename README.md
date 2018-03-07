# Image Map Creator

This is a simple map creator tool made with the p5.js library. I want it
to be easy to use for both the end user and the developper.

![demo gif](images/image-map-creator.gif)

## Features

-   [x] drag&drop a picture on the canvas
-   [x] draw rectangle areas
-   [x] set the desired url of an area
-   [ ] draw circular areas
-   [ ] draw polygon areas
-   [ ] show an area-menu by right clicking on an area with these options:
    -   [ ] set url
	-   [ ] delete
	-   [ ] move forward
	-   [ ] move backwards
-   [ ] export the result as a usable html map

## How to Integrate it

You just need to import `p5.js`, `p5.dom.js` and the files of `/src` in
your html page. Then instantiate the p5 object like this :

```JavaScript
var iMap = new p5(imageMapCreator, "div-1");
```
For more details on the instance mode of p5 see [the p5 documentation](https://p5js.org/examples/instance-mode-instance-container.html)

You can also see the detailled example in the `/examples` folder.