const InputManager = require('./core/input-manager')
const SceneManager = require('./core/scene-manager')
const InventoryState = require('./core/inventory-state')
const MainMenuScene = require('./scenes/main-menu-scene')
const GameScene = require('./scenes/game-scene')
const ShopScene = require('./scenes/shop-scene')
const InventoryScene = require('./scenes/inventory-scene')
const CurrencyState = require('./core/currency-state')

class GameApp {
  constructor() {
    this.canvas = wx.createCanvas()
    this.viewport = {
      width: 375,
      height: 667
    }
    this.context = this.canvas.getContext('2d')
    this.scenes = new SceneManager()
    this.inventory = new InventoryState()
    this.currency = new CurrencyState()
    this.lastFrameTime = 0
    this.started = false
    this.initializing = false
  }

  start() {
    this.initializeRuntime()
  }

  initializeRuntime() {
    if (this.started || this.initializing) return
    this.initializing = true
    const applySystemInfo = (systemInfo) => {
      if (systemInfo && systemInfo.windowWidth && systemInfo.windowHeight) {
        this.viewport.width = systemInfo.windowWidth
        this.viewport.height = systemInfo.windowHeight
      }
      this.canvas.width = this.viewport.width
      this.canvas.height = this.viewport.height
      this.input = new InputManager()
      this.input.onTap(this.handleTap.bind(this))
      this.input.onDrag(this.handleDrag.bind(this))
      this.showMainMenu()
      this.started = true
      this.initializing = false
      this.requestFrame(0)
    }

    if (typeof wx.getSystemInfo === 'function') {
      wx.getSystemInfo({
        success: applySystemInfo,
        fail: () => {
          this.initializing = false
          setTimeout(() => this.initializeRuntime(), 50)
        }
      })
      return
    }

    let systemInfo = null
    try {
      if (typeof wx.getSystemInfoSync === 'function') systemInfo = wx.getSystemInfoSync()
    } catch (error) {
      // The bridge can be unavailable during the first few milliseconds in DevTools.
    }
    applySystemInfo(systemInfo)
  }

  showMainMenu() {
    this.scenes.change(new MainMenuScene(this.viewport, this.showGame.bind(this), this.showShop.bind(this), this.currency, this.showInventory.bind(this)))
  }

  showGame() {
    this.scenes.change(new GameScene(this.viewport, this.showMainMenu.bind(this), this.inventory))
  }

  showShop() {
    this.scenes.change(new ShopScene(this.viewport, this.showMainMenu.bind(this), this.currency, this.inventory))
  }

  showInventory() {
    this.scenes.change(new InventoryScene(this.viewport, this.showMainMenu.bind(this), this.inventory, this.currency))
  }

  handleTap(x, y) {
    this.scenes.handleTap(x, y)
  }

  handleDrag(x, y, started) {
    if (this.scenes.handleDrag) this.scenes.handleDrag(x, y, started)
  }

  requestFrame(timestamp) {
    if (!this.started) return
    const deltaTime = this.lastFrameTime ? timestamp - this.lastFrameTime : 0
    this.lastFrameTime = timestamp
    this.scenes.update(deltaTime)
    this.scenes.draw(this.context)
    this.frameRequest = requestAnimationFrame(this.requestFrame.bind(this))
  }
}

module.exports = GameApp
