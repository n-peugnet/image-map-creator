import { ImageMap } from "./class.image-map";
import { BgLayer } from "./p5.bg-layer";
import { Area, AreaCircle, AreaRect, AreaPoly } from "./class.area";
import { XY } from "./class.xy";
import { openWindow } from './utils';
import download from "downloadjs";
import UndoManager from "undo-manager";
import QuickSettings from "quicksettings";
import p5 from "p5";
import ContextMenu from "../lib/contextmenu/contextmenu";
import '../lib/contextmenu/contextmenu.css';

/**
 */
export class imageMapCreator {
	constructor(width = 600, height = 450) {
		this.width = width;
		this.height = height;
		this.tool = "polygon";
		this.drawingTools = ["rectangle", "circle", "polygon"];
		this.settings;
		this.menu = {
			SetUrl: {
				onSelect: (target, key, item, area) => { this.setAreaUrl(area); },
				label: "Set url",
			},
			SetTitle: {
				onSelect: (target, key, item, area) => { this.setAreaTitle(area); },
				label: "Set title",
			},
			Delete: (target, key, item, area) => { this.deleteArea(area); },
			MoveFront: {
				onSelect: (target, key, item, area) => { this.moveArea(area, 1); },
				enabled: true,
				label: "Move Forward",
			},
			MoveBack: {
				onSelect: (target, key, item, area) => { this.moveArea(area, -1); },
				enabled: true,
				label: "Move Backward",
			}
		};
		this.tempArea = new Area();
		this.tempCoord = new XY();
		this.selected = false;
		this.hovered = false;
		this.map = new ImageMap(width, height);
		this.undoManager = new UndoManager();
		this.img;
		this.view = {
			scale: 1,
			transX: 0,
			transY: 0
		}
		this.zoomParams = {
			min: 0.03,
			max: 3,
			sensativity: 0.001
		}
	}

	//---------------------------- p5 Sketch ----------------------------------

