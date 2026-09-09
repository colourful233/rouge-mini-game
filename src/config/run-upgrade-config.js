// 局内升级选项。效果只写入当前 GameScene，不会修改账号基础属性。
module.exports = {
  options: [
    {
      id: 'skillSpreadShot',
      category: '技能',
      title: '星火散射',
      description: '解锁三发扇形子弹',
      type: 'skill',
      skillId: 'spreadShot'
    },
    {
      id: 'skillArcaneBolt',
      category: '技能',
      title: '奥术飞弹',
      description: '解锁高伤害奥术子弹',
      type: 'skill',
      skillId: 'arcaneBolt'
    },
    {
      id: 'attackBoost',
      category: '属性',
      title: '武器校准',
      description: '攻击力 +1',
      type: 'attribute',
      bonus: { attack: 1 }
    },
    {
      id: 'fireRateBoost',
      category: '属性',
      title: '快速装填',
      description: '射击间隔 -55 毫秒',
      type: 'attribute',
      bonus: { fireInterval: -55 }
    },
    {
      id: 'healthBoost',
      category: '属性',
      title: '生命强化',
      description: '最大生命 +1，并恢复 1 点生命',
      type: 'attribute',
      bonus: { maxHealth: 1 },
      heal: 1
    },
    {
      id: 'projectileBoost',
      category: '技能效果',
      title: '多重施法',
      description: '所有已拥有技能额外发射 1 枚子弹',
      type: 'skillEffect',
      effect: { projectileCount: 1 }
    },
    {
      id: 'damageBoost',
      category: '技能效果',
      title: '魔力灌注',
      description: '所有已拥有技能伤害 +1',
      type: 'skillEffect',
      effect: { damage: 1 }
    }
  ]
}
