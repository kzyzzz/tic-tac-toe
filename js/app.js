////////////////////////
//GAMEBOARD MODULE
////////////////////////
let gameboard = (function () {
  let board = ["", "", "", "", "", "", "", "", ""];

  function _checkEmpty(index) {
    return board[index] === "" ? true : false;
  }

  function _checkBoardIsFull() {
    let emtyIndex = board.findIndex((cell) => {
      return cell === "";
    });
    return emtyIndex === undefined ? true : false;
  }

  function _checkWinner() {
    winningState = undefined;
    isThereAWinner = false;
    const winningStates = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 4, 8],
      [2, 4, 6],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
    ];

    winningStates.forEach((state, index) => {
      if (
        board[state[0]] === board[state[1]] &&
        board[state[0]] === board[state[2]] &&
        board[state[0]] != ""
      ) {
        winningState = index;
        isThereAWinner = true;
      }
    });

    if (winningState === -1 && _checkBoardIsFull()) {
      winningState = "draw";
      isThereAWinner = true;
    }

    return { isThereAWinner, winningState };
  }

  function playCell(playerName, index, marker) {
    error = 0;
    _checkEmpty(index) ? (board[index] = marker) : (error = 1);
    if (!error) console.log(_checkWinner()); /// TO REMOVE

    winState = _checkWinner();
    if (winState.isThereAWinner)
      displayController.declareWinner(playerName, winState.winningState);

    displayController.renderGameboard();
  }

  function getBoard() {
    return board;
  }

  return {
    getBoard,
    playCell,
  };
})();

////////////////////////
//PLAYER FACTORY
////////////////////////

const Player = (name, marker) => {
  const playCell = (index) => {
    gameboard.playCell(name, index, marker);
    displayController.renderGameboard();
  };

  return { playCell };
};

////////////////////////
//DISPLAY CONTROLLER MODULE
////////////////////////
let displayController = (function () {
  //cache DOM
  let gameboardDiv = document.querySelector(".gameboard");

  function renderGameboard() {
    gameboardDiv.innerHTML = "";
    board = gameboard.getBoard();

    function createCell(content, index) {
      const cellDiv = document.createElement("div");
      cellDiv.classList.add("gameboard-cell");
      cellDiv.setAttribute("index", index);
      cellDiv.innerHTML = `<span>${content}</span>`;
      if (content == "") cellDiv.classList.add("clickable");
      return cellDiv;
    }

    board.forEach((content, index) => {
      gameboardDiv.appendChild(createCell(content, index));
    });

    bindEvents();
  }

  const player1 = Player("one", "x"); //TO REFACTOR
  const player2 = Player("two", "o");
  let currentPlayer = player1;

  function togglePlayer() {
    currentPlayer === player1
      ? (currentPlayer = player2)
      : (currentPlayer = player1);
  }

  function playCell(index, cell) {
    cell.classList.remove("clickable");
    currentPlayer.playCell(index);
    togglePlayer();
  }

  function bindEvents() {
    let cells = document.querySelectorAll(".gameboard-cell");
    cells.forEach((cell) => {
      if (cell.classList.contains("clickable")) {
        cell.addEventListener("click", (e) => {
          let index = cell.getAttribute("index");
          playCell(index, cell);
        });
      }
    });
  }

  function declareWinner(name, winningState) {
    console.log(`${name} won with ${winningState}`);
  }

  return {
    renderGameboard,
    declareWinner,
  };
})();
displayController.renderGameboard();
