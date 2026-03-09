import shutil, datetime

SRC = "/workspaces/kitchen-pro/kitchen-pro/src/KitchenPro.tsx"
BK  = SRC.replace(".tsx", "_bk_anim_" + datetime.datetime.now().strftime("%Y%m%d_%H%M%S") + ".tsx")
shutil.copy2(SRC, BK)
print("Backup ->", BK)

txt = open(SRC, encoding="utf-8").read()

old = '<div style={{animation:ready?"cardIn 0.45s cubic-bezier(0.4,0,0.2,1) both":"none"}}>'
new = '<div style={{animation:ready?"cardIn 0.45s cubic-bezier(0.4,0,0.2,1) both":"none",width:"100%",minWidth:0,overflow:"hidden"}}>'

n = txt.count(old)
if n != 1:
    print("ERRORE - occorrenze trovate:", n)
    exit(1)

txt = txt.replace(old, new)
open(SRC, "w", encoding="utf-8").write(txt)
print("OK - fix applicato")
