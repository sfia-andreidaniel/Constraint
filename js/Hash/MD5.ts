/**
 * The Hash_MD5 class is used to compute the MD5 hex string from a input string.
 *
 * This code is adapted from: https://github.com/blueimp/JavaScript-MD5
 */
class Hash_MD5 {

	/**
     * Add integers, wrapping at 2^32. This uses 16-bit operations internally
     * to work around bugs in some JS interpreters.
     */
	private static safe_add( x: number, y: number ): number {
		var lsw: number = (x & 0xFFFF) + (y & 0xFFFF),
            msw: number = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
	}

	/**
     * Bitwise rotate a 32-bit number to the left.
     */
    private static bit_rol(num: number, cnt: number): number {
		return (num << cnt) | (num >>> (32 - cnt));
	}

	/**
     * These functions implement the four basic operations the algorithm uses.
     */
    private static cmn(q, a, b, x, s, t): number {
		return Hash_MD5.safe_add(Hash_MD5.bit_rol(Hash_MD5.safe_add(Hash_MD5.safe_add(a, q), Hash_MD5.safe_add(x, t)), s), b);
	}

	private static ff(a, b, c, d, x, s, t): number {
		return Hash_MD5.cmn((b & c) | ((~b) & d), a, b, x, s, t);
	}

	private static gg(a, b, c, d, x, s, t) {
		return Hash_MD5.cmn((b & d) | (c & (~d)), a, b, x, s, t);
	}

	private static hh(a, b, c, d, x, s, t) {
		return Hash_MD5.cmn(b ^ c ^ d, a, b, x, s, t);
	}
	
	private static ii(a, b, c, d, x, s, t) {
		return Hash_MD5.cmn(c ^ (b | (~d)), a, b, x, s, t);
	}

