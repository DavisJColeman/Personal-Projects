document.addEventListener('DOMContentLoaded', function() {

    const gridContainer = document.getElementById('grid-container');
    const clicked = 'darkgray';
    const unclicked = 'white';
    const mouseOver = 'lightblue';
    // gameIndex: 2d array representing the letters on the board, and to record clicks for changing color
    let gameIndex = new Array(18);
    // Create an 18x18 grid
    for (let row = 0; row < 18; ++row) {
        gameIndex[row] = new Array(18);
        for (let column = 0; column < 18; ++column) {
            const gridItem = document.createElement('div');
            const curRandomLetter = generateRandomLetter();
            gridItem.className = 'grid-item';
            gridItem.dataset.row = row;
            gridItem.dataset.col = column;
            gridItem.textContent = curRandomLetter;
            gameIndex[row][column] = [unclicked, curRandomLetter, gridItem]; // [color, letter, div-reference]

            gridItem.addEventListener('click', function() {
                gridItem.style.backgroundColor = gameIndex[row][column][0] === clicked ? unclicked : clicked;
                gameIndex[row][column][0] = gameIndex[row][column][0] === clicked ? unclicked : clicked;
            });
            
            gridItem.addEventListener('mouseover', function() {
                gridItem.style.backgroundColor = gameIndex[row][column][0] === clicked ? clicked : mouseOver;
            });

            gridItem.addEventListener('mouseout', function() {
                // white is unclicked and mouse not over, lightgray is clicked and mouse not over, and lightblue is mouse over
                gridItem.style.backgroundColor = gameIndex[row][column][0];
            });
            gridContainer.appendChild(gridItem);
        }
    }
    let words = getRandomWordList();
    let wordPositions = calculateWordPositions(words, gameIndex);
    for (let i = 0; i < wordPositions.length; ++i) {
        document.getElementById("word-bank").textContent += "(" + (i + 1) + ")  " + words[i] + ",   ";
        //document.getElementById("answer-key").textContent += (i + 1) + ". [" + wordPositions[i].row + ",";
        //document.getElementById("answer-key").textContent += wordPositions[i].column + ",";
        //document.getElementById("answer-key").textContent += wordPositions[i].direction + ",";
        //document.getElementById("answer-key").textContent += wordPositions[i].length + "],    ";
    }
    for (let i = 0; i < wordPositions.length; ++i) {
        insertWord(wordPositions[i].word, wordPositions[i].direction, wordPositions[i].row, wordPositions[i].column, gameIndex, isFinal=true);
    }
});

