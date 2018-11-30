import { round } from "./utils";
import { Coord } from "./class.coord";
import p5 from "p5";
import { IMovable } from "./interface.movable";

export type Shape = "rect" | "circle" | "poly" | "default";
export type Mode = "default"

export class Area implements IMovable {
	/**
	 * @param {string} shape the type of area
	 * @param {Coord[]} coords the list of coordinates
	 * @param {string} href the link this area is going to point to
	 * @param {int} id the unique id
	 */
	constructor(public shape: Shape, public coords: Coord[] = [], public href: string, public title: string,
		public id: number = 0) {
		this.setShape(shape);
		this.setCoords(coords);
		this.setHref(href);
		this.setTitle(title);
		this.setId(id);
	}

	static fromObject(o:Area) {
		switch (o.shape) {
			case "rect":
				return new AreaRect(o.coords.map(Coord.fromObject), o.href, o.title, o.id);
			case 'circle':
				return new AreaCircle(o.coords.map(Coord.fromObject), o.radius, o.href, o.title, o.id);
			case 'poly':
				return new AreaPoly(o.coords.map(Coord.fromObject), o.href, o.title, o.id, o.closed);
			case 'default':
				return new AreaDefault(o.href, o.title);
			default:
				throw 'Not an area'
		}
	}

	setShape(shape: Shape) {
		this.shape = shape;
	}

	/**
	 * Adds a coordinate to the coords array, and returns it's new length
	 * @param {Coord} coord coordinate
	 */
	addCoord(coord: Coord): number {
		return this.coords.push(coord);
	}

	/**
	 * @param {Coord[]} coords
	 */
	setCoords(coords: Coord[]): void {
		this.coords = coords;
	}

	getCoords(mode: Mode = "default"): Coord[] {
		switch (mode) {
			case "default":
			default:
				return this.coords.slice();
		}
	}

	getPoints(): Coord[] {
		return this.coords;
	}

	isEmpty(): boolean {
		return this.coords.length == 0;
	}

	/**
	 * @param {Area} area
	 */
	equals(area: Area): boolean {
		return this.id == area.id;
	}

	copyCoords(): Coord[] {
		let copy: Coord[] = [];
		this.coords.forEach((val, index) => {
			copy[index] = new Coord(val.x, val.y);
		});
		return copy;
	}

	updateLastCoord(coord: Coord): void {
		this.coords[this.coords.length - 1] = coord;
	}

	//------------------------ Start Interface Movable -------------------------------
	move(coord: Coord): void {
		let fcoord = this.firstCoord();
		if (coord != undefined) {
			fcoord.add(coord);
		}
	}

	getPosition(): Coord {
		return this.firstCoord();
	}

	setPosition(coord: Coord): void {
		let move = this.coords[0].diff(coord);
		 this.move(move);
	}
	//------------------------- End Interface Movable --------------------------------

	isDrawable(): boolean {
		return this.coords.length >= 1;
	}

	isValidShape(): boolean {
		return this.isDrawable();
	}

	/**
	 * @param {Coord} coord
	 */
	isOver(coord: Coord): boolean {
		return false;
	}

	/**
	 * @param {Coord} coord
	 * @param {number} tolerance
	 * @returns {Coord|false}
	 */
	isOverPoint(coord: Coord, tolerance: number): boolean {
		let point = this.getPoints().find(c => {
			return Coord.dist(coord, c) < tolerance;
		});
		return point ? point : false;
	}

	setHref(url: string): void {
		this.href = url;
	}

	setTitle(title: string): void {
		this.title = title;
	}

	setId(id: number): void {
		this.id = id;
	}

	firstCoord(): Coord {
		return this.coords[0];
	}

	htmlCoords(dec: number, scale: number): string {
		return this.getCoords("html").map(c => {
			return c.toHtml(dec, scale);
		}).join(',');
	}

	toHtml(scale: number = 1): string {
		let htmlCoords = this.htmlCoords(0, scale);
		let title = "";
		if (htmlCoords != "") {
			htmlCoords = `coords="${htmlCoords}"`;
		}
		if (this.title) {
			title = `title="${this.title}"`;
		}
		return `<area shape="${this.shape}" ${htmlCoords} href="${this.href}" alt="${this.href}" ${title} />`;
	}

	svgArea(scale: number): void { }

	toSvg(scale: number = 1): string {
		return `<a xlink:href="${this.href}">${this.svgArea(scale)}</a>`;
	}
}

