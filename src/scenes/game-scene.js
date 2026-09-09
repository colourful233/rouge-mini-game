const config = require('../config/game-config')
const characterConfig = require('../config/character-config')
const playerAttributeConfig = require('../config/player-attribute-config')
const RunAttributeState = require('../core/run-attribute-state')
const RunExperienceState = require('../core/run-experience-state')
const InventoryState = require('../core/inventory-state')
const itemConfig = require('../config/item-config')
const skillConfig = require('../config/skill-config')
const upgradeConfig = require('../config/run-upgrade-config')
const monsterConfig = require('../config/monster-config')
const bossConfig = require('../config/boss-config')
const AssetLoader = require('../core/asset-loader')
const level = require('../levels/level-001')
const drawing = require('../ui/canvas-drawing')

class GameScene {
  constructor(viewport, onBack, inventory) {
    this.viewport = viewport
    this.onBack = onBack
    this.inventory = inventory || new InventoryState()
    this.settings = config.gameplay
    this.assets = new AssetLoader()
    this.level = level
    this.character = this.getCharacter(characterConfig.defaultCharacterId)
    this.baseAttributes = this.getPlayerAttributes(this.character.playerAttributeId)
    this.runAttributes = new RunAttributeState(this.baseAttributes)
    this.experienceState = new RunExperienceState()
    this.attributes = this.runAttributes.active
    this.skills = this.createSkillSlots(this.character.skillIds || [this.character.skillId])
    this.upgradeOptions = []
    this.pendingLevelUps = 0
    this.upgradeOpen = false
    this.player = { x: viewport.width / 2, y: viewport.height - this.settings.playerBottomOffset, radius: this.settings.playerRadius, attack: this.attributes.attack, health: this.attributes.maxHealth, maxHealth: this.attributes.maxHealth, texture: this.loadTexture(this.character.texture) }
    this.enemies = []
    this.bullets = []
    this.elapsed = 0
    this.fireTimer = 0
    this.spawnTimer = 0
    this.gameOver = false
    this.levelComplete = false
    this.paused = false
    this.bossSpawned = false
    this.spawnInterval = this.level.spawnPhases[0].interval
  }

  update(deltaTime) {
    const delta = Math.min(deltaTime || 0, 50) / 1000
    if (!delta || this.gameOver || this.levelComplete || this.upgradeOpen || this.paused) return
    this.elapsed += delta
    this.fireTimer += deltaTime
    this.spawnTimer += deltaTime
    this.skills.forEach((slot) => { slot.cooldown = Math.max(0, slot.cooldown - deltaTime) })
    if (!this.bossSpawned) {
      const phase = this.getSpawnPhase()
      this.spawnInterval = phase.interval
      if (this.spawnTimer >= this.spawnInterval && this.enemies.length < this.settings.maxEnemies) { this.spawnTimer = 0; this.spawnEnemy(phase) }
      if (this.elapsed >= this.level.durationSeconds) this.spawnBoss()
    }
    if (this.fireTimer >= this.attributes.fireInterval) { this.fireTimer = 0; this.fireSkills() }
    this.enemies.forEach((enemy) => {
      enemy.y += enemy.speed * delta
      if (this.isColliding(this.player, enemy) || enemy.y - enemy.radius > this.viewport.height) this.gameOver = true
    })
    this.bullets.forEach((bullet) => {
      bullet.y -= bullet.speed * delta
      for (const enemy of this.enemies) {
        if (enemy.destroyed || !this.isColliding(bullet, enemy)) continue
        enemy.health -= bullet.damage
        bullet.hit = true
        if (enemy.health <= 0) {
          enemy.destroyed = true
          this.addExperience(enemy.experience || (enemy.isBoss ? ((this.level.bossAttributes && this.level.bossAttributes.experience) || 0) : 1))
          if (enemy.isBoss) this.levelComplete = true
        }
        break
      }
    })
    this.bullets = this.bullets.filter((bullet) => !bullet.hit && bullet.y > -30 && bullet.y < this.viewport.height + 30)
    this.enemies = this.enemies.filter((enemy) => !enemy.destroyed)
  }

