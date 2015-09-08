/* $hint: compile-stats */

// IMPORTANT! Please do not remove or alter the $hint comments.
//            By doing so, constraint compiler will fail to 
//            patch your files, and you will loose data.

// @date:      Tue Sep 08 2015 20:16:42 GMT+0300 (GTB Daylight Time)
// @hostname:  web01
// @nodejs:    v0.12.7
// @generator: Constraint compiler ( https://github.com/sfia-andreidaniel/Constraint )

/* $hint: end */

class DemoForm extends UI_Form {
	
    /* $hint: class-properties */
    // WARNING: Any code written inside of this hint is overrided by constraint compiler!

    // make all instances of DemoForm to await for resources, etc. before opening.
    public static __awaits__ = {"resource":["Constraint"]};


    public Popup1: UI_Popup;
    public Toolbar: UI_Toolbar;
    public Tabs1: UI_TabsPanel;
    public FirstTab: UI_Tab;
    public Combo1Label: UI_Label;
    public Combo1: UI_ComboBox;
    public LabelTags1: UI_Label;
    public Tags1: UI_Tags;
    public AdvControls: UI_Tab;
    public PropGrid0: UI_PropertyGrid;
    public StdDialogs: UI_Tab;
    public ButtonAlert: UI_Button;
    public ButtonError: UI_Button;
    public ButtonInfo: UI_Button;
    public ButtonWarning: UI_Button;
    public ButtonColor: UI_Button;
    public Tab_Grid: UI_Tab;
    public Grid0: UI_Grid;
    public Tree0: UI_Tree_Grid;
    public Tab_Text: UI_Tab;
    public Text1: UI_TextBox;
    public DropDown1: UI_DropDown;
    public Date1: UI_DateBox;
    public Spin1: UI_Spinner;
    public Color1: UI_ColorBox;
    public Slider2: UI_HorizontalSlider;
    public Slider1: UI_VerticalSlider;
    public Check1: UI_CheckBox;
    public Check2: UI_CheckBox;
    public Check3: UI_CheckBox;
    public Radio1: UI_RadioBox;
    public Radio2: UI_RadioBox;
    public Radio3: UI_RadioBox;
    public Progress0: UI_ProgressBar;
    public List1: UI_ListBox;
    public Tab1: UI_Tab;
    public Spl1: UI_VerticalSplitter;
    public Spl2: UI_HorizontalSplitter;
    public BtnLeft: UI_Button;
    public Panel1: UI_Panel;
    public Btn1: UI_Button;
    /* $hint: end */

