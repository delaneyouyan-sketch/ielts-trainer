/* 课程与题库数据，内容整理自《雅思逆袭一本通》——源稿 data.jsx 原样迁移，不入库、不改文案 */

export interface LessonExample {
  zh: string;
  en: string;
  mark?: string;
}

export interface Lesson {
  h: string;
  p: string;
  bad?: string;
  badNote?: string;
  goods?: string[];
  ex?: LessonExample[];
}

export interface Chapter {
  id: string;
  no: string;
  title: string;
  sub: string;
  goal: string;
  lessons: Lesson[];
}

export type QuizType = 'single' | 'match' | 'listen' | 'order';

export interface QuizMatchPair {
  left: string;
  right: string;
}

export interface QuizQuestion {
  type: QuizType;
  chapter: string;
  q: string;
  opts?: string[];
  ans?: number;
  pairs?: QuizMatchPair[];
  items?: string[];
  speak?: string;
  why: string;
}

export interface SpeakingTopic {
  tag: string;
  mins: number;
  task: string;
  vocab: string[];
  tips: string;
}

export const CHAPTERS: Chapter[] = [
  {
    id: 'ch1',
    no: '01',
    title: '语言底层原理',
    sub: '英汉表达的十组差异',
    goal: '读句子先抓主干、逻辑与重点，逐步摆脱逐词翻译。',
    lessons: [
      {
        h: '形合与意合',
        p: '英语的因果、转折、条件必须用连词、关系词或标点明确标记；汉语常靠语序与上下文把意思“捏”在一起。看到两个中文分句，先判断关系再选择连词、从句、分号或拆句。',
        bad: 'It is late, I must leave.',
        badNote: '逗号拼接：两个完整句不能只用逗号相连',
        goods: ['It is late, so I must leave.', 'It is late; I must leave.', 'It is late. I must leave.'],
        ex: [
          { zh: '跑得了和尚，跑不了庙。', en: 'The monks may run away, but the temple cannot run away with them.', mark: 'but 明确转折' },
          { zh: '一个不会说中国话的英国人，有一次在中国旅行。', en: 'An Englishman who could not speak Chinese was once traveling in China.', mark: 'who 引导定语从句' },
        ],
      },
      {
        h: '信息结构：先建立主干与焦点',
        p: '英语通常较早建立主语和谓语，较长、较新的信息放在句后；但条件、原因也可放在句首搭建理解框架。开口或写作前，先确定这句话最想说什么。',
        ex: [
          { zh: '生活中既有悲剧，文学作品就可以写悲剧。', en: 'Tragedy can be represented in literature because it exists in life.', mark: '先结论，后原因' },
          { zh: '（同义的另一种语序）', en: 'Since tragedy exists in life, it can be represented in literature.', mark: '先原因，后结论' },
        ],
      },
      {
        h: '名词化与动词化：先定核心谓语',
        p: '正式英语常用名词、介词短语和非谓语压缩信息，口语更常直接用动词。第一步永远是先确定每个小句的核心谓语，其余动作再处理成从句、非谓语或短语。',
        ex: [
          { zh: '一看见这东西，我就紧张。', en: 'The very sight of it makes me nervous.', mark: '名词 sight 承担动作' },
          { zh: '我担心你误解我。', en: 'I am afraid of you misunderstanding me.', mark: '动名词结构' },
        ],
      },
      {
        h: '物称与人称',
        p: '英语常拿事物、事件或抽象概念作主语，汉语更习惯用“人”或无主句。不要机械翻译中文里的“谁”——变化、政策、经历、数据、现象都可以作主语。',
        ex: [
          { zh: '奥格尔维进门时，带进一缕雪茄烟雾。', en: 'A wave of cigar smoke accompanied Ogilvie in.', mark: '烟雾作主语' },
          { zh: '痛苦吞噬着这位曾令世人发笑的人。', en: 'Bitterness fed on the man who had made the world laugh.', mark: '抽象名词作主语' },
        ],
      },
      {
        h: '被动与主动',
        p: '被动不是“高级句式”，而是调整信息重点的方式：承受者或结果更重要、执行者未知或不重要时用被动；需要补充执行者时才用 by 引出。',
        ex: [
          { zh: '海洋学是理解地球的关键，但其重要性很少得到充分认识。', en: 'The importance of oceanography as a key to understanding our planet is seldom fully appreciated.' },
        ],
      },
      {
        h: '长句与短句',
        p: '英语借助从句、非谓语和代词把多层信息装进一个句子；汉语更常拆成短句。读长句先找主干，再看其余部分如何依附；输出时以清楚、准确、可控为准，不必硬写长句。',
        ex: [
          { zh: '（主干示例）', en: 'As we lived near the road, we often had the traveler or stranger visit us to taste our gooseberry wine, for which we had great reputation.', mark: '主干：we often had the traveler or stranger visit us' },
        ],
      },
      {
        h: '后饰与前饰',
        p: '中文长修饰集中在名词前的“的”字前；英语先说中心名词，再用介词短语、分词或定语从句向后补充。',
        ex: [
          { zh: '与持不同偏见的人进行辩论', en: 'an argument with a person having a different bias', mark: '中心名词 person 在前' },
          { zh: '桌子上的书', en: 'the book on the table' },
        ],
      },
      {
        h: '短语单位',
        p: '英语句子的构件是名词短语、动词短语、介词短语、分词与不定式结构，而不是孤立单词。阅读按短语切分，表达整体调用搭配。',
        ex: [
          { zh: '世界钢铁工业深陷萧条', en: 'with the world steel industry deep in the doldrums', mark: '介词短语' },
          { zh: '为你的朋友挺身而出', en: 'stand up for your friend', mark: '动词短语' },
        ],
      },
      {
        h: '时体：动词形式里的时间与状态',
        p: '汉语用“了、过、着、在”和时间词，英语用动词形式。先判断事件发生的时间与观察角度（过程、完成还是经历），再选形式。',
        ex: [
          { zh: '去年冬天他们正在修一座水坝。', en: 'They were building a dam last winter.', mark: '进行体：强调过程' },
          { zh: '去年冬天他们修了一座水坝。', en: 'They built a dam last winter.', mark: '一般过去时：强调完成' },
        ],
      },
      {
        h: '形态：从词形读取信息',
        p: '词根词缀帮助猜词：wed（结婚）→ unwed（未婚的）→ unwed motherhood（未婚母亲现象）。代词有格与数的变化，指代可能歧义时，汉语要恢复成具体名词。',
        ex: [
          { zh: '健康比财富更重要，因为财富不能像健康那样带来那么多幸福。', en: 'Health is above wealth, for this cannot give so much happiness as that.', mark: 'this = wealth，that = health' },
        ],
      },
    ],
  },
  {
    id: 'ch2',
    no: '02',
    title: '前期积累',
    sub: '建立可整体调用的语块',
    goal: '积累的不是孤立单词，而是意群、音块、短语、句型与固定搭配。',
    lessons: [
      {
        h: '什么是语块',
        p: '语块 = 意群 + 音块 + 短语词组/句型 + 固定搭配。记录一个语块要同时记住：写法、意思、搭配限制、语域（口语/书面）和自然发音。理解时整体识别，表达时整体调用。',
      },
      {
        h: '声音层：连读与弱读',
        p: '先按意思和结构分块，再观察块在真实语流中怎样重读、弱读、连接。弱读是非重读位置的功能词弱式，常含 /ə/；强调或对比时才用强式。',
        ex: [
          { zh: 'pick it up 在语流中', en: 'pick-i-tup', mark: '词尾辅音 + 下词元音 → 连读' },
          { zh: 'a / to / of 的弱读', en: '/ə/  /tə/  /əv/', mark: '功能词弱式' },
        ],
      },
      {
        h: '形式层：句型与搭配',
        p: '句型不是为了套模板，而是为常见表达功能提供可重复调用的结构。积累时记录它表达什么、后面接什么、适用于口语还是写作。',
      },
      {
        h: '理解层：长难句训练',
        p: '顺序固定：先找主干 → 识别从句、非谓语、介词短语与指代 → 恢复信息之间的逻辑。',
      },
      {
        h: '语块向四项迁移',
        p: '阅读按意群拆分长句；写作积累与功能匹配的搭配而非孤立“高级词”；听力把书面语块与真实发音对应；口语整体提取语块，用意群组织停顿。',
      },
    ],
  },
  {
    id: 'ch3',
    no: '03',
    title: '通用输出系统',
    sub: '从造句到润色',
    goal: '先保证语法正确、逻辑清楚，再追求自然、准确和有表现力。',
    lessons: [
      {
        h: '第一步：确定句子目的与类型',
        p: '类型决定结构与语气：陈述 S+V；疑问助动词前置；祈使动词开头省略主语；感叹用 What/How 引导。',
        ex: [
          { zh: '陈述', en: 'She writes a book.' },
          { zh: '疑问', en: 'Does she write a book?' },
          { zh: '祈使', en: 'Write the book.' },
          { zh: '感叹', en: 'What a great book she wrote!' },
        ],
      },
      {
        h: '第二步：确定句子骨架',
        p: '先找核心谓语，再判断所需成分：SV、SVC（主系表）、SVO、SVOO（双宾）、SVOC（宾补），最后检查时态、助动词与语序。',
      },
      {
        h: '第三步：安放“的、地、得”',
        p: '“的”=定语，修饰名词：形容词前置，介词短语/分词/不定式/定语从句后置。“地”=状语，回答怎样、何时、何地、为什么。“得”英语没有单一对应：程度用副词、结果用宾补或 so…that，信息太长就拆句。',
        ex: [
          { zh: '那个正在房间里睡觉的男人', en: 'the man sleeping in the room', mark: '短语作定语后置' },
          { zh: '他是第一个到达的人。', en: 'He is the first person to arrive.' },
          { zh: '不知道答案，他保持了沉默。', en: 'Not knowing the answer, he kept silent.', mark: '分词短语作原因状语' },
        ],
      },
      {
        h: '第四步：逻辑必须外显',
        p: '先判断信息关系再选词：并列 and/as well as；因果 because of+名词、because+句子；转折 however、对比 whereas、纠正 on the contrary；让步 despite+名词、although+句子；条件 as long as/unless；总结 to sum up；举例 for instance。',
        ex: [
          { zh: '尽管他们很快乐，但总缺点什么。', en: 'Happy as they were, there was something missing.', mark: 'as 引导让步' },
          { zh: '万一发生紧急情况，立刻拨打这个号码。', en: 'In the event of an emergency, call this number immediately.' },
        ],
      },
      {
        h: '润色：词汇升级与语域',
        p: '升级不是换生僻词：get 可细化为 obtain/become/arrive；very good 按对象改为 effective/convincing/enjoyable。认准搭配 tackle a problem、piqued my interest；正式场合用 substantial benefits，口语才说 It worked really well。',
      },
      {
        h: '润色：语序与特殊句型',
        p: '尾重原则：长内容放句尾，用 It 作形式主语。信息焦点前置可把时间/地点状语移到句首。强调句、倒装句、被动都服务于焦点。',
        bad: 'That he passed the exam without any preparation surprised everyone.',
        badNote: '主语过长，头重脚轻',
        goods: ['It surprised everyone that he passed the exam without any preparation.'],
        ex: [
          { zh: '强调他的专注', en: 'It was his dedication that impressed me the most.' },
          { zh: '他不仅完成了工作，还超出了预期。', en: 'Not only did he finish the work, but he also exceeded expectations.' },
        ],
      },
      {
        h: '最终检查',
        p: '标点：并列句必须有连词或分号。朗读测试找拗口，但论证、搭配与语法仍要靠语法检查和词典核验。',
      },
    ],
  },
  {
    id: 'ch4',
    no: '04',
    title: '分项基础应用',
    sub: '听 · 说 · 读 · 写',
    goal: '把同一套能力迁移到四项真实任务中。',
    lessons: [
      {
        h: '口语基础提醒',
        p: '第一句用与题目相关的简短缓冲表达争取组织时间，同时自然改述题点。先求清楚、连贯、自然，不要为语速牺牲清晰度。',
      },
      {
        h: '听力：泛听与精听',
        p: '泛听抓话题推进与转折信号，不因一个词停留。精听五步：常速盲听 → 困难片段反复听 2–4 次并转写 → 对照原文定位（词汇/弱读连读/句法）→ 再盲听 → 看原文听查缺。',
      },
      {
        h: '听不懂的四类原因',
        p: '① 单词不认识；② 单词认识但没听出来；③ 弱读、连读、同化、词尾或口音变体；④ 词义、句法、指代、话语结构或背景知识没跟上。先诊断类别再练。',
      },
      {
        h: '阅读：长难句到段落',
        p: '单句之后判断它在段落中的角色：观点、原因、例子、转折、限定还是总结。警惕同义改写：核对对象、时间、范围、程度与逻辑，不能只凭关键词相同作答。',
      },
      {
        h: '写作：从正确句到完整段',
        p: '先明确任务、对象与正式程度；Task 2 权重高于 Task 1，“高级表达”必须以准确回题为前提。段落推进：中心意思 → 解释原因 → 具体例子 → 回扣本段。写后查任务回应、段落中心、衔接逻辑、语域与语法标点。',
      },
    ],
  },
  {
    id: 'ch5',
    no: '05',
    title: '口语专项系统',
    sub: '组织内容 → 组织语流 → 提高清晰度 → 维持互动',
    goal: '把发音、句块、改述和互动策略练成可回听、可修正的闭环。',
    lessons: [
      {
        h: '句块化与重音',
        p: '按意思把句子切成语调单位，先标内容词（名、动、形、副），再按语境定核重音；功能词非重读时用弱式，对比或纠正时也可重读。',
        ex: [
          { zh: '分块', en: 'She’s writing / a new novel / about Chinese history.', mark: '重读 writing, new, novel, Chinese, history' },
        ],
      },
      {
        h: '长修饰的口语处理',
        p: '三选一：完整定语从句、缩减为分词短语、拆成两个短句。the book that was written by her → the book written by her。以当下最清楚流利为准。',
      },
      {
        h: '衔接词与话轮管理',
        p: '口语偏好短衔接：开头 So/Well/Right/Anyway；递进 plus/also；转折 but/actually；结论 so；求确认 right?/you know?。按逻辑适量用，堆叠 well/so/actually 反而机械。',
      },
      {
        h: '发音常见难点',
        p: '/θ/ /ð/ 别替成 /s/ /z/ /f/（think ≠ sink）；/v/ 上齿触下唇，别读成 /w/；/r/ 舌不触龈、/l/ 舌尖触龈；/ŋ/ 不等于 /n/（sing /sɪŋ/）。-ed 三读：worked /t/、played /d/、wanted /ɪd/。用最小对立对练。',
      },
      {
        h: '连读、弱读、同化',
        p: '连读 pick it up → pick-i-tup；弱读 a /ə/、to /tə/；同化 good boy 中 /d/ 受 /b/ 影响向双唇靠拢。先听出来，再跟读形成。',
      },
      {
        h: '语调带义',
        p: '升调：yes/no 问句、未完成列举、礼貌惊讶；降调：完整陈述、WH 问句、确定指令；降升调表礼貌保留；对比重音 I wanted the red one, not the blue one。',
      },
      {
        h: '即兴修补策略',
        p: '会话是有效交流而非完美发音表演。求重复 Sorry, could you say that again?；求慢速 Could you speak more slowly?；拖延 Let me think…；改述 What I mean is…',
      },
      {
        h: '书面到口语',
        p: 'She is writing → She’s writing（缩约不改变时体）；命令想礼貌就加情态：Please pass the salt. → Could you pass the salt, please?',
      },
    ],
  },
  {
    id: 'ch6',
    no: '06',
    title: '训练 · 反馈 · 复盘',
    sub: '录音 → 回听 → 定位 → 重练 → 重录',
    goal: '知识只有进入可执行、可回听、可修正的训练闭环，才变成能力。',
    lessons: [
      {
        h: '三阶段进阶',
        p: '阶段 A（1–2 周，20 分钟/天）：1–2 个最影响可理解度的发音问题 + 基本语块；阶段 B（3–6 周，30 分钟/天）：句块、跟读、重音语调、任务输出；阶段 C（表现到位后，45–60 分钟/天）：即兴会话与模拟陈述。按表现而非周数晋级。',
      },
      {
        h: '每日练习模板',
        p: '发音热身 5–10 分钟 → 句块朗读录音 5–10 分钟 → Shadowing 10–15 分钟（必须有外部音频模型）→ 自由说 3–5 分钟录音 → 纠错笔记 5–10 分钟，记录 3 个错误与改进法。',
      },
      {
        h: '反馈闭环',
        p: '录 2 分钟任务 → 圈出 3 个最影响理解的问题 → 发音语法慢速分解重录，节奏语调跟可靠音频影子练习 3–5 次 → 保存新旧版本对比。',
      },
      {
        h: '自学五问清单',
        p: '① 是否按意思分块而非逐词？② 内容词重读、功能词弱读是否清晰？③ 最常见两个发音错是否改进（有记录）？④ 衔接词是否只在逻辑需要时使用？⑤ 语调是否匹配句子功能？',
      },
    ],
  },
];

