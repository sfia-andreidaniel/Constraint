class UI_MenuItem extends UI {

	public static _theme: any = {
		font : 			 $I.string('UI.UI_MenuBar/menuitem.fontSize') + "px" + " " + $I.string('UI.UI_MenuBar/menuitem.fontFamily'),
		height: 		 $I.number('UI.UI_MenuBar/menuitem.height'),
		padding: 		 $I.number('UI.UI_MenuBar/menuitem.padding'),
		iconSize: 		 $I.number('UI.UI_MenuBar/menuitem.iconSize'),
		inputSize: 		 $I.number('UI.UI_MenuBar/menuitem.inputSize'),
		bgColor: 		 $I.string('UI.UI_MenuBar/menuitem.background.color'),
		selectedBgColor: $I.string('UI.UI_MenuBar/menuitem.background.selectedColor'),
		disabledColor:   $I.string('UI.UI_MenuBar/menuitem.color.disabled'),
		color:           $I.string('UI.UI_MenuBar/menuitem.color.normal')
	};

	public static FLAG_ICON     : number = 0;
	public static FLAG_INPUT    : number = 1;
	public static FLAG_LABEL    : number = 2;
	public static FLAG_KBD      : number = 3;
	public static FLAG_CHILDREN : number = 4;

	// we need to know wheather to allocate space for the icon,
	// keyboard shortcut, the ">" icon on rendering. This dimensions
	// are depending on the sibling of the menuItem also, and are computed
	// by the owner.computeRenderFlags() method.
	public    renderFlags: number[] = [ 0, 0, 0, 0, 0 ];
	public    renderRect : IWindow;

	protected _caption: string = '';
	protected _inputType: EMenuItemInputType = EMenuItemInputType.NONE;
	protected _shortcutKey: string = null;
	protected _icon: string = null;

	protected _overlay: UI_Screen_Window = null;
	protected _overlayMouseDownHandler: ( x: number, y: number, button: number ) => void;

	protected _menuBarRootNode: any;
	protected _action: string = null;
	protected _selectedIndex: number = -1;

	constructor( owner: UI ) {
		super( owner );
		this._setupEvents_();
		this.fire( 'disabled', this.disabled );
	}

	get caption(): string {
		return this._caption;
	}

	set caption( cap: string ) {
		cap = String( cap || '' );
		if ( cap != this._caption ) {
			
			this._caption = cap;

			if ( this._menuBarRootNode ) {
				this._menuBarRootNode.innerHTML = '';
				this._menuBarRootNode.appendChild( document.createTextNode( String( this._caption || '' ) ) );
			} else {
				this.onRepaint();
			}
		}
	}

	get inputType(): EMenuItemInputType {
		return this._inputType;
	}

	set inputType( type: EMenuItemInputType ) {
		if ( type != this._inputType ) {
			switch ( type ) {
				case EMenuItemInputType.NONE:
				case EMenuItemInputType.RADIO:
				case EMenuItemInputType.CHECKBOX:
					this._inputType = type;
					break;
				default:
					console.warn('Invalid input type! Setting EMenuItemInputType.NONE' );
					this._inputType = EMenuItemInputType.NONE;
					break;
			}
			this.onRepaint();
		}
	}

	get shortcutKey(): string {
		return this._shortcutKey;
	}

	set shortcutKey( key: string ) {
		key = String( key || '' ) || null;
		if ( key != this._shortcutKey ) {
			this._shortcutKey = key;
			this.onRepaint();
		}
	}

	private createMenuBarNode(): HTMLDivElement {
		this._menuBarRootNode = UI_Dom.create( 'div', 'ui UI_MenuItem'),

		this._menuBarRootNode.appendChild( document.createTextNode( String( this._caption || '' ) ) );

		( function( me ) {

			me._menuBarRootNode.addEventListener( 'mousedown', function( evt ) {

				if ( !me.disabled && me.owner ) {
					me.form.activeElement = me.owner;
					(<UI_MenuBar>me.owner).focusedItem = me;
				}

			}, true );

			me._menuBarRootNode.addEventListener( 'mouseover', function( ev ) {

				if ( !me.disabled && me.owner ) {
					(<UI_MenuBar>me.owner).fire( 'request-item-focus', me );
				}

			}, true );

			me._menuBarRootNode.addEventListener( 'click', function( evt ) {
				me.click();

				if ( !me.isOpened ) {
					me.open();
				} else {
					console.log( 'close...' );
					me.close();
				}
			}, true );

		} )( this );

		return this._menuBarRootNode;
	}

	public click() {
		
		if ( this.disabled )
			return;

		console.log( 'clicked: ', this._caption );

	}

	get menuBarNode(): HTMLDivElement {
		return this._menuBarRootNode
			? this._menuBarRootNode
			: this.createMenuBarNode();
	}

	private _setupEvents_() {
		( function( menuItem ) {

			menuItem.on( 'disabled', function (on: boolean) {
				if ( menuItem._menuBarRootNode ) {
					if ( !on ) {
						UI_Dom.removeClass( menuItem._menuBarRootNode, 'disabled' );
					} else {
						UI_Dom.addClass( menuItem._menuBarRootNode, 'disabled' );
					}
				}
			});

			menuItem.on( 'keydown', function( evt ) {

				var code = evt.keyCode || evt.charCode;

				switch ( code ) {
					//UP
					case 38:
						menuItem.modifySelectedIndex( -1 );
						break;

					//DOWN
					case 40:
						menuItem.modifySelectedIndex( 1 );
						break;
				}

			} );

		} )( this );
	}

	get action(): string {
		return this._action;
	}

	set action( action: string ) {
		action = String( action || '' ) || null;
		this._action = action;
	}

	get icon(): string {
		return this._icon;
	}

	set icon( icon: string ) {
		icon = String( icon || '' ) || null;
		if ( icon != this._icon ) {
			this._icon = icon;
			this.onRepaint();
		}
	}

	get isOpened(): boolean {
		return !!this._overlay;
	}

	// @Overrides: UI.insert
	public insert( child: UI ): UI {
		if ( !child || !( child instanceof UI_MenuItem ) ) {
			throw new Error( 'Invalid child type. A UI_MenuItem supports only UI_MenuItem child nodes.');
		} else {
			return super.insert( child );
		}
	}

	// @Overrides: UI.onRepaint
	public onRepaint(): boolean {
		if ( this._owner ) {
			if ( this._owner instanceof UI_MenuItem ) {
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	}

	public computeRenderFlags(): number[] {

		if ( this._children.length ) {

			var icon: boolean = false,
			    input: boolean = false,
			    keyboardWidth: number = 0,
			    keyboard: boolean = false,
			    childNodes: boolean = false,
			    width: number = 0,
			    childWidth: number = 0,
			    i: number = 0,
			    len: number = this._children.length,
			    child: UI_MenuItem,
			    screen = UI_Screen.get,
			    padding = UI_MenuItem._theme.padding,
			    renderFlags: number[] = [ 0, 0, 0, 0, 0 ];

			for ( i=0; i<len; i++ ) {
				
				child = <UI_MenuItem>this._children[i];

				if ( !icon && child.icon ) {
					icon = true;
				}

				if ( child.shortcutKey ) {
					keyboard = true;
					keyboardWidth = Math.max( screen.measureText( child.shortcutKey, UI_MenuItem._theme.font ), keyboardWidth );
				}

				if ( !childNodes && child._children.length ) {
					childNodes = true;
				}

				width = Math.max( screen.measureText( child.caption, UI_MenuItem._theme.font ) );

				if ( !input && child.inputType != EMenuItemInputType.NONE ) {
					input = true;
				}

			}

			renderFlags[ UI_MenuItem.FLAG_INPUT ] = ~~input * ( UI_MenuItem._theme.inputSize + padding );
			renderFlags[ UI_MenuItem.FLAG_ICON ]  = ~~icon * ( UI_MenuItem._theme.iconSize + padding );
			renderFlags[ UI_MenuItem.FLAG_LABEL ] = width + padding + padding;
			renderFlags[ UI_MenuItem.FLAG_KBD ]   = ~~keyboard * ( keyboardWidth + padding );
			renderFlags[ UI_MenuItem.FLAG_CHILDREN ] = ~~childNodes * 16;

			for ( i=0; i<len; i++ ) {

				child = <UI_MenuItem>this._children[i];

				child.renderFlags[ UI_MenuItem.FLAG_INPUT    ] = renderFlags[ UI_MenuItem.FLAG_INPUT ];
				child.renderFlags[ UI_MenuItem.FLAG_ICON     ] = renderFlags[ UI_MenuItem.FLAG_ICON ];
				child.renderFlags[ UI_MenuItem.FLAG_LABEL    ] = renderFlags[ UI_MenuItem.FLAG_LABEL ];
				child.renderFlags[ UI_MenuItem.FLAG_KBD      ] = renderFlags[ UI_MenuItem.FLAG_KBD ];
				child.renderFlags[ UI_MenuItem.FLAG_CHILDREN ] = renderFlags[ UI_MenuItem.FLAG_CHILDREN ];
			}

			return renderFlags;

		} else {
			return [ 0, 0, 0, 0, 0 ];
		}
	}

	get width(): number {
		var renderFlags: number[] = this.computeRenderFlags();
		return renderFlags[0] + renderFlags[1] + renderFlags[2] + renderFlags[3] + renderFlags[4];
	}

	get height(): number {
		return 2 * UI_MenuItem._theme.padding +
			   this._children.length * UI_MenuItem._theme.height;
	}

	public render() {

		this._overlay.beginPaint();

		this._overlay.fillStyle = UI_MenuItem._theme.bgColor;
		this._overlay.fillRect( 0, 0, this._overlay.width, this._overlay.height );

		var top = UI_MenuItem._theme.padding;

		for ( var i=0, len = this._children.length; i<len; i++ ) {
			(<UI_MenuItem>this._children[i]).paintAt( top, this._overlay, i == this.selectedIndex );
			top += UI_MenuItem._theme.height;
		}

		this._overlay.endPaint();

	}

	// Paints this menuItem in parent's window overlay
	public paintAt( top: number, win: UI_Screen_Window, paintActive: boolean ) {
		
		this.renderRect = {
			"x": win.left,
			"y": win.top + top,
			"width": win.width,
			"height": win.height
		};

		if ( paintActive ) {
			win.fillStyle = UI_MenuItem._theme.selectedBgColor;
			win.fillRect( UI_MenuItem._theme.padding, top, win.width - 2 * UI_MenuItem._theme.padding, UI_MenuItem._theme.height );
		}

		win.font = UI_MenuItem._theme.font;

		var left: number = UI_MenuItem._theme.padding,
		    color: string = this.disabled 
		    	? UI_MenuItem._theme.disabledColor
		    	: UI_MenuItem._theme.color
		    ;

		// Paint icon if any

		if ( this.renderFlags[ UI_MenuItem.FLAG_ICON ] > 0 ) {

			left += this.renderFlags[ UI_MenuItem.FLAG_ICON ];
		}

		// Paint input if any

		if ( this.renderFlags[ UI_MenuItem.FLAG_INPUT ] > 0 ) {

			left += this.renderFlags[ UI_MenuItem.FLAG_INPUT ];
		}

		// Paint label if any

		if ( this.renderFlags[ UI_MenuItem.FLAG_LABEL ] > 0 ) {

			win.textBaseline = 'middle';
			win.textAlign = 'left';
			win.fillStyle = color;
			win.fillText( this._caption, left, top + ~~( UI_MenuItem._theme.height / 2 ) );

			left += this.renderFlags[ UI_MenuItem.FLAG_LABEL ];
		}

		// Paint keyboard shortcut if any

		if ( this.renderFlags[ UI_MenuItem.FLAG_KBD ] > 0 ) {

			left += this.renderFlags[ UI_MenuItem.FLAG_KBD ];
		}

		// Paint the opener sign if have children

		if ( this.renderFlags[ UI_MenuItem.FLAG_CHILDREN ] > 0 ) {

			left += this.renderFlags[ UI_MenuItem.FLAG_CHILDREN ];
		}

	}

	public onScreenMouseMove( x: number, y: number, button: number ) {
		
		if ( y < UI_MenuItem._theme.padding ) {
			return;
		}

		var index: number = ~~( ( y - UI_MenuItem._theme.padding ) / UI_MenuItem._theme.height );

		if ( this._children[ index ] && !this._children[index].disabled ) {
			this.selectedIndex = index;
			(<UI_MenuItem>this._children[ this.selectedIndex ] ).open();
		}

	}

	public onScreenClick( x: number, y: number, button: number ) {
		
		if ( button != 1 ) {
			return;
		}

		if ( y < UI_MenuItem._theme.padding ) {
			return;
		}

		var index: number = ~~( ( y - UI_MenuItem._theme.padding ) / UI_MenuItem._theme.height );

		if ( this._children[ index ] && !this._children[index].disabled ) {
			(<UI_MenuItem>this._children[index]).click();
		}


	}

	public modifySelectedIndex( relative: number ) {

		var cursor = null;

		( function( self ) {

			Utils.createCircularMap( -1, self._children.length - 1, self.selectedIndex, relative < 0 ).forEach( function( index ) {
				
				if ( cursor == null && ( index == -1 || !self._children[index].disabled ) ) {
					cursor = index;
				}

			} );

		} )( this );

		if ( cursor !== null ) {
			this.selectedIndex = cursor;
		}


	}

	public onScreenKeyDown( evt ) {

		var code = evt.keyCode || evt.charCode;

		switch ( code ) {
			case 27:
				this.close( true );
				break;
			// UP
			case 38:
				console.log( 'UP: in ' + this._caption );
				this.modifySelectedIndex( -1 );
				break;
			// DOWN
			case 40:
				console.log( 'DOWN: in ' + this._caption );
				this.modifySelectedIndex( 1 );
				break;
			// LEFT
			case 37:

				if ( this.selectedIndex == -1 && this.owner instanceof UI_MenuBar ) {

					this.owner.fire( 'keydown', evt );

				} else {

					console.log( 'LEFT: in ' + this._caption );
					this.close();
				}
				break;
			// Right
			case 39:
				if ( this.selectedIndex > -1 ) {
					(<UI_MenuItem>this._children[ this.selectedIndex ]).open();
					(<UI_MenuItem>this._children[ this.selectedIndex ]).modifySelectedIndex(1);
				} else {

					if ( this.owner instanceof UI_MenuBar ) {
						this.owner.fire( 'keydown', evt );
					}

				}
				break;
			case 13:
				if ( this._selectedIndex != -1 ) {
					(<UI_MenuItem>this._children[ this._selectedIndex ]).click();
				}
				break;
			default:
				console.log( 'got: ', code, 'in: ', this._caption );
				break;
		}

	}

	public onScreenMouseDown( x: number, y: number, button: number ) {
		UI_Screen.get.off( 'mousedown', this._overlayMouseDownHandler );
		this.close();
	}

	public close( untilRoot: boolean = false ) {

		if ( untilRoot ) {
			this.close()
			if ( this._owner && this._owner instanceof UI_MenuItem ) {
				(<UI_MenuItem>this._owner).close( true );
			}

		} else {
			// Closes the menu.
			if ( this.isOpened ) {

				/* First close all the child nodes. */
				for ( var i=0, len = this._children.length; i<len; i++ ) {
					(<UI_MenuItem>this._children[i] ).close();
				}

				this._overlay.close();
				this._overlay = null;
				this._overlayMouseDownHandler = null;
			}
		}
	}

	public openAtXY( x: number, y: number, size: IRect ): boolean {
		
		size = size || {
			width: this.width,
			height: this.height
		};

		var renderFlags: number[],
		    siblings: UI_MenuItem[],
		    i: number,
		    len: number;

		if ( this._children.length ) {

			if ( !this.isOpened ) {

				/* First close all my siblings */
				if ( this._owner ) {
					
					siblings = <UI_MenuItem[]>this._owner.childNodes;
					
					for (  i=0, len = siblings.length; i<len; i++ ) {
						
						if ( siblings[i] != this )
							siblings[i].close();
					
					}
				}
				
				this._overlay = UI_Screen.get.createWindow( 
					x, 
					y, 
					size.width, 
					size.height
				);

				// Add the paint listener to the overlay
				( function( me ) {
					
					me._overlay.on( 'render', function() {
						me.render();
					} );

					me._overlay.on( 'mousemove', function( x: number, y: number, button: number ) {
						me.onScreenMouseMove( x, y, button );
					} );

					me._overlay.on( 'click', function( x: number, y: number, button: number ) {
						me.onScreenClick( x, y, button );
					} );

					me._overlay.on( 'close', function() {
						me._overlay = null;
					} );

					me._overlay.on( 'keydown', function( evt ) {
						me.onScreenKeyDown( evt );
					} );

					me._overlayMouseDownHandler = function( x: number, y: number, button: number ) {
						me.onScreenMouseDown( x, y, button );
					};

					UI_Screen.get.on( 'mousedown', me._overlayMouseDownHandler );

				} )( this );

				this.selectedIndex = -1;

			}

			this.render();

			return true;

		} else {

			return false;
		
		}

	}

	get selectedIndex(): number {
		return this._selectedIndex;
	}

	set selectedIndex( index: number ){ 

		if ( index != this._selectedIndex ) {

			if ( index < -1 || index >= this._children.length ) {
				throw new Error( 'Invalid index!' );
			}

			if ( this._selectedIndex != -1 ) {
				(<UI_MenuItem>this._children[ this._selectedIndex ]).close();
			}

			this._selectedIndex = index;

			this.render();

		}
	}

	public open() {

		if ( !this._owner || !this._children.length || this.disabled ) {
			return;
		}

		var clientRect: IBoundingBox,
		    size: IRect,
		    src: IWindow,
		    placement: IWindow;

		switch ( true ) {

			case this._owner instanceof UI_MenuBar:
				
				clientRect = this.menuBarNode.getBoundingClientRect();
				
				size = {
					"width": this.width,
					"height": this.height
				};

				src = {
					x: ~~clientRect.left,
					y: ~~clientRect.top,
					width: ~~clientRect.width,
					height: ~~clientRect.height
				};


				placement = UI_Screen.get.getBestPlacementDropDownStyle( src, size );

				this.openAtXY( placement.x, placement.y, size );

				break;
			
			case this._owner instanceof UI_MenuItem:

				size = {
					"width": this.width,
					"height": this.height
				};

				placement = UI_Screen.get.getBestPlacementMenuStyle( this.renderRect, size );

				this.openAtXY( placement.x, placement.y, { "width": placement.width, "height": placement.height } );

				break;
		}

	}

}