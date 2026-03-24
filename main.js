/* Combined build: helper.js + index.js (no webpack required) */

/* ── helper.js ── */
const RED_SHADE = '#FF7276';

function vibrate(duration) {
    return navigator.vibrate(duration);
}

const makeBlackWhite = (box) => {
    var current_row = Number(box.getAttribute('row'));
    var current_col = Number(box.getAttribute('col'));
    if ((current_row + current_col) % 2 == 0) {
        box.style.backgroundColor = "#837E7E";
    } else {
        box.style.backgroundColor = "black";
    }
}

const updateBoxValues = (row, col, selected_places, total_cols, total_rows) => {
    for (var i = 0; i < total_rows; i++) {
        selected_places[i][col] = true;
    }
    for (var i = 0; i < total_cols; i++) {
        selected_places[row][i] = true;
    }
    var x = row, y = col;
    while (x >= 0 && y >= 0) { selected_places[x][y] = true; x--; y--; }
    x = row; y = col;
    while (x < total_rows && y >= 0) { selected_places[x][y] = true; x++; y--; }
    x = row; y = col;
    while (x >= 0 && y < total_cols) { selected_places[x][y] = true; x--; y++; }
    x = row; y = col;
    while (x < total_rows && y < total_cols) { selected_places[x][y] = true; x++; y++; }
}

const turnAllBoxesAsRed = (boxes, selected_places) => {
    boxes.forEach((box) => { makeBlackWhite(box); });
    for (var i = 0; i < selected_places.length; i++) {
        for (var j = 0; j < selected_places[i].length; j++) {
            if (selected_places[i][j]) {
                boxes.forEach((box) => {
                    if (box.getAttribute("row") == i && box.getAttribute('col') == j) {
                        box.style.backgroundColor = RED_SHADE;
                    }
                });
            }
        }
    }
}

const updateColorsOfBoxes = (selected_location, boxes, selected_places, total_cols, total_rows) => {
    if (selected_location.length > 0) {
        for (var i = 0; i < selected_location.length; i++) {
            updateBoxValues(selected_location[i][0], selected_location[i][1], selected_places, total_cols, total_rows);
        }
    } else {
        boxes.forEach((box) => { makeBlackWhite(box); });
    }
}

/* ── index.js ── */
var board = document.getElementById("board");
var boxes = [];
var total_cols = 8;
var total_rows = 8;
var N = 8;
var selected_location = [];
var selected_places = [];

function renderQueensOfTop(times) {
    const queensDiv = document.getElementById('queens');
    queensDiv.innerHTML = "";
    for (var i = 0; i < (N - times); i++) {
        queensDiv.appendChild(document.createTextNode("👑"));
    }
}

function making_all_taken_place_false(selected_places, total_rows, total_cols) {
    for (var i = 0; i < total_rows; i++) {
        selected_places[i] = [];
        for (var j = 0; j < total_cols; j++) {
            selected_places[i][j] = false;
        }
    }
}

function buildBoard() {
    board.innerHTML = "";
    boxes = [];
    total_cols = N;
    total_rows = N;

    var cellSize = Math.min(50, Math.floor((window.innerWidth * 0.95) / N));

    board.style.gridTemplateColumns = "repeat(" + N + ", " + cellSize + "px)";
    board.style.gridTemplateRows    = "repeat(" + N + ", " + cellSize + "px)";
    board.style.width  = (N * cellSize) + "px";
    board.style.height = (N * cellSize) + "px";

    for (var i = 0; i < total_rows; i++) {
        for (var j = 0; j < total_cols; j++) {
            var box = document.createElement("div");
            box.className = "box";
            box.style.width  = cellSize + "px";
            box.style.height = cellSize + "px";
            box.style.backgroundColor = ((i + j) % 2 == 0) ? "#837E7E" : "black";
            box.style.gridColumn = j + 1;
            box.style.gridRow = i + 1;
            box.title = (i + 1) + "," + (j + 1);
            box.setAttribute("selected", "false");
            box.setAttribute('row', Number(i));
            box.setAttribute('col', j);
            board.appendChild(box);
            boxes.push(box);
        }
    }
}

