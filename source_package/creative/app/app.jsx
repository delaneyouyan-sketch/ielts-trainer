/* 英语自学训练站 主应用 */
const { useState, useEffect, useRef, useMemo } = React;

const STORE_KEY = "ielts-trainer-v1";

function loadStore() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) || {};
  } catch (e) { return {}; }
}
function saveStore(s) { localStorage.setItem(STORE_KEY, JSON.stringify(s)); }

function useStore() {
  const [store, setStore] = useState(loadStore);
  const update = (fn) => setStore(prev => {
    const next = fn(prev || {});
    saveStore(next);
    return next;
  });
  return [store || {}, update];
}

/* 英文朗读 */
function speak(text, rate = 0.92) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = rate;
  const en = window.speechSynthesis.getVoices().find(v => /en[-_](US|GB)/i.test(v.lang));
  if (en) u.voice = en;
  window.speechSynthesis.speak(u);
}

const SpeakerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
    <path d="M15.5 8.5a5 5 0 0 1 0 7"></path>
    <path d="M18.5 5.5a9 9 0 0 1 0 13"></path>
  </svg>
);
const SpeakBtn = ({ text, rate }) => (
  <button className="speak-btn" title="朗读" onClick={(e) => { e.stopPropagation(); speak(text, rate); }}>
    <SpeakerIcon />
  </button>
);

/* Toast */
function useToast() {
  const [msg, setMsg] = useState("");
  const timer = useRef(null);
  const show = (m) => {
    setMsg(m);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(""), 2200);
  };
  const node = msg ? <div className="toast show">{msg}</div> : <div className="toast">{msg}</div>;
  return [show, node];
}

