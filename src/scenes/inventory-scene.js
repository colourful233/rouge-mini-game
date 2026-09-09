const config = require('../config/game-config')
const inventoryConfig = require('../config/inventory-config')
const itemConfig = require('../config/item-config')
const AssetLoader = require('../core/asset-loader')
const drawing = require('../ui/canvas-drawing')
const currencyDisplay = require('../ui/currency-display')

class InventoryScene {
  constructor(viewport, onBack, inventory, currencyState) {
    this.viewport = viewport
    this.onBack = onBack
    this.inventory = inventory
    this.currencyState = currencyState
    this.assets = new AssetLoader()
    this.columns = 5
    this.rows = 12
    this.scrollOffset = 0
    this.dragStartY = null
    this.dragStartOffset = 0
    this.detailItemId = null
  }

  draw(context) {
    const width = this.viewport.width
    const height = this.viewport.height
    const colors = config.colors
    const backButton = this.getBackButton()
    const grid = this.getGridLayout()

    context.clearRect(0, 0, width, height)
    context.fillStyle = colors.background
    context.fillRect(0, 0, width, height)
    context.fillStyle = colors.panel
    context.fillRect(0, 0, width, 92)

    this.drawBackButton(context, colors, backButton)
    const currencyWidth = Math.min(220, Math.max(174, width * 0.58))
    currencyDisplay.drawCurrencyBar(context, this.currencyState, width - currencyWidth - 12, 16, currencyWidth)

    context.save()
    context.beginPath()
    context.rect(grid.x, grid.y, grid.width, grid.height)
    context.clip()
    this.drawGrid(context, colors, grid)
    context.restore()

    if (this.detailItemId) this.drawDetail(context, colors, itemConfig.getItem(this.detailItemId))
  }

  drawGrid(context, colors, grid) {
    const itemIds = Object.keys(itemConfig.items)
    const totalSlots = this.columns * this.rows

    for (let index = 0; index < totalSlots; index += 1) {
      const column = index % this.columns
      const row = Math.floor(index / this.columns)
      const x = grid.x + column * (grid.cellSize + grid.gap)
      const y = grid.y + row * (grid.cellSize + grid.gap) - this.scrollOffset
      const itemId = itemIds[index]
      const item = itemId ? itemConfig.items[itemId] : null
      const quantity = item && this.inventory && this.inventory.getQuantity ? this.inventory.getQuantity(itemId) : 0
      const owned = quantity > 0

      drawing.fillRoundedRect(context, x, y, grid.cellSize, grid.cellSize, 8, owned ? colors.panel : colors.backgroundLight)
      drawing.strokeRoundedRect(context, x, y, grid.cellSize, grid.cellSize, 8, owned ? colors.primary : colors.panelLine, 1)
      if (!item) continue

      const texture = this.loadTexture(item.texture)
      if (!this.drawTexture(context, texture, x + grid.cellSize / 2, y + grid.cellSize / 2, grid.cellSize * 0.62, grid.cellSize * 0.62)) {
        context.fillStyle = owned ? colors.accent : colors.textSubtle
        context.beginPath()
        context.arc(x + grid.cellSize / 2, y + grid.cellSize / 2, grid.cellSize * 0.22, 0, Math.PI * 2)
        context.fill()
      }
      drawing.drawText(context, String(quantity), x + grid.cellSize - 6, y + grid.cellSize - 6, {
        font: '700 12px sans-serif',
        color: owned ? colors.text : colors.textSubtle,
        align: 'right',
        baseline: 'bottom'
      })
    }
  }

  drawDetail(context, colors, item) {
    if (!item) return
    const width = this.viewport.width
    const height = this.viewport.height
    const panelWidth = Math.min(width - 40, 320)
    const panelHeight = 220
    const panelX = (width - panelWidth) / 2
    const panelY = (height - panelHeight) / 2

    context.fillStyle = 'rgba(5, 13, 18, 0.78)'
    context.fillRect(0, 0, width, height)
    drawing.fillRoundedRect(context, panelX, panelY, panelWidth, panelHeight, 12, colors.panel)
    drawing.strokeRoundedRect(context, panelX, panelY, panelWidth, panelHeight, 12, colors.primary, 1)

    const texture = this.loadTexture(item.texture)
    if (!this.drawTexture(context, texture, panelX + 52, panelY + 52, 52, 52)) {
      context.fillStyle = colors.accent
      context.beginPath()
      context.arc(panelX + 52, panelY + 52, 22, 0, Math.PI * 2)
      context.fill()
    }
    drawing.drawText(context, item.name, panelX + 92, panelY + 58, {
      font: '700 20px sans-serif',
      color: colors.text
    })
    this.drawDescription(context, item.description, panelX + 24, panelY + 112, panelWidth - 48, colors.textMuted)
    drawing.drawText(context, '点击空白处关闭', panelX + panelWidth / 2, panelY + panelHeight - 24, {
      font: '12px sans-serif',
      color: colors.textSubtle,
      align: 'center'
    })
  }

