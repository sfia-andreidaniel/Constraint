/**
 * Date helper functions, for manipulating the date object.
 *
 *
 *
 */
class Utils_Date {

	public static DEFAULT_DATE_FORMAT      : string = "DD-MM-YYYY";
	public static DEFAULT_TIME_FORMAT      : string = "hh:mm:ss";
	public static DEFAULT_TIMESTAMP_FORMAT : string = Utils_Date.DEFAULT_DATE_FORMAT + ' ' + Utils_Date.DEFAULT_TIME_FORMAT;

	private static dateFormatMappings = {
		"DD": EDatePart.DAY,
		"MM": EDatePart.MONTH,
		"YYYY": EDatePart.YEAR,
		"hh": EDatePart.HOUR,
		"mm": EDatePart.MINUTE,
		"ss": EDatePart.SECOND,
		"UU": EDatePart.UNIX_TIMESTAMP
	};

	private static readInt(len: number, from: string ): number {
		
		if ( len > from.length ) {
			return null;
		}

		var i: number,
		    out: string = '';
		
		for ( i=0; i<len; i++ ) {
			if ( /^[\d]/.test(from[i]) ) {
				out += from[i];
			} else {
				return null;
			}
		}

		return ~~out;
	}

	/**
	 * Parses a date from a string.
	 *
	 * @param date - Required. The string representing the date.
	 *
	 * @param format - Optional. You can use a free-string, denoting a date
	 *        pattern.
	 *
	 * @param useInitializer - Optional. Use the initializer instead of current date
	 *
	 *
	 *
	 * Recognized format fields:
	 * * **DD**   - day
	 * * **MM**   - month
	 * * **YYYY** - year, 4 digits
	 * * **hh**   - hour
	 * * **mm**   - minute
	 * * **ss**   - second
	 * * **UU**   - unix timestamp. If this is used, the other formats are ignored, as this 
	 *   format is self enough to describe a date.
	 *
	 * **Format example**: "DD-MM-YYYY hh:mm:ss"
	 *
	 * You can parse also relative dates, in the following format in the **date** argument:
	 *
	 * [-|+] quantity unit [ [quantity unit] ... [quantity unit] ]
	 * 
	 * Where [unit] can be:
	 * * **Y** - for years
	 * * **M** - for months
	 * * **D** - for days
	 * * **W** - for weeks
	 * * **h** - for hours
	 * * **m** - for minutes
	 * * **s** - for seconds
	 *
	 * **Relative date example**
	 * * **-3Y** -- 3 years ago
	 * * **57s** -- current date + 57 seconds.
	 * * **-3Y5W6D5h** -- current date - 3years, 5 weeks, 6 days, 5 hours
	 */

