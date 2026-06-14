#!/usr/bin/env python3
"""Generate playful patterned sock SVGs for the Oddpeel shop."""
import os, math

SOCK = ("M150 28 L214 28 L214 180 "
        "C214 214 208 236 194 248 "
        "C182 258 158 262 120 262 L70 262 "
        "C44 262 34 252 34 234 "
        "C34 218 44 210 66 207 L128 199 "
        "C144 197 150 192 150 170 Z")

def header(i):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 248 300" role="img" aria-label="Oddpeel sock">\n'
            f'<defs><clipPath id="s{i}"><path d="{SOCK}"/></clipPath></defs>\n')

def base(i, color):
    return f'<path d="{SOCK}" fill="{color}"/>\n<g clip-path="url(#s{i})">\n'

def accents(cuff, heel, toe):
    s = ''
    # cuff band
    s += f'<rect x="140" y="22" width="84" height="42" fill="{cuff}"/>\n'
    for x in range(150, 215, 8):
        s += f'<line x1="{x}" y1="24" x2="{x}" y2="62" stroke="rgba(0,0,0,.12)" stroke-width="2"/>\n'
    # heel
    s += f'<path d="M214 188 C214 220 206 240 192 250 C176 246 168 232 168 214 C168 198 182 188 214 188 Z" fill="{heel}"/>\n'
    # toe
    s += f'<path d="M70 262 C44 262 34 252 34 234 C34 220 42 212 58 208 C66 224 70 244 70 262 Z" fill="{toe}"/>\n'
    return s

def close(outline='#1b1b1b'):
    return f'</g>\n<path d="{SOCK}" fill="none" stroke="{outline}" stroke-width="6" stroke-linejoin="round"/>\n</svg>\n'

def stripes(c):
    s=''
    for y in range(64, 210, 22):
        s += f'<rect x="120" y="{y}" width="110" height="11" fill="{c}"/>\n'
    return s

def dots(c, c2=None):
    s=''; row=0
    for y in range(78, 270, 26):
        off = 0 if row%2==0 else 13
        for x in range(20, 240, 26):
            col = c if (row+ x//26)%2==0 or c2 is None else c2
            s += f'<circle cx="{x+off}" cy="{y}" r="7" fill="{col}"/>\n'
        row+=1
    return s

def leopard(spot, ring):
    pts=[(170,90),(195,130),(160,150),(120,210),(70,240),(95,180),(55,210),(185,200),(140,110),(110,160)]
    s=''
    for (x,y) in pts:
        s += f'<circle cx="{x}" cy="{y}" r="13" fill="none" stroke="{ring}" stroke-width="6"/>\n'
        s += f'<circle cx="{x}" cy="{y}" r="6" fill="{spot}"/>\n'
    return s

def rainbow(colors):
    s=''
    cx, cy = 60, 245
    r = 150
    for col in colors:
        s += (f'<path d="M{cx-r} {cy} A{r} {r} 0 0 1 {cx+r} {cy}" fill="none" '
              f'stroke="{col}" stroke-width="12"/>\n')
        r -= 13
    return s

def checker(c):
    s=''; row=0
    for y in range(64, 270, 24):
        for x in range(20, 240, 24):
            if (row + x//24)%2==0:
                s += f'<rect x="{x}" y="{y}" width="24" height="24" fill="{c}"/>\n'
        row+=1
    return s

def hearts(c):
    s=''; row=0
    for y in range(78, 260, 34):
        off = 0 if row%2==0 else 18
        for x in range(30, 240, 36):
            s += (f'<path d="M{x+off} {y+10} c-6 -12 -22 -8 -22 4 c0 10 14 18 22 24 '
                  f'c8 -6 22 -14 22 -24 c0 -12 -16 -16 -22 -4 z" fill="{c}"/>\n')
        row+=1
    return s

def stars(c):
    def star(cx,cy,r):
        p=[]
        for k in range(10):
            ang=-math.pi/2 + k*math.pi/5
            rr=r if k%2==0 else r*0.45
            p.append(f'{cx+rr*math.cos(ang):.1f},{cy+rr*math.sin(ang):.1f}')
        return f'<polygon points="{" ".join(p)}" fill="{c}"/>\n'
    s=''; row=0
    for y in range(80, 260, 38):
        off=0 if row%2==0 else 20
        for x in range(35,240,40):
            s+=star(x+off,y,11)
        row+=1
    return s

# id, filename, base, cuff, heel, toe, pattern-fn
SOCKS = [
 (1,'sock-banana-split','#2FB6E8','#E8412F','#E8412F','#E8412F', lambda: stripes('#FFFFFF')),
 (2,'sock-disco-dots','#FF6FB5','#FFD23F','#2FB6E8','#2FB6E8', lambda: dots('#FFD23F','#FFFFFF')),
 (3,'sock-leopard-happy','#FF8DC7','#1b1b1b','#1b1b1b','#1b1b1b', lambda: leopard('#7A2E5A','#5A1F44')),
 (4,'sock-rainbow-riot','#2FB6E8','#FF6FB5','#FFD23F','#FF6FB5', lambda: rainbow(['#E8412F','#FF8A3D','#FFD23F','#3DBE6B','#2FB6E8','#7A5CFF'])),
 (5,'sock-checker-pop','#FFF3D6','#E8412F','#E8412F','#E8412F', lambda: checker('#E8412F')),
 (6,'sock-love-bug','#FFD23F','#FF6FB5','#E8412F','#E8412F', lambda: hearts('#E8412F')),
 (7,'sock-star-power','#1b1b1b','#FFD23F','#FF6FB5','#FFD23F', lambda: stars('#FFD23F')),
 (8,'sock-cheese-dream','#FFD23F','#E8412F','#2FB6E8','#2FB6E8', lambda: dots('#F2A900')),
]

out = os.path.dirname(os.path.abspath(__file__))
sockdir = os.path.join(out, 'socks')
os.makedirs(sockdir, exist_ok=True)
for (i,name,b,cuff,heel,toe,fn) in SOCKS:
    svg = header(i) + base(i,b) + fn() + accents(cuff,heel,toe) + close()
    with open(os.path.join(sockdir, name+'.svg'),'w') as f:
        f.write(svg)
    print('wrote', name)
print('done')
