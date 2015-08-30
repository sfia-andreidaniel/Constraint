class Utils_Event_Mouse extends Utils_Event_Generic {
	
	private _layer: IPoint;
	private _offset: IPoint;
	private _page: IPoint;
	private _delta: IPoint;

	constructor( e: MouseEvent, unbinder: Utils_Event_Unbinder = null ) {
		super(e, unbinder);
	}

	/**
	 * Returns the mouse button ( 0=none )
	 */
	get which(): number {
		return ~~this.event.which;
	}

	/**
	 * Returns the translated mouse coordinates relative to the originally binded element
	 */
	get layer(): IPoint {
		switch (true) {
			case !!this._layer:
				return this._layer;
				break;
			case typeof this.event.layerX != 'undefined':
				return this._layer = { x: this.event.layerX, y: this.event.layerY };
				break;
			default:
				throw new Error('Cannot determine this property (layer).');
				break;
		}
	}

	/**
	 * Returns the translated mouse coordinates relative to the target ( can be
	 * a child of the binded element ) position.
	 */
	get offset(): IPoint {
		switch ( true ) {
			case !!this._offset:
				return this._offset;
				break;
			case typeof this.event.offsetX != 'undefined':
				return this._offset = { x: this.event.offsetX, y: this.event.offsetY };
				break;
			case !!this.event.target && !!this.event.target.getBoundingClientRect:
				var rect = this.event.target.getBoundingClientRect();
				return this._offset = {
					x: this.event.pageX - rect.x,
					y: this.event.pageY - rect.y
				};
				break;
			default:
				throw new Error('Cannot determine this property (offset).');
				break;
		}
	}

	/**
	 * Returns the mouse coordinates relative to the current document page
	 */
	get page(): IPoint {
		switch ( true ) {
			case !!this._page:
				return this._page;
				break;
			case typeof this.event.pageX != 'undefined':
				return this._page = {
					x: this.event.pageX,
					y: this.event.pageY
				};
				break;
			default:
				throw new Error('Cannot determine this property (page).');
				break;
		}
	}

	/**
	 * Returns the normalized values of the "wheel" event.
	 */
	get delta(): IPoint {
		switch ( true ) {

			case !!this._delta:
				return this._delta;
				break;

			case typeof this.event.deltaX != 'undefined':
				this._delta = {
					x: this.event.deltaX / ( Math.abs( this.event.deltaX ) > 10 ? 20 : 1 ),
					y: this.event.deltaY / ( Math.abs( this.event.deltaY ) > 10 ? 20 : 1 )
				};

				if ( this._delta.x < -3 ) {this._delta.x = -3; }
				if ( this._delta.y < -3 ) {this._delta.y = -3; }
				if ( this._delta.x > 3 ) {this._delta.x = 3; }
				if ( this._delta.y > 3 ) {this._delta.y = 3; }

				return this._delta;

				break;
			case typeof this.event.wheelDelta != 'undefined':
				var delta: number = -this.event.wheelDelta / (Math.abs(this.event.wheelDelta) > 10 ? 20 : 1);

				if ( delta < -3 ) {delta = -3; }
				if ( delta > 3 ) {delta = 3; }

				this._delta = {
					x: this.event.shiftKey ? delta : 0,
					y: !this.event.shiftKey ? delta : 0
				};

				return this._delta;

				break;
			default:
				throw new Error('Cannot determine this property (delta).')
				break;
		}
	}

}