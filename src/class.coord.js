//@ts-check

import { round } from "./utils";

/**
 * Class representing a 2d xy coordinate
*/
export class Coord {
	constructor(x, y) {
		this.set(x, y);
	}

	set(x, y) {
		this.x = x;
		this.y = y;
	}

	static fromObject(obj) {
		return new Coord(obj.x, obj.y);
	}

	/**
	 * returns the distance between two xy coordinates
	 * @param {Coord} coord1 
	 * @param {Coord} coord2 
	 */
	static dist(coord1, coord2) {
		return Math.sqrt(Math.pow(coord1.x - coord2.x, 2) + Math.pow(coord1.y - coord2.y, 2));
	}

	/**
	 *exchange a value between two xy coordinates
	 * @param {Coord} coord1 
	 * @param {Coord} coord2 
	 * @param {string} val
	 */
	static swap(coord1, coord2, val) {
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
	sum(coord) {
		return new Coord(this.x + coord.x, this.y + coord.y);
	}

	/**
	 * Add the value of the given coordinate to the current one
	 * @param {Coord} coord 
	 */
	add(coord) {
		this.x += coord.x;
		this.y += coord.y;
	}

	/**
	 * returns the difference of two xy coordinates
	 * @param {Coord} coord 
	 */
	diff(coord) {
		return new Coord(this.x - coord.x, this.y - coord.y);
	}

	/**
	 * Substract the value of the given coordinate to the current one
	 * @param {Coord} coord 
	 */
	sub(coord) {
		this.x -= coord.x;
		this.y -= coord.y;
	}

	//------------------------ Start Interface Movable -------------------------------
	/**
	 * Alias of add
	 * @param {Coord} coord
	 */
	move(coord) {
		this.add(coord);
	}

	getPosition() {
		return this;
	}

	setPosition(coord) {
		this.set(coord.x, coord.y);
	}
	//------------------------- End Interface Movable --------------------------------

	clone() {
		return new Coord(this.x, this.y);
	}

	invert() {
		return new Coord(- this.x, -this.y);
	}

	toStr(dec, val, scale) {
		return round(this[val] * scale, dec)
	}

	toHtml(dec, scale = 1) {
		return this.toStr(dec, "x", scale) + "," + this.toStr(dec, "y", scale);
	}

}