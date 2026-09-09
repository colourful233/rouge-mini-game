// 小游戏入口。后续可在此初始化 Canvas、资源和游戏主循环。
const systemInfo = wx.getSystemInfoSync()

const canvas = wx.createCanvas()
canvas.width = systemInfo.windowWidth
canvas.height = systemInfo.windowHeight

const context = canvas.getContext('2d')
context.fillStyle = '#101923'
context.fillRect(0, 0, canvas.width, canvas.height)
