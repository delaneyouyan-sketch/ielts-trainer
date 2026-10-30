import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Square } from 'lucide-react';
import { uploadRecordingFile } from '../../../../lib/upload';
import { CHECKLIST } from '../../content';
import type { SpeakingTopic } from '../../content';
import { useCreateRecording } from '../../hooks/useRecordings';
import { useToast } from '../../components/Toast';
import SpeakButton from '../../components/SpeakButton';
import { getErrorMessage } from '../../lib/error';

type BoothState = 'idle' | 'recording' | 'done';

interface StageViewProps {
  topic: SpeakingTopic;
}

const MIC_ERROR =
  '无法使用麦克风：请在浏览器地址栏允许麦克风权限后重试。没有麦克风也可以先看着题目口头练习。';

const StageView = ({ topic }: StageViewProps) => {
  const navigate = useNavigate();
  const createRecording = useCreateRecording();
  const [showToast, toastNode] = useToast();
  const ToastNode = toastNode;

  const [state, setState] = useState<BoothState>('idle');
  const [seconds, setSeconds] = useState<number>(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [checks, setChecks] = useState<Record<number, boolean>>({});
  const [saved, setSaved] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [err, setErr] = useState<string>('');

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const blobRef = useRef<Blob | null>(null);
  const urlRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const limit: number = topic.mins;

  const clearTimer = (): void => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const releaseAudioUrl = (): void => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  };

  const stopTracks = (): void => {
    const recorder = recorderRef.current;
    if (recorder) {
      if (recorder.state !== 'inactive') recorder.stop();
      recorder.stream.getTracks().forEach((track: MediaStreamTrack) => {
        track.stop();
      });
      recorderRef.current = null;
    }
  };

  const stopRec = (): void => {
    clearTimer();
    stopTracks();
    setState('done');
  };

  const start = async (): Promise<void> => {
    setErr('');
    releaseAudioUrl();
    blobRef.current = null;
    setAudioUrl(null);
    setChecks({});
    setSaved(false);
    try {
      const stream: MediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const recorder: MediaRecorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob: Blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        blobRef.current = blob;
        const nextUrl: string = URL.createObjectURL(blob);
        urlRef.current = nextUrl;
        setAudioUrl(nextUrl);
      };
      recorder.start();
      setSeconds(0);
      setState('recording');
      timerRef.current = setInterval(() => {
        setSeconds((prev: number) => {
          if (prev + 1 >= limit) {
            timeoutRef.current = setTimeout(() => {
              stopRec();
            }, 0);
            return limit;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error: unknown) {
      logger.error('麦克风启动失败', error);
      setErr(MIC_ERROR);
      setState('idle');
    }
  };

  const reset = (): void => {
    clearTimer();
    releaseAudioUrl();
    blobRef.current = null;
    setAudioUrl(null);
    setSeconds(0);
    setChecks({});
    setSaved(false);
    setErr('');
    setState('idle');
  };

  const toggleCheck = (index: number): void => {
    setChecks((prev: Record<number, boolean>) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const saveRecording = async (): Promise<void> => {
    const blob: Blob | null = blobRef.current;
    if (!blob) {
      showToast('没有可保存的录音');
      return;
    }
    setSaving(true);
    try {
      const file: File = new File([blob], `speaking-${Date.now()}.webm`, {
        type: 'audio/webm',
      });
      const audioUrl = await uploadRecordingFile(file);
      const checked: string[] = CHECKLIST.filter(
        (_item: string, index: number) => Boolean(checks[index]),
      );
      await createRecording.mutateAsync({
        tag: topic.tag,
        task: topic.task,
        duration: seconds,
        checks: checked,
        audioUrl,
      });
      setSaved(true);
      showToast('已存入录音档案');
    } catch (error: unknown) {
      console.error('保存口语录音失败', error);
      showToast(getErrorMessage(error, '保存失败，请重试'));
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    return () => {
      clearTimer();
      stopTracks();
      releaseAudioUrl();
    };
  }, []);

  const mm: string = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss: string = String(seconds % 60).padStart(2, '0');

  return (
    <div className="view-enter">
      <div className="learn-head">
        <button
          className="back-link"
          type="button"
          onClick={() => navigate('/booth')}
        >
          ← 换一张话题卡
        </button>
      </div>
      <div className="stage">
        <div className="stage-tag">
          {topic.tag} · 限时 {limit} 秒
        </div>
        <div className="stage-task">{topic.task}</div>
        <div className="stage-vocab">
          {topic.vocab.map((v: string, i: number) => (
            <span className="vocab-chip" key={i}>
              {v}
              <SpeakButton text={v} rate={0.9} />
            </span>
          ))}
        </div>
        <div className="stage-tip">
          <b>提示</b>{'\u3000'}{topic.tips}
        </div>

        <div className="recorder">
          <div className={state === 'recording' ? 'timer live' : 'timer'}>
            {mm}:{ss}
          </div>
          {state !== 'recording' ? (
            <button
              className="rec-btn"
              type="button"
              title="开始录音"
              aria-label="开始录音"
              onClick={() => {
                void start();
              }}
            >
              <Mic />
            </button>
          ) : (
            <button
              className="rec-btn recording"
              type="button"
              title="停止"
              aria-label="停止录音"
              onClick={stopRec}
            >
              <Square />
            </button>
          )}
          <div className="rec-state">
            {state === 'idle' && '点击红点开始录音（建议先默念一遍要点）'}
            {state === 'recording' && '正在录音… 再点一次结束'}
            {state === 'done' && '录音完成，戴上耳机回听一遍'}
          </div>
          {err && (
            <div
              style={{
                color: 'var(--red)',
                fontSize: 13,
                maxWidth: 420,
                textAlign: 'center',
              }}
            >
              {err}
            </div>
          )}
          {state === 'done' && audioUrl && (
            <div className="audio-review">
              <audio src={audioUrl} controls />
            </div>
          )}
        </div>

        {state === 'done' && (
          <div className="self-check">
            <h4>✎ 回听自评（勾出这一版做到的）</h4>
            {CHECKLIST.map((item: string, index: number) => (
              <div
                key={index}
                className={checks[index] ? 'check-item checked' : 'check-item'}
                role="checkbox"
                aria-checked={Boolean(checks[index])}
                tabIndex={0}
                onClick={() => toggleCheck(index)}
                onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    toggleCheck(index);
                  }
                }}
              >
                <span className="check-box">✓</span>
                <span>{item}</span>
              </div>
            ))}
            <div className="stage-actions">
              <button className="btn btn-ghost" type="button" onClick={reset}>
                重录一版
              </button>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="btn btn-red"
                  type="button"
                  onClick={() => {
                    void saveRecording();
                  }}
                  disabled={saved || saving}
                >
                  {saved ? '✓ 已存入录音档案' : saving ? '保存中…' : '保存这一版'}
                </button>
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={() => navigate('/journal/recordings')}
                >
                  去档案对比 →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <ToastNode />
    </div>
  );
};

export default StageView;
