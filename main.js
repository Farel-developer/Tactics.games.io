// Declare the "constructor" function
function MakeTicTacToe($tictac) {
// Save reference to created object into the variable for later using it as an argument for function which handle events or for player.run() 
  _this = this;
//In future we will select items only within the current DOM element with the following id 
  this.id = '#' + $tictac.attr('id');
// Load the default configuration
  this._loadDefaults();

// Those 3 variable are for the saving an interval for the blinking player.namePlate (when the player is thinking about where to put X of 0 his name
// is blinking) and for the timeouts for showing the result of the game and starting new game  
  this.blinkingInt = false;
  this.newGameTimeout = undefined;
  this.screenTimeout = undefined;
  
// Add a click handler which will setup the parameters of the game  
  $(this.id).click(function (evt) {
    _this._setup(evt);  
  });
}

// This function loads default state of the system after starting a game or after user press the "Reset" button 
MakeTicTacToe.prototype._loadDefaults = function (evt) {
//The flag for determine who goes first (player or computer, player 1 or player 2)
  this.firstRun = true;
//The flag for determine whether we have one player game or to players game
  this.onePlayer = false;
// The number of steps are made by two players
  this.runs = 0;
//Configure default start screen
  $(this.id + ' .player-sel,' + this.id + ' .title').show();
  $(this.id + ' .sym-sel,' + this.id + ' .back,' + this.id + ' .grid,' + this.id + ' .reset,' + this.id + ' .p1,' + this.id + ' .score').hide(); 
    
  $(this.id + ' .player1').html('Player:');
  $(this.id + ' .opponent').html('Computer:');

//Clear the player's array set them to defaults
  this.players = [{
     score: 0, namePlate: $(this.id + ' .player1')[0], scorePlate: $(this.id + ' .player1Win')[0], playerId: 0
   },
   {
     score: 0, namePlate: $(this.id + ' .opponent')[0], scorePlate: $(this.id + ' .opponentWin')[0], playerId: 1
 }];
// Each player object has a reference to the other player object
  this.players[0].enemy = this.players[1];
  this.players[1].enemy = this.players[0];
//Clear the scores in html
  $(this.id + ' .player1Win').html('0');
  $(this.id + ' .opponentWin').html('0'); 
// Remove class which highlights the player's name
  $(this.players[0].namePlate).removeClass('blinking').fadeIn();
  $(this.players[1].namePlate).removeClass('blinking').fadeIn();
// Stop blinking, remove click handler, clear timeouts see before
  clearInterval(this.blinkingInt);
  $(_this.id + ' .grid').off('click');
  clearTimeout(this.newGameTimeout);
  clearTimeout(this.screenTimeout);
// We have the array this.grid which reflect the real html table with "X" and "0", use this array for analyzing the state of the game. 
// I think that for performance is better to analyze an array than every time asking the DOM elements  
  this._clearMatrix();
} 

// This function clear matrix describer before and also clean the html table
MakeTicTacToe.prototype._clearMatrix = function (line) {
// Put empty strings to the all sells of the grid, and clear the html table at the same time
  this.runs = 0;
  this.grid = [];
  $(_this.id + ' .grid').css('opacity', '1');
  $(_this.id + ' .result').removeClass('draw playerWin computerWin');
  for (var i = 0; i < 9; i++) {
    this.grid[i] = '';
    $(this.id + ' .' + i).html('');
  }
  if (line) {
    for(var i in line){
        $(line[i]).removeClass('check');
    }
  }
  else {
    for (var i = 0; i < 9; i++) {  
      $(this.id + ' .' + i).removeClass('check');
    }
  }  
}

