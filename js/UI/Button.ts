/**
 * The UI_Button class represents a standard user interface button.
 *
 * Focused enabled button:
 *
 * ![button](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_Button.png "UI_Button")
 *
 * Disabled button:
 *
 * ![button-disabled](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_Button-disabled.png "UI_Button_Disabled")
 */
class UI_Button extends UI implements IFocusable {
	
	public static _theme = {
		"defaultWidth": $I.number('UI.UI_Button/width'),
		"defaultHeight": $I.number('UI.UI_Button/height'),
		"expander": {
			"expanded": $I.string('UI.UI_Button/expander.expanded'),
			"collapsed": $I.string('UI.UI_Button/expander.collapsed')
		}
	};

	protected _dom = {
		"caption" : Utils.dom.create( 'div', 'caption' ),
		"icon"    : Utils.dom.create( 'div', 'icon' ),
		"i"       : null,  // the icon div of the button
		"expander": null,  // the expander div of the button, in case the button has a menu attached.
		"e"      : null    // the expander icon div of the button
	};

	protected _caption: string = 'Button';
	protected _icon: string = null;
	protected _textAlign: EAlignment = EAlignment.CENTER;
	protected _action: string = null;

	protected _menu: UI_Popup;

	public    active: boolean; // the active is overrided by the MFocusable mixin
	public    wantTabs: boolean = false;
	public    tabIndex: number = 0;
	public    includeInFocus: boolean = true;
	public    accelerators: string;

	constructor ( owner: UI ) {
		
		super( owner, [ 'IFocusable' ], Utils.dom.create( 'div', 'ui UI_Button ta-center' ) );

		this._root.appendChild( this._dom.caption );
		this._root.appendChild( Utils.dom.create( 'div', 'focus-ring' ) );
		this._dom.caption.appendChild( document.createTextNode( this._caption ) );
		this._root.appendChild( this._dom.icon );

		if ( this._width == 0 )
			this.width = UI_Button._theme.defaultWidth;

		if ( this._height == 0 )
			this.height = UI_Button._theme.defaultHeight;

		this._initDom_();
	}

	get caption(): string {
		return this._caption;
	}

	set caption( cap: string ) {
		cap = String( cap || '' );
		if ( cap != this._caption ) {
			this._caption = cap;
			this._dom.caption.innerHTML = '';
			this._dom.caption.appendChild( document.createTextNode( cap ) );
		}
	}

	get icon(): string {
		return this._icon;
	}

	set icon( name: string ) {
		name = String( name || '' ) || null;
		if ( name != this._icon ) {
			
			this._icon = name;
			
			if ( name !== null ) {
				Utils.dom.addClass(this._root, 'has-icon');
			} else {
				Utils.dom.removeClass(this._root, 'has-icon');
			}

			if ( this._icon ) {
				if ( !this._dom.i ) {
					this._dom.i = Utils.dom.create('div');
					this._dom.icon.appendChild(this._dom.i);
				}
			} else {
				if ( this._dom.i ) {
					this._dom.icon.removeChild(this._dom.i);
					this._dom.i = null;
				}
			}
		}
	}

	get action(): string {
		return this._action;
	}

	set action( actionId: string ) {
		this._action = String( actionId || '' ) || null;
	}

	public onRepaint(): boolean {
		if ( super.onRepaint() ) {

			var classes: string;

			if ( this._icon ) {
				
				 classes = UI_Resource.createSprite(this._icon).cssClasses + ( this.disabled ? ' disabled' : '' );
				
				if ( classes != this._dom.i.className ) {
					this._dom.i.className = classes;
				}
			}

			if ( this._menu && this._dom.e ) {

				classes = UI_Resource.createSprite( UI_Button._theme.expander[this.expanded ? 'expanded' : 'collapsed'] ).cssClasses + ( this.disabled ? ' disabled' : '' );

				if ( classes != this._dom.e.className ) {
					this._dom.e.className = classes;
				}

			}

		} else {
			return false;
		}
	}

	get expanded(): boolean {
		if ( !this._menu ) {
			return false;
		} else {
			return this._menu.isOpened;
		}
	}

