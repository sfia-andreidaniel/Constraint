/* $hint: compile-stats */

// IMPORTANT! Please do not remove or alter the $hint comments.
//            By doing so, constraint compiler will fail to 
//            patch your files, and you will loose data.

// @date:      Mon Jul 13 2015 23:07:11 GMT+0300 (GTB Daylight Time)
// @hostname:  web01
// @nodejs:    v0.10.26
// @generator: constraint compiler ( https://github.com/sfia-andreidaniel/Constraint )

/* $hint: end */

class DemoForm extends UI_Form {
	
    /* $hint: class-properties */
    /* $hint: end */

    constructor() {
        super();

        /* $hint: constructor-properties */
        /* $hint: end */

        this.onInitialize();
    }

    // Initializes the form UI element properties
    protected onInitialize() {
        
        /* $hint: child-properties */
        this.width = 200;
        this.height = 400;
         /* $hint: end */

        /* $hint: initialization-properties */
        /* $hint: end */
    
    }

}