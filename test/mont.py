from PIL import Image
import sys
def mont(names,out,cols=2,w=620):
    ims=[Image.open(n+'.png').convert('RGB') for n in names]
    h=int(ims[0].height*w/ims[0].width)
    rows=(len(ims)+cols-1)//cols
    M=Image.new('RGB',(w*cols,h*rows))
    for i,im in enumerate(ims): M.paste(im.resize((w,h)),((i%cols)*w,(i//cols)*h))
    M.save(out)
a=sys.argv[1:]
mont(a[1:],a[0])
