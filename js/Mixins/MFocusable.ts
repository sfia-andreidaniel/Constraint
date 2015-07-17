class MFocusable extends UI implements IFocusable {

	public static isMixin: boolean = true;

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