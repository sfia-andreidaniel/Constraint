/* $hint: compile-stats */

// IMPORTANT! Please do not remove or alter the $hint comments.
//            By doing so, constraint compiler will fail to 
//            patch your files, and you will loose data.

// @date:      Wed Jul 15 2015 00:05:01 GMT+0300 (GTB Daylight Time)
// @hostname:  web01
// @nodejs:    v0.10.26
// @generator: Constraint compiler ( https://github.com/sfia-andreidaniel/Constraint )

/* $hint: end */

class DemoForm extends UI_Form {
	
    /* $hint: class-properties */
    // WARNING: Any code written inside of this hint is overrided by constraint compiler!

    /* $hint: end */

    constructor() {
        super();

        /* $hint: constructor-properties */
        // WARNING: Any code written inside of this hint is overrided by constraint compiler!

        /* $hint: end */

        this.onInitialize();
    }

    // Initializes the form UI element properties
    protected onInitialize() {
        
        /* $hint: child-properties */
        // WARNING: Any code written inside of this hint is overrided by constraint compiler!

        this.width = 200;
        this.height = 400;
        this.left = 300;
        this.top = 200;
        this.caption = "Demo form";
        this.placement = EFormPlacement.CENTER;
         /* $hint: end */

        /* $hint: initialization-properties */
        // WARNING: Any code written inside of this hint is overrided by constraint compiler!

        /* $hint: end */
    
    }

}