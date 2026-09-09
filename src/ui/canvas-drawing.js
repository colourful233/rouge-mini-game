function roundedRect(context, x, y, width, height, radius) {
  const corner = Math.min(radius, width / 2, height / 2)
  context.beginPath()
  context.moveTo(x + corner, y)
  context.arcTo(x + width, y, x + width, y + height, corner)
  context.arcTo(x + width, y + height, x, y + height, corner)
  context.arcTo(x, y + height, x, y, corner)
  context.arcTo(x, y, x + width, y, corner)
  context.closePath()
}

function fillRoundedRect(context, x, y, width, height, radius, color) {
  roundedRect(context, x, y, width, height, radius)
  context.fillStyle = color
  context.fill()
}

function strokeRoundedRect(context, x, y, width, height, radius, color, lineWidth) {
  roundedRect(context, x, y, width, height, radius)
  context.strokeStyle = color
  context.lineWidth = lineWidth || 1
  context.stroke()
}

function drawText(context, value, x, y, options) {
  const settings = options || {}
  context.font = settings.font || '16px sans-serif'
  context.fillStyle = settings.color || '#ffffff'
  context.textAlign = settings.align || 'left'
  context.textBaseline = settings.baseline || 'alphabetic'
  context.fillText(value, x, y)
}

module.exports = {
  fillRoundedRect,
  strokeRoundedRect,
  drawText
}
