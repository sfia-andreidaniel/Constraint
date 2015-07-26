class UI_MenuBar extends UI implements IFocusable {

	// IFocusable interface
	public    active: boolean; // the active is overrided by the MFocusable mixin
	public    wantTabs: boolean = false;
	public    tabIndex: number = 0;
	public    includeInFocus: boolean = false;

	protected _focusedItem: UI_MenuItem = null;

	constructor( owner: UI ) {
		super( owner, [ 'IFocusable' ], UI_Dom.create( 'div', 'ui UI_MenuBar' ) );

		this._setupEvents_();

	}

	public insert( child: UI ): UI {

		var i: number,
		    len: number;

		if ( !child )
			throw Error( 'Cannot insert a NULL element.' );

		switch ( true ) {

			case child instanceof UI_MenuItem:

				super.insert( child );
				this._root.appendChild( (<UI_MenuItem>child).menuBarNode );
				return child;

				break;

			default:

				console.warn( 'UI_MenuBar supports only UI_MenuItem children!');

				return child;

				break;

		}
	}

	get target(): UI {
		return this.form;
	}

	get focusedItem(): UI_MenuItem {
		return this._focusedItem || null;
	}

	set focusedItem( item: UI_MenuItem ) {

		item = item || null;
		
		if ( item != this._focusedItem ) {

			if ( this._focusedItem ) {
				UI_Dom.removeClass( this._focusedItem.menuBarNode, 'focused' );
				this._focusedItem.close();
			}

			this._focusedItem = item;

			if ( this._focusedItem ) {
				UI_Dom.addClass( this._focusedItem.menuBarNode, 'focused' );
			}

		}
	}

	protected focusItem( relative: number ) {
		relative = ~~relative;
		
		if ( relative == 0 || !this._children.length || this.disabled ) {
			return;
		}

		var startItem: UI_MenuItem = this.focusedItem
			? this.focusedItem
			: <UI_MenuItem>this._children[0],

			cursor: UI_MenuItem = startItem,
			index: number = this._children.indexOf( cursor ),
			i: number,
			len: number = this._children.length;

		if ( !this.focusedItem ) {
			for ( i=0; i<len; i++ ) {
				if ( !(<UI_MenuItem>this._children[i]).disabled ) {
					this.focusedItem = <UI_MenuItem>this._children[i];
					break;
				}
			}
			return;
		}

		if ( index == -1 )
			return;

		while ( relative != 0 ) {

			if ( relative < 0 ) {

				index--;

				if ( index < 0 ) {
					index = len - 1;
				}

			} else {

				index++;

				if ( index >= len ) {
					index = 0;
				}

			}

			cursor = <UI_MenuItem>this._children[ index ];

			if ( !cursor.disabled ) {

				if ( relative < 0 ) {
					relative++;
				} else {
					relative--;
				}

				if ( relative == 0 ) {
					this.focusedItem = cursor;
					break;
				}

			}

			if ( cursor == startItem ) {
				// loop
				break;
			}

		}

	}

	protected _setupEvents_() {

		( function( menuBar ) {

			menuBar.on( 'keydown', function( evt ) {
				var code = evt.keyCode || evt.charCode,
				    handled: boolean = false;
				
				switch ( code ) {
					// LEFT:
					case 37:
						menuBar.focusItem( -1 );
						handled = true;
						break;
					// RIGHT:
					case 39:
						menuBar.focusItem( 1 );
						handled = true;
						break;
					// ESC:
					case 27:
						menuBar.form.activeElement = null;
						break;
					// ENTER:
					case 13:
						if ( menuBar.focusedItem ) {
							menuBar.focusedItem.click();
						}
						break;
					case 40: // DOWN
						if ( menuBar.focusedItem ) {
							menuBar.focusedItem.open();
						}
						break;
				}

			} );

			menuBar.on( 'focus', function() {
				UI_Dom.addClass( this._root, 'focused' );
				
				if ( menuBar.focusedItem === null )
					menuBar.focusItem(1);
			} );

			menuBar.on( 'blur', function() {
				if ( menuBar.focusedItem ) {
					menuBar.focusedItem = null;
				}

			} );

			menuBar.on( 'request-item-focus', function( item: UI_MenuItem ) {
				if ( !menuBar.disabled && menuBar.active && menuBar.form.active ) {
					menuBar.focusedItem = item;
					menuBar.focusedItem.open();
				}
			} );

		} )( this );

	}

}

Mixin.extend( 'UI_MenuBar', 'MFocusable' );