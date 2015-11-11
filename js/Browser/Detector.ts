/**
 * Browser Detector class, (c) 2015 sfia daniel andrei ( https://www.github.com/sfia-andreidaniel/ )
 *
 * A class that detects browser capabilities, plugins, operating systems, cpu architecture, and much more
 *
 * LICENCE: MIT / You are free to use this code @ your own risk.
 *
 * Please report all bugs, it would be usefull if this code would become a standard detection library for
 * advanced features detection.
 *
 * USAGE: Browser_Detector.getRequirementErrorCode( Browser_Detector.meetsRequirements('win7+ * * chrome 23.12+ apis=flash|mediaelement,int8array')
 */

/**
 * List with possible OS types
 */
enum E_OS_TYPE {
	
	/**
	 * Android Operating system ID
	 */
	ANDROID,

	/**
	 * IOS Operating system ID
	 */
	IOS,

	/**
	 * MAC Desktop operating system ID
	 */
	MAC,

	/**
	 * WINDOWS MOBILE operating system ID
	 */
	WINDOWS_MOBILE,

	/**
	 * WINDOWS operating system ID
	 */
	WINDOWS,

	/**
	 * LINUX operating system ID
	 */
	LINUX,

	/**
	 * UNIX operating system ID
	 */
	UNIX,

	/**
	 * OTHER operating system ID
	 */
	OTHER
}

/**
 * List with possible OS version (Windows) ID's
 */
enum E_OS_VERSION {
	/**
	 * WIN 95 version ID
	 */
	WIN_95,

	/**
	 * WINDOWS 98 version ID
	 */
	WIN_98,

	/**
	 * WINDOWS 2000 version ID
	 */
	WIN_2000,

	/**
	 * WINDOWS NT 4.0 version ID
	 */
	WIN_NT,

	/**
	 * WINDOWS MILENIUM version ID
	 */
	WIN_ME,

	/**
	 * WINDOWS XP version ID
	 */
	WIN_XP,

	/**
	 * WINDOWS SERVER 2003 version ID
	 */
	WIN_SERVER_2003,

	/**
	 * WINDOWS VISTA version ID
	 */
	WIN_VISTA,

	/**
	 * WINDOWS 7 version ID
	 */
	WIN_7,

	/**
	 * WINDOWS 8 version ID
	 */
	WIN_8,

	/**
	 * WINDOWS 10 version ID
	 */
	WIN_10,

	/**
	 * WINDOWS 10+ version ID ( future implementations of Windows )
	 */
	WIN_OTHER,

	/**
	 * Other non-windows operating version ID
	 */
	UNKNOWN
}

/**
 * List with possible browser types.
 */
enum E_BROWSER_TYPE {

	/**
	 * Google Chrome Browser type ID
	 */
	CHROME,

	/**
	 * Mozilla Firefox Browser type ID
	 */
	FIREFOX,

	/**
	 * Microsoft Internet Explorer Browser type ID
	 */
	MSIE,

	/**
	 * Microsoft Edge Browser type ID
	 */
	EDGE,

	/**
	 * Apple's Safari Browser type ID
	 */
	SAFARI,

	/**
	 * Opera Browser type ID
	 */
	OPERA,

	/**
	 * Other Unknown Browser type ID
	 */
	UNKNOWN
}

/**
 * List with possible platform types
 */
enum E_DEVICE_TYPE {
	DESKTOP,
	MOBILE,
	SMART_TV
}

/**
 * List with possible feature detection errors.
 */
enum E_DETECTION_ERROR {
	/**
	 * Detection requirement completed successfully
	 */
	E_NONE,

	/**
	 * Your detection syntax string is BAD. Read documentation
	 */
	E_SYNTAX_ERROR,

	/**
	 * Your feature detection detected a Bad Operating system
	 */
	E_BAD_OS,

	/**
	 * Your feature detection required a mobile platform, but a Desktop platform was encountered
	 */
	E_MOBILE_APP,

	/**
	 * Your feature detection required a desktop platform, but a Mobile platform was encountered
	 */
	E_DESKTOP_APP,

	/**
	 * Your feature detection required another CPU class ( EG 32 bit or 64 bit ), but your client does not have such processor type
	 */
	E_BAD_CPU_CLASS,

	/**
	 * Your feature detection required another browser version 
	 */
	E_BROWSER_VERSION,

	/**
	 * Your feature detection required another browser type
	 */
	E_BROWSER_TYPE,

	/**
	 * Your feature detection required a Plugin, Technology, Feature, Api, or Browser Plugin that is not present on the client
	 */
	E_API_MISSING,

	/**
	 * Unspecified feature detection error.
	 */
	E_UNKNOWN_ERROR
}

/**
 * Main class. All methods are static.
 */
class Browser_Detector {
	
