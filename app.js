App({
  globalData: {
    gameStarted: false,
    bestScore: 0
  },

  onLaunch() {
    const bestScore = wx.getStorageSync('bestScore') || 0
    this.globalData.bestScore = bestScore
  }
})
