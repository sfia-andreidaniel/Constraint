class UI_PropertyGrid extends UI_Canvas implements IFocusable {
	
	public    active: boolean; // the active is overrided by the MFocusable mixin
	public    wantTabs: boolean = false;
	public    tabIndex: number = 0;
	public    includeInFocus: boolean = true;
	public    accelerators: string;

	private   _values     : any = {};
	private   _properties : UI_PropertyGrid_Row[] = [];

	constructor( owner: UI ) {
	    super( owner, [ 'IFocusable' ] );
	    Utils.dom.addClass( this._root, 'UI_PropertyGrid' );
	    this._values = {};
	}

	get values(): any {
		return this._values;
	}

	get properties(): IPropertyGroupNested[] {
		return this["_properties" + ""];
	}

	set properties( properties: IPropertyGroupNested[] ) {
		
		var newValues: any = {},
		    newProperties: UI_PropertyGrid_Row[] = [],
		    grid = this;

		properties = properties || [];

		function walkGroup( group: IPropertyGroupNested[], valuesRoot: any ) {

			var i: number = 0,
			    len: number,
			    seenProperties: string[] = [],
			    isGroup: boolean,
			    isInput: boolean;

			if ( !group ) {
				return;
			}

			for ( i=0, len = ~~group.length; i<len; i++ ) {

				if ( seenProperties.indexOf( group[i].name ) > -1 ) {
					throw new Error( 'Cannot declare two properties with the same name in a group' );
				}

				isGroup = typeof group[i].children != 'undefined';
				isInput = typeof group[i].input != 'undefined';

				if ( isGroup && isInput ) {
					throw new Error( 'Cannot declare both a group and an input in the same type' );
				}

				if ( !isGroup && !isInput ) {
					throw new Error( 'A property must be either a group, either an input' );
				}

				if ( isInput ) {

					( function( propertyName: string, propertyConfig: IPropertyGroupNested ) {

						var input = new UI_PropertyGrid_Row_Input( propertyConfig, grid );

						Object.defineProperty( valuesRoot, propertyName, {
							"get": function() {
								return input.value;
							},
							"set": function( data: any ) {
								input.value = data;
							}
						} );

						newProperties.push( input );

					} )( group[i].name, group[i] )

				} else {

					( function( propertyName: string, propertyConfig: IPropertyGroupNested ) {

						var root: any = {};

						Object.defineProperty( valuesRoot, propertyName, {
							get: function() {
								return root;
							}
						} );

						var group = new UI_PropertyGrid_Row_Group( propertyConfig, grid );

						newProperties.push( group );

						walkGroup( propertyConfig.children, root );

					} )( group[i].name, group[i] )

				}

			}
		}

		walkGroup( properties, newValues );

		this._properties = newProperties;
		this._values = newValues;

	}

}

Mixin.extend( 'UI_PropertyGrid', 'MFocusable' );

Constraint.registerClass({
	"name": "UI_PropertyGrid",
	"extends": "UI_Canvas",
	"properties": [
		{
			"name": "values",
			"type": "any"
		},
		{
			"name": "properties",
			"type": "IPropertyGroupNested[]"
		}
	]
});