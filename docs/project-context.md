# 项目开发约定

## 项目定位

微信小游戏“肉鸽小游戏”，当前版本 `1.0-beta`。

## 代码边界

- `game.js` 是唯一启动入口，只负责创建并启动 `GameApp`。
- `src/core/` 放运行时基础能力，例如场景管理和输入管理。
- `src/scenes/` 按游戏场景拆分功能，主界面与实际游戏场景不可混写。
- `src/ui/` 放通用绘制工具，不承载具体业务状态。
- `src/config/` 放版本、颜色和布局等共享配置。

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