	/*
    * Calculate the MD5 of an array of little-endian words, and a bit length.
    */
    private static binl_md5(x: number[], len: number): number[] {
	
		/* append padding */
		x[len >> 5] |= 0x80 << (len % 32);
		x[(((len + 64) >>> 9) << 4) + 14] = len;

		var i: number, olda: number, oldb: number, oldc: number, oldd: number,
			a: number = 1732584193,
			b: number = -271733879,
			c: number = -1732584194,
			d: number = 271733878,
			n: number;

		for (i = 0, n = x.length; i < n; i += 16) {
			
			olda = a;
			oldb = b;
			oldc = c;
			oldd = d;

			a = Hash_MD5.ff(a, b, c, d, x[i], 7, -680876936);
			d = Hash_MD5.ff(d, a, b, c, x[i + 1], 12, -389564586);
			c = Hash_MD5.ff(c, d, a, b, x[i + 2], 17, 606105819);
			b = Hash_MD5.ff(b, c, d, a, x[i + 3], 22, -1044525330);
			a = Hash_MD5.ff(a, b, c, d, x[i + 4], 7, -176418897);
			d = Hash_MD5.ff(d, a, b, c, x[i + 5], 12, 1200080426);
			c = Hash_MD5.ff(c, d, a, b, x[i + 6], 17, -1473231341);
			b = Hash_MD5.ff(b, c, d, a, x[i + 7], 22, -45705983);
			a = Hash_MD5.ff(a, b, c, d, x[i + 8], 7, 1770035416);
			d = Hash_MD5.ff(d, a, b, c, x[i + 9], 12, -1958414417);
			c = Hash_MD5.ff(c, d, a, b, x[i + 10], 17, -42063);
			b = Hash_MD5.ff(b, c, d, a, x[i + 11], 22, -1990404162);
			a = Hash_MD5.ff(a, b, c, d, x[i + 12], 7, 1804603682);
			d = Hash_MD5.ff(d, a, b, c, x[i + 13], 12, -40341101);
			c = Hash_MD5.ff(c, d, a, b, x[i + 14], 17, -1502002290);
			b = Hash_MD5.ff(b, c, d, a, x[i + 15], 22, 1236535329);

			a = Hash_MD5.gg(a, b, c, d, x[i + 1], 5, -165796510);
			d = Hash_MD5.gg(d, a, b, c, x[i + 6], 9, -1069501632);
			c = Hash_MD5.gg(c, d, a, b, x[i + 11], 14, 643717713);
			b = Hash_MD5.gg(b, c, d, a, x[i], 20, -373897302);
			a = Hash_MD5.gg(a, b, c, d, x[i + 5], 5, -701558691);
			d = Hash_MD5.gg(d, a, b, c, x[i + 10], 9, 38016083);
			c = Hash_MD5.gg(c, d, a, b, x[i + 15], 14, -660478335);
			b = Hash_MD5.gg(b, c, d, a, x[i + 4], 20, -405537848);
			a = Hash_MD5.gg(a, b, c, d, x[i + 9], 5, 568446438);
			d = Hash_MD5.gg(d, a, b, c, x[i + 14], 9, -1019803690);
			c = Hash_MD5.gg(c, d, a, b, x[i + 3], 14, -187363961);
			b = Hash_MD5.gg(b, c, d, a, x[i + 8], 20, 1163531501);
			a = Hash_MD5.gg(a, b, c, d, x[i + 13], 5, -1444681467);
			d = Hash_MD5.gg(d, a, b, c, x[i + 2], 9, -51403784);
			c = Hash_MD5.gg(c, d, a, b, x[i + 7], 14, 1735328473);
			b = Hash_MD5.gg(b, c, d, a, x[i + 12], 20, -1926607734);

			a = Hash_MD5.hh(a, b, c, d, x[i + 5], 4, -378558);
			d = Hash_MD5.hh(d, a, b, c, x[i + 8], 11, -2022574463);
			c = Hash_MD5.hh(c, d, a, b, x[i + 11], 16, 1839030562);
			b = Hash_MD5.hh(b, c, d, a, x[i + 14], 23, -35309556);
			a = Hash_MD5.hh(a, b, c, d, x[i + 1], 4, -1530992060);
			d = Hash_MD5.hh(d, a, b, c, x[i + 4], 11, 1272893353);
			c = Hash_MD5.hh(c, d, a, b, x[i + 7], 16, -155497632);
			b = Hash_MD5.hh(b, c, d, a, x[i + 10], 23, -1094730640);
			a = Hash_MD5.hh(a, b, c, d, x[i + 13], 4, 681279174);
			d = Hash_MD5.hh(d, a, b, c, x[i], 11, -358537222);
			c = Hash_MD5.hh(c, d, a, b, x[i + 3], 16, -722521979);
			b = Hash_MD5.hh(b, c, d, a, x[i + 6], 23, 76029189);
			a = Hash_MD5.hh(a, b, c, d, x[i + 9], 4, -640364487);
			d = Hash_MD5.hh(d, a, b, c, x[i + 12], 11, -421815835);
			c = Hash_MD5.hh(c, d, a, b, x[i + 15], 16, 530742520);
			b = Hash_MD5.hh(b, c, d, a, x[i + 2], 23, -995338651);

			a = Hash_MD5.ii(a, b, c, d, x[i], 6, -198630844);
			d = Hash_MD5.ii(d, a, b, c, x[i + 7], 10, 1126891415);
			c = Hash_MD5.ii(c, d, a, b, x[i + 14], 15, -1416354905);
			b = Hash_MD5.ii(b, c, d, a, x[i + 5], 21, -57434055);
			a = Hash_MD5.ii(a, b, c, d, x[i + 12], 6, 1700485571);
			d = Hash_MD5.ii(d, a, b, c, x[i + 3], 10, -1894986606);
			c = Hash_MD5.ii(c, d, a, b, x[i + 10], 15, -1051523);
			b = Hash_MD5.ii(b, c, d, a, x[i + 1], 21, -2054922799);
			a = Hash_MD5.ii(a, b, c, d, x[i + 8], 6, 1873313359);
			d = Hash_MD5.ii(d, a, b, c, x[i + 15], 10, -30611744);
			c = Hash_MD5.ii(c, d, a, b, x[i + 6], 15, -1560198380);
			b = Hash_MD5.ii(b, c, d, a, x[i + 13], 21, 1309151649);
			a = Hash_MD5.ii(a, b, c, d, x[i + 4], 6, -145523070);
			d = Hash_MD5.ii(d, a, b, c, x[i + 11], 10, -1120210379);
			c = Hash_MD5.ii(c, d, a, b, x[i + 2], 15, 718787259);
			b = Hash_MD5.ii(b, c, d, a, x[i + 9], 21, -343485551);

			a = Hash_MD5.safe_add(a, olda);
			b = Hash_MD5.safe_add(b, oldb);
			c = Hash_MD5.safe_add(c, oldc);
			d = Hash_MD5.safe_add(d, oldd);
		}
		return [a, b, c, d];
	}

