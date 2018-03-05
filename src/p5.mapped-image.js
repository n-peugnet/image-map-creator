var mappedImageGen = function (p) {

	var testArea = new Area("rect");
	testArea.addCoord(10,10);
	testArea.addCoord(50,50);
	var map = new MappedImage([testArea]);

	p.setup = function () {
		p.createCanvas(400, 300);
	};

	p.draw = function () {
		p.background(200);
		p.fill(0);
		map.areas.forEach(area => {
			p.rect(area.coords[0][0], area.coords[0][1], area.coords[1][0], area.coords[1][1]);
		});
	};

	p.mousePressed = function() {
		p.rect(10, 10, p.mouseX, p.mouseY)
	}
};