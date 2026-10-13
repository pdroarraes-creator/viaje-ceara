# Voz provisória grátis (Piper) -> ep2/l{i}.wav (44.1k mono, normalizada)
import json, glob, wave, subprocess, numpy as np, sherpa_onnx, os
S=json.load(open("/home/claude/viaje-ceara/videos/ep01.json"))
VOICE={"Castanha":("es_AR-daniela-high",1.0),"Caju":("es_MX-ald-medium",1.05)}
FIX=[("Schoonenborch","Schónenborj"),("1649","mil seiscientos cuarenta y nueve"),("1654","mil seiscientos cincuenta y cuatro"),("1726","mil setecientos veintiséis"),("2026","dos mil veintiséis"),("Pajeú","Pallejú"),("visse","vise"),("Oi,","Oi,")]
E={}
def eng(v):
    if v not in E:
        d=f"models/vits-piper-{v}"
        E[v]=sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(vits=sherpa_onnx.OfflineTtsVitsModelConfig(model=glob.glob(d+"/*.onnx")[0],tokens=d+"/tokens.txt",data_dir=d+"/espeak-ng-data"),num_threads=4)))
    return E[v]
for i,t in enumerate(S["turns"]):
    v,sp=VOICE[t["speaker"]];txt=t["text"]
    for a,b in FIX: txt=txt.replace(a,b)
    g=eng(v).generate(txt,sid=0,speed=sp)
    x=np.clip(np.array(g.samples)*32767,-32768,32767).astype(np.int16)
    w=wave.open(f"ep2/raw{i}.wav","wb");w.setnchannels(1);w.setsampwidth(2);w.setframerate(g.sample_rate);w.writeframes(x.tobytes());w.close()
    subprocess.run(["ffmpeg","-loglevel","error","-y","-i",f"ep2/raw{i}.wav","-af","silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,highpass=f=80,loudnorm=I=-16:TP=-1.5","-ar","44100","-ac","1",f"ep2/l{i}.wav"],check=True)
    print(i,t["speaker"],round(float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",f"ep2/l{i}.wav"])),2))
