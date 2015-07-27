class UI_Tree_Grid extends UI_Tree {

	protected _allowColums: boolean = true;

}

Constraint.registerClass( {
	"name": "UI_Tree_Grid",
	"extends": "UI",
	"acceptsOnly": [
		"UI_Column"
	],
	"properties": [
	]
} );