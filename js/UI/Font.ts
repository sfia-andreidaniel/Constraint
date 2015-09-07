/**
 '* The class UI_Font is usefull to enumerate all fonts installed on the system.
 */
class UI_Font {

	protected static baseFonts: string[] = [ 'monospace', 'sans-serif', 'serif' ];
	protected static testString: string = "mmmmmmmmmmlli";
	protected static testSize: string = '72px';
	public    static ready: boolean = false;
	protected static tester: any;

	public static fontsList: string[] = [];

	/**
	 * Standard fonts list that are automatically detected. Based on the list of Windows and Ubuntu
	 */
	private static stdFonts: string[] = [
		'Abyssinica SIL',
		'Arial',
		'Arial Black',
		'Arial Narrow',
		'Arial Rounded MT Bold',
		'Bitstream Charter',
		'Bookman Old Style',
		'Bradley Hand ITC',
		'Century',
		'Century Gothic',
		'Century Schoolbook L',
		'Comic Sans MS',
		'Courier',
		'Courier 10 Pitch',
		'Courier New',
		'DejaVu Sans',
		'DejaVu Sans Mono',
		'DejaVu Serif',
		'Dingbats',
		'Droid Arabic Naskh',
		'Droid Sans',
		'Droid Sans Armenian',
		'Droid Sans Ethiopic',
		'Droid Sans Fallback',
		'Droid Sans Georgian',
		'Droid Sans Hebrew',
		'Droid Sans Hebrew',
		'Droid Sans Japanese',
		'Droid Sans Mono',
		'Droid Sans Thai',
		'Droid Serif',
		'fantasy',
		'FreeMono',
		'FreeSans',
		'FreeSerif',
		'gargi',
		'Garuda',
		'Gentium',
		'Georgia',
		'Impact',
		'KacstArt',
		'KacstBook',
		'KacstDecorative',
		'KacstDigital',
		'KacstFarsi',
		'KacstLetter',
		'KacstNaskh',
		'KacstOffice',
		'KacstOne',
		'KacstPen',
		'KacstPoster',
		'KacstQurn',
		'KacstScreen',
		'KacstTitle',
		'KacstTitleL',
		'Kedage',
		'Khmer OS',
		'Khmer OS System',
		'King',
		'Kinnari',
		'Lalit',
		'Liberation Mono',
		'Liberation Sans',
		'Liberation Sans Narrow',
		'Liberation Serif',
		'LKLUG',
		'Lohit Bengali',
		'Lohit Devanagari',
		'Lohit Gujarati',
		'Lohit Punjabi',
		'Lohit Tamil',
		'Loma',
		'Lucida Console',
		'Mallige',
		'Meera',
		'Modena',
		'monospace',
		'Monotype Corsiva',
		'mry',
		'Mukti Narrow',
		'NanumBarunGothic',
		'NanumGothic',
		'NanumMyeongjo',
		'Nimbus Mono L',
		'Nimbus Roman No9 L',
		'Nimbus Sans L',
		'Norasi',
		'OpenSymbol',
		'ori1Uni',
		'Padauk',
		'Padauk Book',
		'Papyrus',
		'Phetsarath OT',
		'Pothana2000',
		'Purisa',
		'Rachana',
		'Rekha',
		'Saab',
		'Sawasdee',
		'Standard Symbols L',
		'Symbol',
		'Tahoma',
		'TakaoPGothic',
		'TeX',
		'Tibetan Machine Uni',
		'Times',
		'Times New Roman',
		'Tlwg Typist',
		'Tlwg Typo',
		'TlwgMono',
		'TlwgTypewriter',
		'Trebuchet MS',
		'Ubuntu',
		'Ubuntu Condensed',
		'Ubuntu Mono',
		'Umpush',
		'URW Bookman L',
		'URW Chancery L',
		'URW Gothic L',
		'URW Palladio L',
		'Vemana2000',
		'Verdana',
		'Verona',
		'Waree'
	];

	public static eventer: UI_Event = new UI_Event();

	protected static defaultWidth = {
		"monospace": 0,
		"sans-serif": 0,
		"serif": 0
	};

	protected static defaultHeight = {
		"monospace": 0,
		"sans-serif": 0,
		"serif": 0
	};

	public static initialize() {

		UI_Font.tester = Utils.dom.create('span');
		
		var index: string;

		UI_Font.tester.style.fontSize = UI_Font.testSize;

		UI_Font.tester.innerHTML = UI_Font.testString;

		for ( index in UI_Font.baseFonts ) {
			UI_Font.tester.style.fontFamily = UI_Font.baseFonts[index];
			document.body.appendChild(UI_Font.tester);
			UI_Font.defaultWidth[UI_Font.baseFonts[index]] = UI_Font.tester.offsetWidth;
			UI_Font.defaultHeight[UI_Font.baseFonts[index]] = UI_Font.tester.offsetHeight;
			document.body.removeChild(UI_Font.tester);
		}

		var tests: Thenable<boolean>[] = [],
			i: number,
			len: number = UI_Font.stdFonts.length,
			triggered: number = 0;

		for (i = 0; i < len; i++) {
			(function(font: string) {
				tests.push(UI_Font.detect(font).then( function( detected: boolean ) {
					
					triggered++;
					
					if ( detected ) {
						UI_Font.fontsList.push(font);
					}
					return true;
				}));
			})(UI_Font.stdFonts[i]);
		}

		UI_Font.eventer.fire('begin');

		Promise.all(tests).then(function() {
			UI_Font.ready = true;
			UI_Font.eventer.fire('ready');
		});

	}

	public static detect( fontName: string ): Thenable<any> {

		return new Promise(function(accept, reject) {

				var unbinder = function() {
					UI_Font.eventer.off('begin', unbinder);
					accept(true);
				}

				UI_Font.eventer.on('begin', unbinder);

		})
		.then(function(dummy: any) {

			var detected: boolean = false,
				matched: boolean;

			for (var index in UI_Font.baseFonts) {
				UI_Font.tester.style.fontFamily = "'" + fontName + "', " + UI_Font.baseFonts[index];
				document.body.appendChild(UI_Font.tester);
				matched = (UI_Font.tester.offsetWidth != UI_Font.defaultWidth[UI_Font.baseFonts[index]] || UI_Font.tester.offsetHeight != UI_Font.defaultHeight[UI_Font.baseFonts[index]]);
				document.body.removeChild(UI_Font.tester);
				detected = detected || matched;
				if ( detected ) {
					break;
				}
			}

			return detected;

		});
	}


}