# Monta a linha do tempo do ep01 a partir da duração de cada fala (ep2/l{i}.wav)
import json, wave
S=json.load(open("/home/claude/viaje-ceara/videos/ep01.json"))
def dur(i):
    w=wave.open(f"ep2/l{i}.wav");return w.getnframes()/w.getframerate()
D=[dur(i) for i in range(len(S["turns"]))]
t=0;L=[];B={};EV={}
import os
SP=json.load(open("ep2/speech.json")) if os.path.exists("ep2/speech.json") else {}
def words(i):
    ws=S["turns"][i]["text"].split();segs=SP.get(str(i)) or [[0,D[i]]]
    tot=sum(b-a for a,b in segs);cw=[len(w)+1 for w in ws];C=sum(cw);out=[];acc=0
    for w,c in zip(ws,cw):
        x=acc/C*tot;acc+=c;rem=x
        for a,b in segs:
            if rem<=b-a:out.append(round(a+rem,3));break
            rem-=b-a
        else:out.append(round(segs[-1][1],3))
    return out
def line(i):
    global t
    L.append({"i":i,"speaker":S["turns"][i]["speaker"],"text":S["turns"][i]["text"],"start":round(t,3),"dur":round(D[i],3),"wt":words(i)});t+=D[i]
def beat(n):B[n]=round(t,3)
beat("mapa");t+=2.6;line(0);t+=0.3;line(1);t+=0.6
beat("barcos");t+=0.8;line(2);t+=0.5;line(3);t+=1.0
beat("fuerte");EV["hammer"]=[round(B["fuerte"]+k*0.42,2) for k in range(1,9)];t+=1.4;line(4);t+=1.2
beat("guerra");t+=0.8;line(5)
EV["battle"]=round(t,2);EV["cannons"]=[round(t+x,2) for x in (0.2,0.9,1.5,1.9,2.6,3.0)];t+=3.6
line(6);EV["surrLine"]=6;EV["surrender"]=round(L[-1]["start"]+D[6]*0.33,2);t+=1.2
beat("villa");t+=1.0;line(7);EV["houses"]=[round(B["villa"]+0.6+k*((t+2.0-B["villa"]-0.6)/7),2) for k in range(7)];t+=1.8
beat("hoy");t+=0.6;line(8);EV["fireworks"]=[round(B["hoy"]+0.3+k*0.55,2) for k in range(int((t+1.8-B["hoy"])/0.55))];t+=1.8
beat("fin");t+=0.6;line(9);t+=2.6
FPS=30
json.dump({"fps":FPS,"total":round(t,3),"frames":int(t*FPS),"lines":L,"beats":B,"ev":EV},open("ep2/timeline.json","w"),ensure_ascii=False,indent=1)
print(round(t,1),"s",B)