/* ============ 仪表盘 ============ */
function Dashboard({ store, go }) {
  const totalLessons = CHAPTERS.reduce((n, c) => n + c.lessons.length, 0);
  const doneCount = Object.values(store.doneLessons || {}).filter(Boolean).length;
  const pct = Math.round(doneCount / totalLessons * 100);
  const bestScore = store.bestQuiz ? `${store.bestScore ?? 0}分` : "—";
  const recordings = (store.recordings || []).length;

  const today = new Date().toISOString().slice(0, 10);
  const checkedToday = (store.checkins || []).includes(today);

  return (
    <div className="view-enter">
      <section className="hero">
        <div className="hero-kicker">IELTS Self-Training · 一本通互动训练站</div>
        <h1>先理解语言<em> why </em>，再把语块练成<em> instinct </em></h1>
        <p>从英汉表达差异出发，经过语块积累、造句润色、口语专项，到录音回听的训练闭环。所有进度自动保存在本机。</p>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={() => go("learn", "ch1")}>继续学习 →</button>
          <button className="btn btn-ghost" onClick={() => go("booth")}>进入口语录音舱</button>
        </div>
      </section>

      <div className="stat-row">
        <div className="stat">
          <div className="stat-num">{doneCount}<small>/{totalLessons} 节</small></div>
          <div className="stat-label">已学小节</div>
          <div className="progress-bar"><i style={{ width: pct + "%" }}></i></div>
        </div>
        <div className="stat">
          <div className="stat-num">{(store.checkins || []).length}<small> 天</small></div>
          <div className="stat-label">累计打卡</div>
          <div className="progress-bar"><i style={{ width: Math.min((store.checkins || []).length / 21 * 100, 100) + "%" }}></i></div>
        </div>
        <div className="stat">
          <div className="stat-num">{bestScore}</div>
          <div className="stat-label">练习最佳成绩</div>
        </div>
        <div className="stat">
          <div className="stat-num">{recordings}<small> 条</small></div>
          <div className="stat-label">口语录音</div>
        </div>
      </div>

      <div className="section-head">
        <h2>六章学习路径</h2><span>six chapters</span><i className="line"></i>
      </div>
      <div className="ch-grid">
        {CHAPTERS.map(c => {
          const total = c.lessons.length;
          const done = c.lessons.filter(l => store.doneLessons?.[c.id + "-" + l.h]).length;
          return (
            <button key={c.id} className="ch-card" onClick={() => go("learn", c.id)}>
              <div className="ch-no">Chapter {c.no}</div>
              <h3>{c.title}</h3>
              <div className="sub">{c.sub}</div>
              <div className="ch-foot">
                <span className={"done-dot" + (done === total ? " full" : "")}></span>
                <span>{done}/{total}</span>
                <span className="mini-bar"><i style={{ width: done / total * 100 + "%" }}></i></span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="section-head">
        <h2>今日训练</h2><span>daily loop</span><i className="line"></i>
      </div>
      <div className="ch-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
        <button className="ch-card" onClick={() => go(store.mistakes?.length ? "mistakeQuiz" : "quiz")}>
          <div className="ch-no">Drill · 01</div>
          <h3>{store.mistakes?.length ? `错题重练（${store.mistakes.length}）` : "综合练习"}</h3>
          <div className="sub">{QUIZ.length} 题：选择、配对、听辨、排序，即时判分与讲解</div>
        </button>
        <button className="ch-card" onClick={() => go("booth")}>
          <div className="ch-no">Drill · 02</div>
          <h3>两分钟口语任务</h3>
          <div className="sub">抽话题卡 → 限时录音 → 回听 → 五问自评</div>
        </button>
        <button className="ch-card" onClick={() => go("journal")}>
          <div className="ch-no">Drill · 03</div>
          <h3>录音档案与错题本</h3>
          <div className="sub">回听历史版本做前后对比，针对错题定点重练</div>
        </button>
      </div>
    </div>
  );
}

/* ============ 学习页 ============ */
function Learn({ chapterId, store, update, go }) {
  const idx = Math.max(0, CHAPTERS.findIndex(c => c.id === chapterId));
  const ch = CHAPTERS[idx];

  const toggle = (key) => update(s => {
    const doneLessons = { ...(s.doneLessons || {}) };
    if (doneLessons[key]) delete doneLessons[key]; else doneLessons[key] = true;
    return { ...s, doneLessons };
  });

  return (
    <div className="view-enter">
      <div className="learn-head">
        <button className="back-link" onClick={() => go("home")}>← 返回首页</button>
      </div>
      <div className="learn-head" style={{ marginTop: -8 }}>
        <span style={{ fontFamily: "var(--font-en)", fontStyle: "italic", color: "var(--gold)", fontSize: 17 }}>Chapter {ch.no}</span>
        <h1>{ch.title} · {ch.sub}</h1>
      </div>
      <div className="learn-goal">{ch.goal}</div>

      {ch.lessons.map((l, i) => {
        const key = ch.id + "-" + l.h;
        const done = !!store.doneLessons?.[key];
        return (
          <article key={i} className={"lesson" + (done ? " done" : "")}>
            <div className="lesson-top">
              <span className="lesson-check">✓</span>
              <div style={{ flex: 1 }}>
                <h3>{l.h}</h3>
                <p>{l.p}</p>

                {l.bad && (
                  <div className="correct-block">
                    <div className="cb-label">✎ 红笔批改</div>
                    <span className="cb-bad">{l.bad}</span>
                    <span className="cb-note">✗ {l.badNote}</span>
                    <div className="cb-goods">
                      {l.goods.map((g, k) => (
                        <div className="cb-good" key={k}>
                          <span>{g}</span>
                          <SpeakBtn text={g} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {l.ex && (
                  <div className="ex-list">
                    {l.ex.map((e, k) => (
                      <div className="ex-item" key={k}>
                        <div className="ex-zh">{e.zh}</div>
                        <div className="ex-en">
                          <span>{e.en}</span>
                          <SpeakBtn text={e.en} />
                          {e.mark && <span className="ex-mark">{e.mark}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="lesson-foot">
                  <button className="mark-done" onClick={() => toggle(key)}>
                    {done ? "✓ 已掌握（点击取消）" : "标记为已掌握"}
                  </button>
                </div>
              </div>
            </div>
          </article>
        );
      })}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 26, gap: 12, flexWrap: "wrap" }}>
        <button className="btn btn-ghost" disabled={idx === 0}
          onClick={() => go("learn", CHAPTERS[idx - 1].id)}>← 上一章</button>
        {idx < CHAPTERS.length - 1
          ? <button className="btn btn-primary" onClick={() => go("learn", CHAPTERS[idx + 1].id)}>下一章 →</button>
          : <button className="btn btn-primary" onClick={() => go("quiz")}>去做练习 →</button>}
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard, Learn, speak, SpeakBtn, SpeakerIcon, useStore, useToast, STORE_KEY });
