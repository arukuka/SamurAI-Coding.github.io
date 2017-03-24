enchant();

// Colors
const BackgroundColor = "#306030";
const ScoreColor0 = "#FFC0C0";
const ScoreColor1 = "#C0C0FF";
const MessageColor = "white";
const AlertColor = "#FFC0C0";
const ActionDoneColor = "#FFC000";
const ActionTodoColor = "#00FFFF";
const PlayerNameColors = ["red", "lightblue"];

// parameters of visualizer
var xsize = 64;
var ysize = 32;
var frame = 5;
var delaytime = 10;


// parameters of game
var title;
var fieldx = 15;
var fieldy = 15;
var maxTurn;
var curTurn;

// player information
var playerNames;

// 0: full 1: red only 2: blue only 3: red and blue
var sightType;

var fieldIcon;			// fieldIcon[x][y] is the icon for (x,y)
var surfaces;			// surfaces[prev][new] for prev and new owners
var homeSurfaces;		// homeSurfaces[samurai] for home of samurai
var recoveringSurfaces;		// Home surfaces for recoverng samurai
var invisibleSurface;		// Surface for tile out of sight
var activeSurface;
var samuraiIcon;
var activeMaek;
var scoreScale, scale;
var scoreLabel, totalLabel, matchTotalLabel;
var game;
var commentBoard;

var samurai;
var field;
var isTimeout;
var samuraiIDs = [];
var actions = [];
var turnComment = [];
var turnEvent = [];
var weaponsReady = [];

var curePeriod = 18;

var mouseOverListener;
var samuraiSizeX = 64;
var samuraiSizeY = 86;
var samuraiOffsetX = samuraiSizeX - xsize - 4;
var samuraiOffsetY = (ysize - samuraiSizeY) / 2 + 10;

var playerXs = [];
var playerY;

var orderLabels = [];
var weaponLabels = [];

var pauses = [];

var territories = [];
var firstGameScores;

var stepSounds = [];
var screamSound;
var beepSound;

const blinkInterval = 300;

function swap(a) {
  var tmp = a[0]; a[0] = a[1]; a[1] = tmp;
}

function initialize() {
  title = sessionStorage.gameTitle;
  playerNames = [];
  playerNames[0] = sessionStorage.player0;
  playerNames[1] = sessionStorage.player1;
  if (gameNumber != 0) {
    swap(playerNames);
  }

  // window.onresize = function() {
  //   var width = window.innerWidth;
  //   var stgWidth = width - 100;
  //   var stgHeight = width * 3 / 4;
  //   var stgStyle =  document.getElementById('enchant-stage');
  //   var turnStyle =  document.getElementById('turn').style;
  //   var delayStyle =  document.getElementById('delay').style;
  //   stgStyle.width = `${stgWidth}px`;
  //   stgStyle.height = `${stgHeight}px`;
  //   turnStyle.width = `${stgWidth}px`;
  //   delayStyle.width = `${stgWidth}px`;
  // }

  curTurn = 0;

  sightType = 0;
  fieldIcon = [];
  surface = [];
  samuraiIcon = [];

  samurai = [];
  field = [];
  isTimeout = [];
  turnComment = [""];
}

function visibleX(x) {
  return x + xsize / 10 + samuraiOffsetX;
}

function visibleY(y) {
  return y - ysize + samuraiOffsetY;
}

const hiddenOffsetX =
      [0, -xsize/5, xsize/5, 0, -xsize/5, xsize/5 ];
const hiddenOffsetY =
      [-ysize/4, -ysize/8, -ysize/8, ysize/4, ysize/8, ysize/8];

function hiddenX(x, p) {
  return x + xsize / 10 + samuraiOffsetX / 2 + hiddenOffsetX[p];
}

function hiddenY(y, p) {
  return y - ysize + samuraiOffsetY / 2 + hiddenOffsetY[p];
}

function Cell() {
  this.owner = 6;
  this.homeOf = 6;
  this.visible = -1;
  this.hidden = [];
}

function Samurai() {
  this.name = '';
  this.rank = 0;
  this.score = 0;
  this.vision = 0;
  this.activity = 0;
  this.hidden = false;
  this.recovering = [];
}

const xmargin = 64;
const ymargin = 64;
const tile = ['rgb(255, 80, 80)', //red
	      'rgb(255,  80, 180)',
	      'rgb(255, 160, 100)',
	      'rgb(100, 100, 255)', //blue
	      'rgb(120, 100, 220)',
	      'rgb(100, 180, 220)',
	      '#B0C0B0'];	// neutral
const cureTile = '#00FF00';
const homeTile = '#FFFFFF';
const invisTile = '#000000';
const tileEdge = 'black';
const transparent = 'rgba(0,0,0,0)';

