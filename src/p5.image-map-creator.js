var imageMapCreator = function (p) {

	p.map = new ImageMap();
	var tempArea = new Area();
	var bgLayer = new BgLayer();
	var img = null;

	p.setup = function () {
		var canvas = p.createCanvas(600, 450);
		canvas.drop(p.handeFile).dragLeave(p.onLeave).dragOver(p.onOver);
	}

	p.draw = function () {
		if (p.mouseIsPressed) {
			tempArea.updateLastCoord(p.mouseX, p.mouseY)
		}

		p.background(img ? img : 200);
		bgLayer.display();
		p.fill(255, 255, 255, 178);
		p.strokeWeight(1);
		p.stroke(0);
		var allAreas = p.map.areas.concat([tempArea]);
		allAreas.forEach(area => {
			if (area.isValidShape())
				p.rect(area.coords[0].x, area.coords[0].y, area.coords[1].x, area.coords[1].y);
		});
	}

	//------------------------------ Events -----------------------------------

	p.mousePressed = function () {
		if (p.mouseIsHover()) {
			if (p.mouseButton == p.LEFT) {
				tempArea.initAs("rect", p.mouseX, p.mouseY);
			} else if (p.mouseButton == p.RIGHT) {
				var area = p.mouseIsHoverArea();
				if (area != undefined) {
					var input = prompt("Entrez l'url vers laquelle devrait pointer cette zone", area.href);
					if (input)
						area.href = input;
				}
				return false;
			}
		}
	}

	p.mouseReleased = function () {
		if (tempArea.isValidShape())
			p.map.addArea(tempArea);
		tempArea = new Area();
		bgLayer.disappear();
	}

	//---------------------------- Functions ----------------------------------

	p.mouseIsHover = function () {
		return p.mouseX <= p.width && p.mouseX >= 0 && p.mouseY <= p.height && p.mouseY >= 0;
	}

	p.mouseIsHoverArea = function () {
		var allAreas = p.map.areas.slice();
		return area = allAreas.reverse().find(area => {
			return area.isHover(p.mouseX, p.mouseY);
		});
	}

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
			p.map.image = file.name;
		}
		bgLayer.disappear();
	}

	p.clearAreas = function () {
		p.map.clearAreas();
	}

	p.addBgArea = function () {
		var coords = [new XY(0, 0), new XY(p.width - 1, p.height - 1)];
		var area = new Area("rect", coords);
		p.map.addArea(area);
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