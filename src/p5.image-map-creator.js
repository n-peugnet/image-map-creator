import { ImageMap } from "./class.image-map";
import { Area, AreaCircle, AreaRect, AreaPoly } from "./class.area";
import { XY } from "./class.xy";
import { openWindow } from './utils';

/**
 * @param {p5} p a P5 object
 */
export let imageMapCreator = function (p, width = 600, height = 450) {

	let tool = "rectangle";
	let drawingTools = ["rectangle", "circle", "polygon"];
	let settings;
	let menu = {
		SetUrl: {
			onSelect: (target, key, item, area) => { setAreaUrl(area); },
			label: "Set url",
		},
		Delete: (target, key, item, area) => { deleteArea(area); },
		MoveFront: {
			onSelect: (target, key, item, area) => { moveArea(area, 1); },
			enabled: true,
			label: "Move Forward",
		},
		MoveBack: {
			onSelect: (target, key, item, area) => { moveArea(area, -1); },
			enabled: true,
			label: "Move Backward",
		}
	};
	let tempArea = new Area();
	let tempCoord = new XY();
	let selected = false;
	let hovered = false;
	let bgLayer = new BgLayer();
	let map = new ImageMap(width, height);
	let undoManager = new UndoManager();
	let img;
	let view = {
		scale: 1,
		transX: 0,
		transY: 0
	}
	let zoomParams = {
		min: 0.03,
		max: 3,
		sensativity: 0.001
	}

	p.setup = function () {
		let canvas = p.createCanvas(width, height);
		canvas.drop(handeFile).dragLeave(onLeave).dragOver(onOver);
		settings = QuickSettings.create(p.width + 5, 0, "Image-map Creator", p.canvas.parentElement)
			.setDraggable(false)
			.addText("Map Name", "", v => { map.setName(v) })
			.addDropDown("Tool", ["rectangle", "circle", "polygon", "inspect", "move", "delete", "test"], v => { setTool(v.value) })
			.addBoolean("Default Area", map.hasDefaultArea, v => { setDefaultArea(v) })
			.addButton("Undo", undoManager.undo)
			.addButton("Redo", undoManager.redo)
			.addButton("Clear", clearAreas)
			.addButton("Generate Html", function () { settings.setValue("Output", map.toHtml()) })
			.addButton("Generate Svg", function () { settings.setValue("Output", map.toSvg()) })
			.addTextArea("Output")
			.addButton("Save", exportMap);
		// Fix for oncontextmenu
		p.canvas.addEventListener("contextmenu", function (e) { e.preventDefault(); });
	}

	p.draw = function () {
		updateTempArea();
		hovered = mouseIsHoverArea();
		setCursor();
		setOutput();
		setBackground();
		p.translate(view.transX, view.transY);
		p.scale(view.scale);
		drawImage();
		bgLayer.display();
		drawAreas();
	}

	p.getMap = function () {
		return map;
	}

	//------------------------------ Events -----------------------------------

	p.mousePressed = function () {
		if (mouseIsHover()) {
			if (p.mouseButton == p.LEFT && !ContextMenu.isOpen()) {
				switch (tool) {
					case "circle":
					case "rectangle":
						setTempArea(mX(), mY());
						break;
					case "polygon":
						if (tempArea.empty()) {
							setTempArea(mX(), mY());
						} else if (tempArea.isClosable(mX(), mY(), 5 / view.scale)) {
							tempArea.close();
							if (tempArea.isValidShape())
								createArea(tempArea);
							tempArea = new Area();
						} else {
							tempArea.addCoord(mX(), mY());
						}
						break;
					case "move":
						if (hovered) {
							selected = hovered.shape != "default" ? hovered : false;
							tempCoord = selected.firstCoord();
						}
						break;
				}
			}
		}
	}

	p.mouseDragged = function () {
		if (mouseIsHover() && !ContextMenu.isOpen()) {
			if (p.mouseButton == p.LEFT) {
				switch (tool) {
					case "move":
						if (selected) {
							let mvmt = new XY(mX() - trueX(p.pmouseX), mY() - trueY(p.pmouseY));
							selected.move(mvmt);
						}
						break;
				}
			} else if (p.mouseButton == p.CENTER) {
				view.transX += p.mouseX - p.pmouseX;
				view.transY += p.mouseY - p.pmouseY;
			}
		}
	}

	p.mouseReleased = function (e) {
		switch (tool) {
			case "rectangle":
			case "circle":
				if (tempArea.isValidShape())
					createArea(tempArea);
				tempArea = new Area();
				break;
			case "move":
				if (selected) {
					let area = selected;
					let move = area.firstCoord().diff(tempCoord);
					undoManager.add({
						undo: function () {
							area.move(move.invert());
						},
						redo: function () {
							area.move(move);
						}
					});
				}
				break;
		}
		onClick(e);
		bgLayer.disappear();
	}

	p.mouseWheel = function (e) {
		if (mouseIsHover()) {
			let coefZoom = view.scale * zoomParams.sensativity * - e.delta;
			zoom(coefZoom);
		}
	}

	//---------------------------- Functions ----------------------------------

	function mX() {
		return trueX(p.mouseX);
	}

	function mY() {
		return trueY(p.mouseY);
	}

	function trueX(coord) {
		return (coord - view.transX) / view.scale;
	}

	function trueY(coord) {
		return (coord - view.transY) / view.scale;
	}

	function mouseIsHover() {
		return p.mouseX <= p.width && p.mouseX >= 0 && p.mouseY <= p.height && p.mouseY >= 0;
	}

	/**
	 * @returns {Area|false}
	 */
	function mouseIsHoverArea() {
		let allAreas = map.getAreas();
		let area = allAreas.reverse().find(area => {
			return area.isHover(mX(), mY());
		});
		return area != undefined ? area : false;
	}

	// mouseIsDraggedLeft = function () {
	// 	let fCoord = tempArea.firstCoord();
	// 	return fCoord.x > p.mouseX;
	// }

	function onClick(event) {
		if (mouseIsHover()) {
			if (hovered) {
				if (p.mouseButton == p.RIGHT) {
					selected = hovered;
					menu.MoveFront.enabled = !(map.isLastArea(hovered.id) || hovered.shape == 'default');
					menu.MoveBack.enabled = !(map.isFirstArea(hovered.id) || hovered.shape == 'default');
					ContextMenu.display(event, menu, {
						position: "click",
						data: hovered
					});
					return false; // doesen't work as expected
				} else if (p.mouseButton == p.LEFT) {
					switch (tool) {
						case "test":
							openWindow(hovered.href);
							break;
						case "delete":
							deleteArea(hovered);
							break;
					}
				}
			}
		}
		selected = false;
	}

	function onOver(evt) {
		bgLayer.appear();
		evt.preventDefault();
	}

	function onLeave() {
		bgLayer.disappear();
	}

	function handeFile(file) {
		if (file.type == "image") {
			img = p.loadImage(file.data, img => resetView(img));
			if (!map.name) {
				map.setName(file.name);
				settings.setValue("Map Name", map.name);
			}
		} else if (file.subtype == 'json') {
			fetch(file.data)
				.then(res => res.blob())
				.then(blob => {
					console.log(blob);
					let reader = new FileReader();
					reader.onload = function () {
						let json = reader.result;
						console.log(json);
						map.setFromJson(json);
					}
					reader.readAsText(blob);
				});
		}
		bgLayer.disappear();
	}

	function resetView(img) {
		view.scale = 1;
		view.transX = 0;
		view.transY = 0;
		let xScale = p.width / img.width;
		let yScale = p.height / img.height;
		if (xScale < view.scale)
			view.scale = xScale;
		if (yScale < view.scale)
			view.scale = yScale;
		map.setSize(img.width, img.height);
	}

	function zoom(coef) {

		let newScale = view.scale + coef;
		if (newScale > zoomParams.min && newScale < zoomParams.max) {
			let mouseXToOrigin = mX();
			let mouseYToOrigin = mY();
			let transX = mouseXToOrigin * coef;
			let transY = mouseYToOrigin * coef;

			view.scale = newScale;
			view.transX -= transX;
			view.transY -= transY;
		}
	}

	function drawImage() {
		if (img)
			p.image(img, 0, 0, img.width, img.height);
	}

	function drawAreas() {
		let allAreas = map.getAreas().concat([tempArea]);
		allAreas.forEach(area => {
			setAreaStyle(area);
			if (area.isDrawable())
				area.display(p);
		});
	}

	function setTool(value) {
		tool = value;
		tempArea = new Area();
	}

	function setCursor() {
		if (drawingTools.includes(tool)) {
			switch (tool) {
				case "polygon":
					if (!tempArea.empty() && tempArea.isClosable(mX(), mY(), 5 / view.scale)) {
						p.cursor(p.HAND);
						break;
					}
				default:
					p.cursor(p.CROSS);
			}
		} else {
			p.cursor(p.ARROW);
			if (hovered) {
				switch (tool) {
					case "inspect":
					case "test":
					case "delete":
						p.cursor(p.HAND);
						break;
					case "move":
						p.cursor(p.MOVE);
						break;
				}
			}
		}
	}

	function setOutput() {
		switch (tool) {
			case "inspect":
				if (mouseIsHover()) {
					let href = hovered ? hovered.href : "none";
					settings.setValue("Output", href);
				}
				break;
		}
	}

	function setBackground() {
		p.background(200);
		if (!img) {
			p.noStroke();
			p.fill(0);
			p.textSize(15);
			let text = 'Drag and drop an image and/or a .map.json save file here';
			p.text(text, p.width / 6, p.height / 2);
		}
	}

	function setAreaStyle(area) {
		let color = p.color(255, 255, 255, 178);
		if (tool == "inspect" ||
			tool == "test") {
			color = p.color(255, 0);
		}
		if ((mouseIsHover() && area == hovered && selected == false && (
			tool == "inspect" ||
			tool == "delete" ||
			tool == "move")) ||
			selected == area) {
			color = p.color(255, 200, 200, 178); // highlight (set color red)
		}
		p.fill(color);
		p.strokeWeight(1 / view.scale);
		if (tool == "inspect" ||
			tool == "test") {
			p.noStroke();
		} else {
			p.stroke(0);
		}
	}

	function setTempArea(x, y) {
		let coords = [new XY(x, y)];
		switch (tool) {
			case "rectangle":
				tempArea = new AreaRect(coords);
				tempArea.addCoord(0, 0);
				break;
			case "circle":
				tempArea = new AreaCircle(coords);
				break;
			case "polygon":
				tempArea = new AreaPoly(coords);
				tempArea.addCoord(x, y);
				break;
		}
	}

	function updateTempArea() {
		if (!tempArea.empty()) {
			tempArea.updateLastCoord(mX(), mY());
		}
	}

	function exportMap() {
		download(map.toJson(), `${map.name}.map.json`, 'application/json')
	}

	function createArea(area) {
		map.addArea(area);
		undoManager.add({
			undo: function () {
				area = map.popArea();
			},
			redo: function () {
				map.addArea(area, false);
			}
		});
	}

	function deleteArea(area) {
		let id = area.id;
		if (id === 0) {
			settings.setValue("Default Area", false);
		} else {
			let index = map.rmletea(id);
			undoManager.add({
				undo: function () {
					map.insertArea(area, index);
				},
				redo: function () {
					map.rmletea(id);
				}
			});
		}
	}

	function moveArea(area, direction) {
		if (map.moveArea(area.id, direction) !== false) {
			undoManager.add({
				undo: function () {
					map.moveArea(area.id, -direction);
				},
				redo: function () {
					map.moveArea(area.id, direction);
				}
			});
		}
	}

	function setAreaUrl(area) {
		let href = area.href;
		let input = prompt("Entrez l'url vers laquelle devrait pointer cette zone", href ? href : "http://");
		if (input != null) {
			area.setHref(input);
			undoManager.add({
				undo: function () {
					area.setHref(href);
				},
				redo: function () {
					area.setHref(input);
				}
			});
		}
	}

	function setDefaultArea(bool) {
		map.setDefaultArea(bool);
		undoManager.add({
			undo: function () {
				map.setDefaultArea(!bool); // semble redondant
				settings.setValue("Default Area", !bool)
			},
			redo: function () {
				map.setDefaultArea(bool); // semble redondant
				settings.setValue("Default Area", bool)
			}
		});
	}

	function clearAreas() {
		let areas = map.getAreas(false);
		map.clearAreas();
		undoManager.add({
			undo: function () {
				map.setAreas(areas);
			},
			redo: function () {
				map.clearAreas();
			}
		});
	}

	//---------------------------- P5 Classes ---------------------------------

	/**
	 * Class representing the semi transparent layer which can appear on top of the background
	 * @param {number} speed the speed of the opacity animation (1-255, default 15)
	 */
	function BgLayer(speed = 15) {
		this.speed = speed;
		this.alpha = 0;
		this.over = false;
	}

	BgLayer.prototype.appear = function () {
		this.over = true;
	}

	BgLayer.prototype.disappear = function () {
		this.over = false;
	}

	BgLayer.prototype.display = function () {
		if (this.over) {
			if (this.alpha < 100)
				this.alpha += this.speed;
		} else {
			if (this.alpha > 0)
				this.alpha -= this.speed;
		}
		p.noStroke();
		p.fill(255, 255, 255, this.alpha);
		p.rect(trueX(0), trueY(0), p.width / view.scale, p.height / view.scale);
	}
}