	/**
	 * 64 bit cpu's fragments that are searched in navigator.userAgent string
	 */
	private static CPU_64_CLASSES: string[] = [
		'x86_64', 'x86-64', 'Win64', 'x64;', 'amd64',
		'amd64', 'AMD64', 'WOW64', 'x64_64',
		'ia64', 'sparc64', 'ppc64', 'IRIX64'
	];

	/**
	 * Microsoft windows version names. Previous Windows versions of
	 * Windows 95 are not detected by this class, and might offer false positives
	 * on detection.
	 */
	private static WIN_VERSIONS_NAMES = {
		"win95"		: "Windows 95",
		"win98"		: "Windows 98",
		"win2k"		: "Windows 2000",
		"winnt4"	: "Windows NT 4.0",
		"winme"		: "Windows Millenium",
		"winxp"		: "Windows XP",
		"win2k3"	: "Windows 2003 Server",
		"winvista"	: "Windows Vista",
		"win7"		: "Windows 7",
		"win8"		: "Windows 8",
		"win10"		: "Windows 10",
		"winother"	: "Windows > 10",
		"win"		: "Windows"
	};

	/**
	 * The release order of Microsoft WIndows versions
	 */
	private static WIN_VERSIONS_RELEASE_ORDER = [
		"win",
		"win95",
		"win98",
		"winnt4",
		"winme",
		"win2k",
		"winxp",
		"win2k3",
		"winvista",
		"win7",
		"win8",
		"win10",
		"winother"
	];

	/**
	 * The list with user friendly browser names.
	 */
	private static BROWSER_NAMES = {
		"chrome": "Google Chrome",
		"firefox": "Mozilla Firefox",
		"msie": "Microsoft Internet Explorer",
		"edge": "Microsoft Edge",
		"opera": "Opera",
		"safari": "Safari",
		"other": "Non Standard"
	};

	/**
	 * The list with most common wanted HTML5 apis list. THe Browser Detector
	 * checks in window if such class exists. Also checks the "moz", "webkit", "o", and "ms" prefixes.
	 */
	private static APIS_LIST: string[] = [
		'ArrayBuffer',
		'Audio',
		'localStorage',
		'sessionStorage',
		'DataView',
		'Crypto',
		'CryptoKey',
		'File',
		'FileReader',
		'Blob',
		'Int16Array',
		'Int32Array',
		'Int8Array',
		'HTMLCanvasElement',
		'HTMLVideoElement',
		'HTMLAudioElement',
		'HTMLShadowElement',
		'CanvasRenderingContext2D',
		'URL',
		'MediaSource',
		'MediaStream',
		'AudioBuffer',
		'Promise',
		"Worker",
		"postMessage",
		"XMLHttpRequest"
	];

	/**
	 * A common list with the HTML5 api names, along with their description / explanations. This is
	 * in order to generate user friendly messages, or to convince user to use a
	 * more decent browser.
	 */
	private static API_NAMES = {
		"arraybuffer": 				"HTML5 ArrayBuffer API ( fixed length, raw binary data buffer )",
		"audio": 					"HTML5 Audio element API ( support for playing audio )",
		"localStorage": 			"HTML5 Local Storage API ( support for storing data on your browser )",
		"sessionStorage": 			"HTML5 Session Storage API ( support for storing data on your browser )",
		"dataview": 				"HTML5 DataView API ( low-level interface for reading data from and writing it to an ArrayBuffer )",
		"crypto": 					"HTML5 Crpytography functions",
		"cryptokey": 				"HTML5 Cryptography functions",
		"file": 					"HTML5 File API ( provides information about files and allows to access their contents )",
		"filereader": 				"HTML5 FileReader API ( lets web applications asynchronously read the contents of files / raw data buffers stored on your device or computer, using File or Blob objects to specify the file or data to read )",
		"blob": 					"HTML5 Blob API ( a file-like object of immutable, raw data )",
		"int16array": 				"HTML5 Int16Array API ( an array of twos-complement 16-bit signed integers in the platform byte order )",
		"int8array": 				"HTML5 Int8Array API ( an array of twos-complement 8-bit signed integers )",
		"int32array": 				"HTML5 Int32Array API ( an array of twos-complement 32-bit signed integers )",
		"htmlcanvaselement": 		"HTML5 Canvas API ( allows application to draw 2D or 3D graphics using accelerated techniques / and your video card's hardware )",
		"htmlvideoelement": 		"HTML5 Video Element API ( allows playing videos on your web browser, without the need of using external plugins )",
		"htmlaudioelement": 		"HTML5 Audio Element API ( allows playing sounds on your web browser, without the need of using external plugins )",
		"htmlshadowelement"	: 		"HTML5 Shadow DOM API ( provides encapsulation for the JavaScript, CSS and HTML support for web developers, in order to create high speed web pages )",
		"canvasrenderingcontext2d": "HTML5 Canvas element 2D drawing routines API",
		"url": 						"HTML5 URL API ( allows functions related with URL's and in-memory URL's for your web browser, including Video Streaming and Audio Streaming related ones )",
		"mediasource": 				"HTLM5 MediaSource API ( technology that provides video and audio streaming for your web browser )",
		"audiobuffer": 				"HTML5 AudioBuffer API ( technology that provides audio streaming and buffer for your web browser )",
		"flash":                    "Adobe Flash plugin",
		"nagra":                    "Encrypted video streaming support Player",
		"nagrapepper":              "Encrypted video streaming support Player Google Chrome browser extension",
		"promise":                  "Asynchronous data types, which make your browser run smoothly",
		"worker":                   "HTML5 Web Worker API",
		"postmessage":              "A technology used for inter-frame communication",
		"xmlhttprequest":           "HTML async transport inside browser (AJAX)"
	}

