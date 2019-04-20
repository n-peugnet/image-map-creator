import { round } from "./utils";

type Axle = "x"|"y";

/**
 * Class representing a 2d xy coordinate
*/
export class Coord {
	public x: number;
	public y: number;
	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	set(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	static fromObject(obj: Object) {
		return new Coord((<Coord>obj).x, (<Coord>obj).y);
	}

	/**
	 * returns the distance between two xy coordinates
	 * @param {Coord} coord1 
	 * @param {Coord} coord2 
	 */
	static dist(coord1: Coord, coord2: Coord) {
		return Math.sqrt(Math.pow(coord1.x - coord2.x, 2) + Math.pow(coord1.y - coord2.y, 2));
	}

	/**
	 *exchange a value between two xy coordinates
	 * @param {Coord} coord1 
	 * @param {Coord} coord2 
	 * @param {Axle} val
	 */
	static swap(coord1: Coord, coord2: Coord, val: Axle) {
		let tmp = coord1[val];
		coord1[val] = coord2[val];
		coord2[val] = tmp;
	}

	isEmpty() {
		return !this.x && !this.y;
	}

	oneIsEmpty() {
		return !this.x || !this.y
	}

	/**
	 * returns the sum of two xy coordinates
	 * @param {Coord} coord 
	 */
	sum(coord: Coord) {
		return new Coord(this.x + coord.x, this.y + coord.y);
	}

	/**
	 * Add the value of the given coordinate to the current one
	 * @param {Coord} coord 
	 */
	add(coord: Coord) {
		this.x += coord.x;
		this.y += coord.y;
	}

	/**
	 * returns the difference of two xy coordinates
	 * @param {Coord} coord 
	 */
	diff(coord: Coord) {
		return new Coord(this.x - coord.x, this.y - coord.y);
	}

	/**
	 * Substract the value of the given coordinate to the current one
	 * @param {Coord} coord 
	 */
	sub(coord: Coord) {
		this.x -= coord.x;
		this.y -= coord.y;
	}

	//------------------------ Start Interface Movable -------------------------------
	/**
	 * Alias of add
	 * @param {Coord} coord
	 */
	move(coord: Coord) {
		this.add(coord);
	}

	getPosition() {
		return this;
	}

	setPosition(coord: Coord) {
		this.set(coord.x, coord.y);
	}
	//------------------------- End Interface Movable --------------------------------

	clone() {
		return new Coord(this.x, this.y);
	}

	invert() {
		return new Coord(- this.x, -this.y);
	}

	toStr(dec: number, val: Axle, scale: number) {
		return round(this[val] * scale, dec)
	}

	toHtml(dec: number, scale = 1) {
		return this.toStr(dec, "x", scale) + "," + this.toStr(dec, "y", scale);
	}

}