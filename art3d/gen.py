import sys, numpy as np, base64, io, json, trimesh
from PIL import Image
from scipy import ndimage
from skimage import measure
from rembg import remove, new_session
import os
YMIN=int(os.environ.get('YMIN',150));YMAX=int(os.environ.get('YMAX',460))
name,src,narrow,pose,sx_px,thr=sys.argv[1],sys.argv[2],sys.argv[3]=='1',sys.argv[4]=='1',float(sys.argv[5]),float(sys.argv[6])
U='/root/.claude/uploads/299f5730-fc5a-5c54-9239-4dd558e7c5ad/'
im=Image.open(U+src).convert('RGB'); sess=new_session('isnet-anime')
panels={'front':(85,80,525,752),'side':(625,80,855,752),'back':(915,80,1345,752)}
cuts={}
for k,b in panels.items():
    o=remove(im.crop(b),session=sess); o.save(f'{name}_{k}_cut.png'); cuts[k]=o
def mask(o):
    a=np.array(o)[:,:,3]>110; a=ndimage.binary_opening(a); a=ndimage.binary_fill_holes(a)
    lab,n=ndimage.label(a); sz=ndimage.sum(a,lab,range(1,n+1)); return lab==(1+int(np.argmax(sz)))
F,S,B=mask(cuts['front']),mask(cuts['side']),mask(cuts['back'])
H1=int(np.where(F.any(1))[0].max()); HS=653.0
def cxr(m,y0,y1): xs=np.where(m[y0:y1].any(0))[0]; return (xs.min()+xs.max())/2
fcx=cxr(F,H1-70,H1-5); bcx=cxr(B,H1-70,H1-5); scz=cxr(S,H1-70,H1-5) if name=='aira' else cxr(S,340,420)
print(name,'axes',fcx,bcx,scz,'H1',H1)
Bm=B[:,::-1]; shift=int(round(fcx-((B.shape[1]-1)-bcx))); Bm=np.roll(Bm,shift,axis=1); Bm=np.pad(Bm,((0,0),(0,max(0,F.shape[1]-Bm.shape[1]))))[:,:F.shape[1]]
Fi=F&Bm if name!='aira' else (F|Bm)&(F|Bm)
DS=2; f=Fi[::DS,::DS]; s=S[::DS,::DS]; Y,X=f.shape; Z=s.shape[1]
vol=f[:,:,None]&s[:,None,:]
if narrow:
    xs=np.arange(X)*DS-fcx; ys=np.arange(Y)*DS
    az=(np.abs(xs)[None,:]>thr)&(ys[:,None]>YMIN)&(ys[:,None]<YMAX); zc=scz/DS
    vol=np.where(az[:,:,None],vol&(np.abs(np.arange(Z)-zc)<9)[None,None,:],vol)
vf=np.pad(ndimage.gaussian_filter(vol.astype(np.float32),1.1),1)
v,fa,_,_=measure.marching_cubes(vf,0.5); v-=1
mesh=trimesh.Trimesh(v,fa,process=True).simplify_quadric_decimation(face_count=38000)
mesh=trimesh.smoothing.filter_taubin(mesh,iterations=6) or mesh
V=np.array(mesh.vertices);Fc=np.array(mesh.faces)
ypx,xpx,zpx=V[:,0]*DS,V[:,1]*DS,V[:,2]*DS
Xm,Ym,Zm=(xpx-fcx)/HS,(H1-ypx)/HS,(scz-zpx)/HS
vn=trimesh.Trimesh(np.c_[Xm,Ym,Zm],Fc,process=False)
if np.mean(np.sum(vn.face_normals*(vn.triangles_center-vn.vertices.mean(0)),axis=1))<0:
    Fc=Fc[:,::-1]; vn=trimesh.Trimesh(np.c_[Xm,Ym,Zm],Fc,process=False)
fn=vn.face_normals; vnorm=vn.vertex_normals
view=np.array([ (2 if n[0]>0 else 3) if abs(n[0])>abs(n[2]) else (0 if n[2]>0 else 1) for n in fn],dtype=np.uint8)
cells={'front':(0,440),'back':(440,430),'side':(870,230)}; AW,AH=1100,672
atlas=np.zeros((AH,AW,3),np.uint8)
for k,(x0,w) in cells.items():
    a=np.array(cuts[k].convert('RGBA')); op=a[:,:,3]>110
    idx=ndimage.distance_transform_edt(~op,return_distances=False,return_indices=True)
    atlas[:,x0:x0+w]=a[:,:,:3][idx[0],idx[1]][:,:w]
def uv(vi,vw):
    x,y,z=xpx[vi],ypx[vi],zpx[vi]
    px=[x,bcx-(x-fcx),z,2*scz-z][vw]; return ({0:0,1:440,2:870,3:870}[vw]+px)/AW,y/AH
pairs={};P=[];UV=[];N=[];IDX=[]
for fi,tri in enumerate(Fc):
    vw=int(view[fi])
    for vi in tri:
        k=(int(vi),vw)
        if k not in pairs: pairs[k]=len(P);P.append([Xm[vi],Ym[vi],Zm[vi]]);UV.append(uv(vi,vw));N.append(vnorm[vi])
        IDX.append(pairs[k])
P=np.array(P);UV=np.clip(np.array(UV),0,1);N=np.array(N);IDX=np.array(IDX)
if pose:
    sx=sx_px/HS; sy=(H1-168)/HS
    for sign in (-1,1):
        sel=(sign*P[:,0]>sx)&(P[:,1]>(H1-470)/HS); dx=sign*P[:,0]-sx
        w=np.clip(dx/(14/HS),0,1); w=w*w*(3-2*w); ang=np.deg2rad(36)*w*-sign
        c,s_=np.cos(ang),np.sin(ang); rx=P[:,0]-sign*sx; ry=P[:,1]-sy
        nx=rx*c-ry*s_; ny=rx*s_+ry*c; P[sel,0]=(nx+sign*sx)[sel]; P[sel,1]=(ny+sy)[sel]
        nxx=N[:,0]*c-N[:,1]*s_; nyy=N[:,0]*s_+N[:,1]*c; N[sel,0]=nxx[sel]; N[sel,1]=nyy[sel]
b64=lambda a: base64.b64encode(a.tobytes()).decode()
out=dict(n=len(P),pos=b64((P*12000).round().astype(np.int16)),uv=b64((UV*65535).round().astype(np.uint16)),nor=b64((np.clip(N,-1,1)*127).round().astype(np.int8)),idx=b64(IDX.astype(np.uint16 if len(P)<65535 else np.uint32)),idx32=bool(len(P)>=65535))
buf=io.BytesIO(); Image.fromarray(atlas).save(buf,'WEBP',quality=88,method=6); out['atlas']='data:image/webp;base64,'+base64.b64encode(buf.getvalue()).decode()
open(f'../src/{name}3d.js','w').write(f'const M3D_{name} = '+json.dumps(out)+';\n')
print(name,'pairs',len(P),'bbox',P.min(0).round(2),P.max(0).round(2),'KB',len(json.dumps(out))//1024)
