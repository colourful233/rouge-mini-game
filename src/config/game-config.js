module.exports = {
  version: '1.01-beta',
  colors: {
    background: '#0d1721',
    backgroundLight: '#162836',
    panel: '#1b3341',
    panelLine: '#2b4a58',
    primary: '#61d4c5',
    primaryDark: '#183c43',
    accent: '#f2b56b',
    text: '#f4f7fb',
    textMuted: '#8fa5b7',
    textSubtle: '#637b8e'
  },
  layout: {
    horizontalPadding: 28,
    buttonHeight: 58,
    buttonWidth: 246
  },
  gameplay: {
    playerRadius: 18,
    playerBottomOffset: 74,
    enemyRadius: 16,
    enemySpeed: 48,
    bulletSpeed: 340,
    fireInterval: 460,
    spawnInterval: 900,
    maxEnemies: 18,
    maxSkillSlots: 4,
    defaultBulletType: 'initial',
    bullets: {
      initial: {
        id: 'initial',
        name: '初始子弹',
        radius: 10,
        speed: 340,
        color: '#61d4c5'
      },
      arcane: {
        id: 'arcane',
        name: '奥术飞弹',
        radius: 11,
        speed: 300,
        color: '#d69cff'
      }
    }
  }
}