//This function shows different screens depends on the parameter
MakeTicTacToe.prototype._loadScreen = function (screenId, line, player) {
  switch(screenId) {
    case 'onePlayerSymSel':
      $(+ this.id + ' .grid,' + this.id + ' .player-sel').hide();
      $(this.id + ' .sym-sel,' + this.id + ' .back').show();
      break;
    case 'twoPlayersSymSel':
      $(this.id + ' .sym-sel,' + this.id + ' .back,' + this.id + ' .p1').show();
      $(+ this.id + ' .grid,' + this.id + ' .player-sel').hide();
      break;
    case 'gameStart':
      $(this.id + ' .player1').html(this.players[0].name + ' :');
      $(this.id + ' .opponent').html(this.players[1].name + ' :');
      $(this.id + ' .grid,' + this.id + ' .reset,' + this.id + ' .score').show();
      $(this.id + ' .sym-sel,' + this.id + ' .back,' + this.id + ' .player-sel,' + this.id + ' .title,' + this.id + ' .p1').hide();
      break;
    case 'drawScreen':
      $(this.id + ' .grid').css('opacity', '0.1');
      $(this.id + ' .result').addClass('draw');
      $(this.id + ' .result p').html('It was a drow');
      break;
    case 'pickOutCells':
      for(var i in line){
        $(line[i]).addClass('check');
      }
      $(this.id + ' .result p').html(player.name + ' &nbsp; won!');
      break;
    case 'computerWinScreen':
      $(this.id + ' .grid').css('opacity', '0.1');
      $(this.id + ' .result').addClass('computerWin');
      break;
    case 'playerWinScreen':
      $(this.id + ' .grid').css('opacity', '0.1');
      $(this.id + ' .result').addClass('playerWin');
      break;
    default:
      this._loadDefaults();
      break;
  }
}

MakeTicTacToe.prototype._setup = function (evt) {
  switch(evt.target) {
    case $(this.id + ' .one-player')[0]:
      this.onePlayer = true;
      this.players[0].name = 'Player';
      this.players[0].run = this._humanRun;
      this.players[1].name = "Computer";
      this.players[1].run = this._computerRun;
      this._loadScreen('onePlayerSymSel');
      break;
    case $(this.id + ' .back')[0]:
      this._loadScreen();
      break;
    case $(this.id + ' .two-players')[0]:
      this.players[0].name = 'Player 1';
      this.players[0].run = this._humanRun;
      this.players[1].name = "Player 2";   
      this.players[1].run = this._humanRun;
      this._loadScreen('twoPlayersSymSel');
      break;
    case $(this.id + ' .cross')[0]:
      this.players[0].sym = 'X';
      this.players[1].sym = '0';
      this._loadScreen('gameStart');
      this._play(_this);
      break;
    case $(this.id + ' .naught')[0]:
      this.players[0].sym = '0';
      this.players[1].sym = 'X';
      this._loadScreen('gameStart');
      this._play(_this);
      break;
    case $(this.id + ' .reset')[0]:      
      this._loadScreen();
      break;
  }
}

// This function controls who goes first and call corresponding player.run functions
MakeTicTacToe.prototype._play = function (_this) {
  if (this.firstRun) {
    this.players[0].run(_this);  
    this.firstRun = false;
  }
  else { 
    this.players[1].run(_this);
    this.firstRun = true;
  }
}

MakeTicTacToe.prototype._humanRun = function (_this) {
  var player = this;
  function blink(el) {
    $(el).fadeToggle();
  } 
  function humanClick(evt) {
    if ($(evt.target).html() === '') {
// cellnum is a number of the cell where player made click. Index in this.grid correspond the class of the cell at the html table
      var cellNum = Number($(evt.target).attr('class')[0]);
      $(evt.target).html(player.sym);
      _this.grid[cellNum] = player.sym;
      clearInterval(_this.blinkingInt);
      $(player.namePlate).fadeIn();
      $(player.namePlate).removeClass('blinking');
      $(_this.id + ' .grid').off('click');
    }
  }
// Highlight player's name plate and make it blinking, then add event listener
  $(player.namePlate).addClass('blinking');
  _this.blinkingInt = setInterval(function () {  
      blink(player.namePlate);
    }, 600);
  $(_this.id + ' .grid').click(function (evt) {
    if ($(evt.target).html() === '') {    
      humanClick(evt);
      _this._checkWin(player);
    }
  });
}

