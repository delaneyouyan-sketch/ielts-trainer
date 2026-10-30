# 雅思逆袭 · 英语自学训练站 — 业务设计

> 源创意：`source_package/creative/`（localStorage 单机原型）。本应用把它升级为按登录用户隔离的服务端持久化全栈应用。源稿是视觉与业务意图权威。

## 核心链路

### 链路 1：学习小节 → 掌握标记 → 打卡/进度联动
- 入口：首页 hero「继续学习」、首页「六章学习路径」章卡、顶栏「课程」、学习页上一章/下一章。
- 动作：课程页按小节「标记为已掌握」（再点取消）。
- 中间态：小节勾选态实时变化，课程章卡 done/total、进度点变色。
- 真实结果：`done=true` 写入服务端该用户 `done_lessons`，并在同次请求把当日（Asia/Shanghai 自然日）幂等加入 `checkins`；toast「已掌握一节，今日打卡 +1」。`done=false` 仅移除掌握，不回退打卡。
- 回读：首页「已学小节 n/39」、总进度条、各章卡 n/total、顶栏「已打卡 N 天」刷新/重进保持。

### 链路 2：综合练习 → 判分 → 最佳成绩 + 错题自动收录
- 入口：首页「今日训练 · 综合练习」、顶栏「练习」。
- 动作：顺序作答全部 17 题（单选 / 听辨 TTS / 配对 / 排序），每题即时判对错并显示解析，最后「查看结果」。
- 真实结果：交卷时提交 `scorePercent` 与本次答错题干数组；服务端 `best_score = max(旧, 本次)`（错题重练模式不计最佳成绩），答错题干去重并入 `mistakes`。
- 回读：首页「练习最佳成绩」显示分数或「—」；错题进入错题本。「再做一遍」用同一批题重开；「完成并返回」回首页。

### 链路 3：错题重练 → 移除（我已掌握）
- 入口：错题本「用错题组一套重练」；错题本有错题时首页卡片变为「错题重练（n）」。
- 动作：只练错题题集；错题本内每条可「移除」。
- 真实结果：移除从该用户 `mistakes` 删除题干；重练交卷同样可把仍答错的题保留收录。
- 回读：错题本数量、首页卡片文案、空态随之变化。

### 链路 4：口语话题卡 → 真实录音上传 → 档案回听/删除
- 入口：首页「两分钟口语任务」、顶栏「口语舱」。
- 动作：选话题卡（6 张）→ MediaRecorder 真实采集麦克风、真实倒计时（到点自动停）→ 回听 `<audio>` → 勾选五问自评 →「保存这一版」。
- 真实结果：录音 webm Blob 经 dataloom `uploadFile` 上传得到 `download_url`，连同 tag/task/duration/checks POST 落库为一条 `trainer_recording`（按用户隔离）。
- 回读：「去档案对比」进入录音档案，新记录在列、可在线播放、可删除；首页「口语录音 n 条」联动。

## 非核心功能
无。源稿全部可见交互均实现真实闭环；教材静态内容（6 章 39 小节、17 题、6 张话题卡、5 条自评清单）作为前端常量迁移，不入库。

## 页面与路由
| 路由 | 页面 | 源稿区块 | 到达 |
|---|---|---|---|
| `/` | 首页仪表盘 | Dashboard | 顶栏 / 各页返回 |
| `/learn/:chapterId?` | 课程学习（无参默认 ch1） | Learn | 首页章卡深链、顶栏课程、上下章 |
| `/quiz` | 综合练习 | QuizView(onlyMistakes=false) | 首页综合练习、顶栏练习 |
| `/mistake-quiz` | 错题重练 | QuizView(onlyMistakes=true) | 错题本按钮（顶栏高亮「错题本」） |
| `/booth` / `/booth/:topicIndex` | 口语舱（选卡 + 录音台） | Booth/Stage | 首页、顶栏口语舱 |
| `/journal/:tab?`（mistakes/recordings，缺省 mistakes） | 错题本/录音档案双 tab | Journal | 顶栏错题本、录音保存后去档案 |

全局 Layout 迁移源稿 `.topbar`（品牌 + 5 导航 + 已打卡胶囊）与 `.app-shell` 纸张纹理；移动端汉堡菜单保留。

## 最小业务模型
- `trainer_state`：每登录用户一行，`owner user_profile` 主键；`done_lessons jsonb`（`Record<lessonKey,boolean>`）、`checkins text[]`（'YYYY-MM-DD' 上海时区）、`mistakes text[]`（题干文本）、`best_score integer NULL`（null = 未做过综合练习，首页显示「—」）。
- `trainer_recording`：`id uuid` 主键、`owner user_profile`、`tag varchar`、`task text`、`duration int`（秒）、`checks text[]`、`audio_url text`（dataloom download_url），审计列 `_created_at/_created_by/_updated_at/_updated_by`，按 `_created_at desc` 列出。
- 两表均启用 RLS，仅 `service_role` 与 owner 本人（`(owner).user_id = current_setting('app.user_id')`）可读写；owner 由后端用 `req.userContext.userId` 写入，不信任前端。
- 小节掌握 key = `${chapterId}-${lesson.h}`，与源稿 localStorage 完全一致。

## 接口与口径（Controller `api/trainer`，全部 @NeedLogin）
| 方法/路径 | 请求 | 响应（shared 类型） |
|---|---|---|
| GET /api/trainer/state | — | `TrainerState`（无记录返回全空默认，不报错） |
| POST /api/trainer/lessons/toggle | `ToggleLessonRequest{lessonKey,done}` | `ToggleLessonResponse{state, checkedToday}`（done=true 幂等加入并当日打卡；false 仅移除掌握） |
| POST /api/trainer/quiz/submit | `SubmitQuizRequest{wrongQuestions,scorePercent,onlyMistakes}` | `SubmitQuizResponse{state}`（错题去重合并；非重练才更新 best_score=max） |
| POST /api/trainer/mistakes/remove | `RemoveMistakeRequest{question}` | `SubmitQuizResponse{state}` |
| GET /api/trainer/recordings | — | `RecordingItem[]`，新→旧 |
| POST /api/trainer/recordings | `CreateRecordingRequest{tag,task,duration,checks,audioUrl}` | `RecordingItem` |
| DELETE /api/trainer/recordings/:id | — | 200，校验 owner，未命中 404 |

- 当日字符串服务端按 Asia/Shanghai 计算。
- 录音上传在前端用 dataloom，仅把 `download_url` 传给后端存 `audio_url`；上传走平台 runtime，开发态 Agent 无法实测，代码按文件存储 skill 写法即正确。
- 英文朗读沿用 `window.speechSynthesis`（en-US，rate 0.85–0.92），为浏览器本地能力，不入服务端。

## 验收要点
- 四个核心链路均从首页/顶栏可见入口走通，写后刷新与跨页回读保持，对象归属同一登录用户。
- 视觉：全部 6 个路由（含错题重练、双 tab、空态）逐页对照源稿 `.topbar/.hero/.stat/.ch-card/.lesson/.quiz-/.match-/.order-/.stage/.recorder/.topic-/.mistake-/.record-/.toast`，允许动态数字差异。
- 麦克风拒绝时显示源稿中文提示，不崩页；录音到点自动停。
- 阻塞：录音上传与浏览器 TTS 属平台/浏览器能力，Agent 沙箱不可达，按代码与日志核错，实际真机效果在用户预览态验证。
