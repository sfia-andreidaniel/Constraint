/**
 * The UI_ProgressBar is a type of control that displays a progress to the user.
 *
 * Samples of UI_ProgressBar:
 *
 * ![progressbar](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_ProgressBar.png "UI_ProgressBar")
 */
class UI_ProgressBar extends UI {
	
	/**
	 * Themming
	 */
	public static _theme = {
		defaults: {
			width: $I.number('UI.UI_ProgressBar/defaults.width'),
			height: $I.number('UI.UI_ProgressBar/defaults.height')
		}
	};

	/**
	 * DOM Elements of the progress bar
	 */
	protected _dom = {
		inner: Utils.dom.create('div','inner'),
		bar:   Utils.dom.create('div', 'bar'),
		caption: Utils.dom.create('div','caption')
	};

	/**
	 * The value of the progress bar
	 */
	protected _value: number = 0;

	/**
	 * Minimum value of the progress bar
	 */
	protected _min: number = 0;

	/**
	 * Maximum value of the progress bar
	 */
	protected _max: number = 100;

	/**
	 * The caption text of the progress bar.
	 *
	 * There are some substrings that are automatically replaced when rendering this text:
	 *
	 * * %p - the percent in % format
	 * * %min - this._min
	 * * %max - this._max
	 * * %v - this._value
	 */
	protected _caption: string = '%p';

	/**
	 * The precision to be used at the percent and at the value
	 */
	protected _precision: number = 0;

	constructor( owner: UI ) {
		super(owner, null, Utils.dom.create('div', 'ui UI_ProgressBar'));
		this._root.appendChild(this._dom.inner);
		this._dom.inner.appendChild(this._dom.bar);
		this._dom.inner.appendChild(this._dom.caption);

		if ( this._width == 0 )
			this.width = UI_ProgressBar._theme.defaults.width;
		
		if (this._height == 0)
			this.height = UI_ProgressBar._theme.defaults.height;
	}

	/**
	 * Gets / Sets the value of the progress bar.
	 *
	 * If the value is NULL, the progress bar will render as an animated progress
	 * bar, informing user that the represented progress is in an undetermined state.
	 */
	get value(): number {
		return this._value;
	}

	set value( val: number ) {
		val = val === null ? null : parseFloat(String(val));
		
		if ( isNaN(val) ) {
			val = 0;
		}

		val = val === null ? null : (val < this._min ? this._min : (val > this._max ? this._max : val ) );

		if ( val != this._value ) {
			
			this._value = val;
			
			if ( val === null ) {
				Utils.dom.addClass(this._root, 'undetermined');
			} else {
				Utils.dom.removeClass(this._root, 'undetermined');
			}

			this.updateCaptionText();
		}
	}

	/**
	 * Gets / Sets the caption of the progress bar.
	 *
	 * There are some substrings that are automatically replaced when rendering this text:
	 *
	 * * %p - the percent in % format
	 * * %min - this._min
	 * * %max - this._max
	 * * %v - this._value
	 */
	get caption(): string {
		return this._caption;
	}

	set caption( cap: string ) {
		cap = String(cap || '') || null;
		if ( cap != this._caption ) {
			this._caption = cap;
			this.updateCaptionText();
		}
	}

	/**
	 * Gets / Sets the minimum allowed value of the progress bar
	 */
	get min(): number {
		return this._min;
	}

	set min( min: number ) {
		min = parseFloat(String(min || '0'));
		min = isNaN(min) ? 0 : min;
		if ( min != this._min ) {
			this._min = min;
			this.value = this.value;
		}
	}

	/**
	 * Gets / Sets the maximum value of the progress bar
	 */
	get max(): number {
		return this._max;
	}

	set max( max: number ) {
		max = parseFloat( String(max || '0' ) );
		max = isNaN(max) ? 0 : max;
		if ( max != this._max ) {
			this._max = max;
			this.value = this.value;
		}
	}

	/**
	 * Gets / Sets the precision that is used to represent the percent and
	 * the value of the progress bar.
	 */
	get precision(): number {
		return this._precision;
	}

	set precision( val: number ) {
		val = ~~val;
		val = val < 0 ? 0 : val;
		if ( this._precision != val ) {
			this._precision = val;
			this.updateCaptionText();
		}
	}

	/**
	 * Updates the text in the caption and the width of the bar.
	 */
	protected updateCaptionText() {

		var mins: string = String(this._min),
			maxs: string = String(this._max),
			percent: string = ( (this._value - Math.min(this._max, this._min)) / (Math.abs(this._max - this._min) / 100) ).toFixed(this._precision) + '%';

		this._dom.caption.textContent = ( !!!this._caption || this._value === null )
			? ''
			: this._caption.replace(/%p/g, percent).replace(/%min/, mins).replace(/%max/, maxs).replace(/%v/, this._value === null ? '' : this._value.toFixed(this._precision));

		this._dom.bar.style.width = this._value === null ? '' : 'calc(' + percent + ' - 4px)';
	}

}

Constraint.registerClass({
	"name": "UI_ProgressBar",
	"extends": "UI",
	"properties": [
		{
			"name": "min",
			"type": "number"
		},
		{
			"name": "max",
			"type": "number"
		},
		{
			"name": "value",
			"type": "number"
		},
		{
			"name": "caption",
			"type": "string"
		},
		{
			"name": "precision",
			"type": "number"
		}
	]
});