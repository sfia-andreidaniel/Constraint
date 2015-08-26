class UI_PropertyGrid_Row_Input extends UI_PropertyGrid_Row implements IInput {
	
	public value: any;

	constructor( config: IPropertyGroupNested, grid: UI_PropertyGrid ) {
		super( config, grid );
	}
}