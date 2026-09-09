# 游戏玩法开发交接文档

本文档面向继续开发关卡、角色、属性、技能、敌人、商城和背包的同学，说明当前版本的代码入口、运行流程和配置边界。项目是原生微信小游戏，当前版本为 `1.01-beta`。

## 1. 启动入口与目录

- `game.js`：小游戏唯一入口，只创建 `GameApp` 并调用 `start()`。
- `src/game-app.js`：初始化 Canvas、异步读取屏幕尺寸、创建输入管理器和场景管理器。
- `src/core/`：通用运行时能力。
  - `scene-manager.js` 负责场景切换、更新、绘制和输入转发。
  - `input-manager.js` 将微信触摸事件转换为点击和拖动事件。
  - `asset-loader.js` 负责贴图缓存加载。
  - `run-attribute-state.js` 负责局内临时属性。
- `src/scenes/`：业务场景。
  - `main-menu-scene.js` 主菜单。
  - `game-scene.js` 当前战斗主循环、实体生成、碰撞、结算和绘制。
- `src/config/`：可复用的配置数据。
- `src/levels/`：每关独立的关卡编排文件。
- `src/ui/canvas-drawing.js`：通用 Canvas 绘制辅助函数。

启动时如果微信开发者工具的 JSBridge 尚未就绪，`game-app.js` 会优先异步调用 `wx.getSystemInfo`，失败后短暂重试；同步接口仅作为无异步接口环境下的回退。

## 2. 当前战斗流程

1. 主菜单点击“开始游戏”，`GameApp.showGame()` 创建新的 `GameScene`。
2. `GameScene` 读取默认角色、角色基础属性、角色技能和第一关数据，并创建局内属性容器。
3. 角色固定在画面底部，触摸拖动只改变 `player.x`，并限制在屏幕左右边界内。
4. 按 `attributes.fireInterval` 自动发射技能配置指定的子弹。当前子弹沿直线向上移动，不再自动追踪目标；`fireAtNearestEnemy` 方法名保留，但实际没有寻找或修正目标方向。
5. 怪物按关卡当前时间段生成并向下移动。怪物与角色相撞，或越过屏幕底部，都会触发失败。
6. 子弹与怪物使用圆形碰撞：两圆心距离小于等于半径之和即命中。命中后子弹消失，怪物扣除 `bullet.damage`；血量归零则移除，并按配置提供局内经验。
7. 第一关达到 120 秒后生成 Boss；Boss 被击败后设置 `levelComplete`，显示通关面板。失败后可点击“重新起飞”重置本局，或点击其他位置返回主菜单。
8. 战斗中点击右上角暂停按钮会冻结关卡计时、刷怪、技能冷却、实体移动和碰撞；暂停菜单提供继续游戏、重新开始和退出关卡。

当前碰撞半径：玩家 `18`（`game-config.js`），初始子弹 `10`，普通怪物由各自怪物配置决定（当前为 `14/16/19`），Boss 当前为 `34`。

## 3. 关卡数据

当前关卡文件为 [`src/levels/level-001.js`](../src/levels/level-001.js)。关卡文件保存本关节奏以及各时间段和 Boss 的战斗属性；怪物配置只提供实体 ID、贴图和大小。

```js
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
```

- `durationSeconds` 是进入 Boss 阶段前的倒计时，也是重要的平衡参数。
- `spawnPhases` 按 `untilSeconds` 从小到大排列；`interval` 单位为毫秒，`monsterId` 必须存在于普通怪物配置；每个阶段填写本阶段的 `health`、`speed`、`experience`、`color` 等战斗属性。
- `bossId` 必须存在于 Boss 配置，Boss 战斗属性填写在关卡的 `bossAttributes` 中。新增关卡时复制一个独立文件并修改关卡引用；通用规则才修改 `game-scene.js`。
- 当前运行时仍在 `game-scene.js` 顶部直接引入 `level-001`。若要支持选关或关卡顺序，应增加关卡加载器/选择状态，不要把多关数值继续写进场景逻辑。

## 4. 角色与属性边界

角色定义位于 [`src/config/character-config.js`](../src/config/character-config.js)，只描述角色身份、技能绑定、基础属性组绑定和贴图：

```js
initial: {
  id: 'initial',
  name: '初始角色',
  texture: '',
  skillId: 'initialBullet',
  playerAttributeId: 'initial'
}
```

账号内角色基础属性位于 [`src/config/player-attribute-config.js`](../src/config/player-attribute-config.js)，例如攻击力、射击间隔、移动速度和最大生命值。这些数据代表角色成长/存档，不应被局内强化直接改写。

局内临时属性由 [`src/core/run-attribute-state.js`](../src/core/run-attribute-state.js) 管理：

- `base`：创建本局时复制的基础属性快照。
- `bonus`：本局获得的临时加成。
- `active`：运行时生效属性，等于数值型基础属性加上对应加成。
- `addBonus({ attack: 2, maxHealth: 1 })`：增加局内加成。
- `GameScene.reset()` 会重新创建 `RunAttributeState`，因此局内属性不会带出关卡。