const weapons = [
  {
    "ox": [0, 0, 0, 0],
    "oy": [1, 2, 3, 4]
  },
  {
    "ox": [0, 0, 1, 1, 2],
    "oy": [1, 2, 0, 1, 0]
  },
  {
    "ox": [-1, -1, -1, 0, 1, 1, 1],
    "oy": [-1, 0, 1, 1, -1, 0, 1]
  }
];

const homePositions = [
  { "x": 0, "y": 0 },
  { "x": 0, "y": 7 },
  { "x": 7, "y": 0 },
  { "x": 14, "y": 14 },
  { "x": 14, "y": 7 },
  { "x": 7, "y": 14 },
]

function ParseRecord() {
  maxTurn = gameLog.plays.length;

  // init samurai
  for (var p = 0; p != 6; p++) {
    samurai[p] = new Samurai();
    samurai[p].weapon = weapons[p%3];
    samurai[p].vision = 5
    samurai[p].activity = 7
    samurai[p].x = homePositions[p].x;
    samurai[p].y = homePositions[p].y;
    samurai[p].homeX = homePositions[p].x;
    samurai[p].homeY = homePositions[p].y;
    samurai[p].done = false;
    samurai[p].recovering = [];
    for (var t = 0; t != maxTurn+1; t++) {
      samurai[p].recovering[t] = false;
    }
  }

  isTimeout[0] = -1;
  field[0] = [];
  weaponsReady[0] = 0x3F;
  for (x = 0; x != fieldx; x++) {
    field[0][x] = [];
    for (y = 0; y != fieldy; y++) {
      field[0][x][y] = new Cell();
    }
  }
  for (p = 0; p != 6; p++) {
    field[0][samurai[p].homeX][samurai[p].homeY].owner = p;
    field[0][samurai[p].homeX][samurai[p].homeY].homeOf = p;
    field[0][samurai[p].homeX][samurai[p].homeY].visible = p;
  }
  for (turn = 0; turn != maxTurn; turn++) {
    var comments = "";
    var turnPlay = gameLog.plays[turn];
    turnEvent[turn + 1] = 0;
    field[turn + 1] = [];
    isTimeout[turn + 1] = -1;
    if (turn % 6 == 0) {
      // Start of a new period: reset "done"
      for (p = 0; p != 6; p++) samurai[p].done = false;
    }
    // Initialize the field for the turn
    for (i = 0; i != fieldx; i++) {
      field[turn + 1][i] = [];
      for (j = 0; j != fieldy; j++) {
	var prev = field[turn][i][j];
	var next = new Cell();
	field[turn + 1][i][j] = next;
	next.owner = prev.owner;
	next.homeOf = prev.homeOf;
	next.visible = prev.visible;
	next.hidden = [];
	next.hidden = [].concat(prev.hidden);
      }
    }
    var weapon = turnPlay.samurai;
    samuraiIDs[turn] = weapon;
    if (weapon < 0) {
      actions[turn] = [];
      turnComment[turn+1] = "!!! Disabled due to response time out";
      continue;
    }
    if (3 <= weapon) {
      actions[turn] = [];
      turnComment[turn+1] = "!!! Weapon ID not in the valid range: "
	+ weapon;
      continue;
    }
    var samuraiID = (turn % 2 == 0) ? weapon : weapon + 3;
    var actor = samurai[samuraiID];
    var actorCell = field[turn + 1][actor.x][actor.y];
    var turnActions = turnPlay["actions"];
    actions[turn] = turnActions;
    const COST = [0, 4, 4, 4, 4, 2, 2, 2, 2, 1];
    var budget = 7;
    for (var a = 0; a != turnActions.length; a++) {
      action = turnActions[a];
      if (action == -1) {
	// timeout
	actorCell.visible = -1;
	field[turn + 1][actor.homeX][actor.homeY].visible = samuraiID;
	actor.x = actor.homeX;
	actor.y = actor.homeY;
	if (actor.hidden) {
	  for (var k = 0;
	       k != actorCell.hidden.length;
	       k++) {
	    if (actorCell.hidden[k] == samuraiID) {
	      actorCell.hidden.splice(k, 1);
	      break;
	    }
	  }
	  actor.hidden = false;
	}
	isTimeout[turn + 1] = samuraiID;
	break;
      }
      if (action == 0) break;
      if (actor.recovering[turn]) {
	comments += "!!! Trying to act under recovery";
	break;
      }
      if (actor.done) {
	comments += "!!! Already played in this period"
	break;
      }
      if (action > 9) {
	comments += "!!! Invalid action code number: " + action;
	break;
      }
      budget -= COST[action];
      if (budget < 0) {
	comments += "!!! Budget overrun";
	break;
      }
      if (1 <= action && action <= 4) {
	if (actor.hidden) {
	  comments += "!!! Cannot occupy while stealthy";
	  break;
	}
	var ox = actor.weapon.ox;
	var oy = actor.weapon.oy;
	for (m = 0; m != actor.weapon.ox.length; m++) {
	  var dx, dy;
	  switch (action) {
	  case 1: dx = ox[m]; dy = oy[m]; break;
	  case 2: dx = oy[m]; dy = -ox[m]; break;
	  case 3: dx = -ox[m]; dy = -oy[m]; break;
	  case 4: dx = -oy[m]; dy = ox[m]; break;
	  }
	  tx = actor.x + dx;
	  ty = actor.y + dy;
	  function injury(injured) {
	    var s = samurai[injured];
	    s.x = s.homeX;
	    s.y = s.homeY;
	    field[turn + 1][s.x][s.y].visible = injured;
	    s.hidden = false;
	    for (var t = turn+1; t != turn + curePeriod; t++) {
	      if (t > maxTurn) break;
	      s.recovering[t] = true;
	    }
	    turnEvent[turn + 1] = 1;
	  }
	  if (0 <= tx && tx < fieldx && 0 <= ty && ty < fieldy) {
	    if (field[turn + 1][tx][ty].homeOf == 6) {
	      field[turn + 1][tx][ty].owner = samuraiID;
	      if (field[turn + 1][tx][ty].visible != -1 && ((Math.floor(field[turn + 1][tx][ty].visible / 3) ^ Math.floor(samuraiID / 3)) == 1)) {
		var injured = field[turn + 1][tx][ty].visible;
		injury(injured);
		field[turn + 1][tx][ty].visible = -1;
	      }
	      for (var k = 0;
		   k < field[turn + 1][tx][ty].hidden.length;
		   k++) {
		if ((Math.floor(field[turn + 1][tx][ty].hidden[k] / 3) ^ Math.floor(samuraiID / 3)) == 1) {
		  var injured = field[turn + 1][tx][ty].hidden[k];
		  injury(injured);
		  field[turn + 1][tx][ty].hidden.splice(k, 1);
		}
	      }
	      field[turn + 1][tx][ty].hidden = field[turn + 1][tx][ty].hidden.filter(function (item, index) {
		return !((Math.floor(item / 3) ^ Math.floor(samuraiID / 3)) == 1);
	      });
	    }
	  }
	}
      } else if (5 <= action && action <= 8) { // move
	ofs = [
	  [0, 1],
	  [1, 0],
	  [0, -1],
	  [-1, 0]
	];
	var nx = actor.x + ofs[action - 5][0];
	var ny = actor.y + ofs[action - 5][1];
	if (nx < 0 || fieldx <= nx || ny < 0 || fieldy <= ny) {
	  comments += "!!! Moving out of the field";
	  break;
	}
	if (field[turn][nx][ny].homeOf != samuraiID &&
	    field[turn][nx][ny].homeOf != 6) {
	  comments += "!!! Moving to the home of another samurai";
	  break;
	}
	var owner = field[turn + 1][nx][ny].owner;
	if (actor.hidden &&
	    (owner == 6 || Math.floor(owner / 3) != turn % 2)) {
	  comments += "!!! Moving stealthily to a non-territory cell";
	  break;
	}
	if (!actor.hidden) {
	  actorCell.visible = -1;
	} else {
	  actorCell.hidden = actorCell.hidden.filter(function (item, index) {
	    return item != samuraiID;
	  });
	}
	actor.x = nx;
	actor.y = ny;
	actorCell = field[turn+1][nx][ny];
	if (!actor.hidden) {
	  actorCell.visible = samuraiID;
	} else {
	  var curField = actorCell;
	  var isExist = curField.hidden.filter(function (id) {
	    return id == samuraiID;
	  }).length == 1;
	  if (!isExist) {
	    curField.hidden.push(samuraiID)
	  }
	}
      } else if (action == 9) { // hide or reveal
	if (actor.hidden) {
	  var revealOnAnotherSamurai = false;
	  for (i = 0; i < 6; ++i) {
	    if (i == samuraiID) {
	      continue;
	    }
	    revealOnAnotherSamurai |= actor.x == samurai[i].x && actor.y == samurai[i].y && !samurai[i].hidden;
	  }
	  if (revealOnAnotherSamurai) {
	    comments += "!!! No two samurai can expose in one cell";
	    break;
	  }
	  actor.hidden = false;
	  actorCell.visible = samuraiID;
	  actorCell.hidden = actorCell.hidden.filter(function (item, index) {
	    return item != samuraiID;
	  });
	} else {
	  var owner = field[turn + 1][actor.x][actor.y].owner;
	  if (owner == 6 || Math.floor(owner / 3) != turn % 2) {
	    comments += "!!! Cannot hide on non-territories";
	    break;
	  }
	  actor.hidden = true;
	  var curField = field[turn + 1][actor.x][actor.y];
	  var isExist = false;
	  curField.visible = -1;
	  for (var id in curField.hidden) {
	    if (id == samuraiID) {
	      isExist = true;
	    }
	  }
	  if (!isExist) {
	    curField.hidden.push(samuraiID)
	  }
	}
      }
    }
    if (!actor.recovering[turn]) actor.done = true;
    var remaining = 0;
    for (var k = 0; k != 3; k++) {
      var s = (turn % 2 == 0) ? k : k + 3;
      if (!samurai[s].done) {
	remaining += 1 << k;
      }
    }
    weaponsReady[turn+1] = remaining;
    if (comments != "") {
      console.log(comments+" at turn " + turn
		  + " by samurai " + samuraiID);
      turnEvent[turn+1] = 2;
    }
    turnComment[turn+1] = comments;
  }
  samuraiIDs[maxTurn] = -1;

  // Set pauses
  if (gameLog.pauseAt) {
    for (var p = 0; p != gameLog.pauseAt.length; p++) {
      pauses[p] = parseInt(gameLog.pauseAt[p]);
    }
  }
}

