WIDTH = 60;
EXTRA_WIDTH = 22;
HEIGHT = 60;
VASES = 15;
HP_VASE = '\u03A8';
HP_VASE_COLOR = "#ff0";
MP_VASE = '\u03A9';
MP_VASE_COLOR = "#09f";
DEFAULT_COLOR = '#e2c900';
SINGLE_WALL = '#';
WALLS = [SINGLE_WALL];
MAP_SATURATION = 0.35;
TORCH_DISTANCE = 5;
STARTING_ENEMY_DISTANCE = 7;
MUMMY_CHAR = '@';
ENEMY_CHAR = 'T';
ENEMIES = 10;
HP = 10;
MANA = 3;
YEARS = ["1150BC", "525BC", "333BC", "30BC", "619AD"];
ENEMY_HP =     [1, 2, 2, 3, 3];
ENEMY_DAMAGE = [1, 1, 2, 2, 3];

INTRO_TEXT = [
    "Several thousand years ago,",
    "you have died a noble pharaoh.",
    "You were buried in a giant ",
    "tomb, along with many artifacts",
    "that belonged to you in life.",
    "Now some pesky tomb raiders",
    "have come to steal your treasures.",
    "Clear the tomb of their presence",
    "and go back to well-deserved sleep."
];

var Game = {
    display: null,
    player: null,
    enemies: {},
    map: {},
    litUp: {},
    schduler: null,
    engine: null,
    level: 0,
    year: null,
 
    init: function() {
        this.display = new ROT.Display({
                width: WIDTH + EXTRA_WIDTH,
                height: HEIGHT,
                fontSize: 14,
                forceSquareRatio: true,
                bg: "#000"
            });
        document.body.appendChild(this.display.getContainer());

        this.scheduler = new ROT.Scheduler.Simple();
        this.engine = new ROT.Engine(this.scheduler);
        this.nextLevel();
        // this.nextLevel();
        this.engine.start();
    },

    addLevelText: function() {
        var textElement = document.createElement("div");
        textElement.setAttribute("id", "levels");
        textElement.innerText = "WOOHOOOO PASSED LEVEL"
    },

    nextLevel: function() {
        this.level += 1;
        this.year = YEARS[this.level - 1];
        this.scheduler.clear();
        // this.scheduler.add(new InfoBox(INTRO_TEXT));
        Game._generateMap();
        this.scheduler.add(this.player, true);
        for(var enemyPos in this.enemies)
            this.scheduler.add(this.enemies[enemyPos], true);
        Game.printStats(true);
    }
};

var InfoBox = function(text) {
    this.text = text;
};

InfoBox.prototype.act = function() {
    console.log("Run");
    Game.display.draw(1, 1, text[0]);
    Game.engine.lock();
    window.addEventListener("keydown", this);
};

InfoBox.prototype.handleEvent = function(e) {
    if (e.keyCode === 13) {
        window.removeEventListener("keydown", this);
        Game.engine.unlock();
    }
};

