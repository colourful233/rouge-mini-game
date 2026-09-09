const itemIds = require('./item-ids')

// 商城商品只保存静态定义；余额和购买结果分别由 CurrencyState、InventoryState 管理。
module.exports = {
  products: [
    {
      id: 'healthPotionPack',
      name: '生命药剂',
      description: '获得 3 瓶生命药剂，可在远征中使用',
      currencyId: 'gold',
      price: 200,
      itemId: itemIds.healthPotion,
      quantity: 3
    },
    {
      id: 'attackElixirPack',
      name: '攻击药剂',
      description: '获得 1 瓶攻击药剂，本局攻击力 +1',
      currencyId: 'gold',
      price: 500,
      itemId: itemIds.attackElixir,
      quantity: 1
    }
  ]
}