var controlButtons;
var sightButtons;
var pauseButtons = [];

function setButtonThemes() {
  var autoRunning = game.rootScene.tl.looped;
  controlButtons.next.setTheme(curTurn == maxTurn ? "brown" : "green");
  controlButtons.prev.setTheme(curTurn == 0 ? "brown" : "green");
  controlButtons.auto.setTheme(curTurn == maxTurn || autoRunning ?
			       "brown" : "green");
  controlButtons.stop.setTheme(autoRunning ? "green" : "brown");
  controlButtons.done.visible = (curTurn == maxTurn);
  function sightTheme(type) {
    return (sightType == type ? "brown" : "green");
  }
  sightButtons.full.setTheme(sightTheme(0));
  sightButtons.red.setTheme(sightTheme(1));
  sightButtons.blue.setTheme(sightTheme(2));
  sightButtons.both.setTheme(sightTheme(3));

  for (var p = 0; p != pauses.length; p++) {
    pauseButtons[p].setTheme(curTurn == pauses[p] ? "brown" : "blue");
  }
}

function printField() {
  if (!!mouseOverListener) {
    window.removeEventListener("mousemove", mouseOverListener, false)
  }
  mouseOverListener = window.addEventListener("mousemove", function (e) {
    var stage = document.getElementById('enchant-stage');
    if (e) {
      mouse_x = (e.pageX - stage.getBoundingClientRect().left - window.pageXOffset) / game.scale;
      mouse_y = (e.pageY - stage.getBoundingClientRect().top - window.pageYOffset) / game.scale;
    } else {
      mouse_x = -9999999; //取得失敗は画面外にいることにする
      mouse_y = -9999999;
    }
  });

  const fieldSizeX = xsize * fieldx;
  const fieldSizeX1 = fieldSizeX + xsize;
  const fieldSizeY = ysize * fieldy;
  const fieldSizeY1 = fieldSizeY + ysize;

  game.rootScene.backgroundColor = BackgroundColor;
  const samuraiImage = ["r0", "r1", "r2", "b0", "b1", "b2"];
  for (i = 0; i < 6; ++i) {
    samuraiIcon[i] = new Sprite(samuraiSizeX, samuraiSizeY);
    samuraiIcon[i].image =
      game.assets["images/" + samuraiImage[i] + ".png"];
  }

  // Player  names and order indicator
  for (var player = 0; player != 2; player++) {
    const playerX = xmargin + 30 + player * (fieldSizeX-20);
    playerY = ymargin + 30;
    playerXs[player] = playerX;
    var playerName = new Label(playerNames[player]);
    playerName.font = "32px bold";
    playerName.moveTo(playerX - playerName._boundWidth/2,
		      playerY);
    playerName.textAlign = "left";
    playerName.color = PlayerNameColors[player];
    game.rootScene.addChild(playerName);
    var orderLabel = new Label("");
    orderLabel.font = "28px bold";
    orderLabel.moveTo(playerX - orderLabel._boundWidth/2,
		      playerY + 45);
    game.rootScene.addChild(orderLabel);
    orderLabels[player] = orderLabel;
    var weaponLabel = new Label("");
    weaponLabel.font = "20px bold";
    weaponLabel.moveTo(playerX - weaponLabel._boundWidth/2,
		       playerY+76);
    weaponLabel.color = MessageColor;
    game.rootScene.addChild(weaponLabel);
    weaponLabels[player] = weaponLabel;
  }

  // Battlefield Surfaces
  function tileSurface(outer, inner) {
    var surface = new Surface(xsize, ysize);
    var c = surface.context;
    // outer part
    c.beginPath();
    c.moveTo(xsize/2, 0);
    c.lineTo(xsize, ysize/2);
    c.lineTo(xsize/2, ysize);
    c.lineTo(0, ysize/2);
    c.closePath();
    c.fillStyle = outer;
    c.fill();
    c.strokeStyle = tileEdge;
    c.stroke();
    // inner part
    if (outer != inner) {
      c.beginPath();
      c.moveTo(xsize/2, frame);
      c.lineTo(xsize - 2*frame, ysize/2);
      c.lineTo(xsize/2, ysize-frame);
      c.lineTo(2*frame, ysize/2);
      c.closePath();
      c.fillStyle = inner;
      c.fill();
    }
    return surface;
  }

  surfaces = [];
  for (var prev = 0; prev != 7; prev++) {
    surfaces[prev] = [];
    for (var next = 0; next != 7; next++) {
      surfaces[prev][next] = tileSurface(tile[prev], tile[next]);
    }
  }
  homeSurfaces = [];
  recoveringSurfaces = [];
  for (var p = 0; p != 6; p++) {
    homeSurfaces[p] = tileSurface(homeTile, tile[p]);
    recoveringSurfaces[p] = tileSurface(homeTile, cureTile);
  }
  invisibleSurface = tileSurface(invisTile, invisTile);
  activeSurface = tileSurface("white", "white");

  // Battlefield Cells
  const field0 = field[0];
  for (i = 0; i < fieldx; ++i) {
    fieldIcon[i] = [];
    for (j = 0; j < fieldy; ++j) {
      const cellOwner = field0[i][j].owner;
      var x = xmargin + (fieldx + i - j + 1) * xsize / 2;
      var y = ymargin + (i + j) * ysize / 2;

      fieldIcon[i][j] = new Sprite(xsize, ysize);
      fieldIcon[i][j].moveTo(x, y);
      game.rootScene.addChild(fieldIcon[i][j]);
    }
  }
  for (i = 0; i < 6; ++i) {
    game.rootScene.addChild(samuraiIcon[i]);
  }

  function SamuraiButton(label, xoff, yoff, theme, ots) {
    var button =
	new Button(label,
		   ButtonThemes[(theme ? theme : "brown")]);
    button.setTheme = function(theme) {
      this.theme = ButtonThemes[theme];
      this._applyTheme(this.theme.normal);
    };
    button.font = "20px bold";
    button.height = 24;
    button.moveTo(xmargin + xoff, ymargin + fieldy * ysize + yoff);
    button.ontouchstart = ots;
    game.rootScene.addChild(button);
    return button;
  }

  var sightFullButton =
      SamuraiButton("Full", 0, -60, "brown",
		    function () {
		      sightType = 0;
		      UpdateField();
		    });

  var sightRedButton =
      SamuraiButton("Red", 70, -60, "green",
		    function () {
		      sightType = 1;
		      UpdateField();
		    });

  var sightBlueButton =
      SamuraiButton("Blue", 140, -60, "green",
		    function () {
		      sightType = 2;
		      UpdateField();
		    });

  var sightBothButton =
      SamuraiButton("Both", 210, -60, "green",
		    function () {
		      sightType = 3;
		      UpdateField();
		    });

  sightButtons = {
    full: sightFullButton,
    red: sightRedButton,
    blue: sightBlueButton,
    both: sightBothButton
  };

  for (p = 0; p != pauses.length; p++) {
    pauseButtons[p] =
      SamuraiButton(
	pauses[p], 70*p, -20, "blue",
	function () {
	  game.rootScene.tl.unloop();
	  changeTurn(parseInt(this.text));
	});
  }

  var nextButton =
      SamuraiButton("Next", fieldx*xsize, -20, "green",
		    function () {
		      if (curTurn < maxTurn) {
			changeTurn(curTurn+1);
		      }});

  var prevButton =
      SamuraiButton("Prev", fieldx * xsize-70, -20, "green",
		    function () {
		      game.rootScene.tl.unloop();
		      if (curTurn > 0) {
			changeTurn(curTurn-1);
		      }
		    });

  var autoButton =
      SamuraiButton("Auto", fieldx*xsize, -60, "green",
		    function() { AutoUpdate(); });
  var stopButton =
      SamuraiButton("Stop", fieldx*xsize-70, -60, "brown",
		    function () { game.rootScene.tl.unloop(); });
  var doneButton =
      SamuraiButton((gameNumber == 1 ? "Finish" : "2nd Game"),
		    fieldx*xsize-200, -60, "red",
		    function () { FinishGame(); });
  doneButton.visible = false;

  controlButtons = {
    next: nextButton, prev: prevButton,
    auto: autoButton, stop: stopButton,
    done: doneButton };
  document.body.style.cursor = "pointer";

  var width = xsize * (fieldx + 1);
  var height = ysize * (fieldy + 1) + ymargin;
  var sum = 0;
  scoreScale = new Sprite(width, 50);
  scoreScale.moveTo(xmargin, height + 10);
  scale = new Surface(width, 50);
  scoreScale.image = scale;
  context = scale.context;

  scoreLabel = [];
  totalLabel = [];
  matchTotalLabel = [];

  for (var k = 0; k != 6; k++) {
    label = new Label(1);
    label.y = height + 10;
    label.font = "18px bold";
    label.color = (k < 3 ? ScoreColor0 : ScoreColor1);
    game.rootScene.addChild(label);
    scoreLabel[k] = label;
  }

  function ScoreLabel(x, y, a) {
    var label = new Label("");
    label.moveTo(x, y);
    label.color = MessageColor;
    label.font = "32px bold";
    label.textAlign = a;
    game.rootScene.addChild(label);
    return label;
  }

  totalLabel[0] = ScoreLabel(xmargin-310, height+25, "right");
  totalLabel[1] = ScoreLabel(xmargin+width+10, height+25, "left");
  game.rootScene.addChild(scoreScale);
  scoreScale.moveTo(xmargin, height + 10);
  matchTotalLabel[0] = ScoreLabel(180, playerY, "left");
  matchTotalLabel[1] = ScoreLabel(width-400, playerY, "right");
  RenderTerritoryBar([1,1,1,1,1,1,15*15-6]);

  var titleLabel = new Label(title);
  titleLabel.font = "28px bold";
  titleLabel.color = MessageColor;
  titleLabel.width = width;
  titleLabel.moveTo(10, 5);
  game.rootScene.addChild(titleLabel);

  var gameNumberLabel =
      new Label(gameNumber == 0 ? "First Game" : "Second Game");
  gameNumberLabel.font = "28px bold";
  gameNumberLabel.color = MessageColor;
  gameNumberLabel.textAlign = 'left';
  gameNumberLabel.moveTo(width+xmargin-gameNumberLabel._boundWidth, 5);
  game.rootScene.addChild(gameNumberLabel);

  commentBoard = new Label("");
  commentBoard.font = "28px bold";
  commentBoard.color = AlertColor;
  commentBoard.width = width;
  commentBoard.moveTo(titleLabel.x, titleLabel.y);
  commentBoard.textAlign = "center";
  game.rootScene.addChild(commentBoard);

  var mouse_x;
  var mouse_y;
}

