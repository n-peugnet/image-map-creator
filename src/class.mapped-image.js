class MappedImage {

	/**
	 * 
	 * @param {Area[]} areas 
	 * @param {string} image 
	 */
	constructor(areas = [], image) {
		this.areas = areas;
		this.image = image;
	}

	addArea(area) {
		this.areas.push(area);
	}
}