	/**
	 * Compare two windows versions by their "short" windows name code.
	 *
	 * @param ver1: string =  enum( 'win95', 'win98', 'win2k', etc )
	 * @param ver2: string =  enum( 'win95', 'win98', 'win2k', etc )
	 *
	 * This function takes in consideration the release date of those
	 * windows versions, not their name.
	 *
	 *
	 * Returns 0 if ver1 == ver2,
	 *       gt0 if ver2 > ver1,
	 *       lt0 if ver1 > v2
	 */

	private static winVersionCompare( ver1: string, ver2: string ): number {
		var var1I: number = Browser_Detector.WIN_VERSIONS_RELEASE_ORDER.indexOf(ver1),
			var2I: number = Browser_Detector.WIN_VERSIONS_RELEASE_ORDER.indexOf(ver2);
		return var2I - var1I;
	}

	/**
	 * Here we store a cached version of browser detection client identifier string
	 */
	private static CACHED_VERSION: string;

	/**
	 * TRUE on IPAD, FALSE otherwise
	 */
	private static get isIPad(): boolean {
		return !!navigator.userAgent.match(/iPad/i);
	}

	/**
	 * TRUE on IPOD, FALSE otherwise
	 */
	private static get isIPod(): boolean {
		return !!navigator.userAgent.match(/iPod/i);
	}

	/**
	 * TRUE on IPHONE, FALSE otherwise
	 */
	private static get isIPhone(): boolean {
		return !!navigator.userAgent.match(/iPhone/i);
	}

	/**
	 * TRUE on ANDROID, FALSE otherwise
	 */
	private static get isAndroid(): boolean {
		return !!navigator.userAgent.match(/Android/i);
	}

	/**
	 * TRUE on FIREFOX, FALSE otherwise
	 */
	private static get isFirefox(): boolean {
		return navigator.userAgent.match(/Firefox/i)
			&& !navigator.userAgent.match(/Seamonkey/i)
	}

	/**
	 * TRUE on WINDOWS PHONE, FALSE otherwise
	 */
	private static get isWindowsPhone(): boolean {
		return !!navigator.userAgent.match(/(Windows (Phone )?8.1|Windows NT 6.3|Windows Phone [\d\.]+)/i) &&
				navigator.userAgent.toLowerCase().indexOf('mobile') > -1;
	}
	
	/**
	 * TRUE on GOOGLE CHROME, FALSE otherwise
	 */
	private static get isChrome(): boolean {
		return !!window['chrome'] && /google/i.test(navigator.vendor);
	}

	/**
	 * TRUE on MICROSOFT INTERNET EXPLORER ( not EDGE ), FALSE otherwise
	 */
	private static get isInternetExplorer(): boolean {
		if ( navigator.appName == 'Microsoft Internet Explorer') {
			return !!/MSIE([0-9]{1,}[\.0-9]{0,})/.test(navigator.userAgent);
		} else {
			return false;
		}
	}

	/**
	 * Returns the CPU class ( 32 or 64 )
	 */
	private static get cpuClass(): number {
		var agent = navigator.userAgent,
			i: number = 0,
			len: number = Browser_Detector.CPU_64_CLASSES.length;

		for (i = 0; i < len; i++ ) {
			if ( agent.indexOf( Browser_Detector.CPU_64_CLASSES[i] ) > -1 ) {
				return 64;
			}
		} 

		return 32;
	}

	/**
	 * Returns the Operating system type ID
	 */
	private static get operatingSystem(): E_OS_TYPE {
		if (Browser_Detector.isWindowsPhone) {
			return E_OS_TYPE.WINDOWS_MOBILE;
		} else
			if(Browser_Detector.isAndroid) {
				return E_OS_TYPE.ANDROID;
			} else
				if (Browser_Detector.isIPad || Browser_Detector.isIPhone || Browser_Detector.isIPod ) {
					return E_OS_TYPE.IOS;
				} else
					if (navigator.userAgent.indexOf('Mac') > -1) {
						return E_OS_TYPE.MAC;
					} else
						if (navigator.userAgent.indexOf('Linux') > -1) {
							return E_OS_TYPE.LINUX;
						} else
							if (navigator.userAgent.indexOf('Windows')) {
								return E_OS_TYPE.WINDOWS;
							} else
								if (navigator.userAgent.indexOf('X11') > -1) {
									return E_OS_TYPE.UNIX;
								} else
									return E_OS_TYPE.OTHER;
}

