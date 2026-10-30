/* 练习模块：单选 / 听辨 / 配对 / 排序 */

function QuizView({ store, update, go, onlyMistakes, onExitMistakes }) {
  const bank = useMemo(() => {
    if (onlyMistakes && store.mistakes?.length) {
      return QUIZ.filter(q => store.mistakes.includes(q.q));
    }
    return QUIZ;
  }, [onlyMistakes, store.mistakes]);

  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [wrongQs, setWrongQs] = useState([]);

  const q = bank[i];

  useEffect(() => {
    if (q && q.type === "listen") setTimeout(() => speak(q.speak, 0.85), 400);
  }, [i]);

  if (!bank.length) {
    return (
      <div className="view-enter">
        <div className="learn-head"><button className="back-link" onClick={onExitMistakes || (() => go("home"))}>← 返回</button></div>
        <div className="empty-state">
          <div className="big">all clear</div>
          <p>错题本是空的——去综合练习里接受检验吧。</p>
          <div style={{ marginTop: 20 }}><button className="btn btn-primary" onClick={onExitMistakes || (() => go("home"))}>好的</button></div>
        </div>
      </div>
    );
  }

  if (finished) {
    const pct = Math.round(score / bank.length * 100);
    const msg = pct === 100 ? "满分，全部拿下" : pct >= 70 ? "不错，再消灭错题就更稳了" : "回到课程里复习相关小节，再来一次";
    const save = () => update(s => {
      const mistakes = new Set(s.mistakes || []);
      wrongQs.forEach(w => mistakes.add(w));
      return {
        ...s,
        mistakes: [...mistakes],
        bestScore: onlyMistakes ? s.bestScore : Math.max(s.bestScore || 0, pct),
        quizDone: onlyMistakes ? s.quizDone : true
      };
    });
    return (
      <div className="view-enter quiz-card result-card">
        <div className="result-score">{pct}<small>分</small></div>
        <div className="result-msg">{msg}</div>
        <div className="result-sub">答对 {score} / {bank.length} 题{wrongQs.length ? `，${wrongQs.length} 题已收入错题本` : ""}</div>
        <div className="result-actions">
          <button className="btn btn-ghost" onClick={() => { save(); setI(0); setPicked(null); setScore(0); setWrongQs([]); setFinished(false); }}>再做一遍</button>
          <button className="btn btn-primary" onClick={() => { save(); onExitMistakes ? onExitMistakes() : go("home"); }}>完成并返回</button>
        </div>
      </div>
    );
  }

  const chapter = CHAPTERS.find(c => c.id === q.chapter);

  const answer = (correct, qtext) => {
    if (picked !== null) return;
    setPicked(correct ? "ok" : "no");
    if (correct) setScore(v => v + 1);
    else setWrongQs(arr => [...arr, qtext]);
  };

  const next = () => {
    if (i + 1 >= bank.length) setFinished(true);
    else { setI(i + 1); setPicked(null); }
  };

  return (
    <div className="view-enter">
      <div className="learn-head">
        <button className="back-link" onClick={onExitMistakes || (() => go("home"))}>← {onlyMistakes ? "返回错题本" : "返回首页"}</button>
      </div>
      <div className="quiz-card">
        <div className="quiz-top">
          <span className="quiz-tag">Chapter {chapter.no} · {chapter.title}</span>
          <span>{i + 1} / {bank.length}</span>
        </div>
        <div className="quiz-q">
          {q.q}
          {q.type === "listen" && (
            <button className="big-play" onClick={() => speak(q.speak, 0.85)} title="再听一遍">
              <SpeakerIcon />
            </button>
          )}
        </div>

        {q.type === "single" || q.type === "listen" ? (
          <div className="opts">
            {q.opts.map((o, k) => {
              let cls = "opt";
              if (picked) {
                if (k === q.ans) cls += " correct";
                else if (k === picked) cls += " wrong";
              }
              const isEn = /[a-zA-Z/'ðθəɪʊ]/.test(o) && o.length < 40;
              return (
                <button key={k} className={cls} disabled={picked !== null}
                  onClick={() => answer(k === q.ans, q.q)}>
                  <span className="key">{String.fromCharCode(65 + k)}</span>
                  <span className={isEn ? "en" : ""}>{o}</span>
                </button>
              );
            })}
          </div>
        ) : q.type === "match" ? (
          <MatchQ q={q} picked={picked} onResult={(ok) => answer(ok, q.q)} />
        ) : q.type === "order" ? (
          <OrderQ q={q} picked={picked} onResult={(ok) => answer(ok, q.q)} />
        ) : null}

        {picked && (
          <div className={"quiz-explain " + picked}>
            <span className="tag">{picked === "ok" ? "✓ 正确" : "✗ 再想想"}</span>
            <span>{q.why}</span>
          </div>
        )}

        <div className="quiz-actions">
          <span className="quiz-progress">当前得分 {score}</span>
          <button className="btn btn-primary" disabled={picked === null} onClick={next}>
            {i + 1 >= bank.length ? "查看结果" : "下一题 →"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* 配对题 */
function MatchQ({ q, picked, onResult }) {
  const [selLeft, setSelLeft] = useState(null);
  const [matched, setMatched] = useState([]);
  const [shake, setShake] = useState(null);
  const rights = useRef([...q.pairs].sort(() => Math.random() - 0.5)).current;
  const lefts = useRef([...q.pairs].sort(() => Math.random() - 0.5)).current;

  const click = (side, item) => {
    if (picked || matched.includes(item.left)) return;
    if (side === "L") { setSelLeft(item); return; }
    if (!selLeft) return;
    if (selLeft.left === item.left) {
      const m = [...matched, selLeft.left];
      setMatched(m);
      setSelLeft(null);
      if (m.length === q.pairs.length) setTimeout(() => onResult(true), 250);
    } else {
      setShake(item.left);
      setTimeout(() => setShake(null), 450);
      onResult(false, q.q);
    }
  };

  return (
    <div className="match-board">
      <div className="match-col">
        {lefts.map(it => (
          <button key={it.left}
            className={"match-item " + (matched.includes(it.left) ? "matched" : selLeft?.left === it.left ? "selected" : "")}
            onClick={() => click("L", it)}>{it.left}</button>
        ))}
      </div>
      <div className="match-col">
        {rights.map(it => (
          <button key={it.right}
            className={"match-item " + (matched.includes(it.left) ? "matched" : shake === it.left ? "shake" : "")}
            onClick={() => click("R", it)}>{it.right}</button>
        ))}
      </div>
    </div>
  );
}

/* 排序题 */
function OrderQ({ q, picked, onResult }) {
  const correct = q.items;
  const [pool, setPool] = useState(() => [...q.items].map((t, n) => ({ t, n })).sort(() => Math.random() - 0.5));
  const [built, setBuilt] = useState([]);

  const addChip = (chip) => {
    if (picked) return;
    const b = [...built, chip];
    setBuilt(b);
    setPool(pool.filter(c => c.n !== chip.n));
    if (b.length === correct.length) {
      const ok = b.every((c, k) => c.t === correct[k]);
      setTimeout(() => onResult(ok, q.q), 200);
    }
  };
  const removeChip = (chip) => {
    if (picked) return;
    setBuilt(built.filter(c => c.n !== chip.n));
    setPool([...pool, chip]);
  };

  return (
    <div>
      <div className="order-hint">按正确顺序点击下列步骤：</div>
      <div className="order-built">
        {built.length === 0 && <span style={{ color: "var(--ink-faint)", fontSize: 13.5, alignSelf: "center" }}>依次点击下方步骤…</span>}
        {built.map(c => <button key={c.n} className="order-chip" onClick={() => removeChip(c)}>{c.t}</button>)}
      </div>
      <div className="order-pool">
        {pool.map(c => <button key={c.n} className="order-chip" onClick={() => addChip(c)}>{c.t}</button>)}
      </div>
    </div>
  );
}

Object.assign(window, { QuizView });
