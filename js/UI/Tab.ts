class UI_Tab extends UI {
	
	protected _dom: any;
	protected _caption: string = 'Tab';

	constructor( owner: UI ) {
		super( owner, null, Utils.dom.create('div', 'ui UI_Tab') );
		this.tabElement;
		this._setupEvents_();
	}

	get caption(): string {
		return this._caption;
	}

	set caption( caption: string ) {
		var _dom: any = this.createDOM();

		caption = String( caption || '' );
		if ( caption != this._caption ) {
			this._caption = caption;
			_dom.caption.innerHTML = '';
			_dom.caption.appendChild( document.createTextNode( this._caption ) );
		}
	}

	get tabElement(): HTMLDivElement {
		
		return this.createDOM().tab;
		
	}

	private createDOM(): any {
		if ( !this._dom ) {

			this._dom = {
				tab: Utils.dom.create( 'div', 'ui UI_Tab' ),
				caption: Utils.dom.create( 'div', 'caption' )
			};

			this._dom.tab.appendChild( this._dom.caption );

		}

		return this._dom;

	}

	public remove(): UI {
		var result: UI = super.remove();

		if ( this.owner ) {
			this.owner.fire( 'tab-removed', this.createDOM().tab );
		}

		this.layoutDirty = true;

		return result;
	}

	/* @UI.insertDOMNode */
	protected insertDOMNode( node: UI ): UI {
		if ( node._root ) {
			this._root.appendChild( node._root );
		}
		return node;
	}

	public _setupEvents_() {
		( function( me ) {

			me.onDOMEvent( me.tabElement, EEventType.MOUSE_DOWN, function( e: Utils_Event_Mouse ) {
				if ( !me.disabled && me.owner ) {
					(<UI_TabsPanel>me.owner).activeTab = me;
				}
			}, true );

			me.on( 'disabled', function( state ) {
				
				if ( state ) {
					Utils.dom.addClass( this.tabElement, 'disabled' );
				} else {
					Utils.dom.removeClass( this.tabElement, 'disabled' );
				}

			} );

		} )( this );
	}

}

Constraint.registerClass( {
	"name": "UI_Tab",
	"extends": "UI",
	"properties": [
		{
			"name": "caption",
			"type": "string"
		}
	]
} );