  spawnEnemy(phase) {
    phase = phase || this.getSpawnPhase()
    const monster = this.getMonster(phase.monsterId)
    const padding = monster.radius + 14
    const health = Math.max(1, Number(phase.health) || 1)
    this.enemies.push({ monsterId: monster.id, x: padding + Math.random() * (this.viewport.width - padding * 2), y: -monster.radius, radius: monster.radius, health, maxHealth: health, speed: Number(phase.speed) || 0, experience: Math.max(0, Number(phase.experience) || 0), color: phase.color, texture: this.loadTexture(monster.texture) })
  }

  getMonster(monsterId) { return monsterConfig.monsters[monsterId] || monsterConfig.monsters.basic }

  getSpawnPhase() {
    return this.level.spawnPhases.find((phase) => this.elapsed < phase.untilSeconds) || this.level.spawnPhases[this.level.spawnPhases.length - 1]
  }

  spawnBoss() {
    this.bossSpawned = true
    this.spawnTimer = 0
    this.enemies = this.enemies.filter((enemy) => !enemy.isBoss)
    const boss = this.getBoss(this.level.bossId)
    const attributes = this.level.bossAttributes || {}
    const health = Math.max(1, Number(attributes.health) || 1)
    this.enemies.push({ monsterId: boss.id, x: this.viewport.width / 2, y: -boss.radius, radius: boss.radius, health, maxHealth: health, speed: Number(attributes.speed) || 0, experience: Math.max(0, Number(attributes.experience) || 0), color: attributes.color, texture: this.loadTexture(boss.texture), isBoss: true })
  }

  getBoss(bossId) { return bossConfig.bosses[bossId] || bossConfig.bosses.crystalGuardian }

  createSkillSlots(skillIds) {
    return skillIds.filter(Boolean).map((skillId) => this.getSkill(skillId)).filter(Boolean).slice(0, this.settings.maxSkillSlots).map((skill) => ({ skill, cooldown: 0, projectileCount: skill.projectileCount || 1, damage: 0 }))
  }

  fireSkills() {
    this.skills.forEach((slot) => {
      if (slot.cooldown > 0) return
      this.fireSkill(slot)
      slot.cooldown = this.attributes.fireInterval * (slot.skill.cooldownMultiplier || 1)
    })
  }

  fireSkill(slot) {
    const skill = slot.skill
    const bulletType = this.getBulletType(skill.bulletType)
    const projectileCount = slot.projectileCount || 1
    const damageBonus = slot.damage || 0
    for (let index = 0; index < projectileCount; index += 1) {
      const offset = (index - (projectileCount - 1) / 2) * 13
      this.bullets.push({
        type: bulletType.id,
        skillId: skill.id,
        x: this.player.x + offset,
        y: this.player.y - this.player.radius,
        radius: bulletType.radius,
        speed: bulletType.speed,
        damage: this.attributes.attack * (skill.damageMultiplier || 1) + damageBonus,
        color: bulletType.color,
        texture: this.loadTexture(bulletType.texture || skill.texture)
      })
    }
  }

  getBulletType(typeId) {
    return this.settings.bullets[typeId] || this.settings.bullets[this.settings.defaultBulletType]
  }

  getSkill(skillId) {
    return skillConfig.skills[skillId] || skillConfig.skills[skillConfig.defaultSkillId]
  }

  loadTexture(path) { return path ? this.assets.load(path) : null }

  getCharacter(characterId) {
    return characterConfig.characters[characterId] || characterConfig.characters[characterConfig.defaultCharacterId]
  }

  getPlayerAttributes(attributeId) {
    return playerAttributeConfig.attributes[attributeId] || playerAttributeConfig.attributes.initial
  }