后续增加升级、宝箱或事件奖励时，应调用 `scene.addRunAttributeBonus(...)` 或在更高层的局内状态服务中写入 `bonus`，不要修改 `player-attribute-config.js`。若要保存永久成长，应另建账号/存档模块，不能复用局内容器。

## 5. 技能与子弹

技能位于 [`src/config/skill-config.js`](../src/config/skill-config.js)，每个技能必须有唯一 `id`，并支持可选的 `icon` 图标路径。当前“初始子弹”是技能 `initialBullet`，角色通过 `skillId` 绑定技能，技能再通过 `bulletType` 选择子弹类型。局内升级卡牌会优先绘制技能图标，图标未配置或资源未加载完成时使用默认符号回退。

```js
initialBullet: {
  id: 'initialBullet',
  name: '初始子弹',
  icon: '',
  texture: '',
  bulletType: 'initial',
  projectileCount: 1
}
```

子弹类型位于 [`src/config/game-config.js`](../src/config/game-config.js) 的 `gameplay.bullets`，集中维护半径、速度和颜色。当前 `initial` 子弹半径为 `10`。实际技能伤害由角色当前攻击力、技能 `damageMultiplier` 和局内技能效果加成共同计算。

新增子弹效果时，优先扩展技能字段（例如穿透、散射、范围、冷却）和子弹类型字段，再在 `game-scene.js` 的发射、更新或碰撞阶段实现通用行为。不要把“初始子弹”重新直接绑定回角色。

## 6. 普通怪物与 Boss

- 普通怪物：[`src/config/monster-config.js`](../src/config/monster-config.js) 的 `monsters`。
- Boss：[`src/config/boss-config.js`](../src/config/boss-config.js) 的 `bosses`。

两者配置文件只保存 `id`、可选 `texture` 和 `radius`。普通怪物的 `health`、`speed`、`experience`、`color` 等属性由关卡 `spawnPhases` 设置；Boss 对应属性由关卡 `bossAttributes` 设置。项目已移除得分系统；敌人击败后只提供局内经验。新增敌人时先增加对应配置，再在关卡文件引用 ID 和数值。

## 7. 贴图配置与回退

角色、技能、普通怪物和 Boss 均预留可选 `texture` 字段，填写微信小游戏可访问的本地资源路径，例如 `assets/characters/initial.png`。`AssetLoader` 按路径缓存 `wx.createImage()` 对象。

- 角色贴图来自 `character.texture`。
- 怪物/Boss 贴图来自各自配置的 `texture`。
- 子弹优先使用子弹类型的 `texture`，没有时使用技能的 `texture`。
- 贴图为空、加载器不可用或图片尚未准备好时，场景回退到 Canvas 几何图形，不会阻止游戏启动。

增加资源后要确认路径已被小游戏项目打包，并在真机/开发者工具中检查图片加载时机和尺寸。

## 8. 常见扩展操作速查

| 需求 | 主要修改文件 | 注意事项 |
| --- | --- | --- |
| 新增角色 | `character-config.js`、`player-attribute-config.js` | 分配唯一角色 ID 和属性组 ID；技能通过 `skillId` 绑定 |
| 调整角色永久属性 | `player-attribute-config.js` | 影响新开局基础值，不要写入局内奖励 |
| 新增局内强化 | 奖励/事件代码调用 `addRunAttributeBonus` | 只影响当前 `GameScene`，重开即清空 |
| 新增技能 | `skill-config.js`，必要时修改 `game-scene.js` | 必须有唯一技能 ID；初始子弹也按技能处理 |
| 新增子弹类型 | `game-config.js` | 配置半径、速度、基础伤害等；当前碰撞为圆形 |
| 新增普通怪物 | `monster-config.js`、对应关卡文件 | 配置文件只填 ID/贴图/大小；关卡阶段填写战斗属性并通过 `monsterId` 引用 |
| 新增 Boss | `boss-config.js`、对应关卡文件 | 配置文件只填 ID/贴图/大小；关卡 `bossAttributes` 填写战斗属性并通过 `bossId` 引用 |
| 新增关卡 | `src/levels/level-xxx.js` | 独立保存时长、刷怪阶段和 Boss ID；后续接入关卡加载器 |
| 更换贴图 | 对应配置的 `texture` 字段 | 资源路径必须可被小游戏访问，空值自动回退绘制 |

## 9. 提交前检查

在项目根目录执行：

```powershell
Get-ChildItem -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }
Get-ChildItem -Recurse -Filter *.json | ForEach-Object { Get-Content -Raw $_.FullName | ConvertFrom-Json | Out-Null }
```

然后使用微信开发者工具导入项目根目录，编译并预览 `game.js`。战斗场景不绘制常驻 HUD、技能图标或技能冷却提示；右上角暂停按钮和暂停菜单是交互例外，会显示三个操作文本。重点验证：拖动边界、子弹直线方向、不同阶段刷怪间隔、暂停后计时和实体是否冻结、重新开始是否清空局内状态、退出是否返回主界面、120 秒 Boss 生成、Boss 击败通关、失败重开后局内属性是否清空，以及贴图缺失时的 Canvas 回退。
