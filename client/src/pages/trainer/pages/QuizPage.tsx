import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Volume2 } from 'lucide-react';
import { CHAPTERS, QUIZ } from '../content';
import type { Chapter, QuizQuestion } from '../content';
import { useSubmitQuiz, useTrainerState } from '../hooks/useTrainerState';
import { speak } from '../lib/speak';
import { getErrorMessage } from '../lib/error';
import { useToast } from '../components/Toast';
import MatchQuestion from './quiz/MatchQuestion';
import OrderQuestion from './quiz/OrderQuestion';

type PickedState = 'ok' | 'no' | null;

const QuizPage: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const onlyMistakes: boolean = pathname === '/mistake-quiz';
  const exitTo: string = onlyMistakes ? '/journal' : '/';

  const { state, isLoading } = useTrainerState();
  const submitQuiz = useSubmitQuiz();
  const [showToast, toastNode] = useToast();

  const mistakeList: string[] = state.mistakes;

  const bank: QuizQuestion[] = useMemo(() => {
    if (!onlyMistakes) return QUIZ;
    return QUIZ.filter((item: QuizQuestion) => mistakeList.includes(item.q));
  }, [onlyMistakes, mistakeList]);

  const [i, setI] = useState<number>(0);
  const [picked, setPicked] = useState<PickedState>(null);
  const [pickedIndex, setPickedIndex] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [finished, setFinished] = useState<boolean>(false);
  const [wrongQs, setWrongQs] = useState<string[]>([]);

  const q: QuizQuestion | undefined = bank[i];

  useEffect(() => {
    if (finished) return;
    const current: QuizQuestion | undefined = bank[i];
    if (!current || current.type !== 'listen') return;
    const speech: string | undefined = current.speak;
    if (!speech) return;
    const timer = setTimeout(() => speak(speech, 0.85), 400);
    return () => clearTimeout(timer);
  }, [i, finished, bank]);

  const answer = (correct: boolean, qtext: string, optionIndex: number | null): void => {
    if (picked !== null) return;
    setPicked(correct ? 'ok' : 'no');
    if (correct) setScore((v: number) => v + 1);
    else setWrongQs((arr: string[]) => [...arr, qtext]);
    setPickedIndex(optionIndex);
  };

  const next = (): void => {
    if (i + 1 >= bank.length) setFinished(true);
    else {
      setI(i + 1);
      setPicked(null);
      setPickedIndex(null);
    }
  };

  const resetQuiz = (): void => {
    setI(0);
    setPicked(null);
    setPickedIndex(null);
    setScore(0);
    setWrongQs([]);
    setFinished(false);
  };

  if (isLoading && onlyMistakes) {
    return <div className="view-enter" />;
  }

  if (!bank.length) {
    return (
      <>
        {toastNode()}
        <div className="view-enter">
          <div className="learn-head">
            <button type="button" className="back-link" onClick={() => navigate(exitTo)}>
              ← 返回
            </button>
          </div>
          <div className="empty-state">
            <div className="big">all clear</div>
            <p>错题本是空的——去综合练习里接受检验吧。</p>
            <div style={{ marginTop: 20 }}>
              <button type="button" className="btn btn-primary" onClick={() => navigate(exitTo)}>
                好的
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const submitThen = async (after: () => void): Promise<void> => {
    const scorePercent: number = Math.round((score / bank.length) * 100);
    try {
      await submitQuiz.mutateAsync({
        wrongQuestions: wrongQs,
        scorePercent,
        onlyMistakes,
      });
      after();
    } catch (error: unknown) {
      showToast(getErrorMessage(error, '成绩提交失败，请重试'));
    }
  };

  if (finished) {
    const pct: number = Math.round((score / bank.length) * 100);
    const msg: string =
      pct === 100
        ? '满分，全部拿下'
        : pct >= 70
          ? '不错，再消灭错题就更稳了'
          : '回到课程里复习相关小节，再来一次';

    return (
      <>
        {toastNode()}
        <div className="view-enter quiz-card result-card">
          <div className="result-score">
            {pct}
            <small>分</small>
          </div>
          <div className="result-msg">{msg}</div>
          <div className="result-sub">
            答对 {score} / {bank.length} 题
            {wrongQs.length ? `，${wrongQs.length} 题已收入错题本` : ''}
          </div>
          <div className="result-actions">
            <button
              type="button"
              className="btn btn-ghost"
              disabled={submitQuiz.isPending}
              onClick={() => {
                void submitThen(resetQuiz);
              }}
            >
              再做一遍
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={submitQuiz.isPending}
              onClick={() => {
                void submitThen(() => navigate(exitTo));
              }}
            >
              完成并返回
            </button>
          </div>
        </div>
      </>
    );
  }

  if (!q) {
    return <div className="view-enter" />;
  }

  const chapter: Chapter | undefined = CHAPTERS.find((c: Chapter) => c.id === q.chapter);
  const chapterLabel: string = chapter ? `Chapter ${chapter.no} · ${chapter.title}` : q.chapter;
  const opts: string[] = q.opts ?? [];
  const ansIndex: number = q.ans ?? -1;

  return (
    <>
      {toastNode()}
      <div className="view-enter">
        <div className="learn-head">
          <button type="button" className="back-link" onClick={() => navigate(exitTo)}>
            ← {onlyMistakes ? '返回错题本' : '返回首页'}
          </button>
        </div>
        <div className="quiz-card">
          <div className="quiz-top">
            <span className="quiz-tag">{chapterLabel}</span>
            <span>
              {i + 1} / {bank.length}
            </span>
          </div>
          <div className="quiz-q">
            {q.q}
            {q.type === 'listen' && (
              <button
                type="button"
                className="big-play"
                onClick={() => {
                  if (q.speak) speak(q.speak, 0.85);
                }}
                title="再听一遍"
                aria-label="再听一遍"
              >
                <Volume2 size={18} />
              </button>
            )}
          </div>

          {q.type === 'single' || q.type === 'listen' ? (
            <div className="opts">
              {opts.map((o: string, k: number) => {
                let cls = 'opt';
                if (picked !== null) {
                  if (k === ansIndex) cls += ' correct';
                  else if (k === pickedIndex) cls += ' wrong';
                }
                const isEn: boolean = /[a-zA-Z/'ðθəɪʊ]/.test(o) && o.length < 40;
                return (
                  <button
                    key={k}
                    type="button"
                    className={cls}
                    disabled={picked !== null}
                    onClick={() => answer(k === ansIndex, q.q, k)}
                  >
                    <span className="key">{String.fromCharCode(65 + k)}</span>
                    <span className={isEn ? 'en' : ''}>{o}</span>
                  </button>
                );
              })}
            </div>
          ) : q.type === 'match' ? (
            <MatchQuestion
              key={q.q}
              q={q}
              picked={picked}
              onResult={(ok: boolean) => answer(ok, q.q, null)}
            />
          ) : q.type === 'order' ? (
            <OrderQuestion
              key={q.q}
              q={q}
              picked={picked}
              onResult={(ok: boolean) => answer(ok, q.q, null)}
            />
          ) : null}

          {picked !== null && (
            <div className={'quiz-explain ' + picked}>
              <span className="tag">{picked === 'ok' ? '✓ 正确' : '✗ 再想想'}</span>
              <span>{q.why}</span>
            </div>
          )}

          <div className="quiz-actions">
            <span className="quiz-progress">当前得分 {score}</span>
            <button
              type="button"
              className="btn btn-primary"
              disabled={picked === null}
              onClick={next}
            >
              {i + 1 >= bank.length ? '查看结果' : '下一题 →'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuizPage;
