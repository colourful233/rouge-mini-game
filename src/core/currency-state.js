const currencyConfig = require('../config/currency-config')

class CurrencyState {
  constructor(initialBalances) {
    this.balances = {}
    Object.keys(currencyConfig).forEach((currencyId) => {
      const configured = currencyConfig[currencyId]
      const initial = initialBalances && initialBalances[currencyId]
      this.balances[currencyId] = this.normalizeAmount(initial === undefined ? configured.initial : initial)
    })
  }

  getBalance(currencyId) {
    return this.balances[currencyId] || 0
  }

  canAfford(currencyId, amount) {
    const cost = this.normalizeAmount(amount)
    return cost >= 0 && this.getBalance(currencyId) >= cost
  }

  add(currencyId, amount) {
    const value = this.requireAmount(amount)
    this.requireCurrency(currencyId)
    this.balances[currencyId] += value
    return this.balances[currencyId]
  }

  spend(currencyId, amount) {
    const value = this.requireAmount(amount)
    this.requireCurrency(currencyId)
    if (!this.canAfford(currencyId, value)) return false
    this.balances[currencyId] -= value
    return true
  }

  snapshot() {
    return Object.assign({}, this.balances)
  }

  normalizeAmount(amount) {
    const value = Number(amount)
    return Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0
  }

  requireAmount(amount) {
    const value = Number(amount)
    if (!Number.isFinite(value) || value < 0) throw new Error('货币数量必须是非负数字')
    return Math.floor(value)
  }

  requireCurrency(currencyId) {
    if (!currencyConfig[currencyId]) throw new Error(`未知货币类型: ${currencyId}`)
  }
}

module.exports = CurrencyState
