//@ts-check

import { Area } from "./class.area";
import { Coord } from "./class.coord";

export class Selection {
	protected origin: Coord = new Coord();
	protected position: Coord = this.origin.clone();
	protected areas: Map<number, Area> = new Map;
	protected points: Map<Coord, number> = new Map;

	constructor() {}

	resetOrigin(coord: Coord = new Coord()): void {
		this.origin = coord.clone();
		this.position = coord;
		this.addPoint(coord);
	}

	/**
	 * Register an Area as a part of the selection
	 */
	registerArea(area: Area): void {
		this.areas.set(area.getId(), area);
	}

	/**
	 * Add Area and its points to the selection
	 */
	addArea(area: Area): void {
		this.registerArea(area);
		area.getCoords().forEach((p: Coord) => this.addPoint(p));
	}

	addPoint(point: Coord): void {
		const prev = this.points.get(point) || 0;
		this.points.set(point, prev + 1);
	}

	containsArea(area: Area): boolean {
		return this.areas.has(area.getId());
	}

	containsPoint(point: Coord): boolean {
		return this.points.has(point);
	}

	distToOrigin(): Coord {
		return this.getPosition().diff(this.origin);
	}

	clear(): void {
		this.areas.clear();
		this.points.clear();
		this.origin = new Coord();
	}

	isEmpty(): boolean {
		return this.points.size == 0;
	}

	//------------------------ Start Interface Movable -------------------------------
	move(coord: Coord): void {
		this.points.forEach((nb: number, c: Coord): void => {
			c.move(coord);
		});
	}

	getPosition(): Coord {
		return this.position;
	}

	setPosition(coord: Coord): void {
		const move = coord.diff(this.position);
		this.move(move);
	}
	//------------------------- End Interface Movable --------------------------------
}