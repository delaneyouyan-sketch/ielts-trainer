import { useNavigate } from 'react-router-dom';
import { SPEAKING_TOPICS } from '../../content';
import type { SpeakingTopic } from '../../content';

interface TopicListProps {
  onPick: (index: number) => void;
}

const TopicList = ({ onPick }: TopicListProps) => {
  const navigate = useNavigate();

  return (
    <div className="view-enter">
      <div className="learn-head">
        <button className="back-link" type="button" onClick={() => navigate('/')}>
          ← 返回首页
        </button>
      </div>
      <section className="booth-intro">
        <h2>口语训练舱 · Speaking Booth</h2>
        <p>
          选一张话题卡，准备 30 秒后限时录音；录完立刻回听，对照五问清单自评。记住书里的闭环：录音 → 回听 → 定位三个问题 → 重练 → 重录，保存好新旧版本做对比。
        </p>
      </section>
      <div className="topic-grid">
        {SPEAKING_TOPICS.map((t: SpeakingTopic, i: number) => (
          <button
            key={i}
            className="topic-card"
            type="button"
            onClick={() => onPick(i)}
          >
            <div className="topic-meta">
              <span className="topic-tag">{t.tag}</span>
              <span className="topic-time">{t.mins}s</span>
            </div>
            <div className="topic-task">{t.task}</div>
            <div style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>
              开始这一题 →
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TopicList;