/*
Algorithm to Calculate Random Positions for Words in Word Search

Input:
    - words: Array of words to be placed on the word search grid
    - gameIndex: 2D array representing the game board

Output:
    - wordPositions: Array of objects containing word positions (word, row, column, direction, length)

(1) - Start with one word. Get the length of that word.
(2) - Choose a random set of coordinates on the board. This will be the location of the first letter of the word.
(3) - Choose a random direction the word will be written in from the list of possible directions.
(4) - Using the set of coordinates and the direction, determine if the word will fit on the board with this location and orientation.
(5) - If the word will fit on the board, then place it on the board, and continue to step 6. If not, return to step 2.

(6) - The first word is placed on the board, now on to the hard part. First, get another word, and get new random coordinates and direction.
(7) - Determine if this placement and orientation will fit the word on the board, AND if this placement/orientation would conflict with the placement of ALL previously placed words.
(8) - If yes to both conditions in (7), return to step 6 and continue with the remaining words. If not, return to step 6 and try again with this word.

Done!
*/
function calculateWordPositions(words, gameIndex) {
    let attempts = 0;
    let successCount = 0;
    let wordPositions = new Array();
    let tempGameIndex = generateTempGameIndex(gameIndex, false);

    while (successCount < words.length && attempts < 10000) {
        let randomStart = getRandomStart(); // {"row": number, "column": number, "direction": string}
        let curWord = words[successCount];
        let wordCanFit = wordFitsOnBoard(curWord, randomStart["row"], randomStart["column"], randomStart["direction"]);
        if (wordCanFit) {
            if (successCount === 0) {
            // For the first word, check if it fits and add to wordPositions
                wordPositions[successCount] = {
                    word: curWord,
                    row: randomStart["row"], 
                    column: randomStart["column"], 
                    direction: randomStart["direction"], 
                    length: curWord.length
                };
                tempGameIndex = insertWord(curWord, randomStart["direction"], randomStart["row"], randomStart["column"], tempGameIndex, isFinal=false);
                //console.log(wordPositions);
                successCount += 1;
            } else {
            // For subsequent words, check if they fit without conflicts
                let wordDoesFit = wordsDoNotConflict(curWord, wordPositions, randomStart["row"], randomStart["column"], randomStart["direction"], tempGameIndex, isFinal=false);
                if (wordDoesFit) {
                    wordPositions[successCount] = {
                        word: curWord,
                        row: randomStart["row"], 
                        column: randomStart["column"], 
                        direction: randomStart["direction"], 
                        length: curWord.length
                    };
                    tempGameIndex = insertWord(curWord, randomStart["direction"], randomStart["row"], randomStart["column"], tempGameIndex, isFinal=false);
                    successCount += 1;
                } else {
                    const directions = getDirectionList();
                    for (let i = 0; i < directions.length; ++i) {
                        wordCanFit = wordFitsOnBoard(curWord, randomStart["row"], randomStart["column"], directions[i]);
                        if (!wordCanFit) {
                            continue;
                        }
                        wordDoesFit = wordsDoNotConflict(curWord, wordPositions, randomStart["row"], randomStart["column"], directions[i], tempGameIndex);
                        if (wordDoesFit) {
                            wordPositions[successCount] = {
                                word: curWord,
                                row: randomStart["row"], 
                                column: randomStart["column"], 
                                direction: directions[i], 
                                length: curWord.length
                            };
                            tempGameIndex = insertWord(curWord, directions[i], randomStart["row"], randomStart["column"], tempGameIndex, isFinal=false);
                            successCount += 1;
                            break;
                        }
                    }
                }
            }
        }
        attempts += 1;
    }
    if (successCount < words.length) {
        console.log("ERROR: unable to calculate word positions");
    }
    return wordPositions;
}

// Checks that the word does not run off the board with this orientation
function wordFitsOnBoard(word, row, col, direction) {
    let doesFit = true;
    switch (direction) {
        case 'left-right':
            doesFit = !(col + word.length > 18);
            break;
        case 'right-left':
            doesFit = !(col - word.length < 0);
            break;
        case 'up-down':
            doesFit = !(row + word.length > 18);
            break;
        case 'down-up':
            doesFit = !(row - word.length < 0);
            break;
        case 'downLeft-upRight':
            doesFit = !(col + word.length > 18) && !(row - word.length < 0);
            break;
        case 'downRight-upLeft':
            doesFit = !(col - word.length < 0) && !(row - word.length < 0);
            break;
        case 'upRight-downLeft':
            doesFit = !(col - word.length < 0) && !(row + word.length > 18);
            break;
        case 'upLeft-downRight':
            doesFit = !(col + word.length > 18) && !(row + word.length > 18);
            break;
    }
    return doesFit;
}

/*
word: string
wordPositions: [starting letter row, starting letter column, direction, length of word]
row: number
col: number
direction: string
tempGameIndex: tempGameIndex
*/
function wordsDoNotConflict(word, wordPositions, row, col, direction, tempGameIndex) {
    let doNotConflict = true; // set the return value to TRUE as default
    const wordArray = word.split('');
    const letterPositions = getLetterPositions(wordPositions);
    //console.log(letterPositions);
    let cell = tempGameIndex[row][col];

    for (let i = 0; i < wordArray.length; ++i) { // for every letter in the word we are testing,
        switch (direction) {
            case 'left-right':
                cell = tempGameIndex[row][col + i];
                break;
            case 'right-left':
                cell = tempGameIndex[row][col - i];
                break;
            case 'up-down':
                cell = tempGameIndex[row + i][col];
                break;
            case 'down-up':
                cell = tempGameIndex[row - i][col];
                break;
            case 'downLeft-upRight':
                cell = tempGameIndex[row - i][col + i];
                break;
            case 'downRight-upLeft':
                cell = tempGameIndex[row - i][col - i];
                break;
            case 'upRight-downLeft':
                cell = tempGameIndex[row + i][col - i];
                break;
            case 'upLeft-downRight':
                cell = tempGameIndex[row + i][col + i];
                break;
        }
        if (wordArray[i] !== cell[0]) { // if the letter on the board does not match the current letter of the word,
            /*
            Check the positions of every letter of every word on the board thus far, which is calculated and given in letterPositions. 
            If any of these are the same position as the current cell, that means there is a conflict and we need to restart the process 
            of placing the current word on the board. 
            */
            for (let j = 0; j < letterPositions.length; ++j) {
                doNotConflict = !letterPositions[j].positions.some(pos => pos[0] === cell[1] && pos[1] === cell[2]);
                if (!doNotConflict) {
                    console.log(letterPositions[j]);
                    return false;
                }
            }
        }
    }
    return doNotConflict;
}

