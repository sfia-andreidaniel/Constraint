var lastresult = '';

function paranthesis_reader( buffer ) /* : string[] */ {

		buffer = String( buffer || '' );

		var i      /* : number*/,
			j      /* : number*/,
		    len    /* : number */ = buffer.length,
		    opener /* : string */,
		    closer /* : string */,
		    result /* : string */ = '',
		    stack  /* : string[] */ = [],
		    iEsc   /* : boolean */ = false,
		    strCloser /* : string */ = '',
		    break2    /* : boolean */,
		    str = '';

		if ( len <= 1 ) {
			return null;
		}

		opener = buffer[ 0 ];

		switch ( opener ) {
			case '(':
				stack.push( closer = ')' );
				break;
			case '{':
				stack.push( closer = '}' );
				break;
			default:
				return null;
				break;
		}

		i = 1;

		while ( i < len ) {

			switch ( buffer[i] ) {
				
				case '(':
					stack.push(')');
					result += buffer[i];
					break;
				
				case '{':
					stack.push('}');
					result += buffer[i];
					break;

				case '}':
				case ')':

					if ( stack[stack.length-1] == buffer[i] ) {
						result += stack.pop();
						if ( stack.length == 0 ) {
							return [ opener + result, result.substr(0, result.length - 1) ];
						}
					} else {
						return null; // unexpected close order paranthesis
					}

					break;

				case '/':

					// read comment, or regular expression
					result += buffer[i];
					i++;

					if ( i == len ) {
						return null;
					}

					switch ( buffer[i] ) {
						case '*':
							i++;
							result += '*';
							// read comment multiline
							if ( ( j = buffer.indexOf( '*/', i ) ) == -1 ) {
								console.log( 'unexpected close comment' );
								return null;
							} else {
								result += buffer.substr(i, j - i + 2 );
								i = j + 1;
							}
							break;
						case '/':
							i++;
							result += '/';
							// read comment single line
							if ( ( j = buffer.indexOf( '\n', i ) ) == -1 ) {
								//console.log( 'unexpected close single line comment' );
								return null;
							} else {
								result += buffer.substr( i, j - i + 1 );
								i = j;
							}
							break;
						default:
							// read regular expression:
							strCloser = str = '/';
							iEsc = false;
							break2 = false;

							while ( i < len ) {
								switch ( buffer[i] ) {
									case 'n':
									case 'r':
										if ( iEsc ) {
											str += buffer[i];
											iEsc = false;
										} else {
											str += buffer[i];
										}
										break;
									case '\n':
									case '\r':
										//console.log( 'regexp reader null found in string, prev char: ' + JSON.stringify( str ) + ', ' + iEsc );
										return null;
										break;
									case '\\':
										str += '\\';
										if ( !iEsc ) {
											iEsc = true;
										} else {
											iEsc = false;
										}
										break;
									case strCloser:
										if ( iEsc ) {
											str += strCloser;
											iEsc = false;
										} else {
											str += strCloser;
											break2 = true;
										}
										break;
									default:
										str += buffer[i];
										break;
								}

								if ( break2 ) {
									//console.log( 'regexp: ', JSON.stringify( str ) );
									break;
								}

								i++;
							}

							if ( !break2 ) {
								//console.error( 'regexp return null, break2 not' + JSON.stringify(str) );
								return null;
							}

							result += str;

							break;
					}

					break;

				case '"':
				case "'":
					// read string
					strCloser = buffer[i];
					str = strCloser;
					i++;
					iEsc = false;
					break2 = false;

					while ( i < len ) {
						switch ( buffer[i] ) {
							case 'n':
							case 'r':
								if ( iEsc ) {
									str += buffer[i];
									iEsc = false;
								} else {
									str += buffer[i];
								}
								break;
							case '\n':
							case '\r':
								//console.log( 'string reader null found in string, prev char: ' + JSON.stringify( str ) + ', ' + iEsc );
								return null;
								break;
							case '\\':
								str += '\\';
								if ( !iEsc ) {
									iEsc = true;
								} else {
									iEsc = false;
								}
								break;
							case strCloser:
								if ( iEsc ) {
									str += strCloser;
									iEsc = false;
								} else {
									str += strCloser;
									break2 = true;
								}
								break;
							default:
								str += buffer[i];
								break;
						}

						if ( break2 ) {
							//console.log( 'string: ', JSON.stringify( str ) );
							break;
						}

						i++;
					}

					if ( !break2 ) {
						//console.error( 'return null, break2 not' + JSON.stringify(str) );
						return null;
					}

					result += str;

					break;

				default:
					result += buffer[i];
					break;

			}

			i++;
		}

		return null;

	}
