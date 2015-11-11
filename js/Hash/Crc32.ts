class Hash_Crc32 {

	private static _table: number[];

	constructor() {

	}

	private static _createTable_() {
		
		if (!Hash_Crc32._table) {

			Hash_Crc32._table = [];

			var c: number,
				n: number,
				k: number;

			for (n = 0; n < 256; n++) {
				c = n;
				for (k = 0; k < 8; k++) {
					c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
				}
				Hash_Crc32._table[n] = c;
			}

		}
	}

	public static compute( s: string ): number {

		var crc: number = 0 ^ (-1),
		    i: number,
		    len: number,
		    st: string = String( s || '' );

		Hash_Crc32._createTable_();

		for (i = 0, len = st.length; i < len; i++ ) {
			crc = (crc >>> 8) ^ Hash_Crc32._table[(crc ^ st.charCodeAt(i)) & 0xFF];
		}

		return crc;

	}

}
