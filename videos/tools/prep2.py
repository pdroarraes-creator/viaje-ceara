import cv2, numpy as np
SRC="/home/claude/viaje-ceara/videos/ep01/";O="ep2/img/";S=1440
def load(n):
    im=cv2.imread(SRC+n);return cv2.resize(im,(S,S),interpolation=cv2.INTER_CUBIC)
def box(n):x0,y0,x1,y1=n;return int(x0*S),int(y0*S),int(x1*S),int(y1*S)
def sprite(im,b,feather=0.18,ellipse=True):
    x0,y0,x1,y1=box(b);c=im[y0:y1,x0:x1].copy();h,w=c.shape[:2]
    m=np.zeros((h,w),np.float32)
    if ellipse:cv2.ellipse(m,(w//2,h//2),(int(w*(0.5-feather/2)),int(h*(0.5-feather/2))),0,0,360,1,-1)
    else:m[int(h*feather/2):h-int(h*feather/2),int(w*feather/2):w-int(w*feather/2)]=1
    m=cv2.GaussianBlur(m,(0,0),max(w,h)*feather/3)
    rgba=np.dstack([c,(np.clip(m,0,1)*255).astype(np.uint8)]);return rgba
def inpaint(im,boxes,pad=4):
    m=np.zeros(im.shape[:2],np.uint8)
    for b in boxes:x0,y0,x1,y1=box(b);m[y0-pad:y1+pad,x0-pad:x1+pad]=255
    return cv2.inpaint(im,m,9,cv2.INPAINT_TELEA)
def ink(im):
    g=cv2.cvtColor(im,cv2.COLOR_BGR2GRAY);e=cv2.adaptiveThreshold(cv2.GaussianBlur(g,(3,3),0),255,cv2.ADAPTIVE_THRESH_MEAN_C,cv2.THRESH_BINARY,15,9)
    dark=(g<80).astype(np.uint8)*255;out=cv2.bitwise_and(e,255-dark)
    paper=np.full_like(im,(214,233,244));inkc=np.array((40,30,30),np.uint8)
    r=paper.copy();r[out==0]=inkc
    # hachura leve nas sombras
    yy,xx=np.mgrid[0:S,0:S];hatch=((xx+yy)%7==0)&(g<140);r[hatch]=inkc
    return r
for n in range(1,7):
    im=load(f"cena{n}.jpg");cv2.imwrite(O+f"c{n}.jpg",im,[cv2.IMWRITE_JPEG_QUALITY,90]);cv2.imwrite(O+f"c{n}_ink.jpg",ink(im),[cv2.IMWRITE_JPEG_QUALITY,88])
# navios (cena2)
im=load("cena2.jpg");B1=(0.04,0.24,0.38,0.80);B2=(0.42,0.31,0.67,0.71)
cv2.imwrite(O+"ship1.png",sprite(im,B1));cv2.imwrite(O+"ship2.png",sprite(im,B2))
cv2.imwrite(O+"c2_bg.jpg",inpaint(im,[(0.07,0.30,0.35,0.76),(0.45,0.34,0.64,0.68)],0),[cv2.IMWRITE_JPEG_QUALITY,90])
# bandeira holandesa (cena3)
im=load("cena3.jpg");F=(0.387,0.405,0.485,0.485)
cv2.imwrite(O+"flagNL.png",sprite(im,F,0.06,False));cv2.imwrite(O+"c3_bg.jpg",inpaint(im,[F],3),[cv2.IMWRITE_JPEG_QUALITY,90])
# bandeira portuguesa (cena4)
im=load("cena4.jpg");F=(0.405,0.335,0.48,0.405)
cv2.imwrite(O+"flagPT.png",sprite(im,F,0.06,False));cv2.imwrite(O+"c4_bg.jpg",inpaint(im,[F],3),[cv2.IMWRITE_JPEG_QUALITY,90])
# retratos
for n in ("castanha-pessoa","caju-pessoa"):
    p=cv2.imread(SRC+n+".jpg");cv2.imwrite(O+n+".jpg",cv2.resize(p,(512,512),interpolation=cv2.INTER_AREA),[cv2.IMWRITE_JPEG_QUALITY,90])
print("ok")
