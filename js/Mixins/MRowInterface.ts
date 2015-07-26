class MRowInterface extends UI implements IRowInterface {

	/* MIXIN INTERNAL */

	public static isMixin: boolean = true;
	
	// do not mix these properties into target.
	public static skipProperties: string[] = [
		'isRowSelected',
		'selectRow',
		'scrollIntoRow'
	];

	// force overriding these properties into target.
	public static forceProperties: string[] = [
		'onRowIndexClick'
	];

	/* MIXIN IMPLEMENTATION */

	/* EVENTS: 
		@change : when the selected index changes
	*/

	// weather the interface support multiple selection or not.
	private _multiple      : boolean = false;
	private _selectedIndex : number = -1;

	// @overridable by target
	public  length: number;

	// @overridable by target
	public  itemsPerPage   : number;

	public static initialize( node: UI ) {

		/* Add the keyboard events on the onde in order to handle
		   the UP, DOWN, HOME, END, PAGEUP, PAGEDOWN 
		 */
		 ( function( RI: MRowInterface ) {


			 RI.on( 'keydown', function( ev ) {

			 	if ( RI.disabled || !RI.length ) {
			 		return;
			 	}

			 	var code = ev.keyCode || ev.charCode,
			 	    shift = ev.shiftKey,
			 	    ctrl  = ev.ctrlKey,
			 	    selIndex: number = RI.selectedIndex,
			 	    i: number,
			 	    len: number = RI.length,
			 	    itemsPerPage: number = this.itemsPerPage,
			 	    handle: boolean = true;

			 	// 40 = down
			 	// 38 = up
			 	// 34 = page down
			 	// 33 = page up
			 	// 36 = home
			 	// 35 = end
			 	
		 		switch ( code ) {
		 			// DOWN
		 			case 40:
		 				selIndex = selIndex == -1 ? 0 : ( selIndex < len - 1 ? selIndex + 1 : selIndex );
		 				break;

		 			// UP
		 			case 38:
		 				selIndex = selIndex > 1 ? selIndex - 1 : 0;
		 				break;

		 			// HOME
		 			case 36:
		 				selIndex = 0;
		 				break;

		 			// END
		 			case 35:
		 				selIndex = len - 1;
		 				break;

		 			// PAGE UP
		 			case 33:
		 				selIndex = selIndex - itemsPerPage >= 0
		 					? selIndex - itemsPerPage
		 					: 0;
		 				break;

		 			// PAGE DOWN
		 			case 34:
		 				selIndex = selIndex + itemsPerPage < len
		 					? selIndex + itemsPerPage
		 					: len;
		 				break;

		 			default:
		 				handle = false;
		 				break;

		 		}

		 		if ( !handle ) {
		 			return;
		 		}

		 		if ( selIndex > RI.length - 1 ) {
		 			selIndex = RI.length - 1;
		 		}

		 		RI.onRowIndexClick( selIndex, shift, ctrl );

			 } );

		 })( <MRowInterface>node );
	}


	get multiple(): boolean {
		return !!this._multiple;
	}

	set multiple( multiple: boolean ) {
		multiple = !!multiple;
		if ( multiple != this._multiple ) {
			this._multiple = multiple;
			if ( !this._multiple ) {
				this.ensureNoMultipleItemsAreSelected();
			}
		}
	}

	// @override by target
	public isRowSelected( rowIndex: number ): boolean {
		throw new Error('MRowInterface: isRowSelected method must be implemented by target' );
	}

	// @override by target
	public selectRow( rowIndex: number, on: boolean ) {
		throw new Error('MRowInterface: selectRow method must be implemented by target' );
	}

	// @override by target
	public scrollIntoRow( rowIndex: number ) {
		throw new Error('MRowInterface: scrollIntoRow method must be implemented by target' );
	}

	private ensureNoMultipleItemsAreSelected() {
		var foundOne: boolean = false,
		    i: number,
		    len: number,
		    change: boolean = false;

		for ( i=0, len = this.length; i<len; i++ ) {
			if ( this.isRowSelected(i) ) {
				if ( foundOne ) {
					this.selectRow( i, false );
					change = true;
				} else {
					foundOne = true;
				}
			}
		}

		if ( change ) {
			this.fire( 'change' );
		}
	}

	// @Implements on target.
	public onRowIndexClick( rowIndex: number, shiftKey: boolean = false, ctrlKey: boolean = false ) {

		if ( rowIndex < 0 || rowIndex >= this.length ) {
			return;
		}

		var i: number,
		    len: number,
		    currentSelectedIndex: number = this.selectedIndex,
		    iFirst: boolean;

		this.selectedIndex = rowIndex;
		this.scrollIntoRow( this.selectedIndex );

		if ( !this.multiple || !( ctrlKey || shiftKey ) ) {

			// select only the option with rowIndex rowIndex
			for ( i=0, len = this.length; i<len; i++ ) {
				if ( i == rowIndex ) {
					this.selectRow( i, true );
				} else {
					this.selectRow( i, false );
				}

			}

		} else {

			switch ( true ) {

				case ctrlKey && !shiftKey:
					this.selectRow( rowIndex, !this.isRowSelected( rowIndex ) );

					break;

				case !ctrlKey && shiftKey:

					if ( currentSelectedIndex == -1 ) {
						currentSelectedIndex = 0;
					}

					for ( i = Math.min( currentSelectedIndex, rowIndex ), len = Math.max( currentSelectedIndex, rowIndex ); i<=len; i++ ) {
						this.selectRow( i, true );
					}

					break;

				case ctrlKey && shiftKey:

					if ( currentSelectedIndex == -1 ) {
						currentSelectedIndex = 0;
					}

					iFirst = true;

					for ( i = Math.min( currentSelectedIndex, rowIndex ), len = Math.max( currentSelectedIndex, rowIndex ); i<=len; i++ ) {
						if ( i != currentSelectedIndex || len == 0 ) {
							this.selectRow( i, !this.isRowSelected( i ) );
						}
					}

					break;
			}

		}

		this.fire( 'change' );

	}

	get selectedIndex(): number {
		return this._selectedIndex;
	}

	set selectedIndex( index: number ) {
		index = ~~index;
		if ( index < -1 ) {
			index = -1;
		}
		if ( index >= this.length ) {
			index = this.length - 1;
		}
		if ( index != this._selectedIndex ) {
			this._selectedIndex = index;
		}
	}



}