class Area {
	/**
	 * @param {string} shape the type of area
	 * @param {XY[]} coords the list of coordinates
	 * @param {string} href the link this area is going to point to
	 */
	constructor(shape, coords = [], href) {
		this.shape = shape;
		this.coords = coords;
		this.href = href;
		this.id = 0;
	}

	/**
	 * Adds a coordinate to the coords array, and returns it's new length
	 * @param {number} x the x val of the coordinate
	 * @param {number} y the y val of the coordinate
	 */
	addCoord(x, y) {
		return this.coords.push(new XY(x, y));
	}

	getCoords(mode = "default") {
		switch (mode) {
			case "default":
			default:
				return this.coords;
		}
	}

	empty() {
		return this.coords.length == 0;
	}

	copyCoords() {
		let copy = [];
		this.coords.forEach((val, index) => {
			copy[index] = new XY(val.x, val.y);
		});
		return copy;
	}

	updateLastCoord(x, y) {
		this.coords[this.coords.length - 1] = new XY(x, y);
	}

	move(xy) {
		let coord = this.firstCoord();
		if (coord != undefined) {
			this.coords[0] = coord.sum(xy);
		}
	}

	isValidShape() {
		return this.coords.length >= 1;
	}

	sethref(url) {
		this.href = url;
	}

	firstCoord() {
		return this.coords[0];
	}

	distToFirstCoord(x, y) {
		let coord = new XY(x, y);
		return XY.dist(coord, this.firstCoord());
	}

	htmlCoords(scale, dec) {
		return this.getCoords("html").map(c => {
			return c.toHtml(scale, dec);
		}).join(',');
	}

	toHtml(scale) {
		let htmlCoords = this.htmlCoords(scale, 0);
		if (htmlCoords != "")
			htmlCoords = 'coords="' + htmlCoords + '" ';
		return '<area shape="' + this.shape + '" ' + htmlCoords + 'href="' + this.href + '" alt="' + this.href + '"/>';
	}

	svgArea(scale) { }

	toSvg(scale) {
		return '<a xlink:href="' + this.href + '">' + this.svgArea(scale) + '</a>';
	}
}

class AreaRect extends Area {
	/**
	 * @param {XY[]} coords the list of coordinates
	 * @param {string} href the link this area is going to point to
	 */
	constructor(coords = [], href) {
		super("rect");
		this.coords = coords.slice(0, 2);
	}

	updateLastCoord(x, y) {
		if (this.coords.length == 2) {
			var fCoord = this.firstCoord();
			this.coords[1] = new XY(x - fCoord.x, y - fCoord.y);
		}
	}

	isValidShape() {
		return this.coords.length == 2 && !this.coords[1].oneIsEmpty();
	}

	isHover(x, y) {
		var fCoord = this.firstCoord();
		var lCoord = this.coords[1].sum(fCoord);
		return between(x, fCoord.x, lCoord.x) && between(y, fCoord.y, lCoord.y);
	}

	display(p5) {
		p5.rect(this.coords[0].x, this.coords[0].y, this.coords[1].x, this.coords[1].y);
	}

	getCoords(mode = "default") {
		switch (mode) {
			case "html":
				let coords = this.copyCoords();
				coords[1] = coords[1].sum(coords[0]);
				if (coords[0].x > coords[1].x) XY.swap(coords[0], coords[1], "x")
				if (coords[0].y > coords[1].y) XY.swap(coords[0], coords[1], "y")
				return coords;
			default:
				return super.getCoords(mode);
		}
	}

	svgArea(scale) {
		return '<rect x="' + this.coords[0].toString(scale, 0, 'x') + '" y="' + this.coords[0].toString(scale, 0, 'y') + '" width="' + this.coords[1].toString(scale, 0, 'x') + '" height="' + this.coords[1].toString(scale, 0, 'y') + '" />'
	}
}

class AreaCircle extends Area {
	/**
	 * @param {XY[]} coords the list of coordinates
	 * @param {number} radius radius of the circle
	 * @param {string} href the link this area is going to point to
	 */
	constructor(coords = [], radius = 0, href) {
		super("circle", coords, href);
		this.radius = radius;
		this.getCenter = this.firstCoord;
	}

	isValidShape() {
		return super.isValidShape() && this.radius > 0;
	}

	isHover(x, y) {
		var center = this.getCenter();
		return XY.dist(new XY(x, y), center) < this.radius;
	}

	updateLastCoord(x, y) {
		var center = this.getCenter();
		this.radius = XY.dist(center, new XY(x, y));
	}

	display(p5) {
		p5.ellipse(this.getCenter().x, this.getCenter().y, this.radius * 2);
	}

	htmlCoords(scale, dec) {
		return this.getCenter().toHtml(scale, dec) + "," + round(this.radius / scale, dec);
	}

	svgArea(scale) {
		return '<circle cx="' + this.coords[0].toString(scale, 0, 'x') + '" cy="' + this.coords[0].toString(scale, 0, 'y') + '" r="' + round(this.radius / scale, 0) + '" />'
	}
}
class AreaPoly extends Area {
	/**
	 * @param {XY[]} coords the list of coordinates
	 * @param {string} href the link this area is going to point to
	 */
	constructor(coords = [], href) {
		super("poly", coords, href);
	}

	isValidShape() {
		return this.coords.length >= 4;
	}

	isHover(x, y) {
		var cornersX = this.coords.map(c => { return c.x });
		var cornersY = this.coords.map(c => { return c.y });

		var i, j = cornersX.length - 1;
		var oddNodes = false;

		var polyX = cornersX;
		var polyY = cornersY;

		for (i = 0; i < cornersX.length; i++) {
			if ((polyY[i] < y && polyY[j] >= y || polyY[j] < y && polyY[i] >= y) && (polyX[i] <= x || polyX[j] <= x)) {
				oddNodes ^= (polyX[i] + (y - polyY[i]) / (polyY[j] - polyY[i]) * (polyX[j] - polyX[i]) < x);
			}
			j = i;
		}

		return oddNodes;
	}

	isClosable(x, y, dist = 5) {
		return this.isValidShape() && this.distToFirstCoord(x, y) < dist;
	}

	close() {
		this.coords[this.coords.length - 1] = this.firstCoord();
	}

	move(xy) {
		this.coords = this.coords.map(c => c.sum(xy));
	}

	display(p5) {
		p5.beginShape();
		this.coords.forEach(c => p5.vertex(c.x, c.y));
		p5.endShape();
	}

	svgArea(scale) {
		let points = this.coords.map(c => {
			return c.toString(scale, 0, 'x') + ',' + c.toString(scale, 0, 'y');
		}).join(' ');
		return '<polygon points="' + points + '" />'
	}
}

class AreaDefault extends Area {
	/**
	 * Constructor
	 * @param {string} href the link this area is going to point to
	 */
	constructor(href) {
		super("default", [], href);
		this.isDefault = true;
	}

	isValidShape() {
		return true;
	}

	isHover() {
		return true;
	}

	display(p5) {
		p5.rect(0, 0, p5.width - 1, p5.height - 1);
	}
}