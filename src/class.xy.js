/**
 * Class representing a 2d xy coordinate
*/
class XY {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	/**
	 * returns the distance between two xy coordinates
	 * @param {XY} xy1 
	 * @param {XY} xy2 
	 */
	static dist(xy1, xy2) {
		return Math.sqrt(Math.pow(xy1.x - xy2.x, 2) + Math.pow(xy1.y - xy2.y, 2));
	}

	/**
	 *exchange a value between two xy coordinates
	 * @param {XY} xy1 
	 * @param {XY} xy2 
	 * @param {string} val
	 */
	static swap(xy1, xy2, val) {
		let tmp = xy1[val];
		xy1[val] = xy2[val];
		xy2[val] = tmp;
	}

	isEmpty() {
		return !this.x && !this.y;
	}

	oneIsEmpty() {
		return !this.x || !this.y
	}

	/**
	 * returns the sum of two xy coordinates
	 * @param {XY} xy 
	 */
	sum(xy) {
		return new XY(this.x + xy.x, this.y + xy.y);
	}

	toString(scale, dec) {
		return round(this.x / scale, dec) + "," + round(this.y / scale, dec);
	}

}