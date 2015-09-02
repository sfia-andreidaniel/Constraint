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
		color:           $I.string('UI.UI_MenuBar/menuitem.color.normal'),
		border:          $I.string('UI.UI_MenuBar/menuitem.borderColor')
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
	protected _icon: UI_Sprite = null;
	protected _checked: boolean = false;
	protected _groupName: string = null;
	protected _action: string = null;
	protected _id: string = null;

	protected _overlay: UI_Screen_Window = null;
	protected _overlayMouseDownHandler: ( x: number, y: number, button: number ) => void;

	protected _menuBarRootNode: any;
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

	get checked(): boolean {
		return this._checked;
	}

	set checked( on: boolean ) {
		on = !!on;
		if ( on != this._checked ) {
			
			this._checked = on;
			
			if ( this._checked && this._inputType == EMenuItemInputType.RADIO && this._owner ) {
				this._owner.fire( 'child-checked', this, this.groupName );
			}

			this.onRepaint();
		}
	}

	get groupName(): string {
		return this._groupName;
	}

	set groupName( groupName: string ) {
		groupName = String( groupName || '' ) || null;
		
		if ( groupName != this._groupName ) {
			this._groupName = groupName;
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
		this._menuBarRootNode = Utils.dom.create( 'div', 'ui UI_MenuItem'),

		this._menuBarRootNode.appendChild( document.createTextNode( String( this._caption || '' ) ) );

		( function( me ) {

			me.onDOMEvent( me._menuBarRootNode, EEventType.MOUSE_DOWN, function( evt: Utils_Event_Mouse ) {

				if ( !me.disabled && me.owner ) {
					me.form.activeElement = me.owner;
					(<UI_MenuBar>me.owner).focusedItem = me;
				}

			}, true );

			me.onDOMEvent( me._menuBarRootNode, EEventType.MOUSE_OVER, function( ev: Utils_Event_Mouse ) {

				if ( !me.disabled && me.owner ) {
					(<UI_MenuBar>me.owner).fire( 'request-item-focus', me );
				}

			}, true );

			me.onDOMEvent( me._menuBarRootNode, EEventType.CLICK, function( ev: Utils_Event_Mouse ) {

				me.click();

				if ( !me.isOpened ) {
					me.open();
				} else {
					me.close();
				}
			}, true );

		} )( this );

		return this._menuBarRootNode;
	}

	get target(): UI {
		switch ( true ) {
			case this._owner instanceof UI_MenuItem:
				return (<UI_MenuItem>this._owner).target;
				break;
			case this._owner instanceof UI_MenuBar:
				return (<UI_MenuBar>this._owner).target;
				break;
			default:
				return null;
		}
	}

	get id(): string {
		return this._id;
	}

	set id( id: string ) {
		this._id = String( id || '' ) || null;
	}

	public click() {
		
		if ( this.disabled )
			return;

		switch ( this._inputType ) {

			case EMenuItemInputType.RADIO:
				this.checked = true;
				break;

			case EMenuItemInputType.CHECKBOX:
				this.checked = !this.checked;
				break;

		}

		if ( this.action ) {

			var target: UI = this.target;

			if ( target && !target.disabled ) {
				target.fire( 'action', this.action, this.id, this.checked, this );
			}

			this.close( true );

		}

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
						Utils.dom.removeClass( menuItem._menuBarRootNode, 'disabled' );
					} else {
						Utils.dom.addClass( menuItem._menuBarRootNode, 'disabled' );
					}
					this.render();
				} else {
					this.onRepaint();
				}
			});

			menuItem.on( 'keydown', function( evt: Utils_Event_Keyboard ) {

				var code = evt.code;

				switch ( code ) {
					//UP
					case Utils.keyboard.KB_UP:
						menuItem.modifySelectedIndex( -1 );
						break;

					//DOWN
					case Utils.keyboard.KB_DOWN:
						menuItem.modifySelectedIndex( 1 );
						break;
				}

			} );

			menuItem.on( 'child-checked', function( item: UI_MenuItem, groupName: string ) {
				
				var cursor: UI_MenuItem;

				for ( var i=0, len = this._children.length; i<len; i++ ) {
					if ( this._children[i] != item ) {
						cursor = <UI_MenuItem>this._children[i];
						if ( cursor.checked && cursor.inputType == EMenuItemInputType.RADIO && cursor.groupName == groupName ) {
							cursor.checked = false;
						}
					}
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
		return this._icon ? this._icon.path : null;
	}

	set icon( icon: string ) {
		icon = String( icon || '' ) || null;
		
		if ( icon ) {
			this._icon = UI_Resource.createSprite(icon + '/' + UI_MenuItem._theme.iconSize + 'x' + UI_MenuItem._theme.iconSize );
		} else {
			this._icon = null;
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
				
				(<UI_MenuItem>this._owner).render();

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
					keyboardWidth = Math.max( screen.measureText( child.shortcutKey, UI_MenuItem._theme.font ) + 20, keyboardWidth );
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
			renderFlags[ UI_MenuItem.FLAG_CHILDREN ] = ~~childNodes * 30;

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
		return 2 +
			   this._children.length * UI_MenuItem._theme.height;
	}

	public render() {

		if ( !this._overlay ) {
			return;
		}

		var ctx: UI_Canvas_ContextMapper = this._overlay.ctx;

		ctx.beginPaint();

		ctx.fillStyle = UI_MenuItem._theme.bgColor;
		ctx.fillRect( 0, 0, this._overlay.width, this._overlay.height );

		ctx.strokeStyle = UI_MenuItem._theme.border;
		ctx.lineWidth = 1;
		ctx.rect( .5, .5, this._overlay.width - 1, this._overlay.height - 1 );
		ctx.stroke();

		var top = 1;

		for ( var i=0, len = this._children.length; i<len; i++ ) {
			(<UI_MenuItem>this._children[i]).paintAt( top, this._overlay, i == this.selectedIndex );
			top += UI_MenuItem._theme.height;
		}

		ctx.endPaint();

	}

	// Paints this menuItem in parent's window overlay
	public paintAt( top: number, win: UI_Screen_Window, paintActive: boolean ) {
		
		this.renderRect = {
			"x": win.left,
			"y": win.top + top,
			"width": win.width,
			"height": win.height
		};

		var ctx: UI_Canvas_ContextMapper = win.ctx;

		if ( paintActive && !this.disabled ) {
			ctx.fillStyle = UI_MenuItem._theme.selectedBgColor;
			ctx.fillRect( 1, top, ctx.width - 2, UI_MenuItem._theme.height );
		}

		ctx.font = UI_MenuItem._theme.font;

		var left: number = UI_MenuItem._theme.padding,
		    color: string = this.disabled 
		    	? UI_MenuItem._theme.disabledColor
		    	: UI_MenuItem._theme.color
		    ;

		// Paint icon if any

		if ( this.renderFlags[ UI_MenuItem.FLAG_ICON ] > 0 ) {

			if ( this._icon ) {
				this._icon.paintWin( ctx, left, top + ~~( UI_MenuItem._theme.height / 2 - UI_MenuItem._theme.iconSize / 2 ) );
			}

			left += this.renderFlags[ UI_MenuItem.FLAG_ICON ];
		}

		// Paint input if any

		if ( this.renderFlags[ UI_MenuItem.FLAG_INPUT ] > 0 ) {

			switch ( this._inputType ) {
				case EMenuItemInputType.RADIO:
				case EMenuItemInputType.CHECKBOX:

					if ( this._checked ) {
						
						UI_Resource.createSprite( 
							'Constraint/menuitem_checked/' + ( UI_MenuItem._theme.inputSize + 'x' + UI_MenuItem._theme.inputSize ) + ( this.disabled ? '-disabled' : '' ) 
						).paintWin( ctx, left, top + ~~( UI_MenuItem._theme.height / 2 - 10 ) );

					} 

					break;
					
			}

			left += this.renderFlags[ UI_MenuItem.FLAG_INPUT ];
		}

		// Paint label if any

		if ( this.renderFlags[ UI_MenuItem.FLAG_LABEL ] > 0 ) {

			ctx.textBaseline = 'middle';
			ctx.textAlign = 'left';
			ctx.fillStyle = color;
			ctx.fillText( this._caption, left, top + ~~( UI_MenuItem._theme.height / 2 ) );

			left += this.renderFlags[ UI_MenuItem.FLAG_LABEL ];
		}

		// Paint keyboard shortcut if any

		if ( this.renderFlags[ UI_MenuItem.FLAG_KBD ] > 0 ) {

			left += this.renderFlags[ UI_MenuItem.FLAG_KBD ];

			if ( this._shortcutKey ) {
				ctx.textBaseline = 'middle';
				ctx.textAlign = 'right';
				ctx.fillStyle = color;
				ctx.fillText( this._shortcutKey, left, top + ~~( UI_MenuItem._theme.height / 2 ) );
			}

		}

		// Paint the opener sign if have children

		if ( this.renderFlags[ UI_MenuItem.FLAG_CHILDREN ] > 0 ) {

			if ( this._children.length ) {
				
				UI_Resource.createSprite( 
					'Constraint/menuitem_expander' + ( paintActive ? '_hover' : '' ) + '/20x20' + ( this.disabled ? '-disabled' : '' ) 
				).paintWin( ctx, left, top + ~~( UI_MenuItem._theme.height / 2 - 10 ) );

			}

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

			Utils.circular.createMap( -1, self._children.length - 1, self.selectedIndex, relative < 0 ).forEach( function( index ) {
				
				if ( cursor == null && ( index == -1 || !self._children[index].disabled ) ) {
					cursor = index;
				}

			} );

		} )( this );

		if ( cursor !== null ) {
			this.selectedIndex = cursor;
		}


	}

	public onScreenKeyDown( evt: Utils_Event_Keyboard ) {

		var code = evt.code;

		switch ( code ) {
			case Utils.keyboard.KB_ESC:
				this.close( true );
				break;
			// UP
			case Utils.keyboard.KB_UP:
				this.modifySelectedIndex( -1 );
				break;
			// DOWN
			case Utils.keyboard.KB_DOWN:
				this.modifySelectedIndex( 1 );
				break;
			// LEFT
			case Utils.keyboard.KB_LEFT:
				if ( this.selectedIndex == -1 && this.owner instanceof UI_MenuBar ) {
					this.owner.fire( 'keydown', evt );
				} else {
					this.close();
				}

				break;
			// Right
			case Utils.keyboard.KB_RIGHT:
				if ( this.selectedIndex > -1 ) {
					(<UI_MenuItem>this._children[ this.selectedIndex ]).open();
					(<UI_MenuItem>this._children[ this.selectedIndex ]).modifySelectedIndex(1);
				} else {

					if ( this.owner instanceof UI_MenuBar ) {
						this.owner.fire( 'keydown', evt );
					}

				}
				break;
			
			// ENTER, SPACE triggers click
			case Utils.keyboard.KB_ENTER:
			case Utils.keyboard.KB_SPACE:
				if ( this._selectedIndex != -1 ) {
					(<UI_MenuItem>this._children[ this._selectedIndex ]).click();
				}
				break;
			default:
				//console.log( 'got: ', code, 'in: ', this._caption );
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

					me._overlay.on( 'keydown', function( evt: Utils_Event_Keyboard ) {
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

	public open( ignoredArgument: IPoint = null ) {

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

				placement = UI_Screen.get.getBestPlacementMenuStyle( this.renderRect, size, 1 );

				this.openAtXY( placement.x, placement.y, { "width": placement.width, "height": placement.height } );

				break;
		}

	}

}

Constraint.registerClass( {
	"name": "UI_MenuItem",
	"extends": "UI",
	"parentTypeOnly": [
		"UI_Popup",
		"UI_MenuBar",
		"UI_MenuItem"
	],
	"properties": [
		{
			"name": "inputType",
			"type": "enum:EMenuItemInputType"
		},
		{
			"name": "caption",
			"type": "string"
		},
		{
			"name": "icon",
			"type": "string"
		},
		{
			"name": "shortcutKey",
			"type": "string"
		},
		{
			"name": "action",
			"type": "string"
		},
		{
			"name": "id",
			"type": "string"
		}
	]
});