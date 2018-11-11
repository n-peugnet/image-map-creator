import { imageMapCreator } from "./p5.image-map-creator";

/**
 * Class representing the semi transparent layer which can appear on top of the background
 * @param {number} speed the speed of the opacity animation (1-255, default 15)
 */
export class BgLayer {

	/**
	 * @param {imageMapCreator} iMap
	 * @param {number} speed
	 */
	constructor(iMap, speed = 15) {
		this.speed = speed;
		this.alpha = 0;
		this.over = false;
		this.p5 = iMap.p5;
	}
	appear() {
		this.over = true;
	}
	disappear() {
		this.over = false;
	}
	display() {
		if (this.over) {
			if (this.alpha < 100)
				this.alpha += this.speed;
		}
		else {
			if (this.alpha > 0)
				this.alpha -= this.speed;
		}
		this.p5.noStroke();
		this.p5.fill(255, 255, 255, this.alpha);
		this.p5.rect(
			iMap.trueX(0),
			iMap.trueY(0),
			this.p5.width / iMap.view.scale,
			this.p5.height / iMap.view.scale
		);
	}
}