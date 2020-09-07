import { version } from "../package.json";
import { ImageMap } from "./class.image-map";
import { BgLayer } from "./p5.bg-layer";
import { Area, AreaCircle, AreaRect, AreaPoly, AreaEmpty } from "./class.area";
import { Coord } from "./class.coord";
import { Selection } from "./class.selection";
import { openWindow } from "./utils";
import * as download from "downloadjs";
//@ts-ignore no types for this lib
import UndoManager from "undo-manager";
//@ts-ignore no types for this lib
import QuickSettings from "quicksettings";
//@ts-ignore no types for this lib
import * as ContextMenu from "../lib/contextmenu/contextmenu";
import "../lib/contextmenu/contextmenu.css";
//@ts-ignore strange way to import but it's working
import p5 = require("p5");

export type Tool = "polygon" | "rectangle" | "circle" | "select" | "delete" | "test";
export type Image = {
	data: p5.Image|null,
	file: p5.File|null,
};
export type ToolLabel = {
	key: string,
	value: Tool,
};
export type View = { scale: number, transX: number, transY: number, };
export type Zoom = { min: number, max: number, sensativity: number, };

export class Save {
	constructor (public version: string, public map: ImageMap) {}
}

/**
 */
export class imageMapCreator {
	protected width: number;
	protected height: number;
	protected tool: Tool;
	protected drawingTools: Tool[];
	protected settings: any;
	protected menu = {
		SetUrl: {
			onSelect: (target: Element, key: any, item: HTMLElement, area: Area) => { this.setAreaUrl(area); },
			label: "Set url",
		},
		SetTitle: {
			onSelect: (target: Element, key: any, item: HTMLElement, area: Area) => { this.setAreaTitle(area); },
			label: "Set title",
		},
		Delete: (target: Element, key: any, item: HTMLElement, area: Area) => { this.deleteArea(area); },
		MoveFront: {
			onSelect: (target: Element, key: any, item: HTMLElement, area: Area) => { this.moveArea(area, -1); },
			enabled: true,
			label: "Move Forward",
		},
		MoveBack: {
			onSelect: (target: Element, key: any, item: HTMLElement, area: Area) => { this.moveArea(area, 1); },
			enabled: true,
			label: "Move Backward",
		}
	};
	protected tempArea: AreaEmpty;
	protected selection: Selection;
	protected hoveredArea: Area|null;
	protected hoveredPoint: Coord|null;
	public map: ImageMap;
	protected undoManager: any;
	protected img: Image;
	public view: View;
	protected zoomParams: Zoom;
	protected magnetism: boolean;
	protected fusion: boolean;
	protected tolerance: number;
	protected bgLayer: BgLayer;
	public p5: p5;

	/**
	 * Constructor
	 * @param {string} elementId id of the html container
	 * @param {number} width
	 * @param {number} height
	 */
	constructor(elementId: string, width: number = 600, height: number = 450) {
		const element = document.getElementById(elementId);
		if (!element) throw new Error('HTMLElement not found');
		this.width = width;
		this.height = height;
		this.tool = "polygon";
		this.drawingTools = ["rectangle", "circle", "polygon"];
		this.settings;
		this.tempArea = new AreaEmpty();
		this.selection = new Selection();
		this.hoveredArea = null;
		this.hoveredPoint = null;
		this.map = new ImageMap(width, height);
		this.undoManager = new UndoManager();
		this.img = {data: null, file: null};
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
		this.magnetism = true;
		this.fusion = false;
		this.tolerance = 6;
		this.bgLayer = new BgLayer(this);
		// Must be the last instruction of the constructor.
		this.p5 = new p5(this.sketch.bind(this), element);
	}

	//---------------------------- p5 Sketch ----------------------------------

