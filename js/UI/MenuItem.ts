class UI_MenuItem extends UI {

	protected _caption: string = '';
	
	protected _menuBarRootNode: any;

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

		return this._menuBarRootNode;
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

}