MakeTicTacToe.prototype._computerRun = function (_this) {
  var player = this;
  var stepTo, report;  // stepTo is a cell where the goStep() goes and report is a result returned by analyze()
 
// This function receive the array (it is array with 9 elements which correspond to the cells in the grid) then it analyzes the grid and return an array
// array (report) returned
// [
//  the cell number where computer should goes in order to make win , or false
//  the cell number where computer should goes in order to not lose, or false
//  the cell number where computer should goes in order to have possibility to fill the line in future (only one computer's symbol in the line), or false
//  random free cell if there are no variants described before
//  the array with the numbers of the free cells 
//];
  function analize (grid) {
    var freeCells = [], respond = [false, false, false, false];
// Check gorizontal lines
    for (var i = 0; i < 9; i+=3) {
      switch(grid[i] + grid[i + 1] + grid[i + 2]) {
        case player.sym + player.sym:
          if (grid[i] === '') {
            respond[0] = i;  
            return respond;
          }
          else if (grid[i + 1] === '') {
            respond[0] = i + 1;
            return respond;
          }
          else {
            respond[0] = i + 2;
            return respond;
          }
        case player.enemy.sym + player.enemy.sym:
          if (grid[i] === '') {
            respond[1] = i;  
          }
          else if (grid[i + 1] === '') {
            respond[1] = i + 1;
          }
          else {
            respond[1] = i + 2;
          }
          break;
        case player.sym:
          if (grid[i] === player.sym) {
            respond[2] = selectRandomCell([i + 1, i + 2]);
          }
          else if (grid[i + 1] === player.sym) {
            respond[2] = selectRandomCell([i, i + 2]);
          }
          else {
            respond[2] = selectRandomCell([i, i + 1]);
          }
      }
 //Collect free cells to the array freeCells
      if (grid[i] === '') {
        freeCells.push(i);
      }
      if (grid[i + 1] === '') {
        freeCells.push(i +1);
      }
      if (grid[i + 2] === '') {
        freeCells.push(i + 2);
      }
    }
    //Check vertical lines
    for (var i = 0; i < 3; i++) {
      switch(grid[i] + grid[i + 3] + grid[i + 6]) {
        case player.sym + player.sym:
          if (grid[i] === '') {
            respond[0] = i;  
            return respond;
          }
          else if (grid[i + 3] === '') {
            respond[0] = i + 3;
            return respond;
          }
          else {
            respond[0] = i + 6;
            return respond;
          }
        case player.enemy.sym + player.enemy.sym:
          if (grid[i] === '') {
            respond[1] = i;  
          }
          else if (grid[i + 3] === '') {
            respond[1] = i + 3;
          }
          else {
            respond[1] = i + 6;
          }
          break;
        case player.sym:
          if (grid[i] === player.sym) {
            respond[2] = selectRandomCell([i + 3, i + 6]);
          }
          else if (grid[i + 3] === player.sym) {
            respond[2] = selectRandomCell([i, i + 6]);
          }
          else {
            respond[2] = selectRandomCell([i, i + 3]);
          }
      }
    }
    //Check diagonals, diagonal 0-4-8
    switch (grid[0] + grid[4] + grid[8]) {
      case player.sym + player.sym:
        if (grid[0] === '') {
          respond[0] = 0;  
          return respond;
        }
        else if (grid[4] === '') {
          respond[0] = 4;
          return respond;
        }
        else {
          respond[0] = 8;
          return respond;
        } 
       case player.enemy.sym + player.enemy.sym:
         if (grid[0] === '') {
          respond[1] = 0;  
        }
        else if (grid[4] === '') {
          respond[1] = 4;
        }
        else {
          respond[1] = 8;
        } 
        break;
      case player.sym:
        if (grid[0] === player.sym) {
          respond[2] = selectRandomCell([4, 8]);
        }       
        else if (grid[4] === player.sym) {
          respond[2] = selectRandomCell([0, 8]);
        }
        else {
          respond[2] = selectRandomCell([0, 4]);
        }
    }

    //diagonal 2-4-6
    switch (grid[2] + grid[4] + grid[6]) {
      case player.sym + player.sym:
        if (grid[2] === '') {
          respond[0] = 2;  
          return respond;
        }
        else if (grid[4] === '') {
          respond[0] = 4;
          return respond;
        }
        else {
          respond[0] = 6;
          return respond;
        } 
       case player.enemy.sym + player.enemy.sym:
         if (grid[2] === '') {
          respond[1] = 2;  
        }
        else if (grid[4] === '') {
          respond[1] = 4;
        }
        else {
          respond[1] = 6;
        } 
      case player.sym:
        if (grid[2] === player.sym) {
          respond[2] = selectRandomCell([4, 6]);
        }       
        else if (grid[4] === player.sym) {
          respond[2] = selectRandomCell([2, 6]);
        }
        else {
          respond[2] = selectRandomCell([2, 4]);
        }         
    }  
    if (respond[1] === false && respond[2] === false) {
      respond[3] = selectRandomCell(freeCells);
    }
    respond[4] = freeCells;
    return respond; 
  }
 
// This function try to find the such cell when computer will make step to it opponent(human) definitely will lose
// It copy the grid, takes the free cells list from the report and make "virtual" step to each free cell and then analyzes if after this step the
// computer has two variants for the win    
  function findFork (report) {
    var matrix, count;
    for (var i in report[4]) {
      matrix = _this.grid.slice();
      matrix[report[4][i]] = player.sym;
      count = 0;
    // Check gorizontal lines
      for (var j = 0; j < 9; j+=3) {
        if (matrix[j] + matrix[j + 1] + matrix[j + 2] == player.sym + player.sym) {
          count ++;
          if (count > 1) {
            return report[4][i];          
          }
        }   
      }
    //Check vertical lines
      for (var j = 0; j < 3; j++) {
        if (matrix[j] + matrix[j + 3] + matrix[j + 6] == player.sym + player.sym) {
          count ++;
          if (count > 1) {
            return report[4][i];          
          }
        }
      }
    //Check diagonals, diagonal 0-4-8
      if (matrix[0] + matrix[4] + matrix[8] == player.sym + player.sym) {
        count ++;
        if (count > 1) {
          return report[4][i];          
        }
      }
      //diagonal 2-4-6
      if (matrix[2] + matrix[4] + matrix[6] == player.sym + player.sym) {
        count ++;
        if (count > 1) {
          return report[4][i];          
        }
      }
    } 
    return false; 
  }

//  Select random cell from the list, receive the list collect free cells from this list and then random select cells from the free cell 
  function selectRandomCell(cellList) {
    var num = Math.floor(Math.random() * cellList.length);
    for (var i = 0; i < cellList.length; i++) {    
      var step = cellList[num];
      if (_this.grid[step] === '') { 
        return step;
      }
      else {
        num = (num + i) % (cellList.length);
      }
    }
  }
  
  function blink(el) {
    $(el).fadeToggle();
  }
  
  function makeStep() {

    function goStep() {
      clearInterval(_this.blinkingInt);
      $(player.namePlate).fadeIn();
      $(player.namePlate).removeClass('blinking'); 
      _this.grid[stepTo] = player.sym;
      $(_this.id + ' .' + stepTo).html(player.sym);
      _this._checkWin(player);  
    }
// Here is my huge algorithm for the computer run 
// The grid
// 0 1 2 
// 3 4 5 
// 6 7 8 
    switch(_this.runs) {
 // When the computer starts the game it select random cell from the list of corner cells plus center cell
 // Step to the center is more successful but for being more humane computer will step to one of the corners in 40% cases 
      case 0:
        if (Math.floor(Math.random() * 10) < 4) { 
          stepTo = selectRandomCell([0, 2, 6, 8]);
        }
        else {
          stepTo = 4;
        }     
        break;
 // Human started, computer is making first step if center is free it goes to the center else to the one of the corners
      case 1:
        if (_this.grid[4] === '') {
          stepTo = 4;
        }
        else {
          stepTo = selectRandomCell([0, 2, 6, 8]);  
        }
        break;
 //Computer starts first and is making second step
      case 2:
        if (_this.grid[4] === player.sym) {
          if (_this.grid[1] === player.enemy.sym || _this.grid[3] === player.enemy.sym || _this.grid[5] === player.enemy.sym  
              || _this.grid[7] === player.enemy.sym) {
            stepTo = selectRandomCell([0, 2, 6, 8]);
          }
          else {
            if (_this.grid[0] === player.enemy.sym) {
              stepTo = 8;
            }
            else if (_this.grid[2] === player.enemy.sym) {
              stepTo = 6;
            }
            else if (_this.grid[6] === player.enemy.sym) {
              stepTo = 2;
            }
            else {
              stepTo = 0;
            }        
          }
        }
        else {
          if (_this.grid[4] === '') {
            if (_this.grid[7] === player.enemy.sym && _this.grid[2] === player.sym) {
              stepTo = 8;
            }
            else if (_this.grid[7] === player.enemy.sym &&_this.grid[0] === player.sym) {
              stepTo = 6;
            }
            else if (_this.grid[5] === player.enemy.sym && _this.grid[0] === player.sym) {
              stepTo = 2;
            }
            else if (_this.grid[5] === player.enemy.sym &&_this.grid[6] === player.sym) {
              stepTo = 8;
            }    
            else if (_this.grid[1] === player.enemy.sym && _this.grid[6] === player.sym) {
              stepTo = 0;
            }
            else if (_this.grid[1] === player.enemy.sym &&_this.grid[8] === player.sym) {
              stepTo = 2;
            }
            else if (_this.grid[3] === player.enemy.sym && _this.grid[8] === player.sym) {
              stepTo = 6;
            }
            else if (_this.grid[3] === player.enemy.sym && _this.grid[2] === player.sym) {
              stepTo = 0;
            }
            else if ((_this.grid[2] === player.sym && _this.grid[8] === player.enemy.sym) 
                  || 
                     (_this.grid[8] === player.sym && _this.grid[2] === player.enemy.sym)) {
               stepTo = selectRandomCell([0, 6]);
            }
            else if ((_this.grid[0] === player.sym && _this.grid[2] === player.enemy.sym)
                  ||
                     (_this.grid[2] === player.sym && _this.grid[0] === player.enemy.sym)) {
               stepTo = selectRandomCell([6, 8]);
            }
            else if ((_this.grid[6] === player.sym && _this.grid[0] === player.enemy.sym)
                  ||
                     (_this.grid[0] === player.sym && _this.grid[6] === player.enemy.sym)) {
               stepTo = selectRandomCell([2, 8]);
            }
            else if ((_this.grid[8] === player.sym && _this.grid[6] === player.enemy.sym)
                  ||
                     (_this.grid[6] === player.sym && _this.grid[8] === player.enemy.sym)) {
               stepTo = selectRandomCell([0, 2]);
            }
            else {
               stepTo = 4;
            }
          } 
          else {
            if (_this.grid[2] === player.sym) {
              stepTo = 6;
            }
            else if (_this.grid[0] === player.sym) {
              stepTo = 8;
            }
            else if (_this.grid[6] === player.sym) {
              stepTo = 2;
            }
            else {
              stepTo = 0;
            }
          }
        }    
        break;
 // Human started, computer is making it's second step
      case 3:
 // Check if the computer can lose when human will make next step if Yes make corresponding step, else (checkForWinLose(player.enemy.sym) returns false)
        var report = analize(_this.grid);
        if (report[0] === false) {
          if (report[1] === false) {
            if (_this.grid[4] === player.sym) {
              if (
                    (_this.grid[0] === player.enemy.sym && _this.grid[8] === player.enemy.sym) 
                 ||  
                    (_this.grid[2] === player.enemy.sym && _this.grid[6] === player.enemy.sym)  
                 ) {
                 stepTo = selectRandomCell([1, 3, 5, 7]);
              }
              else if (
                    (_this.grid[1] === player.enemy.sym && _this.grid[7] === player.enemy.sym) 
                 ||  
                    (_this.grid[3] === player.enemy.sym && _this.grid[5] === player.enemy.sym)  
                      ) {
                  stepTo = selectRandomCell([0, 2, 6, 8]);
              }
              else if (_this.grid[1] === player.enemy.sym && _this.grid[3] === player.enemy.sym) {
                 stepTo = selectRandomCell([0, 2, 6]);
              }
              else if (_this.grid[1] === player.enemy.sym && _this.grid[5] === player.enemy.sym) {
               stepTo = selectRandomCell([0, 2, 8]);
              }
              else if (_this.grid[5] === player.enemy.sym && _this.grid[7] === player.enemy.sym) {
                 stepTo = selectRandomCell([2, 6, 8]);
              }
              else if (_this.grid[3] === player.enemy.sym && _this.grid[7] === player.enemy.sym) {
                 stepTo = selectRandomCell([0, 6, 8]);
              }
              else if (_this.grid[3] === '' && _this.grid[5] === '') {
                if (_this.grid[7] === player.enemy.sym) {
                  stepTo = selectRandomCell([6, 8]);  
                }
                else {
                  stepTo = selectRandomCell([0, 2]); 
                }
              }       
              else {
                if (_this.grid[5] === player.enemy.sym) {
                  stepTo = selectRandomCell([2, 8]);  
                }
                else {
                  stepTo = selectRandomCell([0, 6]); 
                }                
              }            
            }
            else {
              stepTo = selectRandomCell([0, 2, 6, 8]);
            }                                 
          }       
          else {
            stepTo = report[1];
          }
        }
        else {
          stepTo = report[0];
        }
        break;
      case 5:
        report = analize(_this.grid);
        if (report[0] !== false) {
          stepTo = report[0];
        }
        else if (report[1] !== false) {
          stepTo = report[1];
        }
        else if (
              (_this.grid[2] === player.enemy.sym && _this.grid[3] === player.enemy.sym && _this.grid[8] === player.enemy.sym)
          ||
              (_this.grid[1] === player.enemy.sym && _this.grid[6] === player.enemy.sym && _this.grid[8] === player.enemy.sym)
          ||
              (_this.grid[0] === player.enemy.sym && _this.grid[5] === player.enemy.sym && _this.grid[6] === player.enemy.sym)
          ||  
              (_this.grid[0] === player.enemy.sym && _this.grid[2] === player.enemy.sym && _this.grid[7] === player.enemy.sym)
           ) {
                stepTo == selectRandomCell([0, 2, 6, 8]);
        }
        else {
          stepTo = findFork(report);
          if (stepTo === false) {
            if (report[2] !== false) {
              stepTo = report[2];
            }
            else {
              stepTo = report[3];
            }
          }    
        }       
      default:
        report = analize(_this.grid);
        if (report[0] !== false) {
          stepTo = report[0];
        }
        else if (report[1] !== false) {
          stepTo = report[1];
        }
        else {
          if (_this.runs < 7) {
            stepTo = findFork(report);
            if (stepTo === false) {
              if (report[2] !== false) {
                stepTo = report[2];
              }
              else {
                stepTo = report[3];
              }
            } 
          }
          else {
            if (report[2] !== false) {
                stepTo = report[2];
              }
            else {
              stepTo = report[3];
            }
          }   
        }      
    } // switch
    goStep();  
  }   
  
  $(player.namePlate).addClass('blinking');
  _this.blinkingInt = setInterval(function () {  
      blink(player.namePlate);
    }, 600);
  setTimeout(makeStep, 1500);
}

