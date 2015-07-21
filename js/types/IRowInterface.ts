interface IRowInterface {
	length: number;
	multiple: boolean;
	itemsPerPage: number;

	isRowSelected: ( rowIndex: number ) => boolean;
	selectRow: ( rowIndex: number, on: boolean ) => void;
	onRowIndexClick: ( rowIndex: number, shiftKey: boolean, ctrlKey: boolean ) => void;
	scrollIntoRow: ( rowIndex: number ) => void;
}