export class AreaCircle extends Area {
	/**
	 * @param {Coord[]} coords the list of coordinates
	 * @param {number} radius radius of the circle
	 * @param {string} href the link this area is going to point to
	 * @param {int} id the unique id
	 */
	constructor(coords = [], public radius = 0, public href: string, public title: string, public id: number) {
		super("circle", coords, href, title, id);
		this.radius = radius;
	}

	getCenter(): Coord {
		return this.firstCoord();
	}

	isValidShape(): boolean {
		return super.isValidShape() && this.radius > 0;
	}

	/**
	 * @param {Coord} coord
	 */
	isOver(coord: Coord): boolean {
		let center = this.getCenter();
		return Coord.dist(coord, center) < this.radius;
	}

	updateLastCoord(coord: Coord): void {
		let center = this.getCenter();
		this.radius = Coord.dist(center, coord);
	}

	/**
	 * draw the area to the given p5 instance
	 * @param {p5} p5
	 */
	display(p5: p5): void {
		p5.ellipse(this.getCenter().x, this.getCenter().y, this.radius * 2);
	}

	htmlCoords(dec: number, scale: number): string {
		return this.getCenter().toHtml(dec, scale) + "," + round(this.radius, dec);
	}

	svgArea(scale: number): string {
		let x = this.coords[0].toStr(0, 'x', scale);
		let y = this.coords[0].toStr(0, 'y', scale);
		let r = round(this.radius, 0);
		return `<circle cx="${x}" cy="${y}" r="${r}" />`;
	}
}

export class AreaPoly extends Area {
	/**
	 * @param {Coord[]} coords the list of coordinates
	 * @param {string} href the link this area is going to point to
	 * @param {int} id the unique id
	 */
	constructor(public coords: Coord[] = [], public href: string, public title: string,
		public id: number, public closed = false) {
		super("poly", coords, href, title, id);
		this.closed = closed;
	}

	isDrawable(): boolean {
		return this.coords.length >= 2;
	}

	isValidShape(): boolean {
		return super.isValidShape() && this.closed;
	}

	/**
	 * @param {Coord} coord
	 */
	isOver(coord: Coord): boolean {
		let x = coord.x;
		let y = coord.y;
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

	isClosable(coord: Coord, tolerance: number): boolean {
		let dist = Coord.dist(coord, this.firstCoord());
		return this.coords.length >= 4 && dist < tolerance;
	}

	getCoords(mode: Mode = "default"): Coord[] {
		let coords = super.getCoords();
		switch (mode) {
			case "default":
			default:
				if (this.closed) {
					coords.push(this.firstCoord());
				}
				return coords;
		}
	}

	close(): void {
		this.closed = true;
		this.coords.pop();
	}

	move(coord: Coord): void {
		this.coords.map(c => c.add(coord));
	}

	/**
	 * draw the area to the given p5 instance
	 * @param {p5} p5
	 */
	display(p5: p5): void {
		p5.beginShape();
		this.getCoords().forEach(c => p5.vertex(c.x, c.y));
		p5.endShape();
	}

	svgArea(scale: number): string {
		let points = this.getCoords().map(c => {
			return c.toStr(0, 'x', scale) + ',' + c.toStr(0, 'y', scale);
		}).join(' ');
		return `<polygon points="${points}" />`;
	}
}

export class AreaRect extends AreaPoly {
	/**
	 * @param {Coord[]} coords the list of coordinates
	 * @param {string} href the link this area is going to point to
	 * @param {int} id the unique id
	 */
	constructor(public coords: Coord[] = [], public href: string, public title: string,
		public id: number) {
		super(coords, href, title, id, true);
		if (this.coords.length > 0 && this.coords.length < 4) {
			let coord = this.firstCoord();
			this.coords = [
				coord,
				coord.clone(),
				coord.clone(),
				coord.clone(),
			];
		}
	}

	updateLastCoord(coord: Coord): void {
		this.coords[1].x = coord.x
		this.coords[2] = coord;
		this.coords[3].y = coord.y;
	}

}

export class AreaDefault extends Area {
	/**
	 * Constructor
	 * @param {string} href the link this area is going to point to
	 */
	constructor(public href: string, public title: string) {
		super("default", [], href, title);
		this.isDefault = true;
	}

	isDefault: boolean;

	isDrawable() {
		return true;
	}

	isOver() {
		return true;
	}

	/**
	 * draw the area to the given p5 instance
	 * @param {p5} p5
	 */
	display(p5: p5) {
		p5.rect(0, 0, p5.getMap().width - 1, p5.getMap().height - 1);
	}

	svgArea(scale: number): string {
		return '<rect x="0" y="0" width="100%" height="100%" />';
	}
}