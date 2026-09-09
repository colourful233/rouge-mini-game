const config = require('../config/game-config')
const world = require('../config/world-config')
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
    drawing.drawText(context, world.genre, padding, 54, {
      font: '700 12px sans-serif',
      color: colors.primary
    })
    drawing.drawText(context, config.version.toUpperCase(), width - padding, 54, {
      font: '600 12px sans-serif',
      color: colors.textSubtle,
      align: 'right'
    })

    drawing.drawText(context, world.title, padding, 144, {
      font: '700 38px sans-serif',
      color: colors.text
    })
    drawing.drawText(context, world.tagline, padding, 178, {
      font: '16px sans-serif',
      color: colors.textMuted
    })
    drawing.drawText(context, world.shortStory, padding, 202, {
      font: '13px sans-serif',
      color: colors.textSubtle
    })

    this.drawAdventureCard(context, colors, padding, 242, width - padding * 2)

    drawing.fillRoundedRect(context, button.x, button.y, button.width, button.height, 12, colors.primary)
    drawing.drawText(context, '开始游戏', button.x + button.width / 2, button.y + button.height / 2 + 1, {
      font: '700 17px sans-serif',
      color: colors.primaryDark,
      align: 'center',
      baseline: 'middle'
    })
    drawing.drawText(context, '选择路线 · 探索遗迹 · 挑战魔王', width / 2, button.y + button.height + 32, {
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

  drawAdventureCard(context, colors, x, y, width) {
    const height = 132
    drawing.fillRoundedRect(context, x, y, width, height, 16, colors.panel)
    drawing.strokeRoundedRect(context, x, y, width, height, 16, colors.panelLine, 1)

    context.fillStyle = colors.accent
    context.fillRect(x + 22, y + 22, 4, 42)
    drawing.drawText(context, '当前远征', x + 42, y + 42, {
      font: '600 14px sans-serif',
      color: colors.textMuted
    })
    drawing.drawText(context, world.routeTitle, x + 42, y + 75, {
      font: '700 23px sans-serif',
      color: colors.text
    })
    drawing.drawText(context, world.routeStatus, x + 42, y + 103, {
      font: '13px sans-serif',
      color: colors.textSubtle
    })

    context.save()
    context.translate(x + width - 76, y + 60)
    context.rotate(-0.18)
    context.fillStyle = colors.accent
    context.beginPath()
    context.moveTo(-28, 18)
    context.lineTo(-4, -26)
    context.lineTo(4, 2)
    context.lineTo(31, 11)
    context.lineTo(2, 18)
    context.closePath()
    context.closePath()
    context.fill()
    context.fillStyle = colors.panel
    context.beginPath()
    context.moveTo(-1, -8)
    context.lineTo(-5, 8)
    context.lineTo(12, 12)
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
