SRC = "/workspaces/kitchen-pro/kitchen-pro/src/KitchenPro.tsx"
txt = open(SRC, encoding="utf-8").read()

old = 'function useSpeech(onResult) {\n  const [listening, setListening] = useState(false);\n  const recRef = useRef(null);\n  const supported = typeof window!=="undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);\n  const start = useCallback(()=>{\n    if(!supported||listening) return;\n    const SR = window.SpeechRecognition||window.webkitSpeechRecognition;\n    const r = new SR(); r.lang="it-IT"; r.interimResults=false; r.maxAlternatives=1; r.continuous=false;\n    r.onresult = e => { try { onResult(e.results[0][0].transcript); }catch{} };\n    r.onerror = () => setListening(false);\n    r.onend = () => setListening(false);\n    recRef.current = r;\n    try { r.start(); setListening(true); } catch { setListening(false); }\n  },[supported,listening,onResult]);\n  const stop = useCallback(()=>{ recRef.current?.stop(); setListening(false); },[]);\n  useEffect(()=>()=>recRef.current?.abort(),[]);\n  return { listening, start, stop, supported };\n}'

new = '''function useSpeech(onResult) {
  const [listening, setListening] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const recRef = useRef<any>(null);
  const supported = typeof window!=="undefined" && ("SpeechRecognition" in (window as any) || "webkitSpeechRecognition" in (window as any));

  function doStart() {
    setErrMsg("");
    const SR = (window as any).SpeechRecognition||(window as any).webkitSpeechRecognition;
    const r = new SR();
    r.lang="it-IT"; r.interimResults=false; r.maxAlternatives=1; r.continuous=false;
    r.onresult = (e:any) => { try { onResult(e.results[0][0].transcript); } catch{} };
    r.onerror = (e:any) => {
      setListening(false);
      if(e.error==="not-allowed") setErrMsg("Permesso microfono negato. Vai in Impostazioni Safari > Microfono.");
      else if(e.error==="no-speech") setErrMsg("Nessun audio. Riprova.");
      else setErrMsg("Errore: "+e.error);
    };
    r.onend = () => setListening(false);
    recRef.current = r;
    try { r.start(); setListening(true); } catch { setListening(false); setErrMsg("Impossibile avviare il microfono."); }
  }

  const start = useCallback(()=>{
    if(!supported||listening) return;
    if(navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({audio:true})
        .then(()=>doStart())
        .catch(()=>setErrMsg("Permesso microfono negato. Vai in Impostazioni Safari > Microfono."));
    } else {
      doStart();
    }
  },[supported,listening,onResult]);

  const stop = useCallback(()=>{ recRef.current?.stop(); setListening(false); },[]);
  useEffect(()=>()=>recRef.current?.abort(),[]);
  return { listening, start, stop, supported, errMsg };
}'''

assert txt.count(old)==1, f"count:{txt.count(old)}"
txt = txt.replace(old, new)
open(SRC, "w", encoding="utf-8").write(txt)
print("OK")
