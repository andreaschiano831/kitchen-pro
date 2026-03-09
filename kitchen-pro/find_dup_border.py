import re
src = open("src/KitchenPro.tsx").read()
lines = src.splitlines()
i = 0
while i < len(lines):
    if 'style={{' in lines[i]:
        block = ""
        j = i
        depth = 0
        while j < len(lines) and j < i+20:
            l = lines[j]
            block += l+"\n"
            depth += l.count('{{') - l.count('}}')
            if depth<=0 and j>i: break
            j+=1
        borders=[l.strip()[:100] for l in block.splitlines() if re.search(r'(?<![a-zA-Z])border:',l)]
        if len(borders)>=2:
            print(f"=== RIGA {i+1} ===")
            for b in borders: print(f"  {b}")
    i+=1
