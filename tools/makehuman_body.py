import sys, bpy, addon_utils, bmesh
bpy.ops.wm.read_factory_settings(use_empty=True)
addon_utils.enable('bl_ext.user_default.mpfb', default_set=True)
from bl_ext.user_default.mpfb.services.humanservice import HumanService
from bl_ext.user_default.mpfb.services.targetservice import TargetService
macro={"gender":1.0,"age":0.5,"muscle":float(sys.argv[-3]),"weight":float(sys.argv[-2]),"proportions":1.0,"height":0.57,"cupsize":0.5,"firmness":0.5,"race":{"asian":0.0,"caucasian":1.0,"african":0.0}}
h=HumanService.create_human(mask_helpers=True,detailed_helpers=False,extra_vertex_groups=True,feet_on_ground=False,scale=0.1,macro_detail_dict=macro)
TD='/home/claude/mh/mpfb2/src/mpfb/data/targets/'
EX={'torso/torso-muscle-dorsi-incr':1,'torso/torso-muscle-pectoral-incr':1,'torso/torso-vshape-incr':.7,'stomach/stomach-tone-incr':1,'torso/measure-waist-circ-decr':.5,'torso/measure-shoulder-dist-incr':.35,
 'neck/measure-neck-circ-incr':.5,'buttocks/buttocks-volume-incr':.3}
for sd in 'lr':
    EX.update({f'arms/{sd}-upperarm-muscle-incr':1,f'arms/{sd}-upperarm-shoulder-muscle-incr':1,f'arms/{sd}-lowerarm-muscle-incr':.8,f'legs/{sd}-upperleg-muscle-incr':1,f'legs/{sd}-lowerleg-muscle-incr':.8,
               f'arms/{sd}-upperarm-fat-decr':.6,f'legs/{sd}-upperleg-fat-decr':.5})
import os
for k,w in EX.items():
    f=TD+k+'.target.gz'
    if os.path.exists(f): TargetService.load_target(h,f,weight=w)
    else: print('missing',k)
print('human',h.name,len(h.data.vertices), [g.name for g in h.vertex_groups][:30])
rig=HumanService.add_builtin_rig(h,'game_engine',import_weights=True)
print('rig',rig.name,len(rig.data.bones))
# aplicar shape keys
bpy.context.view_layer.objects.active=h
if h.data.shape_keys:
    h.shape_key_add(name='mix',from_mix=True)
    for kb in list(h.data.shape_keys.key_blocks)[:-1]: h.shape_key_remove(kb)
    h.shape_key_remove(h.data.shape_keys.key_blocks[0])
# borrar geometría auxiliar
bm=bmesh.new(); bm.from_mesh(h.data); dl=bm.verts.layers.deform.active
body=h.vertex_groups.get('body')
kill=[v for v in bm.verts if not (body and body.index in v[dl] and v[dl][body.index]>0.5)]
bmesh.ops.delete(bm,geom=kill,context='VERTS'); bm.to_mesh(h.data); bm.free()
for md in list(h.modifiers):
    if md.type!='ARMATURE': h.modifiers.remove(md)
# dejar solo grupos de huesos
bn=set(b.name for b in rig.data.bones)
for g in list(h.vertex_groups):
    if g.name not in bn: h.vertex_groups.remove(g)
for b in rig.data.bones:
    if b.name=='head': b.name='Head'
bpy.context.view_layer.objects.active=rig; bpy.ops.object.mode_set(mode='EDIT')
eb=rig.data.edit_bones
for side in 'lr':
    for f in ('index','middle','ring','pinky','thumb'):
        p=eb[f'{f}_03_{side}']; n=eb.new(f'{f}_04_leaf_{side}'); d=p.tail-p.head; n.head=p.tail; n.tail=p.tail+d*.5; n.parent=p; n.roll=p.roll
    p=eb[f'ball_{side}']; n=eb.new(f'ball_leaf_{side}'); d=p.tail-p.head; n.head=p.tail; n.tail=p.tail+d*.5; n.parent=p
bpy.ops.object.mode_set(mode='OBJECT')
for p in h.data.polygons: p.use_smooth=True
h.name='Body'; h.data.name='Body'
m=bpy.data.materials.new('MI_Body'); m.use_nodes=True; h.data.materials.clear(); h.data.materials.append(m)
import mathutils
# pesos de los dedos: cada vértice sigue a la falange más cercana (sin estirarse entre huesos)
def seg_d(p,a,b):
    ab=b-a; t=max(0,min(1,(p-a).dot(ab)/max(ab.length_squared,1e-9))); return (a+ab*t-p).length, t