  // 由 UI、奖励或事件调用；效果成功后才会扣除一个道具。
  useItem(itemId) {
    return this.inventory.use(itemId, (item) => this.applyItemEffect(item))
  }

  applyItemEffect(item) {
    const effect = itemConfig.getItem(item.id).effect || {}
    if (effect.type === 'heal') {
      if (this.player.health >= this.player.maxHealth) return false
      this.player.health = Math.min(this.player.maxHealth, this.player.health + effect.amount)
      return true
    }
    if (effect.type === 'runAttributeBonus') {
      this.addRunAttributeBonus(effect.bonus)
      return true
    }
    return false
  }

  addRunAttributeBonus(bonus) {
    this.runAttributes.addBonus(bonus)
    if (this.runAttributes.bonus.fireInterval) this.runAttributes.bonus.fireInterval = Math.max(-this.baseAttributes.fireInterval + 80, this.runAttributes.bonus.fireInterval)
    this.attributes = this.runAttributes.active
    this.player.attack = this.attributes.attack
    this.player.maxHealth = this.attributes.maxHealth
    this.player.health = Math.min(this.player.health, this.player.maxHealth)
  }

  addExperience(amount) {
    const levelUps = this.experienceState.add(amount)
    if (!levelUps) return
    this.pendingLevelUps += levelUps
    if (!this.upgradeOpen) this.openUpgrade()
  }

  openUpgrade() {
    if (this.pendingLevelUps <= 0) return
    this.pendingLevelUps -= 1
    const ownedSkillIds = this.skills.map((slot) => slot.skill.id)
    const pool = upgradeConfig.options.filter((option) => option.type !== 'skill' || !ownedSkillIds.includes(option.skillId))
    const shuffled = pool.slice().sort(() => Math.random() - 0.5)
    const selected = []
    ;['skill', 'attribute', 'skillEffect'].forEach((type) => {
      const option = shuffled.find((item) => item.type === type && !selected.includes(item))
      if (option) selected.push(option)
    })
    shuffled.forEach((option) => {
      if (selected.length < 3 && !selected.includes(option)) selected.push(option)
    })
    this.upgradeOptions = selected.slice(0, 3)
    this.upgradeOpen = true
  }

  applyUpgrade(option) {
    if (!option) return
    if (option.type === 'attribute') {
      this.addRunAttributeBonus(option.bonus)
      if (option.heal) this.player.health = Math.min(this.player.maxHealth, this.player.health + option.heal)
    } else if (option.type === 'skill') {
      if (this.skills.length < this.settings.maxSkillSlots && !this.skills.some((slot) => slot.skill.id === option.skillId)) this.skills.push({ skill: this.getSkill(option.skillId), cooldown: 0, projectileCount: this.getSkill(option.skillId).projectileCount || 1, damage: 0 })
    } else if (option.type === 'skillEffect') {
      this.skills.forEach((slot) => {
        if (option.effect.projectileCount) slot.projectileCount += option.effect.projectileCount
        if (option.effect.damage) slot.damage += option.effect.damage
      })
    }
    this.upgradeOptions = []
    this.upgradeOpen = false
    if (this.pendingLevelUps > 0) this.openUpgrade()
  }

  isColliding(first, second) { return Math.hypot(first.x - second.x, first.y - second.y) <= first.radius + second.radius }

  draw(context) {
    const width = this.viewport.width; const height = this.viewport.height; const colors = config.colors
    context.clearRect(0, 0, width, height); context.fillStyle = colors.background; context.fillRect(0, 0, width, height)
    context.fillStyle = '#24404e'
    for (let i = 0; i < 28; i += 1) { const x = (i * 79 + 23) % width; const y = (i * 137 + 41 + Math.floor(this.elapsed * 18) * (i % 3 + 1)) % height; context.fillRect(x, y, i % 4 === 0 ? 2 : 1, i % 4 === 0 ? 2 : 1) }
    this.enemies.forEach((enemy) => this.drawEnemy(context, enemy, colors))
    this.bullets.forEach((bullet) => this.drawProjectile(context, bullet, colors))
    this.drawPlayer(context, colors)
    if (!this.gameOver && !this.levelComplete && !this.upgradeOpen) this.drawPauseButton(context, colors)
    if (this.gameOver) this.drawGameOver(context, width, height, colors)
    if (this.levelComplete) this.drawLevelComplete(context, width, height, colors)
    if (this.upgradeOpen) this.drawUpgradeOverlay(context, width, height, colors)
    if (this.paused) this.drawPauseOverlay(context, width, height, colors)
  }

