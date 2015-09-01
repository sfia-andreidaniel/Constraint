/**
 * An UI_HorizontalSlider is an input from which the user can select a value from
 * a range of values by dragging or using it's keyboard arrows.
 *
 * Representation of a standard UI_HorizontalSlider:
 *
 * ![slider2](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_HorizontalSlider-active.png "UI_HorizontalSlider")
 *
 * A disabled UI_HorizontalSlider input:
 *
 * ![slider](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_HorizontalSlider-disabled.png "UI_HorizontalSlider disabled")
 *
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