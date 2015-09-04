/**
 * The class UI_Font is usefull to enumerate all fonts installed on the system.
 */
class UI_Font {

	protected static baseFonts: string[] = [ 'monospace', 'sans-serif', 'serif' ];
	protected static testString: string = "mmmmmmmmmmlli";
	protected static testSize: string = '72px';
	protected static ready: boolean = false;
	protected static tester: any;

	private static stdFonts: string[] = [
		
		/**
		 * Windows fonts
		 */

		'cursive',
		'monospace',
		'serif',
		'sans-serif',
		'fantasy',
		'default',
		'Arial',
		'Arial Black',
		'Arial Narrow',
		'Arial Rounded MT Bold',
		'Bookman Old Style',
		'Bradley Hand ITC',
		'Century',
		'Century Gothic',
		'Comic Sans MS',
		'Courier',
		'Courier New',
		'Georgia',
		'Gentium',
		'Impact',
		'King',
		'Lucida Console',
		'Lalit',
		'Modena',
		'Monotype Corsiva',
		'Papyrus',
		'Tahoma',
		'TeX',
		'Times',
		'Times New Roman',
		'Trebuchet MS',
		'Verdana',
		'Verona'

		/**
		 * Ubuntu fonts
		 */

		 /**
		 Abyssinica SIL
Bitstream Charter
Bitstream Charter
Bitstream Charter
Bitstream Charter
Century Schoolbook L
Century Schoolbook L
Century Schoolbook L
Century Schoolbook L
Courier 10 Pitch
Courier 10 Pitch
Courier 10 Pitch
Courier 10 Pitch
DejaVu Sans
DejaVu Sans Mono
DejaVu Serif
Dingbats
Droid Arabic Naskh
Droid Sans
Droid Sans Armenian
Droid Sans Ethiopic
Droid Sans Fallback
Droid Sans Georgian
Droid Sans Hebrew
Droid Sans Hebrew
Droid Sans Japanese
Droid Sans Mono
Droid Sans Thai
Droid Serif
FreeMono
FreeSans
FreeSerif
gargi
Garuda
KacstArt
KacstBook
KacstDecorative
KacstDigital
KacstFarsi
KacstLetter
KacstNaskh
KacstOffice
KacstOne
KacstOne
KacstPen
KacstPoster
KacstQurn
KacstScreen
KacstTitle
KacstTitleL
Kedage
Khmer OS
Khmer OS System
Kinnari
Kinnari
Kinnari
Kinnari
Kinnari
Kinnari
Liberation Mono
Liberation Mono
Liberation Mono
Liberation Mono
Liberation Sans
Liberation Sans
Liberation Sans
Liberation Sans
Liberation Sans Narrow
Liberation Sans Narrow
Liberation Sans Narrow
Liberation Sans Narrow
Liberation Serif
Liberation Serif
Liberation Serif
Liberation Serif
LKLUG
Lohit Bengali
Lohit Devanagari
Lohit Gujarati
Lohit Punjabi
Lohit Tamil
Loma
Loma
Loma
Loma
Mallige
Mallige
Meera
mry
Mukti Narrow
Mukti Narrow
NanumBarunGothic
NanumBarunGothic
NanumGothic
NanumGothic
NanumMyeongjo
NanumMyeongjo
Nimbus Mono L
Nimbus Mono L
Nimbus Mono L
Nimbus Mono L
Nimbus Roman No9 L
Nimbus Roman No9 L
Nimbus Roman No9 L
Nimbus Roman No9 L
Nimbus Sans L
Nimbus Sans L
Nimbus Sans L
Nimbus Sans L
Nimbus Sans L
Nimbus Sans L
Nimbus Sans L
Nimbus Sans L
Norasi
Norasi
Norasi
Norasi
Norasi
Norasi
OpenSymbol
ori1Uni
Padauk
Padauk
Padauk Book
Padauk Book
Phetsarath OT
Pothana2000
Purisa
Purisa
Purisa
Purisa
Rachana
Rekha
Saab
Sawasdee
Sawasdee
Sawasdee
Sawasdee
Standard Symbols L
Symbol
Symbol
TakaoPGothic
TakaoPGothic
Tibetan Machine Uni
Tlwg Typist
Tlwg Typist
Tlwg Typist
Tlwg Typist
Tlwg Typo
Tlwg Typo
Tlwg Typo
Tlwg Typo
TlwgMono
TlwgMono
TlwgMono
TlwgMono
TlwgTypewriter
TlwgTypewriter
TlwgTypewriter
TlwgTypewriter
Ubuntu
Ubuntu
Ubuntu
Ubuntu
Ubuntu
Ubuntu
Ubuntu
Ubuntu
Ubuntu Condensed
Ubuntu Mono
Ubuntu Mono
Ubuntu Mono
Ubuntu Mono
Umpush
Umpush
Umpush
Umpush
Umpush
Umpush
URW Bookman L
URW Bookman L
URW Bookman L
URW Bookman L
URW Chancery L
URW Gothic L
URW Gothic L
URW Gothic L
URW Gothic L
URW Palladio L
URW Palladio L
URW Palladio L
URW Palladio L
Vemana2000
Waree
Waree
Waree
Waree
	**/


	];

	protected static eventer: UI_Event = new UI_Event();

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

		UI_Font.ready = true;



		UI_Font.eventer.fire('ready');

	}

	public static detect( fontName: string ): Thenable<boolean> {

		return ( 
			UI_Font.ready
				? Promise.resolve()
				: (new Promise(function(accept, reject) {

					var unbinder = function() {
						UI_Font.eventer.off('ready', unbinder);
						accept(true);
					}

					UI_Font.eventer.on('ready', unbinder);

				})) 
			).then(function(dummy: any) {

				var detected: boolean = false,
					matched: boolean;

				for (var index in UI_Font.baseFonts) {
					UI_Font.tester.style.fontFamily = fontName + ', ' + UI_Font.baseFonts[index];
					document.body.appendChild(UI_Font.tester);
					matched = (UI_Font.tester.offsetWidth != UI_Font.defaultWidth[UI_Font.baseFonts[index]] || UI_Font.tester.offsetHeight != UI_Font.defaultHeight[UI_Font.baseFonts[index]]);
					document.body.removeChild(UI_Font.tester);
					detected = detected || matched;
				}

				return detected;

			});

	}


}