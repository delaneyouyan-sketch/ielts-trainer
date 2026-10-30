# 雅思逆袭 · 英语自学训练站（全栈版）

将创意原型 `source_package/creative/`（localStorage 单机）升级为按登录用户隔离的服务端持久化应用。业务设计见 `docs/business-design.md`，源稿是视觉与业务意图权威。

## 架构

- React 19 + react-router-dom v7 + NestJS 10 + Drizzle + PostgreSQL。
- 教材静态内容（`CHAPTERS` 六章 39 小节、`QUIZ` 17 题、`SPEAKING_TOPICS` 6 卡、`CHECKLIST` 5 条）为前端常量，从源稿 `data.jsx` 原样迁移到 `client/src/pages/trainer/content.ts`，不入库、不改文案。
- 用户态（掌握小节 / 打卡 / 错题 / 最佳成绩 / 录音）全部服务端持久化，按登录用户隔离；禁止 mock、禁止前端 localStorage 当事实源。
- 录音：前端 MediaRecorder 采集 webm → dataloom `uploadFile`（直接传 Blob 包成的 File，type `audio/webm`）→ 拿 `download_url` POST 后端存 `audio_url`。
- 英文朗读用 `window.speechSynthesis`（en-US），封装在 `client/src/pages/trainer/lib/speak.ts`。

## 目录
- 后端：`server/modules/trainer/`（controller / service / dto / module），表 `trainer_state`、`trainer_recording`。
- 共享契约：`shared/api.interface.ts`（`TrainerState`、`RecordingItem`、各 Request 类型）。
- 前端：全部落在 `client/src/pages/trainer/`（pages/components/hooks/lib/content.ts/trainer.css）；API 出口 `client/src/api/trainer.ts`。
- 聚合文件 `app.module.ts` / `app.tsx` / `api/index.ts` 由主 agent 预填，业务任务不编辑。

## 接口口径（`api/trainer`，全部 @NeedLogin，owner 取 req.userContext.userId）
GET state；POST lessons/toggle（done=true 时幂等掌握并当日打卡）；POST quiz/submit（错题题干去重合并，onlyMistakes=false 才 best_score=max，scorePercent 0–100）；POST mistakes/remove；GET recordings（新→旧）；POST recordings；DELETE recordings/:id（owner 校验，未命中 404）。当日按 Asia/Shanghai 'YYYY-MM-DD'。

## 视觉规范（布面教科书风，严格还原源稿 styles.css）
- 实现方式：`client/src/pages/trainer/trainer.css` **原样迁移**源稿 styles.css 全部规则与类名（含 :root 变量、纸张纹理、响应式 @media、toast 动画），在 `app.tsx` 顶部 import；页面 JSX 沿用源稿类名，不改写为 Tailwind 工具类。不要 shadcn 化。
- 色板（CSS 变量）：`--paper #f6f2e7`、`--paper-2 #efe8d6`、`--ink #26221b`、`--green #1f5c46`、`--green-d #174635`、`--gold #b08a3e`、`--red #c0453b`、`--line #e3dac4`；语义只用这些。
- 字体：trainer.css 顶部 `@import` 妙搭字体镜像 Noto Serif SC / Noto Sans SC / Spectral / Caveat；标题 serif、正文 sans、英文点缀 Spectral、手写体 Caveat。
- 关键视觉元素必须保留：米纸布面底纹、学院绿描边卡片、金色分隔/序号、朱红（CTA 按钮/已掌握/答错/错题徽标）、stamp 印章感「已掌握」、手写体强调、绿色 toast。
- 布局：`.topbar` 固定顶栏（品牌 + NavLink 导航 + 已打卡胶囊），`.app-shell` 最大宽 1120px、padding 22px；卡片圆角 16–22px；间距沿用源稿，不另造取值。
- 可点元素用语义化 `<button>`/NavLink；图标用 lucide-react（源稿无图标库处不强加，emoji 章标保留源稿原样）。
- 无障碍：录音按钮、图标按钮加 aria-label；导航用 NavLink active 高亮。

## 关键状态结构（前后端口径一致）
- `doneLessons: Record<string, boolean>`，key `${chapterId}-${lesson.h}`。
- `checkins: string[]`（'YYYY-MM-DD'）；首页 streak = checkins.length。
- `mistakes: string[]`（题干 q 文本）。
- `bestScore: number|null`（null = 未做过综合练习，首页显示「—」）。
- 录音 `{id,tag,task,duration,checks,audioUrl,createdAt}`。

## 约束
- 禁止 `any`、禁止 `as any`/`{} as T`；显式类型；后端变量与回调参数标注类型。
- 前端数据用 @tanstack/react-query（`AppContainer` 已提供 QueryClient），mutation `retry:false`，成功后 invalidate `['trainer-state']` / `['trainer-recordings']`。
- 错误文案读 `error.response?.data?.error?.message`；禁止 alert/confirm，反馈用源稿风格 toast（小组件，非 sonner）。
- 跳转用 react-router，禁止 window.location。
