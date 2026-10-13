import json,wave,numpy as np
T=json.load(open("ep2/timeline.json"));R=44100;fps=T["fps"]
w=wave.open("ep2/voz.wav");a=np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(np.float32)/32768
hop=R//fps;n=T["frames"];e=np.array([np.sqrt(np.mean(a[i*hop:(i+1)*hop]**2)) if i*hop<len(a) else 0 for i in range(n)])
e=np.clip(e/(np.percentile(e[e>0.01],90) if (e>0.01).any() else 1),0,1);s=[];c=0
for x in e:c+=(x-c)*(0.6 if x>c else 0.3);s.append(round(float(c),3))
T["env"]=s;json.dump(T,open("ep2/timeline.json","w"),ensure_ascii=False);print("env",len(s))
