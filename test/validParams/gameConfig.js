var gameConfigArray = [];

gameConfigArray.push({
  "name": "fun game 3v3",
  "maxPlayers" : 2,
  "width" : 40,
  "height" : 40,
  "fog" : 'false',
  "turnStyle" : "realtime"
});

exports.validGameParams = gameConfigArray;


exports.validCheckersGameParams = {
  name : "niks checkers game",
  roleBundle : {
    name : 'Checkers'
  },

  //don't need max players

  ruleBundleGameSettings : {
    customBoardSettings : {
      size : 8
    }
  }
};