var imageMapCreator = function (p) {

	var tool = "rectangle";
	var drawingTools = ["rectangle", "circle", "polygon"];
	var settings;
	var tempArea = new Area();
	var bgLayer = new BgLayer();
	var map = new ImageMap();
	var img = null;

	p.setup = function () {
		var canvas = p.createCanvas(600, 450);
		canvas.drop(p.handeFile).dragLeave(p.onLeave).dragOver(p.onOver);
		settings = QuickSettings.create(p.width + 5, 0, "Image-map Creator", p.canvas.parentElement)
			.setDraggable(false)
			.addText("Map Name", "", v => { map.setName(v) })
			.addDropDown("Tool", ["rectangle", "circle", "inspect"], v => { tool = v.value })
			.addBoolean("Default Area", map.defaultArea, v => { map.setDefaultArea(v)})
			.addButton("Undo", map.undoManager.undo)
			.addButton("Redo", map.undoManager.redo)
			.addButton("Generate Html", function () { settings.setValue("Output", map.toHtml()) })
			.addTextArea("Output");
	}

	p.draw = function () {
		if (p.mouseIsPressed) {
			tempArea.updateLastCoord(p.mouseX, p.mouseY)
		}
		p.setCursor();
		p.background(img ? img : 200);
		bgLayer.display();
		p.drawAreas();
	}

	//------------------------------ Events -----------------------------------

	p.mousePressed = function () {
		if (p.mouseIsHover()) {
			if (p.mouseButton == p.LEFT) {
				p.setTempArea(p.mouseX, p.mouseY);
			} else if (p.mouseButton == p.RIGHT) {
				var area = p.mouseIsHoverArea();
				if (area != undefined) {
					var input = prompt("Entrez l'url vers laquelle devrait pointer cette zone", area.href ? area.href : "http://");
					if (input != null)
						area.href = input;
				}
				return false;
			}
		}
	}

	p.mouseDragged = function () { }

	p.mouseReleased = function () {
		if (tempArea.isValidShape())
			map.createArea(tempArea);
		tempArea = new Area();
		bgLayer.disappear();
	}

	//---------------------------- Functions ----------------------------------

	p.mouseIsHover = function () {
		return p.mouseX <= p.width && p.mouseX >= 0 && p.mouseY <= p.height && p.mouseY >= 0;
	}

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
			img = p.loadImage(file.data);
			if (!map.name) {
				map.setName(file.name);
				settings.setValue("Map Name", map.name);
			}
		}
		bgLayer.disappear();
	}

	p.drawAreas = function () {
		var allAreas = map.getAreas().concat([tempArea]);
		allAreas.forEach(area => {
			p.setAreaStyle(area);
			if (area.isValidShape())
				area.display(p);
		});
	}

	p.setCursor = function () {
		switch (tool) {
			case "inspect":
				if (p.mouseIsHoverArea())
					p.cursor(p.HAND)
				else
					p.cursor(p.ARROW);
				break;
			default:
				p.cursor(p.CROSS);
				break;
		}
	}

	p.setAreaStyle = function (area) {
		var color = p.color(255, 255, 255, 178);
		if (tool == "inspect" && area == p.mouseIsHoverArea() && p.mouseIsHover())
			color = p.color(255, 200, 200, 178);
		p.fill(color);
		p.strokeWeight(1);
		p.stroke(0);
	}

	p.setTempArea = function (x, y) {
		var coords = [new XY(x, y)];
		switch (tool) {
			case "rectangle":
				tempArea = new AreaRect(coords);
				break;
			case "circle":
				tempArea = new AreaCircle(coords);
				break;
			case "polygon":
				tempArea = new AreaPoly(coords);
				break;
		}
	}

	p.getMap = function () {
		return map;
	}

	p.clearAreas = function () {
		map.clearAreas();
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