import shutil, datetime

SRC = "/workspaces/kitchen-pro/kitchen-pro/src/KitchenPro.tsx"
IDX = "/workspaces/kitchen-pro/kitchen-pro/index.html"

txt = open(SRC, encoding="utf-8").read()
idx = open(IDX, encoding="utf-8").read()

fixes = 0

# 1) Viewport: previeni zoom iOS su input
old_vp = 'content="width=device-width, initial-scale=1.0"'
new_vp = 'content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"'
if idx.count(old_vp)==1:
    idx = idx.replace(old_vp, new_vp)
    print("✓ Viewport anti-zoom iOS")
    fixes+=1

# 2) LuxInput: font-size 16px (soglia iOS anti-zoom)
old_li = "function LuxInput({ value, onChange, placeholder, type=\"text\", t, style:sx={} }) {"
new_li = old_li
# Cerca la riga dell'input dentro LuxInput
lines = open(SRC, encoding="utf-8").readlines()
li_i = next(i for i,l in enumerate(lines) if "function LuxInput(" in l)
# Trova l'input dentro LuxInput (entro 10 righe)
for j in range(li_i, li_i+10):
    if "<input" in lines[j] and "fontSize" in lines[j]:
        old_font = lines[j]
        # Sostituisci fontSize piccolo con 16
        import re
        new_font = re.sub(r'fontSize:\d+', 'fontSize:16', old_font)
        if new_font != old_font:
            lines[j] = new_font
            print(f"✓ LuxInput fontSize→16 (riga {j+1})")
            fixes+=1
        break

txt = "".join(lines)

# 3) Form economato: grid traboccante → stack verticale su mobile
# "1fr 70px 60px 90px auto" → responsivo
old_econo = 'gridTemplateColumns:"1fr 70px 60px 90px auto"'
new_econo = 'gridTemplateColumns:"1fr"'
if txt.count(old_econo)==1:
    txt = txt.replace(old_econo, new_econo)
    print("✓ Form economato grid→stack")
    fixes+=1

# 4) Grid "80px 90px 1fr" → flex wrap
old_g80 = 'gridTemplateColumns:"80px 90px 1fr"'
new_g80 = 'gridTemplateColumns:"1fr 1fr"'
if txt.count(old_g80)==1:
    txt = txt.replace(old_g80, new_g80)
    print("✓ Grid 80px 90px 1fr → 1fr 1fr")
    fixes+=1

# 5) Card inventario: "1fr 1fr" → auto-fill minmax per mobile
# Solo i grid principali di card inventario (riga 3136, 3303)
old_card2 = 'gridTemplateColumns:"repeat(2,1fr)",gap:12'
new_card2 = 'gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12'
count = txt.count(old_card2)
if count > 0:
    txt = txt.replace(old_card2, new_card2)
    print(f"✓ Card grid repeat(2,1fr)→auto-fill ({count}x)")
    fixes+=1

# 6) AI Panel: assicura che su mobile sia fixed full-screen
# Cerca il pannello AI chat e verifica che abbia height:100% su mobile
old_ai = 'position:"fixed",inset:0,zIndex:200'
new_ai = 'position:"fixed",inset:0,zIndex:200,height:"100dvh"'
if txt.count(old_ai)==1:
    txt = txt.replace(old_ai, new_ai)
    print("✓ AI panel height:100dvh")
    fixes+=1

# 7) Aggiungi CSS globale anti-zoom e scroll smooth in index.html
old_style = '</head>'
new_style = '''  <style>
    * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
    input, select, textarea { font-size: 16px !important; }
    html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
    body { overscroll-behavior-y: none; }
  </style>
</head>'''
if idx.count(old_style)==1:
    idx = idx.replace(old_style, new_style)
    print("✓ CSS globale anti-zoom, smooth scroll")
    fixes+=1

open(SRC, "w", encoding="utf-8").write(txt)
open(IDX, "w", encoding="utf-8").write(idx)
print(f"\nTotale fix applicati: {fixes}")
