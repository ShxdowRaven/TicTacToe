const BOARD_WIDTH = 3;
const BOARD_HEIGHT = 3;

const RECT_HEIGHT = 200;
const RECT_WIDTH = 200;

var rect_board = [];
var board = [];
var x_turn = true;
var winner = null;
var intervalId;

// Check for WebGL support
var type = "WebGL";
if(!PIXI.utils.isWebGLSupported()) {
    type = "canvas";
}

PIXI.utils.sayHello(type);

// Textures
var texture_rect = PIXI.Texture.fromImage("images/baseRect.png");
var texture_x = PIXI.Texture.fromImage("images/x.png");
var texture_o = PIXI.Texture.fromImage("images/o.png");

var texture_smile = PIXI.Texture.fromImage("images/smile.png");
var texture_omg = PIXI.Texture.fromImage("images/omg.png");

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
            var rect = new PIXI.Sprite(texture_rect);
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
            console.log(rect_board);
    }  
}
console.log(board);
console.log(rect_board);

// Function for checking if game is over
function checkWinner(arr) {
    // Horizontal
    for(let i = 0; i < 3; i++) {
        if(arr[i][0] != "*" && arr[i][0] == arr[i][1] && arr[i][1] == arr[i][2]) {
            return [arr[i][0], [i, 0], [i, 1], [i, 2]];
        }
    }

    // Vertical
    for(let i = 0; i < 3; i++) {
        if(arr[0][i] != "*" && arr[0][i] == arr[1][i] && arr[1][i] == arr[2][i]) {
            return [arr[0][i], [0, i], [1, i], [2, i]];
        }
    }

    // Diagonal
    if(arr[0][0] != "*" && arr[0][0] == arr[1][1] && arr[1][1] == arr[2][2]) {
        return [arr[0][0], [0, 0], [1, 1], [2, 2]];
    } else if(arr[0][2] != "*" && arr[0][2] == arr[1][1] && arr[1][1] == arr[2][0]) {
        return [arr[0][2], [0, 2], [1, 1], [2, 0]];
    }

    // Tie
    for(let curr_row of arr) {
        for(let curr_box of curr_row) {
            if(curr_box == "*") {
                return null;
            }
        }
    }
    return "-";
}

// Mouse events
function onMouseOver() {
    console.log("onMouseOver:", this); 

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
    console.log("onClick:", this);
    app.stage.removeChild(this.overlay);

    var x = this.arr_x, y = this.arr_y;

    console.log(x, y, this.texture, winner);
    if(this.texture == texture_rect && winner == null) {
        if(x_turn) {
            board[y][x] = "X";
            this.texture = texture_x;
        } else {
            board[y][x] = "O";
            this.texture = texture_o;
        }

        console.log(board);
        winner = checkWinner(board);

        if(winner != null) {
            if(winner[0] == "X") {
                console.log("X won!");
                text.text = "X won!";
                console.log(winner);
            } else if(winner[0] == "O") {
                console.log("O won!");
                text.text = "O won!";
            } else if(winner[0] == "-") {
                text.text = "Tie!";
            }

            smile.texture = texture_omg;

            console.log(winner);
            console.log(rect_board);
            console.log(board);

            var increment = 1 / 100;
            var curr_alpha = 1;
            intervalId = window.setInterval(function() {
                console.log("Interval");
                curr_alpha += increment;
                if (curr_alpha > 1 || curr_alpha < 0.5) increment = -increment;
                rect_board[winner[1][0]][winner[1][1]].alpha = curr_alpha;
                rect_board[winner[2][0]][winner[2][1]].alpha = curr_alpha;
                rect_board[winner[3][0]][winner[3][1]].alpha = curr_alpha;
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
    smile.x = RECT_WIDTH * BOARD_WIDTH + 450, smile.y = RECT_HEIGHT * BOARD_HEIGHT - 500;
    app.stage.addChild(smile);
}

// Adding text
var text = new PIXI.Text("Game in progress...", {
    fontFamily: "Robotic",
    fontSize: 24,
    fill: 0xff1010,
    align: "center"
});

text.anchor.set(0.5);
text.x = (RECT_WIDTH * BOARD_WIDTH + 450) + (400 / 2), text.y = (RECT_HEIGHT * BOARD_HEIGHT - 500) + 450;

app.stage.addChild(text);

// Reset button
const reset_button = new PIXI.Graphics()
    .beginFill(0xFFFFFF)
    .lineStyle(5, 0x641E16)
    .drawRect((RECT_WIDTH * BOARD_WIDTH + 450) + (400 / 2) - (200 / 2), (RECT_HEIGHT * BOARD_HEIGHT - 500) + 450 + 50, 200, 100);

reset_button.interactive = true;
reset_button.buttonMode = true;

reset_button
    .on("click", reset)

var reset_button_text = new PIXI.Text("RESET", {
    fontFamily: "Robotic",
    fontSize: 40,
    fill: 0x641E16,
    align: "center"
});

reset_button_text.anchor.set(0.5);
reset_button_text.x = (RECT_WIDTH * BOARD_WIDTH + 450) + (400 / 2) - (200 / 2) + (200 / 2), reset_button_text.y = (RECT_HEIGHT * BOARD_HEIGHT - 500) + 450 + 50 + (100 / 2);

app.stage.addChild(reset_button);
app.stage.addChild(reset_button_text);

// Reset function
function reset() {
    console.log("Reset");

    clearInterval(intervalId);
    smile.texture = texture_smile;
    x_turn = true;
    text.text = "Game in progress...";
    
    rect_board[winner[1][0]][winner[1][1]].alpha = 1;
    rect_board[winner[2][0]][winner[2][1]].alpha = 1;
    rect_board[winner[3][0]][winner[3][1]].alpha = 1;
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