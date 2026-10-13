# Efeitos sonoros e trilha procedurais (sem custo) para o ep01 -> ep2/sfx.wav
import json, numpy as np, wave
from scipy.signal import butter, sosfilt
R=44100;T=json.load(open("ep2/timeline.json"));N=int((T["total"]+0.5)*R)
B=T["beats"];EV=T["ev"];rng=np.random.default_rng(7)
L=np.zeros(N);Rr=np.zeros(N)
def lp(x,f,o=2):return sosfilt(butter(o,f,'low',fs=R,output='sos'),x)
def hp(x,f,o=2):return sosfilt(butter(o,f,'high',fs=R,output='sos'),x)
def bp(x,a,b,o=2):return sosfilt(butter(o,[a,b],'band',fs=R,output='sos'),x)
def add(t,x,g=1.0,pan=0.0):
    i=int(t*R);x=x[:max(0,N-i)]
    if i<0 or len(x)==0:return
    L[i:i+len(x)]+=x*g*(1-pan)/1.0*0.5*2*min(1,1-pan) if False else x*g*min(1,1-pan)
    Rr[i:i+len(x)]+=x*g*min(1,1+pan)
def env(n,a,d):
    e=np.ones(n);ai=int(a*R);di=int(d*R)
    if ai>0:e[:ai]=np.linspace(0,1,ai)
    if di>0:e[-di:]*=np.linspace(1,0,di)
    return e
def seg(t0,t1):return max(0,t1-t0)
def tt(n):return np.arange(n)/R
# --- mar
def ocean(t0,t1,g):
    n=int(seg(t0,t1)*R);w=np.cumsum(rng.standard_normal(n));w-=lp(w,0.5,1);w/=np.abs(w).max()+1e-9
    w=lp(w,900)*(0.55+0.45*np.sin(2*np.pi*0.11*tt(n)+1.3)**2)
    add(t0,w*env(n,1.2,1.5),g,-0.2)
    w2=hp(lp(rng.standard_normal(n),3000),400)*(0.5+0.5*np.sin(2*np.pi*0.13*tt(n))**4)*0.25
    add(t0,w2*env(n,1.2,1.5),g,0.3)
def wind(t0,t1,g):
    n=int(seg(t0,t1)*R);x=rng.standard_normal(n);f=bp(x,300,1200)*(0.4+0.6*np.sin(2*np.pi*0.07*tt(n))**2)
    add(t0,f*env(n,1.5,1.5),g,0.2)
def creak(t,g):
    n=int(0.7*R);f0=90+40*np.sin(np.linspace(0,3,n));ph=np.cumsum(f0)/R
    x=((ph%1)-0.5)*(rng.random(n)<0.6)*np.hanning(n);add(t,bp(x,200,1800),g,-0.4)
def bell(t,g,f=880,pan=0.3):
    n=int(2.5*R);x=sum(a*np.sin(2*np.pi*f*m*tt(n)) for m,a in ((1,1),(2.0,.5),(2.76,.35),(5.4,.2)))*np.exp(-tt(n)*2.2);add(t,x,g,pan)
def hammer(t,g,pan=0.1):
    n=int(0.35*R);k=tt(n);x=rng.standard_normal(n)*np.exp(-k*90)+0.8*np.sin(2*np.pi*190*k)*np.exp(-k*25)+0.4*np.sin(2*np.pi*420*k)*np.exp(-k*35)
    add(t,x,g,pan)
def boom(t,g,pan=0):
    n=int(2.6*R);k=tt(n);f=55*np.exp(-k*1.2)+28;ph=np.cumsum(f)/R
    x=np.sin(2*np.pi*ph)*np.exp(-k*2.2)*1.2+lp(rng.standard_normal(n),700)*np.exp(-k*3.5)*1.6+hp(rng.standard_normal(n),1500)*np.exp(-k*30)*0.6
    add(t,x,g,pan);add(t+0.09,lp(x,500)*0.35,g,-pan)
def crackle(t0,t1,g):
    for c in rng.uniform(t0,t1,int(seg(t0,t1)*14)):
        n=int(0.05*R);x=hp(rng.standard_normal(n),900)*np.exp(-tt(n)*120);add(c,x,g*rng.uniform(.3,1),rng.uniform(-.8,.8))
def drum(t,g,f=70,dec=9):
    n=int(0.6*R);k=tt(n);x=np.sin(2*np.pi*np.cumsum(f*(1+1.5*np.exp(-k*30)))/R)*np.exp(-k*dec)+lp(rng.standard_normal(n),900)*np.exp(-k*40)*.4
    add(t,x,g)
def snare_roll(t0,t1,g):
    for c in np.arange(t0,t1,0.07):
        n=int(0.08*R);add(c,bp(rng.standard_normal(n),1500,6000)*np.exp(-tt(n)*60),g*(0.5+0.5*((c-t0)/max(.01,t1-t0))),0.2)
def drone(t0,t1,g,f=55):
    n=int(seg(t0,t1)*R);k=tt(n);x=(np.sin(2*np.pi*f*k)+.5*np.sin(2*np.pi*f*1.5*k)+.3*np.sin(2*np.pi*f*2.01*k))*env(n,1.5,1.2);add(t0,lp(x,600),g)
def whoosh(t,g,d=0.9,up=True):
    n=int(d*R);x=rng.standard_normal(n);fc=np.linspace(300,4000,n) if up else np.linspace(4000,300,n)
    y=np.zeros(n);blk=2048
    for s in range(0,n,blk):y[s:s+blk]=bp(x[s:s+blk],max(100,fc[s]*0.6),min(18000,fc[s]*1.4),1)
    add(t-d*0.7,y*np.sin(np.linspace(0,np.pi,n))**2,g,0)
