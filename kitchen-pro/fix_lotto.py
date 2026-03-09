import shutil, datetime

SRC = "/workspaces/kitchen-pro/kitchen-pro/src/KitchenPro.tsx"
BK  = SRC.replace(".tsx","_bk_lotto_"+datetime.datetime.now().strftime("%Y%m%d_%H%M%S")+".tsx")
shutil.copy2(SRC,BK); print("Backup ->",BK)

txt = open(SRC,encoding="utf-8").read()

old = """                      <button onClick={()=>{setMoveModal(item);setMoveQty(String(item.quantity));setMoveDest(item.location==="freezer"?"fridge":"counter");}} style={{...btnSmall(t),background:"#2A4FA520",color:"#2A4FA5",fontSize:8}}>↗ Sposta</button>
                      <div style={{flex:1}}/>"""

new = """                      <button onClick={()=>{setMoveModal(item);setMoveQty(String(item.quantity));setMoveDest(item.location==="freezer"?"fridge":"counter");}} style={{...btnSmall(t),background:"#2A4FA520",color:"#2A4FA5",fontSize:8}}>↗ Sposta</button>
                      <button onClick={()=>{setFName(item.name);setFCat(item.category||"proteine");setFPartita(item.partita||"");setFUnit(item.unit||"pz");setFQty("1");setFLot("");setFExpiry("");setShowForm(true);window.scrollTo({top:0,behavior:"smooth"});}} style={{...btnSmall(t),background:t.gold+"20",color:t.gold,fontSize:8}}>+ Lotto</button>
                      <div style={{flex:1}}/>"""

n = txt.count(old)
if n != 1:
    print("ERRORE - occorrenze:", n)
    exit(1)

txt = txt.replace(old, new)
open(SRC,"w",encoding="utf-8").write(txt)
print("OK - bottone + Lotto aggiunto")
