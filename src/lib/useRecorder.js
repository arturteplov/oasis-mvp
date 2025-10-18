import { useCallback, useEffect, useRef, useState } from 'react';

const constraints = {
  audio: true,
  video: {
    facingMode: 'user'
  }
};

const useRecorder = () => {
  const [recording, setRecording] = useState(false);
  const [blob, setBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const videoRef = useRef(null);

  const reset = useCallback(() => {
    setRecording(false);
    setBlob(null);
  }, []);

  const stopTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const start = useCallback(async () => {
    reset();
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    streamRef.current = stream;

    const videoEl = videoRef.current;
    if (videoEl) {
      videoEl.srcObject = stream;
      videoEl.muted = true;
      videoEl.autoplay = true;
      videoEl.controls = false;
      videoEl.playsInline = true;
      videoEl.setAttribute('playsinline', 'true');
      videoEl.setAttribute('webkit-playsinline', 'true');
      try {
        await videoEl.play();
      } catch (error) {
        console.warn('Video preview play failed', error);
      }
    }

    const chunks = [];
    const candidateTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/mp4;codecs=avc1.42E01E,mp4a.40.2'
    ];

    const supportedType = candidateTypes.find((type) => MediaRecorder.isTypeSupported(type));

    let recorder;
    try {
      recorder = supportedType
        ? new MediaRecorder(stream, { mimeType: supportedType })
        : new MediaRecorder(stream);
    } catch {
      recorder = new MediaRecorder(stream);
    }

    const recordedType = supportedType ?? (navigator.userAgent.includes('Safari') ? 'video/mp4' : 'video/webm');
    mediaRecorderRef.current = recorder;
    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunks.push(event.data);
      }
    };
    recorder.onstop = () => {
      const recordedBlob = new Blob(chunks, { type: recordedType });
      setBlob(recordedBlob);
      stopTracks();
    };
    recorder.start();
    setRecording(true);
  }, [reset, stopTracks]);

  const stop = useCallback(() => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  }, [recording]);

  useEffect(() => {
    const currentVideo = videoRef.current;
    if (currentVideo) {
      currentVideo.muted = true;
    }
    return () => {
      stop();
      stopTracks();
    };
  }, [stop, stopTracks]);

  return {
    recording,
    blob,
    start,
    stop,
    reset,
    videoRef
  };
};

export default useRecorder;
