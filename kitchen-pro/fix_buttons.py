import shutil, datetime

SRC = "/workspaces/kitchen-pro/kitchen-pro/src/KitchenPro.tsx"
BK  = SRC.replace(".tsx", "_bk_btn_" + datetime.datetime.now().strftime("%Y%m%d_%H%M%S") + ".tsx")
shutil.copy2(SRC, BK)
print("Backup ->", BK)

txt = open(SRC, encoding="utf-8").read()

fixes = [
  (
    'display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10',
    'display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10,width:"100%"'
  ),
  (
    'style={{padding:"2px 6px",borderRadius:5,border:`1px solid ${t.div}`,background:"transparent",color:t.inkFaint,fontSize:9,cursor:"pointer",fontFamily:"var(--mono)"}}>✎</button>',
    'style={{padding:"5px 9px",borderRadius:6,border:`1px solid ${t.div}`,background:"transparent",color:t.inkFaint,fontSize:12,cursor:"pointer",fontFamily:"var(--mono)"}}>✎</button>'
  ),
  (
    'style={{flex:1,padding:"6px 8px",borderRadius:8,border:`1px solid ${isOk===false?t.danger:isOk===true?t.success:t.div}`,background:t.bgAlt,color:t.ink,fontFamily:"var(--mono)",fontSize:14,outline:"none",textAlign:"center"}}/>',
    'style={{flex:1,minWidth:0,padding:"6px 8px",borderRadius:8,border:`1px solid ${isOk===false?t.danger:isOk===true?t.success:t.div}`,background:t.bgAlt,color:t.ink,fontFamily:"var(--mono)",fontSize:14,outline:"none",textAlign:"center"}}/>'
  ),
  (
    'style={{padding:"6px 10px",borderRadius:8,border:"none",cursor:"pointer",background:t.gold,color:"#fff",fontFamily:"var(--mono)",fontSize:12}}>✓</button>',
    'style={{padding:"6px 10px",borderRadius:8,border:"none",cursor:"pointer",flexShrink:0,background:t.gold,color:"#fff",fontFamily:"var(--mono)",fontSize:12}}>✓</button>'
  ),
]

for i,(old,new) in enumerate(fixes):
  n = txt.count(old)
  if n != 1:
    print("ERRORE fix", i+1, "- occorrenze trovate:", n)
    exit(1)
  txt = txt.replace(old, new)
  print("OK fix", i+1)

open(SRC, "w", encoding="utf-8").write(txt)
print("Tutti i fix applicati")