function getLetterPositions(wordPositions) {
    let letterPositions = Array(wordPositions.length); // letterPositions = [{ word: "word" positions: Array[num[]] }]
    for (let index = 0; index < wordPositions.length; ++index) {
        let curWord = wordPositions[index].word;
        let curLength = wordPositions[index].length;
        letterPositions[index] = {
            word: curWord,
            positions: Array(curLength)
        };
        let row = wordPositions[index].row;
        let col = wordPositions[index].column;
        for (let i = 0; i < curLength; ++i) {
            switch (wordPositions[index].direction) {
                case 'left-right':
                    letterPositions[index].positions[i] = [row, col + i];
                    break;
                case 'right-left':
                    letterPositions[index].positions[i] = [row, col - i];           
                    break;
                case 'up-down':
                    letterPositions[index].positions[i] = [row + i, col];
                    break;
                case 'down-up':
                    letterPositions[index].positions[i] = [row - i, col];                
                    break;
                case 'downLeft-upRight':
                    letterPositions[index].positions[i] = [row - i, col + i];                
                    break;
                case 'downRight-upLeft':
                    letterPositions[index].positions[i] = [row - i, col - i];                
                    break;
                case 'upRight-downLeft':
                    letterPositions[index].positions[i] = [row + i, col - i];                
                    break;
                case 'upLeft-downRight':
                    letterPositions[index].positions[i] = [row + i, col + i];                
                    break;
            }
        }
    }
    return letterPositions;
}

/*
word: the word being inserted from the word list into the word search
direction: the direction the word will be written in from the starting position
startRow: row number where the first letter will be inserted
startCol: column number where the first letter will be inserted
gameIndex: 2D array representing the gameboard

left-right: row not changing, column increasing
right-left: row not changing, column decreasing
up-down:    row increasing, column not changing
down-up:    row decreasing, column not changing
downLeft-upRight: row decreasing, column increasing 
downRight-upLeft: row decreasing, column decreasing 
upRight-downLeft: row increasing, column decreasing
upLeft-downRight: row increasing, column increasing
*/
function insertWord(word, direction, startRow, startCol, gameIndex, isFinal) { // Insert a single word onto the game board
    const wordArray = word.split('');
    let cell = gameIndex[startRow][startCol];
    let rowCount = startRow;
    let colCount = startCol;
    for (let i = 0; i < word.length; ++i) {
        switch (direction) {
            case 'left-right':
                cell = gameIndex[startRow][startCol + i];
                colCount += 1;
                break;
            case 'right-left':
                cell = gameIndex[startRow][startCol - i];
                colCount -= 1;
                break;
            case 'up-down':
                cell = gameIndex[startRow + i][startCol];
                rowCount += 1;
                break;
            case 'down-up':
                cell = gameIndex[startRow - i][startCol];
                rowCount -= 1;
                break;
            case 'downLeft-upRight':
                cell = gameIndex[startRow - i][startCol + i];
                rowCount -= 1;
                colCount += 1;
                break;
            case 'downRight-upLeft':
                cell = gameIndex[startRow - i][startCol - i];
                rowCount -= 1;
                colCount -= 1;
                break;
            case 'upRight-downLeft':
                cell = gameIndex[startRow + i][startCol - i];
                rowCount += 1;
                colCount -= 1;
                break;
            case 'upLeft-downRight':
                cell = gameIndex[startRow + i][startCol + i];
                rowCount += 1;
                colCount += 1;
                break;
        }
        if (isFinal) {
            //cell[0] = 'lightgreen';
            cell[1] = wordArray[i];
            cell[2].textContent = wordArray[i];
            //cell[2].style.backgroundColor = 'lightgreen';
        } else {
            cell[0] = wordArray[i];
            cell[1] = rowCount;
            cell[2] = colCount;
        }
    }
    if (!isFinal) {
        return gameIndex;
    }
}