function RenderTerritoryBar(score) {
  context = scale.context;
  var width = xsize * (fieldx + 1);
  var gauze = 0;
  // Red territory sizes
  var total = fieldx * fieldy;
  for (var k = 0; k != 3; k++) {
    var barWidth = width * score[k] / total;
    context.fillStyle = tile[k];
    context.fillRect(gauze, 20, gauze+barWidth, 30);
    gauze += barWidth;
    scoreLabel[k].text = String(score[k]);
    scoreLabel[k].x = xmargin + gauze - scoreLabel[k]._boundWidth;
  }
  // Neutral territory size
  var neutralWidth = width * score[6] / total;
  context.fillStyle = tile[6];
  context.fillRect(gauze, 20, gauze + neutralWidth, 30);
  gauze += neutralWidth;
  // Blue territory sizes
  for (var k = 5; k != 2; k--) {
    var barWidth = width * score[k] / total;
    context.fillStyle = tile[k];
    context.fillRect(gauze, 20, barWidth, 30);
    scoreLabel[k].text = String(score[k]);
    scoreLabel[k].x = xmargin + gauze;
    gauze += barWidth;
  }
  // Territory size sums
  territories[0] = score[0] + score[1] + score[2];
  territories[1] = score[3] + score[4] + score[5];
  for (var p = 0; p != 2; p++) {
    territories[p] = score[3*p] + score[3*p+1] + score[3*p+2];
    totalLabel[p].text = String(territories[p]);
  }
  if (gameNumber != 0) {
    matchTotalLabel[0].text = "total: " +
      (firstGameScores[0] + territories[0]);
    matchTotalLabel[1].text = "total: " +
      (firstGameScores[1] + territories[1]);
  }
}