/* 题库 */
export const QUIZ: QuizQuestion[] = [
  {
    type: 'single',
    chapter: 'ch1',
    q: '“迟了，我得走了。”下面哪一句犯了逗号拼接（comma splice）错误？',
    opts: ['It is late, so I must leave.', 'It is late, I must leave.', 'It is late; I must leave.'],
    ans: 1,
    why: '两个完整句只用逗号相连是逗号拼接；加 so、改分号或拆成两句都正确。',
  },
  {
    type: 'single',
    chapter: 'ch1',
    q: '长句 “As we lived near the road, we often had the traveler or stranger visit us to taste our gooseberry wine, for which we had great reputation.” 的主干是？',
    opts: ['As we lived near the road', 'we often had the traveler or stranger visit us', 'for which we had great reputation'],
    ans: 1,
    why: 'as 从句是原因状语，for which 是非限定定语从句，主干在中间。',
  },
  {
    type: 'single',
    chapter: 'ch1',
    q: '“They were building a dam last winter.” 用进行体，说话人关注的是？',
    opts: ['水坝已经完工', '修建的过程', '水坝的数量'],
    ans: 1,
    why: '进行体呈现过程；They built a dam 才强调事件完成。',
  },
  {
    type: 'single',
    chapter: 'ch1',
    q: '“A wave of cigar smoke accompanied Ogilvie in.” 体现了英汉哪组差异？',
    opts: ['英语多被动，汉语多主动', '英语重物称，汉语重人称', '英语重前饰，汉语重后饰'],
    ans: 1,
    why: '主语是“烟雾”而非人，是典型的物称主语。',
  },
  {
    type: 'single',
    chapter: 'ch3',
    q: '“She writes a book.” 属于哪种句子骨架？',
    opts: ['SV（主谓）', 'SVO（主谓宾）', 'SVOC（主谓宾+宾补）'],
    ans: 1,
    why: 'writes 是及物动词，a book 是宾语。',
  },
  {
    type: 'single',
    chapter: 'ch3',
    q: '“the man sleeping in the room” 中，sleeping in the room 为什么后置？',
    opts: ['分词短语作定语，短语通常后置', '现在分词必须后置', '表示将来的动作'],
    ans: 0,
    why: '单个分词可前置（a crying baby），分词短语作定语通常后置。',
  },
  {
    type: 'single',
    chapter: 'ch3',
    q: '空格填词：____ the bad weather, the match went on as planned.（让步，后接名词短语）',
    opts: ['Although', 'Because', 'Despite'],
    ans: 2,
    why: 'despite/in spite of 后接名词或 -ing；although 后接完整句子。',
  },
  {
    type: 'single',
    chapter: 'ch3',
    q: '“It surprised everyone that he passed the exam without any preparation.” 用了哪条原则？',
    opts: ['尾重原则：It 作形式主语', '信息焦点前置', '被动语态调整焦点'],
    ans: 0,
    why: 'that 从句太长，用 It 占位把长内容放到句尾。',
  },
  {
    type: 'match',
    chapter: 'ch5',
    q: '把 -ed 结尾与发音配对',
    pairs: [
      { left: 'worked', right: '/t/' },
      { left: 'played', right: '/d/' },
      { left: 'wanted', right: '/ɪd/' },
    ],
    why: '清辅音后读 /t/，浊辅音和元音后读 /d/，/t/ /d/ 之后读 /ɪd/。',
  },
  {
    type: 'listen',
    chapter: 'ch5',
    q: '听发音，选出你听到的单词（注意 /θ/ 与 /s/ 的区别）',
    opts: ['think', 'sink'],
    ans: 0,
    speak: 'think',
    why: 'think 以咬舌音 /θ/ 开头，sink 是 /s/。',
  },
  {
    type: 'listen',
    chapter: 'ch5',
    q: '听发音，选出你听到的单词（注意 /r/ 与 /l/）',
    opts: ['rice', 'lice'],
    ans: 0,
    speak: 'rice',
    why: '/r/ 发音时舌头不接触上齿龈，/l/ 舌尖要接触。',
  },
  {
    type: 'listen',
    chapter: 'ch5',
    q: '听发音，选出你听到的单词（注意 /v/ 与 /w/）',
    opts: ['very', 'wary'],
    ans: 0,
    speak: 'very',
    why: '/v/ 上齿轻触下唇，/w/ 双唇收圆不触齿。',
  },
  {
    type: 'listen',
    chapter: 'ch5',
    q: '听发音，选出你听到的单词（注意 /ŋ/ 与 /n/）',
    opts: ['sing', 'sin'],
    ans: 0,
    speak: 'sing',
    why: 'sing /sɪŋ/ 是软腭鼻音，舌后部抬起；sin /sɪn/ 是齿龈鼻音。',
  },
  {
    type: 'single',
    chapter: 'ch5',
    q: '口语中想礼貌地请对方递盐，最得体的是？',
    opts: ['Pass the salt.', 'Please pass the salt.', 'Could you pass the salt, please?'],
    ans: 2,
    why: '情态动词 Could you 构成间接请求，比祈使句礼貌。',
  },
  {
    type: 'single',
    chapter: 'ch5',
    q: '没听清对方的话，下列哪个“修补句”用在请求重复？',
    opts: ['Let me think…', 'Sorry, could you say that again?', 'What I mean is…'],
    ans: 1,
    why: '请求重复用 could you say that again / Pardon；其余是拖延与自我改述。',
  },
  {
    type: 'order',
    chapter: 'ch6',
    q: '精听一段材料，正确的顺序是？',
    items: ['常速盲听，理解大意', '困难片段反复听并尝试转写', '对照原文定位问题', '再盲听，最后看原文查漏'],
    why: '先整体后局部：盲听 → 转写难点 → 原文定位 → 复听检验。',
  },
];

