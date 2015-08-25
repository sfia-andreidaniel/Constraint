interface IFocusable {
	active: boolean;
	wantTabs: boolean;
	tabIndex: number;
	includeInFocus: boolean;
	accelerators?: string;
}

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
				Utils.dom.removeClass( this._root, 'focused' );
			}
		} );

	}

	public  wantTabs: boolean;
	public  tabIndex: number;
	public  includeInFocus: boolean;
	private _accelerators: IAccelerator[];

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
					Utils.dom.addClass( this._root, 'focused' );
				}
			} else {
				if ( this.form.activeElement == this ) {
					this.form.activeElement = null;
				}
				if ( this._root ) {
					Utils.dom.removeClass( this._root, 'focused' );
				}
			}
		}
	}

	get accelerators(): string {
		var result: string[] = [],
		    i     : number,
		    len   : number = ( this._accelerators || [] ).length;

		for ( i=0; i<len; i++ ) {
			switch ( true ) {
				case typeof this._accelerators[i].keyAsString != 'undefined':
					result.push( this._accelerators[i].keyAsString + ( this._accelerators[i].action != 'click' ? ':' + this._accelerators[i].action : '' ) );
					break;
				case typeof this._accelerators[i].keyAsNumber != 'undefined':
					result.push( String( this._accelerators[i].keyAsNumber ) + ( this._accelerators[i].action != 'click' ? ':' + this._accelerators[i].action : '' ) );
					break;
			}
		}

		return result.length ? result.join( ', ' ) : null;
	}

	set accelerators( accelerators: string ) {

		var acc: string[] = String( accelerators || '' ).replace( /(^[\s]+|[\s]+$)/g, '' ).split( /[\s]+?,[\s]+?/g ),
		    i: number = 0,
		    len: number = acc.length,
		    matches: string[];

		this._accelerators = [];

		for ( i=0; i<len; i++ ) {
			switch ( true ) {
				case !!( matches = /^([\d]+)(\:(.*))?$/.exec( acc[i] ) ):
					this._accelerators.push({
						keyAsNumber: parseInt( matches[1] ),
						action: matches[3] || 'click'
					});
					break;
				case !!( matches = /^(.*?)(\:(.*?))?$/.exec( acc[i] ) ):
					this._accelerators.push({
						keyAsString: matches[1],
						action: matches[3] || 'click'
					});
					break;
			}
		}

		this._accelerators = this._accelerators.length
			? this._accelerators
			: undefined;

		this.fire( 'accelerators-changed' );

	}

	private __runAccelerator__( keyAsNumber: number, keyAsString: string ): boolean {
		
		var i: number = 0,
		    accelerators: IAccelerator[] = this._accelerators || [],
		    len: number = accelerators.length;

		for ( i=0; i<len; i++ ) {
			if ( this._accelerators[i].keyAsString === keyAsString || this._accelerators[i].keyAsNumber === keyAsNumber && this.visible && !this.disabled ) {
				if ( this.visible ) {
					this.active = true;
					this.fire( this._accelerators[i].action );
					return true;
				}
			}
		}

		return false;

	}

}