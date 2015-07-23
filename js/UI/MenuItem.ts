class UI_MenuItem extends UI {

	public static _theme: any = {
		font : $I.string('UI.UI_MenuBar/menuitem.fontSize') + "px" + " " + $I.string('UI.UI_MenuBar/menuitem.fontFamily')
	};

	protected _caption: string = '';
	protected _menuBarRootNode: any;
	protected _action: string = null;

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

			me._menuBarRootNode.addEventListener( 'click', function( evt ) {
				me.click();
			}, true );

		} )( this );

		return this._menuBarRootNode;
	}

	public click() {
		
		if ( this.disabled )
			return;
		// Clicks on the item
		console.log( 'clicked: ', this );

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

		} )( this );
	}

	get action(): string {
		return this._action;
	}

	set action( action: string ) {
		action = String( action || '' ) || null;
		this._action = action;
	}

}