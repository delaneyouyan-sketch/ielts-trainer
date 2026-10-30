import { useState } from 'react';
import type { QuizQuestion } from '../../content';

type PickedState = 'ok' | 'no' | null;

interface OrderChip {
  t: string;
  n: number;
}

interface OrderQuestionProps {
  q: QuizQuestion;
  picked: PickedState;
  onResult: (ok: boolean) => void;
}

const buildPool = (items: string[]): OrderChip[] =>
  items
    .map((t: string, n: number) => ({ t, n }))
    .sort(() => Math.random() - 0.5);

const OrderQuestion: React.FC<OrderQuestionProps> = ({ q, picked, onResult }) => {
  const correct: string[] = q.items ?? [];
  const [pool, setPool] = useState<OrderChip[]>(() => buildPool(correct));
  const [built, setBuilt] = useState<OrderChip[]>([]);

  const addChip = (chip: OrderChip): void => {
    if (picked !== null) return;
    const nextBuilt: OrderChip[] = [...built, chip];
    setBuilt(nextBuilt);
    setPool(pool.filter((c: OrderChip) => c.n !== chip.n));
    if (nextBuilt.length === correct.length) {
      const ok: boolean = nextBuilt.every((c: OrderChip, k: number) => c.t === correct[k]);
      setTimeout(() => onResult(ok), 200);
    }
  };

  const removeChip = (chip: OrderChip): void => {
    if (picked !== null) return;
    setBuilt(built.filter((c: OrderChip) => c.n !== chip.n));
    setPool([...pool, chip]);
  };

  return (
    <div>
      <div className="order-hint">按正确顺序点击下列步骤：</div>
      <div className="order-built">
        {built.length === 0 && (
          <span style={{ color: 'var(--ink-faint)', fontSize: 13.5, alignSelf: 'center' }}>
            依次点击下方步骤…
          </span>
        )}
        {built.map((c: OrderChip) => (
          <button key={c.n} type="button" className="order-chip" onClick={() => removeChip(c)}>
            {c.t}
          </button>
        ))}
      </div>
      <div className="order-pool">
        {pool.map((c: OrderChip) => (
          <button key={c.n} type="button" className="order-chip" onClick={() => addChip(c)}>
            {c.t}
          </button>
        ))}
      </div>
    </div>
  );
};

export default OrderQuestion;