	set expanded( expanded: boolean ) {
		
		if ( !this._menu || this.disabled ) {
			return;
		}

		expanded = !!expanded;
		
		if (expanded != this.expanded) {
			if (expanded == false) {
				this._menu.close();
			} else {
				this._menu.openDropDownStyle(this.screenWindow);
			}

			(function(me) {
				setTimeout(function() {
					me.onRepaint();
				}, 1);
			})(this);
			
		}
	}

	public click() {
		if ( !this.disabled ) {
			this.fire('click');
			if ( this._action ) {
				this.form.fire('action', this._action, null, false, this);
			}
		}
	}

	protected _initDom_() {
		( function( me ) {
			
			me.onDOMEvent( me._root, EEventType.CLICK, function( ev: Utils_Event_Mouse ) {
				me.click();
				ev.handled = true;
			}, false );

			me.on( 'keydown', function( ev: Utils_Event_Keyboard ) {

				var code = ev.code;

				if ( !me.disabled ) {
					
					switch ( code ) {
						case Utils.keyboard.KB_SPACE:
						case Utils.keyboard.KB_ENTER:
							me.click();
							ev.handled = true;
							break;
						case Utils.keyboard.KB_F4:
							if ( me._menu ) {
								me.expanded = !me.expanded;
							}
							break;

					}
				}

			} );

			me.on('disabled', function(on: boolean) {
				me.onRepaint();
			});

			me.on( 'accelerators-changed', function() {

				if ( this._accelerators ) {

					for ( var i=0, len = this._accelerators.length; i<len; i++ ) {
						if ( ( this._accelerators[i].keyAsString == 'enter' || this._accelerators[i].keyAsNumber == 13 ) && this._accelerators[i].action == 'click' ) {
							Utils.dom.addClass( this._root, 'default-button' );
							return;
						}
					}

				}

				Utils.dom.removeClass( this._root, 'default-button' );

			} );

		} )( this );
	}

	/**
	 * A button can have a menu attached to it. When a menu is attached to a button,
	 * an expander sign is also rendered on the right-side of the button.
	 */
	get menu(): any {
		return this._menu || null;
	}

	set menu( menu: any ) {
		
		menu = menu || null;

		var popup: UI_Popup,
		    item: UI;

		switch ( true ) {
			case typeof menu == 'string':
				
				item = this.form.getElementByName(menu);
				
				if (!item) {
					throw new Error('Menu "' + menu + '" was not found in form!');
				}
				if (!( item instanceof UI_Popup) ) {
					throw new Error('Property "' + menu + '" is not of type UI_Popup');
				}
				popup = <UI_Popup>item;
				break;

			case menu instanceof UI_Popup:
				item = <UI_Popup>menu;
				break;

			case !!!menu:
				popup = null;
				break;
		}

		if ( popup != this._menu ) {

			if ( this._menu ) {
				this._menu.close();
			}

			this._menu = popup;

			if ( popup ) {

				if ( !this._dom.expander ) {
					this._dom.expander = Utils.dom.create('div', 'expander');
					this._root.appendChild(this._dom.expander);
					this._dom.e = Utils.dom.create('div');
					this._dom.expander.appendChild(this._dom.e);
					Utils.dom.addClass(this._root, 'has-expander');
				}

				(function(me) {

					me._menu.on('open', function() {
						me.fire('expand');
						console.log('open...');
						me.onRepaint();
					});

					me._menu.on('close', function() {
						me.fire('collapse');
						console.log('close...');
						me.onRepaint();
					});

				})(this);

			} else {

				if ( this._dom.expander ) {
					this._dom.expander.removeChild(this._dom.e);
					this._dom.e = null;
					this._root.removeChild(this._dom.expander);
					this._dom.expander = null;
					Utils.dom.removeClass(this._root, 'has-expander');
				}
			}
		}

	}

}

Mixin.extend( 'UI_Button', 'MFocusable' );

Constraint.registerClass( {
	"name": "UI_Button",
	"extends": "UI",
	"properties": [
		{
			"name": "caption",
			"type": "string"
		},
		{
			"name": "icon",
			"type": "string"
		},
		{
			"name": "active",
			"type": "boolean"
		},
		{
			"name": "tabIndex",
			"type": "number"
		},
		{
			"name": "menu",
			"type": "UI_Popup"
		}
	]
} );