def pluck(t,f,g,d=1.6,pan=0.0):
    n=int(d*R);p=int(R/f);buf=rng.uniform(-1,1,p);out=np.zeros(n)
    for i in range(n):
        out[i]=buf[i%p];buf[i%p]=0.996*0.5*(buf[i%p]+buf[(i+1)%p])
    add(t,out*np.exp(-tt(n)*1.2),g,pan)
def tri(t,g,open_=False):
    n=int((0.5 if open_ else 0.08)*R);k=tt(n);x=sum(np.sin(2*np.pi*f*k) for f in (4100,5300,6900))*np.exp(-k*(6 if open_ else 50));add(t,x,g,0.5)
def baiao(t0,t1,g,bpm=104,melody=True):
    q=60/bpm;scale=[196,220,247,262,294,330,349,392]  # sol mixolídio
    mel=[4,4,5,4,3,2,1,2, 4,4,5,7,6,5,4,4]
    t=t0;bar=0
    while t<t1-0.2:
        drum(t,g*1.0,60,7);drum(t+q*0.75,g*.7,60,9);drum(t+q*1.5,g*.85,66,8)
        for s in range(8):tri(t+s*q/4*2/2,g*.12,open_=(s%4==3))
        if melody:
            for s in range(4):
                nidx=mel[(bar*4+s)%len(mel)];pluck(t+s*q/2,scale[nidx],g*.32,1.2,-0.3)
            pluck(t,scale[0]/2,g*.35,1.6,0.1)
        t+=2*q;bar+=1
def firework(t,g,pan):
    n=int(0.9*R);k=tt(n);f=600+1600*k/0.9;x=np.sin(2*np.pi*np.cumsum(f)/R)*0.25*np.linspace(.2,1,n)+hp(rng.standard_normal(n),3000)*0.08
    add(t,x,g*.6,pan);boomt=t+0.9
    m=int(0.6*R);km=tt(m);add(boomt,lp(rng.standard_normal(m),2500)*np.exp(-km*9)*1.2,g,pan)
    crackle(boomt+0.15,boomt+0.9,g*.35)
def chime(t,g):
    for i,f in enumerate((523,659,784,1047)):bell(t+i*0.12,g*.5,f,0.4-i*.25)
def pad(t0,t1,g,fs=(196,247,294,392)):
    n=int(seg(t0,t1)*R);k=tt(n);x=sum(np.sin(2*np.pi*f*k+np.sin(2*np.pi*0.2*k)*0.5) for f in fs)/len(fs);add(t0,lp(x,1800)*env(n,1.0,1.5),g)
# ===== composição
end=T["total"]
whoosh(0.15,0.5);boom(0.2,0.25);baiao(0.3,B["barcos"]-0.3,0.55)
ocean(0,B["barcos"],0.25)
whoosh(B["barcos"],0.6);ocean(B["barcos"]-0.5,B["fuerte"]+0.5,0.6);wind(B["barcos"],B["fuerte"],0.3)
for c in (1.0,3.5,6.2,9.0):creak(B["barcos"]+c,0.35)
bell(B["barcos"]+0.6,0.25,700,-0.4);bell(B["barcos"]+1.4,0.2,700,-0.4)
whoosh(B["fuerte"],0.5);ocean(B["fuerte"],B["guerra"],0.25)
for h in EV["hammer"]:hammer(h,0.55,rng.uniform(-.5,.5))
for h in EV["hammer"]:hammer(h+5.2,0.18,rng.uniform(-.5,.5))
whoosh(B["guerra"],0.6,1.2,False);drone(B["guerra"],EV["surrender"],0.35)
q=0.5
for k,tm in enumerate(np.arange(B["guerra"]+0.3,EV["battle"]+3.6,q)):drum(tm,0.55,62,6);drum(tm+q*0.5,0.25,80,12) if k%2 else None
snare_roll(EV["battle"]-1.2,EV["battle"],0.25)
for i,c in enumerate(EV["cannons"]):boom(c,0.9,[-.6,.5,-.2,.7,-.5,.2][i])
crackle(EV["battle"],EV["battle"]+3.6,0.5)
chime(EV["surrender"],0.5);pad(EV["surrender"],B["villa"]+1,0.18)
whoosh(B["villa"],0.4);baiao(B["villa"]+0.2,B["hoy"]-0.2,0.38)
for h in EV["houses"]:hammer(h,0.22,rng.uniform(-.6,.6));pluck(h+0.05,784,0.15,0.8,0.3)
whoosh(B["hoy"],0.5)
for i,f in enumerate(EV["fireworks"]):firework(f,0.45,[-.6,.4,-.2,.7,0,-.5,.5][i%7])
baiao(B["hoy"]+0.2,end,0.42);ocean(B["fin"]-0.3,end,0.25)
boom(end-1.6,0.2);bell(end-1.55,0.2,523,0)
# master
st=np.stack([L,Rr],1);st=np.tanh(st/ (np.abs(st).max()/1.6+1e-9))*0.85
st=np.clip(st,-1,1);x=(st*32767).astype(np.int16)
w=wave.open("ep2/sfx.wav","wb");w.setnchannels(2);w.setsampwidth(2);w.setframerate(R);w.writeframes(x.tobytes());w.close()
print("sfx ok",round(N/R,1))
