import { between } from "./utils";
import { XY } from "./class.xy";

export class Area {
	/**
	 * @param {string} shape the type of area
	 * @param {XY[]} coords the list of coordinates
	 * @param {string} href the link this area is going to point to
	 * @param {int} id the unique id
	 */
	constructor(shape, coords = [], href, id = 0) {
		this.setShape(shape);
		this.setCoords(coords);
		this.setHref(href);
		this.setId(id);
	}

	static fromObject(obj) {
		switch (obj.shape) {
			case 'rect':
				return new AreaRect(obj.coords.map(XY.fromObject), obj.href, obj.id);
			case 'circle':
				return new AreaCircle(obj.coords.map(XY.fromObject), obj.radius, obj.href, obj.id);
			case 'poly':
				return new AreaPoly(obj.coords.map(XY.fromObject), obj.href, obj.id);
			case 'default':
				return new AreaDefault(obj.href);
			default:
				throw 'Not an area'
		}
	}

	setShape(shape) {
		this.shape = shape;
	}

	/**
	 * Adds a coordinate to the coords array, and returns it's new length
	 * @param {number} x the x val of the coordinate
	 * @param {number} y the y val of the coordinate
	 */
	addCoord(x, y) {
		return this.coords.push(new XY(x, y));
	}

	setCoords(coords) {
		this.coords = coords;
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

	isDrawable() {
		return this.coords.length >= 1;
	}

	isValidShape() {
		return this.isDrawable();
	}

	setHref(url) {
		this.href = url;
	}

	setId(id) {
		this.id = id;
	}

	firstCoord() {
		return this.coords[0];
	}

	distToFirstCoord(x, y) {
		let coord = new XY(x, y);
		return XY.dist(coord, this.firstCoord());
	}

	htmlCoords(dec) {
		return this.getCoords("html").map(c => {
			return c.toHtml(dec);
		}).join(',');
	}

	toHtml() {
		let htmlCoords = this.htmlCoords(0);
		if (htmlCoords != "")
			htmlCoords = 'coords="' + htmlCoords + '" ';
		return '<area shape="' + this.shape + '" ' + htmlCoords + 'href="' + this.href + '" alt="' + this.href + '"/>';
	}

	svgArea() { }

	toSvg() {
		return '<a xlink:href="' + this.href + '">' + this.svgArea() + '</a>';
	}
}

export class AreaRect extends Area {
	/**
	 * @param {XY[]} coords the list of coordinates
	 * @param {string} href the link this area is going to point to
	 * @param {int} id the unique id
	 */
	constructor(coords = [], href, id) {
		super("rect", coords, href, id);
	}

	setCoords(coords) {
		super.setCoords(coords.slice(0, 2));
	}

	updateLastCoord(x, y) {
		if (this.coords.length == 2) {
			let fCoord = this.firstCoord();
			this.coords[1] = new XY(x - fCoord.x, y - fCoord.y);
		}
	}

	isDrawable() {
		return this.coords.length == 2 && !this.coords[1].oneIsEmpty();
	}

	isHover(x, y) {
		let fCoord = this.firstCoord();
		let lCoord = this.coords[1].sum(fCoord);
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

	svgArea() {
		return '<rect x="' + this.coords[0].toString(0, 'x') + '" y="' + this.coords[0].toString(0, 'y') + '" width="' + this.coords[1].toString(0, 'x') + '" height="' + this.coords[1].toString(0, 'y') + '" />'
	}
}

export class AreaCircle extends Area {
	/**
	 * @param {XY[]} coords the list of coordinates
	 * @param {number} radius radius of the circle
	 * @param {string} href the link this area is going to point to
	 * @param {int} id the unique id
	 */
	constructor(coords = [], radius = 0, href, id) {
		super("circle", coords, href, id);
		this.radius = radius;
	}

	getCenter() {
		return this.firstCoord;
	}

	isValidShape() {
		return super.isValidShape() && this.radius > 0;
	}

	isHover(x, y) {
		let center = this.getCenter();
		return XY.dist(new XY(x, y), center) < this.radius;
	}

	updateLastCoord(x, y) {
		let center = this.getCenter();
		this.radius = XY.dist(center, new XY(x, y));
	}

	display(p5) {
		p5.ellipse(this.getCenter().x, this.getCenter().y, this.radius * 2);
	}

	htmlCoords(dec) {
		return this.getCenter().toHtml(dec) + "," + round(this.radius, dec);
	}

	svgArea() {
		return '<circle cx="' + this.coords[0].toString(0, 'x') + '" cy="' + this.coords[0].toString(0, 'y') + '" r="' + round(this.radius, 0) + '" />'
	}
}
export class AreaPoly extends Area {
	/**
	 * @param {XY[]} coords the list of coordinates
	 * @param {string} href the link this area is going to point to
	 * @param {int} id the unique id
	 */
	constructor(coords = [], href, id) {
		super("poly", coords, href, id);
	}

	isValidShape() {
		return this.coords.length >= 4;
	}

	isHover(x, y) {
		let cornersX = this.coords.map(c => { return c.x });
		let cornersY = this.coords.map(c => { return c.y });

		let i, j = cornersX.length - 1;
		let oddNodes = false;

		let polyX = cornersX;
		let polyY = cornersY;

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

	svgArea() {
		let points = this.coords.map(c => {
			return c.toString(0, 'x') + ',' + c.toString(0, 'y');
		}).join(' ');
		return '<polygon points="' + points + '" />'
	}
}

export class AreaDefault extends Area {
	/**
	 * Constructor
	 * @param {string} href the link this area is going to point to
	 */
	constructor(href) {
		super("default", [], href);
		this.isDefault = true;
	}

	isDrawable() {
		return true;
	}

	isHover() {
		return true;
	}

	display(p5) {
		p5.rect(0, 0, p5.getMap().width - 1, p5.getMap().height - 1);
	}

	svgArea() {
		return '<rect x="0" y="0" width="100%" height="100%" />'
	}
}