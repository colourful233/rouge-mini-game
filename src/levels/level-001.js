// 第一关：魔晶塔外围。关卡数值集中在此文件，便于后续逐关调整平衡。
module.exports = {
  id: 'level-001',
  order: 1,
  title: '魔晶塔外围',
  durationSeconds: 120,
  spawnPhases: [
    { untilSeconds: 40, interval: 1100, monsterId: 'basic', health: 3, speed: 44, experience: 2, color: '#f2b56b' },
    { untilSeconds: 80, interval: 900, monsterId: 'swift', health: 4, speed: 62, experience: 3, color: '#ed8c70' },
    { untilSeconds: 120, interval: 700, monsterId: 'armored', health: 6, speed: 42, experience: 4, color: '#d19a62' }
  ],
  bossId: 'crystalGuardian',
  bossAttributes: { health: 80, speed: 24, experience: 12, color: '#b56cf2' }
}