  drawPlayer(context, colors) {
    if (this.drawTexture(context, this.player.texture, this.player.x, this.player.y, this.player.radius * 2.4, this.player.radius * 2.4)) return
    context.save(); context.translate(this.player.x, this.player.y); context.fillStyle = colors.primary; context.beginPath(); context.moveTo(0, -24); context.lineTo(18, 20); context.lineTo(0, 13); context.lineTo(-18, 20); context.closePath(); context.fill(); context.fillStyle = '#d8fffb'; context.fillRect(-3, -12, 6, 17); context.restore()
  }

  drawEnemy(context, enemy, colors) {
    const radius = enemy.radius
    if (this.drawTexture(context, enemy.texture, enemy.x, enemy.y, radius * 2.4, radius * 2.4)) {
      this.drawEnemyHealthBar(context, enemy)
      return
    }
    context.save(); context.translate(enemy.x, enemy.y); context.fillStyle = enemy.color || (enemy.isBoss ? '#b56cf2' : colors.accent); context.beginPath(); context.moveTo(0, radius + 3); context.lineTo(radius + 3, -radius + 5); context.lineTo(0, -radius - 4); context.lineTo(-radius - 3, -radius + 5); context.closePath(); context.fill(); context.fillStyle = enemy.isBoss ? '#40285b' : '#573e2a'; context.fillRect(-4, -10, 8, 12); context.restore()
    const barWidth = enemy.isBoss ? 92 : 32
    context.fillStyle = '#1c2b31'; context.fillRect(enemy.x - barWidth / 2, enemy.y - radius - 13, barWidth, 5); context.fillStyle = enemy.isBoss ? '#d69cff' : '#ff7676'; context.fillRect(enemy.x - barWidth / 2, enemy.y - radius - 13, barWidth * Math.max(0, enemy.health / enemy.maxHealth), 5)
  }

  drawGameOver(context, width, height, colors) {
    context.fillStyle = 'rgba(5, 13, 18, 0.78)'; context.fillRect(0, 0, width, height)
    drawing.fillRoundedRect(context, 28, height / 2 - 116, width - 56, 232, 16, colors.panel)
    const button = this.getRestartButton(); context.fillStyle = colors.primary; context.fillRect(button.x, button.y, button.width, button.height)
  }