    constructor() {
        super();

        /* $hint: constructor-properties */
        // WARNING: Any code written inside of this hint is overrided by constraint compiler!

        this.Popup1 = new UI_Popup( this );
        this.Toolbar = new UI_Toolbar( this );
        this.Tabs1 = new UI_TabsPanel( this );
        this.FirstTab = new UI_Tab( this.Tabs1 );
        this.Combo1Label = new UI_Label( this.FirstTab );
        this.Combo1 = new UI_ComboBox( this.FirstTab );
        this.LabelTags1 = new UI_Label( this.FirstTab );
        this.Tags1 = new UI_Tags( this.FirstTab );
        this.AdvControls = new UI_Tab( this.Tabs1 );
        this.PropGrid0 = new UI_PropertyGrid( this.AdvControls );
        this.StdDialogs = new UI_Tab( this.Tabs1 );
        this.ButtonAlert = new UI_Button( this.StdDialogs );
        this.ButtonError = new UI_Button( this.StdDialogs );
        this.ButtonInfo = new UI_Button( this.StdDialogs );
        this.ButtonWarning = new UI_Button( this.StdDialogs );
        this.ButtonColor = new UI_Button( this.StdDialogs );
        this.Tab_Grid = new UI_Tab( this.Tabs1 );
        this.Grid0 = new UI_Grid( this.Tab_Grid );
        this.Tree0 = new UI_Tree_Grid( this.Tab_Grid );
        this.Tab_Text = new UI_Tab( this.Tabs1 );
        this.Text1 = new UI_TextBox( this.Tab_Text );
        this.DropDown1 = new UI_DropDown( this.Tab_Text );
        this.Date1 = new UI_DateBox( this.Tab_Text );
        this.Spin1 = new UI_Spinner( this.Tab_Text );
        this.Color1 = new UI_ColorBox( this.Tab_Text );
        this.Slider2 = new UI_HorizontalSlider( this.Tab_Text );
        this.Slider1 = new UI_VerticalSlider( this.Tab_Text );
        this.Check1 = new UI_CheckBox( this.Tab_Text );
        this.Check2 = new UI_CheckBox( this.Tab_Text );
        this.Check3 = new UI_CheckBox( this.Tab_Text );
        this.Radio1 = new UI_RadioBox( this.Tab_Text );
        this.Radio2 = new UI_RadioBox( this.Tab_Text );
        this.Radio3 = new UI_RadioBox( this.Tab_Text );
        this.Progress0 = new UI_ProgressBar( this.Tab_Text );
        this.List1 = new UI_ListBox( this.Tab_Text );
        this.Tab1 = new UI_Tab( this.Tabs1 );
        this.Spl1 = new UI_VerticalSplitter( this.Tab1 );
        this.Spl2 = new UI_HorizontalSplitter( this.Tab1 );
        this.BtnLeft = new UI_Button( this.Tab1 );
        this.Panel1 = new UI_Panel( this.Tab1 );
        this.Btn1 = new UI_Button( this.Panel1 );
        /* $hint: end */

        this.paintable = false;
        this.onInitialize();
    }

