var imageMapCreator = function (p, width = 600, height = 450) {

	var tool = "rectangle";
	var drawingTools = ["rectangle", "circle", "polygon"];
	var settings;
	var menu = {
		SetUrl: {
			onSelect: (target, key, item, area) => { p.setAreaUrl(area); },
			label: "Set url",
		},
		Delete: (target, key, item, area) => { p.deleteArea(area); },
		MoveUp: {
			onSelect: (target, key, item, area) => { p.moveArea(area, 1); },
			enabled: true,
			label: "Move Forward",
		},
		MoveDown: {
			onSelect: (target, key, item, area) => { p.moveArea(area, -1); },
			enabled: true,
			label: "Move Backward",
		}
	};
	var tempArea = new Area();
	var tempCoord = new XY();
	var selected = false;
	var hovered = false;
	var bgLayer = new BgLayer();
	var map = new ImageMap(width, height);
	var undoManager = new UndoManager();
	var img = null;
	var w = {
		scale: 1,
		transX: 0,
		transY: 0
	}
	var zoom = {
		min: 0.03,
		max: 3,
		sensativity: 0.001
	}

	p.setup = function () {
		var canvas = p.createCanvas(width, height);
		canvas.drop(p.handeFile).dragLeave(p.onLeave).dragOver(p.onOver);
		settings = QuickSettings.create(p.width + 5, 0, "Image-map Creator", p.canvas.parentElement)
			.setDraggable(false)
			.addText("Map Name", "", v => { map.setName(v) })
			.addDropDown("Tool", ["rectangle", "circle", "polygon", "inspect", "move", "delete"], v => { p.setTool(v.value) })
			.addBoolean("Default Area", map.hasDefaultArea, v => { p.setDefaultArea(v) })
			.addButton("Undo", undoManager.undo)
			.addButton("Redo", undoManager.redo)
			.addButton("Clear", p.clearAreas)
			.addButton("Generate Html", function () { settings.setValue("Output", map.toHtml()) })
			.addButton("Generate Svg", function () { settings.setValue("Output", map.toSvg()) })
			.addTextArea("Output");
		// Fix for oncontextmenu
		p.canvas.addEventListener("contextmenu", function (e) { e.preventDefault(); });
	}

	p.draw = function () {
		p.updateTempArea();
		hovered = p.mouseIsHoverArea();
		p.setCursor();
		p.setOutput();
		p.background(200);
		p.translate(w.transX, w.transY);
		p.scale(w.scale);
		p.drawImage();
		bgLayer.display();
		p.drawAreas();
	}

	//------------------------------ Events -----------------------------------

	p.mousePressed = function () {
		if (p.mouseIsHover()) {
			if (p.mouseButton == p.LEFT && !ContextMenu.isOpen()) {
				hovered.shape != "default" ? selected = hovered : false;
				switch (tool) {
					case "circle":
					case "rectangle":
						p.setTempArea(p.mX(), p.mY());
						break;
					case "polygon":
						if (tempArea.empty()) {
							p.setTempArea(p.mX(), p.mY());
						} else if (tempArea.isClosable(p.mX(), p.mY(), 5 / w.scale)) {
							tempArea.close();
							if (tempArea.isValidShape())
								p.createArea(tempArea);
							tempArea = new Area();
						} else {
							tempArea.addCoord(p.mX(), p.mY());
						}
						break;
					case "move":
						if (selected) {
							tempCoord = selected.firstCoord();
						}
						break;
					case "delete":
						if (hovered) {
							p.deleteArea(hovered);
						}
						break;
				}
			}
		}
	}

	p.mouseDragged = function () {
		switch (tool) {
			case "move":
				if (selected) {
					let mvmt = new XY(p.mX() - p.trueX(p.pmouseX), p.mY() - p.trueY(p.pmouseY));
					selected.move(mvmt);
				}
				break;
		}
	}

	p.mouseReleased = function (e) {
		switch (tool) {
			case "rectangle":
			case "circle":
				if (tempArea.isValidShape())
					p.createArea(tempArea);
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
		bgLayer.disappear();
		selected = false;
		if (p.mouseButton == p.RIGHT) {
			if (hovered) {
				menu.MoveUp.enabled = !(map.isLastArea(hovered.id) || hovered.shape == 'default');
				menu.MoveDown.enabled = !(map.isFirstArea(hovered.id) || hovered.shape == 'default');
				ContextMenu.display(e, menu, {
					position: "click",
					data: hovered
				});
			}
			return false; // doesen't work as expected
		}
	}

	p.mouseWheel = function (e) {
		if (p.mouseIsHover()) {
			let coefZoom = w.scale * zoom.sensativity * - e.delta;
			p.zoom(coefZoom);
		}
	}

	//---------------------------- Functions ----------------------------------

	p.mX = function () {
		return p.trueX(p.mouseX);
	}

	p.mY = function () {
		return p.trueY(p.mouseY);
	}

	p.trueX = function (coord) {
		return (coord - w.transX) / w.scale;
	}

	p.trueY = function (coord) {
		return (coord - w.transY) / w.scale;
	}

	p.mouseIsHover = function () {
		return p.mouseX <= p.width && p.mouseX >= 0 && p.mouseY <= p.height && p.mouseY >= 0;
	}

	/**
	 * @returns {Area|false}
	 */
	p.mouseIsHoverArea = function () {
		let allAreas = map.getAreas();
		let area = allAreas.reverse().find(area => {
			return area.isHover(p.mX(), p.mY());
		});
		return area != undefined ? area : false;
	}

	// p.mouseIsDraggedLeft = function () {
	// 	var fCoord = tempArea.firstCoord();
	// 	return fCoord.x > p.mouseX;
	// }

	p.onOver = function (evt) {
		bgLayer.appear();
		evt.preventDefault();
	}

	p.onLeave = function () {
		bgLayer.disappear();
	}

	p.handeFile = function (file) {
		if (file.type == "image") {
			img = p.loadImage(file.data, img => p.setScale(img));
			if (!map.name) {
				map.setName(file.name);
				settings.setValue("Map Name", map.name);
			}
		}
		bgLayer.disappear();
	}

	p.setScale = function (img) {
		w.scale = 1;
		w.transX = 0;
		w.transY = 0;
		let xScale = p.width / img.width;
		let yScale = p.height / img.height;
		if (xScale < w.scale)
			w.scale = xScale;
		if (yScale < w.scale)
			w.scale = yScale;
		map.setSize(img.width, img.height);
	}

	p.zoom = function (coef) {

		let newScale = w.scale + coef;
		if (newScale > zoom.min && newScale < zoom.max) {
			let mouseXToOrigin = p.mX();
			let mouseYToOrigin = p.mY();
			let transX = mouseXToOrigin * coef;
			let transY = mouseYToOrigin * coef;

			w.scale = newScale;
			w.transX -= transX;
			w.transY -= transY;
		}
	}

	p.drawImage = function () {
		if (img)
			p.image(img, 0, 0, img.width, img.height);
	}

	p.drawAreas = function () {
		var allAreas = map.getAreas().concat([tempArea]);
		allAreas.forEach(area => {
			p.setAreaStyle(area);
			if (area.isDrawable())
				area.display(p);
		});
	}

	p.setTool = function (value) {
		tool = value;
		tempArea = new Area();
	}

	p.setCursor = function () {
		if (drawingTools.includes(tool)) {
			switch (tool) {
				case "polygon":
					if (!tempArea.empty() && tempArea.isClosable(p.mX(), p.mY(), 5 / w.scale)) {
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

	p.setOutput = function () {
		switch (tool) {
			case "inspect":
				if (p.mouseIsHover()) {
					let href = hovered ? hovered.href : "none";
					settings.setValue("Output", href);
				}
				break;
		}
	}

	p.setAreaStyle = function (area) {
		var color = p.color(255, 255, 255, 178);
		if (tool == "inspect")
			color = p.color(255, 0);
		if (
			(p.mouseIsHover() && (tool == "inspect" || tool == "delete") && area == hovered) ||
			(tool == "move" && selected == false && area == hovered && p.mouseIsHover()) ||
			(tool == "move" && selected == area)
		) {
			color = p.color(255, 200, 200, 178); // highlight (set color red)
		}
		p.fill(color);
		p.strokeWeight(1 / w.scale);
		if (tool == "inspect")
			p.noStroke();
		else
			p.stroke(0);
	}

	p.setTempArea = function (x, y) {
		var coords = [new XY(x, y)];
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

	p.updateTempArea = function () {
		if (!tempArea.empty()) {
			tempArea.updateLastCoord(p.mX(), p.mY());
		}
	}

	p.getMap = function () {
		return map;
	}

	p.createArea = function (area) {
		map.addArea(area);
		undoManager.add({
			undo: function () {
				area = map.popArea();
			},
			redo: function () {
				map.addArea(area, false);
			}
		})
	}

	p.deleteArea = function (area) {
		let id = area.id;
		if (id === 0) {
			settings.setValue("Default Area", false);
		} else {
			let index = map.rmvArea(id);
			undoManager.add({
				undo: function () {
					map.insertArea(area, index);
				},
				redo: function () {
					map.rmvArea(id);
				}
			});
		}
	}

	p.moveArea = function (area, direction) {
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

	p.setAreaUrl = function (area) {
		var href = area.href;
		var input = prompt("Entrez l'url vers laquelle devrait pointer cette zone", href ? href : "http://");
		if (input != null) {
			area.sethref(input);
			undoManager.add({
				undo: function () {
					area.sethref(href);
				},
				redo: function () {
					area.sethref(input);
				}
			});
		}
	}

	p.setDefaultArea = function (bool) {
		map.setDefaultArea(bool);
		undoManager.add({
			undo: function () {
				map.setDefaultArea(!bool);
				settings.setValue("Default Area", !bool)
			},
			redo: function () {
				map.setDefaultArea(bool);
				settings.setValue("Default Area", bool)
			}
		});
	}

	p.clearAreas = function () {
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
		p.rect(p.trueX(0), p.trueY(0), p.width / w.scale, p.height / w.scale);
	}
}