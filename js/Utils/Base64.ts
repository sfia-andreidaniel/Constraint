class Utils_Base64 {

    private static PADCHAR: string = '=';
    private static ALPHA: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    private static makeDOMException = function(): Error {
        // sadly in FF,Safari,Chrome you can't make a DOMException
        var e, tmp;

        try {
            return new window["DOMException"](window["DOMException"].INVALID_CHARACTER_ERR);
        } catch (tmp) {
            // not available, just passback a duck-typed equiv
            // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Error
            // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Error/prototype
            var ex = new Error("DOM Exception 5");

            // ex.number and ex.description is IE-specific.
            ex["code"] = ex["number"] = 5;
            ex["name"] = ex["description"] = "INVALID_CHARACTER_ERR";

            // Safari/Chrome output format
            ex.toString = function() { return 'Error: ' + ex.name + ': ' + ex.message; };
            return ex;
        }
    }

    private static getbyte64( s: string, i: number ) {
        var idx: number = Utils_Base64.ALPHA.indexOf(s.charAt(i));
        if (idx === -1) {
            throw Utils_Base64.makeDOMException();
        }
        return idx;
    }

    public static decode(s: string): string {
        // convert to string
        s = '' + s;

        var pads: number,
            i: number, 
            b10: number,
            imax: number = s.length

        if (imax === 0) {
            return s;
        }

        if (imax % 4 !== 0) {
            throw Utils_Base64.makeDOMException();
        }

        pads = 0

        if (s.charAt(imax - 1) === Utils_Base64.PADCHAR) {
            pads = 1;
            if (s.charAt(imax - 2) === Utils_Base64.PADCHAR) {
                pads = 2;
            }
            // either way, we want to ignore this last block
            imax -= 4;
        }

        var x: string[] = [];

        for (i = 0; i < imax; i += 4) {
            b10 = (Utils_Base64.getbyte64(s, i) << 18) | (Utils_Base64.getbyte64(s, i + 1) << 12) |
            (Utils_Base64.getbyte64(s, i + 2) << 6) | Utils_Base64.getbyte64(s, i + 3);
            x.push(String.fromCharCode(b10 >> 16, (b10 >> 8) & 0xff, b10 & 0xff));
        }

        switch (pads) {
            case 1:
                b10 = (Utils_Base64.getbyte64(s, i) << 18) | (Utils_Base64.getbyte64(s, i + 1) << 12) | (Utils_Base64.getbyte64(s, i + 2) << 6);
                x.push(String.fromCharCode(b10 >> 16, (b10 >> 8) & 0xff));
                break;
            case 2:
                b10 = (Utils_Base64.getbyte64(s, i) << 18) | (Utils_Base64.getbyte64(s, i + 1) << 12);
                x.push(String.fromCharCode(b10 >> 16));
                break;
        }
        return x.join('');
    }

    private static getbyte(s: string, i: number): number {
        var x = s.charCodeAt(i);
        
        if (x > 255) {
            throw Utils_Base64.makeDOMException();
        }
        
        return x;
    }

    public static encode(s: string): string {
        
        if (arguments.length !== 1) {
            throw new SyntaxError("Not enough arguments");
        }
        
        var padchar = Utils_Base64.PADCHAR;
        var alpha = Utils_Base64.ALPHA;

        var i: number, 
            b10: number;
        
        var x: string[] = [];

        // convert to string
        s = '' + s;

        var imax: number = s.length - s.length % 3;

        if (s.length === 0) {
            return s;
        }

        for (i = 0; i < imax; i += 3) {
            b10 = (Utils_Base64.getbyte(s, i) << 16) | (Utils_Base64.getbyte(s, i + 1) << 8) | Utils_Base64.getbyte(s, i + 2);
            x.push(alpha.charAt(b10 >> 18));
            x.push(alpha.charAt((b10 >> 12) & 0x3F));
            x.push(alpha.charAt((b10 >> 6) & 0x3f));
            x.push(alpha.charAt(b10 & 0x3f));
        }
        switch (s.length - imax) {
            case 1:
                b10 = Utils_Base64.getbyte(s, i) << 16;
                x.push(alpha.charAt(b10 >> 18) + alpha.charAt((b10 >> 12) & 0x3F) +
                    padchar + padchar);
                break;
            case 2:
                b10 = (Utils_Base64.getbyte(s, i) << 16) | (Utils_Base64.getbyte(s, i + 1) << 8);
                x.push(alpha.charAt(b10 >> 18) + alpha.charAt((b10 >> 12) & 0x3F) +
                    alpha.charAt((b10 >> 6) & 0x3f) + padchar);
                break;
        }
        return x.join('');
    }

}

(function() {

    // browser normalization for atob and btoa
    if ( typeof window.atob == 'undefined' ) {
        window.atob = function( s: string ): string {
            return Utils_Base64.decode(s);
        }
    }

    if ( typeof window.btoa == 'undefined' ) {
        window.btoa = function( s: string ): string {
            return Utils_Base64.encode(s);
        }
    }

})();