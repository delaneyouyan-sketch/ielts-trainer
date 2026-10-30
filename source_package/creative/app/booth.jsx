/* 口语录音舱：话题卡 → 计时录音 → 回听 → 五问自评 */

function Booth({ go }) {
  const [topic, setTopic] = useState(null);
  if (topic) return <Stage topic={topic} onBack={() => setTopic(null)} go={go} />;
  return (
    <div className="view-enter">
      <div className="learn-head"><button className="back-link" onClick={() => go("home")}>← 返回首页</button></div>
      <section className="booth-intro">
        <h2>口语训练舱 · Speaking Booth</h2>
        <p>选一张话题卡，准备 30 秒后限时录音；录完立刻回听，对照五问清单自评。记住书里的闭环：录音 → 回听 → 定位三个问题 → 重练 → 重录，保存好新旧版本做对比。</p>
      </section>
      <div className="topic-grid">
        {SPEAKING_TOPICS.map((t, i) => (
          <button key={i} className="topic-card" onClick={() => setTopic(t)}>
            <div className="topic-meta">
              <span className="topic-tag">{t.tag}</span>
              <span className="topic-time">{t.mins}s</span>
            </div>
            <div className="topic-task">{t.task}</div>
            <div style={{ fontSize: 13, color: "var(--green)", fontWeight: 600 }}>开始这一题 →</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Stage({ topic, onBack, go }) {
  const [state, setState] = useState("idle"); // idle | recording | done
  const [seconds, setSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [checks, setChecks] = useState({});
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const limit = topic.mins;

  const cleanup = () => {
    clearInterval(timerRef.current);
    if (mediaRef.current) {
      mediaRef.current.getTracks().forEach(t => t.stop());
      mediaRef.current = null;
    }
  };
  useEffect(() => cleanup, []);

  const start = async () => {
    setErr("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      mediaRef.current.ondataavailable = e => e.data.size && chunksRef.current.push(e.data);
      mediaRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
      };
      mediaRef.current.start();
      setSeconds(0);
      setState("recording");
      timerRef.current = setInterval(() => {
        setSeconds(s => {
          if (s + 1 >= limit) { setTimeout(stopRec, 0); return limit; }
          return s + 1;
        });
      }, 1000);
    } catch (e) {
      setErr("无法使用麦克风：请在浏览器地址栏允许麦克风权限后重试。没有麦克风也可以先看着题目口头练习。");
    }
  };

  const stopRec = () => {
    clearInterval(timerRef.current);
    const rec = mediaRef.current;
    if (rec) {
      if (rec.state !== "inactive") rec.stop();
      rec.stream?.getTracks().forEach(t => t.stop());
    }
    mediaRef.current = null;
    setState("done");
  };

  const reset = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setSeconds(0);
    setChecks({});
    setSaved(false);
    setState("idle");
  };

  const saveRecording = () => {
    const blobUrl = audioUrl;
    // 以 data URL 持久化（录音较短）
    fetch(blobUrl).then(r => r.blob()).then(blob => {
      const reader = new FileReader();
      reader.onload = () => {
        const rec = {
          id: Date.now(),
          tag: topic.tag,
          task: topic.task,
          date: new Date().toISOString(),
          duration: seconds,
          checks: CHECKLIST.filter((_, k) => checks[k]),
          audio: reader.result
        };
        const raw = localStorage.getItem(STORE_KEY);
        const s = raw ? JSON.parse(raw) : {};
        const recordings = [rec, ...(s.recordings || [])].slice(0, 30);
        localStorage.setItem(STORE_KEY, JSON.stringify({ ...s, recordings }));
        setSaved(true);
      };
      reader.readAsDataURL(blob);
    });
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="view-enter">
      <div className="learn-head"><button className="back-link" onClick={onBack}>← 换一张话题卡</button></div>
      <div className="stage">
        <div className="stage-tag">{topic.tag} · 限时 {limit} 秒</div>
        <div className="stage-task">{topic.task}</div>
        <div className="stage-vocab">
          {topic.vocab.map((v, i) => (
            <span className="vocab-chip" key={i}>{v}<SpeakBtn text={v} rate={0.9} /></span>
          ))}
        </div>
        <div className="stage-tip"><b>提示</b>　{topic.tips}</div>

        <div className="recorder">
          <div className={"timer" + (state === "recording" ? " live" : "")}>{mm}:{ss}</div>
          {state !== "recording" ? (
            <button className="rec-btn" onClick={start} title="开始录音">
              <svg viewBox="0 0 24 24" fill="currentColor"><rect x="9" y="3" width="6" height="12" rx="3"></rect><path d="M5 11a7 7 0 0 0 14 0M12 18v3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"></path></svg>
            </button>
          ) : (
            <button className="rec-btn recording" onClick={stopRec} title="停止">
              <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"></rect></svg>
            </button>
          )}
          <div className="rec-state">
            {state === "idle" && "点击红点开始录音（建议先默念一遍要点）"}
            {state === "recording" && "正在录音… 再点一次结束"}
            {state === "done" && "录音完成，戴上耳机回听一遍"}
          </div>
          {err && <div style={{ color: "var(--red)", fontSize: 13, maxWidth: 420, textAlign: "center" }}>{err}</div>}
          {state === "done" && audioUrl && (
            <div className="audio-review"><audio src={audioUrl} controls></audio></div>
          )}
        </div>

        {state === "done" && (
          <div className="self-check">
            <h4>✎ 回听自评（勾出这一版做到的）</h4>
            {CHECKLIST.map((c, k) => (
              <div key={k} className={"check-item" + (checks[k] ? " checked" : "")}
                onClick={() => setChecks({ ...checks, [k]: !checks[k] })}>
                <span className="check-box">✓</span>
                <span>{c}</span>
              </div>
            ))}
            <div className="stage-actions">
              <button className="btn btn-ghost" onClick={reset}>重录一版</button>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-red" onClick={saveRecording} disabled={saved}>
                  {saved ? "✓ 已存入录音档案" : "保存这一版"}
                </button>
                <button className="btn btn-primary" onClick={() => go("journal", "recordings")}>去档案对比 →</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============ 错题本 & 录音档案 ============ */
function Journal({ store, update, go, tab, setTab }) {
  const removeMistake = (qtext) => update(s => ({ ...s, mistakes: (s.mistakes || []).filter(q => q !== qtext) }));
  const removeRec = (id) => update(s => ({ ...s, recordings: (s.recordings || []).filter(r => r.id !== id) }));

  return (
    <div className="view-enter">
      <div className="learn-head"><button className="back-link" onClick={() => go("home")}>← 返回首页</button></div>
      <div className="section-head" style={{ marginTop: 6 }}>
        <h2>{tab === "mistakes" ? "错题本" : "录音档案"}</h2>
        <span>{tab === "mistakes" ? "error log" : "recordings"}</span><i className="line"></i>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button className={"btn " + (tab === "mistakes" ? "btn-primary" : "btn-ghost")} onClick={() => setTab("mistakes")}>
          错题本（{store.mistakes?.length || 0}）
        </button>
        <button className={"btn " + (tab === "recordings" ? "btn-primary" : "btn-ghost")} onClick={() => setTab("recordings")}>
          录音档案（{store.recordings?.length || 0}）
        </button>
      </div>

      {tab === "mistakes" ? (
        store.mistakes?.length ? (
          <div>
            <div className="mistake-list">
              {store.mistakes.map((qtext, i) => {
                const q = QUIZ.find(x => x.q === qtext);
                if (!q) return null;
                return (
                  <div className="mistake-item" key={i}>
                    <div className="mistake-q">{qtext}</div>
                    <div className="mistake-why"><b>解析：</b>{q.why}</div>
                    <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
                      <button className="btn btn-ghost" style={{ padding: "6px 14px", fontSize: 13 }}
                        onClick={() => removeMistake(qtext)}>移除</button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 22 }}>
              <button className="btn btn-primary" onClick={() => go("mistakeQuiz")}>用错题组一套重练 →</button>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="big">no mistakes yet</div>
            <p>练习中答错的题会自动收录在这里，方便定点消灭。</p>
          </div>
        )
      ) : (
        store.recordings?.length ? (
          <div className="record-list">
            {store.recordings.map(r => (
              <div className="record-item" key={r.id}>
                <div className="record-meta">
                  <div className="tag">{r.tag} · {r.duration}s</div>
                  <div className="task">{r.task}</div>
                  <div className="date">{new Date(r.date).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}</div>
                  {r.checks?.length > 0 && (
                    <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {r.checks.map((c, k) => <span key={k} className="vocab-chip" style={{ background: "var(--green-soft)", borderColor: "#c4d6cb" }}>✓ {c.slice(0, 14)}…</span>)}
                    </div>
                  )}
                </div>
                <button className="record-del" onClick={() => removeRec(r.id)}>删除</button>
                <audio src={r.audio} controls></audio>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="big">press record</div>
            <p>在口语训练舱录下的每一版都会保存在这里，用于新旧版本前后对比。</p>
            <div style={{ marginTop: 18 }}><button className="btn btn-primary" onClick={() => go("booth")}>去录第一条</button></div>
          </div>
        )
      )}
    </div>
  );
}

Object.assign(window, { Booth, Journal });
