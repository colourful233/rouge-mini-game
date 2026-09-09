// 可操作角色定义：角色身份与技能绑定，不直接保存属性数值。
module.exports = {
  defaultCharacterId: 'initial',
  characters: {
    initial: {
      id: 'initial',
      name: '初始角色',
      description: '均衡的基础作战角色',
      texture: '',
      skillId: 'initialBullet',
      skillIds: ['initialBullet'],
      playerAttributeId: 'initial'
    }
  }
}
