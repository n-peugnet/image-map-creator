class ImageMap {

	/**
	 * Contructor
	 * @param {Area[]} areas 
	 * @param {string} name 
	 */
	constructor(areas = [], name) {
		this.areas = areas;
		this.name = name;
		this.lastId = 0;
		this.undoManager = new UndoManager();
	}

	setName(name) {
		this.name = name.replace(/\s+/g, "");
	}

	/**
	 * Adds an Area at the begining of the areas array, and returns it's new length
	 * @param {Area} area an area
	 */
	unshiftArea(area) {
		return this.areas.unshift(area);
	}

	/**
	 * Adds an Area at the end of the areas array, and returns it's new length
	 * @param {Area} area an area
	 */
	addArea(area) {
		return this.areas.push(area);
	}

	rmvArea(id) {
		var index = this.areaIndex(id);
		this.areas.splice(index, 1);
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

	createArea(area) {
		area.id = this.getNewId();
		this.addArea(area);
		var self = this;
		this.undoManager.add({
			undo: function () {
				self.rmvArea(area.id);
			},
			redo: function () {
				self.addArea(area);
			}
		})
	}
	
	addDefaultArea() {
		var area = new AreaDefault();
		area.id = this.getNewId();
		this.unshiftArea(area);
		var self = this;
		this.undoManager.add({
			undo: function () {
				self.rmvArea(area.id);
			},
			redo: function () {
				self.unshiftArea(area);
			}
		})
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
}