  drawProjectile(context, bullet, colors) {
    if (this.drawTexture(context, bullet.texture, bullet.x, bullet.y, bullet.radius * 2, bullet.radius * 2)) return
    context.fillStyle = bullet.color || colors.primary; context.beginPath(); context.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2); context.fill()
  }

  drawTexture(context, image, x, y, width, height) {
    if (!image || !image.width || !image.height) return false
    context.drawImage(image, x - width / 2, y - height / 2, width, height)
    return true
  }

  drawEnemyHealthBar(context, enemy) {
    const barWidth = enemy.isBoss ? 92 : 32
    context.fillStyle = '#1c2b31'; context.fillRect(enemy.x - barWidth / 2, enemy.y - enemy.radius - 13, barWidth, 5); context.fillStyle = enemy.isBoss ? '#d69cff' : '#ff7676'; context.fillRect(enemy.x - barWidth / 2, enemy.y - enemy.radius - 13, barWidth * Math.max(0, enemy.health / enemy.maxHealth), 5)
  }

  drawLevelComplete(context, width, height, colors) {
    context.fillStyle = 'rgba(5, 13, 18, 0.78)'; context.fillRect(0, 0, width, height)
    drawing.fillRoundedRect(context, 28, height / 2 - 116, width - 56, 232, 16, colors.panel)
  }

  drawUpgradeOverlay(context, width, height, colors) {
    context.fillStyle = 'rgba(3, 8, 14, 0.92)'; context.fillRect(0, 0, width, height)
    const layout = this.getUpgradeLayout()
    const panelX = 10; const panelW = width - 20
    drawing.fillRoundedRect(context, panelX, 10, panelW, height - 20, 18, '#101c27')
    drawing.strokeRoundedRect(context, panelX, 10, panelW, height - 20, 18, '#314556', 1)
    drawing.fillRoundedRect(context, layout.header.x, layout.header.y, layout.header.width, layout.header.height, 10, '#a94742')
    drawing.strokeRoundedRect(context, layout.header.x, layout.header.y, layout.header.width, layout.header.height, 10, '#e37a63', 2)
    drawing.drawText(context, '强化属性', width / 2, layout.header.y + 31, { font: '700 25px sans-serif', color: '#fff4de', align: 'center' })
    drawing.drawText(context, `等级 ${this.experienceState.level} · 选择一项`, width / 2, layout.header.y + 54, { font: '11px sans-serif', color: '#ffd2ad', align: 'center' })
    const tabs = [{ label: '属性', color: '#e9ae3d' }, { label: '技能', color: '#8b4bd8' }, { label: '效果', color: '#3b9ed2' }, { label: '稀有', color: '#4cae50' }]
    const tabGap = 7; const tabWidth = (layout.tabs.width - tabGap * (tabs.length - 1)) / tabs.length
    tabs.forEach((tab, index) => {
      const x = layout.tabs.x + index * (tabWidth + tabGap)
      drawing.fillRoundedRect(context, x, layout.tabs.y, tabWidth, layout.tabs.height, 12, tab.color)
      drawing.strokeRoundedRect(context, x, layout.tabs.y, tabWidth, layout.tabs.height, 12, '#152331', 2)
      drawing.drawText(context, tab.label, x + tabWidth / 2, layout.tabs.y + 26, { font: '700 15px sans-serif', color: '#fffdf1', align: 'center' })
    })
    this.upgradeOptions.forEach((option, index) => this.drawUpgradeCard(context, option, index, layout.cards[index]))
    drawing.drawText(context, '选择一张卡牌以继续远征', width / 2, layout.footerY, { font: '13px sans-serif', color: '#8fa5b7', align: 'center' })
  }

  drawPauseButton(context, colors) {
    const button = this.getPauseButton()
    drawing.fillRoundedRect(context, button.x, button.y, button.width, button.height, 8, colors.panel)
    drawing.strokeRoundedRect(context, button.x, button.y, button.width, button.height, 8, colors.panelLine, 1)
    context.fillStyle = colors.primary
    context.fillRect(button.x + 12, button.y + 10, 5, 18)
    context.fillRect(button.x + 21, button.y + 10, 5, 18)
  }

  drawPauseOverlay(context, width, height, colors) {
    context.fillStyle = 'rgba(5, 13, 18, 0.78)'
    context.fillRect(0, 0, width, height)
    const panelWidth = Math.min(width - 48, 300)
    const panelHeight = 260
    const panelX = (width - panelWidth) / 2
    const panelY = (height - panelHeight) / 2
    drawing.fillRoundedRect(context, panelX, panelY, panelWidth, panelHeight, 12, colors.panel)
    drawing.strokeRoundedRect(context, panelX, panelY, panelWidth, panelHeight, 12, colors.panelLine, 1)
    const options = ['继续游戏', '重新开始', '退出关卡']
    options.forEach((label, index) => {
      const button = this.getPauseOptionButton(index)
      drawing.fillRoundedRect(context, button.x, button.y, button.width, button.height, 8, index === 0 ? colors.primary : colors.backgroundLight)
      drawing.strokeRoundedRect(context, button.x, button.y, button.width, button.height, 8, colors.panelLine, 1)
      drawing.drawText(context, label, button.x + button.width / 2, button.y + button.height / 2, {
        font: '700 15px sans-serif',
        color: index === 0 ? colors.primaryDark : colors.text,
        align: 'center',
        baseline: 'middle'
      })
    })
  }

  getUpgradeLayout() {
    const width = this.viewport.width; const height = this.viewport.height
    const side = 18; const gap = 8; const contentWidth = width - side * 2
    const cardWidth = (contentWidth - gap * 2) / 3
    const header = { x: 18, y: 24, width: width - 36, height: 68 }
    const tabs = { x: 28, y: 102, width: width - 56, height: 42 }
    const cardsY = 158; const footerY = height - 32
    const cardHeight = Math.max(190, Math.min(390, footerY - cardsY - 26))
    return { header, tabs, footerY, cards: [0, 1, 2].map((index) => ({ x: side + index * (cardWidth + gap), y: cardsY, width: cardWidth, height: cardHeight })) }
  }

  drawUpgradeCard(context, option, index, card) {
    const palette = this.getUpgradePalette(option)
    drawing.fillRoundedRect(context, card.x, card.y, card.width, card.height, 12, palette.fill)
    drawing.strokeRoundedRect(context, card.x, card.y, card.width, card.height, 12, palette.line, 2)
    drawing.fillRoundedRect(context, card.x + 7, card.y + 7, card.width - 14, 34, 8, palette.header)
    drawing.drawText(context, option.category, card.x + card.width / 2, card.y + 29, { font: '700 12px sans-serif', color: '#fff7dd', align: 'center' })
    const iconSize = Math.min(76, card.width - 26); const iconX = card.x + (card.width - iconSize) / 2; const iconY = card.y + 54
    drawing.fillRoundedRect(context, iconX, iconY, iconSize, iconSize, 14, palette.icon)
    drawing.strokeRoundedRect(context, iconX, iconY, iconSize, iconSize, 14, palette.line, 2)
    const skillIcon = option.type === 'skill' ? this.getSkillIcon(option.skillId) : null
    if (!this.drawTexture(context, skillIcon, iconX + iconSize / 2, iconY + iconSize / 2, iconSize * 0.72, iconSize * 0.72)) drawing.drawText(context, this.getUpgradeIcon(option), iconX + iconSize / 2, iconY + iconSize * 0.64, { font: `${Math.max(25, Math.floor(iconSize * 0.42))}px sans-serif`, color: '#fff7b2', align: 'center' })
    drawing.drawText(context, option.title, card.x + card.width / 2, iconY + iconSize + 28, { font: '700 15px sans-serif', color: '#ffe67e', align: 'center' })
    drawing.drawText(context, this.getUpgradeValue(option), card.x + card.width / 2, iconY + iconSize + 53, { font: '700 13px sans-serif', color: '#f2f6ff', align: 'center' })
    drawing.drawText(context, `0${index + 1}`, card.x + 10, card.y + card.height - 13, { font: '700 11px sans-serif', color: palette.muted })
  }

  getUpgradePalette(option) {
    if (option.type === 'skill') return { fill: '#432267', header: '#7436a8', icon: '#63228f', line: '#c66cff', muted: '#d3a9f3' }
    if (option.type === 'skillEffect') return { fill: '#17486b', header: '#287ca7', icon: '#1f6b8e', line: '#5bc6ff', muted: '#a5e1ff' }
    if (option.id === 'healthBoost') return { fill: '#245f3c', header: '#3b9656', icon: '#26734a', line: '#71dd79', muted: '#b4f0aa' }
    return { fill: '#254c79', header: '#397eb6', icon: '#24749a', line: '#66b9ff', muted: '#b5dcff' }
  }

  getUpgradeIcon(option) {
    if (option.type === 'skill') return '✦'
    if (option.id === 'healthBoost') return '+'
    if (option.id === 'attackBoost' || option.id === 'damageBoost') return '↗'
    if (option.id === 'fireRateBoost' || option.id === 'projectileBoost') return '»'
    return '◆'
  }

  getSkillIcon(skillId) {
    const skill = this.getSkill(skillId)
    return skill && skill.icon ? this.loadTexture(skill.icon) : null
  }

  getUpgradeValue(option) {
    if (option.type === 'skill') return '新技能'
    if (option.id === 'attackBoost') return '攻击力 +1'
    if (option.id === 'fireRateBoost') return '射击间隔 -55ms'
    if (option.id === 'healthBoost') return '最大生命 +1'
    if (option.id === 'projectileBoost') return '额外子弹 +1'
    if (option.id === 'damageBoost') return '技能伤害 +1'
    return option.description
  }

  getRestartButton() { return { x: (this.viewport.width - 170) / 2, y: this.viewport.height / 2 + 12, width: 170, height: 48 } }
  getPauseButton() { return { x: this.viewport.width - 54, y: 16, width: 38, height: 38 } }
  getPauseOptionButton(index) {
    const width = Math.min(this.viewport.width - 96, 220)
    const height = 48
    const gap = 12
    const panelTop = (this.viewport.height - 260) / 2
    return { x: (this.viewport.width - width) / 2, y: panelTop + 28 + index * (height + gap), width, height }
  }

  reset() { this.player.x = this.viewport.width / 2; this.runAttributes = new RunAttributeState(this.baseAttributes); this.attributes = this.runAttributes.active; this.experienceState = new RunExperienceState(); this.skills = this.createSkillSlots(this.character.skillIds || [this.character.skillId]); this.pendingLevelUps = 0; this.upgradeOptions = []; this.upgradeOpen = false; this.player.attack = this.attributes.attack; this.player.maxHealth = this.attributes.maxHealth; this.player.health = this.attributes.maxHealth; this.enemies = []; this.bullets = []; this.elapsed = 0; this.fireTimer = 0; this.spawnTimer = 0; this.gameOver = false; this.levelComplete = false; this.paused = false; this.bossSpawned = false; this.spawnInterval = this.level.spawnPhases[0].interval }
  handleDrag(x) { if (!this.gameOver && !this.levelComplete && !this.upgradeOpen && !this.paused) this.player.x = Math.max(this.player.radius, Math.min(this.viewport.width - this.player.radius, x)) }
  handleTap(x, y) {
    if (this.paused) {
      const options = ['continue', 'restart', 'exit']
      options.forEach((option, index) => {
        const button = this.getPauseOptionButton(index)
        if (x < button.x || x > button.x + button.width || y < button.y || y > button.y + button.height) return
        if (option === 'continue') this.paused = false
        if (option === 'restart') this.reset()
        if (option === 'exit' && this.onBack) this.onBack()
      })
      return
    }
    if (this.upgradeOpen) {
      const cards = this.getUpgradeLayout().cards
      this.upgradeOptions.forEach((option, index) => { const card = cards[index]; if (card && x >= card.x && x <= card.x + card.width && y >= card.y && y <= card.y + card.height) this.applyUpgrade(option) })
      return
    }
    if (!this.gameOver && !this.levelComplete && this.isPauseButtonHit(x, y)) {
      this.paused = true
      return
    }
    if (!this.gameOver && !this.levelComplete) return
    if (this.levelComplete) { if (this.onBack) this.onBack(); return }
    const button = this.getRestartButton(); if (x >= button.x && x <= button.x + button.width && y >= button.y && y <= button.y + button.height) this.reset(); else if (this.onBack) this.onBack()
  }

  isPauseButtonHit(x, y) {
    const button = this.getPauseButton()
    return x >= button.x && x <= button.x + button.width && y >= button.y && y <= button.y + button.height
  }
}

module.exports = GameScene
