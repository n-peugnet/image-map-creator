class ImageMap {

	/**
	 * Contructor
	 * @param {Area[]} areas 
	 * @param {string} image 
	 */
	constructor(areas = [], image) {
		this.areas = areas;
		this.image = image;
		this.lastId = 0;
		this.undoManager = new UndoManager();
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
		var index = this.areas.findIndex(a => { return a.id == id; });
		this.areas.splice(index);
	}

	createArea(area) {
		this.lastId++;
		var id = this.lastId;
		area.id = id;
		this.addArea(area);
		var self = this;
		this.undoManager.add({
			undo: function () {
				self.rmvArea(id);
			},
			redo: function () {
				self.addArea(area);
			}
		})
	}

	/** Removes avery areas from the areas array */
	clearAreas() {
		this.areas = [];
	}
}