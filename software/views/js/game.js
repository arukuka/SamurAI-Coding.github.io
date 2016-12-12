enchant();

// parameters of visualizer
var xsize;
var ysize;
var frame;
var delaytime;

// parameters of game
var title;
var fieldx;
var fieldy;
var maxTurn;
var curTurn;

// 0: full 1: red only 2: blue only 3: red and blue
var sightType;

var fieldIcon;
var surface;
var samuraiIcon;
var patch;
var patchIcon;
var gameTitle;
var redScore, blueScore;
var TurnPlayer;
var IconSize, IconSizeX, IconSizeY;
var samuraiImage;
var scoreScale, scale;
var scoreLabel;
var game;

var samurai;
var field;
var isTimeout;
var Comment;

var curePeriod = 0;

var mouseOverListener;
var samuraiSizeX, samuraiSizeY;
var samuraiOffsetX, samuraiOffsetY;

function initialize() {
  xsize = 64;
  ysize = 32;
  frame = 5;
  delaytime = 30;

  samuraiSizeX = 60;
  samuraiSizeY = 80;
  samuraiOffsetX = samuraiSizeX - xsize;
  samuraiOffsetY = (ysize - samuraiSizeY) / 2 + 5;

  title = 'no name';
  fieldx = 0;
  fieldy = 0;
  maxTurn = 0;
  curTurn = 0;

  sightType = 0;
  fieldIcon = [];
  surface = [];
  samuraiIcon = [];
  patch = [];
  patchIcon = [];
  IconSize = [];
  IconSizeX = [];
  IconSizeY = [];

  samurai = [];
  field = [];
  isTimeout = [];
  Comment = [];
  Comment[0] = "";

  curePeriod = 0;
}


function visibleX(x)
{
  return x + xsize / 10 + samuraiOffsetX;
}

function visibleY(y)
{
  return y - ysize + samuraiOffsetY;
}

function hiddenX(x)
{
  return x + xsize / 10 + samuraiOffsetX / 2;
}

function hiddenY(y)
{
  return y - ysize + samuraiOffsetY / 2;
}

function Cell()
{
  this.x = 0;
  this.y = 0;
  this.owner = -1;
  this.home = -1;
  this.exist = -1;
  this.curing = false;
  this.hidden = [];
}

function Weapon()
{
  this.size = 0;
  this.ox = [];
  this.oy = [];
}

function Samurai()
{
  this.name = '';
  this.home = new Cell();
  this.pos = new Cell();
  this.weapon = new Weapon();
  this.rank = 0;
  this.score = 0;
  this.vision = 0;
  this.activity = 0;
  this.hidden = false;
  this.occupiedTurn = -1;
}