	/**
	 * Override p5 methods
	 * @param {p5} p5
	 */
	private sketch(p5: p5): void {
		// Set this.p5 also in sketch() (fix for #30).
		this.p5 = p5;

		p5.setup = this.setup.bind(this);
		p5.draw = this.draw.bind(this);

		p5.mousePressed = this.mousePressed.bind(this);
		p5.mouseDragged = this.mouseDragged.bind(this);
		p5.mouseReleased = this.mouseReleased.bind(this);
		p5.mouseWheel = this.mouseWheel.bind(this);
		//@ts-ignore p5 types didn't specify the KeyBoardEvent nor the boolean return type
		p5.keyPressed = this.keyPressed.bind(this);
	}

	//---------------------------- p5 Functions ----------------------------------

	private setup(): void {
		let canvas = this.p5.createCanvas(this.width, this.height);
		canvas.drop(this.handeFile.bind(this)).dragLeave(this.onLeave.bind(this)).dragOver(this.onOver.bind(this));
		//@ts-ignore p5 types does not specify the canvas attribute
		this.settings = QuickSettings.create(this.p5.width + 5, 0, "Image-map Creator", this.p5.canvas.parentElement)
			.setDraggable(false)
			.addText("Map Name", "", (v: string) => { this.map.setName(v) })
			.addDropDown("Tool", ["polygon", "rectangle", "circle", "select", "delete", "test"], (v: ToolLabel) => { this.setTool(v.value) })
			.addBoolean("Default Area", this.map.hasDefaultArea, (v: boolean) => { this.setDefaultArea(v) })
			.addButton("Undo", this.undoManager.undo)
			.addButton("Redo", this.undoManager.redo)
			.addButton("Clear", this.clearAreas.bind(this))
			.addButton("Generate Html", () => { this.settings.setValue("Output", this.map.toHtml()) })
			.addButton("Generate Svg", () => { this.settings.setValue("Output", this.map.toSvg()) })
			.addTextArea("Output")
			.addButton("Save", this.save.bind(this));
		//@ts-ignore Fix for oncontextmenu
		this.p5.canvas.addEventListener("contextmenu", (e) => { e.preventDefault(); });
		//@ts-ignore Fix for middle click mouse down triggers scroll on windows
		this.p5.canvas.addEventListener("mousedown", (e) => { e.preventDefault(); });
		//@ts-ignore Select all onclick on the Output field
		document.getElementById("Output").setAttribute("onFocus", "this.select();");
	}

	private draw(): void {
		this.updateTempArea();
		this.updateHovered();
		this.setCursor();
		this.setOutput();
		this.setBackground();
		this.setTitle(this.hoveredArea);
		this.p5.translate(this.view.transX, this.view.transY);
		this.p5.scale(this.view.scale);
		this.drawImage();
		this.bgLayer.display();
		this.drawAreas();
	}

	//------------------------------ p5 Events -----------------------------------

	private mousePressed(): void {
		if (this.mouseIsHoverSketch()) {
			let coord = this.drawingCoord();
			if (this.p5.mouseButton == this.p5.LEFT && !ContextMenu.isOpen()) {
				switch (this.tool) {
					case "circle":
					case "rectangle":
						this.setTempArea(coord);
						break;
					case "polygon":
						let areaPoly = this.tempArea as AreaPoly;
						if (areaPoly.isEmpty()) {
							this.setTempArea(coord);
						} else if (areaPoly.isClosable(this.mCoord(), this.tolerance / this.view.scale)) {
							areaPoly.close();
							if (areaPoly.isValidShape())
								this.createArea(areaPoly);
							this.tempArea = new AreaEmpty();
						} else {
							this.tempArea.addCoord(this.mCoord());
						}
						break;
					case "select":
						if (this.hoveredPoint !== null) {
							this.selection.addPoint(this.hoveredPoint);
							this.selection.registerArea(this.hoveredArea!);
							this.selection.resetOrigin(this.hoveredPoint);
						} else if (this.hoveredArea !== null) {
							this.selection.addArea(this.hoveredArea);
							this.selection.resetOrigin(this.mCoord());
						}
						break;
				}
			}
		}
	}

