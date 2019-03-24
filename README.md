# Lazius 2.1 

## OVERVIEW

Lazius is an inventory management program running in a browser, designed for rapid data entry. All input is done via the keyboard. There are no forms or drop-down menus. Once one item has been added to the inventory, the user can begin entering the next one.

## UPDATES FROM VERSION 1

- Users can now search for an item using any combination of parameters. In version 1, users could use a maximum of two parameters when searching. 
- Users can create their inventory's data structure (what properties items will have) within the program itself. In version 1, data structures had to be created and modified in the source code. 
- Users can set an item's property to be either a string, like "432aaaa", or a number. In version one, only strings were used.
- All of an item's properties, except its ID, can be edited. In version 1, only an item's quantity could be edited.
- Version 1 required user's initials for many functions. This has been removed for lack of utility. The new-inventory function gives users the option to enter their contact information, if need be.
- Users can now generate a bug report, in the form of a keylog.

#### TECHNICAL UPDATES

- No jQuery was used for version 2. 
- In version 1, all functions had their own output areas, which were shown and hidden based on user input. This has been replaced with a single output area.

## DESIGN PRINICPLES

- Limited user input
- Restricted use of global variables
- Self-documentation

### FUNCTION HIERARCHY

Version 2 uses a clearer flow of input.

- A core input logic function, which decides what to do with the input based on its value, and what function is currently running. This function is triggered by hitting the 'Enter' key.
- Two functions that apply the input to one of the core functions.
- The core functions for working with an inventory: new, add, search, and edit. 
- Functions shared by the core functions, such as one to display search results. 

## FEATURES

### INVENTORY CREATION

The user can design their own inventory, with any parameters they so desire, using the "new" function.

### EDITING

All of an item's properties, except its ID, can be edited using the "edit" function. After editing is complete, the changes made to the item are displayed in the results section for the user to review. 

### INVENTORY ITEM ID

After an item has been created for the inventory, it is assigned an id using an auto-increment function. These IDs are required to edit an item's properties. 

### DEBUGGING

The user's most-recent inputs are stored in a keylog. In the event of an error in the system, this keylog can be printed and reviewed for debugging.

## OFFLINE USE

Lazius is designed for offline work. A database can be imported from stringified JSON in a text file, or exported in the same way.

## UPCOMING FEATURES

- Auto-complete.
- Editing an existing data-structure. 
- Check if a similar item already exists in the inventory. 
- Alternatives to "DOMContentLoaded", possibly document.readyState


