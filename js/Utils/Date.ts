/**
 * Date helper functions, for manipulating the date object.
 *
 *
 *
 */
class Utils_Date {

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
	 * **IF** you omit the @format argument, you can parse also relative dates, in the
	 * following format in the **date** argument:
	 *
	 * -? [quantity] [unit]
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
	 * * **-3y** -- 3 years ago
	 * * **57s** -- current date + 57 seconds.
	 */

	public static parse( date: string, format?: string ): Date {
		
		var unit: string,
		    quantity: number,
		    negative: boolean,
		    formats: any[],
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

		    result: Date;

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

			result = new Date();

			if ( setTimestamp !== null ) {

				result.setTime( setTimestamp * 1000 );
				return result;

			} else {

				result = new Date();

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

		}

		return null;

	}

}