const itemConfig = require('../config/item-config')

// 背包只保存道具数量，跨场景复用；道具效果由使用方处理。
class InventoryState {
  constructor(initialItems) {
    this.quantities = {}
    Object.keys(initialItems || {}).forEach((itemId) => {
      const quantity = initialItems[itemId]
      if (quantity > 0) this.add(itemId, quantity)
    })
  }

  getQuantity(itemId) {
    return this.quantities[itemId] || 0
  }

  has(itemId, quantity) {
    const required = quantity === undefined ? 1 : quantity
    return this.getQuantity(itemId) >= required
  }

  add(itemId, quantity) {
    const item = this.getItemOrThrow(itemId)
    const amount = this.normalizeQuantity(quantity)
    const current = this.getQuantity(itemId)
    const next = Math.min(item.maxStack || Number.MAX_SAFE_INTEGER, current + amount)
    this.quantities[itemId] = next
    return next - current
  }

  remove(itemId, quantity) {
    this.getItemOrThrow(itemId)
    const amount = this.normalizeQuantity(quantity)
    if (!this.has(itemId, amount)) return 0
    this.quantities[itemId] -= amount
    if (this.quantities[itemId] === 0) delete this.quantities[itemId]
    return amount
  }

  use(itemId, onUse) {
    const item = this.getItemOrThrow(itemId)
    if (!this.has(itemId)) return false
    if (typeof onUse === 'function' && onUse(item) === false) return false
    this.remove(itemId, 1)
    return true
  }

  getItems() {
    return Object.keys(this.quantities).map((itemId) => ({
      item: itemConfig.items[itemId],
      quantity: this.quantities[itemId]
    }))
  }

  getSnapshot() {
    return Object.assign({}, this.quantities)
  }

  clear() {
    this.quantities = {}
  }

  getItemOrThrow(itemId) {
    const item = itemConfig.getItem(itemId)
    if (!item) throw new Error(`Unknown item id: ${itemId}`)
    return item
  }

  normalizeQuantity(quantity) {
    if (!Number.isInteger(quantity) || quantity <= 0) throw new RangeError('Item quantity must be a positive integer')
    return quantity
  }
}

module.exports = InventoryState
