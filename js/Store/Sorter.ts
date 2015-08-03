class Store_Sorter {

	public static comparers = {
		"number": function( a, b ) {
			if ( a == b ) {
				return 0;
			} else {
				if ( isNaN( a ) || typeof a != 'number' ) {
					return -1;
				} else
				if ( isNaN( b ) || typeof b != 'number' ) {
					return 1;
				} else {
					return a - b;
				}
			}
		},
		"boolean": function( a, b ) {
			if ( a == b ) {
				return 0;
			} else {
				if ( typeof a == 'undefined' ) {
					return -1;
				} else
				if ( typeof b == 'undefined' ) {
					return 1;
				} else {
					return ~~!!a - ~~!!b;
				}
			}
		},
		"string": function( a, b ) {
			var as = String( a || '' ),
			    bs = String( b || '' );
			return as == bs
				? 0
				: as < bs ? -1 : 1;
		},
		"istring": function( a, b ) {
			var as = String( a || '' ).toLowerCase(),
			    bs = String( b || '' ).toLowerCase();
			return as == bs
				? 0
				: as < bs ? -1 : 1;
		},
		"date": function( a, b ) {
			var ad = a && a.getTime ? a.getTime() : 0,
			    bd = b && b.getTime ? b.getTime() : 0;
			return ad - bd;
		}
	};

	private _sort: ISortOption[] = [];

	constructor( sort: ISortOption[] ) {
		
		var opt: ISortOption;

		for ( var i=0, sort = sort || [], len = sort.length; i<len; i++ ) {
			
			opt = {
				"name": sort[i].name,
				"type": sort[i].type,
				"asc":  sort[i].asc,
				"callback": Store_Sorter.comparers[ sort[i].type ] || null
			};

			if ( !opt.callback ){
				throw new Error('Unknown sort data type: "' + opt.type + "'" )
			}

			this._sort.push( opt );
		}

	}

	get sorter(): ( a: any, b: any ) => number {

		return (function( me ) {

			var i   : number,
			    len : number = me._sort.length,
			    expr: number,
			    ka  : any,
			    kb  : any;

			return function( a: any, b: any ) {
				for ( i=0; i<len; i++ ) {
					ka = a ? a[ me._sort[i].name ] : null;
					kb = b ? b[ me._sort[i].name ] : null;
					expr = me._sort[i].callback( ka, kb );
					if ( expr != 0 ) {
						return me._sort[i].asc ? expr : -expr;
					}
				}
				return 0;
			}

		} )( this );

	}

	public static create( sort: ISortOption[] ): ( a: any, b: any ) => number {
		var sorter = new Store_Sorter( sort );
		return sorter.sorter;
	}
}