Page({
  data: {
    started: false,
    bestScore: 0
  },

  onLoad() {
    const app = getApp()
    this.setData({
      bestScore: app.globalData.bestScore || 0
    })
  },

  startGame() {
    this.setData({ started: true })
    getApp().globalData.gameStarted = true
  },

  resetGame() {
    this.setData({ started: false })
    getApp().globalData.gameStarted = false
  }
})
