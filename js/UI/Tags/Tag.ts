class UI_Tags_Tag {
	
	public owner: UI_Tags;
	
	protected _value: string = null;
	protected _checked: boolean;
	protected _selected: boolean;
	protected paintWin: IWindow = {x: 0, y: 0, width: 0, height: 0 };
	protected closeButton: IWindow = { x: 0, y: 0, width: 10, height: 10 };
	
	constructor( owner: UI_Tags, value: string = null ) {
		this.owner = owner;
		this._value = String(value || '') || null;
	}

	get value(): string {
		return this._value;
	}

	set value( v: string ) {
		v = String(v || '') || null;
		if ( v != this._value ) {
			this._value = v;
			this.owner.render();
		}
	}

	get checked(): boolean {
		return this._checked;
	}

	set checked( on: boolean ) {
		
		on = on === undefined
			? on
			: (on === null ? on : !!on);

		if ( on !== this._checked ) {
			this._checked = on;
			this.owner.render();
		}
	}

	get selected(): boolean {
		return !!this._selected && this.owner.active;
	}

	set selected( on: boolean ) {
		
		on = !!on;
		
		if ( on != this._selected ) {
			
			this._selected = on;
			
			if ( on ) {
				this.owner.fire('select-tag', this);
			}
		}
	}

	get width(): number {

		var ret: number = 28,
		    w: number;

		if ( this._checked !== undefined ) {
			ret += 20;
		}

		if ( this._value ) {
			
			ret += Math.round( this.owner.defaultContext.measureText(this._value).width );

		}

		if ( ret >= ( w = this.owner.clientRect.width - 22 ) ) {
			ret = w;
		}

		return ret;
	}

	public paintAt( x: number, y: number, bgColor: string, color: string, ctx: UI_Canvas_ContextMapper ): number {
		
		var width: number = this.width;

		if (bgColor) {
			ctx.fillStyle = bgColor;
			ctx.fillRect(x, y, width, UI_Tags._theme.tag.height);
		}
		
		if (this.value) {
			ctx.fillStyle = color;
			ctx.fillText( ctx.dotDotDot(this._value, width - 24 ), x + width - 22, y + ~~(UI_Tags._theme.tag.height / 2));
		}

		this.paintWin.x = x;
		this.paintWin.y = y;
		this.paintWin.width = width;
		this.paintWin.height = UI_Tags._theme.tag.height;

		if ( bgColor ) {
			// paint the caret.
			var caretX: number = x + width - 22;
			ctx.fillStyle = 'black';
			ctx.fillRect(caretX, y + 2, 1, UI_Tags._theme.tag.height - 4);
		}

		// paint the close sign
		UI_Resource.createSprite(UI_Tags._theme.icons.close + (this.owner.disabled ? '-disabled' : ''))
			.paintWin(ctx, this.closeButton.x = x + width - 15, this.closeButton.y = y + ~~(UI_Tags._theme.tag.height / 2) - 5 );

		return width;
	}

	public containsPoint( point: IPoint ): boolean {

		var result = ( point.x >= this.paintWin.x ) && ( point.x < ( this.paintWin.x + this.paintWin.width ) ) &&
			( point.y >= this.paintWin.y ) && ( point.y < ( this.paintWin.y + this.paintWin.height) );

		if ( result ) {

			if ( ( point.x >= this.closeButton.x ) && ( point.x < ( this.closeButton.x + this.closeButton.width ) ) &&
			     ( point.y >= this.closeButton.y ) && ( point.y < ( this.closeButton.y + this.closeButton.height) ) 
			) {

				result = null;

			}

		}

		return result;
	}

	public dispatchKeyboardEvent( ev: Utils_Event_Keyboard, myTagIndex: number ) {

		switch ( ev.code ) {
			case Utils.keyboard.KB_BACKSPACE:

				if ( this.value ) {
					this.value = this.value.substr(0, this.value.length - 1);

				} else {
						this.owner.removeTag(myTagIndex);
						this.owner = null;
				}
				
				break;

			case Utils.keyboard.KB_DELETE:

				this.owner.removeTag(myTagIndex);
				this.owner = null;

				break;

			default:

				var key: string = ev.keyName;

				if ( key.length == 1 ) {

					this.value = ( this.value || '' ) + key;

				}

				break;
		}

	}

}