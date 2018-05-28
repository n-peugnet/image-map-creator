class ImageMap {

	/**
	 * Contructor
	 * @param {Area[]} areas 
	 * @param {string} name 
	* @param {boolean} hasDefaultArea
	 */
	constructor(areas = [], name, hasDefaultArea = false) {
		this.areas = areas;
		this.dArea = new AreaDefault();
		this.name = name;
		this.hasDefaultArea = hasDefaultArea;
		this.lastId = 0;
	}

	setName(name) {
		this.name = name.replace(/\s+/g, "");
	}

	setDefaultArea(bool) {
		this.hasDefaultArea = bool;
	}

	getAreas(all = true) {
		var areas = this.areas.slice();
		if (all && this.hasDefaultArea) areas.unshift(this.dArea);
		return areas;
	}

	/**
	 * Adds an Area at the end of the areas array, and returns the last inserted Area's id
	 * @param {Area} area an area
	 */
	addArea(area, setId = true) {
		if (setId)
			area.id = this.getNewId();
		this.areas.push(area);
		return area.id;
	}

	rmvArea(id) {
		var index = this.areaIndex(id);
		this.areas.splice(index, 1);
	}

	popArea() {
		return this.areas.pop()
	}

	areaIndex(id) {
		return this.areas.findIndex(a => {
			return a.id == id;
		});
	}

	getNewId() {
		this.lastId++;
		return this.lastId;
	}

	toHtml() {
		var areas = [];
		this.areas.forEach(a => {
			if (a.isValidShape())
				areas.push('\t' + a.toHtml());
		});
		return '<map name="' + this.name + '" id="map-id">\n' + areas.reverse().join('\n') + '\n</map>';
	}

	/** Removes avery areas from the areas array */
	clearAreas() {
		this.areas = [];
	}

	setAreas(areas) {
		this.areas = areas;
	}

}