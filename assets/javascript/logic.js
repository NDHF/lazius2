console.log(
    "LAZIUS" + "\n" +
    "VERSION 2.0" + "\n" +
    "BY NICHOLAS BERNHARD" + "\n" + "\u00A9 2019"
);

// EVENT LISTENER WRAPPER
document.addEventListener("DOMContentLoaded", function () {
    // GLOBAL VARIABLES START
    let database = [];
    /*
        let database = {
            datastructureArray: [],
            databaseArray: [],
            bufferArray: []
        }
    */
    let objectArray = [];
    let functionCurrentlyRunning = "standby";
    let parameters = [{
            parameterName: "title",
            parameterToDisplay: "Title",
            parameterNotes: "Please place articles (the, a, an) at the end, " +
                "preceded by a comma.",
            parameterInputType: "input"
        },
        {
            parameterName: "authorLastName",
            parameterToDisplay: "Author, Last Name",
            parameterNotes: "",
            parameterInputType: "input"
        },
        {
            parameterName: "authorFirstName",
            parameterToDisplay: "Author, First Name",
            parameterNotes: "Place middle names after first name.",
            parameterInputType: "input"
        },
        {
            parameterName: "mediaType",
            parameterToDisplay: "Media Type",
            parameterNotes: "<i>e.g.</i> Book, Audiobook",
            parameterInputType: "input"
        },
        {
            parameterName: "category",
            parameterToDisplay: "Category",
            parameterNotes: "",
            parameterInputType: "input"
        },
        {
            parameterName: "subCategory",
            parameterToDisplay: "Sub-Category",
            parameterNotes: "",
            parameterInputType: "input"
        },
        {
            parameterName: "quantity",
            parameterToDisplay: "Quantity",
            parameterNotes: "",
            parameterInputType: "number"
        },
        {
            parameterName: "id",
            parameterToDisplay: "ID",
            parameterNotes: "",
            parameterInputType: "number"
        }
    ];
    let arrayOfFunctionNames = ["add", "edit", "new", "search", "import",
        "param", "print", "commands"
    ];
    // GLOBAL VARIABLES END

    // FUNCTIONS USED BY THE CORE COMMAND FUNCTIONS
    function getById(id) {
        return document.getElementById(id);
    };

    function userPrompt(messageForUser) {
        getById("userPrompt").innerHTML = messageForUser;
    };
    //     THIS FUNCTION ALLOWS USER TO QUIT WHEN A NUMBER-TYPE INPUT IS
    // BEING USED, WHILE ALSO LIMITING USER INPUT.
    function listenForQuit() {
        if (event.key === "q") {
            document.removeEventListener("keyup", enterLogic);
            getById("input").type = "input";
            getById("input").value = "q";
            getById("input").maxLength = "1";
        } else if ((event.key === "u") && (getById("input").value === "q")) {
            getById("input").value = "qu";
            getById("input").maxLength = "2";
        } else if ((event.key === "i") && (getById("input").value === "qu")) {
            getById("input").value = "qui";
            getById("input").maxLength = "3";
        } else if ((event.key === "t") && (getById("input").value === "qui")) {
            getById("input").value = "quit";
            getById("input").maxLength = "4";
            document.addEventListener("keyup", enterLogic);
        } else if (event.key === "Backspace") {
            getById("input").removeAttribute("maxLength");
            getById("input").type = "number";
            document.addEventListener("keyup", enterLogic);
        }
    }
    //     THIS FUNCTION WILL PREVENT A FUNCTION FROM RUNNING, IF THE FUNCTION
    // RELIES ON A DATABASE
    function noDBErrorCatch() {
        getById("input").disabled = true;
        userPrompt("Error: No database exists." +
            "<br>" +
            "A database must exist before printing to clipboard" +
            "<br>" +
            "Press Enter to Continue");
        functionCurrentlyRunning = "standby";
    };

    function displaySearchResults(searchResultsArray, parentFunction) {
        console.log("Made it here");
        let resultsHeader = document.createElement("H2");
        let numberOfResults = 0;
        if (parentFunction === "search") {
            if (searchResultsArray.length === 0) {
                numberOfResults = "Your search returned no results.";

            } else if (searchResultsArray.length === 1) {
                numberOfResults = "Your search returned one result.";
            } else {
                numberOfResults = ("Your search returned " +
                    searchResultsArray.length + " results.");
            }
        } else if (parentFunction === "add") {
            numberOfResults = "The following title was added to your database: ";
        } else if (parentFunction === "edit") {
            console.log("Made it here");
            numberOfResults = "Item Currently Being Edited";
        } else if (parentFunction === "editedItem") {
            numberOfResults = "Review Changes Below";
        }
        let numberOfResultsText = document.createTextNode(numberOfResults);
        resultsHeader.appendChild(numberOfResultsText);
        getById("outputDiv").appendChild(resultsHeader);
        let searchResultsTable = document.createElement("TABLE");
        if (searchResultsArray.length > 0) {
            let parametersTableRow = document.createElement("TR");
            parameters.forEach(function (item) {
                let parameterTH = document.createElement("TH");
                let parameterTHText = document.createTextNode(item.parameterToDisplay);
                parameterTH.appendChild(parameterTHText);
                parametersTableRow.appendChild(parameterTH);
            });
            searchResultsTable.appendChild(parametersTableRow);
        }
        searchResultsArray.forEach(function (searchResultItem, searchResultIndex) {
            if (parentFunction === "editedItem") {
                let tableCaptionRow = document.createElement("TR");
                tableCaptionRow.classList.add("captionRow");
                let tableCaptionTD = document.createElement("TD");
                tableCaptionRow.classList.add("center");
                tableCaptionTD.colSpan = parameters.length;
                let tableCaptionText;
                if (searchResultIndex === 0) {
                    tableCaptionText = document.createTextNode("BEFORE:");
                    tableCaptionTD.appendChild(tableCaptionText);
                    tableCaptionRow.appendChild(tableCaptionTD);
                    searchResultsTable.appendChild(tableCaptionRow);
                } else if (searchResultIndex === 1) {
                    tableCaptionText = document.createTextNode("AFTER:");
                    tableCaptionTD.appendChild(tableCaptionText);
                    tableCaptionRow.appendChild(tableCaptionTD);
                    searchResultsTable.appendChild(tableCaptionRow);
                }
            }
            let searchResultsTR = document.createElement("TR");
            if (parentFunction !== "editedItem") {
                searchResultsTR.id = "itemToBeEdited";
            }
            parameters.forEach(function (param, index) {
                let searchResultsTD = document.createElement("TD");
                if ((parentFunction === "editedItem") && (searchResultIndex === 1)) {
                    if (searchResultsArray[1][param.parameterName] !== searchResultsArray[0][param.parameterName]) {
                        searchResultsTD.classList.add("highlightRed");
                    }
                }
                if (param.parameterName === "id") {
                    searchResultsTD.id = "searchResultID";
                }
                let searchResultsTDText = document.createTextNode(searchResultItem[param.parameterName]);
                searchResultsTD.appendChild(searchResultsTDText);
                searchResultsTR.appendChild(searchResultsTD);
            });
            searchResultsTable.appendChild(searchResultsTR);
        });
        getById("outputDiv").appendChild(searchResultsTable);
    }
    // END

    // CORE COMMAND FUNCTIONS START
    function importDB(input) {
        if (database.length > 0) {
            getById("input").disabled = true;
            userPrompt("You are already working with a database." +
                "<br>" +
                "If you would like to switch to another database," +
                "<br>" +
                "Save current database, reload page, and run import." +
                "<br>" +
                "Press Enter to Continue");
            functionCurrentlyRunning = "standby";
        } else {
            if (input === "functionLaunched") {
                getById("input").disabled = true;
                let importTextArea = document.createElement("TEXTAREA");
                importTextArea.id = "importTextArea";
                getById("outputDiv").appendChild(importTextArea);
                getById("importTextArea").focus();
                userPrompt("Paste stringified JSON database below and hit 'Enter'");
            } else {
                let parsedTextArea = JSON.parse(getById("importTextArea").value);
                console.log(parsedTextArea);
                getById("input").disabled = true;
                getById("outputDiv").innerHTML = "";
                database = parsedTextArea;
                console.log(database);
                userPrompt("Database imported. Press 'Enter' to continue.");
                functionCurrentlyRunning = "standby";
            }
        }
    };

    function search(input) {
        getById("input").type = "input";
        getById("input").removeEventListener("keyup", listenForQuit);
        getById("input").disabled = false;

        function searchFunctionChain(objectArray) {
            function searchFunction(searchObject) {
                let searchResultsArray = [];
                let arrayOfSearchObjectKeys = Object.keys(searchObject);
                database.forEach(function (databaseItem) {
                    let matchCounter = 0;
                    arrayOfSearchObjectKeys.forEach(function (searchObjectItem) {
                        if (databaseItem[searchObjectItem] === searchObject[searchObjectItem]) {
                            matchCounter += 1;
                        }
                    });
                    if (matchCounter === arrayOfSearchObjectKeys.length) {
                        searchResultsArray.push(databaseItem);
                    }
                });
                displaySearchResults(searchResultsArray, "search");
            }

            function buildSearchObject(objectArray) {
                let searchObject = {};
                objectArray.forEach(function (item, index) {
                    if (item !== "") {
                        if (parameters[index].parameterInputType === "number") {
                            searchObject[parameters[index].parameterName] = parseInt(item);
                        } else {
                            searchObject[parameters[index].parameterName] = item;
                        }
                    }
                });
                searchFunction(searchObject);
            }
            buildSearchObject(objectArray);
        }
        if (database.length === 0) {
            noDBErrorCatch();
        } else {
            if (input !== "functionLaunched") {
                objectArray.push(input);
            }
            if (objectArray.length < parameters.length) {
                if (parameters[objectArray.length].parameterInputType === "number") {
                    getById("input").type = "number";
                    getById("input").select();
                    getById("input").addEventListener("keyup", listenForQuit);
                }
                userPrompt(parameters[objectArray.length].parameterToDisplay + " to search for:");
            } else if (objectArray.length === parameters.length) {
                getById("input").disabled = true;
                userPrompt("See console for search results");
                searchFunctionChain(objectArray);
            } else if (objectArray.length > parameters.length) {
                objectArray = [];
                getById("outputDiv").innerHTML = "";
                functionLauncher("search");
            }
        }
    }

    function showParameters() {
        functionCurrentlyRunning = "standby";
        let parameterUL = document.createElement("UL");
        parameterUL.classList.add("inlineList");
        parameters.forEach(function (parameter) {
            let parameterLI = document.createElement("LI");
            let parameterText = document.createTextNode(parameter.parameterToDisplay);
            parameterLI.appendChild(parameterText);
            parameterUL.appendChild(parameterLI);
        });
        getById("outputDiv").appendChild(parameterUL);
        userPrompt("Below are the parameters for the " +
            "current data structure." + "<br>" +
            "Please enter a function name to begin.");
    }

    function printCommands() {
        functionCurrentlyRunning = "standby";
        let commandArray = [{
                explanation: "Add to Inventory: ",
                name: "add"
            },
            {
                explanation: "Edit an item: ",
                name: "edit"
            },
            {
                explanation: "Search inventory: ",
                name: "search"
            },
            {
                explanation: "Import an existing inventory: ",
                name: "Import"
            },
            {
                explanation: "Show list of inventory parameters: ",
                name: "param"
            },
            {
                explanation: "Print inventory To clipboard: ",
                name: "print"
            },
            {
                explanation: "Undo last entry: ",
                name: "undo"
            },
            {
                explanation: "Quit current function: ",
                name: "quit"
            }
        ];
        let commandHeading = document.createElement("H2");
        commandHeadingText = document.createTextNode("Available Commands:");
        commandHeading.appendChild(commandHeadingText);
        getById("outputDiv").appendChild(commandHeading);
        let commandTable = document.createElement("TABLE");
        commandArray.forEach(function (item) {
            let commandTR = document.createElement("TR");
            let explanationTD = document.createElement("TD");
            explanationTD.classList.add("alignRight");
            explanationTDText = document.createTextNode(item.explanation);
            explanationTD.appendChild(explanationTDText);
            commandTR.appendChild(explanationTD);
            let nameTD = document.createElement("TD");
            nameTDText = document.createTextNode(item.name);
            nameTD.appendChild(nameTDText);
            commandTR.appendChild(nameTD);
            commandTable.appendChild(commandTR);
        });
        getById("outputDiv").appendChild(commandTable);
    };

    function edit(input) {

        if (database.length === 0) {
            noDBErrorCatch();
        } else {
            getById("input").removeEventListener("keyup", listenForQuit);
            if (input === "functionLaunched") {
                getById("input").type = "number";
                getById("input").addEventListener("keyup", listenForQuit);
                userPrompt("Enter ID of item you wish to edit");
            } else {
                if ((getById("input").type === "number") && (objectArray.length === 0)) {
                    if (input === "") {
                        functionLauncher("edit");
                    } else {
                        getById("input").removeEventListener("keyup", listenForQuit);
                        let idInput = parseInt(input);
                        getById("input").type = "input";
                        displaySearchResults([database[idInput - 1]], "edit");
                        edit("beginEditing");
                    }
                } else {
                    if (input !== "beginEditing") {
                        objectArray.push(input);
                    }
                    if (objectArray.length < (parameters.length - 1)) {
                        if (parameters[objectArray.length].parameterInputType === "number") {
                            getById("input").type = "number";
                            getById("input").addEventListener("keyup", listenForQuit);
                        }
                        let editMessage = ", <br> or else, leave blank.";
                        userPrompt("Edit " + parameters[objectArray.length].parameterToDisplay + editMessage);
                    } else if (objectArray.length === (parameters.length - 1)) {
                        getById("input").type = "input";
                        getById("input").removeEventListener("keyup", listenForQuit);
                        getById("input").disabled = true;
                        objectArray.push(input);
                        userPrompt("Entry complete.");

                        function applyEdits() {
                            let editedObjectId = parseInt(getById("searchResultID").innerHTML);
                            let comparisonArray = [];
                            let oldItem = JSON.stringify(database[editedObjectId - 1]);
                            comparisonArray.push(oldItem);
                            let editingObject = {};
                            objectArray.forEach(function (item, index) {
                                if (item !== "") {
                                    if (parameters[index].parameterInputType === "number") {
                                        editingObject[parameters[index].parameterName] = parseInt(item);
                                    } else {
                                        editingObject[parameters[index].parameterName] = item;
                                    }
                                }
                            });
                            editingObject.id = editedObjectId;
                            Object.keys(editingObject).forEach(function (item) {
                                database[editedObjectId - 1][item] = editingObject[item];
                            });
                            let newItem = JSON.stringify(database[editedObjectId - 1]);
                            comparisonArray.push(newItem)
                            comparisonArray.forEach(function (item, index) {
                                comparisonArray[index] = JSON.parse(comparisonArray[index]);
                            });
                            getById("outputDiv").innerHTML = "";
                            displaySearchResults(comparisonArray, "editedItem");
                        }
                        applyEdits();
                    } else if (objectArray.length > (parameters.length - 1)) {
                        objectArray = [];
                        getById("outputDiv").innerHTML = "";
                        functionLauncher("edit");
                    }
                }
            }
        }
    }

    function printDatabase(input) {
        getById("input").disabled = false;
        if (input === "functionLaunched") {
            getById("input").disabled = true;
            functionCurrentlyRunning = "standby";
            if (database.length === 0) {
                noDBErrorCatch();
            } else {
                let dbExportTextArea = document.createElement("TEXTAREA");
                dbExportTextArea.id = "dbExport";
                let stringifiedDB = JSON.stringify(database);
                dbExportTextArea.value = stringifiedDB;
                getById("outputDiv").appendChild(dbExportTextArea);
                getById("dbExport").select();
                document.execCommand("copy");
                getById("outputDiv").innerHTML = "";
                userPrompt("The current database has been copied to clipboard." +
                    "<br>" +
                    "You may now paste it into a text file and save it." +
                    "<br>" +
                    "Press Enter to Continue");
            }
        }
    }

    function add(input) {
        getById("input").removeEventListener("keyup", listenForQuit);
        getById("input").type = "input";
        getById("input").disabled = false;

        function convertObjectArrayToObject() {
            let object = {};
            let i;
            for (i = 0; i < objectArray.length - 1; i += 1) {
                if (parameters[i].parameterInputType === "number") {
                    object[parameters[i].parameterName] = parseInt(objectArray[i]);
                } else {
                    object[parameters[i].parameterName] = objectArray[i];
                }
            }
            database.push(object);
            database[database.length - 1].id = database.length;
            displaySearchResults([object], "add");
        }
        if (input !== "functionLaunched") {
            objectArray.push(input);
        }
        if (objectArray.length < parameters.length) {
            userPrompt("Add " + parameters[objectArray.length].parameterToDisplay + ":");
            if (parameters[objectArray.length].parameterName === "quantity") {
                getById("input").type = "number";
                getById("input").value = "0";
                getById("input").select();
                getById("input").addEventListener("keyup", listenForQuit);
                getById("input").min = "0";
            }
            if (parameters[objectArray.length].parameterName === "id") {
                getById("input").disabled = true;
                userPrompt("ID Automatically added.");
            }
        } else if (objectArray.length === parameters.length) {
            getById("input").disabled = true;
            objectArray.push(input);
            userPrompt("Entry complete.");
            convertObjectArrayToObject();
        } else if (objectArray.length > parameters.length) {
            objectArray = [];
            getById("outputDiv").innerHTML = "";
            functionLauncher("add");
        }
    };
    // CORE COMMAND FUNCTIONS END

    // CORE FUNCTION MANAGEMENT START
    function functionLauncher(input) {
        getById("outputDiv").innerHTML = "";
        if (input === "add") {
            add("functionLaunched");
        } else if (input === "search") {
            search("functionLaunched");
        } else if (input === "param") {
            showParameters();
        } else if (input === "print") {
            printDatabase("functionLaunched");
        } else if (input === "edit") {
            edit("functionLaunched");
        } else if (input === "import") {
            importDB("functionLaunched");
        } else if (input === "commands") {
            printCommands();
        }
    };

    function applyInputToFunction(input) {
        console.log("function running at applyInputToFunction: " + functionCurrentlyRunning);
        if (functionCurrentlyRunning === "add") {
            add(input);
        } else if (functionCurrentlyRunning === "search") {
            search(input);
        } else if (functionCurrentlyRunning === "print") {
            printDatabase(input);
        } else if (functionCurrentlyRunning === "edit") {
            edit(input);
        } else if (functionCurrentlyRunning === "import") {
            importDB(input);
        }
    };
    // CORE FUNCTION MANAGEMENT END

    // CORE INPUT LOGIC
    function coreInputLogic(input) {
        getById("input").value = "";
        getById("input").disabled = false;
        let functionIsRunning = (functionCurrentlyRunning !== "standby");

        function undoLogic() {
            objectArray.pop();
            functionLauncher(functionCurrentlyRunning);
        }

        function quitLogic() {
            getById("input").value = "";
            objectArray = [];
            functionCurrentlyRunning = "standby";
            getById("input").removeEventListener("keyup", listenForQuit);
            getById("input").removeAttribute("maxLength");
            userPrompt("Please enter a function name to begin");
            printCommands();
        }
        if (functionIsRunning) {
            let inputIsUndo = (input === "undo");
            let inputIsQuit = (input === "quit");
            let inputIsUndoOrQuit = (inputIsUndo || inputIsQuit);
            if (inputIsUndoOrQuit) {
                if (inputIsUndo) {
                    undoLogic();
                } else if (inputIsQuit) {
                    quitLogic();
                }
            } else if (!inputIsUndoOrQuit) {
                applyInputToFunction(input);
            }
        } else if (!functionIsRunning) {
            if (arrayOfFunctionNames.includes(input)) {
                functionCurrentlyRunning = input;
                functionLauncher(input);
            } else {
                userPrompt("Please enter a function name to begin");
            }
        }
    };
    // MAIN EVENT LISTENER
    function enterLogic() {
        if (event.key === "Enter") {
            console.log("function running at keyup: " + functionCurrentlyRunning);
            let input = getById("input").value;
            coreInputLogic(input);
            getById("input").focus();
        }
    }
    document.addEventListener("keyup", enterLogic);
    printCommands();
});


/* 
Things to add:
- Add new-database function (will take a while)
- Place data structure (parameters) inside database. 

- Parameters I would like:
    - Title
    - Author, Last Name
    - Author, First Name
    - Category
    - Media Type
        - Book
        - Audiobook, CD
        - Audiobook, Cassette
    - Read
        - Yes
        - No
    - Location

*/