	/**
	 * Returns the operating system version ID
	 */
	private static get operatingSystemVersion(): E_OS_VERSION {
		if ( Browser_Detector.operatingSystem != E_OS_TYPE.WINDOWS ) {
			return E_OS_VERSION.UNKNOWN;
		} else {
			switch ( true ) {
				case /(Windows 10\.0|Windows NT 10\.0)/.test(navigator.userAgent):
					return E_OS_VERSION.WIN_10;
					break;
				case /(Windows 8|Windows NT 6\.(2|3))/.test(navigator.userAgent):
					return E_OS_VERSION.WIN_8;
					break;
				case /(Windows 7|Windows NT 6\.1)/.test(navigator.userAgent):
					return E_OS_VERSION.WIN_7;
					break;
				case /Windows NT 6\.0/.test(navigator.userAgent):
					return E_OS_VERSION.WIN_VISTA;
					break;
				case /Windows NT 5\.2/.test(navigator.userAgent):
					return E_OS_VERSION.WIN_SERVER_2003;
					break;
				case /(Windows NT 5\.1|Windows XP)/.test(navigator.userAgent):
					return E_OS_VERSION.WIN_XP;
					break;
				case /(Windows NT 5\.0|Windows 2000)/.test(navigator.userAgent):
					return E_OS_VERSION.WIN_2000;
					break;
				case /(Win 9x 4\.90|Windows ME)/.test(navigator.userAgent):
					return E_OS_VERSION.WIN_ME;
					break;
				case /(Windows 98|Win98)/.test(navigator.userAgent):
					return E_OS_VERSION.WIN_98;
					break;
				case /(Windows 95|Win95|Windows_95)/.test(navigator.userAgent):
					return E_OS_VERSION.WIN_95;
					break;
				case /(Windows NT 4\.0|WinNT4\.0|WinNT|Windows NT)/.test(navigator.userAgent):
					return E_OS_VERSION.WIN_NT;
					break;
				default:
					return E_OS_VERSION.WIN_OTHER;
					break;
			}
		}
	}

	/**
	 * Returns the BROWSER TYPE version ID
	 */
	private static get browserType(): E_BROWSER_TYPE {
		switch (true) {
			case !!navigator.userAgent.match(new RegExp('[\\s]+Edge\\/[\\d]+', 'i')):
				return E_BROWSER_TYPE.EDGE;
				break;
			case navigator.userAgent.indexOf('Opera') > -1:
			case navigator.userAgent.indexOf('OPR') > -1:
				return E_BROWSER_TYPE.OPERA;
				break;
			case navigator.userAgent.indexOf('MSIE') > -1:
				return E_BROWSER_TYPE.MSIE;
				break;
			case navigator.userAgent.indexOf('Chrome') > -1:
				return E_BROWSER_TYPE.CHROME;
				break;
			case navigator.userAgent.indexOf('Safari') > -1:
				return E_BROWSER_TYPE.SAFARI;
				break;
			case navigator.userAgent.indexOf('Firefox') > -1:
				return E_BROWSER_TYPE.FIREFOX;
				break;
			case navigator.userAgent.indexOf('Trident/') > -1:
				return E_BROWSER_TYPE.MSIE;
				break;
			default:
				return E_BROWSER_TYPE.UNKNOWN;
		};
	}