	/**
	 * Override p5 methods
	 * @param {p5} p5
	 */
	sketch(p5) {
		this.p5 = p5;
		this.bgLayer = new BgLayer(this);

		p5.setup = () => {
			let canvas = p5.createCanvas(this.width, this.height);
			canvas.drop(this.handeFile.bind(this)).dragLeave(this.onLeave.bind(this)).dragOver(this.onOver.bind(this));
			this.settings = QuickSettings.create(p5.width + 5, 0, "Image-map Creator", p5.canvas.parentElement)
				.setDraggable(false)
				.addText("Map Name", "", (v) => { this.map.setName(v) })
				.addDropDown("Tool", ["polygon", "rectangle", "circle", "move", "delete", "test"], (v) => { this.setTool(v.value) })
				.addBoolean("Default Area", this.map.hasDefaultArea, (v) => { this.setDefaultArea(v) })
				.addButton("Undo", this.undoManager.undo)
				.addButton("Redo", this.undoManager.redo)
				.addButton("Clear", this.clearAreas.bind(this))
				.addButton("Generate Html", () => { this.settings.setValue("Output", this.map.toHtml()) })
				.addButton("Generate Svg", () => { this.settings.setValue("Output", this.map.toSvg()) })
				.addTextArea("Output")
				.addButton("Save", this.exportMap.bind(this));
			// Fix for oncontextmenu
			p5.canvas.addEventListener("contextmenu", (e) => { e.preventDefault(); }); // Select all onclick on the Output field
			// Select all onclick on the Output field
			document.getElementById("Output").setAttribute("onFocus", "this.select();");
		}

		p5.draw = () => {
			this.updateTempArea();
			this.hovered = this.mouseIsHoverArea();
			this.setCursor();
			this.setOutput();
			this.setBackground();
			this.setTitle(this.hovered);
			p5.translate(this.view.transX, this.view.transY);
			p5.scale(this.view.scale);
			this.drawImage();
			this.bgLayer.display();
			this.drawAreas();
		}

		p5.getMap = () => {
			return this.map;
		}

		//------------------------------ p5 Events -----------------------------------

		p5.mousePressed = () => {
			if (this.mouseIsHoverSketch()) {
				if (p5.mouseButton == p5.LEFT && !ContextMenu.isOpen()) {
					switch (this.tool) {
						case "circle":
						case "rectangle":
							this.setTempArea(this.mX(), this.mY());
							break;
						case "polygon":
							if (this.tempArea.isEmpty()) {
								this.setTempArea(this.mX(), this.mY());
							} else if (this.tempArea.isClosable(this.mX(), this.mY(), 5 / this.view.scale)) {
								this.tempArea.close();
								if (this.tempArea.isValidShape())
									this.createArea(this.tempArea);
								this.tempArea = new Area();
							} else {
								this.tempArea.addCoord(this.mX(), this.mY());
							}
							break;
						case "move":
							if (this.hovered) {
								this.selected = this.hovered.shape != "default" ? this.hovered : false;
								this.tempCoord = this.selected.firstCoord();
							}
							break;
					}
				}
			}
		}

		p5.mouseDragged = () => {
			if (this.mouseIsHoverSketch() && !ContextMenu.isOpen()) {
				if (p5.mouseButton == p5.LEFT) {
					switch (this.tool) {
						case "move":
							if (this.selected) {
								let mvmt = new XY(this.mX() - this.trueX(p5.pmouseX), this.mY() - this.trueY(p5.pmouseY));
								this.selected.move(mvmt);
							}
							break;
					}
				} else if (p5.mouseButton == p5.CENTER) {
					this.view.transX += p5.mouseX - p5.pmouseX;
					this.view.transY += p5.mouseY - p5.pmouseY;
				}
			}
		}

		p5.mouseReleased = (e) => {
			switch (this.tool) {
				case "rectangle":
				case "circle":
					if (this.tempArea.isValidShape())
						this.createArea(this.tempArea);
					this.tempArea = new Area();
					break;
				case "move":
					if (this.selected) {
						let area = this.selected;
						let move = area.firstCoord().diff(this.tempCoord);
						this.undoManager.add({
							undo: () => {
								area.move(move.invert());
							},
							redo: () => {
								area.move(move);
							}
						});
					}
					break;
			}
			this.onClick(e);
			this.bgLayer.disappear();
		}

		p5.mouseWheel = (e) => {
			if (this.mouseIsHoverSketch()) {
				let coefZoom = this.view.scale * this.zoomParams.sensativity * - e.delta;
				this.zoom(coefZoom);
			}
		}

		/**
		 * @param {KeyboardEvent} e
		 */
		p5.keyPressed = (e) => {
			if (e.composed && e.ctrlKey) {
				switch (e.key) {
					case 's':
						this.exportMap();
						break;
					case 'z':
						this.undoManager.undo();
						break;
					case 'y':
						this.undoManager.redo();
						break;
					default:
						return true;
				}
				return false;
			} else if (this.tool == "polygon" && e.keyCode == this.p5.ESCAPE) {
				this.tempArea = new Area();
			}
		}
	}

	//---------------------------- Functions ----------------------------------

	mX() {
		return this.trueX(this.p5.mouseX);
	}

	mY() {
		return this.trueY(this.p5.mouseY);
	}

	trueX(coord) {
		return (coord - this.view.transX) / this.view.scale;
	}

	trueY(coord) {
		return (coord - this.view.transY) / this.view.scale;
	}

	mouseIsHoverSketch() {
		return this.p5.mouseX <= this.p5.width && this.p5.mouseX >= 0 && this.p5.mouseY <= this.p5.height && this.p5.mouseY >= 0;
	}

	/**
	 * @returns {Area|false}
	 */
	mouseIsHoverArea() {
		let allAreas = this.map.getAreas();
		let area = allAreas.reverse().find(area => {
			return area.isHover(this.mX(), this.mY());
		});
		return area != undefined ? area : false;
	}

	onClick(event) {
		if (this.mouseIsHoverSketch()) {
			if (this.hovered) {
				if (this.p5.mouseButton == this.p5.RIGHT) {
					this.selected = this.hovered;
					this.menu.MoveFront.enabled = !(this.map.isLastArea(this.hovered.id) || this.hovered.shape == 'default');
					this.menu.MoveBack.enabled = !(this.map.isFirstArea(this.hovered.id) || this.hovered.shape == 'default');
					ContextMenu.display(event, this.menu, {
						position: "click",
						data: this.hovered
					});
					return false; // doesen't work as expected
				} else if (this.p5.mouseButton == this.p5.LEFT && !ContextMenu.isOpen()) {
					switch (this.tool) {
						case "test":
							openWindow(this.hovered.href);
							break;
						case "delete":
							this.deleteArea(this.hovered);
							break;
					}
				}
			}
		}
		this.selected = false;
	}

