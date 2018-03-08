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

	/** Removes avery areas from the areas array */
	clearAreas() {
		this.areas = [];
	}
}