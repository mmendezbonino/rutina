import bpy, bmesh, math, sys
from mathutils import Vector
OUT=sys.argv[-1]
bpy.ops.wm.read_factory_settings(use_empty=True)
sc=bpy.context.scene
def T(x,y,z): return Vector((x,-z,y))   # coords de la app (y arriba, z adelante) -> Blender
def mat(name,col,met,rough):
    m=bpy.data.materials.new(name); m.use_nodes=True; b=m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value=(*col,1); b.inputs['Metallic'].default_value=met; b.inputs['Roughness'].default_value=rough; return m
M={'paint':mat('paint',(0.36,0.375,0.40),0.6,0.34),'chrome':mat('chrome',(0.80,0.80,0.82),1.0,0.14),'pad':mat('pad',(0.018,0.019,0.021),0.0,0.55),
   'rubber':mat('rubber',(0.012,0.012,0.013),0.0,0.85),'plate':mat('plate',(0.02,0.021,0.023),0.2,0.42),'red':mat('red',(0.55,0.02,0.02),0.1,0.35),'dark':mat('dark',(0.06,0.065,0.07),0.6,0.4)}
objs={}
def add(o,m,group):
    o.data.materials.append(M[m]); objs.setdefault(group,[]).append(o); return o
def bevel(o,w,seg=3):
    md=o.modifiers.new('b','BEVEL'); md.width=w; md.segments=seg; md.limit_method='ANGLE'; md.harden_normals=False
    return o
def smooth(o):
    for p in o.data.polygons: p.use_smooth=True
def box(c,s,m,b=.006,group='frame',sub=0):
    bpy.ops.mesh.primitive_cube_add(size=1,location=T(*c)); o=bpy.context.object; o.scale=(s[0],s[2],s[1])
    bpy.ops.object.transform_apply(scale=True); bevel(o,b,3 if b<.02 else 6)
    if sub: md=o.modifiers.new('s','SUBSURF'); md.levels=sub; md.render_levels=sub
    smooth(o); return add(o,m,group)
def cyl(a,b,r,m,group='frame',v=32,cap_b=.003):
    a,b=T(*a),T(*b); d=b-a
    bpy.ops.mesh.primitive_cylinder_add(vertices=v,radius=r,depth=d.length,location=(a+b)/2); o=bpy.context.object
    o.rotation_mode='QUATERNION'; o.rotation_quaternion=Vector((0,0,1)).rotation_difference(d.normalized())
    bpy.ops.object.transform_apply(rotation=True); bevel(o,cap_b,2); smooth(o); return add(o,m,group)
def tube(a,b,s,m='paint',group='frame'):  # tubo cuadrado entre dos puntos alineados a un eje
    c=[(a[i]+b[i])/2 for i in range(3)]; sz=[abs(a[i]-b[i]) or s for i in range(3)]
    sz=[max(x,s) for x in sz]; return box(c,sz,m,.008,group)
# ---- base ----
for x in (-.32,.32):
    tube((x,.035,-.86),(x,.035,.38),.07)
    for z in (-.86,.38): box((x,.006,z),(.11,.012,.09),'rubber',.004)
for z in (-.86,-.36,.30): tube((-.32,.035,z),(.32,.035,z),.07)
# ---- asiento ----
tube((0,.07,.02),(0,.31,.02),.065)
box((0,.30,.02),(.05,.20,.05),'chrome',.004)
cyl((0,.25,.055),(0,.25,.11),.009,'chrome'); 
bpy.ops.mesh.primitive_uv_sphere_add(radius=.018,location=T(0,.25,.115)); o=bpy.context.object; smooth(o); add(o,'red','frame')
box((0,.405,.02),(.34,.02,.34),'paint',.004)
box((0,.445,.02),(.40,.07,.40),'pad',.03,sub=1)
# ---- respaldo ----
box((0,.86,-.17),(.40,.72,.07),'pad',.03,sub=1)
box((0,.86,-.215),(.30,.60,.02),'paint',.004)
for y in (.62,1.10): tube((0,y,-.225),(0,y,-.36),.05)
# ---- columna y brazo superior ----
tube((0,.07,-.36),(0,1.66,-.36),.11)
tube((0,1.64,-.36),(0,1.64,.04),.09)
tube((-.25,1.64,-.01),(.25,1.64,-.01),.08)
for s in (-1,1):
    box((s*.12,1.56,-.33),(.012,.14,.12),'paint',.003)  # escuadras
    cyl((s*.21,1.60,-.01),(s*.21,1.685,-.01),.05,'paint')
    cyl((s*.21,1.575,-.01),(s*.21,1.60,-.01),.032,'dark')
# ---- torre de pesas (fija) ----
Z=-.62
box((0,.03,Z),(.46,.06,.26),'paint',.006)
for s in (-1,1):
    tube((s*.215,.06,Z),(s*.215,1.92,Z),.05)
    cyl((s*.11,.06,Z),(s*.11,1.86,Z),.0095,'chrome')
    box((s*.11,.07,Z),(.04,.02,.04),'rubber',.004)
box((0,1.90,Z),(.48,.07,.24),'paint',.008)
cyl((-.04,1.97,Z),(.04,1.97,Z),.05,'dark'); 
tube((0,1.66,-.36),(0,1.66,Z+.1),.06)
cyl((0,1.95,Z+.05),(0,1.70,-.28),.004,'dark',8)
# ---- piezas que se mueven (se clonan en la app) ----
bpy.ops.mesh.primitive_cube_add(size=1,location=(0,0,0)); o=bpy.context.object; o.scale=(.30,.13,.033); bpy.ops.object.transform_apply(scale=True); bevel(o,.004,2); smooth(o); add(o,'plate','plate')
cyl((0,0,.035),(0,0,.075),.012,'chrome','plate',16)
# empuñadura de goma con anillos, eje y, centro en 0
bpy.ops.mesh.primitive_cylinder_add(vertices=32,radius=.021,depth=.22,location=(0,0,0)); o=bpy.context.object
bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT'); bpy.ops.mesh.subdivide(number_cuts=20); bpy.ops.object.mode_set(mode='OBJECT')
for v in o.data.vertices:
    rr=math.hypot(v.co.x,v.co.y)
    if rr>.015:
        k=1+.07*math.cos(v.co.z/.22*20*math.pi)*(1 if abs(v.co.z)<.1 else 0); v.co.x*=k; v.co.y*=k
bevel(o,.004,3); smooth(o); add(o,'rubber','grip')
# eje del pivote (cubo)
cyl((0,-.03,0),(0,.03,0),.04,'paint','hub'); cyl((0,-.045,0),(0,-.03,0),.025,'chrome','hub')
for g,lst in objs.items():
    for o in lst:
        bpy.context.view_layer.objects.active=o
        for md in list(o.modifiers): bpy.ops.object.modifier_apply(modifier=md.name)
        bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.ops.object.shade_smooth_by_angle(angle=math.radians(35))
    bpy.ops.object.select_all(action='DESELECT')
    # unir por material dentro del grupo
    bymat={}
    for o in lst: bymat.setdefault(o.data.materials[0].name,[]).append(o)
    for mn,os_ in bymat.items():
        bpy.ops.object.select_all(action='DESELECT')
        for o in os_: o.select_set(True)
        bpy.context.view_layer.objects.active=os_[0]; bpy.ops.object.join(); os_[0].name=f'{g}_{mn}'
bpy.ops.export_scene.gltf(filepath=OUT,export_format='GLB',export_yup=True,export_apply=True,export_materials='EXPORT',export_normals=True)
print('ok')
