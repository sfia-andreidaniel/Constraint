class UI_DropDown extends UI implements IFocusable {

	public static _theme = {
		option: {
			height: $I.number('UI.UI_DropDown/option.height')
		},
		font: {
			family: $I.string('UI.UI_DropDown/font.family'),
			size:   $I.number('UI.UI_DropDown/font.size'),
			color:  $I.string('UI.UI_DropDown/font.color.normal'),
			selectedColor: $I.string('UI.UI_DropDown/font.color.selected')
		},
		background: {
			selected: $I.string('UI.UI_DropDown/background.selected')
		},
		defaults: {
			width: $I.number('UI.UI_DropDown/defaults.width'),
			height: $I.number('UI.UI_DropDown/defaults.height')
		},
		expander: [
			$I.string('UI.UI_DropDown/expander.collapsed'),
			$I.string('UI.UI_DropDown/expander.expanded')
		]
	};

	protected _dom = {
		view: Utils.dom.create('div', 'view'),
		expander: Utils.dom.create('div','ui expander'),
		icon: Utils.dom.create('div')
	};

	protected _options: IOption[]    = [];
	protected _length: number = 0;
	protected _selectedIndex: number = -1;
	protected _expanded: boolean = false;
	protected _overlay: UI_Screen_Window = null;

	// Internal renderer options
	private   _overlaySelectedIndex : number = -1;

	public    active: boolean; // the active is overrided by the MFocusable mixin
	public    wantTabs: boolean = false;
	public    tabIndex: number = 0;
	public    includeInFocus: boolean = true;


	constructor( owner: UI ) {
		super( owner, [ 'IFocusable' ], Utils.dom.create( 'div', 'ui UI_DropDown' ) );
		
		this._root.appendChild( this._dom.view );
		this._root.appendChild( this._dom.expander );
		this._dom.expander.appendChild( this._dom.icon );

		this.width = UI_DropDown._theme.defaults.width;
		this.height= UI_DropDown._theme.defaults.height;

		this._dom.icon.className = UI_DropDown._theme.expander[0];

		this._setupEvents_();
	}

	get length(): number {
		return this._length;
	}

	get options(): IOption[] {
		return this._options;
	}

	set options( options: IOption[] ) {
		options = options || [];
		
		this._options.splice( 0, this.length );
		this._length = 0;

		var i: number = 0,
		    len: number = options.length;

		this._selectedIndex = -1;

		for ( i=0; i<len; i++ ) {
			
			this._options.push( {
				value: options[i].value || '',
				text : options[i].text || options[i].value || ''
			} );

			if ( options[i].selected || i == 0 ) {
				this._selectedIndex = i;
			}

			this._length++;

		}

		if ( this._selectedIndex != -1 ) {
			this._dom.view.textContent = String( this._options[ this._selectedIndex ].text || '' );
		}

		this.onRepaint();
	}

	get selectedIndex(): number {
		return this._selectedIndex;
	}

	set selectedIndex( index: number ) {
		if ( index < -1 || index >= this._options.length ) {
			index = -1;
		}
		if ( index != this._selectedIndex ) {
			this._selectedIndex = index;
			this._dom.view.textContent = String( this._selectedIndex < 0 ? '' : this._options[ index ].text || '' );
			this.fire( 'change' );
		}
	}

	get value(): any {
		if ( this._selectedIndex == -1 ) {
			return null;
		} else {
			return this._options[ this._selectedIndex ].value;
		}
	}

	set value( value: any ) {
		var i: number;

		if ( this._length == 0 ) {
			return;
		}

		for ( i=0; i<this._length; i++ ) {
			if ( this._options[i].value == value ) {
				this.selectedIndex = i;
				return;
			}
		}

		this.selectedIndex = -1;
	}

	protected get expanded(): boolean {
		return this._expanded;
	}

	protected set expanded( expanded: boolean ) {
		expanded = !!expanded;
		
		if ( expanded != this._expanded ) {
			this._expanded = expanded;
			this._dom.icon.className = UI_DropDown._theme.expander[ ~~this._expanded ];

			if ( this._expanded ) {
				this._open();
			} else {
				this._close();
			}

		}
	}

	protected _renderOverlay() {
		
		if ( !this._overlay ) {
			return;
		}

		var ctx      : UI_Canvas_ContextMapper = this._overlay.ctx,
		    optWidth : number,
		    optStart : number,
		    optLength: number,
		    optEnd   : number,
		    yTop     : number,
		    i        : number,
		    scrollTop: number = ctx.scrollTop,
		    logicalHeight: number = ctx.logicalHeight;

		ctx.beginPaint();

		ctx.fillStyle = 'white';
		ctx.fillRect( 0, 0, ctx.width, ctx.height );

		// paint options.
		optWidth = ctx.clientWidth;

		optStart = ~~( scrollTop / UI_DropDown._theme.option.height );
		optLength = ~~( ctx.height / UI_DropDown._theme.option.height ) + UI_DropDown._theme.option.height * ~~!!( ctx.height % UI_DropDown._theme.option.height );
		optEnd = optStart + optLength;
		optEnd = optEnd >= this._length ? this._length - 1 : optEnd;

		yTop = -(scrollTop % UI_DropDown._theme.option.height );

		ctx.font = UI_DropDown._theme.font.size + 'px ' + UI_DropDown._theme.font.family;
		ctx.textBaseline = "middle";

		for ( i = optStart; i<= optEnd; i++ ) {
			if ( i == this._overlaySelectedIndex ) {
				ctx.fillStyle = UI_DropDown._theme.background.selected;
				ctx.fillRect( 0, yTop, optWidth, UI_DropDown._theme.option.height );
			}

			ctx.fillStyle = UI_DropDown._theme.font[ i == this._overlaySelectedIndex ? 'selectedColor' : 'color' ];

			ctx.fillText( ctx.dotDotDot( this._options[ i ].text, optWidth - 4 ), 2, yTop + ~~( UI_DropDown._theme.option.height / 2 ) );

			yTop += UI_DropDown._theme.option.height;
		}

		ctx.strokeStyle = 'black';
		ctx.lineWidth = 1;
		ctx.rect( 0, 0, ctx.width, ctx.height-1 );
		ctx.stroke();


		ctx.endPaint();

	}

	protected scrollIntoIndex( index: number ) {

		if ( !this._overlay ) {
			return;
		}

		if ( index <= 0 ) {
			this._overlay.scrollTop = 0;
		} else {
			var optionLogicalY1 = ( index ) * UI_DropDown._theme.option.height,
			    optionLogicalY2 = ( index + 1 ) * UI_DropDown._theme.option.height;

			if ( optionLogicalY1 < this._overlay.scrollTop ) {
				this._overlay.scrollTop = optionLogicalY1;
			} else
			if ( optionLogicalY2 > this._overlay.scrollTop + this._overlay.clientHeight ) {
				this._overlay.scrollTop = optionLogicalY2 - this._overlay.clientHeight;
			}

		}
	}

	protected _open() {
		
		var rect: ClientRect = this._root.getBoundingClientRect(),
		    winHeight: number,
		    placement: IWindow;

		if ( this._overlay || !this._length || !rect ) {
			return;
		}

		winHeight = Math.min( this._length, 10 ) * UI_DropDown._theme.option.height;

		placement = UI_Screen.get.getBestPlacementDropDownStyle( {
			x      : rect.left,
			y      : rect.top,
			width  : rect.width,
			height : rect.height
		}, {
			"width": this.clientRect.width,
			"height": winHeight
		}, 1 );

		this._overlaySelectedIndex = this._selectedIndex;

		this._overlay = UI_Screen.get.createWindow( 
			placement.x, placement.y, 
			placement.width, placement.height, 
			null, 
			this._length * UI_DropDown._theme.option.height
		);

		this._overlay.overflowY = EClientScrollbarOverflow.AUTO;

		( function( me ) {

			me._overlay.on( 'render', function() {
				me._renderOverlay();
			} );

			me._overlay.on( 'keydown', function( evt ) {
				me.fire( 'keydown', evt );
			} );

			me._overlay.on( 'mousemove', function( x: number, y: number ) {
				
				var newSelectedIndex: number = ~~( y / UI_DropDown._theme.option.height );

				if ( newSelectedIndex >= me._length ) {
					newSelectedIndex = me._length - 1;
				}

				if ( newSelectedIndex != me._overlaySelectedIndex ) {
					me._overlaySelectedIndex = newSelectedIndex;
					UI_Screen.get.render();
				}

			} );

			me._overlay.on( 'click', function( x: number, y: number ) {

				var newSelectedIndex: number = ~~( y / UI_DropDown._theme.option.height );

				if ( newSelectedIndex >= me._length ) {
					return;
				}

				me.selectedIndex = newSelectedIndex;

				me.expanded = false;

			} );

			me._overlay.on( 'scroll', function( wheelX, wheelY ) {
				
				if ( wheelY != 0 ) {
					me._overlay.scrollTop += wheelY;
					UI_Screen.get.render();
				}

			} );

			var onScreenClick = function( evt ) {
				if ( [ me._dom.view, me._root, me._dom.expander ].indexOf( evt.target || evt.srcElement ) > -1 ) {
					return;
				}
				UI_Screen.get.off( 'mousedown', onScreenClick );
				me.expanded = false;
			}

			UI_Screen.get.on( 'mousedown', onScreenClick );

		} )( this );

		this.scrollIntoIndex( this._overlaySelectedIndex );

		UI_Screen.get.render();

	}

	protected _close() {

		if ( this._overlay ) {
			this._overlay.close();
			this._overlay = undefined;
		}

	}

	protected changeIndex( relativeIncrement: number ) {
		relativeIncrement = relativeIncrement || 0;

		if ( !relativeIncrement || !this._length ) {
			return;
		}

		var reference: number = this.expanded ? this._overlaySelectedIndex : this._selectedIndex,
			cursor: number = reference == -1
			? ( relativeIncrement > 0 ? 0 : this._length - 1 )
			: reference,
			circular: number[] = Utils.circular.createMap( 0, this._length-1, cursor, relativeIncrement < 0 ).slice(0,1),
			i: number = 0;

		if ( this.expanded ) {
			this._overlaySelectedIndex = circular[0];
			this.scrollIntoIndex( this._overlaySelectedIndex );
			UI_Screen.get.render();
		} else {
			this.selectedIndex = circular[0];
		}
	}

	protected _setupEvents_() {

		( function( me ) {

			me.on( 'keydown', function( ev ) {

				if ( me.disabled ) {
					return;
				}

				var code = ev.keyCode || ev.charCode;

				switch ( code ) {

					// SPACE
					case 32:
						this.expanded = !this.expanded;
						break;

					// UP
					case 38:
						this.changeIndex( -1 );
						break;

					// DOWN
					case 40:
						this.changeIndex( +1 );
						break;

					// ENTER
					case 13:

						if ( this.expanded ) {
							this.expanded = false;
							this.selectedIndex = this._overlaySelectedIndex;
						} else {
							this.expanded = true;
						}

						break;

					// ESC
					case 27:
						this.expanded = false;
						break;
				}

			} );

			me._root.addEventListener( 'mousedown', function( evt ) {

				if ( me.disabled || me.expanded || evt.which != 1 ) {
					return;
				}

				me.expanded = !me.expanded;

			}, false );

			me.on( 'disabled', function( on: boolean ) {
				if ( on ) {
					me.expanded = false;
				}
			} );

		} )( this );

	}

}

Mixin.extend( 'UI_DropDown', 'MFocusable' );

Constraint.registerClass( {
	"name": "UI_DropDown",
	"extends": "UI",
	"properties": [
		{
			"name": "options",
			"type": "IOption[]"
		},
		{
			"name": "selectedIndex",
			"type": "number"
		}
	]
});