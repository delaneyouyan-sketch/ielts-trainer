import { useState } from 'react';
import type { ReactElement } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { QUIZ } from '@client/src/pages/trainer/content';
import type { QuizQuestion } from '@client/src/pages/trainer/content';
import {
  useRemoveMistake,
  useTrainerState,
} from '@client/src/pages/trainer/hooks/useTrainerState';
import {
  useDeleteRecording,
  useRecordings,
} from '@client/src/pages/trainer/hooks/useRecordings';
import { useToast } from '@client/src/pages/trainer/components/Toast';
import { getErrorMessage } from '@client/src/pages/trainer/lib/error';
import type { RecordingItem } from '@shared/api.interface';

const JournalPage = () => {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const isRecordings: boolean = tab === 'recordings';

  const {
    state,
    isLoading: stateLoading,
    isError: stateError,
  } = useTrainerState();
  const {
    recordings,
    isLoading: recordingsLoading,
    isError: recordingsError,
  } = useRecordings();
  const removeMistake = useRemoveMistake();
  const deleteRecording = useDeleteRecording();
  const [showToast, toastNode] = useToast();
  const ToastNode = toastNode;
  const [deletingId, setDeletingId] = useState<string>('');

  const mistakes: string[] = state.mistakes.filter((qtext: string) =>
    QUIZ.some((item: QuizQuestion) => item.q === qtext),
  );

  const handleRemoveMistake = (qtext: string) => {
    removeMistake.mutate(
      { question: qtext },
      {
        onError: (error: unknown) => {
          showToast(getErrorMessage(error, '操作失败，请重试'));
        },
      },
    );
  };

  const handleDeleteRecording = (id: string) => {
    setDeletingId(id);
    deleteRecording.mutate(id, {
      onError: (error: unknown) => {
        showToast(getErrorMessage(error, '操作失败，请重试'));
      },
      onSettled: () => {
        setDeletingId('');
      },
    });
  };

  const renderLoading = (): ReactElement => (
    <div className="empty-state">
      <div className="big">loading</div>
      <p>加载中…</p>
    </div>
  );

  const renderError = (): ReactElement => (
    <div className="empty-state">
      <div className="big">error</div>
      <p>数据加载失败，请稍后重试</p>
    </div>
  );

  const renderMistakes = (): ReactElement => {
    if (stateLoading) return renderLoading();
    if (stateError) return renderError();
    if (mistakes.length === 0) {
      return (
        <div className="empty-state">
          <div className="big">no mistakes yet</div>
          <p>练习中答错的题会自动收录在这里，方便定点消灭。</p>
        </div>
      );
    }
    return (
      <div>
        <div className="mistake-list">
          {mistakes.map((qtext: string) => {
            const question: QuizQuestion | undefined = QUIZ.find(
              (item: QuizQuestion) => item.q === qtext,
            );
            if (!question) return null;
            return (
              <div className="mistake-item" key={qtext}>
                <div className="mistake-q">{qtext}</div>
                <div className="mistake-why">
                  <b>解析：</b>
                  {question.why}
                </div>
                <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
                  <button
                    className="btn btn-ghost"
                    type="button"
                    style={{ padding: '6px 14px', fontSize: 13 }}
                    onClick={() => handleRemoveMistake(qtext)}
                  >
                    移除
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 22 }}>
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => navigate('/mistake-quiz')}
          >
            用错题组一套重练 →
          </button>
        </div>
      </div>
    );
  };

  const renderRecordings = (): ReactElement => {
    if (recordingsLoading) return renderLoading();
    if (recordingsError) return renderError();
    if (recordings.length === 0) {
      return (
        <div className="empty-state">
          <div className="big">press record</div>
          <p>在口语训练舱录下的每一版都会保存在这里，用于新旧版本前后对比。</p>
          <div style={{ marginTop: 18 }}>
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => navigate('/booth')}
            >
              去录第一条
            </button>
          </div>
        </div>
      );
    }
    return (
      <div className="record-list">
        {recordings.map((r: RecordingItem) => (
          <div className="record-item" key={r.id}>
            <div className="record-meta">
              <div className="tag">
                {r.tag} · {r.duration}s
              </div>
              <div className="task">{r.task}</div>
              <div className="date">
                {new Date(r.createdAt).toLocaleString('zh-CN', {
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
              {r.checks.length > 0 && (
                <div
                  style={{
                    marginTop: 6,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 6,
                  }}
                >
                  {r.checks.map((c: string, k: number) => (
                    <span
                      key={k}
                      className="vocab-chip"
                      style={{
                        background: 'var(--green-soft)',
                        borderColor: '#c4d6cb',
                      }}
                    >
                      ✓ {c.slice(0, 14)}…
                    </span>
                  ))}
                </div>
              )}
            </div>
            <button
              className="record-del"
              type="button"
              disabled={deletingId === r.id}
              onClick={() => handleDeleteRecording(r.id)}
            >
              删除
            </button>
            <audio src={r.audioUrl} controls />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="view-enter">
      <div className="learn-head">
        <button
          className="back-link"
          type="button"
          onClick={() => navigate('/')}
        >
          ← 返回首页
        </button>
      </div>
      <div className="section-head" style={{ marginTop: 6 }}>
        <h2>{isRecordings ? '录音档案' : '错题本'}</h2>
        <span>{isRecordings ? 'recordings' : 'error log'}</span>
        <i className="line"></i>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <NavLink
          to="/journal/mistakes"
          className={`btn ${isRecordings ? 'btn-ghost' : 'btn-primary'}`}
        >
          错题本（{state.mistakes.length}）
        </NavLink>
        <NavLink
          to="/journal/recordings"
          className={`btn ${isRecordings ? 'btn-primary' : 'btn-ghost'}`}
        >
          录音档案（{recordings.length}）
        </NavLink>
      </div>

      {isRecordings ? renderRecordings() : renderMistakes()}

      <ToastNode />
    </div>
  );
};

export default JournalPage;
