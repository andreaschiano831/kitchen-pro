SRC = "/workspaces/kitchen-pro/kitchen-pro/src/KitchenPro.tsx"
txt = open(SRC, encoding="utf-8").read()

# 1) Station tabs — scroll orizzontale invece di wrap
old_tabs = '      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>\n        {STATIONS.map(s=>{'
new_tabs = '      <div style={{display:"flex",gap:8,overflowX:"auto",WebkitOverflowScrolling:"touch",paddingBottom:4,scrollbarWidth:"none"}}>\n        {STATIONS.map(s=>{'
assert txt.count(old_tabs)==1
txt = txt.replace(old_tabs, new_tabs)
print("✓ station tabs scroll orizzontale")

# 2) AI mode selector — stack su mobile
old_mode = '            <div style={{display:"flex",gap:8}}>\n              {[\n                {key:"voice", label:"🎤 Voce / Testo", desc:"Ditta o scrivi"},\n                {key:"file",  label:"📄 Foto / File",  desc:"Immagine, PDF, .txt"},'
new_mode = '            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>\n              {[\n                {key:"voice", label:"🎤 Voce / Testo", desc:"Ditta o scrivi"},\n                {key:"file",  label:"📄 Foto / File",  desc:"Immagine, PDF, .txt"},'
assert txt.count(old_mode)==1
txt = txt.replace(old_mode, new_mode)
print("✓ AI mode selector flexWrap")

# 3) useSpeech — fix iOS Safari (continuous false, interimResults false, require gesture)
old_speech = '    const SR = window.SpeechRecognition||window.webkitSpeechRecognition;\n    const r = new SR(); r.lang="it-IT"; r.interimResults=false; r.maxAlternatives=1;'
new_speech = '    const SR = window.SpeechRecognition||window.webkitSpeechRecognition;\n    const r = new SR(); r.lang="it-IT"; r.interimResults=false; r.maxAlternatives=1; r.continuous=false;'
assert txt.count(old_speech)==1
txt = txt.replace(old_speech, new_speech)
print("✓ useSpeech continuous=false per iOS")

# 4) VoiceBtn — aggiungi feedback visivo e gestione errore iOS
old_voice_btn = 'function VoiceBtn({ t, onResult }) {\n  const sp = useSpeech(onResult);\n  if(!sp.supported) return null;'
new_voice_btn = 'function VoiceBtn({ t, onResult }) {\n  const sp = useSpeech(onResult);\n  if(!sp.supported) return <span style={{fontSize:9,color:t.inkFaint,fontFamily:"var(--mono)",padding:"0 4px"}} title="Audio non supportato">🎤✕</span>;'
assert txt.count(old_voice_btn)==1
txt = txt.replace(old_voice_btn, new_voice_btn)
print("✓ VoiceBtn mostra icona disabilitata se non supportato")

open(SRC, "w", encoding="utf-8").write(txt)
print("DONE")
