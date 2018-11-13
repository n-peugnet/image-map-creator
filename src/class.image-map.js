import { Area, AreaDefault } from "./class.area";

export class ImageMap {

	/**
	 * Contructor
	 * @param {Area[]} areas 
	 * @param {string} name 
	* @param {boolean} hasDefaultArea
	 */
	constructor(width, height, areas = [], name, hasDefaultArea = false) {
		this.name = name;
		this.width = width;
		this.height = height;
		this.areas = areas;
		this.dArea = new AreaDefault();
		this.hasDefaultArea = hasDefaultArea;
		this.lastId = 0;
	}

	setFromObject(obj) {
		for (const key in obj) {
			if (obj.hasOwnProperty(key)) {
				let value = obj[key];
				if (key == 'areas') {
					this.areas = value.map(Area.fromObject);
				} else if (key == 'dArea') {
					this.dArea = Area.fromObject(value);
				} else if (Object.keys(this).includes(key)) {
					this[key] = value;
				}
			}
		}
	}

	setName(name) {
		if (name) {
			this.name = name.replace(/\s+/g, "");
		}
	}

	setSize(width, height) {
		this.width = width;
		this.height = height;
	}

	setDefaultArea(bool) {
		this.hasDefaultArea = bool;
	}

	/**
	 * Returns a copy of the area of the imageMap
	 * @param {boolean} all with the default area (if exist) or not (default: true)
	 * @returns {Area[]} a copy of the areas
	 */
	getAreas(all = true) {
		let areas = this.areas.slice();
		if (all && this.hasDefaultArea) areas.push(this.dArea);
		return areas;
	}

	/**
	 * Adds an Area at the end of the areas array, and returns the last inserted Area's id
	 * @param {Area} area an area
	 */
	addArea(area, setId = true) {
		if (setId)
			area.setId(this.getNewId());
		this.areas.unshift(area);
		return area.id;
	}

	rmvArea(id) {
		let index = this.areaIndex(id);
		this.areas.splice(index, 1);
		return index;
	}

	/**
	 * Move an area up or down in the areas array
	 * @param {number} id 
	 * @param {number} direction 
	 */
	moveArea(id, direction) {
		let index = this.areaIndex(id);
		let area = this.areas[index];
		let nextIndex = index + direction;
		if (nextIndex < 0 || nextIndex >= this.areas.length)
			return false;
		this.rmvArea(id);
		this.insertArea(area, nextIndex);
		return nextIndex;
	}

	shiftArea() {
		return this.areas.shift();
	}

	popArea() {
		return this.areas.pop();
	}

	insertArea(area, index) {
		this.areas.splice(index, 0, area);
	}

	areaIndex(id) {
		return this.areas.findIndex(a => {
			return a.id == id;
		});
	}

	isFirstArea(id) {
		return this.areaIndex(id) == 0;
	}

	isLastArea(id) {
		return this.areaIndex(id) == this.areas.length - 1;
	}

	getNewId() {
		this.lastId++;
		return this.lastId;
	}

	toHtml(scale = 1) {
		let areas = [];
		this.getAreas().forEach(a => {
			if (a.isValidShape()) {
				areas.push('\t' + a.toHtml(scale));
			}
		});
		return '<map name="' + this.name + '" id="' + this.name + '">\n' + areas.join('\n') + '\n</map>';
	}

	toSvg(scale = 1) {
		let areas = [];
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
	clearAreas() {
		this.areas = [];
	}

	setAreas(areas) {
		this.areas = areas;
	}

}