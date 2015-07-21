class MFocusable extends UI implements IFocusable {

	public static isMixin: boolean = true;

	// this will be called when a node is embracing this interface.
	public static initialize( node: UI ) {
		node.on( 'disabled', function( state: boolean ) {
			if ( state && (<MFocusable>node).active ) {
				(<MFocusable>node).active = false;
			}
		} );

		node._root.addEventListener( 'mousedown', function(evt) {
			if ( !node.disabled ) {
				(<MFocusable>node).active = true;
				evt.preventDefault();
				evt.stopPropagation();
			}
		}, false );

		node.on( 'blur', function() {
			if ( node._root ) {
				UI_Dom.removeClass( this._root, 'focused' );
			}
		} );

	}

	public wantTabs: boolean;
	public tabIndex: number;

	get active(): boolean {
		return this.form.activeElement == this;
	}

	set active( on: boolean ) {
		on = !!on;

		if ( on != this.active )
		 {
			if ( on ) {
				this.form.activeElement = this;
				if ( this._root ) {
					UI_Dom.addClass( this._root, 'focused' );
				}
			} else {
				if ( this.form.activeElement == this ) {
					this.form.activeElement = null;
				}
				if ( this._root ) {
					UI_Dom.removeClass( this._root, 'focused' );
				}
			}
		}
	}

}