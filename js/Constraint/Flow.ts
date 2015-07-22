class Constraint_Flow {

	protected tokensStart: Constraint_Token[] = [];
	protected tokensEnd:   Constraint_Token[] = [];
	protected children:    string[] = [];
	protected $children:   Constraint_Flow[] = null;
	protected childLen:    number = null;

	protected name: string = 'Flow';

	constructor( flowDef: IConstraintFlow, flowName: string ) {
		
		this.name = flowName;

		var addStart: boolean = true,
		    hasChildren: boolean = false;

		for ( var i=0, len = flowDef.flow.length; i<len; i++ ) {

			if ( flowDef.flow[i] == '@children' ) {
				if ( !addStart ) {
					throw Error('Bad flow (' + this.name + ') definition. Cannot have more than 1 @children blocks' );
				} else {
					addStart = false;
					hasChildren = true;
				}
			} else {
				if ( addStart ) {
					this.tokensStart.push( Constraint_Token.create( flowDef.flow[i] ) );
				} else {
					this.tokensEnd.push( Constraint_Token.create( flowDef.flow[i] ) );
				}
			}

		}

		if ( hasChildren ) {
			
			if ( typeof flowDef.children == 'undefined' ) {
				throw Error( 'Flow ' + this.name + ' requires a "children" block!' );
			}

			for ( var i=0, len = flowDef.children.length; i<len; i++ ) {
				// we store the flow childrens as strings, not as object, in order to avoid recursivity.
				this.children.push( flowDef.children[i] ); 
			}

		}

		this.childLen = flowDef.childNum || null;
	}

	public static create( flowName: string ): Constraint_Flow {
		
		if ( typeof Constraint.flows[ flowName ] == 'undefined' ) {
			console.warn( flowName + ' doesn\'t exist!' );
			throw Error( 'Failed to create flow "' + flowName + '": flow is not defined' );
		}

		return new Constraint_Flow( Constraint.flows[ flowName ], flowName );

	}

	public compile( inConstraint: Constraint, initialConsumed: number = 0, stack: string = '' ): number {

		var consume = initialConsumed,
		    buffer  = inConstraint.getBuffer( initialConsumed ),
		    result: ITokenResult,
		    childParsed: boolean,
		    consumeAdd: number = 0,
		    atLeastOneChildParsed: boolean = false,
		    dstack: string = stack == '' ? this.name : stack + '.' + this.name,

		    rstart: ITokenResult[] = [],
		    rend  : ITokenResult[] = [],

		    childLoops: number = 0,
		    childBreak: boolean = false,
		    tmp: any = null;


		for ( var i=0, len = this.tokensStart.length; i<len; i++ ) {

			if ( result = this.tokensStart[i].exec( buffer ) ) {

				consume += result.length;

				if ( result.length > 0 )
					buffer = inConstraint.getBuffer( consume );

				rstart.push( result );

			} else {

				return -1;
			}
		}

		switch ( this.name ) {
			case 'scope':
				inConstraint.pushs( rstart[2].result, rstart[4].result );
				break;
			case 'object_assignment':
				inConstraint.pusho( rstart[0].result );
				break;
			case 'array_assignment':
				inConstraint.arstart( rstart[0].result );
				break;
			case 'type_anonymous_object':
				inConstraint.pushanon();
				break;
			case 'type_anonymous_object_assignment':
				inConstraint.pushanonprop( rstart[1].result );
				break;
		}

		// PARSE CHILDREN IF ANY
		if ( this.children.length > 0 ) {

			if ( this.$children === null ) {
				this.$children = [];
				for ( var i=0, len = this.children.length; i<len; i++ ) {
					this.$children.push( Constraint_Flow.create( this.children[i] ) );
				}
			}

			do {

				childParsed = false;

				for ( var i=0, len = this.$children.length; i<len; i++ ) {
					
					if ( ( consumeAdd = this.$children[i].compile( inConstraint, consume, dstack ) ) >= 0 ) {
						consume = consumeAdd;
						buffer = inConstraint.getBuffer( consume );
						childParsed = true;
						atLeastOneChildParsed = true;
						childLoops++;
						//console.log( 'loop_match: ', i, ' => ', this.$children[i].name );

						if ( this.childLen !== null ) {
							if ( childLoops >= this.childLen ) {
								childBreak = true;
							}
						}

						break;
					} else {
						//console.log( 'loop_fail: ', i, this.$children[i].name, ' failed' );
					}
				}

			} while (  childParsed && !childBreak );

			// if ( !atLeastOneChildParsed ) {
			//	return -1;
			// }

		}

		// PARSE END OF TOKENS IN THE MAIN FLOW

		for ( var i=0, len = this.tokensEnd.length; i<len; i++ ) {

			if ( result = this.tokensEnd[i].exec( buffer ) ) {

				consume += result.length;
				buffer = inConstraint.getBuffer( consume );

				rend.push( result.result );

			} else {

				return -1;
			}

		}

		inConstraint.consume( consume );
		consume = 0;

		switch ( this.name ) {
			case 'declaration':
				inConstraint.decl( <string>(rstart[2].result), rstart[6] );
				break;
			case 'comment':
				//console.warn( 'comment: ', rstart[0].result.substr(2) );
				break;
			case 'assignment':
				inConstraint.asgn( rstart[0].result, rstart[4] );
				break;

			case 'scope':
				inConstraint.pops();
				break;

			case 'object_assignment':
				inConstraint.popo();
				break;

			case 'array_literal':
				inConstraint.arpush( rstart[0] );
				break;

			case 'array_assignment':
				inConstraint.arend();
				break;

			case 'type_anonymous_object':
				tmp = inConstraint.popanon();
				if ( typeof tmp !== null ) {
					inConstraint.arpushliteral( tmp );
				}
				break;

			case 'type_anonymous_primitive':
				inConstraint.pushanonprim( rstart[0] );
				break;

			default:
				//console.log( this.name );
		}

		return consume;

	}
}