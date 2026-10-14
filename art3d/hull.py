from PIL import Image
import numpy as np
from scipy import ndimage
def mask(k):
    a=np.array(Image.open(k+'_cut.png'))[:,:,3]>110
    a=ndimage.binary_opening(a,iterations=1); a=ndimage.binary_fill_holes(a)
    lab,n=ndimage.label(a); sz=ndimage.sum(a,lab,range(1,n+1)); return lab==(1+int(np.argmax(sz)))
F,S,B=mask('front'),mask('side'),mask('back')
H=F.shape[0]
def cx(m,y0,y1): xs=np.where(m[y0:y1].any(0))[0]; return (xs.min()+xs.max())/2
# axes
fcx=cx(F,360,600); bcx=cx(B,360,600)
# side: bords du corps aux hanches (y 330-420)
scz=cx(S,340,420)
print('axes',fcx,bcx,scz)
# alignement back
Bf=np.zeros_like(F)
sh=int(round(fcx-(2*bcx-bcx)))  # placeholder
Bm=B[:,::-1]; bcx_m=(B.shape[1]-1)-bcx
shift=int(round(fcx-bcx_m)); Bm2=np.roll(Bm,shift,axis=1)
w=min(F.shape[1],Bm2.shape[1]); Fm=F[:,:w]; Bm2=Bm2[:,:w]
print('iou front/back',(Fm&Bm2).sum()/(Fm|Bm2).sum())
np.savez('masks.npz',F=F,S=S,B=B,fcx=fcx,bcx=bcx,scz=scz)
