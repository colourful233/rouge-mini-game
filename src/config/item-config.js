const itemIds = require('./item-ids')

// 道具静态定义。数量属于 InventoryState，不要直接修改这里的对象。
const items = {
  [itemIds.healthPotion]: {
    id: itemIds.healthPotion,
    name: '生命药剂',
    description: '恢复 1 点生命值',
    texture: '',
    type: 'consumable',
    maxStack: 99,
    effect: { type: 'heal', amount: 1 }
  },
  [itemIds.attackElixir]: {
    id: itemIds.attackElixir,
    name: '攻击药剂',
    description: '本局攻击力 +1',
    texture: '',
    type: 'consumable',
    maxStack: 99,
    effect: { type: 'runAttributeBonus', bonus: { attack: 1 } }
  }
}

module.exports = {
  defaultItemId: itemIds.healthPotion,
  items,
  getItem(itemId) {
    return items[itemId] || null
  }
}