	/**
     * Convert an array of little-endian words to a string
     */
    private static binl2rstr(input: any): string {
		var i,
			output = '',
			len: number;

		for (i = 0, len = input.length * 32; i < len; i += 8) {
			output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF);
		}

		return output;
	}

	/*
    * Convert a raw string to an array of little-endian words
    * Characters >255 have their high-byte silently ignored.
    */
    private static rstr2binl(input): number[] {
		var i: number,
			output: number[] = [],
			len: number;
		
		output[(input.length >> 2) - 1] = undefined;
		
		for (i = 0, len = output.length; i < len; i += 1) {
			output[i] = 0;
		}
		for (i = 0, len = input.length; i < len * 8; i += 8) {
			output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32);
		}
		return output;
	}

	/**
     * Calculate the MD5 of a raw string
     */
    private static rstr_md5(s: string) {
		return Hash_MD5.binl2rstr(Hash_MD5.binl_md5(Hash_MD5.rstr2binl(s), s.length * 8));
	}

	/**
     * Calculate the HMAC-MD5, of a key and some data (raw strings)
     */
    private static rstr_hmac_md5(key, data): string {
		var i,
			bkey: number[] = Hash_MD5.rstr2binl(key),
			ipad = [],
			opad = [],
			hash;
		ipad[15] = opad[15] = undefined;
		if (bkey.length > 16) {
			bkey = Hash_MD5.binl_md5(bkey, key.length * 8);
		}
		for (i = 0; i < 16; i += 1) {
			ipad[i] = bkey[i] ^ 0x36363636;
			opad[i] = bkey[i] ^ 0x5C5C5C5C;
		}
		hash = Hash_MD5.binl_md5(ipad.concat(Hash_MD5.rstr2binl(data)), 512 + data.length * 8);
		return Hash_MD5.binl2rstr(Hash_MD5.binl_md5(opad.concat(hash), 512 + 128));
	}

	/**
     * Convert a raw string to a hex string
     */
    private static rstr2hex(input: string): string {
		var hex_tab = '0123456789abcdef',
			output: string = '',
			x,
			i,
			len: number;
		for (i = 0, len = input.length; i < len; i++ ) {
			x = input.charCodeAt(i);
			output += hex_tab.charAt((x >>> 4) & 0x0F) +
				hex_tab.charAt(x & 0x0F);
		}
		return output;
	}

	/**
     * Encode a string as utf-8
     */
    private static str2rstr_utf8(input: string): string {
		return Global.env.unescape(encodeURIComponent(input));
	}

	private static raw_md5(s) {
		return Hash_MD5.rstr_md5(Hash_MD5.str2rstr_utf8(s));
	}

	public static compute( s: string ): string {
		return Hash_MD5.rstr2hex(Hash_MD5.raw_md5(s));
	}

}