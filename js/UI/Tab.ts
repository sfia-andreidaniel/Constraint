class UI_Tab extends UI {
	
	protected _dom: any;

	protected _caption: string = 'Tab';

	constructor( owner: UI ) {
		super( owner, null, UI_Dom.create('div', 'ui UI_Tab') );
		this.tabElement;
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
				tab: UI_Dom.create( 'div', 'ui UI_Tab' ),
				caption: UI_Dom.create( 'div', 'caption' ),
				body: UI_Dom.create( 'div', 'body' )
			};

			this._dom.tab.appendChild( this._dom.caption );
			this._root.appendChild( this._dom.body );

		}

		return this._dom;

	}

	public remove(): UI {
		var result: UI = super.remove();

		if ( this.owner ) {
			this.owner.fire( 'tab-removed', this.createDOM().tab );
		}

		return result;
	}

	/* @UI.insertDOMNode */
	protected insertDOMNode( node: UI ): UI {
		if ( node._root ) {
			this.createDOM().body.appendChild( node._root );
		}
		return node;
	}

}