# [Image Map Creator](https://n-peugnet.github.io/image-map-creator/)

<!--
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fn-peugnet%2Fimage-map-creator.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fn-peugnet%2Fimage-map-creator?ref=badge_shield)
--->

This is a simple map creator tool made with the p5.js library. I want it
to be easy to use for both the end user and the developper. This work is
still in beta so a lot of things are about to change (including the save
file's structure).

![demo gif](https://github.com/n-peugnet/image-map-creator/raw/master/docs/image-map-creator.gif)

## Live demo

the live demo can be tried here :
<https://n-peugnet.github.io/image-map-creator/>

## Features

Here is the list of all the features of this app :

_The checked ones are implemented,_
_the others are the ones I plan to add in the future._

-   [x] drag&drop on the canvas
    -   [x] a picture
    -   [x] a `.map.json` save file
-   [x] zoom in & out by scrolling
-   [X] pan with center click
-   [x] show a menu by right-clicking on an area with these options :
    -   [x] set url
    -   [x] set title
    -   [x] delete
    -   [x] move forward
    -   [x] move backwards
-   [x] differents tools :
    -   [x] rectangle mode
    -   [x] circle mode
    -   [x] polygon mode
    -   [X] select mode :
        -   [x] move an area
        -   [x] move a point of an area
        -   [ ] multiselect with <kbd>shift</kbd>
    -   [x] delete mode
    -   [x] test mode
-   [ ] differents drawing modes for rectangles :
    -   [x] dram from edges
    -   [ ] draw from center (with <kbd>alt</kbd>)
    -   [ ] draw square (with <kbd>shift</kbd>)
-   [ ] differents drawing modes for circles :
    -   [ ] draw from edges
    -   [x] draw from center (later with <kbd>shift</kbd>)
-   [x] gui with these features :
    -   [x] select tool mode
    -   [x] undo
    -   [x] redo
    -   [x] export the result as a valid html map
    -   [ ] export the result as a usable svg map
    -   [x] export the result as JSON
    -   [x] import from JSON

## Integration

There are multiple ways to get image-map-creator:

- Download the bundle from [the latest release](https://github.com/n-peugnet/image-map-creator/releases/latest).
- Compile the bundle from sources (see [development informations](#development)).
- Get the package from npm:
  ```
  npm install image-map-creator
  ```
  ```javascript
  // script.js
  import { imageMapCreator } from "image-map-creator";
  ```

Import `p5.js`, `p5.dom.js` and the javascript bundle from `/dist` :

```html
<script src="dist/image-map-creator.bundle.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.6.0/p5.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.6.0/addons/p5.dom.min.js"></script>
```

Add a `<div>` with an id, then instantiate the p5 object like this :

```js
let iMap = new imageMapCreator("div-id");
```

The contructor of imageMapCreator accepts these parameters :

```js
new imageMapCreator(elementId [, width = 600 [, height = 450 ]]);
```

You can also see the detailled example in the [`/demos`](demos) folder.

## Development

These instructions will get you a copy of the project up and running on
your local machine for development and testing purposes.

### Prerequisites

1.  Git
2.  Nodejs & NPM

### Install & Run

1.  clone with `--recurse-submodules` option or download this repository
    and install git submodules :
    ```shell
    git submodule init
    git submodule update
    ```
2.  install dependencies :
    ```shell
    npm install
    ```
3.  launch webpack in watch mode to build the dev bundle :
    ```shell
    npm run watch
    ```
4.  navigate to [`demos/index.html`](demos/index.html) with you browser

## Built with

-   [p5.js](https://github.com/processing/p5.js) - easy canvas drawing
    library - [website](http://p5js.org/)
-   [quicksettings](https://github.com/bit101/quicksettings) - quick and
    easy settings creation library -
    [website](http://bit101.github.io/quicksettings/)
-   [Undo Manager](https://github.com/ArthurClemens/Javascript-Undo-Manager) -
    light undo manager library
-   [contextmenu](https://github.com/theyak/contextmenu) -
    light right-click menu creation library
-   [download.js](https://github.com/rndme/download) - one liner function
    to download files client side - [website](http://danml.com/download.html)

## Authors

-   **Nicolas Peugnet** - _Initial work_ -
    [Github](https://github.com/n-peugnet) -
    [Website](http://nicolas.club1.fr)

See also the list of [contributors](https://github.com/n-peugnet/image-map-creator/contributors)
who participated in this project.

<!--
## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fn-peugnet%2Fimage-map-creator.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fn-peugnet%2Fimage-map-creator?ref=badge_large)
-->
