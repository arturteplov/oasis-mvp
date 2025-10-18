import { useEffect, useRef } from 'react';

const VideoPreview = ({ url, transcript, onPlay }) => {
  const hasNotifiedRef = useRef(false);

  useEffect(() => {
    hasNotifiedRef.current = false;
  }, [url]);

  const handlePlay = () => {
    if (!hasNotifiedRef.current) {
      hasNotifiedRef.current = true;
      onPlay?.();
    }
  };

  const hasVideo = Boolean(url);

  return (
    <div className="flex w-full max-w-md flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
      {hasVideo ? (
        <video
          controls
          onPlay={handlePlay}
          className="aspect-video w-full rounded-xl border border-zinc-900 bg-black object-cover"
          src={url ?? ''}
        >
          Your browser does not support the video element.
        </video>
      ) : (
        <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-black/30 text-sm text-zinc-500">
          No video submitted
        </div>
      )}
      {transcript && (
        <div className="rounded-xl border border-zinc-800 bg-black/40 p-3 text-sm text-zinc-300">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Text response</p>
          <p className="mt-2 whitespace-pre-wrap">{transcript}</p>
        </div>
      )}
    </div>
  );
};

export default VideoPreview;
