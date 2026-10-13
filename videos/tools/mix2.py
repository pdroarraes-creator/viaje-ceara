import json, wave, numpy as np, subprocess
R=44100;T=json.load(open("ep2/timeline.json"));N=int((T["total"]+0.5)*R);v=np.zeros(N)
for l in T["lines"]:
    w=wave.open(f"ep2/l{l['i']}.wav");a=np.frombuffer(w.readframes(w.getnframes()),np.int16)/32768;i=int(l["start"]*R);v[i:i+len(a)]+=a[:N-i]
w=wave.open("ep2/voz.wav","wb");w.setnchannels(1);w.setsampwidth(2);w.setframerate(R);w.writeframes((np.clip(v,-1,1)*32767).astype(np.int16).tobytes());w.close()
subprocess.run(["ffmpeg","-loglevel","error","-y","-i","ep2/sfx.wav","-i","ep2/voz.wav","-filter_complex",
 "[1:a]aformat=channel_layouts=stereo,asplit=2[vz][sc];[0:a]volume=0.9[fx];[fx][sc]sidechaincompress=threshold=0.03:ratio=6:attack=15:release=350[duck];[duck][vz]amix=inputs=2:weights='1 1.15':normalize=0,alimiter=limit=0.95[out]",
 "-map","[out]","-ar","44100","ep2/mix.wav"],check=True)
print("mix ok")
