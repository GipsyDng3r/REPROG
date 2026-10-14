from PIL import Image
import numpy as np, base64, io, json, trimesh
from scipy import ndimage
from skimage import measure
d=np.load('masks.npz'); F,S,B=d['F'],d['S'],d['B']; fcx,bcx,scz=float(d['fcx']),float(d['bcx']),float(d['scz'])
H0,H1=12,665; HS=float(H1-H0)
Hh=F.shape[0]
# B aligné sur F (miroir)
Bm=B[:,::-1]; shift=int(round(fcx-((B.shape[1]-1)-bcx))); Bm=np.roll(Bm,shift,axis=1)
Bm=np.pad(Bm,((0,0),(0,max(0,F.shape[1]-Bm.shape[1]))))[:, :F.shape[1]]
Fi=F&Bm
DS=2
f=Fi[::DS,::DS]; s=S[::DS,::DS]
Y,X=f.shape; Z=s.shape[1]
vol=f[:,:,None] & s[:,None,:]
# étroitesse des bras : hors du tronc, z limité autour du centre
xs=(np.arange(X)*DS-fcx)  # px relatif axe
ys=(np.arange(Y)*DS)
armzone=(np.abs(xs)[None,:]>72)&(ys[:,None]>150)&(ys[:,None]<460)
zc=scz/DS; zz=np.arange(Z)
band=(np.abs(zz-zc)<9)  # ~18 px d'épaisseur de bras
vol=np.where(armzone[:,:,None], vol & band[None,None,:], vol)
vf=ndimage.gaussian_filter(vol.astype(np.float32),1.1)
vf=np.pad(vf,1)
v,fa,nr,_=measure.marching_cubes(vf,0.5,step_size=1)
v=v-1  # retire pad
mesh=trimesh.Trimesh(v,fa,process=True)
print('raw',len(mesh.vertices),len(mesh.faces))
mesh=mesh.simplify_quadric_decimation(face_count=38000)
mesh=trimesh.smoothing.filter_taubin(mesh,iterations=6) or mesh
print('dec',len(mesh.vertices),len(mesh.faces))
V=np.array(mesh.vertices); Fc=np.array(mesh.faces)
# px coords
ypx=V[:,0]*DS; xpx=V[:,1]*DS; zpx=V[:,2]*DS
Xm=(xpx-fcx)/HS; Ym=(H1-ypx)/HS; Zm=(scz-zpx)/HS
vn=trimesh.Trimesh(np.c_[Xm,Ym,Zm],Fc,process=False)
c0=np.array(vn.vertices).mean(0)
sgn=np.mean(np.sum(vn.face_normals*(vn.triangles_center-c0),axis=1))
print('outward sign',sgn)
if sgn<0:
    Fc=Fc[:,::-1]; vn=trimesh.Trimesh(np.c_[Xm,Ym,Zm],Fc,process=False)
fn=vn.face_normals; vnorm=vn.vertex_normals
# vue par face
view=np.zeros(len(Fc),dtype=np.uint8)  # 0 face,1 dos,2 côté+,3 côté-
for i,n in enumerate(fn):
    if abs(n[0])>abs(n[2])*1.0: view[i]=2 if n[0]>0 else 3
    else: view[i]=0 if n[2]>0 else 1
print('views',np.bincount(view))
# atlas
cells={'front':(0,440),'back':(440,430),'side':(870,230)}
AW,AH=1100,672
atlas=np.zeros((AH,AW,3),np.uint8)
for k,(x0,w) in cells.items():
    a=np.array(Image.open(k+'_cut.png').convert('RGBA'))
    op=a[:,:,3]>110
    idx=ndimage.distance_transform_edt(~op,return_distances=False,return_indices=True)
    rgb=a[:,:,:3][idx[0],idx[1]]
    atlas[:, x0:x0+w]=rgb[:,:w]
Image.fromarray(atlas).save('atlas.png')
def uv(vi,vw):
    x,y,z=xpx[vi],ypx[vi],zpx[vi]
    if vw==0: px=x
    elif vw==1: px=bcx-(x-fcx)
    elif vw==2: px=z
    else: px=2*scz-z
    x0={0:0,1:440,2:870,3:870}[vw]
    return (x0+px)/AW, y/AH
pairs={}; P=[];UV=[];N=[];IDX=[]
for fi,tri in enumerate(Fc):
    vw=int(view[fi])
    for vi in tri:
        key=(int(vi),vw)
        if key not in pairs:
            pairs[key]=len(P)
            # pose : calculé après, positions d'origine
            P.append([Xm[vi],Ym[vi],Zm[vi]]); UV.append(uv(vi,vw)); N.append(vnorm[vi])
        IDX.append(pairs[key])
P=np.array(P);UV=np.clip(np.array(UV),0,1);N=np.array(N);IDX=np.array(IDX)
print('pairs',len(P))
# pose des bras (A-pose -> bras le long du corps)
sx=62/HS; sy=(H1-168)/HS
for sign in (-1,1):
    sel=(sign*P[:,0]>sx*1.0)&(P[:,1]>(H1-470)/HS)
    px=sign*P[:,0]; dx=px-sx
    w=np.clip(dx/(14/HS),0,1); w=w*w*(3-2*w)
    ang=np.deg2rad(36)*w*sign*-1  # gauche (x<0): rotation anti-horaire
    # rotation autour du pivot (sign*sx, sy) dans le plan XY
    c=np.cos(ang); s_=np.sin(ang)
    rx=P[:,0]-sign*sx; ry=P[:,1]-sy
    nx=rx*c-ry*s_; ny=rx*s_+ry*c
    m=sel
    P[m,0]=(nx+sign*sx)[m]; P[m,1]=(ny+sy)[m]
    nxx=N[:,0]*c-N[:,1]*s_; nyy=N[:,0]*s_+N[:,1]*c
    N[m,0]=nxx[m]; N[m,1]=nyy[m]
print('bbox',P.min(0),P.max(0))
def b64(a): return base64.b64encode(a.tobytes()).decode()
out=dict(n=len(P),f=len(IDX)//3,
  pos=b64((P*12000).round().astype(np.int16)),uv=b64((UV*65535).round().astype(np.uint16)),
  nor=b64((np.clip(N,-1,1)*127).round().astype(np.int8)),
  idx=b64(IDX.astype(np.uint16 if len(P)<65535 else np.uint32)),idx32=bool(len(P)>=65535))
buf=io.BytesIO(); Image.fromarray(atlas).save(buf,'WEBP',quality=88,method=6)
out['atlas']='data:image/webp;base64,'+base64.b64encode(buf.getvalue()).decode()
open('../src/miyako3d.js','w').write('const M3D = '+json.dumps(out)+';\n')
print('KB',len(json.dumps(out))//1024)