var blinker = null;
var blinkSurfaces = [];
var blinkToggle = 0;

function setBlink(icon) {
  if (blinker) clearInterval(blinker);
  blinkSurfaces[0] = icon.image;
  blinkSurfaces[1] = activeSurface;
  blinker = setInterval(
    function () {
      icon.image = blinkSurfaces[blinkToggle];
      blinkToggle = 1-blinkToggle;
    }, blinkInterval);
}

function UpdateField() {
  if (curTurn < 0 || curTurn > maxTurn) {
    return 0;
  }
  const weaponName = ["Spr", "Swrd", "Axe"];
  function actionString(t) {
    if (t < 0) return "";
    if (t >= maxTurn) return "Finished";
    if (samuraiIDs[t] < 0) return "Disabled";
    var actionsMade = "";
    actionsMade = weaponName[samuraiIDs[t]] + ":";
    for (var a = 0; a != actions[t].length; a++) {
      const actionName =
	    ["", "S", "E", "N", "W", "s", "e", "n", "w", "X"];
      actionsMade += " " + actionName[actions[t][a]];
    }
    return actionsMade;
  }
  function weaponString(t) {
    if (t >= maxTurn) return "";
    var weapons = weaponsReady[t+1];
    var s = "[";
    for (var w = 0; w != 3; w++) {
      if ((weapons & (1 << w)) != 0) {
	s += " " + weaponName[w];
      }
    }
    return s + " ]";
  }
  for (var p = 0; p != 2; p++) {
    var order = orderLabels[p];
    var weapon = weaponLabels[p];
    if (curTurn%2 == p) {
      order.text = actionString(curTurn);
      order.color = ActionTodoColor;
      weapon.text = weaponString(curTurn);
    } else {
      order.text = actionString(curTurn - 1);
      order.color = ActionDoneColor;
      weapon.text = "";
    }
    order.x = playerXs[p] - order._boundWidth/2;
    weapon.x = playerXs[p] - weapon._boundWidth/2;
  }

  inSightFilter = [];
  defaultsight = sightType == 0 ? true : false;
  for (i = 0; i < fieldx; ++i) {
    inSightFilter[i] = new Array();
    for (j = 0; j < fieldy; ++j) {
      inSightFilter[i][j] = defaultsight;
    }
  }

  nowsamurai = new Array();

  for (i = 0; i < fieldx; ++i) {
    for (j = 0; j < fieldy; ++j) {
      if (field[curTurn][i][j].visible != -1) {
	nowsamurai[field[curTurn][i][j].visible] = new Cell();
	nowsamurai[field[curTurn][i][j].visible].x = i;
	nowsamurai[field[curTurn][i][j].visible].y = j;
      }
      if (field[curTurn][i][j].hidden.length != 0) {
	for (k = 0; k < field[curTurn][i][j].hidden.length; ++k) {
	  p = field[curTurn][i][j].hidden[k];
	  nowsamurai[p] = new Cell();
	  nowsamurai[p].x = i;
	  nowsamurai[p].y = j;
	}
      }
    }
  }

  for (p = 0; p < 6; ++p) {
    samuraiIcon[p].visible = false;
    samuraiIcon[p].scaleX = 1;
    samuraiIcon[p].scaleY = 1;

    for (i = -samurai[p].vision; i <= samurai[p].vision; ++i) {
      for (j = -samurai[p].vision + Math.abs(i); j <= samurai[p].vision - Math.abs(i); ++j) {
	targetx = nowsamurai[p].x + i;
	targety = nowsamurai[p].y + j;
	if (targetx < 0 || fieldx <= targetx || targety < 0 || fieldy <= targety) continue;
	if (Math.floor(p / 3) == 0 && (sightType == 1 || sightType == 3)) inSightFilter[targetx][targety] = true;
	if (Math.floor(p / 3) == 1 && (sightType == 2 || sightType == 3)) inSightFilter[targetx][targety] = true;
      }
    }
  }
  commentBoard.text = turnComment[curTurn];

  var score = [];
  for (s = 0; s != 7; s++) score[s] = 0;

  var nextSamurai = samuraiIDs[curTurn] + 3*(curTurn%2);
  for (i = 0; i < fieldx; ++i) {
    for (j = 0; j < fieldy; ++j) {
      const cell = field[curTurn][i][j];
      const cellOwner = cell.owner;
      score[cellOwner]++;
      fieldIcon[i][j].image =
	!inSightFilter[i][j] ? invisibleSurface :
	cell.homeOf != 6 ? (
	  samurai[cellOwner].recovering[curTurn] ?
	    recoveringSurfaces[cellOwner] :
	    homeSurfaces[cellOwner]
	) :
	curTurn == 0 ? surfaces[cellOwner][cellOwner] :
	surfaces[cellOwner][field[curTurn-1][i][j].owner];
      if (cell.visible != -1) {
	var p = cell.visible;
	samuraiIcon[p].x = visibleX(fieldIcon[i][j].x);
	samuraiIcon[p].y = visibleY(fieldIcon[i][j].y);
	samuraiIcon[p].visible = true;
      }
      for (var k = 0; k != cell.hidden.length; k++) {
	var p = cell.hidden[k];
	if (Math.floor(p / 3) == 0 && sightType == 2) continue;
	if (Math.floor(p / 3) == 1 && sightType == 1) continue;

	if (samuraiIcon[p].scaleX == 1) {
	  samuraiIcon[p].scale(0.5, 0.5);
	}
	samuraiIcon[p].x = hiddenX(fieldIcon[i][j].x, p);
	samuraiIcon[p].y = hiddenY(fieldIcon[i][j].y, p);
	samuraiIcon[p].visible = true;
      }
      if (curTurn != maxTurn) {
	var nextHere = cell.visible == nextSamurai;
	for (var k = 0; k != cell.hidden.length; k++) {
	  nextHere |= (cell.hidden[k] == nextSamurai);
	}
	if (nextHere) setBlink(fieldIcon[i][j]);
      } else if (blinker) {
	clearInterval(blinker);
      }
    }
  }

  if (curTurn != 0) {
    gameLog.plays[curTurn - 1].territories[6] = score[6];
    if (score.toString() !==
	gameLog.plays[curTurn - 1].territories.toString()) {
      commentBoard.text +=
	'!!! This viewer may be BUGGY: '
      'The scores calculated by this viewer and the game manager '
      'do not agrees.';
      console.error(score, gameLog.plays[curTurn - 1].territories);
    }
  }

  RenderTerritoryBar(score);
  document.getElementById("delay").value = delaytime;
  document.getElementById("turn").value = curTurn;
  document.getElementById("turnNum").innerHTML = curTurn;

  setButtonThemes();
}

