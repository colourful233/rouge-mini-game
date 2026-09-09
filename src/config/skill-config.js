// 技能定义：每个技能必须拥有唯一 id，并通过 bulletType 或效果参数描述其行为。
module.exports = {
  defaultSkillId: 'initialBullet',
  skills: {
    initialBullet: {
      id: 'initialBullet',
      name: '初始子弹',
      description: '发射一枚直线飞行的基础子弹',
      icon: '',
      texture: '',
      bulletType: 'initial',
      projectileCount: 1,
      damageMultiplier: 1,
      cooldownMultiplier: 1
    },
    spreadShot: {
      id: 'spreadShot',
      name: '星火散射',
      description: '同时发射三枚子弹',
      icon: '',
      texture: '',
      bulletType: 'initial',
      projectileCount: 3,
      damageMultiplier: 1,
      cooldownMultiplier: 1.25
    },
    arcaneBolt: {
      id: 'arcaneBolt',
      name: '奥术飞弹',
      description: '发射一枚高伤害奥术飞弹',
      icon: '',
      texture: '',
      bulletType: 'arcane',
      projectileCount: 1,
      damageMultiplier: 2.5,
      cooldownMultiplier: 1.6
    }
  }
}
