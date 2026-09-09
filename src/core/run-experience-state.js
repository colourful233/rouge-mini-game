// 单局经验与等级容器。重开或离开关卡时随 GameScene 一并丢弃。
class RunExperienceState {
  constructor() {
    this.level = 1
    this.experience = 0
  }

  get nextExperience() {
    return 5 + (this.level - 1) * 3
  }

  add(amount) {
    let levelUps = 0
    this.experience += Math.max(0, Number(amount) || 0)
    while (this.experience >= this.nextExperience) {
      this.experience -= this.nextExperience
      this.level += 1
      levelUps += 1
    }
    return levelUps
  }
}

module.exports = RunExperienceState