	onOver(evt) {
		this.bgLayer.appear();
		evt.preventDefault();
	}

	onLeave() {
		this.bgLayer.disappear();
	}

	handeFile(file) {
		if (file.type == "image") {
			this.img = this.p5.loadImage(file.data, img => this.resetView(img));
			if (!this.map.name) {
				this.map.setName(file.name);
				this.settings.setValue("Map Name", this.map.name);
			}
		} else if (file.subtype == 'json') {
			fetch(file.data)
				.then(res => res.blob())
				.then(blob => {
					let reader = new FileReader();
					reader.onload = () => {
						let json = reader.result;
						console.log(json);
						this.importMap(json);
					};
					reader.readAsText(blob);
				});
		}
		this.bgLayer.disappear();
	}

	resetView(img) {
		this.view.scale = 1;
		this.view.transX = 0;
		this.view.transY = 0;
		let xScale = this.p5.width / img.width;
		let yScale = this.p5.height / img.height;
		if (xScale < this.view.scale)
			this.view.scale = xScale;
		if (yScale < this.view.scale)
			this.view.scale = yScale;
		this.map.setSize(img.width, img.height);
	}

	zoom(coef) {

		let newScale = this.view.scale + coef;
		if (newScale > this.zoomParams.min && newScale < this.zoomParams.max) {
			let mouseXToOrigin = this.mX();
			let mouseYToOrigin = this.mY();
			let transX = mouseXToOrigin * coef;
			let transY = mouseYToOrigin * coef;

			this.view.scale = newScale;
			this.view.transX -= transX;
			this.view.transY -= transY;
		}
	}

	drawImage() {
		if (this.img)
			this.p5.image(this.img, 0, 0, this.img.width, this.img.height);
	}

	drawAreas() {
		let allAreas = this.map.getAreas().concat([this.tempArea]);
		allAreas.forEach(area => {
			this.setAreaStyle(area);
			if (area.isDrawable())
				area.display(this.p5);
		});
	}

	setTool(value) {
		this.tool = value;
		this.tempArea = new Area();
	}

	setCursor() {
		if (this.drawingTools.includes(this.tool)) {
			switch (this.tool) {
				case "polygon":
					if (!this.tempArea.isEmpty() && this.tempArea.isClosable(this.mX(), this.mY(), 5 / this.view.scale)) {
						this.p5.cursor(this.p5.HAND);
						break;
					}
				default:
					this.p5.cursor(this.p5.CROSS);
			}
		} else {
			this.p5.cursor(this.p5.ARROW);
			if (this.hovered) {
				switch (this.tool) {
					case "test":
					case "delete":
						this.p5.cursor(this.p5.HAND);
						break;
					case "move":
						this.p5.cursor(this.p5.MOVE);
						break;
				}
			}
		}
	}

	setOutput() {
		switch (this.tool) {
			case "test":
				if (this.mouseIsHoverSketch()) {
					let href = this.hovered ? this.hovered.href : "none";
					this.settings.setValue("Output", href);
				}
				break;
		}
	}

	setBackground() {
		this.p5.background(200);
		if (!this.img) {
			this.p5.noStroke();
			this.p5.fill(0);
			this.p5.textAlign(this.p5.CENTER, this.p5.CENTER);
			this.p5.textSize(15);
			let text = 'Drag and drop an image and/or a .map.json save file here';
			this.p5.text(text, this.p5.width / 2, this.p5.height / 2);
		}
	}

	/**
	 * Set the title of the canvas from an area
	 * @param {Area} area
	 */
	setTitle(area) {
		if (this.tool == "test" && area && area.title) {
			this.p5.canvas.setAttribute("title", area.title);
		} else {
			this.p5.canvas.removeAttribute("title");
		}
	}