const xmargin = 64;
const ymargin = 64;
const tile = ['rgb(255, 0, 0)', //red
  'rgb(255, 0, 255)',
  'rgb(255, 0, 102)',
  'rgb(0, 110, 255)', //blue
  'rgb(0, 255, 255)',
  'rgb(0, 172, 255)',
  'rgb(153, 153, 153)', //brank
  'rgb(0, 255, 0)', //cure
  'rgb(0, 0, 0)'] //invisible
  const hometile = 'rgb(204, 204, 204)'

  const weapons = {
    "spear": {
      "size": 4,
      "ox": [0, 0, 0, 0],
      "oy": [1, 2, 3, 4]
    },
    "sword": {
      "size": 5,
      "ox": [0, 0, 1, 1, 2],
      "oy": [1, 2, 0, 1, 0]
    },
    "axe": {
      "size": 7,
      "ox": [-1, -1, -1, 0,  1, 1, 1],
      "oy": [-1,  0,  1, 1, -1, 0, 1]
    }
  }

  const homePositions = [
    {"x": 0,  "y": 0},
    {"x": 0,  "y": 7},
    {"x": 7,  "y": 0},
    {"x": 14, "y": 14},
    {"x": 14, "y": 7},
    {"x": 7,  "y": 14},
  ]
  function ParseRecord(log) {
    // init static values
    var json = JSON.parse(log);;
    TurnPlayer = [];
    title = json.title;
    maxTurn = json.plays.length;
    fieldx = 15;
    fieldy = 15;
    curePeriod = 18;

    // init samurai
    for (var p = 0; p < 6; ++p) {
      samurai[p] = new Samurai();
      switch (p % 3) {
        case 0:
          samurai[p].weapon = weapons["spear"];
          break;
        case 1:
          samurai[p].weapon = weapons["sword"];
          break;
        case 2:
          samurai[p].weapon = weapons["axe"];
          break;
      }
      samurai[p].vision = 5
      samurai[p].activity = 7
      samurai[p].pos.x = homePositions[p].x;
      samurai[p].pos.y = homePositions[p].y;
      samurai[p].home.x = homePositions[p].x;
      samurai[p].home.y = homePositions[p].y;
      samurai[p].home.owner = p;
      samurai[p].home.home = p;
    }

    field[0] = new Array();
    isTimeout[0] = -1;
    for (x = 0; x < fieldx; ++x) {
      field[0][x] = new Array();
      for (y = 0; y < fieldy; ++y) {
        field[0][x][y] = new Cell();
        field[0][x][y].x = x;
        field[0][x][y].y = y;
      }
    }
    for (p = 0; p < 6; ++p) {
      field[0][samurai[p].home.x][samurai[p].home.y].owner = p;
      field[0][samurai[p].home.x][samurai[p].home.y].home = p;
      field[0][samurai[p].home.x][samurai[p].home.y].exist = p;
    }
    for (turn = 0; turn < maxTurn; ++turn) {
      var turnPlay = json.plays[turn];
      field[turn+1] = new Array();
      isTimeout[turn+1] = -1;
      // Initialize the field for the turn
      for (i = 0; i < fieldx; ++i) {
        field[turn+1][i] = new Array();
        for (j = 0; j < fieldy; ++j) {
          field[turn+1][i][j] = new Cell();
          field[turn+1][i][j].x = field[turn][i][j].x;
          field[turn+1][i][j].y = field[turn][i][j].y;
          field[turn+1][i][j].owner = field[turn][i][j].owner;
          field[turn+1][i][j].home = field[turn][i][j].home;
          field[turn+1][i][j].exist = field[turn][i][j].exist;
          field[turn+1][i][j].hidden = [];
          for (k = 0; k < field[turn][i][j].hidden.length; ++k) {
            field[turn+1][i][j].hidden[k] = field[turn][i][j].hidden[k];
          }
        }
      }
      var samuraiID = turnPlay.samurai;
      if (turn % 2 == 1) {
        samuraiID += 3;
      }
      TurnPlayer[turn] = samuraiID;
      var turnActions = turnPlay["actions"];
      const COST = [0, 4, 4, 4, 4, 2, 2, 2, 2, 1];
      var cost = 7;
      for (a = 0; a < turnActions.length; ++a) {
        var action = turnActions[a];
        if (action == -1) {
          // timeout
          field[turn+1][samurai[samuraiID].pos.x][samurai[samuraiID].pos.y].exist = -1;
          field[turn+1][samurai[samuraiID].home.x][samurai[samuraiID].home.y].exist = samuraiID;
          samurai[samuraiID].pos.x = samurai[samuraiID].home.x;
          samurai[samuraiID].pos.y = samurai[samuraiID].home.y;
          if (samurai[samuraiID].hidden) {
            for (k = 0; k < field[turn+1][samurai[samuraiID].pos.x][samurai[samuraiID].pos.y].hidden.length; ++k) {
              if (field[turn+1][samurai[samuraiID].pos.x][samurai[samuraiID].pos.y].hidden[k] == samuraiID) {
                field[turn+1][samurai[samuraiID].pos.x][samurai[samuraiID].pos.y].hidden.splice(k, 1);
                break;
              }
            }
            samurai[samuraiID].hidden = false;
          }
          isTimeout[turn+1] = samuraiID;
          break;
        }
        if (action == 0) break;
        if (action > 9) {
          Comment[turn] = "!!! Invalid action code number: " + action + "at turn " + turn;
          break;
        }
        if (COST[action] > cost) {
          Comment[turn] = "!!! Budget overrun at turn " + turn;
          break;
        }
        cost -= COST[action];
        if (samurai[samuraiID].occupiedTurn != -1) break;
        if (1 <= action && action <= 4) { // occupy
          if (samurai[samuraiID].hidden) {

            Comment[turn] = "!!! Cannot occupy under hidden" + " at turn " + turn;
            break;
          }
          ox = samurai[samuraiID].weapon.ox;
          oy = samurai[samuraiID].weapon.oy;
          curx = samurai[samuraiID].pos.x;
          cury = samurai[samuraiID].pos.y;

          for (m = 0; m < samurai[samuraiID].weapon.size; ++m) {
            if (action == 1) {
              x = ox[m]; y = oy[m];
            }
            if (action == 2) {
              x = oy[m]; y = -ox[m];
            }
            if (action == 3) {
              x = -ox[m]; y = -oy[m];
            }
            if (action == 4) {
              x = -oy[m]; y = ox[m];
            }
            tx = curx + x; ty = cury + y;
            if (0 <= tx && tx < fieldx && 0 <= ty && ty < fieldy) {
              if (field[turn+1][tx][ty].home == -1) {
                field[turn+1][tx][ty].owner = samuraiID;
                if (field[turn+1][tx][ty].exist != -1 && ((Math.floor(field[turn+1][tx][ty].exist / 3) ^ Math.floor(samuraiID / 3)) == 1)) {
                  occupiedID = field[turn+1][tx][ty].exist;
                  field[turn+1][tx][ty].exist = -1;
                  samurai[occupiedID].pos.x = samurai[occupiedID].home.x;
                  samurai[occupiedID].pos.y = samurai[occupiedID].home.y;
                  samurai[occupiedID].occupiedTurn = turn+1;
                  field[turn+1][samurai[occupiedID].pos.x][samurai[occupiedID].pos.y].exist = occupiedID;
                  field[turn+1][samurai[occupiedID].pos.x][samurai[occupiedID].pos.y].curing = true;
                }
                for (k = 0; k < field[turn+1][tx][ty].hidden.length; ++k) {
                  if ((Math.floor(field[turn+1][tx][ty].hidden[k] / 3) ^ Math.floor(samuraiID / 3)) == 1) {
                    occupiedID = field[turn+1][tx][ty].hidden[k];
                    samurai[occupiedID].pos.x = samurai[occupiedID].home.x;
                    samurai[occupiedID].pos.y = samurai[occupiedID].home.y;
                    samurai[occupiedID].hidden = false;
                    samurai[occupiedID].occupiedTurn = turn+1;
                    field[turn+1][samurai[occupiedID].pos.x][samurai[occupiedID].pos.y].exist = occupiedID;
                    field[turn+1][samurai[occupiedID].pos.x][samurai[occupiedID].pos.y].curing = true;
                    field[turn+1][tx][ty].hidden.splice(k, 1);
                  }
                }
                field[turn+1][tx][ty].hidden = field[turn+1][tx][ty].hidden.filter(function(item, index) {
                  return !((Math.floor(item / 3) ^ Math.floor(samuraiID / 3)) == 1);
                });
              }
            }
          }
        }
        if (5 <= action && action <= 8) { // move
          ofs = [
            [0, 1],
            [1, 0],
            [0, -1],
            [-1, 0]
          ];
          var nx = samurai[samuraiID].pos.x + ofs[action - 5][0];
          var ny = samurai[samuraiID].pos.y + ofs[action - 5][1];
          if (nx < 0 || fieldx <= nx || ny < 0 || fieldy <= ny) {
            Comment[turn] = "!!! Cannot move to out of field" + " at turn " + turn;
            break;
          }
          var owner = field[turn + 1][samurai[samuraiID].pos.x][samurai[samuraiID].pos.y].owner;
          if (samurai[samuraiID].hidden && (owner == -1 || Math.floor(owner / 3) != turn % 2)) {
            Comment[turn] = "!!! Cannot move to not our territories under hidden" + " at turn " + turn;
            break;
          }
          if (!samurai[samuraiID].hidden) {
            field[turn+1][samurai[samuraiID].pos.x][samurai[samuraiID].pos.y].exist = -1;
          } else {
            field[turn+1][samurai[samuraiID].pos.x][samurai[samuraiID].pos.y].hidden = field[turn+1][samurai[samuraiID].pos.x][samurai[samuraiID].pos.y].hidden.filter(function(item, index) {
              return item != samuraiID;
            });
          }
          if (action == 5) samurai[samuraiID].pos.y++;
          if (action == 6) samurai[samuraiID].pos.x++;
          if (action == 7) samurai[samuraiID].pos.y--;
          if (action == 8) samurai[samuraiID].pos.x--;

          if (!samurai[samuraiID].hidden) {
            field[turn+1][samurai[samuraiID].pos.x][samurai[samuraiID].pos.y].exist = samuraiID;
          } else {
            var curField = field[turn+1][samurai[samuraiID].pos.x][samurai[samuraiID].pos.y];
            var isExist = false;
            curField.exist = -1;
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
        if (action == 9) { // hide & reveal
          if (samurai[samuraiID].hidden) {
            samurai[samuraiID].hidden = false;
            field[turn+1][samurai[samuraiID].pos.x][samurai[samuraiID].pos.y].exist = samuraiID;
            field[turn+1][samurai[samuraiID].pos.x][samurai[samuraiID].pos.y].hidden = field[turn+1][samurai[samuraiID].pos.x][samurai[samuraiID].pos.y].hidden.filter(function(item, index) {
              return item != samuraiID;
            });
          } else {
            var owner = field[turn + 1][samurai[samuraiID].pos.x][samurai[samuraiID].pos.y].owner;
            if (owner == -1 || Math.floor(owner / 3) != turn % 2) {
              Comment[turn] = "!!! Cannot hide on not our territories" + " at turn " + turn;
              break;
            }
            samurai[samuraiID].hidden = true;
            var curField = field[turn+1][samurai[samuraiID].pos.x][samurai[samuraiID].pos.y];
            var isExist = false;
            curField.exist = -1;
            for (var id in curField.hidden) {
              if (id == samuraiID) {
                isExist = true;
              }
            }
            if (!isExist) {
              curField.hidden.push(samuraiID)
            }
          }
          //if($.inArray(field[turn+1][samurai[samuraiID].pos.x][samurai[samuraiID].pos.y].hidden, samuraiID) === -1) {
          //  console.log(`hidden for ${field[turn+1][samurai[samuraiID].pos.x][samurai[samuraiID].pos.y].hidden}`)
          //  console.log(samuraiID)
          //  field[turn+1][samurai[samuraiID].pos.x][samurai[samuraiID].pos.y].hidden.push(samuraiID);
          //}
        }
      }
      // end of cure
      for (p = 0; p < 6; ++p) {
        if (samurai[p].occupiedTurn != -1) {
          if (samurai[p].occupiedTurn + curePeriod <= turn+1) {
            field[turn+1][samurai[p].pos.x][samurai[p].pos.y].curing = false;
            samurai[p].occupiedturn = -1;
          }
          else {
            field[turn+1][samurai[p].pos.x][samurai[p].pos.y].curing = true;
          }		    
        }
      }
      Comment[turn+1] = "";

    }
  }

  function printField(turn) {

    game = new Game(xsize * (fieldx + 1) + xmargin * 2, ysize * (fieldy + 1) + ymargin + 60);

    if (!!mouseOverListener) {
      window.removeEventListener("mousemove", mouseOverListener, false)
    }
    mouseOverListener = window.addEventListener("mousemove", function(e){
      var stage = document.getElementById('enchant-stage');
      if(e){
        mouse_x = (e.pageX-stage.getBoundingClientRect().left-window.pageXOffset)/game.scale;
        mouse_y = (e.pageY-stage.getBoundingClientRect().top-window.pageYOffset)/game.scale;
      }else{
        mouse_x = -9999999; //取得失敗は画面外にいることにする
        mouse_y = -9999999;
      }
    });
    var score = new Array();
    for (i = 0; i < 7; ++i) {
      score[i] = 0;
    }

    gameTitle = new Label(title);
    gameTitle.x = 0;
    gameTitle.y = 0;
    game.rootScene.addChild(gameTitle);
    commentBoard = new Label();
    commentBoard.x = xmargin + xsize * fieldx * 1 / 2;
    commentBoard.y = 0;
    game.rootScene.addChild(commentBoard);


    game.preload("../views/images/r0.png");
    game.preload("../views/images/r1.png");
    game.preload("../views/images/r2.png");
    game.preload("../views/images/b0.png");
    game.preload("../views/images/b1.png");
    game.preload("../views/images/b2.png");

    game.preload(playerIcons[0]);
    game.preload(playerIcons[1]);

    samuraiImage = ["r0", "r1", "r2", "b0", "b1", "b2"];
    game.onload = function () {
      for (i = 0; i < 6; ++i) {
        //*****
        samuraiIcon[i] = new Sprite(samuraiSizeX, samuraiSizeY);
        //*****
        samuraiIcon[i].image = game.assets["../views/images/"+samuraiImage[i]+".png"];
      }
      Turn = new Array();
      redIcon = new Sprite(IconSizeX[0], IconSizeY[0]);
      redIcon.image = game.assets[playerIcons[0]];
      redIcon.scaleX = 64 / IconSize[0];
      redIcon.scaleY = 64 / IconSize[0];
      redIcon.x = xmargin + 64 - IconSizeX[0] / 2;
      redIcon.y = ymargin + ysize * fieldy / 20 - IconSizeY[0] / 2;
      redIcon.visible = true;
      redName = new Label();
      redName.text = userNames[0];
      redName.x = xmargin + 32;
      redName.y = ymargin + ysize * fieldy * 1 / 20 + 32 + 8;
      game.rootScene.addChild(redName);

      blueIcon = new Sprite(IconSizeX[1], IconSizeY[1]);
      blueIcon.image = game.assets[playerIcons[1]];
      blueIcon.scaleX = 64 / IconSize[1];
      blueIcon.scaleY = 64 / IconSize[1];
      blueIcon.x = xmargin + xsize * fieldx + 64 - IconSizeX[1] / 2;
      blueIcon.y = ymargin + ysize * fieldy / 20 - IconSizeY[1] / 2;
      blueIcon.visible = true;
      blueName = new Label();
      blueName.text = userNames[1];
      blueName.x = xmargin + xsize * fieldx + 32;
      blueName.y = ymargin + ysize * fieldy * 1 / 20 + 32 + 8;
      game.rootScene.addChild(blueName);

      for (i = 0; i < 2; i++) {
        Turn[i] = new Label();
        Turn[i].text = "TURN";
        Turn[i].y = ymargin + ysize * fieldy * 1 / 20 - 48;
        Turn[i].visible = false;
        if (i == 0) {
          Turn[i].x = xmargin + 44;
        } else {
          Turn[i].x = xmargin + xsize * fieldx + 44;
        }
        game.rootScene.addChild(Turn[i]);
      }
      for (i = 0; i < fieldx; ++i) {
        fieldIcon[i] = new Array();
        patchIcon[i] = new Array();
        surface[i] = new Array();
        patch[i] = new Array();
        for (j = 0; j < fieldy; ++j) {
          fieldIcon[i][j] = new Sprite(xsize, ysize);
          fieldIcon[i][j].x = xmargin + xsize * (fieldx + 1) / 2 + i * xsize / 2 - j * xsize / 2;
          fieldIcon[i][j].y = ymargin + i * ysize / 2 + j * ysize / 2;
          surface[i][j] = new Surface(xsize, ysize);
          fieldIcon[i][j].image = surface[i][j];

          patchIcon[i][j] = new Sprite(xsize, ysize);
          patchIcon[i][j].x = xmargin + xsize * (fieldx + 1) / 2 + i * xsize / 2 - j * xsize / 2;
          patchIcon[i][j].y = ymargin + i * ysize / 2 + j * ysize / 2;
          patch[i][j] = new Surface(xsize, ysize);
          patchIcon[i][j].image = patch[i][j];

          context = surface[i][j].context;
          context.beginPath();
          context.moveTo(xsize / 2, 0);
          context.lineTo(xsize, ysize / 2);
          context.lineTo(xsize / 2, ysize);
          context.lineTo(0, ysize / 2);
          context.lineTo(xsize / 2, 0);
          context.closePath();
          context.fillStyle = field[turn][i][j].owner == -1 ? tile[6] : tile[field[turn][i][j].owner];
          context.fill();
          context.stroke();

          context = patch[i][j].context;
          context.beginPath();
          context.moveTo(xsize / 2, frame);
          context.lineTo(xsize - frame * 2, ysize / 2);
          context.lineTo(xsize / 2, ysize - frame);
          context.lineTo(frame * 2, ysize / 2);
          context.lineTo(xsize / 2, frame);
          context.closePath();
          context.fillStyle = field[turn][i][j].owner == -1 ? tile[6] : tile[field[turn][i][j].owner];
          context.strokeStyle = field[turn][i][j].owner == -1 ? tile[6] : tile[field[turn][i][j].owner];
          context.fill();
          context.stroke();

          game.rootScene.addChild(fieldIcon[i][j]);
          game.rootScene.addChild(patchIcon[i][j]);
          if (field[turn][i][j].exist != -1) {
            var p = field[turn][i][j].exist;
            samuraiIcon[p].x = visibleX(fieldIcon[i][j].x);
            samuraiIcon[p].y = visibleY(fieldIcon[i][j].y);
          }
          if (field[turn][i][j].home != -1) {
            context = surface[i][j].context;
            context.fillStyle = hometile;
            context.fill();
          }
          score[field[turn][i][j].owner == -1 ? 6 : field[turn][i][j].owner]++;
        }
      }
      for (i = 0; i < 6; ++i) {
        game.rootScene.addChild(samuraiIcon[i]);
      }
      game.rootScene.addChild(redIcon);
      game.rootScene.addChild(blueIcon);

      var sightFullButton = new Button("Full");
      game.rootScene.addChild(sightFullButton);
      sightFullButton.ontouchstart = function() {
        sightType = 0;
        UpdateField(curTurn);
      };
      sightFullButton.x = xmargin;
      sightFullButton.y = ymargin + fieldy * ysize - 50;

      var sightRedButton = new Button("Red");
      sightRedButton.x = xmargin + 60;
      sightRedButton.y = ymargin + fieldy * ysize - 50;
      game.rootScene.addChild(sightRedButton);
      sightRedButton.ontouchstart = function() {
        sightType = 1;
        UpdateField(curTurn);
      };

      var sightBlueButton = new Button("Blue");
      sightBlueButton.x = xmargin + 120;
      sightBlueButton.y = ymargin + fieldy * ysize - 50;
      game.rootScene.addChild(sightBlueButton);
      sightBlueButton.ontouchstart = function() {
        sightType = 2;
        UpdateField(curTurn);
      };

      var sightBothButton = new Button("Both");
      sightBothButton.x = xmargin + 180;
      sightBothButton.y = ymargin + fieldy * ysize - 50;
      game.rootScene.addChild(sightBothButton);
      sightBothButton.ontouchstart = function() {
        sightType = 3;
        UpdateField(curTurn);
      };

      var nextButton = new Button("Next");
      nextButton.x = xmargin + fieldx * xsize;
      nextButton.y = ymargin + fieldy * ysize - 20;
      game.rootScene.addChild(nextButton);
      nextButton.ontouchstart = function() {
        if (curTurn < maxTurn) {
          curTurn++;
          UpdateField(curTurn);
        }
      };

      var prevButton = new Button("Prev");
      prevButton.x = xmargin + fieldx * xsize - 60 ;
      prevButton.y = ymargin + fieldy * ysize - 20;
      game.rootScene.addChild(prevButton);
      prevButton.ontouchstart = function() {
        if (curTurn > 0) {
          curTurn--;
          UpdateField(curTurn);
        }
      };

      var autoButton = new Button("Auto");
      game.rootScene.addChild(autoButton);
      autoButton.ontouchstart = function() {
        AutoUpdate();
      };
      autoButton.x = xmargin + fieldx * xsize;
      autoButton.y = ymargin + fieldy * ysize - 50;

      var stopButton = new Button("Stop");
      stopButton.x = xmargin + fieldx * xsize - 60;
      stopButton.y = ymargin + fieldy * ysize - 50;
      game.rootScene.addChild(stopButton);
      stopButton.ontouchstart = function() {
        game.rootScene.tl.unloop();
      };

      var sightFullButtonSprite = new Sprite(48, 27);
      sightFullButtonSprite.x = sightFullButton.x;
      sightFullButtonSprite.y = sightFullButton.y;
      game.rootScene.addChild(sightFullButtonSprite);

      var sightBlueButtonSprite = new Sprite(48, 27);
      sightBlueButtonSprite.x = sightBlueButton.x;
      sightBlueButtonSprite.y = sightBlueButton.y;
      game.rootScene.addChild(sightBlueButtonSprite);

      var sightRedButtonSprite = new Sprite(48, 27);
      sightRedButtonSprite.x = sightRedButton.x;
      sightRedButtonSprite.y = sightRedButton.y;
      game.rootScene.addChild(sightRedButtonSprite);

      var sightBothButtonSprite = new Sprite(48, 27);
      sightBothButtonSprite.x = sightBothButton.x;
      sightBothButtonSprite.y = sightBothButton.y;
      game.rootScene.addChild(sightBothButtonSprite);

      var prevButtonSprite = new Sprite(48, 27);
      prevButtonSprite.x = prevButton.x;
      prevButtonSprite.y = prevButton.y;
      game.rootScene.addChild(prevButtonSprite);

      var nextButtonSprite = new Sprite(48, 27);
      nextButtonSprite.x = nextButton.x;
      nextButtonSprite.y = nextButton.y;
      game.rootScene.addChild(nextButtonSprite);

      var autoButtonSprite = new Sprite(48, 27);
      autoButtonSprite.x = autoButton.x;
      autoButtonSprite.y = autoButton.y;
      game.rootScene.addChild(autoButtonSprite);

      var stopButtonSprite = new Sprite(48, 27);
      stopButtonSprite.x = stopButton.x;
      stopButtonSprite.y = stopButton.y;
      game.rootScene.addChild(stopButtonSprite);

      var cursorSprite = new Sprite(2, 2);
      game.rootScene.addChild(cursorSprite);
      cursorSprite.addEventListener('enterframe', function() {
        cursorSprite.x = mouse_x + 2;
        cursorSprite.y = mouse_y + 2;
        if (cursorSprite.intersect(sightFullButtonSprite) ||
            cursorSprite.intersect(sightBlueButtonSprite) ||
            cursorSprite.intersect(sightRedButtonSprite) ||
              cursorSprite.intersect(sightBothButtonSprite) ||
                cursorSprite.intersect(prevButtonSprite) ||
                  cursorSprite.intersect(nextButtonSprite) ||
                    cursorSprite.intersect(autoButtonSprite) ||
                      cursorSprite.intersect(stopButtonSprite)
           ) {
             document.body.style.cursor = "pointer";
           }
           else {
             document.body.style.cursor = "default";
           }
      });

      var width = xsize * (fieldx + 1);
      var height = ysize * (fieldy + 1) + ymargin;
      var sum = 0;
      for (s = 0; s < 7; ++s) sum+=score[s];
      scoreScale = new Sprite(width, 50);
      scoreScale.x = xmargin;
      scoreScale.y = height + 10;
      scale = new Surface(width, 50);
      scoreScale.image = scale;
      context = scale.context;

      scoreLabel = new Array();
      sumLabel = new Array();

      context.fillStyle = tile[0];
      context.fillRect(0, 20, width * score[0] / sum, 30);
      var gauze = width * score[0] / sum;
      scoreLabel[0] = new Label(String(score[0]));
      scoreLabel[0].x = xmargin + gauze - scoreLabel[0]._boundWidth; scoreLabel[0].y = height + 10;
      game.rootScene.addChild(scoreLabel[0]);
      context.fillStyle = tile[1];
      context.fillRect(gauze, 20, gauze + width * score[1] / sum, 30);
      gauze += width * score[1] / sum;
      scoreLabel[1] = new Label(String(score[1]));
      scoreLabel[1].x = xmargin + gauze - scoreLabel[1]._boundWidth; scoreLabel[1].y = height + 10;
      game.rootScene.addChild(scoreLabel[1]);
      context.fillStyle = tile[2];
      context.fillRect(gauze, 20, gauze + width * score[2] / sum, 30);
      gauze += width * score[2] / sum;
      scoreLabel[2] = new Label(String(score[2]));
      scoreLabel[2].x = xmargin + gauze - scoreLabel[2]._boundWidth; scoreLabel[2].y = height + 10;
      game.rootScene.addChild(scoreLabel[2]);

      context.fillStyle = tile[6];
      context.fillRect(gauze, 20, gauze + width * score[6] / sum, 30);
      gauze += width * score[6] / sum;

      context.fillStyle = tile[5];
      context.fillRect(gauze, 20, gauze + width * score[5] / sum, 30);
      scoreLabel[5] = new Label(String(score[5]));
      scoreLabel[5].x = xmargin + gauze; scoreLabel[5].y = height + 10;
      game.rootScene.addChild(scoreLabel[5]);
      gauze += width * score[5] / sum;
      context.fillStyle = tile[4];
      context.fillRect(gauze, 20, gauze + width * score[4] / sum, 30);
      scoreLabel[4] = new Label(String(score[4]));
      scoreLabel[4].x = xmargin + gauze; scoreLabel[4].y = height + 10;
      game.rootScene.addChild(scoreLabel[4]);
      gauze += width * score[4] / sum;
      context.fillStyle = tile[3];
      context.fillRect(gauze, 20, gauze + width * score[3] / sum, 30);
      scoreLabel[3] = new Label(String(score[3]));
      scoreLabel[3].x = xmargin + gauze; scoreLabel[3].y = height + 10;
      game.rootScene.addChild(scoreLabel[3]);
      gauze += width * score[3] / sum;

      sumLabel[0] = new Label(String(score[0]+score[1]+score[2]));
      sumLabel[0].x = xmargin + 20; sumLabel[0].y = height - 15;
      game.rootScene.addChild(sumLabel[0]);
      sumLabel[1] = new Label(String(score[3]+score[4]+score[5]));
      sumLabel[1].x = xmargin + width - 20; sumLabel[1].y = height - 15;
      game.rootScene.addChild(sumLabel[1]);

      game.rootScene.addChild(scoreScale);
    };

    var mouse_x;
    var mouse_y;
    game.start();
  }

  function UpdateField(turn) {
    if (turn < 0 || turn > maxTurn) {
      return 0;
    }
    Turn[turn % 2].visible = true;
    Turn[1 - turn % 2].visible = false;
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
        if (field[turn][i][j].exist != -1) {
          nowsamurai[field[turn][i][j].exist] = new Cell();
          nowsamurai[field[turn][i][j].exist].x = i;
          nowsamurai[field[turn][i][j].exist].y = j;
        }
        if (field[turn][i][j].hidden.length != 0) {
          for (k = 0; k < field[turn][i][j].hidden.length; ++k) {
            p = field[turn][i][j].hidden[k];
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
    
    if (Comment[turn] != "\"\"") {
      commentBoard.text = Comment[turn];
    } else {
      commentBoard.text = "";
    }
    var score = new Array();
    for (s = 0; s < 7; ++s) {
      score[s] = 0;
    }
    for (i = 0; i < fieldx; ++i) {
      for (j = 0; j < fieldy; ++j) {
        score[field[turn][i][j].owner == -1 ? 6 : field[turn][i][j].owner]++;
        context = surface[i][j].context;
        c2 = patch[i][j].context;


        if (inSightFilter[i][j] == false) {
          context.fillStyle = tile[8];
          c2.fillStyle = tile[8];
          c2.strokeStyle = tile[8];
          context.fill();
          c2.fill();
          c2.stroke();
          continue;
        }

        if (turn > 0 && field[turn-1][i][j].owner != field[turn][i][j].owner) {
          context.fillStyle = field[turn-1][i][j].owner == -1 ? tile[6] : tile[field[turn-1][i][j].owner];
        } else {
          context.fillStyle = field[turn][i][j].owner == -1 ? tile[6] : tile[field[turn][i][j].owner];
        }
        c2.fillStyle = field[turn][i][j].owner == -1 ? tile[6] : tile[field[turn][i][j].owner];
        c2.strokeStyle = field[turn][i][j].owner == -1 ? tile[6] : tile[field[turn][i][j].owner];
        if (field[turn][i][j].exist != -1) {
          var p = field[turn][i][j].exist;
          samuraiIcon[p].x = visibleX(fieldIcon[i][j].x);
          samuraiIcon[p].y = visibleY(fieldIcon[i][j].y);
          samuraiIcon[p].visible = true;
        }
        if (field[turn][i][j].home != -1) {
          context.fillStyle = hometile;
          if (field[turn][i][j].curing) {
            c2.fillStyle = tile[7];
            c2.strokeStyle = tile[7];
          }
        }
        context.fill();
        context.stroke();
        c2.fill();
        c2.stroke();
        if (field[turn][i][j].hidden.length != 0) {
          for (k = 0; k < field[turn][i][j].hidden.length; ++k) {
            var p = field[turn][i][j].hidden[k];
            if (Math.floor(p / 3) == 0 && sightType == 2) continue;
            if (Math.floor(p / 3) == 1 && sightType == 1) continue;

            if (samuraiIcon[p].scaleX == 1) {
              samuraiIcon[p].scale(0.5, 0.5);
            }
            samuraiIcon[p].x = hiddenX(fieldIcon[i][j].x);
            samuraiIcon[p].y = hiddenY(fieldIcon[i][j].y);
            samuraiIcon[p].visible = true;
          }
        }
      }
    }
    context = scale.context;
    var width = xsize * (fieldx + 1);
    var sum = 0;
    for (s = 0; s < 7; ++s) sum+=score[s];
    context.fillStyle = tile[0];
    context.fillRect(0, 20, width * score[0] / sum, 30);
    var gauze = width * score[0] / sum;
    sumLabel[0].text = String(score[0]+score[1]+score[2]);
    sumLabel[1].text = String(score[3]+score[4]+score[5]);
    scoreLabel[0].text = String(score[0]);
    scoreLabel[0].x = xmargin + gauze - scoreLabel[0]._boundWidth;
    context.fillStyle = tile[1];
    context.fillRect(gauze, 20, gauze + width * score[1] / sum, 30);
    gauze += width * score[1] / sum;
    scoreLabel[1].text = String(score[1]);
    scoreLabel[1].x = xmargin + gauze - scoreLabel[1]._boundWidth;
    context.fillStyle = tile[2];
    context.fillRect(gauze, 20, gauze + width * score[2] / sum, 30);
    gauze += width * score[2] / sum;
    scoreLabel[2].text = String(score[2]);
    scoreLabel[2].x = xmargin + gauze - scoreLabel[2]._boundWidth;

    context.fillStyle = tile[6];
    context.fillRect(gauze, 20, gauze + width * score[6] / sum, 30);
    gauze += width * score[6] / sum;

    context.fillStyle = tile[5];
    context.fillRect(gauze, 20, gauze + width * score[5] / sum, 30);
    scoreLabel[5].text = String(score[5]);
    scoreLabel[5].x = xmargin + gauze;
    gauze += width * score[5] / sum;
    context.fillStyle = tile[4];
    context.fillRect(gauze, 20, gauze + width * score[4] / sum, 30);
    scoreLabel[4].text = String(score[4]);
    scoreLabel[4].x = xmargin + gauze;
    gauze += width * score[4] / sum;
    context.fillStyle = tile[3];
    context.fillRect(gauze, 20, gauze + width * score[3] / sum, 30);
    scoreLabel[3].text = String(score[3]);
    scoreLabel[3].x = xmargin + gauze;
    gauze += width * score[3] / sum;

    document.getElementById("delay").value = delaytime;
    document.getElementById("turn").value = curTurn;
    document.getElementById("turnNum").innerHTML = curTurn;
  }

  function AutoUpdate() {
    if (curTurn < maxTurn && !game.rootScene.tl.looped) {
      game.rootScene.tl.then(function() {
        curTurn++;
        UpdateField(curTurn);
        if (curTurn >= maxTurn) {
          game.rootScene.tl.unloop();
        }
      }).delay(delaytime).loop();
    }
  }

  function RestartAutoUpdate() {
    if (game.rootScene.tl.looped) {
      game.rootScene.tl.queue[0].time = delaytime;
    }
  }

  function setIconSizeOne(p, turn) {
    img = new Image();
    img.src = playerIcons[p];
    img.onload = function() {
      w = this.width;
      h = this.height;
      IconSize[p]= Math.max(w, h, 64);
      IconSizeX[p] = w;
      IconSizeY[p] = h;
      if (p < 1) {
        setIconSizeOne(p + 1, turn);
      } else {
        printField(turn);
      }
    }
  }

  function setIconSize(turn) {
    setIconSizeOne(0, turn);
  }

  function parseLog() {
    if (document.getElementById("hiddenlog").value != "") {
      log = document.getElementById("hiddenlog").value;
    } else {
      return;
    }
    ParseRecord(log);
    document.getElementById("turn").max = maxTurn;
    document.getElementById("maxTurn").innerHTML = String(maxTurn);
    setIconSize(curTurn);
  }