	public static parse( date: string, format?: string, useInitializer?: Date ): Date {
		
		if ( !date ) {
			return null;
		} else {

			switch ( date ) {
				
				case 'now':
					return new Date();
					break;
				
				case 'yesterday':
					return Utils_Date.parse('-1D');
					break;
				case 'tomorrow':
					return Utils_Date.parse('+1D');
					break;
				case 'last year':
					return Utils_Date.parse('-1Y');
					break;
				case 'last month':
					return Utils_Date.parse('-1M');
					break;
				case 'last week':
					return Utils_Date.parse('+1W');
					break;
				case 'next year':
					return Utils_Date.parse('+1Y');
					break;
				case 'next month':
					return Utils_Date.parse('+1M');
					break;
				case 'next week':
					return Utils_Date.parse('+1W');
					break;
			}
		}

		var formats: any[],
		    chr2: string,
		    pFormat: string = String( format || '' ),
		    pDate: string = String( date || '' ),
		    len: number = pFormat.length,
		    dLen: number = pDate.length,
		    i: number,

		    setDay: number,
		    setMonth: number,
		    setYear: number,
		    setHour: number,
		    setMinute: number,
		    setSecond: number,
		    setTimestamp: number,

		    result: Date,
		    matches: string[],

		    addSeconds: number,
		    addDays: number,
		    addYears: number,
		    addSign: number,
		    addMonths: number;


		if ( !!(matches = /^(\+|\-)?([\d]+[YMDWhms](([\d]+[YMDWhms])+)?)$/.exec( pDate ) ) ) {

			addSeconds = null;
			addDays = null;
			addYears = null;
			addMonths = null;

			if ( matches[1] ) {
				addSign = matches[1] == '-' ? -1 : 1;
				pDate = pDate.substr(1);
			}

			while ( matches = /^([\d]+)([YMDWhms])/.exec( pDate ) ) {
				
				pDate = pDate.substr( matches[0].length );
				
				switch ( matches[2] ) {
					case 'Y':
						addYears = ( addYears || 0 ) + ~~matches[1];
						break;
					case 'M':
						addMonths = ( addMonths || 0 ) + ~~matches[1];
						break;
					case 'D':
						addDays = ( addDays || 0 ) + ~~matches[1];
						break;
					case 'W':
						addDays = ( addDays || 0 ) + ( ~~matches[1] * 7 );
						break;
					case 'h':
						addSeconds = ( addSeconds || 0 ) + ( ~~matches[1] * 3600 );
						break;
					case 'm':
						addSeconds = ( addSeconds || 0 ) + ( ~~matches[1] * 60 );
						break;
					case 's':
						addSeconds = ( addSeconds || 0 ) + ~~matches[1];
						break;
				}
			}

			result = useInitializer || new Date();

			console.log( addYears, 'years', addMonths, 'months', addDays, 'days', addSeconds, 'seconds' );

			if ( addYears !== null )
				result.setFullYear( result.getFullYear() + addSign * addYears );

			if ( addMonths !== null )
				result.setMonth( result.getMonth() + addSign * addMonths );

			if ( addDays !== null )
				result.setDate( result.getDate() + addSign * addDays );

			if ( addSeconds !== null )
				result.setSeconds( result.getSeconds() + addSign * addSeconds );

			return result;

		} else
		if ( pFormat ) {

			formats = [];

			setDay = null;
			setMonth = null;
			setYear = null;
			setHour = null;
			setMinute = null;
			setSecond = null;
			setTimestamp = null;

			while ( len ) {
				
				chr2 = pFormat.substr(0,2);

				if ( chr2 == 'YY' ) {
					chr2 = pFormat.substr(0,4);
				}
				
				if ( typeof Utils_Date.dateFormatMappings[chr2] != 'undefined' ) {

					len -= chr2.length;
					formats.push( Utils_Date.dateFormatMappings[chr2] );
					pFormat = pFormat.substr(chr2.length);

				} else {
					formats.push( chr2[0] );
					len -= 1;
					pFormat = pFormat.substr(1);
				}
			}

			len = formats.length;

			for ( i=0; i<len; i++ ) {

				if ( !dLen ) {
					return null;
				}

				if ( typeof formats[i] == 'string' ) {

					// read string
					dLen--;
					
					if ( pDate[0] != formats[i] ) {
						return null;
					}

					pDate = pDate.substr(1);
				
				} else {

					switch ( formats[i] ) {

						case EDatePart.DAY:
							setDay = Utils_Date.readInt(2,pDate);
							if ( setDay === null ) return null;
							dLen-=2;
							pDate = pDate.substr(2);
							break;
						
						case EDatePart.MONTH:
							setMonth = Utils_Date.readInt(2,pDate);
							if ( setMonth === null ) return null;
							dLen-=2;
							pDate = pDate.substr(2);
							break;

						case EDatePart.YEAR:
							setYear = Utils_Date.readInt(4,pDate);
							if ( setYear === null ) return null;
							dLen -= 4;
							pDate = pDate.substr(4);
							break;

						case EDatePart.HOUR:
							setHour = Utils_Date.readInt(2,pDate);
							if ( setHour === null ) return null;
							dLen -= 2;
							pDate = pDate.substr(2);
							break;

						case EDatePart.MINUTE:
							setMinute = Utils_Date.readInt(2,pDate);
							if ( setMinute === null ) return null;
							dLen -= 2;
							pDate = pDate.substr(2);
							break;

						case EDatePart.SECOND:
							setSecond = Utils_Date.readInt(2,pDate);
							if ( setSecond === null ) return null;
							dLen -= 2;
							pDate = pDate.substr(2);
							break;

						case EDatePart.UNIX_TIMESTAMP:
							setTimestamp = ~~pDate;
							if ( setTimestamp === 0 ) return null;
							dLen = 0;
							pDate = '';
							break;
					}

				}

			}

			result = useInitializer || new Date();

			if ( setTimestamp !== null ) {

				result.setTime( setTimestamp * 1000 );

				return result;

			} else {

				if ( setYear !== null )
					result.setFullYear(setYear);
				
				if ( setMonth !== null )
					result.setMonth(setMonth -1);

				if ( setDay !== null )
					result.setDate(setDay);

				if ( setHour !== null )
					result.setHours(setHour);

				if (setMinute !== null )
					result.setMinutes(setMinute);

				if (setSecond !== null )
					result.setSeconds(setSecond);

				return ( (
					setYear !== null
						? result.getFullYear() == setYear
						: true
				) && (
					setMonth !== null
						? result.getMonth() == setMonth - 1
						: true
				) && (
					setDay !== null
						? result.getDate() == setDay
						: true
				) && (
					setHour !== null
						? result.getHours() == setHour
						: true
				) && (
					setMinute !== null
						? result.getMinutes() == setMinute
						: true
				) && (
					setSecond !== null
						? result.getSeconds() == setSecond
						: true
				) ) ? result : null;

			}

		} else {

			result = Utils_Date.parse( date, Utils_Date.DEFAULT_TIMESTAMP_FORMAT );

			if ( result )
				return result;

			result = Utils_Date.parse( date, Utils_Date.DEFAULT_DATE_FORMAT );

			if ( result )
				return result;

			result = Utils_Date.parse( date, Utils_Date.DEFAULT_TIME_FORMAT );

			if ( result )
				return result;

			return null;

		}

		return null;

	}

