# 主页面与页面跳转交接文档

本文档说明主页面、底部导航栏和当前页面跳转的实现方式，方便后续新增角色、图鉴、设置等功能时快速接入。项目使用原生微信小游戏 Canvas，不使用小程序页面路由；页面跳转实际是 `SceneManager` 替换当前场景。

## 1. 运行入口与跳转链路

启动链路如下：

```text
game.js
  -> new GameApp().start()
  -> GameApp.initializeRuntime()
  -> GameApp.showMainMenu()
  -> SceneManager.change(new MainMenuScene(...))
```

触摸事件链路如下：

```text
微信触摸事件
  -> InputManager
  -> GameApp.handleTap(x, y)
  -> SceneManager.handleTap(x, y)
  -> 当前场景.handleTap(x, y)
  -> 场景回调（showGame/showShop/showMainMenu）
```

关键文件：

- `game.js`：唯一启动入口，只创建并启动 `GameApp`。
- `src/game-app.js`：组装场景、保存全局运行时状态，并提供页面切换方法。
- `src/core/scene-manager.js`：只管理当前场景，不负责业务路由判断。
- `src/core/input-manager.js`：将微信触摸转换成点击/拖动事件。
- `src/scenes/main-menu-scene.js`：主页面绘制、开始游戏按钮和底部导航点击区域。
- `src/scenes/game-scene.js`：实际战斗页面。
- `src/scenes/shop-scene.js`：商城页面。

## 2. 当前页面跳转关系

```text
MainMenuScene --开始游戏--> GameScene
MainMenuScene --底部第 4 项“商城”--> ShopScene
GameScene    --返回/结束操作--> MainMenuScene
ShopScene    --返回主界面--> MainMenuScene
```

跳转方法全部集中在 `src/game-app.js`：

```js
showMainMenu() {
  this.scenes.change(new MainMenuScene(
    this.viewport,
    this.showGame.bind(this),
    this.showShop.bind(this),
    this.currency
  ))
}

showGame() {
  this.scenes.change(new GameScene(this.viewport, this.showMainMenu.bind(this)))
}

showShop() {
  this.scenes.change(new ShopScene(this.viewport, this.showMainMenu.bind(this), this.currency))
}
```

`showMainMenu`、`showGame`、`showShop` 是页面跳转的统一入口。新增页面时，应在 `GameApp` 中新增 `showXxx()`，不要在场景内部直接实例化其他场景。

## 3. 主页面结构

`MainMenuScene` 的构造参数如下：

```js
new MainMenuScene(viewport, onStart, onShop, currencyState)
```

- `viewport`：当前屏幕宽高，由 `GameApp` 统一维护。
- `onStart`：开始游戏回调，当前绑定 `GameApp.showGame`。
- `onShop`：商城回调，当前绑定 `GameApp.showShop`。
- `currencyState`：全局货币状态，用于绘制金币、钻石、点券余额。

主页面从上到下包括：

1. 背景网格和世界观标题。
2. 货币栏，调用 `src/ui/currency-display.js` 绘制。
3. 当前远征信息卡片。
4. “开始游戏”按钮。
5. 底部五项导航栏：`首页 / 角色 / 图鉴 / 商城 / 设置`。

开始游戏按钮区域由 `getStartButton()` 计算。底部导航栏由 `getNavigationBar()` 计算，每一项由 `getNavigationItem(index)` 计算，索引从 `0` 开始：

| 索引 | 文案 | 当前行为 |
| --- | --- | --- |
| `0` | 首页 | 当前主页面，无跳转 |
| `1` | 角色 | 暂未接入 |
| `2` | 图鉴 | 暂未接入 |
| `3` | 商城 | 调用 `onShop()` 进入商城 |
| `4` | 设置 | 暂未接入 |

当前 `handleTap(x, y)` 只处理开始游戏按钮和索引 `3` 的商城项。其它导航项即使被点击，也不会发生跳转。

## 4. 新增导航页面的标准步骤

以新增角色页面为例：

### 4.1 新建独立场景文件

在 `src/scenes/character-scene.js` 中定义 `CharacterScene`，至少实现：

```js
class CharacterScene {
  constructor(viewport, onBack) {
    this.viewport = viewport
    this.onBack = onBack
  }

  draw(context) {
    // 绘制页面
  }

  handleTap(x, y) {
    // 点击返回按钮时调用 this.onBack()
  }
}
```

每个页面保持一个独立文件，不要把多个页面的绘制逻辑合并到 `MainMenuScene`。

### 4.2 在 GameApp 中注册跳转

```js
const CharacterScene = require('./scenes/character-scene')

showCharacter() {
  this.scenes.change(new CharacterScene(this.viewport, this.showMainMenu.bind(this)))
}
```

如果页面需要访问货币、账号或其它全局状态，由 `GameApp` 注入，而不是在页面内部重新创建状态对象。

### 4.3 将回调传给主页面

在 `showMainMenu()` 创建 `MainMenuScene` 时增加回调参数，例如：

```js
new MainMenuScene(
  this.viewport,
  this.showGame.bind(this),
  this.showShop.bind(this),
  this.currency,
  this.showCharacter.bind(this)
)
```

然后在 `MainMenuScene` 中为对应导航索引增加点击判断。建议将导航项抽成配置数组，避免继续堆叠多个硬编码判断。

## 5. 返回主页面的约定

- 页面返回主页面时调用构造函数传入的 `onBack` 回调。
- 不要在 `ShopScene`、`GameScene` 等页面中直接 `new MainMenuScene`。
- `GameApp.showMainMenu()` 会重新创建主页面场景，但 `this.currency` 等由 `GameApp` 持有的状态不会丢失。
- `SceneManager.change()` 会先调用旧场景的 `exit()`（如果实现），再替换当前场景；当前场景没有强制要求实现生命周期方法。

## 6. 状态与页面跳转的边界

`GameApp` 负责跨页面共享的运行时状态，目前包括：

- `viewport`：屏幕尺寸。
- `currency`：金币、钻石、点券余额，定义在 `src/core/currency-state.js`。
- `scenes`：当前场景管理器。

场景负责自己的绘制、点击区域和页面内状态。新增页面时：

- 页面展示数据应从配置或注入状态读取。
- 不要在 `MainMenuScene` 中写商城、角色或图鉴的业务逻辑。
- 不要为了跳转修改 `game.js`；启动入口保持不变。

## 7. 检查清单

完成页面跳转后，至少检查：

1. 从主页面点击目标导航项能进入正确场景。
2. 目标页面的返回按钮能回到主页面。
3. 返回后全局状态（例如货币余额）仍保持不变。
4. 点击其它导航项不会误触发商城或开始游戏。
5. 所有新增 `.js` 文件通过 `node --check`。
6. 使用微信开发者工具编译并检查不同屏幕尺寸下的点击区域。

