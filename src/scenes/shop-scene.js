const config = require('../config/game-config')
const shopConfig = require('../config/shop-config')
const currencyDisplay = require('../ui/currency-display')
const drawing = require('../ui/canvas-drawing')

class ShopScene {
  constructor(viewport, onBack, currencyState, inventory) {
    this.viewport = viewport
    this.onBack = onBack
    this.currencyState = currencyState
    this.inventory = inventory
    this.message = ''
    this.messageTimer = 0
  }

  update(deltaTime) {
    this.messageTimer = Math.max(0, this.messageTimer - (deltaTime || 0))
    if (!this.messageTimer) this.message = ''
  }

  draw(context) {
    const width = this.viewport.width
    const height = this.viewport.height
    const colors = config.colors
    const backButton = this.getBackButton()

    context.clearRect(0, 0, width, height)
    context.fillStyle = colors.background
    context.fillRect(0, 0, width, height)
    context.fillStyle = colors.panel
    context.fillRect(0, 0, width, 92)

    currencyDisplay.drawCurrencyBar(context, this.currencyState, 28, 104, width - 56)

    context.font = '700 28px sans-serif'
    context.fillStyle = colors.text
    context.fillText('商城', 28, 46)
    context.font = '14px sans-serif'
    context.fillStyle = colors.textMuted
    context.fillText('准备强化，开启下一次冒险', 28, 73)

    shopConfig.products.forEach((product, index) => {
      this.drawItem(context, colors, product, 28, 158 + index * 114)
    })

    if (this.message) {
      drawing.drawText(context, this.message, width / 2, height - 90, {
        font: '600 13px sans-serif',
        color: colors.accent,
        align: 'center'
      })
    }

    context.strokeStyle = colors.panelLine
    context.lineWidth = 1
    context.strokeRect(backButton.x, backButton.y, backButton.width, backButton.height)
    context.font = '600 15px sans-serif'
    context.fillStyle = colors.textMuted
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText('返回主界面', width / 2, backButton.y + backButton.height / 2)
    context.textAlign = 'left'
    context.textBaseline = 'alphabetic'
  }

  drawItem(context, colors, product, x, y) {
    const width = this.viewport.width - 56
    const height = 92
    drawing.fillRoundedRect(context, x, y, width, height, 12, colors.panel)
    drawing.strokeRoundedRect(context, x, y, width, height, 12, colors.panelLine, 1)
    drawing.drawText(context, product.name, x + 18, y + 31, { font: '700 17px sans-serif', color: colors.text })
    drawing.drawText(context, product.description, x + 18, y + 57, { font: '13px sans-serif', color: colors.textMuted })
    drawing.drawText(context, `${product.price} 金币 · 点击购买`, x + width - 18, y + 45, {
      font: '600 13px sans-serif',
      color: colors.accent,
      align: 'right'
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
    const product = this.getProductAt(x, y)
    if (product) {
      this.buy(product)
      return
    }
    const button = this.getBackButton()
    const inside = x >= button.x && x <= button.x + button.width && y >= button.y && y <= button.y + button.height
    if (inside && this.onBack) this.onBack()
  }

  getProductAt(x, y) {
    const width = this.viewport.width - 56
    return shopConfig.products.find((product, index) => {
      const productY = 158 + index * 114
      return x >= 28 && x <= 28 + width && y >= productY && y <= productY + 92
    })
  }

  buy(product) {
    if (!this.currencyState || !this.inventory) return
    if (!this.currencyState.canAfford(product.currencyId, product.price)) {
      this.showMessage('金币不足，无法购买')
      return
    }
    const added = this.inventory.add(product.itemId, product.quantity)
    if (added < product.quantity) {
      if (added > 0) this.inventory.remove(product.itemId, added)
      this.showMessage('背包空间不足，无法购买')
      return
    }
    this.currencyState.spend(product.currencyId, product.price)
    this.showMessage(`已获得 ${product.name} x${product.quantity}`)
  }

  showMessage(message) {
    this.message = message
    this.messageTimer = 2400
  }
}

module.exports = ShopScene
