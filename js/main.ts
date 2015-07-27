/* {$R ./vendor/rsvp/rsvp.js} */

/// <reference path="Global.ts" />

/// <reference path="types.ts" />

/// <reference path="es6-promise.d.ts" />

/// <reference path="Mixin.ts" />

/// <reference path="Utils.ts" />

/// <reference path="Constraint.ts" />
/// <reference path="Constraint/Token.ts" />
/// <reference path="Constraint/Token/Or.ts" />
/// <reference path="Constraint/Flow.ts" />
/// <reference path="Constraint/Scope.ts" />
/// <reference path="Constraint/Enum.ts" />
/// <reference path="Constraint/Type.ts" />

/// <reference path="$I.ts" />

/// <reference path="UI/Resource.ts" />
/// <reference path="UI/Resource/File.ts" />
/// <reference path="UI/Sprite.ts" />

/// <reference path="UI/Dom.ts" />
/// <reference path="UI/Color.ts" />
/// <reference path="UI/Event.ts" />
/// <reference path="UI/Throttler.ts" />
/// <reference path="UI.ts" />

/// <reference path="Mixins/MFocusable.ts" />
/// <reference path="Mixins/MRowInterface.ts" />

/// <reference path="Store.ts" />
/// <reference path="Store/Strings.ts" />
/// <reference path="Store/Objects.ts" />
/// <reference path="Store/NamedObjects.ts" />
/// <reference path="Store/NestedObjects.ts" />
/// <reference path="Store/View.ts" />
/// <reference path="Store/View/Tree.ts" />

/// <reference path="Store/Item.ts" />
/// <reference path="Store/Item/String.ts" />
/// <reference path="Store/Item/Object.ts" />
/// <reference path="Store/Item/NamedObject.ts" />
/// <reference path="Store/Item/NestableObject.ts" />

/// <reference path="UI/Anchor.ts" />
/// <reference path="UI/Anchor/Form.ts" />
/// <reference path="UI/Padding.ts" />
/// <reference path="UI/Canvas/ContextMapper.ts" />
/// <reference path="UI/Screen.ts" />
/// <reference path="UI/Screen/Window.ts" />
/// <reference path="UI/DialogManager.ts" />

/// <reference path="UI/Form.ts" />
/// <reference path="UI/Label.ts" />
/// <reference path="UI/Button.ts" />
/// <reference path="UI/CheckBox.ts" />
/// <reference path="UI/RadioBox.ts" />
/// <reference path="UI/Canvas.ts" />
/// <reference path="UI/ListBox.ts" />
/// <reference path="UI/TabsPanel.ts" />
/// <reference path="UI/Tab.ts" />
/// <reference path="UI/VerticalSplitter.ts" />
/// <reference path="UI/HorizontalSplitter.ts" />
/// <reference path="UI/Panel.ts" />
/// <reference path="UI/MenuBar.ts" />
/// <reference path="UI/MenuItem.ts" />
/// <reference path="UI/Tree.ts" />
/// <reference path="UI/Tree/Grid.ts" />
/// <reference path="UI/Column.ts" />

// ADD DEFAULT RESOURCE FILES

UI_Resource.addResourceFile( "Constraint", "/resources/Constraint.res" );

// Delimiter to remove the constraint runtime from it's makefiles.
var ____END_OF_STUB____ = undefined;