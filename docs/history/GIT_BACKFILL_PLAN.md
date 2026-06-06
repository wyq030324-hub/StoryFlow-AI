# StoryFlow AI Git 补录方案

## 目标

- 不改业务功能
- 不重写历史
- 仅补“阶段记录”和“工程化提交说明”
- 与最新版成品分支隔离

## 推荐方式

由于当前工作目录未初始化 Git，且远端仓库接口当前不可访问，推荐采用以下方式补录：

1. 在本地初始化仓库或切到单独分支
2. 提交 `docs/history/` 文档
3. 只在历史分支维护阶段记录，不改主交付分支

## 推荐分支名

```text
docs/stage-history
```

## 推荐标签方案

如果后续你要补 tag，建议使用轻量、可读的工程化命名：

```text
stage-01-architecture
stage-02-foundation
stage-03-demo-workflow
stage-04-multi-page-ia
stage-05-visual-system
stage-06-experience-polish
stage-07-showcase-and-fixes
stage-08-competition-packaging
stage-09-navigation-upgrade
stage-10-motion-polish
stage-11-mobile-and-reveal
stage-12-core-experience-refactor
stage-13-rewrite-and-script-edit
stage-14-narrative-graph-engine
stage-15a-prompt-engine
stage-15b-deepseek-integration
```

## 推荐 commit 补录顺序

### commit 1

```text
docs: add StoryFlow AI stage history backfill
```

```bash
git add docs/history/STAGE_HISTORY.md
git commit -m "docs: add StoryFlow AI stage history backfill"
```

### commit 2

```text
docs: add Git backfill plan for stage records
```

```bash
git add docs/history/GIT_BACKFILL_PLAN.md
git commit -m "docs: add Git backfill plan for stage records"
```

### commit 3

```text
docs: update README with Prompt Engine and DeepSeek setup
```

```bash
git add README.md
git commit -m "docs: update README with Prompt Engine and DeepSeek setup"
```

## 如果你已经有正式业务仓库

不要把阶段记录直接混进最新交付分支，建议：

1. 从主分支切出 `docs/stage-history`
2. 只提交 `docs/history/` 与 `README.md`
3. 不提交 `.env.local`
4. 不提交 zip、日志、构建产物

## 如果你想补 release notes

每个阶段按“要求 + 实际产出”写，不写空泛总结，不写泛化感受。

推荐模板：

```md
## 阶段 X

### 要求
- ...

### 实际产出
- ...
```