MakeTicTacToe.prototype._checkWin = function (player) {
  var _this = this;
  this.runs++;
  if (this.runs > 4) {
    var line = [];
    //Check gorizontal lines
    for (var i = 0; i < 9; i+=3) {
      if (this.grid[i] === this.grid[i + 1] && this.grid[i] === this.grid[i + 2] && this.grid[i] !== '') {
        for (var j = 0; j < 3; j++) {
          line.push($(this.id + ' .' + (i + j))[0]);
        }
         this._winDrawHandler('win',player, line);
         return;
      }
    }
  //Check vertical lines
    for (var i = 0; i < 3; i++) {
      if (this.grid[i] === this.grid[i + 3] && this.grid[i] === this.grid[i + 6] && this.grid[i] !== '') {
        for (var j = 0; j < 9; j+=3) {
          line.push($(this.id + ' .' + (i + j))[0]);
        }      
        this._winDrawHandler('win',player, line);
        return;
      }
    }
  //Check diagonals
    if (this.grid[0] === this.grid[4] && this.grid[0] === this.grid[8] && this.grid[0] !== '') {
      for (var i = 0; i < 9; i+=4) {
        line.push($(this.id + ' .' + i)[0]);
      }  
        this._winDrawHandler('win',player, line);
        return;
     }
    if (this.grid[2] === this.grid[4] && this.grid[2] === this.grid[6] && this.grid[2] !== '') {
      for (var i = 2; i < 7; i+=2) {
        line.push($(this.id + ' .' + i)[0]);
      }
      this._winDrawHandler('win',player, line);
      return;
    }
  }
  if (this.runs < 9) {
    this.players[Math.abs(player.playerId - 1)].run(_this);
  }
  else {
    setTimeout(function () {
      _this._winDrawHandler('draw');
    }, 1000);
  }
}

MakeTicTacToe.prototype._winDrawHandler = function (result, player, line) {
  var _this = this;
  function startNewGame() {
    _this._clearMatrix(line);
    _this._play(_this);
  }
  
  function showWinScreen() {
    $(this.id + ' .grid').css('opacity', '0.1');
    $(this.id + ' .result').addClass('win');
  }  
  
  if (result == 'draw') {
    this._loadScreen('drawScreen');
    this.newGameTimeout = setTimeout(function () {
      startNewGame();
    }, 4000); 
  }
  else {
    $(player.scorePlate).html(++player.score);
    if (player.score > 99) {
      this._loadDefaults();
      return;
    }
    this._loadScreen('pickOutCells', line, player);
    if (this.onePlayer) {
      this.screenTimeout = setTimeout(function () {
        _this._loadScreen('computerWinScreen');
      }, 1500);
    } 
    else {
      this.screenTimeout = setTimeout(function () {
        _this._loadScreen('playerWinScreen');
      }, 1500);
    }         
    this.newGameTimeout = setTimeout(function () {
      startNewGame();
    }, 4000); 
  }  
}

$(document).ready(function($) { 
  var tictac = new MakeTicTacToe($('#tictac'));    

});