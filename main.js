const BOARD_WIDTH = 3;
const BOARD_HEIGHT = 3;

const RECT_HEIGHT = 200;
const RECT_WIDTH = 200;

let rect_board = [];
let board = [];
let x_turn = true;
let winner = null;
let intervalId;
let isVsAI = false;

// Check for WebGL support
let type = "WebGL";
if(!PIXI.utils.isWebGLSupported()) {
    type = "canvas";
}

PIXI.utils.sayHello(type);

// Textures
let texture_rect = PIXI.Texture.fromImage("images/baseRect.png");
let texture_x = PIXI.Texture.fromImage("images/x.png");
let texture_o = PIXI.Texture.fromImage("images/o.png");

let texture_smile = PIXI.Texture.fromImage("images/smile.png");
let texture_omg = PIXI.Texture.fromImage("images/omg.png");

// Creating an application and renderer
const app = new PIXI.Application();

app.renderer.autoDensity = true
app.renderer.resize(window.innerWidth, window.innerHeight);

document.body.appendChild(app.view);

// Setting up on-window-resize
window.addEventListener('resize', resize);

function resize() {
    app.renderer.resize(window.innerWidth, window.innerHeight);
}

// Creating a board of rectangles
for(let y = 1; y <= BOARD_WIDTH; y++) {
    board.push([]);
    rect_board.push([]);
    for(let x = 1; x <= BOARD_HEIGHT; x++) {
            let rect = new PIXI.Sprite(texture_rect);
            rect.interactive = true;
            rect.buttonMode = true;

            rect.x = RECT_WIDTH * x;
            rect.y = RECT_HEIGHT * y;
            rect.arr_x = x-1;
            rect.arr_y = y-1;

            rect
                .on("mouseover", onMouseOver)
                .on("mouseout", onMouseOut)
                .on("click", onClick)

            app.stage.addChild(rect);

            board[y - 1].push([]);
            rect_board[y - 1].push([]);

            board[y - 1][x - 1] = "*";
            rect_board[y - 1][x - 1] = rect;
    }  
}

// Function for checking if game is over
function checkWinner(arr) {
    // Horizontal
    for(let i = 0; i < 3; i++) {
        if(arr[i][0] != "*" && arr[i][0] == arr[i][1] && arr[i][1] == arr[i][2]) {
            return {type: arr[i][0], moves: [[i, 0], [i, 1], [i, 2]]};
        }
    }

    // Vertical
    for(let i = 0; i < 3; i++) {
        if(arr[0][i] != "*" && arr[0][i] == arr[1][i] && arr[1][i] == arr[2][i]) {
            return {type: arr[0][i], moves: [[0, i], [1, i], [2, i]]};
        }
    }

    // Diagonal
    if(arr[0][0] != "*" && arr[0][0] == arr[1][1] && arr[1][1] == arr[2][2]) {
        return {type: arr[0][0], moves: [[0, 0], [1, 1], [2, 2]]};
    } else if(arr[0][2] != "*" && arr[0][2] == arr[1][1] && arr[1][1] == arr[2][0]) {
        return {type: arr[0][2], moves: [[0, 2], [1, 1], [2, 0]]};
    }

    // No Winner
    for(let curr_row of arr) {
        for(let curr_box of curr_row) {
            if(curr_box == "*") {
                return null;
            }
        }
    }

    // Tie
    return {type: "-"};
}

// Mouse events
function onMouseOver() {
    //console.log("onMouseOver:", this); 

    if(this.texture == texture_rect && winner == null) {
        if(x_turn) {
            this.overlay = new PIXI.Sprite(texture_x);

        } else {
            this.overlay = new PIXI.Sprite(texture_o);
        }
        this.overlay.x = this.x, this.overlay.y = this.y;
        this.overlay.alpha = 0.5;
        app.stage.addChild(this.overlay);
    }
}

function onMouseOut() {
    app.stage.removeChild(this.overlay);
}

function onClick() {
    //console.log("onClick:", this);
    app.stage.removeChild(this.overlay);

    let x = this.arr_x, y = this.arr_y;

    if(this.texture == texture_rect && winner == null) {
        if(x_turn) {
            board[y][x] = "X";
            this.texture = texture_x;
        } else {
            board[y][x] = "O";
            this.texture = texture_o;
        }

        if(isVsAI) {
            pickBest();
        }

        winner = checkWinner(board);

        if(winner != null) {
            smile.texture = texture_omg;
            if(winner["type"] == "X") {
                console.log("X won!");
                text.text = "X won!";
            } else if(winner["type"] == "O") {
                console.log("O won!");
                text.text = "O won!";
            } else if(winner["type"] == "-") {
                console.log("Tie");
                text.text = "Tie!";
                return;
            }

            let increment = 1 / 100;
            let curr_alpha = 1;
            intervalId = window.setInterval(function() {
                curr_alpha += increment;
                if (curr_alpha > 1 || curr_alpha < 0.5) increment = -increment;
                rect_board[winner["moves"][0][0]][winner["moves"][0][1]].alpha = curr_alpha;
                rect_board[winner["moves"][1][0]][winner["moves"][1][1]].alpha = curr_alpha;
                rect_board[winner["moves"][2][0]][winner["moves"][2][1]].alpha = curr_alpha;
            }, 10);
        } else {
            x_turn = !x_turn;
        }
    }
}

