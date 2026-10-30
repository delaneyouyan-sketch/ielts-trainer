import { useCallback, useRef, useState } from 'react';

export const useToast = (): [
  (message: string) => void,
  () => React.ReactElement,
] => {
  const [message, setMessage] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((msg: string) => {
    setMessage(msg);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setMessage(''), 2200);
  }, []);

  const node = useCallback(
    () => (
      <div className={message ? 'toast show' : 'toast'} role="status" aria-live="polite">
        {message}
      </div>
    ),
    [message],
  );

  return [show, node];
};
