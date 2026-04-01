SRC = "/workspaces/kitchen-pro/kitchen-pro/src/KitchenPro.tsx"
lines = open(SRC, encoding="utf-8").readlines()

# Trova riga con input file ref fattura
file_input_i = next(i for i,l in enumerate(lines) if 'type="file" accept="image/*,application/pdf"' in l and 'fileRef' in l)
print(f"file input a riga {file_input_i+1}")

# Trova la chiusura del onChange (cerca '}}/>' dopo)
end_i = next(i for i in range(file_input_i, file_input_i+10) if lines[i].strip().endswith("}}/>" ))
print(f"fine onChange a riga {end_i+1}")

new_block = (
'          <input ref={fileRef} type="file" accept="image/*,application/pdf" style={{display:"none"}} onChange={async e=>{\n'
'            const f=e.target.files?.[0]; if(!f) return;\n'
'            if(f.type==="application/pdf"){\n'
'              toast("Elaborazione PDF...","success");\n'
'              try {\n'
'                if(!(window as any).pdfjsLib){\n'
'                  await new Promise<void>((res,rej)=>{\n'
'                    const s=document.createElement("script");\n'
'                    s.src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";\n'
'                    s.onload=()=>{ (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"; res(); };\n'
'                    s.onerror=()=>rej(new Error("PDF.js load failed"));\n'
'                    document.head.appendChild(s);\n'
'                  });\n'
'                }\n'
'                const pdfLib=(window as any).pdfjsLib;\n'
'                const ab=await f.arrayBuffer();\n'
'                const pdf=await pdfLib.getDocument({data:ab}).promise;\n'
'                const page=await pdf.getPage(1);\n'
'                const vp=page.getViewport({scale:2});\n'
'                const canvas=document.createElement("canvas");\n'
'                canvas.width=vp.width; canvas.height=vp.height;\n'
'                const ctx2=canvas.getContext("2d");\n'
'                await page.render({canvasContext:ctx2,viewport:vp}).promise;\n'
'                const b64=canvas.toDataURL("image/jpeg",0.9).split(",")[1];\n'
'                setImgData({base64:b64,mimeType:"image/jpeg"});\n'
'                toast("PDF pronto: "+f.name,"success");\n'
'              } catch(err:any){ toast("Errore PDF — usa il testo: "+err.message,"error"); }\n'
'            } else {\n'
'              const r=new FileReader();\n'
'              r.onload=ev=>{ const b64=(ev.target?.result as string).split(",")[1]; setImgData({base64:b64,mimeType:f.type}); toast("File caricato: "+f.name,"success"); };\n'
'              r.readAsDataURL(f);\n'
'            }\n'
'          }}/>\n'
)
lines[file_input_i:end_i+1] = [new_block]
print("✓ PDF.js handler inserito")

open(SRC, "w", encoding="utf-8").writelines(lines)
print("DONE")
