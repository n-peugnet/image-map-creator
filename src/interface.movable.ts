import { Coord } from "./class.coord";

export interface Movable {
	move(coord: Coord): void;
	getPosition(): Coord;
	setPosition(coord: Coord): void;
}