document.addEventListener("DOMContentLoaded", function () {
    let database = [];
    let objectArray = [];
    let functionCurrentlyRunning = "standby";
    let parameters = ["title", "authorLastName", "authorFirstName", 
    "mediaType", "category", "description"];
    let param2 = [
        {
            parameterName: "title",
            parameterToDisplay: "Title",
            parameterNotes: "Please place articles (the, a, an) at the end, " + 
            "preceded by a comma.",
            parameterInputType: "input"
        }
    ]
    function getById(id) {
        return document.getElementById(id);
    }
    function userPrompt(messageForUser) {
        getById("userPrompt").innerHTML = messageForUser;
    }
    function functionLauncher(input) {
        if (input === "add") {
            console.log("input is add");
            add("functionLaunched");
        } else if (input === "search") {
            console.log("input is search");
            search("functionLaunched");
        }
    }
    function applyInputToFunction(input) {
        if (functionCurrentlyRunning === "add") {
            add(input);
        } else if (functionCurrentlyRunning === "search") {
            search(input);
        }
    }
    function add(input) {
        getById("input").disabled = false;
        function convertObjectArrayToObject() {
            let object = {};
            let i;
            for (i = 0; i < objectArray.length - 1; i += 1) {
                object[parameters[i]] = objectArray[i];
            }
            database.push(object);
            database[database.length - 1].id = database.length;
            console.log(database);
            objectArray = [];
            console.log(objectArray);
        }
        if (input !== "functionLaunched") {
            objectArray.push(input);
        }
        if (objectArray.length < parameters.length) {
            userPrompt("Add " + parameters[objectArray.length] + ":");
        } else if (objectArray.length === parameters.length) {
            getById("input").disabled = true;
            userPrompt("Entry complete.");
        } else if (objectArray.length > parameters.length) {
            convertObjectArrayToObject();
            functionLauncher("add");
        }
    }
    function search(input) {
        getById("input").disabled = false;
        function searchFunctionChain(objectArray) {
            function displaySearchResults(searchResultsArray) {
                console.log(searchResultsArray);
                let resultsHeader = document.createElement("H2");
                let numberOfResults = 0;
                if (searchResultsArray.length === 0) {
                    numberOfResults = "Your search returned no results.";
                } else if (searchResultsArray.length === 1) {
                    numberOfResults = "Your search returned one result.";
                } else {
                    numberOfResults = ("Your search returned " + 
                    searchResultsArray.length + " results.");
                }
                let numberOfResultsText = document.createTextNode(numberOfResults);
                resultsHeader.appendChild(numberOfResultsText);
                getById("outputDiv").appendChild(resultsHeader);
                let searchResultsTable = document.createElement("TABLE");
                let parametersTableRow = document.createElement("TR");
                parameters.forEach(function (item, index) {
                    let parameterTH = document.createElement("TH");
                    let parameterTHText = document.createTextNode(item);
                    parameterTH.appendChild(parameterTHText);
                    parametersTableRow.appendChild(parameterTH);
                    if (index === (parameters.length - 1)) {
                        let idTH = document.createElement("TH");
                        let idTHText = document.createTextNode("ID");
                        idTH.appendChild(idTHText);
                        parametersTableRow.appendChild(idTH);
                    }
                });
                searchResultsTable.appendChild(parametersTableRow);
                searchResultsArray.forEach(function (searchResultItem) {
                    let searchResultsTR = document.createElement("TR");
                    parameters.forEach(function (param, index) {
                        let searchResultsTD = document.createElement("TD");
                        let searchResultsTDText = document.createTextNode(searchResultItem[param]);
                        searchResultsTD.appendChild(searchResultsTDText);
                        searchResultsTR.appendChild(searchResultsTD);
                        if (index === (parameters.length - 1)) {
                            let idTD = document.createElement("TD");
                            let idTDText = document.createTextNode(searchResultItem.id);
                            idTD.appendChild(idTDText);
                            searchResultsTR.appendChild(idTD);
                        }
                    });
                    searchResultsTable.appendChild(searchResultsTR);
                });
                getById("outputDiv").appendChild(searchResultsTable);
            }
            function searchFunction(searchObject) {
                let searchResultsArray = [];
                let arrayOfSearchObjectKeys = Object.keys(searchObject);
                console.log("search object keys:");
                console.log(arrayOfSearchObjectKeys);
                database.forEach(function (databaseItem) {
                    let matchCounter = 0;
                    arrayOfSearchObjectKeys.forEach(function (searchObjectItem) {
                        if (databaseItem[searchObjectItem] === searchObject[searchObjectItem]) {
                            matchCounter += 1;
                        }
                    });
                    if (matchCounter === arrayOfSearchObjectKeys.length) {
                        console.log("we got a match");
                        searchResultsArray.push(databaseItem);
                    }
                });
                displaySearchResults(searchResultsArray, searchObject);
            }
            function buildSearchObject(objectArray) {
                let searchObject = {};
                objectArray.forEach(function (item, index) {
                    if (item !== "") {
                        searchObject[parameters[index]] = item;
                    }
                });
                console.log(searchObject);
                searchFunction(searchObject);
            }
            buildSearchObject(objectArray);
        }
        if (input !== "functionLaunched") {
            objectArray.push(input);
        }
        console.log(objectArray);
        if (objectArray.length < parameters.length) {
            userPrompt(parameters[objectArray.length] + " to search for:");
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
    function coreInputLogic(input) {
        let functionIsCurrentlyRunning = (functionCurrentlyRunning !== "standby");
        let arrayOfFunctionNames = ["add", "edit", "new", 
        "search", "import", "export"];
        if (functionIsCurrentlyRunning) {
            let inputIsUndo = (input === "undo");
            let inputIsQuit = (input === "quit");
            let inputIsUndoOrQuit = (inputIsUndo || inputIsQuit);
            if (inputIsUndoOrQuit) {
                if (inputIsUndo) {
                    undoLogic();
                } else if (inputIsQuit) {
                    functionCurrentlyRunning = "standby";
                    objectArray = [];
                    userPrompt("Please enter a function name to begin");
                }
            } else if (!inputIsUndoOrQuit) {
                applyInputToFunction(input);
            }
        } else if (!functionIsCurrentlyRunning) {
            if (arrayOfFunctionNames.includes(input)) {
                functionCurrentlyRunning = input;
                functionLauncher(input);
            } else {
                userPrompt("Please enter a function name to begin");
            }
        }
    }

    document.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            let input = getById("input").value;
            coreInputLogic(input);
            getById("input").value = "";
        }
    });
});

/* 

Possible Inputs:
- A function name
- Quit
- Undo
- A function property

Functions:
- add to inventory
- edit inventory
- search inventory
- create an inventory

data structure:

database = [
    dataStructure: {},
    data: [contains objects],
    buffer: [array of data]
];

*/