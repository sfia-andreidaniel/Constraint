class UI_TabsPanel extends UI implements IFocusable {

	public static _theme: any = {
		tabsBarSize: $I.number('UI.UI_TabsPanel/tabsBar.size'),
		defaultWidth: $I.number('UI.UI_TabsPanel/width'),
		defaultHeight: $I.number('UI.UI_TabsPanel/height')
	};

	protected _dom: any = {
		inner: Utils.dom.create( 'div', 'inner' ),
		tabsBar: Utils.dom.create( 'div', 'tabs' ),
		body: Utils.dom.create( 'div','body' )
	};

	protected _activeTab: UI_Tab = null;

	// IFocusable
	public    active: boolean; // the active is overrided by the MFocusable mixin
	public    wantTabs: boolean = false;
	public    tabIndex: number = 0;
	public    includeInFocus: boolean = true;


	constructor( owner: UI ) {
		super( owner, [ 'IFocusable' ], Utils.dom.create('div', 'ui UI_TabsPanel') );

		this._root.appendChild( this._dom.inner );
		this._dom.inner.appendChild( this._dom.tabsBar );
		this._dom.inner.appendChild( this._dom.body );

		this.width = UI_TabsPanel._theme.defaultWidth;
		this.height= UI_TabsPanel._theme.defaultHeight;
		this.padding.top = UI_TabsPanel._theme.tabsBarSize;
		this.padding.left= 1;
		this.padding.right= 1;

		this._initDom_();
	
	}

	public insert( child: UI ): UI {
		var result: UI;

		if ( !child || !( child instanceof UI_Tab ) ) {
			throw new Error('Illegal child type');
		} else {
			child.top    = 0;
			child.left   = 0;
			child.right  = 0;
			child.bottom = 0;

			result = super.insert( child );
			this._dom.tabsBar.appendChild( (<UI_Tab>child).tabElement );


			if ( this._activeTab === null ) {
				this.activeTab = <UI_Tab>child;
			} else {
				(<UI_Tab>child).visible = false;
			}

			this.layoutDirty = true;

			return result;
		}
	}

	get activeTab(): UI_Tab {
		return this._activeTab
			? <UI_Tab>this._activeTab
			: null;
	}

	set activeTab( tab: UI_Tab ) {
		if ( tab != this._activeTab ) {

			if ( this._activeTab ) {
				Utils.dom.removeClass( this._activeTab.tabElement, 'active' );
				this._activeTab.visible = false;
			}

			this._activeTab = tab;
			this._activeTab['layoutDirty'] = true;

			if ( this._activeTab ) {
				Utils.dom.addClass( this._activeTab.tabElement, 'active' );
				this._activeTab.visible = true;
			}
		}
	}

	private _initDom_() {
		( function( me ) {

			me.on( 'tab-removed', function( node ) {
				if ( node && node.parentNode ) {
					node.parentNode.removeChild( node );
				}
			} );

			me.on( 'keydown', function( e: Utils_Event_Keyboard ) {

				var code: number = e.code;

				switch ( code ) {
					// LEFT
					case Utils.keyboard.KB_LEFT:
						me.focusTab( -1 );
						break;
					// RIGHT
					case Utils.keyboard.KB_RIGHT:
						me.focusTab( 1 );
						break;
				}

			} );

		} )( this );
	}

	public focusTab( relative: number ) {
		
		if ( this._children.length == 0 || !relative ) {
			return;
		}

		var stopper: UI_Tab,
		    cursor: UI_Tab,
		    index: number = -1,
		    i: number,
		    len: number = this._children.length;

		if ( this.activeTab === null ) {
			if ( relative > 0 ) {
				stopper = <UI_Tab>this._children[0];
			} else {
				stopper = <UI_Tab>this._children[ len - 1 ];
			}
		} else {
			stopper = this.activeTab;
		}

		for ( i=0, len = len; i<len; i++ ) {
			if ( this._children[i] == stopper ) {
				index = i;
				break;
			}
		}

		if ( index == -1 ) {
			return;
		}

		cursor = stopper;

		while ( relative != 0 ) {

			if ( relative > 0 ) {
				index++;
				if ( index >= len ) {
					index = 0;
				}
			} else {
				index--;
				if ( index < 0 ) {
					index = len - 1;
				}
			}

			cursor = <UI_Tab>this._children[ index ];

			if ( cursor == stopper ) {
				return; // infinite loop.
			}

			if ( !cursor.disabled ) {

				if ( relative > 0 ) {
					relative--;
				} else {
					relative++;
				}

			}

		}

		this.activeTab = cursor;

	}

	/* @UI.insertDOMNode */
	protected insertDOMNode( node: UI ): UI {
		if ( node._root ) {
			this._dom.body.appendChild( node._root );
		}
		return node;
	}

	get layoutType(): ELayoutType {
		return ELayoutType.NONE;
	}

	set layoutType( type: ELayoutType ) {
		// nothing
	}


}

Mixin.extend( 'UI_TabsPanel', 'MFocusable' );

Constraint.registerClass( {
	"name": "UI_TabsPanel",
	"extends": "UI",
	"properties": [
		{
			"name": "active",
			"type": "boolean"
		},
		{
			"name": "tabIndex",
			"type": "number"
		},
		{
			"name": "active",
			"type": "boolean"
		},
		{
			"name": "activeTab",
			"type": "UI_Tab"
		}
	]
} );
