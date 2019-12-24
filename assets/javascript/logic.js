console.log(
    "LAZIUS" + "\n" +
    "VERSION 2.1" + "\n" +
    "BY NICHOLAS BERNHARD \n" +
    "\u00A9 2019 BERNHARD MUSEUM SERVICES, LLC"
);

// EVENT LISTENER WRAPPER
document.addEventListener("DOMContentLoaded", function () {
    // GLOBAL VARIABLES START
    let database;
    let functionCurrentlyRunning = "standby";
    const arrayOfFunctionNames = [
        "add", "edit", "search", "import", "param",
        "print", "commands", "delete", "newdb", "editdb",
        "last", "all"
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
            "or there are no items in the database." + "<br>" +
            "A database must exist before printing to clipboard" +
            "<br>" +
            "Press Enter to Continue");
        functionCurrentlyRunning = "standby";
    };

    function displaySearchResults(searchResultsArray, parentFunction) {
        let resultsHeader = document.createElement("H2");
        resultsHeader.id = "resultsHeader";
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
            numberOfResults = "The following title was " +
                "added to your database: ";
        } else if (parentFunction === "edit") {
            numberOfResults = "Item Currently Being Edited";
        } else if (parentFunction === "editedItem") {
            numberOfResults = "Review Changes Below";
        } else if (parentFunction === "last") {
            numberOfResults = "LAST ENTRY:";
        } else if (parentFunction === "all") {
            numberOfResults = "DISPLAYING ALL ENTRIES:";
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

                function displayComparisonTableRow(beforeOrAfter) {
                    tableCaptionText = document.createTextNode(beforeOrAfter);
                    tableCaptionTD.appendChild(tableCaptionText);
                    tableCaptionRow.appendChild(tableCaptionTD);
                    searchResultsTable.appendChild(tableCaptionRow);
                }
                if (searchResultIndex === 0) {
                    displayComparisonTableRow("BEFORE:");
                } else if (searchResultIndex === 1) {
                    displayComparisonTableRow("AFTER:");
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
        // getById("outputDiv").innerHTML = "";
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
                let textOrStoragePrompt = prompt("Importing from text or storage?");
                if (((textOrStoragePrompt !== "text") && (textOrStoragePrompt !== "storage")) || (textOrStoragePrompt === null)) {
                    functionCurrentlyRunning = "standby";
                    printCommands();
                } else if (textOrStoragePrompt.toLowerCase() === "text") {
                    let pasteTextDB = prompt("Paste the stringified JSON table here:");
                    if (pasteTextDB === null) {
                        getById("input").disabled = false;
                        printCommands();
                    } else {
                        let parsedTextArea = JSON.parse(pasteTextDB);
                        getById("input").disabled = true;
                        getById("outputDiv").innerHTML = "";
                        database = parsedTextArea;
                        localStorage.setItem(database.name, JSON.stringify(database));
                        alert("Saved to local storage as " + database.name);
                        userPrompt("Database imported. Press 'Enter' to continue.");
                        showLastEntry("last");
                        functionCurrentlyRunning = "standby";
                    }
                } else if (textOrStoragePrompt === "storage") {
                    let getDBByNamePrompt = prompt("Enter name of database in storage:");
                    if (getDBByNamePrompt === null) {
                        functionCurrentlyRunning = "standby";
                        printCommands();
                    } else {
                        if (localStorage.getItem(getDBByNamePrompt) === null) {
                            alert("No database by that name was found in storage.");
                            functionCurrentlyRunning = "standby";
                            printCommands();
                        } else {
                            getById("input").disabled = true;
                            getById("outputDiv").innerHTML = "";
                            database = JSON.parse(localStorage.getItem(getDBByNamePrompt));
                            userPrompt("Database " + getDBByNamePrompt + " imported. Press 'Enter' to continue.");
                            showLastEntry("last");
                            functionCurrentlyRunning = "standby";
                        }
                    }
                }
            }
        }
    };

    function search(input) {
        getById("input").type = "input";
        getById("input").removeEventListener("keyup", listenForQuit);
        getById("input").disabled = false;

        function searchFunctionChain() {
            function searchFunction(searchObject) {
                let searchResultsArray = [];
                let arrayOfSearchObjectKeys = Object.keys(searchObject);
                database.databaseArray.forEach(function (databaseItem) {
                    let matchCounter = 0;
                    arrayOfSearchObjectKeys.forEach(function (searchObjectItem) {
                        if (typeof databaseItem[searchObjectItem] === "string") {
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
                            searchObject[database.dataStructureArray[index].parameterName] = parseFloat(item);
                        } else {
                            searchObject[database.dataStructureArray[index].parameterName] = item;
                        }
                    }
                });
                let noLength = (Object.keys(searchObject).length === 0);
                let searchObjectIsEmpty = (noLength && searchObject.constructor === Object);
                if (searchObjectIsEmpty) {
                    let noSearchHeader = document.createElement("H2");
                    let noSearchHeaderText = document.createTextNode("You didn't search for anything.");
                    noSearchHeader.appendChild(noSearchHeaderText);
                    getById("outputDiv").appendChild(noSearchHeader);
                } else {
                    searchFunction(searchObject);
                }
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
                userPrompt(database.dataStructureArray[database.bufferArray.length].parameterToDisplay +
                    " to search for:");
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

    function buildListInOutputDiv(arrayOfThingsToPrint, itemKey, showParametersMode) {
        let valuesAlreadyDisplayed = [];
        let parameterUL = document.createElement("UL");
        parameterUL.classList.add("inlineList");
        arrayOfThingsToPrint.forEach(function (item) {
            let itemProperty = item[itemKey];

            function buildLI() {
                let li = document.createElement("LI");
                let liText = document.createTextNode(item[itemKey]);
                li.appendChild(liText);
                parameterUL.appendChild(li);
            }
            if (showParametersMode === "showParametersMode") {
                buildLI();
            } else {
                if (valuesAlreadyDisplayed.includes(itemProperty) === false) {
                    valuesAlreadyDisplayed.push(itemProperty);
                    buildLI();
                }
            }
        });
        if (valuesAlreadyDisplayed.length === 0) {
            let nothingToShowli = document.createElement("LI");
            let nothingToShowliText = document.createTextNode("Nothing to show yet.");
            nothingToShowli.appendChild(nothingToShowliText);
            parameterUL.appendChild(nothingToShowli);
        }
        // CLEAR OUTPUT DIV FIRST
        getById("outputDiv").innerHTML = "";
        getById("outputDiv").appendChild(parameterUL);
    }

    function showParameters() {
        if (database === undefined) {
            noDBErrorCatch();
        } else {
            functionCurrentlyRunning = "standby";
            buildListInOutputDiv(database.dataStructureArray, "parameterToDisplay");
            userPrompt("Below are the parameters for the " +
                "current data structure." + "<br>" +
                "Please enter a function name to begin.");
        }
    }

    function printCommands() {
        functionCurrentlyRunning = "standby";
        let commandArray = [{
                explanation: "Add to database: ",
                name: "add"
            },
            {
                explanation: "Edit an item: ",
                name: "edit"
            },
            {
                explanation: "Search database: ",
                name: "search"
            },
            {
                explanation: "Undo last entry: ",
                name: "undo"
            },
            {
                explanation: "Quit current function: ",
                name: "quit"
            },
            {
                explanation: "Import an existing database: ",
                name: "import"
            },
            {
                explanation: "Show list of database parameters: ",
                name: "param"
            },
            {
                explanation: "Show last entry in database:",
                name: "last"
            },
            {
                explanation: "Show all entries in database:",
                name: "all"
            },
            {
                explanation: "Print database to clipboard:",
                name: "print"
            },
            {
                explanation: "Create a new database:",
                name: "newdb"
            },
            {
                explanation: "Edit a database's parameters:",
                name: "editdb"
            },
            {
                explanation: "Delete current database:",
                name: "delete"
            }
        ];
        let commandHeading = document.createElement("H2");
        commandHeadingText = document.createTextNode("Available Commands:");
        commandHeading.appendChild(commandHeadingText);
        getById("outputDiv").appendChild(commandHeading);
        let commandTable = document.createElement("TABLE");
        commandTable.id = "commandTable";
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
        if ((database === undefined) || (database.databaseArray.length === 0)) {
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
                        let editMessage = ", <br> or else, leave blank.";
                        userPrompt("Edit " +
                            database.dataStructureArray[database.bufferArray.length].parameterToDisplay +
                            editMessage);
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
                                        let objectArrayItem = parseFloat(item);
                                        if (isNaN(objectArrayItem) || (objectArrayItem === undefined)) {
                                            objectArrayItem = 0;
                                        }
                                        editingObject[database.dataStructureArray[index].parameterName] = objectArrayItem;
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
                        // THIS SAVES THE DATABASE TO LOCAL STORAGE
                        let dbName = database.name;
                        localStorage.setItem(dbName, JSON.stringify(database));
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
                // THIS SAVES THE DATABASE TO LOCAL STORAGE
                // let dbName = database.name;
                // localStorage.setItem(dbName, JSON.stringify(database));
                // let dbFromStorage = localStorage.getItem(dbName);
                printSomething(database);
                userPrompt("The current database has been copied to clipboard." +
                    "<br>" +
                    "You may now paste it into a text file and save it." +
                    "<br>" +
                    "Press Enter to Continue");
            }
        }
    };

    function createDatabase() {
        function checkForRequiredInputs() {
            let databaseNameInput = getById("databaseNameInput").value;
            let paramNameInputs = Array.from(document.getElementsByClassName("parameterNameInput"));
            let paramToDisplayInputs = Array.from(document.getElementsByClassName("parameterToDisplayInput"));
            let requiredInputArray = [databaseNameInput].concat(paramNameInputs, paramToDisplayInputs);
            let missingInputCounter = 0;

            function inputArrayItemCheck(item, index) {
                if (index === 0) {
                    if (item.trim() === "") {
                        missingInputCounter += 1;
                    }
                } else if (index > 0) {
                    if (item.value.trim() === "") {
                        missingInputCounter += 1;
                    }
                }
            }
            requiredInputArray.forEach(inputArrayItemCheck);
            if (missingInputCounter > 0) {
                let inputMissingMessage = "YOU ARE MISSING REQUIRED INPUTS. " +
                    "PLEASE MAKE SURE ALL REQUIRED FIELDS ARE FILLED OUT;"
                alert(inputMissingMessage);
            } else {
                checkBeforePopulating();
            }
        }

        function checkBeforePopulating() {
            let warningBeforePopulatingDB = "Are you sure you want to " +
                "save this database?";
            let finalCheckBeforePopulating = confirm(warningBeforePopulatingDB);
            if (finalCheckBeforePopulating === true) {
                populateDatabaseObject();
            }
            closeDBEditingPage();
        }

        function populateDatabaseObject() {
            let databaseObject = {
                name: getById("databaseNameInput").value,
                comments: getById("databaseCommentsInput").value,
                contactInfo: getById("databaseContactInfoInput").value,
                dataStructureArray: [],
                databaseArray: [],
                bufferArray: [],
                dateCreated: new Date().toISOString()
            }
            let parametersArray = Array.from(document.getElementsByClassName("dbParameterDiv"));

            function addToDataStructureArray(parameterDiv) {
                let dataStructureArrayObject = {
                    parameterName: parameterDiv.children[2].children[1].value,
                    parameterToDisplay: parameterDiv.children[3].children[1].value,
                    parameterNotes: parameterDiv.children[4].children[1].value
                };

                let inputTypeOption = parameterDiv.children[5].children[1];
                let selectedInputType = parameterDiv.children[5].children[1][inputTypeOption.selectedIndex].value;
                dataStructureArrayObject.parameterInputType = selectedInputType;

                let showPriorValuesOption = parameterDiv.children[6].children[1];
                let showPriorValuesSelectedOption = parameterDiv.children[6].children[1][showPriorValuesOption.selectedIndex].value;
                dataStructureArrayObject.parameterAutoComplete = showPriorValuesSelectedOption;

                databaseObject.dataStructureArray.push(dataStructureArrayObject);
            }
            parametersArray.forEach(addToDataStructureArray);

            function addIDObject() {
                let idObject = {
                    parameterName: "id",
                    parameterToDisplay: "ID",
                    parameterNotes: "",
                    parameterInputType: "number",
                    parameterAutoComplete: "no"
                }
                databaseObject.dataStructureArray.push(idObject);
            }
            addIDObject();
            // SAVE TO LOCAL STORAGE
            let dbNameFromEditingWindow = databaseObject.name;
            localStorage.setItem(dbNameFromEditingWindow, JSON.stringify(databaseObject));
            database = JSON.parse(localStorage.getItem(dbNameFromEditingWindow));
        }
        checkForRequiredInputs();
    }

    function databaseEditingLiaison(input) {
        if (database !== undefined) {
            let warningMessage = "WARNING: placeholder " +
                "Press YES to continue, press NO to cancel.";

            function createWarningPopUp() {
                let warningPopUp = confirm(warningMessage);
                if (warningPopUp === true) {
                    databaseEditingLogic(input);
                } else if (warningPopUp === false) {
                    functionCurrentlyRunning = "standby";
                    printCommands();
                }
            }
            if (input === "newdb") {
                warningMessage = warningMessage.replace("placeholder",
                    "You are already working with an existing database. " +
                    "Creating a new database will delete the old one. "
                );
                createWarningPopUp();
            } else if (input === "editdb") {
                warningMessage = warningMessage.replace("placeholder",
                    "You are about to edit your database's parameters. " +
                    "This may change the performance of your database. "
                );
                createWarningPopUp();
            }
        } else if (database === undefined) {
            if (input === "newdb") {
                databaseEditingLogic(input);
            } else if (input === "editdb") {
                noDBErrorCatch();
            }
        }
    }

    function toggleLogic() {
        let elementIDsToToggle = ["container", "dbEditingPage", "footer"];

        function toggleElementById(item) {
            if (getById(item).classList.contains("active")) {
                getById(item).classList.remove("active");
                getById(item).classList.add("standby");
            } else if (getById(item).classList.contains("standby")) {
                getById(item).classList.remove("standby");
                getById(item).classList.add("active");
            }
        }
        elementIDsToToggle.forEach(toggleElementById);
    }

    function closeDBEditingPage() {
        let dbParamDivs = document.getElementsByClassName("dbParameterDiv");
        let dbParamDivsArray = Array.from(dbParamDivs);

        function removeAllButFirstParamDiv(item, index) {
            if (index > 0) {
                item.parentNode.removeChild(item);
            }
        }
        dbParamDivsArray.forEach(removeAllButFirstParamDiv);
        getById("addNewParamButton").removeEventListener("click", addNewParameterDiv);
        document.addEventListener("keyup", enterLogic);
        getById("dbEditingCloseDiv").removeEventListener("click", closeDBEditingPage);
        toggleLogic();
        printCommands();
        getById("input").select();
    }

    function addNewParameterDiv() {
        let dbParameterDiv = document.getElementsByClassName("dbParameterDiv")[0];
        let dbEditingContainer = getById("dbEditingContainer");
        let dbParameterDivClone = dbParameterDiv.cloneNode(true);
        dbParameterDivClone.children[2].children[1].value = "";
        dbParameterDivClone.children[3].children[1].value = "";
        dbParameterDivClone.children[4].children[1].value = "";
        dbParameterDivClone.children[5].children[1].selectedIndex = 0;
        dbParameterDivClone.children[6].children[1].selectedIndex = 0;
        dbEditingContainer.appendChild(dbParameterDivClone);
    }

    function databaseEditingLogic(input) {
        toggleLogic();
        document.removeEventListener("keyup", enterLogic);
        getById("dbEditingCloseDiv").addEventListener("click", closeDBEditingPage);
        getById("saveParametersButton").addEventListener("click", createDatabase);

        getById("addNewParamButton").addEventListener("click", addNewParameterDiv);

        if (input === "newdb") {
            getById("dbEditingPageHeader").innerHTML = "CREATE A NEW DATABASE";
        } else if (input === "editdb") {
            getById("dbEditingPageHeader").innerHTML = "DATABASE EDITOR";

            function visualizeDataStructureArray() {
                getById("databaseNameInput").value = database.name;
                getById("databaseCommentsInput").value = database.comments;
                getById("databaseContactInfoInput").value = database.contactInfo;

                function visualizeStructureArrayItems(dataStructureItem, index) {
                    let notID = dataStructureItem.parameterName !== "id"
                    if ((index > 0) && (notID)) {
                        addNewParameterDiv();
                    }
                    if (notID) {
                        let currentDBParameterDiv = document.getElementsByClassName("dbParameterDiv")[index];
                        currentDBParameterDiv.children[2].children[1].value = dataStructureItem.parameterName;
                        currentDBParameterDiv.children[3].children[1].value = dataStructureItem.parameterToDisplay;
                        currentDBParameterDiv.children[4].children[1].value = dataStructureItem.parameterNotes;
                        currentDBParameterDiv.children[5].children[1].value = dataStructureItem.parameterInputType;
                        currentDBParameterDiv.children[6].children[1].value = dataStructureItem.parameterAutoComplete;
                    }
                }
                database.dataStructureArray.forEach(visualizeStructureArrayItems);
            }
            visualizeDataStructureArray();
        }
    }

    function deleteDB(input) {
        if (input === "functionLaunched") {
            userPrompt(
                "You are about to delete your database." + "<br>" +
                "Please consider making a backup." + "<br>" +
                "Press Y to continue, press N to cancel"
            );
        } else if (input !== "functionLaunched") {
            if ((input.toLowerCase() !== "y") && (input.toLowerCase() !== "n")) {
                getById("input").value = "";
            } else {
                if (input.toLowerCase() === "n") {
                    functionCurrentlyRunning = "standby";
                    userPrompt("Please enter a function name");
                } else if (input.toLowerCase() === "y") {
                    database = undefined;
                    functionCurrentlyRunning = "standby";
                    userPrompt(
                        "The database has been deleted." + "<br>" +
                        "Please enter a function name."
                    );
                }
            }
        }
    }

    function add(input) {
        getById("input").removeEventListener("keyup", listenForQuit);
        getById("input").type = "input";
        getById("input").disabled = false;

        function convertObjectArrayToObject() {
            let object = {};

            function loopThroughBufferArray(item, index) {
                if (index < (database.bufferArray.length - 1)) {
                    if (database.dataStructureArray[index].parameterInputType === "number") {
                        let objectArrayItem = parseFloat(item);
                        if (isNaN(objectArrayItem) || objectArrayItem === undefined) {
                            objectArrayItem = 0;
                        }
                        object[database.dataStructureArray[index].parameterName] = objectArrayItem;
                    } else {
                        object[database.dataStructureArray[index].parameterName] = item;
                    }
                }
            };
            database.bufferArray.forEach(loopThroughBufferArray);
            let itemAlreadyExists = false;
            let idOfExistingItem = 0;
            function seeIfItAlreadyExists(newlyBuiltObject) {
                let newlyBuiltObjectToArray = Object.values(newlyBuiltObject);
                function checkObjectAgainstDatabase(objectInDatabaseArray) {
                    objectInDatabaseArrayToArray = Object.values(objectInDatabaseArray);
                    let mismatchCounter = 0;
                    function checkAgainstObjectValues(item, index) {
                        // console.log(item);
                        // console.log(objectInDatabaseArrayToArray[index]);
                        let notLastItem = (index < newlyBuiltObjectToArray.length - 1);
                        let theyDoNotMatch = ((item !== objectInDatabaseArrayToArray[index]));
                        if (notLastItem && theyDoNotMatch) {
                            mismatchCounter += 1;
                        }
                    }
                    newlyBuiltObjectToArray.forEach(checkAgainstObjectValues);
                    console.log(mismatchCounter);
                    if (mismatchCounter === 0) {
                        itemAlreadyExists = true;
                    }
                }
                database.databaseArray.forEach(checkObjectAgainstDatabase);
            }
            seeIfItAlreadyExists(object);
            function addItemToDatabase() {
                database.databaseArray.push(object);
                database.databaseArray[database.databaseArray.length - 1].id = database.databaseArray.length;
                displaySearchResults([object], "add");
            }
            if (itemAlreadyExists) {
                let matchDetectedMessage = "Probable match detected: " + 
                "Item " + idOfExistingItem + 
                "\n" +
                "\n" +
                "Do you want to add it anyway?";
                let itemExistsButAddAnywayConfirm = confirm(matchDetectedMessage);
                if (itemExistsButAddAnywayConfirm === false) {
                    userPrompt(
                        "Cancelled." +
                        "<br>" +
                        "Please enter function name to begin."
                    );
                    getById("input").disabled = false;
                    functionCurrentlyRunning = "standby";
                    printCommands();
                } else {
                    addItemToDatabase();
                }
            } else {
                addItemToDatabase();
            }
        }
        if (database === undefined) {
            noDBErrorCatch();
        } else {
            if (input !== "functionLaunched") {
                database.bufferArray.push(input);
            }
            if (database.bufferArray.length < database.dataStructureArray.length) {
                let paramToDisplay = database.dataStructureArray[database.bufferArray.length].parameterToDisplay;
                let paramNotes = database.dataStructureArray[database.bufferArray.length].parameterNotes;
                userPrompt("Add " + paramToDisplay + ":" + "<br>" + paramNotes);
                if (database.dataStructureArray[database.bufferArray.length].parameterAutoComplete === "yes") {
                    function findPastAutocompleteValues(paramName) {
                        buildListInOutputDiv(database.databaseArray, paramName);
                    }
                    findPastAutocompleteValues(database.dataStructureArray[database.bufferArray.length].parameterName);
                }
                if (database.dataStructureArray[database.bufferArray.length].parameterName === "id") {
                    getById("input").disabled = true;
                    getById("input").value = "";
                    getById("outputDiv").innerHTML = "";
                    userPrompt("ID Automatically added.");
                }
            } else if (database.bufferArray.length === database.dataStructureArray.length) {
                getById("input").disabled = true;
                database.bufferArray.push(input);
                userPrompt("Entry complete.");
                convertObjectArrayToObject();
            } else if (database.bufferArray.length > database.dataStructureArray.length) {
                database.bufferArray = [];
                // THIS SAVES THE LATEST ENTRY TO LOCAL STORAGE
                let dbName = database.name;
                localStorage.setItem(dbName, JSON.stringify(database));
                getById("outputDiv").innerHTML = "";
                functionLauncher("add");
            }
        }
    };

    function showLastEntry(lastOrAll) {
        if (database === undefined) {
            noDBErrorCatch();
        } else if (database.databaseArray.length === 0) {
            getById("outputDiv").innerHTML = "There are no entries in the database.";
        } else if (database.databaseArray.length > 0) {
            if (lastOrAll === "last") {
                displaySearchResults([database.databaseArray[database.databaseArray.length - 1]], "last");
                functionCurrentlyRunning = "standby";
            } else if (lastOrAll === "all") {
                displaySearchResults(database.databaseArray, "all");
                functionCurrentlyRunning = "standby";
            }
        }
    }

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
        } else if (input === "delete") {
            deleteDB("functionLaunched");
        } else if ((input === "newdb") || (input === "editdb")) {
            databaseEditingLiaison(input);
        } else if ((input === "last") || (input === "all")) {
            showLastEntry(input);
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
        } else if (functionCurrentlyRunning === "delete") {
            deleteDB(input);
        }
    };
    // CORE FUNCTION MANAGEMENT END

    // CORE INPUT LOGIC
    function coreInputLogic(input) {
        getById("input").value = "";
        getById("input").disabled = false;
        let functionIsRunning = (functionCurrentlyRunning !== "standby");

        function undoLogic() {
            if (functionCurrentlyRunning === "edit") {
                database.bufferArray = [];
            } else {
                database.bufferArray.pop();
            }
            functionLauncher(functionCurrentlyRunning);
        }

        function quitLogic() {
            getById("input").value = "";
            getById("outputDiv").innerHTML = "";
            database.bufferArray = [];
            functionCurrentlyRunning = "standby";
            getById("input").removeEventListener("keyup", listenForQuit);
            getById("input").removeAttribute("maxLength");
            userPrompt("Please enter a function name to begin.");
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
                getById("outputDiv").innerHTML = "";
                userPrompt("Please enter a function name to begin.");
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
            alert("Bug Report copied to clipboard.");
        }
        bugReportAlertUser();
        printCommands();
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