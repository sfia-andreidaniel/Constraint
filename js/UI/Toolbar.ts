/**
 * Standard dialog toolbar implementation.
 */
class UI_Toolbar extends UI {

	public static _theme = {
		defaults: {
			height: $I.number('UI.UI_Toolbar/defaults.height'),
			margin: $I.number('UI.UI_Toolbar/defaults.margin')
		},
		components: $I.json('UI.UI_Toolbar/components')
	};

	protected _wantChildKeys: boolean = true;

	constructor( owner: UI ) {
		super(owner, null, Utils.dom.create('div', 'ui UI_Toolbar'));
		this.height = UI_Toolbar._theme.defaults.height;
		this.left = 0;
		this.right = 0;
		this.top = 0;
		this.layout.type = ELayoutType.LEFT_TO_RIGHT;
		this.layout.rows = 1;
		this.layout.horizontalSpacing = 3;
		this.layout.itemFixedWidth = -1;
		this.layout.marginTop = this.layout.marginBottom = UI_Toolbar._theme.defaults.margin;
		this.layout.verticalSpacing = 4;

		this._setupEvents_();
	}

	public insert( node: UI ): UI {
		var result: UI = super.insert(node);

		// Let the node to initialize all it's properties first...
		setTimeout(function() {
			
			var type: string = result.__class__,
				k: string,
				key: string,
				l: string,
				evald: boolean;

			if ( typeof UI_Toolbar._theme.components[ type ] != 'undefined' ) {
				for ( k in UI_Toolbar._theme.components[ type ] ) {
					
					if (/\?$/.test(k)) {

						key = k.substr(0, k.length - 1);

						evald = !!node[key];

						if ( evald && !!UI_Toolbar._theme.components[type][k] ) {
							
							for ( l in UI_Toolbar._theme.components[type][k] ) {
								result[l] = UI_Toolbar._theme.components[type][k][l];
							}

						}

					} else {
						result[k] = UI_Toolbar._theme.components[type][k];
					}
				}
			}

		}, 0);

		this.layout.columns = this._children.length;

		return result;
	}

	protected _setupEvents_() {

		(function(me) {

			me.on('keydown', function(e: Utils_Event_Keyboard) {

				if ( me.disabled ) {
					return;
				}

				var index: number;

				switch ( e.code ) {
					case Utils.keyboard.KB_LEFT:
						index = me._children.indexOf(me.form.activeElement);
						if ( index > 0 ) {
							me._children[index - 1]['active'] = true;
						}
						e.handled = true;
						break;
					case Utils.keyboard.KB_RIGHT:
						index = me._children.indexOf(me.form.activeElement);
						if ( index >= 0 && index < me._children.length - 1 ) {
							me._children[index + 1]['active'] = true;
						}
						e.handled = true;
						break;
				}

			});

		})(this);

	}

}

Constraint.registerClass({
	"name": "UI_Toolbar",
	"extends": "UI",
	"parentTypeOnly": [
		"UI_Form"
	],
	"properties": [
	]
});