Game.printStats = function(first=false) {
    var OFFSET = WIDTH + 5;
    var TOP_OFFSET = 1;
    if (first) this.display.draw(WIDTH + 10, TOP_OFFSET, "Tomb of the Mummy RL", "orange");
    if (first) this.display.draw(WIDTH + 10, TOP_OFFSET + 1.2, "Level " + this.level + ": Year " + this.year, "orange");
    TOP_OFFSET += 4;
    if (first) this.display.draw(OFFSET, TOP_OFFSET, "HP: ");
    for(var i = 0; i < Game.player.hp; i++) this.display.draw(OFFSET + 2 + i, TOP_OFFSET, "*", "#0f0");
    for(var i = Game.player.hp; i < HP; i++) this.display.draw(OFFSET + 2 + i, TOP_OFFSET, "*", "grey");
    TOP_OFFSET += 2;
    if (first) this.display.draw(OFFSET, TOP_OFFSET, "Mana: ");
    for(var i = 0; i < Game.player.mp; i++) this.display.draw(OFFSET + 2 + i, TOP_OFFSET, "*", "#05f");
    for(var i = Game.player.mp; i < MANA; i++) this.display.draw(OFFSET + 2 + i, TOP_OFFSET, "*", "grey");
    TOP_OFFSET += 2;
    OFFSET -= 1;
    if (first) this.display.draw(OFFSET, TOP_OFFSET, "Enemies: ");
    for(i = 0; i < Object.keys(Game.enemies).length; i++) this.display.draw(OFFSET + 3 + i, TOP_OFFSET, "*", "red");
    for(i = Object.keys(Game.enemies).length; i < ENEMIES; i++) this.display.draw(OFFSET + 3 + i, TOP_OFFSET, "*", "grey");
    TOP_OFFSET += 2;
    OFFSET += 5;

    if (first) this.display.draw(OFFSET, TOP_OFFSET, "Enemy HP: " + ENEMY_HP[Game.level - 1]);
    if (first) this.display.draw(OFFSET, TOP_OFFSET + 2, "Enemy damage: " + ENEMY_DAMAGE[Game.level - 1]);

    if (first) {
        HELP_OFFSET = 16;
        OFFSET += 1;
        for(var i = 0; i < INTRO_TEXT.length; i++)
            this.display.draw(OFFSET, HELP_OFFSET + i, INTRO_TEXT[i], "white");

        HELP_OFFSET = 26;
        this.display.draw(OFFSET, HELP_OFFSET, MUMMY_CHAR + " - the mummy (you)", "#0f0");
        this.display.draw(OFFSET, HELP_OFFSET + 1, HP_VASE + " - vase that replenishes HP", HP_VASE_COLOR);
        this.display.draw(OFFSET, HELP_OFFSET + 2, MP_VASE + " - vase that replenishes mana", MP_VASE_COLOR);
        this.display.draw(OFFSET, HELP_OFFSET + 3, ENEMY_CHAR + " - Tomb raider", "red");
        this.display.draw(OFFSET, HELP_OFFSET + 4, ". - passage", DEFAULT_COLOR);
        this.display.draw(OFFSET, HELP_OFFSET + 5, "# - wall", DEFAULT_COLOR);

        HELP_OFFSET = 34;
        this.display.draw(OFFSET, HELP_OFFSET, "How to play:", "white");
        this.display.draw(OFFSET, HELP_OFFSET + 2, "Use numpad to move in 8 directions", "white");
        this.display.draw(OFFSET, HELP_OFFSET + 3, "(you can also use yuhjklbn keys)", "white");
        this.display.draw(OFFSET, HELP_OFFSET + 5, "Press . to wait a turn", "white");
        this.display.draw(OFFSET, HELP_OFFSET + 7, "Press Enter to jump in/out of a vase", "white");
        this.display.draw(OFFSET, HELP_OFFSET + 9, "Press w to summon strong wind that ", "white");
    }

};

makeKey = function(x, y) {
    return x + "," + y;
};

randomIndex = function(arr) {
    return Math.floor(ROT.RNG.getUniform() * arr.length);
};

computePath = function(x1, y1, x2, y2, mode="plan") {
    callback = mode === "plan" ? Game.passableCallback : Game.walkableCallback;
    var astar = new ROT.Path.AStar(x2, y2, callback, {topology:8});

    var path = [];
    var pathCallback = function(x, y) {
        path.push([x, y]);
    };
    astar.compute(x1, y1, pathCallback);
    if (path) path.shift();
    return path;
};

Game.countAdjacent = function(x, y) {
    var adjacentFree = 0;
    for(di = -1; di < 2; di++) {
        for(dj = -1; dj < 2; dj++) {
            if (di === 0 && dj === 0) continue;
            newx = x + di;
            newy = y + dj;
            key = makeKey(newx, newy);
            if ((key in this.map) && this.map[key] === '.') ++adjacentFree;
        }
    }
    return adjacentFree;
};

Game._buildWalls = function() {
    for(var x = 0; x < WIDTH; x++) {
        for(var y = 0; y < HEIGHT; y++) {
            if (makeKey(x, y) in this.map) continue;
            if (this.countAdjacent(x, y) === 0) continue;
            var char = SINGLE_WALL;
            // if (!(makeKey(x - 1, y) in this.map) && !(makeKey(x + 1, y) in this.map) && makeKey(x, y - 1) in this.map
            // && !(makeKey(x, y + 1) in this.map)) char = String.fromCharCode(196);
            this.map[makeKey(x, y)] = char;
            // console.log(x, y, char);
        }
    }
};

