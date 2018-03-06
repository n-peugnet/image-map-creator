var imageMapCreator = function (p) {

	p.map = new ImageMap();
	var tempArea = new Area();
	var bgLayer = new BgLayer(p);
	var canvas;
	var img = null;

	p.setup = function () {
		p.createCanvas(400, 300);
		canvas = p.select('canvas');
		canvas.drop(p.handeFile);
		canvas.dragLeave(p.onLeave);
		canvas.dragOver(p.onOver);
	};

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
	};

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
	};

	p.mouseReleased = function () {
		if (tempArea.isValidShape())
			p.map.addArea(tempArea);
		tempArea = new Area();
	};

	p.mouseIsHover = function () {
		return p.mouseX <= p.width && p.mouseX >= 0 && p.mouseY <= p.height && p.mouseY >= 0;
	};

	p.mouseIsHoverArea = function () {
		var allAreas = p.map.areas.slice();
		return area = allAreas.reverse().find(area => {
			return area.isHover(p.mouseX, p.mouseY);
		});
	};

	p.onOver = function (evt) {
		bgLayer.appear();
		evt.preventDefault();
	};

	p.onLeave = function () {
		bgLayer.disappear();
	}

	p.handeFile = function (file) {
		if (file.type == "image")
			img = p.loadImage(file.data);
		bgLayer.disappear();
	};
};

class BgLayer {
	constructor(p) {
		this.alpha = 0;
		this.over = false;
		this.p = p;
	}

	appear() {
		this.over = true;
	}

	disappear() {
		this.over = false;
		console.log(this.over);
	}

	display() {
		if (this.over) {
			if (this.alpha < 100)
				this.alpha += 10;
		} else {
			if (this.alpha > 0)
				this.alpha -= 10;
		}
		this.p.noStroke();
		this.p.fill(255, 255, 255, this.alpha);
		this.p.rect(0, 0, this.p.width, this.p.height);
	}

}