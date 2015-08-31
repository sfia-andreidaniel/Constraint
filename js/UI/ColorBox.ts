class UI_ColorBox extends UI implements IInput, IFocusable {

	public static _theme = {
		defaults: {
			width: $I.number('UI.UI_ColorBox/defaults.width'),
			height: $I.number('UI.UI_ColorBox/defaults.height')
		},
		expander: {
			collapsed: $I.string('UI.UI_ColorBox/expander.collapsed'),
			expanded:  $I.string('UI.UI_ColorBox/expander.expanded')
		}
	};

	// Focusable mixin properties
	public    active: boolean; // the active is overrided by the MFocusable mixin
	public    wantTabs: boolean = false;
	public    tabIndex: number = 0;
	public    includeInFocus: boolean = true;

	protected color: UI_Color = new UI_Color(0, 0, 0, 1);

	protected _dom = {
		color: 		Utils.dom.create('div', 'color'),
		colorInner: Utils.dom.create('div', 'inner' ),
		expander: 	Utils.dom.create('div', 'expander'),
		icon:  		Utils.dom.create( 'div', UI_ColorBox._theme.expander.collapsed )
	};

	constructor( owner: UI ) {
		super( owner, [ 'IInput', 'IFocusable' ], Utils.dom.create( 'div', 'ui UI_ColorBox' ) );
		this._setupDom_();
	}

	private colorChanged() {
		
		this._dom.colorInner.style.backgroundColor = this.color.toString(null);
		
	}

	get value(): string {
		return this.color.toString( null );
	}

	set value( value: string ) {
		
		value = String( value || '' ).toLowerCase().replace(/[\s]+/g,'');
		
		try {
			
			var c: UI_Color = UI_Color.create( value );
			
			if ( this.color.red != c.red || this.color.green != c.green || this.color.blue != c.blue || this.color.alpha != c.alpha ) {

				if ( this.color.red != c.red )
					this.color.red = c.red;

				if ( this.color.green != c.green )
					this.color.green = c.green;

				if ( this.color.blue != c.blue )
					this.color.blue = c.blue;

				if ( this.color.alpha != c.alpha )
					this.color.alpha = c.alpha;

				this.colorChanged();

			}

		} catch (err) {

			this.color.red = this.color.green = this.color.blue = 0;
			this.color.alpha = 1;

			this.colorChanged();

		}

	}

	get red(): number {
		return this.color.red;
	}

	set red( red: number ) {
		var prevRed: number = this.red;
		
		this.color.red = red;
		
		if ( this.red != prevRed ) {
			this.colorChanged();
		}
	}

	get green(): number {
		return this.color.green;
	}

	set green( green: number ) {

		var prevGreen: number = this.green;

		this.color.green = green;

		if ( this.green != prevGreen ) {
			this.colorChanged();
		}
	}

	get blue(): number {
		return this.color.blue;
	}

	set blue( blue: number ) {

		var prevBlue: number = this.blue;

		this.color.blue = blue;

		if ( this.blue != prevBlue ) {
			this.colorChanged();
		}
	}

	get hue(): number {
		return ~~( this.color.hue * 239 );
	}

	get light(): number {
		return ~~( this.color.light * 240 )
	}

	get saturation(): number {
		return ~~( this.color.saturation * 240 );
	}

	set hue( hue: number ) {
		var prevHue: number = this.hue;

		this.color.hue = hue / 239;

		if ( this.hue != prevHue ) {
			this.colorChanged();
		}
	}

	set light( light: number ) {
		var prevLight: number = this.light;

		this.color.light = light / 240;

		if ( this.light != prevLight ) {
			this.colorChanged();
		}
	}

	set saturation( saturation: number ) {

		var prevSaturation = this.saturation;

		this.color.saturation = saturation / 240;

		if ( this.saturation != prevSaturation ) {
			this.colorChanged();
		}

	}

	get alpha(): number {
		return ~~( this.color.alpha * 100 );
	}

	set alpha( alpha: number ) {
		
		var prevAlpha: number = this.alpha;

		this.color.alpha = alpha / 100;

		if ( this.alpha != prevAlpha ) {
			this.colorChanged();
		}
	}

	protected _setupDom_() {
		
		this._root.appendChild( this._dom.color );
		this._dom.color.appendChild( this._dom.colorInner );
		this._root.appendChild( this._dom.expander );
		Utils.dom.addClass( this._dom.icon, 'icon' );
		this._dom.expander.appendChild( this._dom.icon );

		this.colorChanged();

		this.width = UI_ColorBox._theme.defaults.width;
		this.height= UI_ColorBox._theme.defaults.height;

		( function( me ) {

			me.on( 'disabled', function( on ) {
				if ( !on ) {
					Utils.dom.removeClass( me._dom.icon, 'disabled' );
				} else {
					Utils.dom.addClass( me._dom.icon, 'disabled' );
				}
			});

			me.onDOMEvent( me._root, EEventType.CLICK, function( ev: Utils_Event_Mouse ) {

				if ( me.disabled ) {
					return;
				}

				UI_Dialog_ColorBox.create( me.form, me.color ).then( function( color: UI_Color ) {
					if ( color && !me.disabled ) {
						me.value = color.toString(null);
						me.fire( 'change' );
					}
				} );

				ev.handled = true;

			}, false );

			me.on( 'keydown', function( ev: Utils_Event_Keyboard ) {

				if ( me.disabled ) {
					return;
				}

				var code: number = ev.code;

				switch ( code ) {

					case Utils.keyboard.KB_F4:
					case Utils.keyboard.KB_SPACE:
						UI_Dialog_ColorBox.create( me.form, me.color ).then( function( color: UI_Color ) {
							if ( color && !me.disabled ) {
								me.value = color.toString(null);
								me.fire( 'change' );
							}
						} );
						ev.handled = true;
						break;
				}

			} );

		} )( this );
	}

}

Mixin.extend( 'UI_ColorBox', 'MFocusable' );

Constraint.registerClass( {
	"name": "UI_ColorBox",
	"extends": "UI",
	"properties": [
		{
			"name": "value",
			"type": "string"
		},
		{
			"name": "red",
			"type": "number"
		},
		{
			"name": "green",
			"type": "number"
		},
		{
			"name": "blue",
			"type": "number"
		},
		{
			"name": "alpha",
			"type": "number"
		}
	]
} );