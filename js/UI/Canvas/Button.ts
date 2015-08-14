class UI_Canvas_Button {
	
	protected _left: number;
	protected _top:  number;
	protected _width: number;
	protected _height: number;

	protected _mapper: UI_Canvas_ContextMapper;

	protected _caption: string;

	protected _active: boolean;
	protected _hover : boolean;

	protected _icon: { width: number, height: number, sprite: string } = null;
	protected _font: string = $I.string('UI.UI_Button/font.size') + 'px ' + $I.string('UI.UI_Button/font.family');

	/**
	 * Store any usefull data in the button you need. This is not painted or somethig, but is used
	 * as a general storage purpose;
	 */
	public    value: any;

	protected _border = {
		width       : 0,
		color       : null,
		activeColor : null,
		hoverColor  : null
	};

	protected _background = {
		color: null,
		activeColor: null,
		hoverColor: null
	};

	protected _color = {
		color: 'rgb(0,0,0)',
		activeColor: null,
		hoverColor: null
	};

	constructor( pos: IWindow, mapper: UI_Canvas_ContextMapper ) {
		this._left   = pos.x;
		this._top    = pos.y;
		this._width  = pos.width;
		this._height = pos.height;
		this._mapper = mapper;
	}

	get left(): number {
		return this._left;
	}

	set left( distance: number ) {
		this._left = ~~distance;
	}

	get top(): number {
		return this._top;
	}

	set top( distance: number ) {
		this._top = ~~distance;
	}

	get width(): number {
		return this._width;
	}

	set width( size: number ) {
		this._width = ~~size;
	}

	get height(): number {
		return this._height;
	}

	set height( size: number ) {
		this._height = size;
	}

	get caption(): string {
		return String( this._caption || '' );
	}

	set caption( caption: string ) {
		this._caption = String( caption || '' ) || undefined;
	}

	get borderWidth(): number {
		return this._border.width;
	}

	set borderWidth( size: number ) {
		this._border.width = ~~size;
		if ( this._border.width < 0 ) {
			this._border.width = 0;
		}
	}

	get borderColor(): string {
		return this._border.color;
	}

	set borderColor( color: string ) {
		this._border.color = String( color || '' ) || null;
	}

	get borderActiveColor(): string {
		return this._border.activeColor;
	}

	set borderActiveColor( color: string ) {
		this._border.activeColor = String( color || '' ) || null;
	}

	get borderHoverColor(): string {
		return this._border.hoverColor;
	}

	set borderHoverColor( color: string ) {
		this._border.hoverColor = String( color || '' ) || null;
	}

	get backgroundColor(): string {
		return this._background.color;
	}

	set backgroundColor( color: string ) {
		this._background.color = String( color || '' ) || null;
	}

	get backgroundActiveColor(): string {
		return this._background.activeColor;
	}

	set backgroundActiveColor( color: string ) {
		this._background.activeColor = String( color || '' ) || null;
	}

	get backgroundHoverColor(): string {
		return this._background.hoverColor;
	}

	set backgroundHoverColor( color: string ) {
		this._background.hoverColor = String( color || '' ) || null;
	}

	get color(): string {
		return this._color.color;
	}

	set color( color: string ) {
		this._color.color = String( color || '' ) || null;
	}

	get activeColor(): string {
		return this._color.activeColor;
	}

	set activeColor( color: string ) {
		this._color.activeColor = String( color || '' ) || null;
	}

	get hoverColor(): string {
		return this._color.hoverColor;
	}

	set hoverColor( color: string ) {
		this._color.hoverColor = String( color || '' ) || null;
	}

	get font(): string {
		return this._font;
	}

	set font( font: string ) {
		this._font = String( font || '' ) || null;
	}

	get active(): boolean {
		return this._active;
	}

	set active( on: boolean ) {
		on = !!on;
		if ( on != this._active ) {
			this._active = on;
			if ( on ) {
				this._mapper.fire( 'activate-button', this );
			}
		}
	}

	get hover(): boolean {
		return this._hover;
	}

	set hover( on: boolean ) {
		on = !!on;
		if ( on != this._hover ) {
			this._hover = on;
			if ( on ) {
				this._mapper.fire( 'hover-button', this );
			}
		}
	}

	get icon(): { width: number, height: number, sprite: string } {
		return this._icon || null;
	}

	set icon( icon: { width: number, height: number, sprite: string } ) {
		this._icon = icon || null;
	}

	public containsRelativePoint( x: number, y: number ): boolean {
		return x >= this._left && y >= this._top && x < this._left + this._width && y < this._top + this._height; 
	}

	public render() {

		this._mapper.save();

		var backgroundColor: string = this.backgroundColor,
		    borderColor    : string = this.borderColor,
		    color          : string = this.color,
		    borderWidth    : number = this.borderWidth;

		if ( this._active ) {
			backgroundColor = this.backgroundActiveColor || backgroundColor;
			borderColor     = this.borderActiveColor || borderColor;
			color           = this.activeColor || color;
		}

		if ( this._hover ) {
			backgroundColor = this.backgroundHoverColor || backgroundColor;
			borderColor     = this.borderHoverColor || borderColor;
			color           = this.hoverColor || color;
		}

		if ( backgroundColor ) {
			this._mapper.fillStyle = backgroundColor;
			this._mapper.fillRect( this._left, this._top, this._width, this._height );
		}

		if ( borderWidth && borderColor && borderColor != backgroundColor ) {
			this._mapper.lineWidth = borderWidth;
			this._mapper.strokeStyle = borderColor;
			this._mapper.strokeRect( this._left + .5, this._top + .5, this._width - 1, this._height - 1 );
		}

		if ( this._caption && color && this.font && color != backgroundColor ) {
			this._mapper.font = this.font;
			this._mapper.fillStyle = color;
			this._mapper.textBaseline = 'middle';
			this._mapper.textAlign = 'center';

			this._mapper.fillText( this._caption, ~~( this._left + this._width / 2 ), ~~( this._top + this._height / 2 ), this._width - 2 * borderWidth );

		}

		if ( this._icon ) {

			UI_Resource.createSprite( this._icon.sprite ).paintWin(
				this._mapper,
				~~( this._left + this._width / 2 - this._icon.width / 2 ), ~~( this._top + this._height / 2 - this._icon.height / 2 )
			);

		}

		this._mapper.restore();

	}

}