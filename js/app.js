////////////////////////
//GAMEBOARD MODULE
////////////////////////
let gameboard = (function () {
  let board = ["T", "i", "c", "o", "a", " ", "e", " ", "c"];

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

  function _checkEmpty(index) {
    return board[index] === "" ? true : false;
  }

  function _checkBoardIsFull() {
    let emtyIndex = board.findIndex((cell) => {
      return cell === "";
    });
    return emtyIndex === -1 ? true : false;
  }

  function cleanBoard() {
    board.forEach((element, index) => {
      board[index] = "";
    });
  }

  function _checkWinner() {
    winningState = -1;
    isThereAWinner = false;

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
    if (!error) {
      let winState = _checkWinner();
      displayController.renderGameboard();
      if (winState.isThereAWinner) {
        displayController.declareWinner(playerName, winState.winningState);
        error = 1;
      }
    }
    return error;
  }

  function getBoard() {
    return board;
  }

  return {
    cleanBoard,
    getBoard,
    playCell,
  };
})();

////////////////////////
//PLAYER FACTORY
////////////////////////

let Player = (name, marker, type) => {
  const playCell = (index) => {
    return gameboard.playCell(name, index, marker);
  };

  const playRandom = async () => {
    let availableCells = document.querySelectorAll(".gameboard-cell.clickable");
    if (availableCells.length > 0) {
      let randomCell = Math.floor(Math.random() * availableCells.length);
      await new Promise((r) => setTimeout(r, 500));
      availableCells[randomCell].click();
    }
  };

  return { playCell, playRandom, name, type };
};

////////////////////////
//DISPLAY CONTROLLER MODULE
////////////////////////
let displayController = (function () {
  let game = {};

  //cache DOM
  let gameboardDiv = document.querySelector(".gameboard");
  let header = document.querySelector(".header");

  let startBtn = document.querySelector("#game-start");
  let newRoundBtn = document.querySelector("#game-next-round");
  let player1NameInput = document.querySelector("#p1name");
  let player2NameInput = document.querySelector("#p2name");
  let player1Type = document.querySelector("#p1type");
  let player2Type = document.querySelector("#p2type");

  let p1Winnings = document.querySelector(".p1-winnings");
  let p2Winnings = document.querySelector(".p2-winnings");

  function bindPlayerSelection() {
    let playerTypeButtons = document.querySelectorAll(
      ".player-select > button"
    );

    playerTypeButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.target.disabled = true;
        e.target.nextElementSibling !== null
          ? (e.target.nextElementSibling.disabled = false)
          : (e.target.previousElementSibling.disabled = false);
        e.target.parentElement.setAttribute(
          "playertype",
          e.target.getAttribute("playertype")
        );
      });
    });
  }

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

  function disablePlayerSelection() {
    let playerTypeSelectors = document.querySelectorAll(".player-select");
    playerTypeSelectors.forEach((element) => {
      element.classList.add("disabled");
    });
  }

  function startGame() {
    game.player1 = Player(
      player1NameInput.value,
      "x",
      player1Type.getAttribute("playertype")
    );
    p1Winnings.setAttribute("name", player1NameInput.value);
    game.player2 = Player(
      player2NameInput.value,
      "o",
      player2Type.getAttribute("playertype")
    );
    p2Winnings.setAttribute("name", player2NameInput.value);

    startBtn.classList.add("disabled");
    player1NameInput.disabled = "true";
    player2NameInput.disabled = "true";

    disablePlayerSelection();
    nextRound();
  }

  function setHeader(title) {
    header.textContent = title;
  }

  function nextRound() {
    gameboard.cleanBoard();
    newRoundBtn.classList.add("disabled");
    renderGameboard();
    togglePlayer();
  }

  function togglePlayer() {
    game.currentPlayer === game.player1
      ? (game.currentPlayer = game.player2)
      : (game.currentPlayer = game.player1);
    setHeader(`${game.currentPlayer.name} it's your turn...`);
    game.currentPlayer.type === "CPU" && game.currentPlayer.playRandom();
  }

  function playCell(cell) {
    cell.classList.remove("clickable");
    !game.currentPlayer.playCell(cell.getAttribute("index")) && togglePlayer();
  }

  function bindEvents() {
    let cells = document.querySelectorAll(".gameboard-cell");
    cells.forEach((cell) => {
      if (cell.classList.contains("clickable")) {
        cell.addEventListener("click", (e) => {
          cell.classList.contains("clickable") && playCell(cell);
        });
      }
    });
  }

  function waitForNewRound() {
    let cells = document.querySelectorAll(".gameboard-cell");
    cells.forEach((cell) => cell.classList.remove("clickable"));
    newRoundBtn.classList.remove("disabled");
  }

  function declareWinner(name, winningState) {
    if (winningState === "draw") {
      setHeader(`It's a draw`);
    } else {
      setHeader(`${name} won`);
      let trophiesDiv = document.querySelector(`[name="${name}"]`);
      let newTrophy = document.createElement("div");
      newTrophy.classList.add("trophy-icon");
      newTrophy.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>star-outline</title><path d="M12,15.39L8.24,17.66L9.23,13.38L5.91,10.5L10.29,10.13L12,6.09L13.71,10.13L18.09,10.5L14.77,13.38L15.76,17.66M22,9.24L14.81,8.63L12,2L9.19,8.63L2,9.24L7.45,13.97L5.82,21L12,17.27L18.18,21L16.54,13.97L22,9.24Z" /></svg>`;
      console.log(trophiesDiv);
      trophiesDiv.appendChild(newTrophy);
    }
    waitForNewRound();
  }

  return {
    startGame,
    playCell,
    nextRound,
    renderGameboard,
    declareWinner,
    bindPlayerSelection,
  };
})();
displayController.renderGameboard();
displayController.bindPlayerSelection();