Game._generateMap = function() {
    var digger = new ROT.Map.Digger(
        width=WIDTH - 2,
        height=HEIGHT - 2,
        {
            dugPercentage: MAP_SATURATION,
            roomHeight: [4, 8],
            roomWidth: [4, 8],
            cooridorLength: [4, 12]
        }
    );
    var freeCells = [];

    var digCallback = function(x, y, value) {
        if (value) return;

        var key = makeKey(x + 1, y + 1);
        this.map[key] = ".";
        freeCells.push([x + 1, y + 1]);
    };
    digger.create(digCallback.bind(this));

    this._generateVases(freeCells);
    this._buildWalls();
    this._createPlayer(freeCells);
    for(var i = 0; i < ENEMIES; i++) {
        var enemy = this._generateEnemy(freeCells);
        this.enemies[makeKey(enemy.x, enemy.y)] = enemy;
    }
    this._drawWholeMap();
};

Game._drawChar = function(key, litUp) {
    var parts = key.split(",");
    var x = parseInt(parts[0]);
    var y = parseInt(parts[1]);
    var color;
    if (Game.player && x === Game.player.x && y === Game.player.y) {
        var player_char = this.map[makeKey(x, y)];
        if (player_char === MP_VASE || player_char === HP_VASE) {
            this.display.draw(x, y, player_char, "#0f0");
            return;
        }
    }
    if (litUp) {
        if (this.map[key] === '.' || WALLS.includes(this.map[key])) color = DEFAULT_COLOR;
        else if (this.map[key] === MP_VASE) color = MP_VASE_COLOR;
        else if (this.map[key] === HP_VASE) color = HP_VASE_COLOR;
        else if (this.map[key] === MUMMY_CHAR) color = "#0f0";
        else color = "#f00";
        this.display.draw(x, y, this.map[key], color);
    } else {
        if (this.map[key] === '.' || WALLS.includes(this.map[key])) color = '#b09800';
        else if (this.map[key] === MP_VASE) color = "#07d";
        else if (this.map[key] === HP_VASE) color = "#dd0";
        else if (this.map[key] === MUMMY_CHAR) color = "#0f0";
        else color = "#e20";
        this.display.draw(x, y, this.map[key], color);
    }
};

Game._drawWholeMap = function() {
    for (var key in this.map) {
        this._drawChar(key, key in Game.litUp);
    }
    if (this.player) Game.printStats();
};

Game._generateVases = function(freeCells) {
    for (var i = 0; i < VASES; i++) {
        while(true) {
            var index = randomIndex(freeCells);
            if (Game.countAdjacent(freeCells[index][0], freeCells[index][1]) === 8) break;
        }
        var key = freeCells.splice(index, 1)[0];
        this.map[key] = Math.random() < 0.5 ? HP_VASE : MP_VASE;
    };
};

Game._createPlayer = function(freeCells) {
    var index = randomIndex(freeCells);
    var key = freeCells.splice(index, 1)[0];
    var x = key[0];
    var y = key[1];
    this.player = new Player(x, y);
};

Game._generateEnemy = function(freeCells) {
    while(true) {
        var index = randomIndex(freeCells);
        if (Math.abs(freeCells[index][0] - this.player.x) <= STARTING_ENEMY_DISTANCE ||
            Math.abs(freeCells[index][1] - this.player.y) <= STARTING_ENEMY_DISTANCE) continue;
        var key = freeCells.splice(index, 1)[0];
        var x = key[0];
        var y = key[1];
        return new Enemy(x, y, ENEMY_CHAR);
    }
};

Game.isPassable = function(key) {
    return key in Game.map && Game.map[key] !== HP_VASE && Game.map[key] !== MP_VASE;
};

Game.passableCallback = function(x, y) {
    return Game.isPassable(makeKey(x, y));
};

Game.walkableCallback = function(x, y) {
    key = makeKey(x, y);
    return key in Game.map && (Game.map[key] === '.' || Game.map[key] === MUMMY_CHAR);
};

Game.recomputeLitUp = function() {
    this.litUp = {};
    for(var enemyPos in this.enemies) {
        var enemy = this.enemies[enemyPos];
        for(var x in enemy.canSee) {
            this.litUp[x] = true;
        }
    }
};

var Enemy = function(x, y, char) {
    this.x = x;
    this.y = y;
    this.hp = ENEMY_HP[Game.level - 1];
    this.damage = ENEMY_DAMAGE[Game.level - 1];
    this.char = char;
    this.path = null;
    this.hasTorch = true;
    this.blockedTurns = 0;
    this.canSee = {};
    this._updateLitUp();
    this._draw()
};