	/**
	 * Returns the BROWSER VERSION number ( as Float )
	 */
	private static get browserVersion(): number {
		var nVer: string = navigator.appVersion,
            nAgt: string = navigator.userAgent,
            version: string = '' + parseFloat(navigator.appVersion),
            verOffset: number,
            nameOffset: number,
            ix: number,
            majorVersion: number;

        // MICROSOFT EDGE
        if ( ( verOffset = nAgt.indexOf('Edge\/') ) > -1 ) {
			version = nAgt.substr(verOffset + 5);
        } else
        // OPERA
        if ( ( verOffset = nAgt.indexOf('Opera') ) > -1) {
			version = nAgt.substring(verOffset + 6);
			if ((verOffset = nAgt.indexOf('Version')) != -1) {
                version = nAgt.substring(verOffset + 8);
            }
        } else
        // OPERA NEXT
		if ((verOffset = nAgt.indexOf('OPR')) != -1) {
			version = nAgt.substring(verOffset + 4)
		} else
		// MSIE
		if ((verOffset = nAgt.indexOf('MSIE')) != -1) {
			version = nAgt.substring(verOffset + 5)
		} else
		// Chrome
		if ((verOffset = nAgt.indexOf('Chrome')) != -1 ) {
			version = nAgt.substring(verOffset + 7)
		} else
		// Safari
		if ((verOffset = nAgt.indexOf('Safari')) != -1 ) {
			version = nAgt.substring(verOffset + 7);
			if ((verOffset = nAgt.indexOf('Version')) != -1) {
                version = nAgt.substring(verOffset + 8);
            }
		} else
		// Firefox
		if ((verOffset = nAgt.indexOf('Firefox')) != -1) {
			version = nAgt.substring(verOffset + 8);
		} else
		// Edge
		if (nAgt.indexOf('Trident/') != -1) {
			version = nAgt.substring(nAgt.indexOf('rv:') + 3)
		} else
		// Other
		if ( ( nameOffset = nAgt.lastIndexOf(' ') + 1 ) < ( verOffset = nAgt.lastIndexOf('/') ) ) {
			version = nAgt.substring(verOffset + 1);
		}

		if ((ix = version.indexOf(';')) != -1) 
			version = version.substring(0, ix);
        
        if ((ix = version.indexOf(' ')) != -1) 
        	version = version.substring(0, ix);
        
        if ((ix = version.indexOf(')')) != -1) 
        	version = version.substring(0, ix);

       	majorVersion = parseInt('' + version, 10);
        
        if (isNaN(majorVersion)) {
            version = '' + parseFloat(navigator.appVersion);
        }

        return parseFloat(version);
	}

	/**
	 * Returns a list with the BROWSER TECHNOLOGIES and APIS present on the client.
	 * The return value is a lower cased string, separated by the comma character.
	 */
	private static get browserTechnologies(): string {
		var technologies: string[] = [],
			i: number = 0,
			len: number = Browser_Detector.APIS_LIST.length;

		for (i = 0; i < len; i++ ) {
			if ( window[ Browser_Detector.APIS_LIST[i] ] 
					|| window[ 'moz' + Browser_Detector.APIS_LIST[i]] 
					|| window[ 'webkit' + Browser_Detector.APIS_LIST[i] ] 
					|| window[ 'ms' + Browser_Detector.APIS_LIST[i] ] 
					|| window[ 'o' + Browser_Detector.APIS_LIST[i] ] 
			) {
				technologies.push(Browser_Detector.APIS_LIST[i].toLowerCase() );
			}
		}

		// detect flash and nagra
		var plugins = navigator.plugins || [],
			isFlash: boolean = false,
			isNagra: boolean = false,
			j: number = 0,
			n: number = 0;

		for (i = 0, len = plugins.length; i < len; i++ ) {
			if ( plugins[i].description.toString().toLowerCase().indexOf( 'flash' ) > -1 ) {
				isFlash = true;
			} else
			if (typeof plugins[i]['application/x-nmpcbrowserplugin'] != 'undefined' ) {
				technologies.push('nagra')
			} else
			if ( plugins[i].length ) {
				for (j = 0, n = plugins[i].length; j < n; j++ ) {
					if (plugins[i][j].type == 'application/vnd.rcsrds.secureplayer.pepper.plugin') {
						technologies.push('nagrapepper');
						break;
					}
				}
			}
		}

		if ( isFlash ) {
			technologies.push('flash');
		}

		return technologies.join(',');
	}

	/**
	 * Computes a string in the following format (lowercased):
	 * 
	 * <os_name> <cpu_bits> (mobile|desktop) <browser> <version> apis=<api_name_1>[,<api_name_2>[,<api_name_3>[,...]]]
	 *
	 * The computation is made once, and after that is retrieved from the
	 * cache ( Browser_Detector.CACHED_VERSION ).
	 *
	 *
	 */

