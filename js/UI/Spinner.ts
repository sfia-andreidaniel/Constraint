/**
 * The UI_Spinner control is the cross-browser implementation of a
 * <input type="number" /> of HTML5. For consistency use this implementation.
 */
class UI_Spinner extends UI implements IFocusable {

	constructor( owner: UI ) {
		super(owner, ['IFocusable'], Utils.dom.create('div', 'ui UI_Spinner'));
	}
	
}

Mixin.extend('UI_Spinner', 'MFocusable');

Constraint.registerClass( {
	"name": "UI_Spinner",
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
			"name": "value",
			"type": "number"
		},
		{
			"name": "readOnly",
			"type": "boolean"
		},
		{
			"name": "min",
			"type": "number"
		},
		{
			"name": "max",
			"type": "number"
		},
		{
			"name": "step",
			"type": "number"
		}
	]
} );