    // Initializes the form UI element properties
    protected onInitialize() {
        /* $hint: form-events */

        this.on( 'action', function() { this.actionCommand( this ); } );

        /* $hint: end */

        /* $hint: child-properties */
        // WARNING: Any code written inside of this hint is overrided by constraint compiler!

        this.width = 800;
        this.height = 500;
        this.left = 10;
        this.top = 10;
        this.caption = "Demo form";
         /* $hint: end */

        /* $hint: initialization-properties */
        // WARNING: Any code written inside of this hint is overrided by constraint compiler!

        
        
        this.Tabs1.left = 20;
        this.Tabs1.top = UI_Anchor_Literal.create({"alignment":3,"target":"Toolbar","distance":20});
        this.Tabs1.right = 20;
        this.Tabs1.bottom = 40;
        
        this.FirstTab.caption = "Other controls";
        
        this.Combo1Label.left = 20;
        this.Combo1Label.top = 20;
        this.Combo1Label.width = 100;
        this.Combo1Label.caption = "Combo Box";
        this.Combo1Label.target = "Combo1";
        
        this.Combo1.left = UI_Anchor_Literal.create({"alignment":2,"target":"Combo1Label","distance":20});
        this.Combo1.top = 20;
        this.Combo1.width = 150;
        this.Combo1.height = 25;
        this.Combo1.strictMode = true;
        this.Combo1.caseSensitive = false;
        this.Combo1.strings = ["Anabelle","Abigail","Alabamma","Becks","Bon Jovi","Bee Gees","Corby","Danemarca","Ethan","Ellie","Fog","Frog","Germany","Hyunday","indian","indianopollis","Jamaica","Kyle","Key","Lamborgini","Lana del Rey","Misc","Microsoft","new","numb","Number","Oprah","orphan","Postman Person","personal","Perfect Job","quantum","Republic of a country","Reunion","South","Twilight","twister","Undiscovered","Venezuela","Vatican","West","we","xerxes","Xandros","Yasminne","Yucatan","Zimbabwe","Zorba","Zg"];
        
        ( function( form ) { form.Combo1.on('change', function() { form.onComboChanged( this ); } ); } )( this );
        
        this.LabelTags1.left = 20;
        this.LabelTags1.top = UI_Anchor_Literal.create({"alignment":3,"target":"Combo1","distance":20});
        this.LabelTags1.width = 100;
        this.LabelTags1.caption = "Tags";
        this.LabelTags1.target = "Tags1";
        
        this.Tags1.left = UI_Anchor_Literal.create({"alignment":2,"target":"LabelTags1","distance":20});
        this.Tags1.top = UI_Anchor_Literal.create({"alignment":3,"target":"Combo1","distance":20});
        this.Tags1.right = 20;
        this.Tags1.height = 75;
        this.Tags1.strings = ["video","article","featured article","featured video","sports","multimedia","entertainment","website","connection","ftp connection","ssh connection","filesystem","constraint","typescript","ui framework","ui canvas","documentation"];
        this.Tags1.value = ["fifa","article","featured article","featured video"];
        
        this.AdvControls.caption = "Advanced Controls";
        
        this.PropGrid0.left = 20;
        this.PropGrid0.top = 20;
        this.PropGrid0.right = 20;
        this.PropGrid0.bottom = 20;
        this.PropGrid0.properties = [{"name":"details","caption":"Database Details","children":[{"name":"host","caption":"Host Name","input":{"type":"string","value":"localhost"}},{"name":"port","caption":"Port","input":{"type":"int","min":0,"max":65535,"value":"9306"}},{"name":"user","caption":"User Name","input":{"type":"string","value":"root"}},{"name":"advanced","caption":"Advanced settings","expanded":false,"children":[{"name":"passwordHash","caption":"Password Hashing","input":{"type":"string","value":"*(#(OLKSDLKAKLASD"}}]},{"name":"password","caption":"Password","input":{"type":"string","value":"","password":true}}]},{"name":"id","caption":"ID","input":{"type":"STRING","value":"001293899120309123123123"}},{"name":"enabled","caption":"Enabled","input":{"type":"boolean","value":true}},{"name":"onlineDate","caption":"Online Date","input":{"type":"date","value":"now"}},{"name":"multiple","caption":"DropDown Input","input":{"type":"select","options":[{"value":null,"text":"- Select -"},{"value":1,"text":"One"},{"value":2,"text":"Two"}],"value":1}},{"name":"statusColor","caption":"Status Color","input":{"type":"color","value":"red"}}];
        
        this.StdDialogs.caption = "Standard Dialogs";
        this.StdDialogs.layout.type = ELayoutType.TOP_TO_BOTTOM;
        this.StdDialogs.layout.itemFixedHeight = 25;
        this.StdDialogs.layout.rows = 5;
        this.StdDialogs.layout.columns = 2;
        this.StdDialogs.layout.verticalSpacing = 10;
        this.StdDialogs.layout.margin = 20;
        
        this.ButtonAlert.caption = "Alert";
        
        ( function( form ) { form.ButtonAlert.on('click', function() { form.showMessageBox( this ); } ); } )( this );
        
        this.ButtonError.caption = "Error";
        
        ( function( form ) { form.ButtonError.on('click', function() { form.showMessageBox( this ); } ); } )( this );
        
        this.ButtonInfo.caption = "Info";
        
        ( function( form ) { form.ButtonInfo.on('click', function() { form.showMessageBox( this ); } ); } )( this );
        
        this.ButtonWarning.caption = "Warning";
        
        ( function( form ) { form.ButtonWarning.on('click', function() { form.showMessageBox( this ); } ); } )( this );
        
        this.ButtonColor.caption = "Color";
        
        ( function( form ) { form.ButtonColor.on('click', function() { form.showColorBox( this ); } ); } )( this );
        
        this.Tab_Grid.caption = "Grid";
        
        this.Grid0.left = 20;
        this.Grid0.top = 20;
        this.Grid0.right = 20;
        this.Grid0.bottom = UI_Anchor_Literal.create({"alignment":5,"target":null});
        this.Grid0.editable = true;
        this.Grid0.items = [{"id":1,"name":"Item 1"},{"id":2,"name":"Item 2"},{"id":3,"name":"Item 3"},{"id":4,"name":"Item 4"},{"id":5,"name":"Item 5"},{"id":6,"name":"Item 6"},{"id":7,"name":"Item 7"},{"id":8,"name":"Item 8"},{"id":9,"name":"Item 9"},{"id":10,"name":"Item 10"}];
        
        this.Tree0.left = 20;
        this.Tree0.top = UI_Anchor_Literal.create({"alignment":3,"target":"Grid0","distance":10});
        this.Tree0.right = 20;
        this.Tree0.bottom = 20;
        this.Tree0.editable = true;
        this.Tree0.nestedItems = [{"name":"My Computer","children":[{"name":"C:","online":true,"children":[{"name":"Program Files","children":[{"name":"Microsoft","isLeaf":false},{"name":"EA Sports","isLeaf":false},{"name":"Monolith Productions","isLeaf":false}]},{"name":"Users","children":[{"name":"All Users","children":[{"name":"Desktop","isLeaf":false},{"name":"Shared Documents","isLeaf":false}]},{"name":"Andrei","children":[{"name":"Desktop","isLeaf":false},{"name":"My Documents","isLeaf":false},{"name":"My Music","isLeaf":false}]}]}]},{"name":"D:","online":false,"children":[{"name":"Music","children":[{"name":"Beattles - Let it be.mp3","size":123123123},{"name":"Vaya con dios - Ney nah nah nah.mp3","size":450123},{"name":"Avril Lavigne - Complicated.mp3","size":1902832}]}]}]},{"name":"My Network Places","children":[{"name":"Microsoft Network","isLeaf":false},{"name":"WorkGroup","children":[{"name":"Development001","isLeaf":false}]}]}];
        
        this.Tab_Text.caption = "Standard Inputs";
        
        this.Text1.value = "Input value";
        this.Text1.placeholder = "Input placeholder";
        this.Text1.left = 10;
        this.Text1.top = 10;
        this.Text1.right = 240;
        
        this.DropDown1.left = 10;
        this.DropDown1.top = UI_Anchor_Literal.create({"alignment":3,"target":"Text1","distance":10});
        this.DropDown1.right = 240;
        this.DropDown1.options = [{"value":"","text":"Pick an option"},{"value":"1","text":"Option # 1"},{"value":"2","text":"Option #2"},{"value":"3","text":"Option #3"}];
        
        this.Date1.left = 10;
        this.Date1.top = UI_Anchor_Literal.create({"alignment":3,"target":"DropDown1","distance":10});
        this.Date1.right = 240;
        this.Date1.minDate = 1440523002834;
        this.Date1.maxDate = 1449598602834;
        
        this.Spin1.left = 10;
        this.Spin1.top = UI_Anchor_Literal.create({"alignment":3,"target":"Date1","distance":10});
        this.Spin1.right = 240;
        this.Spin1.value = 0;
        this.Spin1.min = -1000;
        this.Spin1.max = 1000;
        this.Spin1.step = 2;
        
        this.Color1.left = 10;
        this.Color1.top = UI_Anchor_Literal.create({"alignment":3,"target":"Spin1","distance":10});
        this.Color1.right = 240;
        
        this.Slider2.left = 10;
        this.Slider2.top = UI_Anchor_Literal.create({"alignment":3,"target":"Color1","distance":10});
        this.Slider2.right = 240;
        
        this.Slider1.right = 10;
        this.Slider1.top = 10;
        this.Slider1.bottom = 10;
        
        this.Check1.caption = "I'm a checkbox";
        this.Check1.right = 40;
        this.Check1.top = 20;
        this.Check1.width = 180;
        
        this.Check2.caption = "I'm a disabled checkbox";
        this.Check2.right = 40;
        this.Check2.top = UI_Anchor_Literal.create({"alignment":3,"target":"Check1","distance":20});
        this.Check2.width = 180;
        this.Check2.disabled = true;
        
        this.Check3.caption = "I'm a tri-state checkbox";
        this.Check3.right = 40;
        this.Check3.top = UI_Anchor_Literal.create({"alignment":3,"target":"Check2","distance":20});
        this.Check3.width = 180;
        this.Check3.value = null;
        this.Check3.triState = true;
        
        this.Radio1.caption = "I'm a radiobox";
        this.Radio1.right = 40;
        this.Radio1.top = UI_Anchor_Literal.create({"alignment":3,"target":"Check3","distance":20});
        this.Radio1.width = 180;
        
        this.Radio2.caption = "I'm a radiobox too, but I'm disabled";
        this.Radio2.right = 40;
        this.Radio2.top = UI_Anchor_Literal.create({"alignment":3,"target":"Radio1","distance":20});
        this.Radio2.width = 180;
        this.Radio2.disabled = true;
        this.Radio2.value = true;
        
        this.Radio3.caption = "I'm a radioBox too";
        this.Radio3.right = 40;
        this.Radio3.top = UI_Anchor_Literal.create({"alignment":3,"target":"Radio2","distance":20});
        this.Radio3.width = 180;
        this.Radio3.value = false;
        
        this.Progress0.caption = "%p";
        this.Progress0.top = UI_Anchor_Literal.create({"alignment":3,"target":"Radio3","distance":20});
        this.Progress0.right = 40;
        this.Progress0.width = 180;
        this.Progress0.min = 0;
        this.Progress0.max = 50;
        this.Progress0.value = 25;
        
        this.List1.left = 10;
        this.List1.top = UI_Anchor_Literal.create({"alignment":3,"target":"Slider2","distance":10});
        this.List1.right = 240;
        this.List1.bottom = 10;
        this.List1.options = [{"id":0,"name":"Option 1"},{"id":1,"name":"Option 2"}];
        
        this.Tab1.caption = "Layout";
        
        this.Spl1.minDistance = 30;
        this.Spl1.distance = 150;
        
        this.Spl2.left = UI_Anchor_Literal.create({"alignment":2,"target":"Spl1","distance":0});
        this.Spl2.minDistance = 130;
        
        this.BtnLeft.caption = "Left button";
        this.BtnLeft.left = 20;
        this.BtnLeft.right = UI_Anchor_Literal.create({"alignment":1,"target":"Spl1","distance":20});
        this.BtnLeft.top = UI_Anchor_Literal.create({"alignment":4,"target":null});
        
        this.Panel1.left = UI_Anchor_Literal.create({"alignment":2,"target":"Spl1","distance":5});
        this.Panel1.top = 5;
        this.Panel1.right = 5;
        this.Panel1.bottom = UI_Anchor_Literal.create({"alignment":0,"target":"Spl2","distance":5});
        
        this.Btn1.caption = "Hello world";
        this.Btn1.bottom = UI_Anchor_Literal.create({"alignment":4,"target":null});
        this.Btn1.left = UI_Anchor_Literal.create({"alignment":4,"target":null});
        
        /* $hint: end */

        /* $hint: anonymous-properties */
        // WARNING: Any code written inside of this hint is overrided by constraint compiler!
        ( function( form ) {

            // __ANON__0
            (function( _root_ ) { 
                var self = new UI_MenuItem( _root_ );
                self.caption = "As csv File";
                self.action = "cmd-save-csv";
            } )( form.Popup1 );
            

            // __ANON__1
            (function( _root_ ) { 
                var self = new UI_MenuItem( _root_ );
                self.caption = "As document";

                // __ANON__2
                (function( _root_ ) { 
                    var self = new UI_MenuItem( _root_ );
                    self.caption = "Word Document";
                    self.action = "cmd-save-word";
                } )( self );
                

                // __ANON__3
                (function( _root_ ) { 
                    var self = new UI_MenuItem( _root_ );
                    self.caption = "Excel Document";
                    self.action = "cmd-save-excel";
                } )( self );
                
            } )( form.Popup1 );
            

            // __ANON__4
            (function( _root_ ) { 
                var self = new UI_MenuBar( _root_ );

                // __ANON__5
                (function( _root_ ) { 
                    var self = new UI_MenuItem( _root_ );
                    self.caption = "File";

                    // __ANON__6
                    (function( _root_ ) { 
                        var self = new UI_MenuItem( _root_ );
                        self.caption = "Open";

                        // __ANON__7
                        (function( _root_ ) { 
                            var self = new UI_MenuItem( _root_ );
                            self.caption = "File 1";
                            self.inputType = EMenuItemInputType.RADIO;
                            self.action = "cmd-open";
                        } )( self );
                        

                        // __ANON__8
                        (function( _root_ ) { 
                            var self = new UI_MenuItem( _root_ );
                            self.caption = "File 2";
                            self.inputType = EMenuItemInputType.RADIO;
                        } )( self );
                        
                    } )( self );
                    

                    // __ANON__9
                    (function( _root_ ) { 
                        var self = new UI_MenuItem( _root_ );
                        self.caption = "Exit";
                        self.shortcutKey = "Ctrl + X";
                        self.action = "cmd-exit";
                    } )( self );
                    
                } )( self );
                

                // __ANON__10
                (function( _root_ ) { 
                    var self = new UI_MenuItem( _root_ );
                    self.caption = "Edit";
                    self.disabled = true;
                } )( self );
                

                // __ANON__11
                (function( _root_ ) { 
                    var self = new UI_MenuItem( _root_ );
                    self.caption = "View";
                } )( self );
                

                // __ANON__12
                (function( _root_ ) { 
                    var self = new UI_MenuItem( _root_ );
                    self.caption = "Insert";
                } )( self );
                

                // __ANON__13
                (function( _root_ ) { 
                    var self = new UI_MenuItem( _root_ );
                    self.caption = "Help";
                } )( self );
                
            } )( form );
            

            // __ANON__14
            (function( _root_ ) { 
                var self = new UI_Button( _root_ );
                self.caption = "New";
                self.action = "cmd_new";
                self.icon = "Constraint/file/20x20";
            } )( form.Toolbar );
            

            // __ANON__15
            (function( _root_ ) { 
                var self = new UI_Button( _root_ );
                self.caption = "Open";
                self.action = "cmd_open";
                self.icon = "Constraint/folder/20x20";
            } )( form.Toolbar );
            

            // __ANON__16
            (function( _root_ ) { 
                var self = new UI_Button( _root_ );
                self.caption = "Save";
                self.action = "cmd_save";
                self.menu = "Popup1";
                self.icon = "Constraint/ico_edit_save/20x20";
            } )( form.Toolbar );
            

            // __ANON__17
            (function( _root_ ) { 
                var self = new UI_Column( _root_ );
                self.caption = "#";
                self.freezed = true;
                self.type = EColumnType.ROW_NUMBER;
                self.width = 30;
                self.textAlign = EAlignment.RIGHT;
            } )( form.Grid0 );
            

            // __ANON__18
            (function( _root_ ) { 
                var self = new UI_Column( _root_ );
                self.name = "id";
                self.freezed = true;
                self.type = EColumnType.INT;
                self.width = 50;
                self.caption = "ID";
                self.textAlign = EAlignment.RIGHT;
            } )( form.Grid0 );
            

            // __ANON__19
            (function( _root_ ) { 
                var self = new UI_Column( _root_ );
                self.name = "name";
                self.freezed = false;
                self.type = EColumnType.STRING;
                self.width = 450;
                self.caption = "Type";
                self.editable = true;
            } )( form.Grid0 );
            

            // __ANON__20
            (function( _root_ ) { 
                var self = new UI_Column( _root_ );
                self.caption = "#";
                self.freezed = true;
                self.type = EColumnType.ROW_NUMBER;
                self.width = 30;
                self.textAlign = EAlignment.RIGHT;
            } )( form.Tree0 );
            

            // __ANON__21
            (function( _root_ ) { 
                var self = new UI_Column( _root_ );
                self.name = "id";
                self.freezed = true;
                self.type = EColumnType.INT;
                self.width = 50;
                self.caption = "ID";
                self.textAlign = EAlignment.RIGHT;
            } )( form.Tree0 );
            

            // __ANON__22
            (function( _root_ ) { 
                var self = new UI_Column( _root_ );
                self.type = EColumnType.TREE;
                self.width = 200;
                self.caption = "Places";
                self.editable = true;
            } )( form.Tree0 );
            

            // __ANON__23
            (function( _root_ ) { 
                var self = new UI_Column( _root_ );
                self.type = EColumnType.STRING;
                self.width = 100;
                self.caption = "Type";
                self.name = "type";
                self.textAlign = EAlignment.RIGHT;
                self.editable = true;
            } )( form.Tree0 );
            

            // __ANON__24
            (function( _root_ ) { 
                var self = new UI_Column( _root_ );
                self.type = EColumnType.BOOLEAN;
                self.width = 40;
                self.caption = "Online";
                self.name = "online";
                self.textAlign = EAlignment.CENTER;
                self.editable = true;
            } )( form.Tree0 );
            

            // __ANON__25
            (function( _root_ ) { 
                var self = new UI_Column( _root_ );
                self.type = EColumnType.BYTES;
                self.width = 60;
                self.caption = "Size";
                self.name = "size";
                self.textAlign = EAlignment.RIGHT;
                self.editable = true;
            } )( form.Tree0 );
            

            // __ANON__26
            (function( _root_ ) { 
                var self = new UI_Column( _root_ );
                self.type = EColumnType.DATE;
                self.width = 80;
                self.caption = "Date";
                self.name = "date";
                self.textAlign = EAlignment.RIGHT;
                self.inputFormat = "MS";
                self.editable = true;
            } )( form.Tree0 );
            

        })( this );
        /* $hint: end */
    
    }


