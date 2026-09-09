// 小游戏唯一入口；具体运行逻辑位于 src，按职责拆分。
const GameApp = require('./src/game-app')

const gameApp = new GameApp()
gameApp.start()
