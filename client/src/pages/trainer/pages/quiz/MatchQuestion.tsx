import { useRef, useState } from 'react';
import type { QuizMatchPair, QuizQuestion } from '../../content';

type PickedState = 'ok' | 'no' | null;

interface MatchQuestionProps {
  q: QuizQuestion;
  picked: PickedState;
  onResult: (ok: boolean) => void;
}

const shufflePairs = (list: QuizMatchPair[]): QuizMatchPair[] =>
  [...list].sort(() => Math.random() - 0.5);

const MatchQuestion: React.FC<MatchQuestionProps> = ({ q, picked, onResult }) => {
  const [selLeft, setSelLeft] = useState<QuizMatchPair | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [shake, setShake] = useState<string | null>(null);

  const pairs: QuizMatchPair[] = q.pairs ?? [];
  const leftsRef = useRef<QuizMatchPair[] | null>(null);
  const rightsRef = useRef<QuizMatchPair[] | null>(null);

  if (leftsRef.current === null) leftsRef.current = shufflePairs(pairs);
  if (rightsRef.current === null) rightsRef.current = shufflePairs(pairs);

  const lefts: QuizMatchPair[] = leftsRef.current;
  const rights: QuizMatchPair[] = rightsRef.current;

  const click = (side: 'L' | 'R', item: QuizMatchPair): void => {
    if (picked !== null || matched.includes(item.left)) return;
    if (side === 'L') {
      setSelLeft(item);
      return;
    }
    if (selLeft === null) return;
    if (selLeft.left === item.left) {
      const nextMatched: string[] = [...matched, selLeft.left];
      setMatched(nextMatched);
      setSelLeft(null);
      if (nextMatched.length === pairs.length) {
        setTimeout(() => onResult(true), 250);
      }
    } else {
      setShake(item.left);
      setTimeout(() => setShake(null), 450);
      onResult(false);
    }
  };

  return (
    <div className="match-board">
      <div className="match-col">
        {lefts.map((it: QuizMatchPair) => (
          <button
            key={it.left}
            type="button"
            className={
              'match-item ' +
              (matched.includes(it.left)
                ? 'matched'
                : selLeft?.left === it.left
                  ? 'selected'
                  : '')
            }
            onClick={() => click('L', it)}
          >
            {it.left}
          </button>
        ))}
      </div>
      <div className="match-col">
        {rights.map((it: QuizMatchPair) => (
          <button
            key={it.left}
            type="button"
            className={
              'match-item ' +
              (matched.includes(it.left) ? 'matched' : shake === it.left ? 'shake' : '')
            }
            onClick={() => click('R', it)}
          >
            {it.right}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MatchQuestion;
