const InputManager = require('./core/input-manager')
const SceneManager = require('./core/scene-manager')
const MainMenuScene = require('./scenes/main-menu-scene')
const GameScene = require('./scenes/game-scene')

class GameApp {
  constructor() {
    const systemInfo = wx.getSystemInfoSync()
    this.canvas = wx.createCanvas()
    this.viewport = {
      width: systemInfo.windowWidth,
      height: systemInfo.windowHeight
    }
    this.canvas.width = this.viewport.width
    this.canvas.height = this.viewport.height
    this.context = this.canvas.getContext('2d')
    this.input = new InputManager()
    this.scenes = new SceneManager()
    this.lastFrameTime = 0
  }

  start() {
    this.input.onTap(this.handleTap.bind(this))
    this.showMainMenu()
    this.requestFrame(0)
  }

  showMainMenu() {
    this.scenes.change(new MainMenuScene(this.viewport, this.showGame.bind(this)))
  }

  showGame() {
    this.scenes.change(new GameScene(this.viewport, this.showMainMenu.bind(this)))
  }

  handleTap(x, y) {
    this.scenes.handleTap(x, y)
  }

  requestFrame(timestamp) {
    const deltaTime = this.lastFrameTime ? timestamp - this.lastFrameTime : 0
    this.lastFrameTime = timestamp
    this.scenes.update(deltaTime)
    this.scenes.draw(this.context)
    this.frameRequest = requestAnimationFrame(this.requestFrame.bind(this))
  }
}

module.exports = GameApp