// Loading sprites
PIXI.loader
    .add("images/smile.png")
    .load(setup);

function setup() {
    smile = new PIXI.Sprite(PIXI.loader.resources["images/smile.png"].texture);
    smile.width = 400, smile.height = 400;
    smile.x = RECT_WIDTH * BOARD_WIDTH + 450, smile.y = RECT_HEIGHT * BOARD_HEIGHT - 550;
    app.stage.addChild(smile);
}

// Adding text
let text = new PIXI.Text("Game in progress...", {
    fontFamily: "Robotic",
    fontSize: 24,
    fill: 0xff1010,
    align: "center"
});

text.anchor.set(0.5);
text.x = (RECT_WIDTH * BOARD_WIDTH + 450) + (400 / 2), text.y = (RECT_HEIGHT * BOARD_HEIGHT - 580) + 450;

app.stage.addChild(text);

// Reset button
const reset_button = new PIXI.Graphics()
    .beginFill(0xFFFFFF)
    .lineStyle(5, 0x641E16)
    .drawRect((RECT_WIDTH * BOARD_WIDTH + 450) + (400 / 2) - (200 / 2), (RECT_HEIGHT * BOARD_HEIGHT - 500) + 450 - 25, 200, 100);

reset_button.interactive = true;
reset_button.buttonMode = true;

reset_button
    .on("click", reset)

let reset_button_text = new PIXI.Text("RESET", {
    fontFamily: "Robotic",
    fontSize: 40,
    fill: 0x641E16,
    align: "center"
});

reset_button_text.anchor.set(0.5);
reset_button_text.x = (RECT_WIDTH * BOARD_WIDTH + 450) + (400 / 2) - (200 / 2) + (200 / 2), reset_button_text.y = (RECT_HEIGHT * BOARD_HEIGHT - 500) + 450 - 25 + (100 / 2);

app.stage.addChild(reset_button);
app.stage.addChild(reset_button_text);

// Reset function
function reset() {
    console.log("Reset");
    clearInterval(intervalId);
    smile.texture = texture_smile;
    x_turn = true;
    text.text = "Game in progress...";
    
    if(winner != null && winner != "-") {
        rect_board[winner["moves"][0][0]][winner["moves"][0][1]].alpha = 1;
        rect_board[winner["moves"][1][0]][winner["moves"][1][1]].alpha = 1;
        rect_board[winner["moves"][2][0]][winner["moves"][2][1]].alpha = 1;
    }
    winner = null;

    board = [];
    for(let x = 1; x <= BOARD_WIDTH; x++) {
        board.push([]);
        for(let y = 1; y <= BOARD_HEIGHT; y++) {
            board[x - 1].push([]);
            board[x - 1][y - 1] = "*";
        }
    }

    for(curr_row of rect_board) {
        for(curr_box of curr_row) {
            curr_box.texture = texture_rect;
        }
    }
}

// Vs AI Button
const ai_button = new PIXI.Graphics()
    .beginFill(0xFFFFFF)
    .lineStyle(5, 0x641E16)
    .drawRect((RECT_WIDTH * BOARD_WIDTH + 450) + (400 / 2) - (200 / 2), (RECT_HEIGHT * BOARD_HEIGHT - 500) + 450 + 120, 200, 100);

ai_button.interactive = true;
ai_button.buttonMode = true;

ai_button
    .on("click", vsAI)

let ai_button_text = new PIXI.Text("VS AI", {
    fontFamily: "Robotic",
    fontSize: 40,
    fill: 0x641E16,
    align: "center"
});

ai_button_text.anchor.set(0.5);
ai_button_text.x = (RECT_WIDTH * BOARD_WIDTH + 450) + (400 / 2) - (200 / 2) + (200 / 2), ai_button_text.y = (RECT_HEIGHT * BOARD_HEIGHT - 500) + 450 + 120 + (100 / 2);

app.stage.addChild(ai_button);
app.stage.addChild(ai_button_text);

// Vs AI Function
function vsAI() {
    isVsAI = true
}

function pickBest(curr_board, player, isMax) {
    possible_moves = possibleMoves(player);
    score = []
    for(curr_move in possible_moves) {
        temp_board = applyMove(curr_move)
        winner = checkWinner(temp_board)
        if(winner) {
            if(winner["type"] == player) {
                if(isMax) {
                    score.push(100)
                } else {

                }
            }
        }
        score.push()
    }
}