function RestartAutoUpdate() {
    if (game.rootScene.tl.looped) {
	game.rootScene.tl.queue[0].time = delaytime;
    }
}

function changeTurn(value) {
  if (typeof value != Number) value = parseInt(value);
  if (curTurn != value) {
    curTurn = value;
    var sound =
	curTurn == maxTurn ? endGameSound :
	turnEvent[curTurn] == 1 ? screamSound :
	turnEvent[curTurn] == 2 ? beepSound :
	stepSounds[curTurn%2];
    if (!isNaN(sound.duration)) {
        sound.pause();
        sound.currentTime = 0;
        sound.play();
    }
    UpdateField();
  }
}

function changeDelay(value) {
  delaytime = value;
  RestartAutoUpdate();
}

function AutoUpdate() {
  if (curTurn < maxTurn && !game.rootScene.tl.looped) {
    game.rootScene.tl.then(function () {
      changeTurn(curTurn+1);
      var stopNow = (curTurn >= maxTurn);
      for (var p = 0; p != pauses.length; p++) {
	if (curTurn == pauses[p]) {
	  stopNow = true;
	}
      }
      if (stopNow) {
	game.rootScene.tl.unloop();
	setButtonThemes();
      }
    }).delay(delaytime).loop();
  }
}

function FinishGame() {
  if (gameNumber == 0) {
    sessionStorage.gameNumber = 1;
    sessionStorage.firstGameScores =
      "[" + territories[1] + "," + territories[0] + "]";
    location.reload();
  } else {
    sessionStorage.direction = "forward";
    window.location.href = sessionStorage.nextPage;
  }
}

