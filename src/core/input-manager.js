class InputManager {
  constructor() {
    this.tapHandlers = []
    this.touchStart = null
    wx.onTouchStart(this.handleTouchStart.bind(this))
    wx.onTouchEnd(this.handleTouchEnd.bind(this))
  }

  onTap(handler) {
    this.tapHandlers.push(handler)
  }

  handleTouchStart(event) {
    const touch = this.getTouch(event)
    this.touchStart = touch
  }

  handleTouchEnd(event) {
    const touch = this.getTouch(event)
    if (!this.touchStart || !touch) return

    const distance = Math.hypot(touch.x - this.touchStart.x, touch.y - this.touchStart.y)
    if (distance < 18) {
      this.tapHandlers.forEach((handler) => handler(touch.x, touch.y))
    }
    this.touchStart = null
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