function getRandomNum(upperBound) {
    return Math.floor(Math.random() * upperBound);
}

function generateRandomLetter() {
    let randomNum = getRandomNum(26) + 65;
    let randomLetter = String.fromCharCode(randomNum);
    return randomLetter;
}

function getDirectionList() {
    const directionList = ["left-right", "right-left", "up-down", "down-up", "downLeft-upRight", "downRight-upLeft", "upRight-downLeft", "upLeft-downRight"];
    return directionList;
}

function getRandomDirection() {
    const directionList = getDirectionList();
    let direction = directionList[getRandomNum(8)];
    return direction;
}

function getRandomStart() {
    let randomStart = {
        row: getRandomNum(18),
        column: getRandomNum(18),
        direction: getRandomDirection()
    }
    return randomStart;
}

function generateTempGameIndex(gameIndex, isFinal) {
    let tempGameIndex = new Array(18);
    for (let i = 0; i < 18; ++i) {
        tempGameIndex[i] = new Array(18);
        for (let j = 0; j < 18; ++j) {
            if (isFinal) {
                tempGameIndex[i][j] = gameIndex[i][j];
            } else {
                tempGameIndex[i][j] = [gameIndex[i][j][1], i, j]; // letter, row, column
            }
        }
    }
    return tempGameIndex;
}

function getRandomWordList() {
    let randomNum = 0;
    let newWordList = [];
    let numList = [];
    const allWordsList = getFullWordList();
    while (newWordList.length < 10) {
        randomNum = getRandomNum(allWordsList.length);
        while (numList.includes(randomNum)) {
            randomNum = getRandomNum(allWordsList.length);
        }
        newWordList.push(allWordsList[randomNum]);
        numList.push(randomNum);
    }
    return newWordList;
}

function getRandomWord() {
    const wordList = getFullWordList();
    const randomNum = getRandomNum(wordList.length);
    const randomWord = wordList[randomNum];
    return randomWord;
}

function getFullWordList() {
    let allWordsList = [
        "OCEAN",
        "LANDSCAPE",
        "ATLANTIC",
        "ARCTIC",
        "BLACKBEARD",
        "NAVIGATE",
        "EXPLORER",
        "VOYAGE",
        "MARINER",
        "SEAFARER",
        "NAUTICAL",
        "SUBMARINE",
        "SEABED",
        "AQUATIC",
        "DEEPSEA",
        "ANCHOR",
        "EXPEDITION",
        "JOURNEY",
        "QUEST",
        "MARITIME",
        "NAVAL",
        "FRONTIER",
        "CAPTAIN",
        "SAILOR",
        "TIDAL",
        "SHIPWRECK",
        "TREASURE",
        "CORALREEF",
        "WHALESONG",
        "CARTOGRAPHY",
        "CREW",
        "SEAGULL",
        "BRIGANTINE",
        "PLUNGE",
        "TITANIC",
        "DEEPBLUE",
        "UNDERWATER",
        "SEALIFE",
        "SEAWORTHY",
        "GALLEON",
        "SURF",
        "MARINE",
        "SHORELINE",
        "PACIFIC",
        "SIREN",
        "FLOAT",
        "SURFBOARD",
        "LIFEPRESERVER",
        "WATERCRAFT",
        "BUBBLES",
        "FISHERY",
        "SHIPMATE",
        "DISCOVERY",
        "EXPLORATION",
        "BREAKWATER",
        "STAR",
        "TITAN",
        "KRONOS",
        "GALAXY",
        "ASTRONOMY",
        "COSMIC",
        "CELESTIAL",
        "GALACTIC",
        "METEOR",
        "EXPLORATION",
        "OUTERWORLD",
        "STARFARING",
        "NEBULA",
        "QUASAR",
        "TELESCOPE",
        "EXOBIOTIC",
        "INTERSTELLAR",
        "POSEIDON",
        "ATMOSPHERE",
        "ENTERPRISE",
        "STARLIGHT",
        "CONQUER",
        "SPACETIME",
        "COMPASS"
    ];
    return allWordsList;
}