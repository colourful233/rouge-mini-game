# 肉鸽小游戏

版本：`1.0-beta`

一个用于后续游戏开发的原生微信小游戏项目骨架。

## 开始开发

1. 使用微信开发者工具导入本目录 `D:\AI\plane`，项目类型选择小游戏（配置已设为 `game`）。
2. 将 `project.config.json` 中的 `appid` 替换为你的小程序 AppID；本项目暂时使用 `touristappid` 作为开发占位值。
3. 编译并预览 `game.js` 入口。

## 目录结构

```text
.
├── game.js             # 小游戏唯一启动入口
├── game.json           # 小游戏运行配置
├── project.config.json # 微信开发者工具项目配置
├── VERSION             # 当前版本
└── src/                # 游戏运行时代码
    ├── config/         # 版本和视觉配置
    ├── core/           # 输入和场景管理
    ├── scenes/         # 主界面、游戏场景
    └── ui/             # Canvas 绘制工具
```

后续可以把实际玩法拆分到 `pages`、`components` 和 `utils` 目录，并将游戏循环或 Canvas 渲染逻辑放入独立模块。