for sd in 'lr':
    names=[f'hand_{sd}']+[f'{f}_{k}_{sd}' for f in ('index','middle','ring','pinky','thumb') for k in ('01','02','03')]
    segs={n:(rig.matrix_world@rig.data.bones[n].head_local, rig.matrix_world@rig.data.bones[n].tail_local) for n in names}
    gi={n:h.vertex_groups[n].index for n in names if n in h.vertex_groups}
    fset=set(gi[n] for n in names[1:] if n in gi)
    for v in h.data.vertices:
        fw=sum(e.weight for e in v.groups if e.group in fset)
        if fw<.02: continue
        co=h.matrix_world@v.co
        ds=sorted((seg_d(co,*segs[n])[0],n) for n in names[1:])
        d1,n1=ds[0]; d2,n2=ds[1]
        # zona de transición sólo entre falanges vecinas del mismo dedo
        same=n1.split('_')[0]==n2.split('_')[0]
        w1=1.0 if not same else min(1,max(.5,.5+(d2-d1)/.012))
        for e in list(v.groups):
            if e.group in fset: h.vertex_groups[ [k for k,x in gi.items() if x==e.group][0] ].remove([v.index])
        hw=[e for e in v.groups if e.group==gi[names[0]]]
        rest=1-fw  # lo que no era de los dedos queda como estaba (mano/antebrazo)
        h.vertex_groups[n1].add([v.index],fw*w1,'REPLACE')
        if w1<1: h.vertex_groups[n2].add([v.index],fw*(1-w1),'REPLACE')
# pose en T como el modelo anterior: brazos horizontales, piernas rectas, dedos estirados
from mathutils import Vector, Matrix
bpy.context.view_layer.objects.active=rig; bpy.ops.object.mode_set(mode='POSE')
def align(name,d):
    pb=rig.pose.bones[name]; bpy.context.view_layer.update()
    M=pb.matrix.copy(); hd=M.translation.copy(); cur=(pb.tail-pb.head).normalized(); q=cur.rotation_difference(d.normalized())
    R=q.to_matrix().to_4x4(); pb.matrix=Matrix.Translation(hd)@R@Matrix.Translation(-hd)@M; bpy.context.view_layer.update()
for sd,sg in (('l',1),('r',-1)):
    X=Vector((sg,0,0))
    for b in ('upperarm','lowerarm','hand'): align(f'{b}_{sd}',X)
    for f in ('index','middle','ring','pinky'):
        for k in ('01','02','03'): align(f'{f}_{k}_{sd}',X)
    for b in ('thigh','calf'): align(f'{b}_{sd}',Vector((0,0,-1)))
bpy.ops.object.mode_set(mode='OBJECT')
bpy.context.view_layer.objects.active=h
am=[m for m in h.modifiers if m.type=='ARMATURE'][0]
bpy.ops.object.modifier_copy(modifier=am.name); bpy.ops.object.modifier_apply(modifier=am.name)
bpy.context.view_layer.objects.active=rig; bpy.ops.object.mode_set(mode='POSE'); bpy.ops.pose.select_all(action='SELECT'); bpy.ops.pose.armature_apply(selected=False); bpy.ops.object.mode_set(mode='OBJECT')
zmin=min((h.matrix_world@v.co).z for v in h.data.vertices)
print('pre', zmin, tuple(rig.matrix_world@rig.data.bones['pelvis'].head_local))
rig.location.z-=zmin
bpy.ops.object.select_all(action='DESELECT'); rig.select_set(True); h.select_set(True); bpy.context.view_layer.objects.active=rig
bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
print('RIG',tuple(rig.location),tuple(rig.scale),tuple(rig.rotation_euler),'H',tuple(h.location),tuple(h.scale),h.parent and h.parent.name)
print('pelvis rest', tuple(rig.matrix_world@rig.data.bones['pelvis'].head_local))
zs=[ (h.matrix_world@v.co).z for v in h.data.vertices]; print('height',min(zs),max(zs), 'verts',len(h.data.vertices))
for o in list(bpy.data.objects):
    if o not in (h,rig): bpy.data.objects.remove(o)
print('objs',[o.name for o in bpy.data.objects])
bpy.ops.export_scene.gltf(filepath=sys.argv[-1],export_format='GLB',export_yup=True,export_apply=False,export_skins=True,export_morph=False,export_animations=False,export_materials='EXPORT')
