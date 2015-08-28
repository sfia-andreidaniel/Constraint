# Constraint

Constraint is a project that aims to implement an UI Framework for the browser. The advantage of using the Constraint Framework, is that the layout of the application is decoupled form the code of the application, and it's written on a type language - Typescript.

## Features
* Typescript strict library
* 100% OOP, no "hacks" and no other obfuscations
* Auto-documentation
* GNU make compliant
* Separates UI from the code, by using a text file format called "ui". UI is UI, code is code. This greately improves code reusability and modularity.
* works on Winows and Linux, because it's using open source projects

## Available widgets set

#### UI_Button
![button](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_Button.png "UI_Button")
![button-disabled](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_Button-disabled.png "UI_Button_Disabled")

#### UI_CheckBox
![checkbox](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_CheckBox.png "UI_CheckBox")

#### UI_DateBox
![datebox](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_DateBox.png "UI_DateBox")
![datebox-disabled](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_DateBox-disabled.png "UI_DateBox disabled")
![datebox-expanded](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_DateBox-expanded.png "UI_DateBox expanded")

#### UI_DropDown
![dropdown](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_DropDown.png "UI_DropDown")
![dropdown-disabled](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_DropDown-disabled.png "UI_DropDown disabled")
![dropdown-expanded](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_DropDown-expanded.png "UI_DropDown expanded")


#### UI_Form
![form](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/demo_form.png "UI_Form")

#### UI_Grid
![grid](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_Grid.png "UI_Grid")
![](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_Grid-disabled.png "UI_Grid disabled")

#### UI_HorizontalSlider, UI_VerticalSlider
![slider2](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_VerticalSlider-active.png "UI_VerticalSlider")
![slider](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_VerticalSlider-disabled.png "UI_VerticalSlider disabled")

#### UI_HorizontalSplitter, UI_VerticalSplitter
![splitter](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_HorizontalSplitter.png "UI_HorizontalSplitter")
![splitter2](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_VerticalSplitter.png "UI_VerticalSplitter")

#### UI_Label

#### UI_ListBox
![listbox](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_ListBox.png "UI_ListBox")
![](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_ListBox-inactive.png "UI_ListBox inactive")

#### UI_MenuBar
See the menubar from the UI_Form

#### UI_Panel

#### UI_RadioBox
![radiobox](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_RadioBox.png "UI_RadioBox")

#### UI_Spinner
![spinner1](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_Spinner.png "UI_Spinner")
![spinner2](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_Spinner-disabled.png "UI_Spinner disabled")

#### UI_TabsPanel, UI_Tab
See the UI_Form

#### UI_TextBox
![textbox](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_TextBox.png "UI_TextBox")
![textbox1](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_TextBox-disabled.png "UI_TextBox disabled")
![textbox2](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_TextBox-password.png "UI_TextBox password")

#### UI_Tree
See UI_Tree_Grid

#### UI_Tree_Grid
![tree1](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_Tree_Grid.png "UI_TreeGrid")
![tree2](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_Tree_Grid-disabled.png "UI_TreeGrid disabled")

#### UI_PropertyGrid
![prop1](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_PropertyGrid.png "UI_PropertyGrid")


## Installation and usage.

### Prerequisites:
* Typescript - http://www.typescriptlang.org/
* NodeJS - https://nodejs.org/
* gnu make program (can be installed on Windows too)

### Quick start

* Make the framework reachable under a webserver, then from the command line:


    make resources  
    make demo



* Load in your browser the repository address

### Building framework:
    
    make

### Building framework resources:
    
    make resources

In order to be able to build resources, you will need the Image Magik package installed ( works on windows too ), with the "mogrify" tool available in your command line path.

### Generating documentation

**You will need a tool called "typedoc"**, which can be installed first by typing:
    
    make doc_install

**After** you have the "typedoc" installed, you can build the documentation by typing:
    
    make doc

### Generating the Constraint.d.ts declarations file

**You will need a tool called "dts-generator"**, which can be installed first by typing:
    
    make dts_install

**After** you have the "dts-generator" installed, you can build the documentation by typing:
    
    make dts

