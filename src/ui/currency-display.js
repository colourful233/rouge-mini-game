const currencyConfig = require('../config/currency-config')
const AssetLoader = require('../core/asset-loader')

const currencyOrder = ['gold', 'diamond', 'voucher']
const assetLoader = new AssetLoader()

function drawCurrencyBar(context, currencyState, x, y, width) {
  const gap = 8
  const itemWidth = (width - gap * (currencyOrder.length - 1)) / currencyOrder.length
  currencyOrder.forEach((currencyId, index) => {
    const currency = currencyConfig[currencyId]
    const itemX = x + index * (itemWidth + gap)
    context.fillStyle = '#12222d'
    context.fillRect(itemX, y, itemWidth, 38)
    const icon = assetLoader.load(currency.texture)
    if (icon && icon.width && icon.height) {
      context.drawImage(icon, itemX + 7, y + 12, 14, 14)
    } else {
      context.fillStyle = currency.color
      context.beginPath()
      context.arc(itemX + 14, y + 19, 5, 0, Math.PI * 2)
      context.fill()
    }
    context.font = '700 13px sans-serif'
    context.fillStyle = '#f4f7fb'
    context.textAlign = 'right'
    const balance = currencyState && currencyState.getBalance ? currencyState.getBalance(currencyId) : 0
    context.textBaseline = 'middle'
    context.fillText(String(balance), itemX + itemWidth - 10, y + 19)
  })
  context.textAlign = 'left'
  context.textBaseline = 'alphabetic'
}

module.exports = {
  drawCurrencyBar,
  currencyOrder
}