	private mouseDragged(): void {
		if (this.mouseIsHoverSketch() && !ContextMenu.isOpen()) {
			if (this.p5.mouseButton == this.p5.LEFT) {
				switch (this.tool) {
					case "select":
						this.selection.setPosition(this.drawingCoord());
						break;
				}
			} else if (this.p5.mouseButton == this.p5.CENTER) {
				this.view.transX += this.p5.mouseX - this.p5.pmouseX;
				this.view.transY += this.p5.mouseY - this.p5.pmouseY;
			}
		}
	}

	private mouseReleased(e: MouseEvent): void {
		switch (this.tool) {
			case "rectangle":
			case "circle":
				if (this.tempArea.isValidShape())
					this.createArea(this.tempArea);
				this.tempArea = new AreaEmpty();
				break;
			case "select":
				let selection = this.selection;
				if (!selection.isEmpty()) {
					let move = this.selection.distToOrigin();
					this.undoManager.add({
						undo: () => selection.move(move.invert()),
						redo: () => selection.move(move),
					});
				}
				this.selection = new Selection();
				break;
		}
		this.onClick(e);
		this.bgLayer.disappear();
	}

	private mouseWheel(e: MouseWheelEvent): boolean {
		if (this.mouseIsHoverSketch()) {
			let coefZoom = this.view.scale * this.zoomParams.sensativity * - e.deltaY;
			this.zoom(coefZoom);
			return false;
		}
		return true;
	}

