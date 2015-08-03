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

			function onMouseMove( evt ) {

				var nowX: number = evt.pageX || evt.clientX,
				    nowY: number = evt.pageY || evt.clientY,
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
			}

			function onMouseUp( evt ) {
				document.body.removeEventListener( 'mousemove', onMouseMove, true );
				document.body.removeEventListener( 'mouseup',   onMouseUp, true );

				Utils.dom.removeClass( node._root, 'dragging' );
			}

			node._root.addEventListener( 'mousedown', function( e ) {

				if ( node.disabled ) {
					return;
				}

				resize.x = e.pageX || e.clientX;
				resize.y = e.pageY || e.clientY;

				document.body.addEventListener( 'mousemove', onMouseMove, true );
				document.body.addEventListener( 'mouseup',   onMouseUp, true );

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