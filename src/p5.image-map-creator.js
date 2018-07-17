var imageMapCreator = function (p, width = 600, height = 450) {

	var tool = "rectangle";
	var drawingTools = ["rectangle", "circle", "polygon"];
	var settings;
	var menu = {
		SetUrl: {
			onSelect: (target, key, item, area) => { p.setAreaUrl(area); },
			label: "Set url",
			title: "Click here to set the url of this area"
		},
		Delete: (target, key, item, area) => { p.deleteArea(area); }
	};
	var tempArea = new Area();
	var origin = new XY();
	var selected;
	var hovered;
	var bgLayer = new BgLayer();
	var map = new ImageMap();
	var undoManager = new UndoManager();
	var img = null;
	var scale = 1;

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
	}

	p.draw = function () {
		p.updateTempArea();
		p.setHovered();
		p.setCursor();
		p.setOutput();
		p.background(200);
		p.drawImage();
		bgLayer.display();
		p.drawAreas();
	}

	//------------------------------ Events -----------------------------------

	p.mousePressed = function (e) {
		if (p.mouseIsHover()) {
			selected = hovered;
			if (p.mouseButton == p.LEFT) {
				switch (tool) {
					case "circle":
					case "rectangle":
						p.setTempArea(p.mouseX, p.mouseY);
						break;
					case "polygon":
						if (tempArea.empty()) {
							p.setTempArea(p.mouseX, p.mouseY);
						} else if (tempArea.isClosable(p.mouseX, p.mouseY)) {
							tempArea.close();
							if (tempArea.isValidShape())
								p.createArea(tempArea);
							tempArea = new Area();
						} else {
							tempArea.addCoord(p.mouseX, p.mouseY);
						}
						break;
					case "move":
						if (selected != undefined) {
							origin = selected.firstCoord();
						}
						break;
					case "delete":
						p.deleteArea(hovered);
						break;
				}
			} else if (p.mouseButton == p.RIGHT) {
				if (selected != undefined) {
					ContextMenu.display(e, menu, {
						position: "click",
						data: selected
					});
					selected = undefined;
				}
				return false; // doesen't work as expected
			}
		}
	}

	p.mouseDragged = function () {
		switch (tool) {
			case "move":
				if (selected != undefined) {
					let mvmt = new XY(p.mouseX - p.pmouseX, p.mouseY - p.pmouseY);
					selected.move(mvmt);
				}
				break;
		}
	}

	p.mouseReleased = function () {
		switch (tool) {
			case "rectangle":
			case "circle":
				if (tempArea.isValidShape())
					p.createArea(tempArea);
				tempArea = new Area();
				break;
			case "move":
				if (selected != undefined) {
					let area = selected;
					let move = area.firstCoord().diff(origin);
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
		selected = undefined;
	}

	//---------------------------- Functions ----------------------------------

	p.mouseIsHover = function () {
		return p.mouseX <= p.width && p.mouseX >= 0 && p.mouseY <= p.height && p.mouseY >= 0;
	}

	/**
	 * @returns {Area|undefined}
	 */
	p.mouseIsHoverArea = function () {
		var allAreas = map.getAreas();
		return allAreas.reverse().find(area => {
			return area.isHover(p.mouseX, p.mouseY);
		});
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
			map.setSize(img.width, img.height);
			if (!map.name) {
				map.setName(file.name);
				settings.setValue("Map Name", map.name);
			}
		}
		bgLayer.disappear();
	}

	p.setScale = function (img) {
		scale = 1;
		let xScale = p.width / img.width;
		let yScale = p.height / img.height;
		if (xScale < scale)
			scale = xScale;
		if (yScale < scale)
			scale = yScale;
		map.setScale(scale);
	}

	p.drawImage = function () {
		if (img)
			p.image(img, 0, 0, img.width * scale, img.height * scale);
	}

	p.drawAreas = function () {
		var allAreas = map.getAreas().concat([tempArea]);
		allAreas.forEach(area => {
			p.setAreaStyle(area);
			if (!area.empty())
				area.display(p);
		});
	}

	p.setHovered = function () {
		hovered = p.mouseIsHoverArea();
	}

	p.setTool = function (value) {
		tool = value;
		tempArea = new Area();
	}

	p.setCursor = function () {
		if (drawingTools.includes(tool)) {
			switch (tool) {
				case "polygon":
					if (!tempArea.empty() && tempArea.isClosable(p.mouseX, p.mouseY)) {
						p.cursor(p.ARROW);
						break;
					}
				default:
					p.cursor(p.CROSS);
			}
		} else {
			p.cursor(p.ARROW);
			if (hovered != undefined) {
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
					let href = hovered != undefined ? hovered.href : "none";
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
			(tool == "move" && selected == undefined && area == hovered && p.mouseIsHover()) ||
			(tool == "move" && selected == area)
		) {
			color = p.color(255, 200, 200, 178); // highlight (set color red)
		}
		p.fill(color);
		p.strokeWeight(1);
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
			tempArea.updateLastCoord(p.mouseX, p.mouseY);
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
		let index = map.rmvArea(id);
		undoManager.add({
			undo: function () {
				map.insertArea(area, index);
			},
			redo: function () {
				map.rmvArea(id);
			}
		})
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
			})
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
		})
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
		})
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
		p.rect(0, 0, p.width, p.height);
	}
}

// Fix for oncontextmenu
window.addEventListener("contextmenu", function (e) { e.preventDefault(); });