import { round } from "./utils";
import { Movable } from "./interface.movable";

type Axle = "x"|"y";

/**
 * Class representing a 2d xy coordinate
*/
export class Coord implements Movable {

	constructor(
		public x: number = 0,
		public y: number = 0
	) {}

	set(x: number, y: number): this {
		this.x = x;
		this.y = y;
		return this;
	}

	static fromObject(obj: Object): Coord {
		return new Coord((<Coord>obj).x, (<Coord>obj).y);
	}

	/**
	 * returns the distance between two xy coordinates
	 * @param {Coord} coord1 
	 * @param {Coord} coord2 
	 */
	static dist(coord1: Coord, coord2: Coord): number {
		return Math.sqrt(Math.pow(coord1.x - coord2.x, 2) + Math.pow(coord1.y - coord2.y, 2));
	}

	/**
	 * Exchanges a value between two xy coordinates
	 * @param {Coord} coord1 
	 * @param {Coord} coord2 
	 * @param {Axle} val
	 */
	static swap(coord1: Coord, coord2: Coord, val: Axle): void {
		let tmp = coord1[val];
		coord1[val] = coord2[val];
		coord2[val] = tmp;
	}

	isEmpty(): boolean {
		return !this.x && !this.y;
	}

	oneIsEmpty(): boolean {
		return !this.x || !this.y
	}

	/**
	 * returns the sum of two xy coordinates
	 * @param {Coord} coord 
	 */
	sum(coord: Coord): Coord {
		return new Coord(this.x + coord.x, this.y + coord.y);
	}

	/**
	 * Add the value of the given coordinate to the current one
	 * @param {Coord} coord 
	 */
	add(coord: Coord): this {
		this.x += coord.x;
		this.y += coord.y;
		return this;
	}

	/**
	 * returns the difference of two xy coordinates
	 * @param {Coord} coord 
	 */
	diff(coord: Coord): Coord {
		return new Coord(this.x - coord.x, this.y - coord.y);
	}

	/**
	 * Substract the value of the given coordinate to the current one
	 * @param {Coord} coord 
	 */
	sub(coord: Coord): this {
		this.x -= coord.x;
		this.y -= coord.y;
		return this;
	}

	//------------------------ Start Interface Movable -------------------------------
	/**
	 * Alias of add
	 * @param {Coord} coord
	 */
	move(coord: Coord): void {
		this.add(coord);
	}

	getPosition(): Coord {
		return this;
	}

	setPosition(coord: Coord): this {
		this.set(coord.x, coord.y);
		return this;
	}
	//------------------------- End Interface Movable --------------------------------

	clone(): Coord {
		return new Coord(this.x, this.y);
	}

	invert(): Coord {
		return new Coord(- this.x, -this.y);
	}

	toStr(dec: number, val: Axle, scale: number): string {
		return round(this[val] * scale, dec).toString();
	}

	toHtml(dec: number, scale = 1): string {
		return this.toStr(dec, "x", scale) + "," + this.toStr(dec, "y", scale);
	}

}