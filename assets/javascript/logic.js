console.log(
    "LAZIUS" + "\n" +
    "VERSION 2.0" + "\n" +
    "BY NICHOLAS BERNHARD" + "\n" + "\u00A9 2019"
);

// EVENT LISTENER WRAPPER
document.addEventListener("DOMContentLoaded", function () {
    // GLOBAL VARIABLES START
    let database;
    let functionCurrentlyRunning = "standby";
    const arrayOfFunctionNames = ["add", "edit", "new", "search", "import",
        "param", "print", "commands"
    ];

    let keylogArray = [];

    // GLOBAL VARIABLES END

    // FUNCTIONS USED BY THE CORE COMMAND FUNCTIONS
    function getById(id) {
        return document.getElementById(id);
    };

    function userPrompt(messageForUser) {
        getById("userPrompt").innerHTML = messageForUser;
    };

    function printSomething(variable) {
        let arrayExportTextArea = document.createElement("TEXTAREA");
        arrayExportTextArea.id = "dbExport";
        let stringifiedArray = JSON.stringify(variable);
        arrayExportTextArea.value = stringifiedArray;
        getById("outputDiv").appendChild(arrayExportTextArea);
        getById("dbExport").select();
        document.execCommand("copy");
        getById("outputDiv").innerHTML = "";
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
        userPrompt("Error: No database exists, " + "<br>" +
            "Or there are no items in the database." + "<br>" +
            "A database must exist before printing to clipboard" +
            "<br>" +
            "Press Enter to Continue");
        functionCurrentlyRunning = "standby";
    };

    function displaySearchResults(searchResultsArray, parentFunction) {
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
            database.dataStructureArray.forEach(function (item) {
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
                tableCaptionTD.colSpan = database.dataStructureArray.length;
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
            database.dataStructureArray.forEach(function (param, index) {
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
        if (database !== undefined) {
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
                getById("input").disabled = true;
                getById("outputDiv").innerHTML = "";
                database = parsedTextArea;
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
                database.databaseArray.forEach(function (databaseItem) {
                    let matchCounter = 0;
                    arrayOfSearchObjectKeys.forEach(function (searchObjectItem) {
                        if (typeof databaseItem[searchObjectItem] === "string") {
                            console.log(true);
                            let dbItemLowerCase = databaseItem[searchObjectItem].toLowerCase();
                            let soItemLowerCase = searchObject[searchObjectItem].toLowerCase();
                            if (dbItemLowerCase.includes(soItemLowerCase)) {
                                matchCounter += 1;
                            }
                        } else {
                            if (databaseItem[searchObjectItem] === searchObject[searchObjectItem]) {
                                matchCounter += 1;
                            }
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
                        if (database.dataStructureArray[index].parameterInputType === "number") {
                            searchObject[database.dataStructureArray[index].parameterName] = parseInt(item);
                        } else {
                            searchObject[database.dataStructureArray[index].parameterName] = item;
                        }
                    }
                });
                searchFunction(searchObject);
            }
            buildSearchObject(database.bufferArray);
        }
        if ((database === undefined) || (database.databaseArray.length === 0)) {
            noDBErrorCatch();
        } else {
            if (input !== "functionLaunched") {
                database.bufferArray.push(input);
            }
            if (database.bufferArray.length < database.dataStructureArray.length) {
                if (database.dataStructureArray[database.bufferArray.length].parameterInputType === "number") {
                    getById("input").type = "number";
                    getById("input").select();
                    getById("input").addEventListener("keyup", listenForQuit);
                }
                userPrompt(database.dataStructureArray[database.bufferArray.length].parameterToDisplay + " to search for:");
            } else if (database.bufferArray.length === database.dataStructureArray.length) {
                getById("input").disabled = true;
                userPrompt("See search results below");
                searchFunctionChain(database.bufferArray);
            } else if (database.bufferArray.length > database.dataStructureArray.length) {
                database.bufferArray = [];
                getById("outputDiv").innerHTML = "";
                functionLauncher("search");
            }
        }
    }

    function showParameters() {
        functionCurrentlyRunning = "standby";
        let parameterUL = document.createElement("UL");
        parameterUL.classList.add("inlineList");
        database.dataStructureArray.forEach(function (parameter) {
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

        if (database.databaseArray.length === 0) {
            noDBErrorCatch();
        } else {
            getById("input").removeEventListener("keyup", listenForQuit);
            if (input === "functionLaunched") {
                getById("input").type = "number";
                getById("input").addEventListener("keyup", listenForQuit);
                userPrompt("Enter ID of item you wish to edit");
            } else {
                if ((getById("input").type === "number") && (database.bufferArray.length === 0)) {
                    if (input === "") {
                        functionLauncher("edit");
                    } else {
                        getById("input").removeEventListener("keyup", listenForQuit);
                        let idInput = parseInt(input);
                        getById("input").type = "input";
                        displaySearchResults([database.databaseArray[idInput - 1]], "edit");
                        edit("beginEditing");
                    }
                } else {
                    if (input !== "beginEditing") {
                        database.bufferArray.push(input);
                    }
                    if (database.bufferArray.length < (database.dataStructureArray.length - 1)) {
                        if (database.dataStructureArray[database.bufferArray.length].parameterInputType === "number") {
                            getById("input").type = "number";
                            getById("input").addEventListener("keyup", listenForQuit);
                        }
                        let editMessage = ", <br> or else, leave blank.";
                        userPrompt("Edit " + database.dataStructureArray[database.bufferArray.length].parameterToDisplay + editMessage);
                    } else if (database.bufferArray.length === (database.dataStructureArray.length - 1)) {
                        getById("input").type = "input";
                        getById("input").removeEventListener("keyup", listenForQuit);
                        getById("input").disabled = true;
                        database.bufferArray.push(input);
                        userPrompt("Entry complete.");

                        function applyEdits() {
                            let editedObjectId = parseInt(getById("searchResultID").innerHTML);
                            let comparisonArray = [];
                            let oldItem = JSON.stringify(database.databaseArray[editedObjectId - 1]);
                            comparisonArray.push(oldItem);
                            let editingObject = {};
                            database.bufferArray.forEach(function (item, index) {
                                if (item !== "") {
                                    if (database.dataStructureArray[index].parameterInputType === "number") {
                                        let objectArrayItem = parseInt(item);
                                        if (isNaN(objectArrayItem) || (objectArrayItem === undefined)) {
                                            objectArrayItem = 0;
                                        }
                                        editingObject[database.dataStructureArray[index].parameterName] = item;
                                    } else {
                                        editingObject[database.dataStructureArray[index].parameterName] = item;
                                    }
                                }
                            });
                            editingObject.id = editedObjectId;
                            Object.keys(editingObject).forEach(function (item) {
                                database.databaseArray[editedObjectId - 1][item] = editingObject[item];
                            });
                            let newItem = JSON.stringify(database.databaseArray[editedObjectId - 1]);
                            comparisonArray.push(newItem)
                            comparisonArray.forEach(function (item, index) {
                                comparisonArray[index] = JSON.parse(comparisonArray[index]);
                            });
                            getById("outputDiv").innerHTML = "";
                            displaySearchResults(comparisonArray, "editedItem");
                        }
                        applyEdits();
                    } else if (database.bufferArray.length > (database.dataStructureArray.length - 1)) {
                        database.bufferArray = [];
                        getById("outputDiv").innerHTML = "";
                        functionLauncher("edit");
                    }
                }
            }
        }
    };

    function printDatabase(input) {
        getById("input").disabled = false;
        if (input === "functionLaunched") {
            getById("input").disabled = true;
            functionCurrentlyRunning = "standby";
            if (database === undefined) {
                noDBErrorCatch();
            } else {
                printSomething(database);
                userPrompt("The current database has been copied to clipboard." +
                    "<br>" +
                    "You may now paste it into a text file and save it." +
                    "<br>" +
                    "Press Enter to Continue");
            }
        }
    };

    const dbParameterKeys = ["parameterName", "parameterToDisplay",
        "parameterNotes", "parameterInputType"
    ];
    let newDatabaseParameterArray = [];
    let databaseCreationArray = [];

    function newDB(input) {
        console.log("database creation array: ");
        console.log(databaseCreationArray);
        console.log("new database parameter array: ");
        console.log(newDatabaseParameterArray);
        getById("input").removeEventListener("keyup", listenForQuit);
        getById("input").type = "input";
        getById("input").disabled = false;

        function buildParameterObject(parameterObjectArray) {
            let parameterObject = {
                parameterName: parameterObjectArray[0],
                parameterToDisplay: parameterObjectArray[1],
                parameterNotes: parameterObjectArray[2],
                parameterInputType: parameterObjectArray[3],
            }
            databaseCreationArray.push(parameterObject);
        }

        function buildDatabase(inputArray) {
            let newDatabase = {
                name: inputArray[0],
                comments: inputArray[1],
                contactInfo: inputArray[2],
                dataStructureArray: [],
                databaseArray: [],
                bufferArray: [],
            };

            function buildDataStructureArray() {
                let i;
                for (i = 3; i < databaseCreationArray.length; i += 1) {
                    newDatabase.dataStructureArray.push(databaseCreationArray[i]);
                }
            }
            buildDataStructureArray();
            function addIdParameter() {
                let idParameter = {
                    parameterName: "id",
                    parameterToDisplay: "ID",
                    parameterNotes: "",
                    parameterInputType: "number"  
                }
                newDatabase.dataStructureArray.push(idParameter);
            }
            addIdParameter();
            let currentDate = new Date().toISOString();
            newDatabase.dateCreated = currentDate;
            console.log(newDatabase);
            let stringifiedNewDB = JSON.stringify(newDatabase);
            let parsedNewDB = JSON.parse(stringifiedNewDB);
            database = parsedNewDB;
            console.log(database);
        }

        if (database === undefined) {
            console.log("TRUE");
            if (databaseCreationArray.length === 0) {
                if (input === "functionLaunched") {
                    userPrompt("Name Of Database: ");
                } else if (input !== "functionLaunched") {
                    databaseCreationArray.push(input);
                    userPrompt("Add a comment about this database:");
                }
            } else if (databaseCreationArray.length === 1) {
                userPrompt("Add your contact info:");
                databaseCreationArray.push(input);
            } else if (databaseCreationArray.length === 2) {
                databaseCreationArray.push(input);
                newDB("beginAddingParameters");
            } else if (databaseCreationArray.length > 2) {
                if (input !== "beginAddingParameters") {
                    newDatabaseParameterArray.push(input);
                }
                if (newDatabaseParameterArray.length < dbParameterKeys.length) {
                    userPrompt("Add " + dbParameterKeys[newDatabaseParameterArray.length]);
                } else if (newDatabaseParameterArray.length === dbParameterKeys.length) {
                    userPrompt(
                        "Entry complete." + "<br>" +
                        "Type 'done' and hit Enter to finish." + "<br>" +
                        "Type anything else and hit Enter to add another parameter."
                    );
                    buildParameterObject(newDatabaseParameterArray);
                } else if (newDatabaseParameterArray.length > dbParameterKeys.length) {
                    newDatabaseParameterArray = [];
                    if (input.toLowerCase() === "done") {
                        buildDatabase(databaseCreationArray);
                        getById("input").disabled = true;
                        userPrompt(
                            "Database has been created." + "<br>" +
                            "Press enter to return to menu." + "<br>" +
                            "You may begin entering items, or export for later use."
                        );
                        functionCurrentlyRunning = "standby";
                    } else {
                        userPrompt("Add " + dbParameterKeys[newDatabaseParameterArray.length]);
                        getById("outputDiv").innerHTML = "";
                    }
                }
            }
        } else if (database.databaseArray.length > 0) {
            getById("input").disabled = true;
            userPrompt("You are already working with a database." +
                "<br>" +
                "If you would like to switch to another database," +
                "<br>" +
                "Save current database, reload page, and run import." +
                "<br>" +
                "Press Enter to Continue");
            functionCurrentlyRunning = "standby";
        }
    }

    function add(input) {
        getById("input").removeEventListener("keyup", listenForQuit);
        getById("input").type = "input";
        getById("input").disabled = false;

        function convertObjectArrayToObject() {
            let object = {};
            let i;
            for (i = 0; i < database.bufferArray.length - 1; i += 1) {
                if (database.dataStructureArray[i].parameterInputType === "number") {
                    let objectArrayItem = parseInt(database.bufferArray[i]);
                    if (isNaN(objectArrayItem) || (objectArrayItem === undefined)) {
                        objectArrayItem = 0
                    }
                    object[database.dataStructureArray[i].parameterName] = objectArrayItem;
                } else {
                    object[database.dataStructureArray[i].parameterName] = database.bufferArray[i];
                }
            }
            database.databaseArray.push(object);
            database.databaseArray[database.databaseArray.length - 1].id = database.databaseArray.length;
            displaySearchResults([object], "add");
        }
        if (database === undefined) {
            noDBErrorCatch();
        } else {
            if (input !== "functionLaunched") {
                database.bufferArray.push(input);
            }
            if (database.bufferArray.length < database.dataStructureArray.length) {
                userPrompt("Add " + database.dataStructureArray[database.bufferArray.length].parameterToDisplay + ":" + "<br>" + database.dataStructureArray[database.bufferArray.length].parameterNotes);
                if (database.dataStructureArray[database.bufferArray.length].parameterName === "quantity") {
                    getById("input").type = "number";
                    getById("input").value = "0";
                    getById("input").select();
                    getById("input").addEventListener("keyup", listenForQuit);
                    getById("input").min = "0";
                }
                if (database.dataStructureArray[database.bufferArray.length].parameterName === "id") {
                    getById("input").disabled = true;
                    userPrompt("ID Automatically added.");
                }
            } else if (database.bufferArray.length === database.dataStructureArray.length) {
                getById("input").disabled = true;
                database.bufferArray.push(input);
                userPrompt("Entry complete.");
                convertObjectArrayToObject();
            } else if (database.bufferArray.length > database.dataStructureArray.length) {
                database.bufferArray = [];
                getById("outputDiv").innerHTML = "";
                functionLauncher("add");
            }
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
        } else if (input === "new") {
            newDB("functionLaunched");
        }
    };

    function applyInputToFunction(input) {
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
        } else if (functionCurrentlyRunning === "new") {
            newDB(input);
        }
    };
    // CORE FUNCTION MANAGEMENT END

    // CORE INPUT LOGIC
    function coreInputLogic(input) {
        getById("input").value = "";
        getById("input").disabled = false;
        let functionIsRunning = (functionCurrentlyRunning !== "standby");

        function undoLogic() {
            database.bufferArray.pop();
            functionLauncher(functionCurrentlyRunning);
        }

        function quitLogic() {
            getById("input").value = "";
            database.bufferArray = [];
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
                printCommands();
            }
        }
    };
    // BUG REPORT FUNCTIONS
    function keylogger(input, maxKeylogArrayLength) {
        if (maxKeylogArrayLength !== "addOneMore") {
            maxKeylogArrayLength = 50;
        } else if (maxKeylogArrayLength === "addOneMore") {
            maxKeylogArrayLength = (maxKeylogArrayLength + 1)
        }
        keylogArray.push(input);
        if (keylogArray.length > maxKeylogArrayLength) {
            keylogArray.shift();
        }
    }

    function createBugReport() {
        keylogger("click", "add");
        printSomething(keylogArray);

        function bugReportAlertUser() {
            getById("bugReportUserAlert").classList.remove("black");
            getById("bugReportUserAlert").classList.add("black");
            setTimeout(function () {
                getById("bugReportUserAlert").classList.remove("black");
            }, 5000);
        }
        bugReportAlertUser();
    }
    // MAIN EVENT LISTENER
    function enterLogic() {
        if (event.key === "Enter") {
            let input = getById("input").value;
            keylogger(input);
            coreInputLogic(input);
            getById("input").focus();
        }
    }
    document.addEventListener("keyup", enterLogic);
    getById("bugReportButton").addEventListener("click", createBugReport);
    printCommands();
});


/* 
Things to add:
- Add new-database function (will take a while)

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