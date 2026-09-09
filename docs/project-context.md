# 项目开发约定

## 项目定位

微信小游戏“肉鸽小游戏”，当前版本 `1.01-beta`，世界观为剑与魔法题材的随机冒险。当前玩法以闯关形式推进，玩家按关卡顺序进行游戏。

`1.01-beta` 发布内容：玩法节奏和战斗流程优化、局内技能升级、金币货币状态、商城购买和背包查看。

## 关卡数据约定

- 每一关都必须拥有独立的关卡数据文件，保存该关的刷怪配置、敌人参数、通关目标、节奏和奖励等内容。
- 运行时代码通过关卡数据加载器读取当前关卡；场景逻辑只负责通用的战斗流程，不在代码中硬编码每一关的具体数值。
- 新增或调整关卡时，优先修改对应关卡数据文件；只有通用规则变化时才修改场景或核心逻辑。
- 关卡数据应保持可序列化、可校验，并使用稳定的关卡 ID 与顺序字段，便于存档、解锁和后续扩展。

## 代码边界

- `game.js` 是唯一启动入口，只负责创建并启动 `GameApp`。
- `src/core/` 放运行时基础能力，例如场景管理和输入管理。
- `src/scenes/` 按游戏场景拆分功能，主界面与实际游戏场景不可混写。
- `src/ui/` 放通用绘制工具，不承载具体业务状态。
- `src/config/` 放版本、颜色和布局等共享配置。
- `src/config/world-config.js` 放世界观、地点和叙事文案，不与场景绘制逻辑混写。
- `src/config/shop-config.js` 只保存商城商品定义；购买逻辑由 `ShopScene` 调用 `CurrencyState` 和 `InventoryState` 完成。
- `src/core/currency-state.js` 管理金币、钻石和点券余额；`src/core/inventory-state.js` 管理道具数量。
- `src/levels/`（或同等明确目录）放置按关卡拆分的独立数据文件；不要把单关数据散落在场景代码中。
- 当前第一关数据文件为 `src/levels/level-001.js`，关卡时长、分时间段刷怪配置和 Boss 参数均在该文件中维护。
- 普通小怪与 Boss 分开维护：小怪数据位于 `src/config/monster-config.js`，Boss 数据位于 `src/config/boss-config.js`。这两个配置只保存实体 `id`、可选 `texture` 和大小 `radius`；生命、速度、经验、颜色等战斗属性必须由关卡的 `spawnPhases` 或 `bossAttributes` 提供。
- 子弹使用类型配置管理，当前默认类型为 `initial`（初始子弹）；子弹半径、速度、伤害和颜色集中在 `src/config/game-config.js` 的 `gameplay.bullets` 中，后续新增类型时扩展该配置。
- 角色系统与属性系统分开维护：`src/config/character-config.js` 只保存角色类型、名称和技能绑定；`src/config/player-attribute-config.js` 保存玩家账号内角色的基础属性。`src/core/run-attribute-state.js` 管理局内临时属性，局内强化只能写入该容器，关卡结束或重开时丢弃，不得回写基础属性配置。
- 技能使用独立配置：`src/config/skill-config.js` 中每个技能都必须有唯一 `id`，并支持可选的 `icon` 图标路径。当前“初始子弹”作为 `initialBullet` 技能存在，角色通过 `skillId` 绑定技能，技能再引用子弹类型；后续可在技能配置中扩展多发、范围、穿透等效果参数。局内升级卡牌会优先绘制技能的 `icon`，未配置或资源未加载完成时使用默认符号回退。
- 角色、技能、普通小怪和 Boss 配置均支持可选 `texture` 字段，填写本地资源路径后由统一资源加载器绘制；未配置时使用默认 Canvas 图形作为回退。

## 并行开发流程

1. `main` 是稳定分支，不直接进行功能开发。
2. 每个功能从最新 `main` 创建独立分支，分支名使用 `codex/feature/<功能名>`。
3. 每个功能使用独立 worktree，目录放在仓库外的 `plane-worktrees/` 下。
4. 功能完成后先在自己的 worktree 中检查并提交，再合并回 `main`。
5. 合并后删除已完成的 worktree 和功能分支，再从最新 `main` 创建下一条功能分支。

## 检查命令

提交前至少执行：

```powershell
Get-ChildItem -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }
Get-ChildItem -Recurse -Filter *.json | ForEach-Object { Get-Content -Raw $_.FullName | ConvertFrom-Json | Out-Null }
```
