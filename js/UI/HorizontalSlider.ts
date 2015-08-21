/**
 * See UI_VerticalSlider for available properties list.
 */
class UI_HorizontalSlider extends UI_VerticalSlider {

	constructor( owner: UI ) {
		super( owner );
		Utils.dom.addClass( this._root, 'horizontal' );
		this.orientation = EOrientation.HORIZONTAL;
	}

	protected _initDom_() {
		this.height = UI_VerticalSlider._theme.defaults.width;
		this.width= UI_VerticalSlider._theme.defaults.height;
	}

	get trackSize(): number {
		return this.clientRect.width - UI_VerticalSlider._theme.thumb.size;
	}

	protected set thumbPosition( pos: number ) {
		this._dom.thumb.style.marginLeft = ~~pos + "px";
		this._thumbPosition = pos;
	}

}

Constraint.registerClass( {
	"name": "UI_HorizontalSlider",
	"extends": "UI_VerticalSlider",
	"properties": []
});