Enemy.prototype._draw = function() {
    // Game.display.draw(this.x, this.y, this.char, "red");
    Game.map[makeKey(this.x, this.y)] = this.char;
    Game._drawWholeMap();
};

Enemy.prototype._updateLitUp = function() {
    var canSee = {};
    if (this.hasTorch) {
        var fov = new ROT.FOV.PreciseShadowcasting(Game.passableCallback);
        var visibilityCallback = function(x, y, distance, dummy) {
            canSee[makeKey(x, y)] = true;
        };
        fov.compute(this.x, this.y, TORCH_DISTANCE, visibilityCallback);
    }
    this.canSee = canSee;
    Game.recomputeLitUp();
};

Enemy.prototype.act = function() {
    var fov = new ROT.FOV.PreciseShadowcasting(Game.passableCallback);
    var seesPlayer = false;
    var nextToPlayer = Math.abs(this.x - Game.player.x) <= 1 && Math.abs(this.y - Game.player.y) <= 1 && !Game.player.hidden;
    var nextToTorch = false;
    for(var dx = -1; dx <= 1; dx++) {
        for(var dy = -1; dy <= 1; dy++) {
            var newx = this.x + dx;
            var newy = this.y + dy;
            var key = makeKey(newx, newy);
            if (key in Game.map && Game.map[key] === ENEMY_CHAR && Game.enemies[key].hasTorch) nextToTorch = true;
        }
    }

    if (nextToPlayer) {
        seesPlayer = true;
    } else {
        if (!Game.player.hidden && makeKey(Game.player.x, Game.player.y) in Game.litUp) seesPlayer = true;
    }

    if (nextToPlayer) {
        Game.player.getAttacked(1);
        return;
    } else if (seesPlayer) {
        Game.map[makeKey(this.x, this.y)] = '.';
        this.path = computePath(this.x, this.y, Game.player.x, Game.player.y, "direct");
        Game.map[makeKey(this.x, this.y)] = this.char;
    } else if (!this.hasTorch && nextToTorch) {
        this.hasTorch = true;
        this._updateLitUp();
        return;
    } else if (!this.path || this.path.length === 0 || this.blockedTurns > 1) {
        this.blockedTurns = 0;
        var distance = Math.floor(Math.random() * (this.hasTorch ? 10 : 1)) + 3;
        var candidates = [];
        for(var i = -distance; i <= distance; i++) {
            for (var sign = -1; sign < 2; sign++) {
                if (sign === 0) continue;
                newx = this.x - i;
                newy = this.y + distance * sign;
                key = makeKey(newx, newy);
                if (Game.isPassable(key)) {
                    candidates.push([newx, newy]);
                }
                newy = this.y - i;
                newx = this.x + distance * sign;
                key = makeKey(newx, newy);
                if (Game.isPassable(key)) {
                    candidates.push([newx, newy]);
                }
            }
        }
        // console.log("candidates", candidates);
        if (candidates.length > 0) {
            for(var tryN = 0; tryN < 5; tryN++) {
                var tmp = candidates[randomIndex(candidates)];
                newx = tmp[0];
                newy = tmp[1];
                this.path = computePath(this.x, this.y, newx, newy);
            }
        }
    }
    // console.log(this.path);

    if (this.path && this.path.length > 0) {
      nextStep = this.path[0];
      if (Game.map[makeKey(nextStep[0], nextStep[1])] === '.') {
          Game.map[makeKey(this.x, this.y)] = '.';
          delete Game.enemies[makeKey(this.x, this.y)];
          this.x = nextStep[0];
          this.y = nextStep[1];
          Game.enemies[makeKey(this.x, this.y)] = this;
          Game.map[makeKey(this.x, this.y)] = this.char;
          this._updateLitUp();
          this._draw();
          this.path.shift();
      } else this.blockedTurns += 1;
    }
};

Enemy.prototype.loseTorch = function() {
    this.hasTorch = false;
    this._updateLitUp();
};

Enemy.prototype.getAttacked = function(damage) {
    this.hp -= damage;
    if (this.hp <= 0) {
        Game.map[makeKey(this.x, this.y)] = '.';
        delete Game.enemies[makeKey(this.x, this.y)];
        Game.scheduler.remove(this);
    }
};

