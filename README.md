# [Image Map Creator](https://rawgit.com/n-peugnet/image-map-creator/master/demos/)

This is a simple map creator tool made with the p5.js library. I want it
to be easy to use for both the end user and the developper.

![demo gif](images/image-map-creator.gif)

## Live demo

the live demo can be tried thanks to [rawgit](https://rawgit.com/): https://rawgit.com/n-peugnet/image-map-creator/master/demos/

## Features

Here is the list of all the features of this app :

_The checked ones are implemented, the others are the ones I plan to add in the future_

-   [x] drag&drop a picture on the canvas
-   [x] zoom in & out
-   [X] pan (dragging with MouseWheel click)
-   [x] show a menu by right-clicking on an area with these options :
	-   [x] set url
	-   [x] delete
	-   [x] move forward
	-   [x] move backwards
-   [x] differents tools :
	-   [x] rectangle mode
	-   [x] circle mode
	-   [x] polygon mode
	-   [X] move mode
	-   [x] inspect mode
	-   [ ] select mode
	-   [ ] resize mode ?
	-   [x] delete mode
	-   [ ] test mode
-   [ ] differents drawing modes for rectangles :
	-   [x] dram from edges
	-   [ ] draw from center (with `alt`)
	-   [ ] draw square (with `shift`)
-   [ ] differents drawing modes for circles :
	-   [ ] draw from edges
	-   [x] draw from center (later with `shift`)
-   [x] gui with these features :
	-   [x] select tool mode
	-   [x] undo
	-   [x] redo
	-   [x] export the result as a valid html map
	-   [ ] export the result as a usable svg map
	-   [x] export the result as JSON
	-   [x] import from JSON

## How to Integrate it

You need to import `p5.js`, `p5.dom.js`, the js bundle from `/dist` and
the contextmenu library in your html page. Then instantiate the p5 object
like this :

```JavaScript
let iMap = new imageMapCreator();
let sketch = new p5(iMap.sketch.bind(iMap), "div-1");
```

The contructor of imageMapCreator accepts parameters:

```Javascript
new imageMapCreator([ width = 600 [, height = 450 ]]);
```

For more details on the instance mode of p5 see [the p5 documentation](https://p5js.org/examples/instance-mode-instance-container.html)

You can also see the detailled example in the `/demos` folder.

## Built with

-   [p5.js](https://github.com/processing/p5.js) - an easy canvas drawing library - [website](http://p5js.org/)
-   [quicksettings](https://github.com/bit101/quicksettings) - a quick and easy settings creation library - [website](http://bit101.github.io/quicksettings/)
-   [Undo Manager](https://github.com/ArthurClemens/Javascript-Undo-Manager) - a light undo manager library
-   [contextmenu](https://github.com/theyak/contextmenu) - a light right-click menu creation library
-   [download.js](http://danml.com/download.html) - a one liner function to download files client side
-   [Rawgit](https://rawgit.com/) - a content delivery network based on github's raw files

## Authors

-   **Nicolas Peugnet** - _Initial work_ - [Github](https://github.com/n-peugnet) - [Website](http://nicolas.club1.fr)

See also the list of [contributors](https://github.com/n-peugnet/image-map-creator/contributors) who participated in this project.