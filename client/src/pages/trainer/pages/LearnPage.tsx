import { useNavigate, useParams } from 'react-router-dom';
import { CHAPTERS } from '../content';
import type { Chapter, Lesson, LessonExample } from '../content';
import { useToggleLesson, useTrainerState } from '../hooks/useTrainerState';
import SpeakButton from '../components/SpeakButton';
import { useToast } from '../components/Toast';
import { getErrorMessage } from '../lib/error';

const LearnPage = () => {
  const { chapterId } = useParams<{ chapterId?: string }>();
  const navigate = useNavigate();
  const { state, isLoading, isError } = useTrainerState();
  const toggle = useToggleLesson();
  const [showToast, toastNode] = useToast();
  const ToastNode = toastNode;

  const foundIndex: number = CHAPTERS.findIndex(
    (c: Chapter) => c.id === (chapterId ?? CHAPTERS[0].id),
  );
  const idx: number = foundIndex < 0 ? 0 : foundIndex;
  const ch: Chapter = CHAPTERS[idx];

  const handleToggle = (lessonKey: string, done: boolean) => {
    const markingDone = !done;
    toggle.mutate(
      { lessonKey, done: markingDone },
      {
        onSuccess: (data) => {
          if (markingDone) {
            showToast(
              data.checkedToday
                ? '已掌握一节，今日打卡 +1'
                : '已标记为掌握',
            );
          }
        },
        onError: (error: unknown) => {
          showToast(getErrorMessage(error, '操作失败，请重试'));
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="view-enter">
        <div className="empty-state">
          <div className="big">loading</div>
          <p>加载中…</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="view-enter">
        <div className="empty-state">
          <div className="big">error</div>
          <p>数据加载失败，请稍后重试</p>
        </div>
      </div>
    );
  }

  return (
    <div className="view-enter">
      <div className="learn-head">
        <button className="back-link" type="button" onClick={() => navigate('/')}>
          ← 返回首页
        </button>
      </div>
      <div className="learn-head" style={{ marginTop: -8 }}>
        <span
          style={{
            fontFamily: 'var(--font-en)',
            fontStyle: 'italic',
            color: 'var(--gold)',
            fontSize: 17,
          }}
        >
          Chapter {ch.no}
        </span>
        <h1>
          {ch.title} · {ch.sub}
        </h1>
      </div>
      <div className="learn-goal">{ch.goal}</div>

      {ch.lessons.map((l: Lesson, i: number) => {
        const key: string = `${ch.id}-${l.h}`;
        const done: boolean = Boolean(state.doneLessons[key]);
        return (
          <article key={i} className={`lesson${done ? ' done' : ''}`}>
            <div className="lesson-top">
              <span className="lesson-check">✓</span>
              <div style={{ flex: 1 }}>
                <h3>{l.h}</h3>
                <p>{l.p}</p>

                {l.bad ? (
                  <div className="correct-block">
                    <div className="cb-label">✎ 红笔批改</div>
                    <span className="cb-bad">{l.bad}</span>
                    <span className="cb-note">✗ {l.badNote}</span>
                    <div className="cb-goods">
                      {(l.goods ?? []).map((g: string, k: number) => (
                        <div className="cb-good" key={k}>
                          <span>{g}</span>
                          <SpeakButton text={g} />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {l.ex ? (
                  <div className="ex-list">
                    {l.ex.map((e: LessonExample, k: number) => (
                      <div className="ex-item" key={k}>
                        <div className="ex-zh">{e.zh}</div>
                        <div className="ex-en">
                          <span>{e.en}</span>
                          <SpeakButton text={e.en} />
                          {e.mark ? <span className="ex-mark">{e.mark}</span> : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="lesson-foot">
                  <button
                    className="mark-done"
                    type="button"
                    disabled={toggle.isPending}
                    onClick={() => handleToggle(key, done)}
                  >
                    {done ? '✓ 已掌握（点击取消）' : '标记为已掌握'}
                  </button>
                </div>
              </div>
            </div>
          </article>
        );
      })}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 26,
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <button
          className="btn btn-ghost"
          type="button"
          disabled={idx === 0}
          onClick={() => navigate(`/learn/${CHAPTERS[idx - 1].id}`)}
        >
          ← 上一章
        </button>
        {idx < CHAPTERS.length - 1 ? (
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => navigate(`/learn/${CHAPTERS[idx + 1].id}`)}
          >
            下一章 →
          </button>
        ) : (
          <button className="btn btn-primary" type="button" onClick={() => navigate('/quiz')}>
            去做练习 →
          </button>
        )}
      </div>

      <ToastNode />
    </div>
  );
};

export default LearnPage;