var Player = function(x, y) {
    this.x = x;
    this.y = y;
    this.hp = HP;
    this.mp = MANA;
    this.hidden = false;
    this._draw();
};

Player.prototype.getAttacked = function(damage) {
    this.hp -= damage;
    if (this.hp <= 0) {
        console.log("You died, this time for eternity.")
        // TODO end game
    }
};

Player.prototype._draw = function() {
    if (!this.hidden) Game.map[makeKey(this.x, this.y)] = MUMMY_CHAR;
    Game._drawWholeMap();
};

Player.prototype.act = function() {
    // TODO check number of enemies, end game
    Game.engine.lock();
    window.addEventListener("keydown", this);
};

Player.prototype.handleEvent = function(e) {
    var keyMap = {};
    keyMap[38] = 0;
    keyMap[75] = 0;
    keyMap[33] = 1;
    keyMap[85] = 1;
    keyMap[39] = 2;
    keyMap[76] = 2;
    keyMap[34] = 3;
    keyMap[78] = 3;
    keyMap[40] = 4;
    keyMap[74] = 4;
    keyMap[35] = 5;
    keyMap[66] = 5;
    keyMap[37] = 6;
    keyMap[72] = 6;
    keyMap[36] = 7;
    keyMap[89] = 7;
    keyMap[190] = "wait";
    keyMap[13] = "jump";
    keyMap[87] = "wind";
    keyMap[69] = "exterminate";
    keyMap[191] = "help";

    var code = e.keyCode;

    if (!(code in keyMap)) return;

    if (keyMap[code] === "help") {
        Game.toggleHelp();
        return;
    } else if (keyMap[code] === "wait") {
        // do nothing
    } else if (keyMap[code] === "exterminate") {
        if (this.mp === 0) return;
        this.mp -= 1;
        var KILL_RADIUS = 3;
        // TODO better wind
        for(dx = -KILL_RADIUS; dx <= KILL_RADIUS; dx++) {
            for (dy = -KILL_RADIUS; dy <= KILL_RADIUS; dy++) {
                var key = makeKey(this.x + dx, this.y + dy);
                if (key in Game.map && Game.map[key] === ENEMY_CHAR) {
                    Game.enemies[key].getAttacked(10);
                }
            }
        }
    } else if (keyMap[code] === "wind") {
        if (this.mp === 0) return;
        this.mp -= 1;

        var WIND_RADIUS = 10;
        // TODO better wind
        for(dx = -WIND_RADIUS; dx <= WIND_RADIUS; dx++) {
            for(dy = -WIND_RADIUS; dy <= WIND_RADIUS; dy++) {
                var key = makeKey(this.x + dx, this.y + dy);
                if (key in Game.map && Game.map[key] === ENEMY_CHAR) {
                    Game.enemies[key].loseTorch();
                }
            }
        }
    } else if (keyMap[code] === "jump") {
        if (this.hidden) {
            this.hidden = false;
            if (Game.map[makeKey(this.x, this.y)] === HP_VASE) this.hp = HP; else this.mp = MANA;
        } else {
            var success = false;
            for (var dx = -1; dx <= 1; dx++) {
                for (var dy = -1; dy <= 1; dy++) {
                    if (success) continue;
                    var newx = this.x + dx;
                    var newy = this.y + dy;
                    key = makeKey(newx, newy);
                    if (key in Game.map && (Game.map[key] === HP_VASE || Game.map[key] === MP_VASE)) {
                        this.hidden = true;
                        Game.map[makeKey(this.x, this.y)] = '.';
                        this.x = newx;
                        this.y = newy;
                        success = true;
                    }
                }
            }
            if (!success) return;
        }
    } else {
        if (this.hidden) return;
        var diff = ROT.DIRS[8][keyMap[code]];
        var newX = this.x + diff[0];
        var newY = this.y + diff[1];

        var newKey = makeKey(newX, newY);
        if (!(newKey in Game.map)) return;

        if (Game.map[newKey] === '.') {
            Game.map[makeKey(this.x, this.y)] = '.';
            this.x = newX;
            this.y = newY;
            Game.map[makeKey(this.x, this.y)] = MUMMY_CHAR;
        }
        if (Game.map[newKey] === ENEMY_CHAR) {
            Game.enemies[newKey].getAttacked(1);
        }
    }

    this._draw();
    window.removeEventListener("keydown", this);
    Game.engine.unlock();
};

