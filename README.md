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
├── game.js             # 小游戏启动入口
├── game.json           # 小游戏运行配置
├── app.js              # 备用小程序生命周期和全局状态
├── app.json            # 备用页面配置
├── app.wxss            # 备用全局样式
├── pages/index/        # 可复用的界面代码
├── project.config.json # 微信开发者工具项目配置
└── sitemap.json        # 页面索引配置
```

后续可以把实际玩法拆分到 `pages`、`components` 和 `utils` 目录，并将游戏循环或 Canvas 渲染逻辑放入独立模块。
