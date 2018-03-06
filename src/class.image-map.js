class ImageMap {

	/**
	 * Contructor
	 * @param {Area[]} areas 
	 * @param {string} image 
	 */
	constructor(areas = [], image) {
		this.areas = areas;
		this.image = image;
	}

	unshiftArea(area) {
		this.areas.unshift(area);
	}

	addArea(area) {
		this.areas.push(area);
	}

	clearAreas() {
		this.areas = [];
	}
}