	public static get toString(): string {

		if ( Browser_Detector.CACHED_VERSION !== undefined ) {
			return Browser_Detector.CACHED_VERSION;
		}
		
		var result: string = '';
		
		switch ( Browser_Detector.operatingSystemVersion ) {
			case E_OS_VERSION.WIN_95:
				result += 'win95';
				break;
			case E_OS_VERSION.WIN_98:
				result += 'win98';
				break;
			case E_OS_VERSION.WIN_2000:
				result += 'win2k';
				break;
			case E_OS_VERSION.WIN_NT:
				result += 'winnt4';
				break;
			case E_OS_VERSION.WIN_ME:
				result += 'winme';
				break;
			case E_OS_VERSION.WIN_XP:
				result += 'winxp';
				break;
			case E_OS_VERSION.WIN_SERVER_2003:
				result += 'win2k3';
				break;
			case E_OS_VERSION.WIN_VISTA:
				result += 'winvista';
				break;
			case E_OS_VERSION.WIN_7:
				result += 'win7';
				break;
			case E_OS_VERSION.WIN_8:
				result += 'win8';
				break;
			case E_OS_VERSION.WIN_10:
				result += 'win10';
				break;
			case E_OS_VERSION.WIN_OTHER:
				result += 'winother';
				break;
			case E_OS_VERSION.UNKNOWN:

				switch ( Browser_Detector.operatingSystem ) {
					case E_OS_TYPE.ANDROID:
						result += 'android';
						break;
					case E_OS_TYPE.IOS:
						result += 'ios';
						break;
					case E_OS_TYPE.MAC:
						result += 'mac';
						break;
					case E_OS_TYPE.WINDOWS_MOBILE:
						result += 'winmobile';
						break;
					case E_OS_TYPE.WINDOWS:
						result += 'winother';
						break;
					case E_OS_TYPE.LINUX:
						result += 'linux';
						break;
					case E_OS_TYPE.UNIX:
						result += 'unix';
						break;
					case E_OS_TYPE.OTHER:
						result += 'other';
						break;
					default:
						result += 'unknown';
						break;
				}

				break;

			default:
				result += 'unknown';
				break;
		}

		switch ( Browser_Detector.cpuClass ) {
			case 32:
				result += ' 32';
				break;
			case 64:
				result += ' 64';
				break;
		}

		if ( /Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(navigator.appVersion ) ) {
			result += ' mobile';
		} else {
			result += ' desktop';
		}

		switch ( Browser_Detector.browserType ) {
			case E_BROWSER_TYPE.CHROME:
				result += ' chrome';
				break;
			case E_BROWSER_TYPE.FIREFOX:
				result += ' firefox';
				break;
			case E_BROWSER_TYPE.MSIE:
				result += ' msie';
				break;
			case E_BROWSER_TYPE.EDGE:
				result += ' edge';
				break;
			case E_BROWSER_TYPE.SAFARI:
				result += ' safari';
				break;
			case E_BROWSER_TYPE.OPERA:
				result += ' opera';
				break;
			case E_BROWSER_TYPE.UNKNOWN:
				result += ' other';
				break;
			default:
				result += ' other';
		}

		return Browser_Detector.CACHED_VERSION = ( result + ' ' + Browser_Detector.browserVersion.toFixed(2).replace(/[0]+$/g, '').replace(/\.$/, '') ) + ' apis=' + Browser_Detector.browserTechnologies;
	}


	/**
	 * Internal helper, that generates a human readable string with the missing apis names ( and description 
	 * if the description is present in the Browser_Detector.API_NAMES
	 */
	private static explainMissingApis( apisList: string[] ): string {
		
		if ( !apisList || !apisList.length ) {
			return 'An error occured while detecting your browser capabilities';
		}

		var result: string[] = [],
			i: number = 0,
			len: number = apisList.length;

		for (i = 0; i < len; i++ ) {
			if ( Browser_Detector.API_NAMES[ apisList[i] ] ) {
				result.push( '"' + apisList[i].toUpperCase() + '" (' + Browser_Detector.API_NAMES[ apisList[i] ] + ')' )
			} else {
				result.push('"' + apisList[i].toUpperCase() + '"');
			}
		}

		return result.join(' or ');

	}

	/**
	 * Returns a string explaining why the client is not meeting a requirement
	 * or an empty string if the client is satisfying that requirement
	 *
	 * @param requirements: string, in format
	 *
	 * <os> <cpu_arch> <platform_type> <browser_type> <browser_version>[ <required_apis>]
	 *
	 * WHERE:
	 *
	 * <os> can be:
	 *
	 * win, win95,  win98,  win2k,  winnt4,  winme,  winxp,  win2k3,  winvista,  win7,  win8,  win10,
	 *      win95+, win98+, win2k+, winnt4+, winme+, winxp+, win2k3+, winvista+, win7+, win8+, win10+,
	 *      winother, android, ios, mac, winmobile, linux, unix, other, * 
	 *      ( "*" means don't take in consideration the OS check )
	 *
	 * <cpu_arch> can be:
	 *
	 * 32, 64, or * 
	 *      ("*" means don't take in consideration the CPU arch check )
	 *
	 * <platform_type> can be:
	 *
	 * desktop, mobile, or *
	 *      ("*" means don't take in consideration the platform type )
	 *
	 * <browser_type> can be:
	 *
	 * chrome, firefox, msie, edge, opera, safari, other, or *
	 *      ("*" means don't take in consideration browser type)
	 *
	 * <browser_version> can be:
	 * 
	 * A positive integer or float number, optionally followed by a "+" sign
	 *
	 * <required_apis> can be:
	 *
	 * - Empty (no api presence on client are made )
	 * 
	 * - "apis=", followed by a list of api names. The "|" (or) operator can be used.
	 *   For example, you can use "apis=flash|mediasource,int16array"
	 *
	 *
	 * @return string, EMPTY IF CHECK SUCCED, or NON-EMPTY IF CHECK DOESN'T SUCCEED.
	 *
	 * If you pass the returned string to the static method "getRequirementErrorCode", you can parse
	 * the error code representing that string, in order to use i18n for example, or exception codes.
	 */

