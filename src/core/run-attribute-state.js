// 单局属性容器。只存在于当前关卡实例，关卡结束或重开时重新从基础属性创建。
class RunAttributeState {
  constructor(baseAttributes) {
    this.base = Object.assign({}, baseAttributes)
    this.bonus = {}
  }

  get active() {
    return Object.keys(this.base).reduce((attributes, key) => {
      if (typeof this.base[key] === 'number') attributes[key] = this.base[key] + (this.bonus[key] || 0)
      return attributes
    }, {})
  }

  addBonus(bonus) {
    Object.keys(bonus || {}).forEach((key) => {
      if (typeof bonus[key] !== 'number') return
      this.bonus[key] = (this.bonus[key] || 0) + bonus[key]
    })
  }
}

module.exports = RunAttributeState