    /* $hint: method-showMessageBox */
    public showMessageBox( sender: UI_Event ) {

        switch ( sender ) {
            case this.ButtonAlert:
                UI_Dialog_MessageBox.create('Alert text. See the result in console.', 'Alert', EDialogBoxType.MB_ALERT, null, this).then(function( result ) {
                    console.log(result);
                });
                break;

            case this.ButtonError:
                 UI_Dialog_MessageBox.create('Error text. See the result in console.', 'Error', EDialogBoxType.MB_ERROR, null, this).then(function( result ) {
                     console.log(result);
                });
               break;

            case this.ButtonInfo:
                UI_Dialog_MessageBox.create('Info text. See the result in console.', 'Info', EDialogBoxType.MB_INFO, null, this).then(function( result ) {
                    console.log(result);
                });
                break;

            case this.ButtonWarning:
                UI_Dialog_MessageBox.create('Warning text. See the result in console.', 'Warning', EDialogBoxType.MB_WARNING, null, this).then(function( result ) {
                    console.log(result);
                });
                break;
        }

    }
    /* $hint: end */

    /* $hint: method-showColorBox */
    public showColorBox( sender: UI_Event ) {
        UI_Dialog_ColorBox.create(this).then(function(color: UI_Color) {
            console.log(!color ? color : color.toString(null));
        });
    }
    /* $hint: end */

    /* $hint: method-actionCommand */
    public actionCommand( sender: UI_Event ) {

    }
    /* $hint: end */

    /* $hint: method-onComboChanged */
    public onComboChanged( sender: UI_Event ) {
        console.log(this.Combo1.value);
    }
    /* $hint: end */
}