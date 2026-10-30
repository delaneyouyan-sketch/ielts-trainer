import { useNavigate } from 'react-router-dom';
import { CHAPTERS, QUIZ } from '@client/src/pages/trainer/content';
import type { Chapter, Lesson } from '@client/src/pages/trainer/content';
import { useTrainerState } from '@client/src/pages/trainer/hooks/useTrainerState';
import { useRecordings } from '@client/src/pages/trainer/hooks/useRecordings';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, isLoading: isStateLoading, isError: isStateError } = useTrainerState();
  const {
    recordings,
    isLoading: isRecordingsLoading,
    isError: isRecordingsError,
  } = useRecordings();

  const isLoading: boolean = isStateLoading || isRecordingsLoading;
  const isError: boolean = isStateError || isRecordingsError;

  const totalLessons: number = CHAPTERS.reduce(
    (n: number, c: Chapter) => n + c.lessons.length,
    0,
  );
  const doneCount: number = Object.values(state.doneLessons).filter(Boolean).length;
  const pct: number = totalLessons === 0 ? 0 : Math.round((doneCount / totalLessons) * 100);
  const checkinCount: number = state.checkins.length;
  const checkinPct: number = Math.min((checkinCount / 21) * 100, 100);
  const bestScoreText: string = state.bestScore === null ? '—' : `${state.bestScore}分`;
  const recordingCount: number = recordings.length;
  const mistakeCount: number = state.mistakes.length;

  if (isLoading) {
    return <div className="view-enter">加载中…</div>;
  }

  if (isError) {
    return <div className="view-enter">数据加载失败，请稍后重试</div>;
  }

  return (
    <div className="view-enter">
      <section className="hero">
        <div className="hero-kicker">IELTS Self-Training · 一本通互动训练站</div>
        <h1>
          先理解语言<em> why </em>，再把语块练成<em> instinct </em>
        </h1>
        <p>
          从英汉表达差异出发，经过语块积累、造句润色、口语专项，到录音回听的训练闭环。所有进度自动保存在本机。
        </p>
        <div className="hero-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/learn/ch1')}
          >
            继续学习 →
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => navigate('/booth')}
          >
            进入口语录音舱
          </button>
        </div>
      </section>

      <div className="stat-row">
        <div className="stat">
          <div className="stat-num">
            {doneCount}
            <small>/{totalLessons} 节</small>
          </div>
          <div className="stat-label">已学小节</div>
          <div className="progress-bar">
            <i style={{ width: `${pct}%` }}></i>
          </div>
        </div>
        <div className="stat">
          <div className="stat-num">
            {checkinCount}
            <small> 天</small>
          </div>
          <div className="stat-label">累计打卡</div>
          <div className="progress-bar">
            <i style={{ width: `${checkinPct}%` }}></i>
          </div>
        </div>
        <div className="stat">
          <div className="stat-num">{bestScoreText}</div>
          <div className="stat-label">练习最佳成绩</div>
        </div>
        <div className="stat">
          <div className="stat-num">
            {recordingCount}
            <small> 条</small>
          </div>
          <div className="stat-label">口语录音</div>
        </div>
      </div>

      <div className="section-head">
        <h2>六章学习路径</h2>
        <span>six chapters</span>
        <i className="line"></i>
      </div>
      <div className="ch-grid">
        {CHAPTERS.map((c: Chapter) => {
          const total: number = c.lessons.length;
          const done: number = c.lessons.filter(
            (l: Lesson) => state.doneLessons[`${c.id}-${l.h}`] === true,
          ).length;
          const barPct: number = total === 0 ? 0 : (done / total) * 100;
          return (
            <button
              key={c.id}
              type="button"
              className="ch-card"
              onClick={() => navigate(`/learn/${c.id}`)}
            >
              <div className="ch-no">Chapter {c.no}</div>
              <h3>{c.title}</h3>
              <div className="sub">{c.sub}</div>
              <div className="ch-foot">
                <span className={'done-dot' + (done === total ? ' full' : '')}></span>
                <span>
                  {done}/{total}
                </span>
                <span className="mini-bar">
                  <i style={{ width: `${barPct}%` }}></i>
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="section-head">
        <h2>今日训练</h2>
        <span>daily loop</span>
        <i className="line"></i>
      </div>
      <div
        className="ch-grid"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
      >
        <button
          type="button"
          className="ch-card"
          onClick={() => navigate(mistakeCount > 0 ? '/mistake-quiz' : '/quiz')}
        >
          <div className="ch-no">Drill · 01</div>
          <h3>{mistakeCount > 0 ? `错题重练（${mistakeCount}）` : '综合练习'}</h3>
          <div className="sub">{QUIZ.length} 题：选择、配对、听辨、排序，即时判分与讲解</div>
        </button>
        <button type="button" className="ch-card" onClick={() => navigate('/booth')}>
          <div className="ch-no">Drill · 02</div>
          <h3>两分钟口语任务</h3>
          <div className="sub">抽话题卡 → 限时录音 → 回听 → 五问自评</div>
        </button>
        <button type="button" className="ch-card" onClick={() => navigate('/journal')}>
          <div className="ch-no">Drill · 03</div>
          <h3>录音档案与错题本</h3>
          <div className="sub">回听历史版本做前后对比，针对错题定点重练</div>
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;