	public static format( d: Date, format: string = Utils_Date.DEFAULT_TIMESTAMP_FORMAT ): string {

		var out: string = '',
		    chr2: string = '',
		    pFormat: string = String( format || '' ),
		    len: string = pFormat.length;

		while ( len ) {

			chr2 = pFormat.substr(0,2);

			if ( chr2 == 'YY' ) {
				chr2 = pFormat.substr(0,4);
			}
			
			if ( typeof Utils_Date.dateFormatMappings[chr2] != 'undefined' ) {

				len -= chr2.length;
				pFormat = pFormat.substr(chr2.length);

				switch ( Utils_Date.dateFormatMappings[chr2] ) {

					case EDatePart.YEAR:
						out += Utils.string.pad( d.getFullYear(), 4, '0', EStrPadding.LEFT );
						break;
					case EDatePart.MONTH:
						out += Utils.string.pad( ( d.getFullMonth() + 1 ), 2, '0', EStrPadding.LEFT );
						break;
					case EDatePart.DAY:
						out += Utils.string.pad( d.getDate(), 2, '0', EStrPadding.LEFT );
						break;

					case EDatePart.HOUR:
						out += Utils.string.pad( d.getHours(), 2, '0', EStrPadding.LEFT );
						break;

					case EDatePart.MINUTE:
						out += Utils.string.pad( d.getMinutes(), 2, '0', EStrPadding.LEFT );
						break;

					case EDatePart.SECOND:
						out += Utils.string.pad( d.getSeconds(), 2, '0', EStrPadding.LEFT );
						break;

					case EDatePart.UNIX_TIMESTAMP:
						out += String( ~~( d.getTime() / 1000 ) );
						break;

				}


			} else {
				out += chr2[0];
				len -= 1;
				pFormat = pFormat.substr(1);
			}
		}

		return out;

	}

}