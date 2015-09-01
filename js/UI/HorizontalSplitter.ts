/**
 * An UI_HorizontalSplitter is a control which enables the user to resize a layout section
 * via a mouse drag operation. It's role is to let the users to customize on their own
 * the appearence of their layout, depending on their needs.
 *
 * An UI_HorizontalSplitter sample ( in it's hovered state ):
 *
 * ![splitter](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_HorizontalSplitter.png "UI_HorizontalSplitter")
 *
 */

class UI_HorizontalSplitter extends UI_VerticalSplitter {
	
	public static _theme: any = {
		defaultSize: $I.number('UI.UI_Splitter/size')
	};

	constructor( owner: UI ) {
		super( owner );
	}

	get _rootClassName(): string {
		return 'ui UI_HorizontalSplitter';
	}

	get anchorType(): EAlignment {
		return this._anchorType;
	}

	set anchorType( type: EAlignment ) {
		
		if ( type == this._anchorType ) {
			return;
		}

		switch ( type ) {
			case EAlignment.TOP:
				this._anchorType = type;
				this._bottom.invalidate();
				break;
			case EAlignment.BOTTOM:
				this._anchorType = type;
				this._top.invalidate();
				break;
			default:
				throw new Error( 'Anchor type not supported on UI_HorizontalSplitter' );
				break;
		}
	}

	protected _setupEvents_() {

		this.paintable = false;

		this.anchorType = EAlignment.TOP;

		this.left = 0;
		this.right = 0;
		this.top = 0;

		this.height = UI_HorizontalSplitter._theme.defaultSize;

		this.setupMouseEvents();

		this.paintable = true;

	}
}

Constraint.registerClass( {
	"name": "UI_HorizontalSplitter",
	"extends": "UI_VerticalSplitter",
	"properties": []
} );