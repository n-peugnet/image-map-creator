//@ts-check

import { Area } from "./class.area";
import { Coord } from "./class.coord";

export class Selection {
	protected origin: Coord;

	constructor(
		public area: Area|null = null,
		public point: Coord|null = null
	) {
		this.origin = new Coord;
	}

	setOrigin(coord: Coord) {
		this.origin = coord.clone();
	}

	autosetOrigin() {
		if (!this.isEmpty()) {
			this.setOrigin(this.getPosition());
		}
	}

	update(area: Area|null = null, point: Coord|null = null) {
		this.area = area;
		this.point = point;
		this.autosetOrigin();
	}

	getArea(): Area|null {
		return this.area;
	}

	getPoint(): Coord|null {
		return this.point;
	}

	value(): Coord|Area|null {
		if (this.point !== null) {
			return this.getPoint();
		} else if (this.area !== null) {
			return this.getArea();
		}
		return null;
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
	move(coord: Coord) {
		if (this.point !== null) {
			this.point.move(coord);
		} else if(this.area !== null) {
			this.area.move(coord);
		}
	}

	getPosition(): Coord {
		if (this.point !== null) {
			return this.point.getPosition();
		} else if(this.area !== null) {
			return this.area.getPosition();
		}
		return this.origin;
	}

	setPosition(coord: Coord) {
		if (this.point !== null) {
			this.point.setPosition(coord);
		} else if(this.area !== null) {
			this.area.setPosition(coord);
		}
	}
	//------------------------- End Interface Movable --------------------------------
}