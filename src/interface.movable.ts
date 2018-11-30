import { Coord } from "./class.coord";

export interface IMovable {
    move(coord: Coord): void;
    getPosition(): Coord;
    setPosition(coord: Coord): void;
}