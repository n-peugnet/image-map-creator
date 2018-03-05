var mappedImageGen = function (p) {

	var map = new MappedImage();
	var tempArea = new Area();

	p.setup = function () {
		p.createCanvas(400, 300);
	};

	p.draw = function () {
		if (p.mouseIsPressed) {
			tempArea.updateLastCoord(p.mouseX, p.mouseY)
		}

		p.background(200);
		p.fill(0);
		var allAreas = map.areas.concat([tempArea]);
		allAreas.forEach(area => {
			if (area.shapeExists())
				p.rect(area.coords[0].x, area.coords[0].y, area.coords[1].x, area.coords[1].y);
		});
	};

	p.mousePressed = function () {
		tempArea.initAs("rect", p.mouseX, p.mouseY);
	}

	p.mouseReleased = function () {
		map.addArea(tempArea);
		tempArea = new Area();
	}
};