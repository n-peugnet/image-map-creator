class MappedImage {

	/**
	 * 
	 * @param {Area[]} areas 
	 * @param {string} image 
	 */
	constructor(areas, image) {
		this.areas = areas;
		this.image = image;
		this.tempA = null;
	}

	addArea(area) {
		this.areas.push(area);
	}

	drawArea(x, y) {
		if (this.tempA === null)
			this.tempA = new Area("rect", [x, y]);
		else
			this.tempA.addCoord(x, y);
		console.log(x, y);
		
	}
}