import { Area, AreaDefault } from "./class.area";

export class ImageMap {

	protected dArea: AreaDefault = new AreaDefault(this);
	protected lastId: number = 0;

	/**
	 * Contructor
	 * @param {Area[]} areas 
	 * @param {string} name 
	 * @param {boolean} hasDefaultArea
	 */
	constructor(
		public width: number,
		public height: number,
		protected areas: Area[] = [],
		protected name: string = "",
		public hasDefaultArea: boolean = false
	) {}

	setFromObject(obj: Object): this {
		const iMap = obj as ImageMap;
		iMap.dArea.iMap = this;
		this.width = iMap.width;
		this.height = iMap.height;
		this.areas = iMap.areas.map(Area.fromObject);
		this.name = iMap.name;
		this.hasDefaultArea = iMap.hasDefaultArea;
		this.dArea = Area.fromObject(iMap.dArea) as AreaDefault;
		return this;
	}

	setName(name: string): this {
		if (name) {
			this.name = name.replace(/\s+/g, "");
		}
		return this;
	}

	getName(): string {
		return this.name;
	}

	setSize(width: number, height: number): this {
		this.width = width;
		this.height = height;
		return this;
	}

	setDefaultArea(bool: boolean): this {
		this.hasDefaultArea = bool;
		return this;
	}

	/**
	 * Returns a copy of the area of the imageMap
	 * @param {boolean} all with the default area (if exist) or not (default: true)
	 * @returns {Area[]} a copy of the areas
	 */
	getAreas(all: boolean = true): Area[] {
		let areas = this.areas.slice();
		if (all && this.hasDefaultArea) areas.push(this.dArea);
		return areas;
	}

	isEmpty(): boolean {
		return this.getAreas().length == 0;
	}

	/**
	 * Adds an Area at the end of the areas array, and returns the last inserted Area's id
	 * @param {Area} area an area
	 */
	addArea(area: Area, setId = true): number {
		if (setId)
			area.setId(this.getNewId());
		this.areas.unshift(area);
		return area.id;
	}

	rmvArea(id: number): number {
		let index = this.areaIndex(id);
		this.areas.splice(index, 1);
		return index;
	}

	/**
	 * Move an area up or down in the areas array
	 * @param {number} id 
	 * @param {number} direction 
	 */
	moveArea(id: number, direction: number): number|false {
		let index = this.areaIndex(id);
		let area = this.areas[index];
		let nextIndex = index + direction;
		if (nextIndex < 0 || nextIndex >= this.areas.length)
			return false;
		this.rmvArea(id);
		this.insertArea(area, nextIndex);
		return nextIndex;
	}

	shiftArea(): Area|undefined {
		return this.areas.shift();
	}

	popArea(): Area|undefined {
		return this.areas.pop();
	}

	insertArea(area: Area, index: number): number {
		this.areas.splice(index, 0, area);
		return this.areas.length;
	}

	areaIndex(id: number): number {
		return this.areas.findIndex(a => {
			return a.id == id;
		});
	}

	isFirstArea(id: number): boolean {
		return this.areaIndex(id) == 0;
	}

	isLastArea(id: number): boolean {
		return this.areaIndex(id) == this.areas.length - 1;
	}

	getNewId(): number {
		this.lastId++;
		return this.lastId;
	}

	toHtml(scale = 1): string {
		let areas: string[] = [];
		this.getAreas().forEach(a => {
			if (a.isValidShape()) {
				areas.push('\t' + a.toHtml(scale));
			}
		});
		return '<map name="' + this.name + '" id="' + this.name + '">\n' + areas.join('\n') + '\n</map>';
	}

	toSvg(scale = 1): string {
		let areas: string[] = [];
		this.getAreas(false).forEach(a => {
			if (a.isValidShape()) {
				areas.push('\t' + a.toSvg(scale));
			}
		});
		let str = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="' + this.width + '" height="' + this.height + '">\n';
		str += areas.join('\n');
		str += '\n</svg>';
		return str;
	}

	/** Removes every areas from the areas array */
	clearAreas(): this {
		this.areas = [];
		return this;
	}

	setAreas(areas: Area[]): this {
		this.areas = areas;
		return this;
	}

}