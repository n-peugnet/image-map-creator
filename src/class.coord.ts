import { round } from "./utils";
import { IMovable } from "./interface.movable";

/**
 * Class representing a 2d xy coordinate
*/
export class Coord implements IMovable {
         constructor(public x: number | null = null, public y: number | null = null) {
           this.set(x, y);
         }

         set(x: number | null, y: number | null): void {
           this.x = x;
           this.y = y;
         }

         static fromObject(obj: Coord) {
           return new Coord(obj.x, obj.y);
         }

         /**
          * returns the distance between two xy coordinates
          * @param {Coord} coord1
          * @param {Coord} coord2
          */
         static dist(coord1: Coord, coord2: Coord): number {
			 if (coord1.x && coord1.y && coord2.x && coord2.y) {
				 return Math.sqrt(Math.pow(coord1.x - coord2.x, 2) + Math.pow(coord1.y - coord2.y, 2));
			 }

			 return 0;
         }

         /**
          *exchange a value between two xy coordinates
          * @param {Coord} coord1
          * @param {Coord} coord2
          * @param {string} val
          */
         static swap(coord1: Coord, coord2: Coord, val: string) {
           let tmp = coord1[val];
           coord1[val] = coord2[val];
           coord2[val] = tmp;
         }

         isEmpty(): boolean {
           return !this.x && !this.y;
         }

         oneIsEmpty(): boolean {
           return !this.x || !this.y;
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
         add(coord: Coord): void {
           this.x += coord.x;
           this.y += coord.y;
         }

         /**
          * returns the difference of two xy coordinates
          * @param {Coord} coord
          */
         diff(coord: Coord): Coord {
           return new Coord(this.x - coord.x, this.y - coord.y);
         }

         /**
          * Subtract the value of the given coordinate to the current one
          * @param {Coord} coord
          */
         sub(coord: Coord): void {
           this.x -= coord.x;
           this.y -= coord.y;
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

         setPosition(coord: Coord): void {
           this.set(coord.x, coord.y);
         }
         //------------------------- End Interface Movable --------------------------------

         clone(): Coord {
           return new Coord(this.x, this.y);
         }

         invert(): Coord {
           return new Coord(-this.x, -this.y);
         }

         toStr(dec: number, val: string, scale: number): string {
           return round(this[val] * scale, dec).toString();
         }

         toHtml(dec: number, scale: number = 1): string {
           return this.toStr(dec, "x", scale) + "," + this.toStr(dec, "y", scale);
         }
       }