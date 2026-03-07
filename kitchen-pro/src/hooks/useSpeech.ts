import { useEffect, useRef, useState } from "react";

type SpeechStatus = "idle" | "listening" | "unsupported";

export function useSpeech() {
  const recognitionRef = useRef<any>(null);
  const [status, setStatus] = useState<SpeechStatus>("idle");
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatus("unsupported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "it-IT";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => setStatus("listening");
    recognition.onend = () => setStatus("idle");

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
    };

    recognitionRef.current = recognition;
  }, []);

  function start() {
    if (recognitionRef.current && status !== "listening") {
      setTranscript("");
      recognitionRef.current.start();
    }
  }

  function stop() {
    recognitionRef.current?.stop();
  }

  return { transcript, status, start, stop };
}