	public static meetsRequirements( requirements: string ): string {

		var matches: string[] =
			/^(\*|win((95|98|2k|nt4|me|xp|2k3|vista|7|8|10|other)(\+)?)?|android|ios|mac|winmobile|linux|unix|other|\*) (32|64|\*) (desktop|mobile|\*) (chrome|firefox|msie|edge|opera|safari|other|\*) ([\d\.]+(\+)?|\*)( apis\=([a-z\_\,\|\d]+))?$/i
				.exec(String( requirements || '' ));

		if (!matches)
			return 'E_SYNTAX_ERROR: Invalid requirement: ' + JSON.stringify(requirements);

		var targetOS: string = matches[1],
			targetCPUClass: number = ~~matches[5],
			targetDeviceType: string = matches[6],
			targetBrowser: string = matches[7],
			targetBrowserVersion: number = parseFloat(matches[8]) || -1,
			targetWinCompare: boolean = !!matches[4],
			targetMinWinVersion: string = targetWinCompare
				? targetOS.substr(0, targetOS.length - 1)
				: null,
			targetBrowserComparision: string = matches[8] && matches[8].match(/\+$/)
				? 'gte'
				: 'eq',
			targetApis: string[] = matches[11]
				? String(matches[11]).split(',')
				: [];

		matches = /^(win((95|98|2k|nt4|me|xp|2k3|vista|7|8|10|other)(\+)?)?|android|ios|mac|winmobile|linux|unix|other) (32|64|\*) (desktop|mobile) (chrome|firefox|msie|edge|opera|safari|other) ([\d\.]+) apis\=([a-z\_\,\d]+)$/i
			.exec(Browser_Detector.toString);

		var compareOS: string = matches[1],
			compareCPUClass: number = ~~matches[5],
			compareDeviceType: string = matches[6],
			compareBrowser: string = matches[7],
			compareBrowserVersion: number = parseFloat(matches[8]),
			isWinOS: boolean = /^win/.test( compareOS ) && compareDeviceType != 'mobile',
			compareApis = matches[9]
				? String(matches[9]).split(',')
				: null,
			i: number,
			j: number,
			len: number,
			n: number;

		if ( targetOS != '*' ) {

			if ( targetWinCompare && !isWinOS ) {
				
				return "E_BAD_OS: Sorry, you need Windows in order to enjoy this application";
			
			} else 
			if ( targetWinCompare ) {

				targetOS = targetOS.substr(0, targetOS.length - 1);

				var vc = Browser_Detector.winVersionCompare(targetOS, compareOS);

				if ( vc < 0 ) {

					return "E_BAD_OS:"+targetOS+": Sorry, you need at least " + (Browser_Detector.WIN_VERSIONS_NAMES[targetOS] || 'an Unknown Windows (' + targetOS + ') version') + ", but you have " + (Browser_Detector.WIN_VERSIONS_NAMES[compareOS] || 'an Unknown Windows (' + compareOS + ') version') + ' installed on your PC';

				}

			} else
			if ( targetOS != compareOS ) {
				
				switch ( targetOS ) {

					case 'win95':
					case 'win98':
					case 'win2k':
					case 'winnt4':
					case 'winme':
					case 'winxp':
					case 'win2k3':
					case 'winvista':
					case 'win7':
					case 'win8':
					case 'win10':
					case 'winother':
						return "E_BAD_OS: This application requires the '" + Browser_Detector.WIN_VERSIONS_NAMES[compareOS] + "' operating system in order to run properly.";
						break;
					case 'android':
						return "E_BAD_OS: This applicatoin requires the Android operating system in order to run properly.";
						break;
					case 'mac':
						return "E_BAD_OS: This application requires the Mac OS operating system in order to run properly.";
						break;
					case 'ios':
						return "E_BAD_OS: This application requires the IOS operating system in order to run properly.";
						break;
					case 'winmobile':
						return "E_BAD_OS: This application requires the Windows Mobile operating system in order to run properly.";
						break;
					case 'linux':
						return "E_BAD_OS: This application requires the Linux operating system in order to run properly";
						break;
					case 'unix':
						return "E_BAD_OS: This application requires a Unix operating system in order to run properly";
						break;
					case 'other':
					default:
						return "E_BAD_OS: Your operating system is not compatible with this application";
						break;
				}
			
			}

			// Check for client api's


		}

		if ( targetCPUClass != 0 && compareCPUClass != targetCPUClass ) {
			return 'E_BAD_CPU_CLASS: This application requires a ' + String(targetCPUClass) + 'bit CPU in order to run properly, and we detected that you have a ' + String( compareCPUClass ) + 'bit CPU';
		}

		if ( targetBrowser != '*' && compareBrowser != targetBrowser ) {
			return 'E_BAD_BROWSER: Sorry, you need a ' + ( Browser_Detector.BROWSER_NAMES[targetBrowser] || 'Special' ) + ' web browser in order to run this application, but we detected that you have ' + ( Browser_Detector.BROWSER_NAMES[ compareBrowser ] || 'Special' ) + ' web browser';
		}

		if ( targetDeviceType != '*' && compareDeviceType != targetDeviceType ) {
			switch ( targetDeviceType ) {
				case 'mobile':
					return 'E_MOBILE_APP: This application is not intended to be used on desktop computers. Please try using a mobile device';
					break;
				case 'desktop':
					return 'E_DESKTOP_APP: This application is not intended to be used on mobile devices. Please try using a desktop computer or a laptop';
					break;
			}
		}

		if ( targetBrowserVersion > -1 && compareBrowserVersion < targetBrowserVersion && targetBrowserComparision == 'gte' ) {
			return 'E_BROWSER_VERSION: You need at least ' + (Browser_Detector.BROWSER_NAMES[compareBrowser] || 'Special') + ' web browser version ' + targetBrowserVersion.toFixed(2) + ' in order to run this application, but we detected that you have a lower version (' + compareBrowserVersion.toFixed(2) + ')';
		} else
			if ( targetBrowserVersion > -1 && ~~compareBrowserVersion != ~~targetBrowserVersion && targetBrowserComparision == 'eq') {
				return 'E_BROWSER_VERSION: You need the ' + (Browser_Detector.BROWSER_NAMES[compareBrowser] || 'Special') + ' web browser version ' + ~~targetBrowserVersion  + ' in order to run this application, but we detected that you have a different version (' + ~~compareBrowserVersion + '), which is ' + ( compareBrowserVersion > targetBrowserVersion ? 'greater' : 'lower' ) + ' that the designed browser version of this application';
			}

		var apiOr: string[],
		    apiFound: boolean;

		// Check if ALL API's are present

		if ( targetApis && targetApis.length ) {

			for (i = 0, len = targetApis.length; i < len; i++ ) {

				apiOr = targetApis[i].split('|');

				if ( n = apiOr.length ) {

					apiFound = false;

					for (j = 0; j < n; j++ ) {
						if ( compareApis.indexOf( apiOr[j] ) > -1 ) {
							apiFound = true;
							break;
						}
					}

					if ( !apiFound ) {

						return 'E_API_MISSING: Some plugins, browser capabilities or extensions, were not detected: ' + Browser_Detector.explainMissingApis(apiOr);

					}
					
				}

			}

		}

		return '';

	}

