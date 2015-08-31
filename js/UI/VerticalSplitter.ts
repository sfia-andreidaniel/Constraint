class UI_VerticalSplitter extends UI {
	
	public static _theme: any = {
		defaultSize: $I.number('UI.UI_Splitter/size')
	};

	protected _anchorType: EAlignment;
	protected _minDistance: number = 0;

	constructor( owner: UI ) {
		super( owner, null, Utils.dom.create( 'div' ) );
		this._root.className = this._rootClassName;
		this._root.appendChild( Utils.dom.create('div', 'ui icon' ) );
		this._setupEvents_();
	}

	get _rootClassName(): string {
		return 'ui UI_VerticalSplitter';
	}

	get anchor(): UI_Anchor {
		switch ( this._anchorType ) {
			case EAlignment.LEFT:
				return this._left;
				break;
			case EAlignment.TOP:
				return this._top;
				break;
			case EAlignment.RIGHT:
				return this._right;
				break;
			case EAlignment.BOTTOM:
				return this._bottom;
				break;
			default:
				return null;
		}
	}

	get anchorType(): EAlignment {
		return this._anchorType;
	}

	set anchorType( type: EAlignment ) {
		
		if ( type == this._anchorType ) {
			return;
		}

		switch ( type ) {
			case EAlignment.LEFT:
				this._anchorType = type;
				this._right.invalidate();
				break;
			case EAlignment.RIGHT:
				this._anchorType = type;
				this._left.invalidate();
				break;
			default:
				throw new Error( 'Anchor type not supported on UI_VerticalSplitter' );
				break;
		}
	}

	get minDistance(): number {
		return this._minDistance;
	}

	set minDistance( distance: number ) {
		distance = ~~distance;
		if ( distance != this._minDistance ) {
			this._minDistance = distance;
			if ( this.anchor.distance < this._minDistance ) {
				this.anchor.distance = this._minDistance;
			}
		}
	}

	get distance(): number {
		return this.anchor.distance;
	}

	set distance( distance: number ) {
		this.anchor.distance = ~~distance;
	}

	protected setupMouseEvents() {
		( function( node ) {

			var resize: IPoint = {
				x: 0,
				y: 0
			};

			node.onDOMEvent( node._root, EEventType.MOUSE_DOWN, function( e: Utils_Event_Mouse ) {

				if ( node.disabled ) {
					return;
				}

				resize.x = e.page.x;
				resize.y = e.page.y;
				
				var mousemove: Utils_Event_Unbinder = node.onDOMEvent( document.body, EEventType.MOUSE_MOVE, function( evt: Utils_Event_Mouse ) {

					var nowX: number = evt.page.x,
					    nowY: number = evt.page.y,
					    deltaX: number = resize.x - nowX,
					    deltaY: number = resize.y - nowY,
					    amount: number = 0,
					    distance: number = node.anchor.distance;

					switch ( node._anchorType ) {
						case EAlignment.LEFT:
							amount = -deltaX;
							break;
						case EAlignment.RIGHT:
							amount = deltaX;
							break;
						case EAlignment.TOP:
							amount = -deltaY;
							break;
						case EAlignment.BOTTOM:
							amount = deltaY;
							break;
					}

					if ( amount ) {
						distance += amount;
						if ( distance < node.minDistance ) {
							distance = node.minDistance;
						}
						resize.x = nowX;
						resize.y = nowY;
						node.anchor.distance = distance;
						
						if ( node.owner )
							node.owner.onRepaint();
					}

				}, true );

				node.onDOMEvent( document.body, EEventType.MOUSE_UP, function( evt: Utils_Event_Mouse ) {
					mousemove.remove();
					mousemove = undefined;
					Utils.dom.removeClass( node._root, 'dragging' );
				}, true, true );

				Utils.dom.addClass( node._root, 'dragging' );

			}, true );

		} )( this );
	}

	protected _setupEvents_() {

		this.paintable = false;

		this.anchorType = EAlignment.LEFT;

		this.top = 0;
		this.bottom = 0;
		this.left = 0;

		this.width = UI_VerticalSplitter._theme.defaultSize;

		this.setupMouseEvents();

		this.paintable = true;

	}
}

Constraint.registerClass( {
	"name": "UI_VerticalSplitter",
	"extends": "UI",
	"properties": [
		{
			"name": "anchorType",
			"type": "enum:EAlignment"
		},
		{
			"name": "minDistance",
			"type": "number"
		},
		{
			"name": "distance",
			"type": "number"
		}
	]
} );