var gameNumber;
var gameLog;

function preloadAssets() {
  game.preload("images/r0.png");
  game.preload("images/r1.png");
  game.preload("images/r2.png");
  game.preload("images/b0.png");
  game.preload("images/b1.png");
  game.preload("images/b2.png");

  stepSounds[0] = new Audio();
  stepSounds[0].src = "sounds/step1.wav";
  stepSounds[0].volume = 0.4;
  stepSounds[1] = new Audio();
  stepSounds[1].src = "sounds/step2.wav";
  stepSounds[1].volume = 0.3;
  screamSound = new Audio();
  screamSound.src = "sounds/scream.wav";
  screamSound.volume = 0.5;
  beepSound = new Audio();
  beepSound.src = "sounds/beep.wav";
  beepSound.volume = 0.5;
  endGameSound = new Audio();
  endGameSound.src = "sounds/endGame.wav";
  endGameSound.volume = 0.7;
}

function openingSound() {
  var audio = new Audio();
  audio.src = gameNumber == 0 ?
    "sounds/firstGameStart.wav" : "sounds/secondGameStart.wav";
  audio.volume = 0.5;
  audio.muted = false;
  audio.play();
}

function showGame() {
  gameNumber = parseInt(sessionStorage.gameNumber);
  openingSound();
  gameLog = JSON.parse(sessionStorage["gameLog" + gameNumber]);
  firstGameScores = gameNumber == 0 ? null :
    JSON.parse(sessionStorage.firstGameScores);
  initialize();
  game = new Game(xsize * (fieldx + 1) + xmargin * 2,
		  ysize * (fieldy + 1) + ymargin + 60);
  ParseRecord();
  game.onload = function () {
    document.getElementById("turn").max = maxTurn;
    document.getElementById("maxTurn").innerHTML = String(maxTurn);
    curTurn = 0;
    printField();
    UpdateField();
  };
  preloadAssets();
  game.start();
}