	/**
	 * After we detect an error message with "meetsRequirements" method, we can parse it's error
	 * code into a constant, in order to use that constant in i18n or exception handling 
	 */
	public static getRequirementErrorCode( requirementErrorMessage: string ): E_DETECTION_ERROR {
		if ( requirementErrorMessage == '' ) {
			return E_DETECTION_ERROR.E_NONE;
		} else {
			var matches = /^([A-Z\d\_]+)\:/.exec(requirementErrorMessage);
			if ( !matches ) {
				return E_DETECTION_ERROR.E_NONE;
			} else {
				switch ( matches[1] ) {
					case 'E_SYNTAX_ERROR':
						return E_DETECTION_ERROR.E_SYNTAX_ERROR;
						break;
					case 'E_BAD_OS':
						return E_DETECTION_ERROR.E_BAD_OS;
						break;
					case 'E_MOBILE_APP':
						return E_DETECTION_ERROR.E_MOBILE_APP;
						break;
					case 'E_DESKTOP_APP':
						return E_DETECTION_ERROR.E_DESKTOP_APP;
						break;
					case 'E_BAD_CPU_CLASS':
						return E_DETECTION_ERROR.E_BAD_CPU_CLASS;
						break;
					case 'E_BROWSER_VERSION':
						return E_DETECTION_ERROR.E_BROWSER_VERSION;
						break;
					case 'E_BROWSER_TYPE':
						return E_DETECTION_ERROR.E_BROWSER_TYPE;
						break;
					case 'E_API_MISSING':
						return E_DETECTION_ERROR.E_API_MISSING;
						break;
					default:
						return E_DETECTION_ERROR.E_UNKNOWN_ERROR;
						break;
				}
			}
		}
	}

	public static isMobileDefaultBrowser(): boolean {
		return Browser_Detector.meetsRequirements('android * mobile chrome 42+') == ''
			? false
			: Browser_Detector.meetsRequirements('android * mobile chrome *') == ''
				? true
				: false;
	}

}