	private keyPressed(e: KeyboardEvent): boolean {
		if (e.composed && e.ctrlKey) {
			switch (e.key) {
				case 's':
					this.save();
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
		} else if (
			this.tool == "polygon" &&
			//@ts-ignore p5 types didn't specify the ESCAPE keycode
			e.keyCode == this.p5.ESCAPE
		) {
			this.tempArea = new AreaEmpty();
			return false;
		}
		return true;
	}

	//---------------------------- Functions ----------------------------------

	trueX(coord: number): number {
		return (coord - this.view.transX) / this.view.scale;
	}

	trueY(coord: number): number {
		return (coord - this.view.transY) / this.view.scale;
	}

	mX(): number {
		return this.trueX(this.p5.mouseX);
	}

	mY(): number {
		return this.trueY(this.p5.mouseY);
	}

	/**
	 * Get the true coordinate of the mouse relative to the imageMap
	 */
	mCoord(): Coord {
		return new Coord(this.mX(), this.mY());
	}

	/**
	 * Get the coordinate of the mouse for drawing
	 */
	drawingCoord(): Coord {
		let coord = this.mCoord();
		coord = this.magnetism ? this.hoveredPoint ? this.hoveredPoint : coord : coord;
		if (!this.fusion) {
			coord = coord.clone();
		}
		return coord;
	}

	mouseIsHoverSketch(): boolean {
		return this.p5.mouseX <= this.p5.width && this.p5.mouseX >= 0 && this.p5.mouseY <= this.p5.height && this.p5.mouseY >= 0;
	}

	/**
	 * Sets hoveredPoint and hoveredArea excluding currently selected Areas
	 */
	updateHovered(): void {
		this.hoveredPoint = null;
		let allAreas = this.map.getAreas();
		let area = allAreas.find((a: Area): boolean => {
			if (this.selection.containsArea(a)) {
				return false;
			}
			if (this.tool != "test") {
				let point = a.isOverPoint(this.mCoord(), this.tolerance / this.view.scale)
				if (point && !this.selection.containsPoint(point)) {
					this.hoveredPoint = point;
					return true;
				}
			}
			if (a.isOver(this.mCoord())) {
				return true;
			}
			return false;
		});
		if (this.p5.mouseIsPressed) return;
		this.hoveredArea = area ? area : null;
	}

	onClick(event: MouseEvent): void {
		if (this.mouseIsHoverSketch()) {
			if (this.hoveredArea) {
				if (this.p5.mouseButton == this.p5.RIGHT) {
					this.selection.addArea(this.hoveredArea);
					this.menu.MoveFront.enabled = !(this.map.isFirstArea(this.hoveredArea.id) || this.hoveredArea.getShape() == 'default');
					this.menu.MoveBack.enabled = !(this.map.isLastArea(this.hoveredArea.id) || this.hoveredArea.getShape() == 'default');
					ContextMenu.display(event, this.menu, {
						position: "click",
						data: this.hoveredArea
					});
					// return false; // doesn't work as expected
				} else if (this.p5.mouseButton == this.p5.LEFT && !ContextMenu.isOpen()) {
					switch (this.tool) {
						case "test":
							openWindow(this.hoveredArea.getHref());
							break;
						case "delete":
							this.deleteArea(this.hoveredArea);
							break;
					}
				}
			}
		}
		this.selection.clear();
	}

	onOver(evt: MouseEvent): void {
		this.bgLayer.appear();
		evt.preventDefault();
	}

	onLeave(): void {
		this.bgLayer.disappear();
	}

	handeFile(file: p5.File): void {
		if (file.type == "image") {
			this.img.data = this.p5.loadImage(file.data, img => this.resetView(img));
			this.img.file = file.file;
			if (!this.map.getName()) {
				this.map.setName(file.name);
				this.settings.setValue("Map Name", this.map.getName());
			}
		} else if (file.subtype == 'json') {
			fetch(file.data)
				.then(res => res.blob())
				.then(blob => {
					let reader = new FileReader();
					reader.onload = () => {
						let json = reader.result;
						if (typeof(json) == "string") {
							this.importMap(json);
						}
					};
					reader.readAsText(blob);
				});
		}
		this.bgLayer.disappear();
	}

	resetView(img: p5.Image): void {
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

	zoom(coef: number): void {
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

	drawImage(): void {
		if (this.img.data)
			this.p5.image(this.img.data, 0, 0, this.img.data.width, this.img.data.height);
	}

	drawAreas(): void {
		let allAreas = [this.tempArea].concat(this.map.getAreas());
		for (let i = allAreas.length; i--;) {
			let area = allAreas[i];
			this.setAreaStyle(area);
			if (area.isDrawable())
				area.display(this.p5);
		}
		if (this.hoveredPoint) {
			let point = this.hoveredPoint;
			this.p5.fill(0);
			this.p5.noStroke();
			this.p5.ellipse(point.x, point.y, 6 / this.view.scale)
		}
	}

	setTool(value: Tool): void {
		this.tool = value;
		this.tempArea = new AreaEmpty();
	}

	setCursor(): void {
		if (this.drawingTools.includes(this.tool)) {
			switch (this.tool) {
				case "polygon":
					let areaPoly = this.tempArea as AreaPoly
					if (!areaPoly.isEmpty() && areaPoly.isClosable(this.mCoord(), 5 / this.view.scale)) {
						this.p5.cursor(this.p5.HAND);
						break;
					}
				default:
					this.p5.cursor(this.p5.CROSS);
			}
		} else {
			this.p5.cursor(this.p5.ARROW);
			if (this.hoveredArea) {
				switch (this.tool) {
					case "test":
					case "delete":
						this.p5.cursor(this.p5.HAND);
						break;
					case "select":
						if (!this.hoveredPoint) {
							this.p5.cursor(this.p5.MOVE);
						}
						break;
				}
			}
		}
	}

	setOutput(): void {
		switch (this.tool) {
			case "test":
			case "select":
				if (this.mouseIsHoverSketch()) {
					let href = this.hoveredArea ? this.hoveredArea.getHrefVerbose() : "none";
					this.settings.setValue("Output", href);
				}
				break;
		}
	}

	setBackground(): void {
		this.p5.background(200);
		if (!this.img.data) {
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
	 */
	setTitle(area: Area|null): void {
		if (this.tool == "test" && area && area.getTitle()) {
			//@ts-ignore p5 types does not specify the canvas attribute
			this.p5.canvas.setAttribute("title", area.getTitle());
		} else {
			//@ts-ignore p5 types does not specify the canvas attribute
			this.p5.canvas.removeAttribute("title");
		}
	}

	setAreaStyle(area: Area): void {
		let color = this.p5.color(255, 255, 255, 178);
		if (this.tool == "test") {
			color = this.p5.color(255, 0);
		}
		if (((this.tool == "delete" || this.tool == "select") &&
			this.mouseIsHoverSketch() &&
			area == this.hoveredArea) ||
			this.selection.containsArea(area)
		) {
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

	setTempArea(coord: Coord): void {
		let coords = [coord];
		switch (this.tool) {
			case "rectangle":
				this.tempArea = new AreaRect(coords);
				break;
			case "circle":
				this.tempArea = new AreaCircle(coords);
				break;
			case "polygon":
				this.tempArea = new AreaPoly(coords);
				this.tempArea.addCoord(coord);
				break;
		}
	}

	updateTempArea(): void {
		let coord = this.drawingCoord();
		if (!this.tempArea.isEmpty()) {
			this.tempArea.updateLastCoord(coord);
		}
	}

	exportMap(): string {
		return JSON.stringify(new Save(version, this.map), function (key, value) {
			if (value instanceof ImageMap && !(this instanceof Save)) {
				return value.getName();
			}
			return value;
		});
	}

	save(): void {
		//@ts-ignore encoding options for Chrome
		let blob = new Blob([this.exportMap()], { encoding: "UTF-8", type: "text/plain;charset=UTF-8" })
		download(blob, `${this.map.getName()}.map.json`, 'application/json')
	}

	importMap(json: string): void {
		let object = JSON.parse(json);
		let objectMap = object.map;
		this.map.setFromObject(objectMap);
		this.settings.setValue("Map Name", objectMap.name);
		this.settings.setValue("Default Area", objectMap.hasDefaultArea);
		this.reset();
	}

	/**
	 * Add an area to the imageMap object
	 */
	createArea(area: Area): void {
		this.map.addArea(area);
		this.undoManager.add({
			undo: () => area = this.map.shiftArea()!,
			redo: () => this.map.addArea(area, false),
		});
	}

	/**
	 * remove an area from the imageMap object
	 */
	deleteArea(area: Area): void {
		let id = area.id;
		if (id === 0) {
			this.settings.setValue("Default Area", false);
		} else {
			let index = this.map.rmvArea(id);
			this.undoManager.add({
				undo: () => this.map.insertArea(area, index),
				redo: () => this.map.rmvArea(id),
			});
		}
	}

	/**
	 * Move an area forward or backward
	 */
	moveArea(area: Area, direction: number): void {
		if (this.map.moveArea(area.id, direction) !== false) {
			this.undoManager.add({
				undo: () => this.map.moveArea(area.id, -direction),
				redo: () => this.map.moveArea(area.id, direction),
			});
		}
	}

	/**
	 * Set the url of an area
	 */
	setAreaUrl(area: Area): void {
		let href = area.getHref();
		let input = prompt("Enter the pointing url of this area", href ? href : "http://");
		if (input) {
			area.setHref(input);
			this.undoManager.add({
				undo: () => area.setHref(href),
				redo: () => area.setHref(input!),
			});
		}
	}

	/**
	 * Set the title of an area
	 */
	setAreaTitle(area: Area): void {
		let title = area.getTitle();
		let input = prompt("Enter the title of this area", title ? title : "");
		if (input) {
			area.setTitle(input);
			this.undoManager.add({
				undo: () => area.setTitle(title),
				redo: () => area.setTitle(input!),
			});
		}
	}

	setDefaultArea(bool: boolean): void {
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

	clearAreas(): void {
		let areas = this.map.getAreas(false);
		this.map.clearAreas();
		this.undoManager.add({
			undo: () => this.map.setAreas(areas),
			redo: () => this.map.clearAreas(),
		});
	}

	reset(): void {
		this.undoManager.clear();
	}
}