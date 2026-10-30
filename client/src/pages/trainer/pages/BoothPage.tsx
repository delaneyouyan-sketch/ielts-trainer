import { useNavigate, useParams } from 'react-router-dom';
import { SPEAKING_TOPICS } from '../content';
import type { SpeakingTopic } from '../content';
import TopicList from './booth/TopicList';
import StageView from './booth/StageView';

const BoothPage = () => {
  const { topicIndex } = useParams<{ topicIndex?: string }>();
  const navigate = useNavigate();

  const parsed: number = topicIndex === undefined ? Number.NaN : Number(topicIndex);
  const isValid: boolean =
    Number.isInteger(parsed) && parsed >= 0 && parsed < SPEAKING_TOPICS.length;
  const topic: SpeakingTopic | null = isValid ? SPEAKING_TOPICS[parsed] : null;

  if (topic) return <StageView topic={topic} />;

  return (
    <TopicList
      onPick={(index: number) => {
        navigate(`/booth/${index}`);
      }}
    />
  );
};

export default BoothPage;