  drawDescription(context, description, x, y, maxWidth, color) {
    const text = String(description || '')
    context.font = '14px sans-serif'
    const lines = []
    let line = ''
    for (const character of text) {
      const nextLine = line + character
      if (line && context.measureText(nextLine).width > maxWidth) {
        lines.push(line)
        line = character
      } else {
        line = nextLine
      }
    }
    if (line) lines.push(line)
    lines.slice(0, 3).forEach((lineText, index) => {
      drawing.drawText(context, lineText, x, y + index * 20, {
        font: '14px sans-serif',
        color
      })
    })
  }

  getGridLayout() {
    const padding = 12
    const gap = 6
    const x = padding
    const y = 106
    const width = this.viewport.width - padding * 2
    const height = this.viewport.height - y - 78
    const cellSize = (width - gap * (this.columns - 1)) / this.columns
    const contentHeight = this.rows * cellSize + (this.rows - 1) * gap
    return {
      x,
      y,
      width,
      height,
      gap,
      cellSize,
      contentHeight,
      maxScrollOffset: Math.max(0, contentHeight - height)
    }
  }

  getBackButton() {
    return {
      x: 12,
      y: 14,
      width: 38,
      height: 38
    }
  }

  drawBackButton(context, colors, button) {
    drawing.fillRoundedRect(context, button.x, button.y, button.width, button.height, 8, colors.backgroundLight)
    drawing.strokeRoundedRect(context, button.x, button.y, button.width, button.height, 8, colors.panelLine, 1)
    const texture = this.loadTexture(inventoryConfig.backButton.texture)
    if (this.drawTexture(context, texture, button.x + button.width / 2, button.y + button.height / 2, 22, 22)) return
    context.strokeStyle = colors.primary
    context.lineWidth = 2
    context.beginPath()
    context.moveTo(button.x + 23, button.y + 10)
    context.lineTo(button.x + 13, button.y + 19)
    context.lineTo(button.x + 23, button.y + 28)
    context.stroke()
    context.beginPath()
    context.moveTo(button.x + 14, button.y + 19)
    context.lineTo(button.x + 28, button.y + 19)
    context.stroke()
  }

  getItemAt(x, y) {
    const grid = this.getGridLayout()
    if (x < grid.x || x > grid.x + grid.width || y < grid.y || y > grid.y + grid.height) return null
    const column = Math.floor((x - grid.x) / (grid.cellSize + grid.gap))
    const row = Math.floor((y - grid.y + this.scrollOffset) / (grid.cellSize + grid.gap))
    if (column < 0 || column >= this.columns || row < 0 || row >= this.rows) return null
    const cellX = grid.x + column * (grid.cellSize + grid.gap)
    const cellY = grid.y + row * (grid.cellSize + grid.gap) - this.scrollOffset
    if (x > cellX + grid.cellSize || y > cellY + grid.cellSize) return null
    const itemId = Object.keys(itemConfig.items)[row * this.columns + column]
    return itemId ? itemConfig.getItem(itemId) : null
  }

  handleDrag(x, y, started) {
    if (this.detailItemId) return
    if (started) {
      this.dragStartY = y
      this.dragStartOffset = this.scrollOffset
      return
    }
    if (this.dragStartY === null) return
    const grid = this.getGridLayout()
    this.scrollOffset = Math.max(0, Math.min(grid.maxScrollOffset, this.dragStartOffset + this.dragStartY - y))
  }

  handleTap(x, y) {
    if (this.detailItemId) {
      this.detailItemId = null
      return
    }
    const button = this.getBackButton()
    const insideBack = x >= button.x && x <= button.x + button.width && y >= button.y && y <= button.y + button.height
    if (insideBack && this.onBack) {
      this.onBack()
      return
    }
    const item = this.getItemAt(x, y)
    if (item) this.detailItemId = item.id
  }

  loadTexture(path) {
    return path ? this.assets.load(path) : null
  }

  drawTexture(context, image, x, y, width, height) {
    if (!image || !image.width || !image.height) return false
    context.drawImage(image, x - width / 2, y - height / 2, width, height)
    return true
  }
}

module.exports = InventoryScene
