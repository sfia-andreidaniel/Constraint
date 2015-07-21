class UI_TabsPanel extends UI implements IFocusable {

	public static _theme: any = {
		tabsBarSize: $I.number('UI.UI_TabsPanel/tabsBar.size'),
		defaultWidth: $I.number('UI.UI_TabsPanel/width'),
		defaultHeight: $I.number('UI.UI_TabsPanel/height')
	};

	protected _dom: any = {
		inner: UI_Dom.create( 'div', 'inner' ),
		tabsBar: UI_Dom.create( 'div', 'tabs' ),
		body: UI_Dom.create( 'div','body' )
	};

	protected _activeTab: UI_Tab = null;

	// IFocusable
	public    active: boolean; // the active is overrided by the MFocusable mixin
	public    wantTabs: boolean = false;
	public    tabIndex: number = 0;


	constructor( owner: UI ) {
		super( owner, [ 'IFocusable' ], UI_Dom.create('div', 'ui UI_TabsPanel') );

		this._root.appendChild( this._dom.inner );
		this._dom.inner.appendChild( this._dom.tabsBar );
		this._dom.inner.appendChild( this._dom.body );

		this.width = UI_TabsPanel._theme.defaultWidth;
		this.height= UI_TabsPanel._theme.defaultHeight;
		this.padding.top = UI_TabsPanel._theme.tabsBarSize;
	
	}

	public insert( child: UI ): UI {
		if ( !child || !( child instanceof UI_Tab ) ) {
			throw new Error('Illegal child type');
		} else {
			this._dom.tabsBar.appendChild( (<UI_Tab>child).tabElement );

			child.top    = 0;
			child.left   = 0;
			child.right  = 0;
			child.bottom = 0;

			return super.insert( child );
		}
	}

	get activeTab(): UI_Tab {
		return this._activeTab
			? <UI_Tab>this._activeTab
			: null;
	}

	private _initDom_() {
		( function( me ) {

			me.on( 'tab-removed', function( node ) {
				if ( node ) {
					node.parentNode.removeChild( node );
				}
			} );

		} )( this );
	}

	/* @UI.insertDOMNode */
	protected insertDOMNode( node: UI ): UI {
		if ( node._root ) {
			this._dom.body.appendChild( node._root );
		}
		return node;
	}


}

Mixin.extend( 'UI_TabsPanel', 'MFocusable' );