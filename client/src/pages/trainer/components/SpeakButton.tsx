import { Volume2 } from 'lucide-react';
import { speak } from '../lib/speak';

interface SpeakButtonProps {
  text: string;
  rate?: number;
}

const SpeakButton = ({ text, rate }: SpeakButtonProps) => {
  return (
    <button
      type="button"
      className="speak-btn"
      title="朗读"
      aria-label="朗读英文"
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        speak(text, rate);
      }}
    >
      <Volume2 />
    </button>
  );
};

export default SpeakButton;
