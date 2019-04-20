//@ts-check

import { Area } from "./class.area";
import { Coord } from "./class.coord";

export class Selection {

	/**
	 * @param {Area} area  area
	 * @param {Coord} point  point
	 */
	constructor(area = null, point = null) {
		this.area = area;
		this.point = point;
		this.setOrigin(new Coord);
	}

	/**
	 * 
	 * @param {Coord} coord 
	 */
	setOrigin(coord = null) {
		this.origin = coord.clone();
	}

	autosetOrigin() {
		if (!this.isEmpty()) {
			this.setOrigin(this.getPosition());
		}
	}

	/**
	 * 
	 * @param {Area} area 
	 * @param {Coord} point 
	 * @param {Coord} origin 
	 */
	update(area, point) {
		this.area = area;
		this.point = point;
		this.autosetOrigin();
	}

	getArea() {
		return this.area ? this.area : false;
	}

	getPoint() {
		return this.point ? this.point : false;
	}

	value() {
		if (this.point) {
			return this.getPoint();
		} else {
			return this.getArea();
		}
	}

	getMove() {
		return this.getPosition().diff(this.origin);
	}

	clear() {
		this.area = null;
		this.point = null;
		this.origin = new Coord();
	}

	isEmpty() {
		return !this.area && !this.point;
	}

	//------------------------ Start Interface Movable -------------------------------
	move(coord) {
		if (this.point) {
			this.point.move(coord);
		} else {
			this.area.move(coord);
		}
	}

	getPosition() {
		if (this.point) {
			return this.point.getPosition();
		} else {
			return this.area.getPosition();
		}
	}

	setPosition(coord) {
		if (this.point) {
			this.point.setPosition(coord);
		} else {
			this.area.setPosition(coord);
		}
	}
	//------------------------- End Interface Movable --------------------------------
}