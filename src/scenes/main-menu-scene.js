const config = require('../config/game-config')
const drawing = require('../ui/canvas-drawing')

class MainMenuScene {
  constructor(viewport, onStart) {
    this.viewport = viewport
    this.onStart = onStart
  }

  draw(context) {
    const width = this.viewport.width
    const height = this.viewport.height
    const colors = config.colors
    const padding = config.layout.horizontalPadding
    const button = this.getStartButton()

    context.clearRect(0, 0, width, height)
    context.fillStyle = colors.background
    context.fillRect(0, 0, width, height)

    this.drawGrid(context, colors, width, height)
    drawing.drawText(context, 'ROGUELIKE FLIGHT', padding, 54, {
      font: '700 12px sans-serif',
      color: colors.primary
    })
    drawing.drawText(context, config.version.toUpperCase(), width - padding, 54, {
      font: '600 12px sans-serif',
      color: colors.textSubtle,
      align: 'right'
    })

    drawing.drawText(context, '肉鸽小游戏', padding, 144, {
      font: '700 38px sans-serif',
      color: colors.text
    })
    drawing.drawText(context, '每一次起飞，都是一条新的航线', padding, 178, {
      font: '16px sans-serif',
      color: colors.textMuted
    })

    this.drawFlightCard(context, colors, padding, 224, width - padding * 2)

    drawing.fillRoundedRect(context, button.x, button.y, button.width, button.height, 12, colors.primary)
    drawing.drawText(context, '开始游戏', button.x + button.width / 2, button.y + button.height / 2 + 1, {
      font: '700 17px sans-serif',
      color: colors.primaryDark,
      align: 'center',
      baseline: 'middle'
    })
    drawing.drawText(context, '选择路线 · 获取强化 · 挑战首领', width / 2, button.y + button.height + 32, {
      font: '13px sans-serif',
      color: colors.textSubtle,
      align: 'center'
    })
  }

  drawGrid(context, colors, width, height) {
    context.strokeStyle = '#18303d'
    context.lineWidth = 1
    for (let x = 0; x < width; x += 32) {
      context.beginPath()
      context.moveTo(x, 0)
      context.lineTo(x, height)
      context.stroke()
    }
    for (let y = 0; y < height; y += 32) {
      context.beginPath()
      context.moveTo(0, y)
      context.lineTo(width, y)
      context.stroke()
    }
  }

  drawFlightCard(context, colors, x, y, width) {
    const height = 132
    drawing.fillRoundedRect(context, x, y, width, height, 16, colors.panel)
    drawing.strokeRoundedRect(context, x, y, width, height, 16, colors.panelLine, 1)

    context.fillStyle = colors.accent
    context.fillRect(x + 22, y + 22, 4, 42)
    drawing.drawText(context, '今日航线', x + 42, y + 42, {
      font: '600 14px sans-serif',
      color: colors.textMuted
    })
    drawing.drawText(context, '未知空域', x + 42, y + 75, {
      font: '700 23px sans-serif',
      color: colors.text
    })
    drawing.drawText(context, '随机事件已准备', x + 42, y + 103, {
      font: '13px sans-serif',
      color: colors.textSubtle
    })

    context.save()
    context.translate(x + width - 76, y + 60)
    context.rotate(-0.18)
    context.fillStyle = colors.primary
    context.beginPath()
    context.moveTo(-30, 0)
    context.lineTo(22, -8)
    context.lineTo(31, 0)
    context.lineTo(22, 8)
    context.lineTo(-30, 4)
    context.closePath()
    context.fill()
    context.fillStyle = colors.panel
    context.beginPath()
    context.moveTo(-4, 0)
    context.lineTo(-18, 20)
    context.lineTo(7, 7)
    context.closePath()
    context.fill()
    context.restore()
  }

  getStartButton() {
    return {
      x: (this.viewport.width - config.layout.buttonWidth) / 2,
      y: this.viewport.height - 142,
      width: config.layout.buttonWidth,
      height: config.layout.buttonHeight
    }
  }

  handleTap(x, y) {
    const button = this.getStartButton()
    const inside = x >= button.x && x <= button.x + button.width && y >= button.y && y <= button.y + button.height
    if (inside && this.onStart) this.onStart()
  }
}

module.exports = MainMenuScene
