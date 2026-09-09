const config = require('../config/game-config')
const world = require('../config/world-config')
const drawing = require('../ui/canvas-drawing')

class GameScene {
  constructor(viewport, onBack) {
    this.viewport = viewport
    this.onBack = onBack
  }

  draw(context) {
    const width = this.viewport.width
    const height = this.viewport.height
    const colors = config.colors
    const backButton = this.getBackButton()

    context.clearRect(0, 0, width, height)
    context.fillStyle = colors.background
    context.fillRect(0, 0, width, height)
    drawing.drawText(context, '远征 01 · ' + world.routeTitle, 24, 42, {
      font: '700 15px sans-serif',
      color: colors.text
    })
    drawing.drawText(context, 'SCORE 000000', width - 24, 42, {
      font: '600 12px sans-serif',
      color: colors.textMuted,
      align: 'right'
    })

    drawing.fillRoundedRect(context, 24, 76, width - 48, height - 160, 16, colors.backgroundLight)
    drawing.drawText(context, '远征场景已启动', width / 2, height / 2 - 12, {
      font: '700 24px sans-serif',
      color: colors.text,
      align: 'center'
    })
    drawing.drawText(context, world.routeDetail, width / 2, height / 2 + 24, {
      font: '14px sans-serif',
      color: colors.textMuted,
      align: 'center'
    })

    drawing.strokeRoundedRect(context, backButton.x, backButton.y, backButton.width, backButton.height, 10, colors.panelLine, 1)
    drawing.drawText(context, '返回主界面', width / 2, backButton.y + backButton.height / 2, {
      font: '600 15px sans-serif',
      color: colors.textMuted,
      align: 'center',
      baseline: 'middle'
    })
  }

  getBackButton() {
    return {
      x: (this.viewport.width - 160) / 2,
      y: this.viewport.height - 58,
      width: 160,
      height: 42
    }
  }

  handleTap(x, y) {
    const button = this.getBackButton()
    const inside = x >= button.x && x <= button.x + button.width && y >= button.y && y <= button.y + button.height
    if (inside && this.onBack) this.onBack()
  }
}

module.exports = GameScene