function checkStuck() {
    var stuckMsg = document.getElementById("stuck-msg");
    var hasFreeCell = boxes.some(function(box) {
        var r = Number(box.getAttribute('row'));
        var c = Number(box.getAttribute('col'));
        return !selected_places[r][c] && box.getAttribute('selected') === 'false';
    });
    if (!hasFreeCell && selected_location.length < N) {
        stuckMsg.style.display = "block";
    } else {
        stuckMsg.style.display = "none";
    }
}

function attachBoxListeners() {
    boxes.forEach((box) => {
        box.addEventListener("click", async (e) => {
            var row = e.target.getAttribute("row");
            var col = e.target.getAttribute("col");
            if (e.target.getAttribute("selected") == "false") {
                if (selected_places[row][col]) {
                    e.target.classList.add("red-pulse-box");
                    vibrate(400);
                    updateColorsOfBoxes(selected_location, boxes, selected_places, total_cols, total_rows);
                    turnAllBoxesAsRed(boxes, selected_places);
                } else {
                    making_all_taken_place_false(selected_places, total_rows, total_cols);
                    e.target.style.backgroundColor = "black";
                    e.target.setAttribute("selected", "true");
                    selected_location.push([Number(row), Number(col)]);
                    e.target.innerHTML = "👑";
                    updateColorsOfBoxes(selected_location, boxes, selected_places, total_cols, total_rows);
                    turnAllBoxesAsRed(boxes, selected_places);
                    checkStuck();
                    if (selected_location.length == N) {
                        localStorage.setItem('selected_location', JSON.stringify(selected_location));
                        boxes.forEach((b) => { b.style.backgroundColor = "#90ee90"; });
                        document.getElementById("win-msg").style.display = "flex";
                        party.confetti(document.getElementById('board'));
                    }
                    vibrate(100);
                }
            } else {
                making_all_taken_place_false(selected_places, total_rows, total_cols);
                e.target.setAttribute("selected", "false");
                e.target.innerHTML = "";
                for (var i = 0; i < selected_location.length; i++) {
                    if (selected_location[i][0] == row && selected_location[i][1] == col) {
                        selected_location.splice(i, 1);
                    }
                }
                updateColorsOfBoxes(selected_location, boxes, selected_places, total_cols, total_rows);
                turnAllBoxesAsRed(boxes, selected_places);
                checkStuck();
                vibrate(100);
            }
            localStorage.setItem("selected_location", JSON.stringify(selected_location));
            renderQueensOfTop(selected_location.length);
        });
    });
}

// Initial setup
making_all_taken_place_false(selected_places, total_rows, total_cols);
buildBoard();

// Restore saved game state
var selected_location_ls = JSON.parse(localStorage.getItem('selected_location'));
if (selected_location_ls != null) {
    selected_location = selected_location_ls;
    selected_location.forEach((location) => {
        boxes.forEach((box) => {
            if (Number(box.getAttribute('row')) == location[0] && Number(box.getAttribute('col')) == location[1]) {
                box.setAttribute('selected', 'true');
                box.innerHTML = "👑";
            }
        });
    });
    renderQueensOfTop(selected_location.length);
    updateColorsOfBoxes(selected_location, boxes, selected_places, total_cols, total_rows);
    turnAllBoxesAsRed(boxes, selected_places);
}

attachBoxListeners();

document.getElementById("reset-btn").addEventListener("click", () => {
    localStorage.removeItem("selected_location");
    location.reload();
});

document.getElementById("size-select").addEventListener("change", (e) => {
    N = Number(e.target.value);
    total_cols = N;
    total_rows = N;
    selected_location = [];
    selected_places = [];
    making_all_taken_place_false(selected_places, total_rows, total_cols);
    document.getElementById("win-msg").style.display = "none";
    document.getElementById("stuck-msg").style.display = "none";
    localStorage.removeItem("selected_location");
    buildBoard();
    attachBoxListeners();
    renderQueensOfTop(0);
});