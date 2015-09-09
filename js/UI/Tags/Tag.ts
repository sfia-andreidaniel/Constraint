class UI_Tags_Tag {
	
	public owner: UI_Tags;
	
	protected _value    : string = null;
	protected _checked  : boolean;
	protected _selected : boolean;
	protected _triState : boolean;
	protected _sticky   : boolean;
	
	public    paintWin: IWindow = {x: 0, y: 0, width: 0, height: 0 };
	protected closeButton: IWindow = { x: 0, y: 0, width: 10, height: 10 };
	protected checkButton: IWindow = { x: 0, y: 0, width: -1, height: -1 };
	
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
		
		on = on === undefined ? on : (on === null ? on : !!on);

		if ( on !== this._checked ) {
			this._checked = on;
			
			if ( on === null ) {
				this._triState = true;
			}
			
			this.owner.render();
		}
	}

	get triState(): boolean {
		return !!this._triState;
	}

	set triState( on: boolean ) {
		this._triState = !!on;
	}

	get sticky(): boolean {
		return !!this._sticky;
	}

	set sticky( on: boolean ) {
		this._sticky = !!on;
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
		    w: number,
		    oret: number;

		if ( this._checked !== undefined ) {
			ret += 20;
		}

		if ( this._value ) {
			
			ret += Math.round( this.owner.defaultContext.measureText(this._value).width );

		}

		if ( ret >= ( w = this.owner.clientRect.width - UI_Tags._theme.tag.margin - Utils.dom.scrollbarSize ) ) {
			ret = w;
		}

		return ret;
	}

	public paintAt( x: number, y: number, bgColor: string, color: string, ctx: UI_Canvas_ContextMapper ): number {
		
		var width: number = this.width,
		    top: number = this.owner.scrollTop,
		    left: number = this.owner.scrollLeft;

		if (bgColor) {
			ctx.fillStyle = bgColor;
			ctx.fillRect(x, y, width, UI_Tags._theme.tag.height);
		}
		
		if (this.value) {
			ctx.fillStyle = color;
			ctx.fillText(ctx.dotDotDot(this._value, width - 24 - ~~(this._checked !== undefined) * 20), x + width - 22, y + ~~(UI_Tags._theme.tag.height / 2));
		}

		this.paintWin.x = x + left;
		this.paintWin.y = y + top;
		this.paintWin.width = width;
		this.paintWin.height = UI_Tags._theme.tag.height;

		if ( bgColor ) {
			if (!this.sticky) {
				
				// paint the caret.
				var caretX: number;
				ctx.fillStyle = 'black';

				caretX = x + width - 22
				
				ctx.fillRect(caretX, y + 2, 1, UI_Tags._theme.tag.height - 4);

			}
		}

		// paint the close sign
		UI_Resource.createSprite(UI_Tags._theme.icons.close + (this.owner.disabled || this.sticky ? '-disabled' : ''))
			.paintWin(ctx, this.closeButton.x = x + width - 15, this.closeButton.y = y + ~~(UI_Tags._theme.tag.height / 2) - 5);

		this.closeButton.x += left;
		this.closeButton.y += top;
		this.closeButton.width = 10;
		this.closeButton.height = 10;

		if ( typeof this._checked != 'undefined' ) {

			UI_Resource.createSprite(
				(this._checked === null
					? UI_Tags._theme.icons.checkbox_any
					: (this._checked ? UI_Tags._theme.icons.checkbox_on : UI_Tags._theme.icons.checkbox_off)
					) + (this.owner.disabled ? '-disabled' : '')
				).paintWin(
					ctx, this.checkButton.x = x + 4, this.checkButton.y = y + ~~(UI_Tags._theme.tag.height / 2) - 8
					);

			this.checkButton.width = 16;
			this.checkButton.height = 16;

			this.checkButton.x += left;
			this.checkButton.y += top;

		}

		return width;
	}

	/**
	 * @returns
	 *
	 * 1: The point is contained by the tag
	 *
	 * 0: The point is not contained by the tag
	 *
	 * 2: The point is contained by the tag, and is a part of the "close" region
	 *
	 * 3: The point is contained by the tag, and is a part of the "checkbox" region
	 *
	 */
	public containsPoint( point: IPoint ): number {

		var result = ~~( ( point.x >= this.paintWin.x ) && ( point.x < ( this.paintWin.x + this.paintWin.width ) ) &&
			( point.y >= this.paintWin.y ) && ( point.y < ( this.paintWin.y + this.paintWin.height) ) );

		if ( result ) {

			if ( ( point.x >= this.closeButton.x ) && ( point.x < ( this.closeButton.x + this.closeButton.width ) ) &&
			     ( point.y >= this.closeButton.y ) && ( point.y < ( this.closeButton.y + this.closeButton.height) ) 
			) {
				result = 2;
			}

			if ( ( point.x >= this.checkButton.x ) && ( point.x < ( this.checkButton.x + this.checkButton.width ) ) &&
			     ( point.y >= this.checkButton.y ) && ( point.y < ( this.checkButton.y + this.checkButton.height) ) 
			) {
				result = 3;
			}

		}

		return result;
	}

	public dispatchKeyboardEvent( ev: Utils_Event_Keyboard, myTagIndex: number ) {

		if ( ev.ctrlKey || ev.altKey ) {
			return;
		}

		if ( ev.keyName == 'shift space' ) {
			
			if ( typeof this._checked != 'undefined' ) {

				switch ( this._checked ) {
					case null:
						this.checked = true;
						break;

					case true:
						this.checked = false;
						break;

					case false:
						if ( this.triState ) {
							this.checked = null;
						} else {
							this.checked = true;
						}
						break;
				}

				this.owner.render();
			}

			return;
		}

		if ( this.sticky ) {
			return;
		}

		switch ( ev.code ) {

			case Utils.keyboard.KB_BACKSPACE:

				if ( this.value ) {
					this.value = this.value.substr(0, this.value.length - 1);
					this.owner['fireChangeIfNeeded']();
					this.owner.computeSuggestedStrings( this.value, this )

				} else {
					this.owner.removeTag(myTagIndex);
					this.owner['fireChangeIfNeeded']();
					this.owner = null;
				}

				break;

			case Utils.keyboard.KB_DELETE:

				this.owner.removeTag(myTagIndex);
				this.owner['fireChangeIfNeeded']();
				this.owner = null;

				break;

			default:

				var key: string = ev.keyName;

				if ( key.length == 1 ) {

					this.value = ( this.value || '' ) + key;
					this.owner['fireChangeIfNeeded']();
					this.owner.computeSuggestedStrings(this.value, this);

				}

				break;
		}

	}

	get serialize(): any {

		if ( this._checked === undefined && !this.sticky && !this.triState ) {
			return this.value;
		} else {
			var out: any = {
				label: this.value
			};
			if ( this._checked !== undefined ) {
				out.checked = this._checked;
			}
			if ( this.sticky ) {
				out.sticky = this.sticky;
			}

			if ( this.triState ) {
				out.triState = true;
			}
			return out;
		}

	}

}