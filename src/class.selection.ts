import { Area } from "./class.area";
import { Coord } from "./class.coord";

export class Selection {
         /**
          * @param {Area} area  area
          * @param {Coord} point  point
          */
         constructor(public area: Area | null = null, public point: Coord | null = null) {
           this.area = area;
           this.point = point;
           this.setOrigin(new Coord());
         }

         /**
          *
          * @param {Coord} coord
          */
         setOrigin(coord: Coord | null = null): void {
           if (coord) {
             this.origin = coord.clone();
           }
         }

         origin?: Coord | null;

         autosetOrigin(): void {
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
         update(area: Area, point: Coord): void {
           this.area = area;
           this.point = point;
           this.autosetOrigin();
         }

         getArea(): Area | boolean {
           return this.area ? this.area : false;
         }

		 getPoint(): Coord | boolean {
           return this.point ? this.point : false;
         }

         value(): Coord | Area | boolean {
           if (this.point) {
             return this.getPoint();
           } else {
             return this.getArea();
           }
         }

         getMove(): Coord {
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

         setPosition(coord: Coord): void {
           if (this.point) {
             this.point.setPosition(coord);
           } else {
             this.area.setPosition(coord);
           }
         }
         //------------------------- End Interface Movable --------------------------------
       }