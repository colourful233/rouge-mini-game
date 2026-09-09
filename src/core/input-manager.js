class InputManager {
  constructor() {
    this.tapHandlers = []
    this.dragHandlers = []
    this.touchStart = null
    this.isDragging = false
    wx.onTouchStart(this.handleTouchStart.bind(this))
    wx.onTouchMove(this.handleTouchMove.bind(this))
    wx.onTouchEnd(this.handleTouchEnd.bind(this))
  }

  onTap(handler) {
    this.tapHandlers.push(handler)
  }

  onDrag(handler) {
    this.dragHandlers.push(handler)
  }

  handleTouchStart(event) {
    const touch = this.getTouch(event)
    this.touchStart = touch
    this.isDragging = false
    if (touch) this.dragHandlers.forEach((handler) => handler(touch.x, touch.y, true))
  }

  handleTouchMove(event) {
    const touch = this.getTouch(event)
    if (!this.touchStart || !touch) return
    const distance = Math.hypot(touch.x - this.touchStart.x, touch.y - this.touchStart.y)
    if (distance >= 8) this.isDragging = true
    this.dragHandlers.forEach((handler) => handler(touch.x, touch.y, false))
  }

  handleTouchEnd(event) {
    const touch = this.getTouch(event)
    if (!this.touchStart || !touch) return

    const distance = Math.hypot(touch.x - this.touchStart.x, touch.y - this.touchStart.y)
    if (distance < 18 && !this.isDragging) {
      this.tapHandlers.forEach((handler) => handler(touch.x, touch.y))
    }
    this.touchStart = null
    this.isDragging = false
  }

  getTouch(event) {
    const touch = (event.changedTouches && event.changedTouches[0]) || (event.touches && event.touches[0])
    if (!touch) return null
    return {
      x: touch.clientX,
      y: touch.clientY
    }
  }
}

module.exports = InputManager