/* 口语话题卡 */
export const SPEAKING_TOPICS: SpeakingTopic[] = [
  { tag: '学术陈述 · semi-formal', mins: 90, task: '用 90 秒介绍你的研究兴趣：研究的问题是什么、为什么重要、你打算怎么做。', vocab: ['research question', 'contribution', 'preliminary', 'implication'], tips: '先给一句话总览，再展开两个要点，最后一句收尾。' },
  { tag: '电话预约 · formal', mins: 120, task: '打电话给牙医诊所预约：说明来意、询问可预约时间、确认预约。', vocab: ['appointment', 'available', 'morning / afternoon', 'confirm'], tips: 'Could I make an appointment…? / Is there anything available…?' },
  { tag: '街头问路 · informal', mins: 120, task: '向路人询问去最近地铁站的路，没听清时使用修补策略请求重复或慢速。', vocab: ['could you tell me', 'go straight', 'turn left / right', 'say that again'], tips: 'Excuse me, could you tell me the way to…?' },
  { tag: '雅思口语 Part 2', mins: 120, task: '描述一个你钦佩的人：是谁、怎么认识、他做过什么，并解释你为什么钦佩。', vocab: ['look up to', 'what impressed me most', 'dedication', 'role model'], tips: '用 who 引导定语从句补充信息；内容词给足重音。' },
  { tag: '两分钟即兴', mins: 120, task: '谈谈你工作或学习中最近的一个变化：它带来了什么影响，你如何应对。', vocab: ['recently', 'as a result', 'adapt to', 'in the long run'], tips: '第一句用 Well / So 自然开场，争取组织时间。' },
  { tag: '观点表达', mins: 90, task: '有人认为线上学习终将取代课堂。陈述你的立场并给出两条理由。', vocab: ['from my perspective', 'on the other hand', 'primarily', 'in conclusion'], tips: '立场先亮明，理由用 first / also 分层，结尾回扣立场。' },
];

export const CHECKLIST: string[] = [
  '我按意思把句子分成了自然句块，而不是逐词往外蹦',
  '内容词有重读，功能词有弱读',
  '我只在逻辑需要时使用衔接词，没有堆砌 well / so / actually',
  '语调匹配句子功能（疑问升调、陈述降调）',
  '卡壳时使用了修补策略并把对话继续推进',
];
