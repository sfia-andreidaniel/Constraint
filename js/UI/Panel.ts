class UI_Panel extends UI {

	protected _dom: any; 

	protected _logicalWidth: number;
	protected _logicalHeight: number;

	constructor( owner: UI ) {
		super( owner, null, Utils.dom.create('div', 'ui UI_Panel') );
		this.getDOM();
	}


	get logicalWidth(): number {
		return this._logicalWidth === null || typeof this._logicalWidth == 'undefined'
			? null
			: ~~this._logicalWidth;
	}

	get logicalHeight(): number {
		return this._logicalHeight === null || typeof this._logicalHeight == 'undefined'
			? null
			: ~~this._logicalHeight;
	}

	set logicalWidth( width: number ) {
		width = width === null
			? null
			: ~~width;

		if ( typeof this._logicalWidth == 'undefined' || this._logicalWidth !== width ) {
			this._logicalWidth = width;
			if ( width === null ) {
				this.getDOM().body.style.width = '';
			} else {
				this.getDOM().body.style.width = width + "px";
			}
			this.onRepaint();
		}
	}

	set logicalHeight( height: number ) {
		height = height === null
			? null
			: ~~height;

		if ( typeof this._logicalHeight == 'undefined' || this._logicalHeight !== height ) {
			this._logicalHeight = height;
			if ( height === null ) {
				this.getDOM().body.style.height = '';
			} else {
				this.getDOM().body.style.height = height + "px";
			}
			this.onRepaint();
		}
	}

	// retrieves this UI element interior width and height
	// @override: UI.clientRect
	get clientRect(): IRect {
		var outer: IRect = this.offsetRect,
		    result: IRect = {
				"width": outer.width - this._padding.left - this._padding.right,
				"height": outer.height - this._padding.top - this._padding.bottom
			},
			logicalWidth: number = this.logicalWidth,
			logicalHeight: number = this.logicalHeight;

		if ( logicalWidth !== null && logicalWidth > result.width )
			result.width = logicalWidth;

		if ( logicalHeight !== null && logicalHeight > result.height )
			result.height = logicalHeight;

		return result;
	}



	// UI extendors
	private getDOM(): any {
		if ( !this._dom ) {
			this._dom = {
				"inner": Utils.dom.create('div', 'inner'),
				"body": Utils.dom.create('div', 'body')
			};
			
			this._root.appendChild( this._dom.inner );
			this._dom.inner.appendChild( this._dom.body );
		}

		return this._dom;
	}

	/* @UI.insertDOMNode */
	protected insertDOMNode( node: UI ): UI {
		if ( node._root ) {
			this.getDOM().body.appendChild( node._root );
		}
		return node;
	}


}

Constraint.registerClass( {
	"name": "UI_Panel",
	"extends": "UI",
	"properties": [
		{
			"name": "logicalWidth",
			"type": "number"
		},
		{
			"name": "logicalHeight",
			"type": "number"
		}
	]
});