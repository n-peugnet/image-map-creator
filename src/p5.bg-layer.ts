//@ts-check

import { imageMapCreator } from "./p5.image-map-creator";

/**
 * Class representing the semi transparent layer which can appear on top of the background
 * @param {number} speed the speed of the opacity animation (1-255, default 15)
 */
export class BgLayer {

	constructor(
		protected iMap: imageMapCreator,
		protected speed = 15,
		protected alpha = 0,
		protected over = false
	) {}

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
		this.iMap.p5.noStroke();
		this.iMap.p5.fill(255, 255, 255, this.alpha);
		this.iMap.p5.rect(
			this.iMap.trueX(0),
			this.iMap.trueY(0),
			this.iMap.p5.width / this.iMap.view.scale,
			this.iMap.p5.height / this.iMap.view.scale
		);
	}
}