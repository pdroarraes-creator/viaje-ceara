# Corta o .wav do Gemini nas 10 falas (pausas >= 0.85s) -> ep2/l{i}.wav
import subprocess,re,sys,json,wave,numpy as np
F=sys.argv[1]
out=subprocess.run(["ffmpeg","-i",F,"-af","silencedetect=noise=-38dB:d=0.3","-f","null","-"],capture_output=True,text=True).stderr
S=[float(x) for x in re.findall(r"silence_start: ([\d.]+)",out)];E=[float(x) for x in re.findall(r"silence_end: ([\d.]+)",out)]
dur=float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",F]))
sil=list(zip(S,E));big=[(a,b) for a,b in sil if b-a>=0.85]
n=len(json.load(open("/home/claude/viaje-ceara/videos/ep01.json"))["turns"])
assert len(big)==n-1,(len(big),big)
cuts=[0]+[ (a+b)/2 for a,b in big]+[dur]
inner={}
for i in range(n):
    a,b=cuts[i],cuts[i+1]
    subprocess.run(["ffmpeg","-loglevel","error","-y","-ss",str(a),"-to",str(b),"-i",F,"-af","silenceremove=start_periods=1:start_threshold=-42dB,areverse,silenceremove=start_periods=1:start_threshold=-42dB,areverse,silenceremove=stop_periods=-1:stop_duration=0.35:stop_threshold=-42dB:stop_silence=0.28,atempo=1.07,highpass=f=70,loudnorm=I=-16:TP=-1.5","-ar","44100","-ac","1",f"ep2/l{i}.wav"],check=True)
    w=wave.open(f"ep2/l{i}.wav");x=np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(np.float32)/32768;R=44100
    # trechos de fala (para a legenda palavra a palavra)
    hop=441;e=np.array([np.sqrt(np.mean(x[k:k+hop]**2)) for k in range(0,len(x),hop)]);on=e>0.02
    segs=[];st=None
    for k,v in enumerate(on):
        if v and st is None:st=k
        if not v and st is not None:
            if k-st>3:segs.append([st/100,k/100])
            st=None
    if st is not None:segs.append([st/100,len(on)/100])
    # junta buracos curtos (<0.18s)
    m=[]
    for s in segs:
        if m and s[0]-m[-1][1]<0.18:m[-1][1]=s[1]
        else:m.append(s)
    inner[i]=m;print(i,round(len(x)/R,2),len(m))
json.dump(inner,open("ep2/speech.json","w"))
