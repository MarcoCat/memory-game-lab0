// This code was developed with the assistance of ChatGPT

// Button class defines button properties and methods
class Button {
    constructor(id, label, widthEm, heightEm, left, top) {
        this.id = id;
        this.label = label;
        this.widthEm = widthEm;
        this.heightEm = heightEm;
        this.left = left; // Initial left position passed as parameter
        this.top = top;   // Initial top position passed as parameter
        this.element = this.createButton();
        this.setPosition(this.left, this.top); // Set initial position
    }

    // Creates the button element with style
    createButton() {
        const btn = document.createElement('button');
        btn.classList.add('game-button');
        btn.id = this.id;
        btn.innerText = this.label;
        btn.style.backgroundColor = this.getRandomColor();
        btn.style.width = `${this.widthEm}em`;
        btn.style.height = `${this.heightEm}em`;
        btn.style.position = 'absolute'; // Set position to absolute from the start
        return btn;
    }

    // Generates a random color for the button
    getRandomColor() {
        const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
        return randomColor;
    }

    // Set button position based on provided left and top
    setPosition(left, top) {
        this.left = left;
        this.top = top;
        this.element.style.left = `${left}px`;
        this.element.style.top = `${top}px`;
    }

    hideNumber() {
        this.element.innerText = ''; // Hide the number
    }

    showNumber() {
        this.element.innerText = this.label; // Show the number again
    }
}

// Game class handles game logic
class Game {
    constructor(uiManager) {
        this.buttons = [];
        this.originalOrder = [];
        this.numButtons = 0;
        this.uiManager = uiManager;

        // Button size in em
        this.buttonWidthEm = 10;
        this.buttonHeightEm = 5;
    }

    // Convert em to pixels
    emToPixels(em) {
        return em * parseFloat(getComputedStyle(document.documentElement).fontSize);
    }

    // Start the game with the given number of buttons
    startGame(numButtons) {
        this.numButtons = numButtons;
        this.resetGame();
        this.createButtons();
        // Hide the "Go" button when the game starts
        document.getElementById('startButton').style.display = 'none';

        // Start shuffling buttons after delay
        setTimeout(() => {
            this.scrambleButtons(numButtons);
        }, numButtons * 1000); // Delay based on number of buttons
    }

    // Reset the game area and clear old buttons
    resetGame() {
        const gameArea = document.getElementById('gameArea');
        gameArea.innerHTML = ''; // Clear old buttons
        this.buttons = [];
        this.originalOrder = [];
    }

    // Create buttons and position them initially in rows
    createButtons() {
        const gameArea = document.getElementById('gameArea');
        const gameAreaWidth = gameArea.offsetWidth;
        const buttonWidth = this.emToPixels(this.buttonWidthEm);
        const buttonHeight = this.emToPixels(this.buttonHeightEm);
        let currentLeft = 0; // Initial left position
        let currentTop = 20; // Initial top position

        for (let i = 0; i < this.numButtons; i++) {
            // Create a new button with given size and position
            const btn = new Button(i, i + 1, this.buttonWidthEm, this.buttonHeightEm, currentLeft, currentTop);
            this.buttons.push(btn);
            this.originalOrder.push(btn);
            gameArea.appendChild(btn.element);

            // Update left position for next button
            currentLeft += buttonWidth + 10;

            // Move to next row if button exceeds gameArea width
            if (currentLeft + buttonWidth > gameAreaWidth) {
                currentLeft = 0;
                currentTop += buttonHeight + 10;
            }
        }
    }

    // Shuffle the buttons and reposition them randomly
    scrambleButtons(times) {
        let scrambleCount = 0;

        const scrambleInterval = setInterval(() => {
            // Dynamically retrieve the current game area dimensions
            const gameArea = document.getElementById('gameArea');
            const gameAreaWidth = gameArea.offsetWidth;
            const gameAreaHeight = gameArea.offsetHeight;
            const buttonWidth = this.emToPixels(this.buttonWidthEm);
            const buttonHeight = this.emToPixels(this.buttonHeightEm);

            if (scrambleCount >= times) {
                clearInterval(scrambleInterval); // Stop shuffling after desired times
                this.hideNumbers(); // Hide numbers after shuffling
                this.makeButtonsClickable(); // Make buttons clickable for memory test
            } else {
                this.buttons.forEach(button => {
                    let left, top;
                    let overlapping;

                    // Find a random non-overlapping position
                    do {
                        overlapping = false;

                        // Random positions within the current game area size
                        left = Math.random() * (gameAreaWidth - buttonWidth);
                        top = Math.random() * (gameAreaHeight - buttonHeight);

                        // Check for overlap with other buttons
                        for (let otherButton of this.buttons) {
                            if (otherButton !== button) {
                                const otherLeft = parseFloat(otherButton.element.style.left);
                                const otherTop = parseFloat(otherButton.element.style.top);

                                if (left < otherLeft + buttonWidth &&
                                    left + buttonWidth > otherLeft &&
                                    top < otherTop + buttonHeight &&
                                    top + buttonHeight > otherTop) {
                                    overlapping = true;
                                    break;
                                }
                            }
                        }
                    } while (overlapping);

                    // Set new position
                    button.setPosition(left, top);
                });
                scrambleCount++;
            }
        }, 2000); // Shuffle every 2 seconds
    }

    // Hide numbers on all buttons
    hideNumbers() {
        this.buttons.forEach(button => {
            button.hideNumber(); // Hide the numbers on all buttons
        });
    }

    // Disable all buttons after game ends
    disableButtons() {
        this.buttons.forEach(button => {
            button.element.disabled = true; // Disable the button
        });
    }

    // Make buttons clickable for memory test
    makeButtonsClickable() {
        let currentClickIndex = 0;

        this.buttons.forEach(button => {
            button.element.addEventListener('click', () => {
                if (button.label == this.originalOrder[currentClickIndex].label) {
                    // Correct click
                    button.showNumber(); // Show the number again
                    currentClickIndex++;

                    // Check if the user has clicked all buttons in the correct order
                    if (currentClickIndex === this.numButtons) {
                        alert('Excellent memory!');
                        this.disableButtons(); // Disable buttons when the game ends
                        document.getElementById('startButton').style.display = 'block'; // Show Go button again
                    }
                } else {
                    // Incorrect click
                    alert('Wrong order!');
                    this.revealCorrectOrder(); // Show correct order
                    this.disableButtons(); // Disable buttons after failure
                    document.getElementById('startButton').style.display = 'block'; // Show Go button again
                }
            });
        });
    }

    // Show the correct order of buttons
    revealCorrectOrder() {
        this.buttons.forEach(button => {
            button.showNumber();
        });
    }
}

// UIManager class handles the interaction with the UI
class UIManager {
    constructor() {
        this.game = null;
    }

    // Validate the number of buttons entered
    validateInput() {
        const input = document.getElementById('numButtons').value;
        const numButtons = parseInt(input);

        if (numButtons < 3 || numButtons > 7 || isNaN(numButtons)) {
            alert("Please enter a number between 3 and 7.");
            return false;
        }
        return numButtons;
    }

    // Start a new game after validating input
    startNewGame() {
        const numButtons = this.validateInput();
        if (numButtons) {
            this.game.startGame(numButtons);
        }
    }
}

// Initialize UIManager and Game
const uiManager = new UIManager();
const game = new Game(uiManager);

// Link the game back to UIManager after both are created
uiManager.game = game;

// Start the game when the Go button is clicked
document.getElementById('startButton').addEventListener('click', () => {
    uiManager.startNewGame();
});