	setAreaStyle(area) {
		let color = this.p5.color(255, 255, 255, 178);
		if (this.tool == "test") {
			color = this.p5.color(255, 0);
		}
		if ((this.mouseIsHoverSketch() && area == this.hovered && this.selected == false && (
			this.tool == "delete" ||
			this.tool == "move")) ||
			this.selected == area) {
			color = this.p5.color(255, 200, 200, 178); // highlight (set color red)
		}
		this.p5.fill(color);
		this.p5.strokeWeight(1 / this.view.scale);
		if (this.tool == "test") {
			this.p5.noStroke();
		} else {
			this.p5.stroke(0);
		}
	}

	setTempArea(x, y) {
		let coords = [new XY(x, y)];
		switch (this.tool) {
			case "rectangle":
				this.tempArea = new AreaRect(coords);
				this.tempArea.addCoord(0, 0);
				break;
			case "circle":
				this.tempArea = new AreaCircle(coords);
				break;
			case "polygon":
				this.tempArea = new AreaPoly(coords);
				this.tempArea.addCoord(x, y);
				break;
		}
	}

	updateTempArea() {
		if (!this.tempArea.isEmpty()) {
			this.tempArea.updateLastCoord(this.mX(), this.mY());
		}
	}

	exportMap() {
		let blob = new Blob([this.map.toJson()],{encoding:"UTF-8",type:"text/plain;charset=UTF-8"})
		download(blob, `${this.map.name}.map.json`, 'application/json')
	}

	importMap(jsonMap) {
		let objectMap = JSON.parse(jsonMap);
		this.map.setFromObject(objectMap);
		this.settings.setValue("Map Name", objectMap.name);
		this.settings.setValue("Default Area", objectMap.hasDefaultArea);
		this.reset();
	}

	/**
	 * Add an area to the imageMap object
	 * @param {Area} area
	 */
	createArea(area) {
		this.map.addArea(area);
		this.undoManager.add({
			undo: () => {
				area = this.map.popArea();
			},
			redo: () => {
				this.map.addArea(area, false);
			}
		});
	}

	/**
	 * remove an area from the imageMap object
	 * @param {Area} area
	 */
	deleteArea(area) {
		let id = area.id;
		if (id === 0) {
			this.settings.setValue("Default Area", false);
		} else {
			let index = this.map.rmletea(id);
			this.undoManager.add({
				undo: () => {
					this.map.insertArea(area, index);
				},
				redo: () => {
					this.map.rmletea(id);
				}
			});
		}
	}

	/**
	 * Move an area forward or backward
	 * @param {Area} area
	 */
	moveArea(area, direction) {
		if (this.map.moveArea(area.id, direction) !== false) {
			this.undoManager.add({
				undo: () => {
					this.map.moveArea(area.id, -direction);
				},
				redo: () => {
					this.map.moveArea(area.id, direction);
				}
			});
		}
	}

	/**
	 * Set the url of an area
	 * @param {Area} area
	 */
	setAreaUrl(area) {
		let href = area.href;
		let input = prompt("Enter the pointing url of this area", href ? href : "http://");
		if (input != null) {
			area.setHref(input);
			this.undoManager.add({
				undo: () => {
					area.setHref(href);
				},
				redo: () => {
					area.setHref(input);
				}
			});
		}
	}

	/**
	 * Set the title of an area
	 * @param {Area} area
	 */
	setAreaTitle(area) {
		let title = area.title;
		let input = prompt("Enter the title of this area", title ? title : "");
		if (input != null) {
			area.setTitle(input);
			this.undoManager.add({
				undo: () => {
					area.setTitle(title);
				},
				redo: () => {
					area.setTitle(input);
				}
			});
		}
	}

	setDefaultArea(bool) {
		this.map.setDefaultArea(bool);
		this.undoManager.add({
			undo: () => {
				this.map.setDefaultArea(!bool); // semble redondant
				this.settings.setValue("Default Area", !bool)
			},
			redo: () => {
				this.map.setDefaultArea(bool); // semble redondant
				this.settings.setValue("Default Area", bool)
			}
		});
	}

	clearAreas() {
		let areas = this.map.getAreas(false);
		this.map.clearAreas();
		this.undoManager.add({
			undo: () => {
				this.map.setAreas(areas);
			},
			redo: () => {
				this.map.clearAreas();
			}
		});
	}

	reset() {
		this.undoManager.clear();
	}
}