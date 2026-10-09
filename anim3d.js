/* Anim3D — animaciones 3D de ejercicios con un cuerpo real (Quaternius, CC0).
   Uso: Anim3D.list (metadatos), Anim3D.match(ejercicio) → id, await Anim3D.mount(elemento) → visor {show(id), play(bool), slow(bool), start(), stop()} */
(function(){
'use strict';
const CDN='https://cdn.jsdelivr.net/npm/three@0.147.0/';
const A3={};
window.Anim3D=A3;

// ---------- metadatos (no requieren el motor) ----------
const META=[
 {id:'pull',name:'Dominadas agarre abierto',main:['Dorsal ancho'],sec:['Bíceps','Romboides'],lab:['Subí','Bajá controlado'],work:{lats:1,biceps:.5,rhomb:.5},
  cam:{yaw:198,pitch:6,dist:4.6,ty:1.72,tz:0},cue:'Colgado de la barra con agarre un poco más ancho que los hombros.',
  steps:['Arrancá con los brazos casi extendidos y los hombros activos, sin colgar flojo.','Llevá el pecho hacia la barra tirando los codos hacia abajo y hacia los costados.','Bajá controlado hasta casi extender, sin balancearte.']},
 {id:'row',name:'Remo sentado con V',main:['Dorsal ancho','Espalda media'],sec:['Deltoide posterior','Bíceps'],lab:['Tirá','Volvé controlado'],work:{lats:1,rhomb:.85,deltR:.6,biceps:.4},
  cam:{yaw:78,pitch:14,dist:3.2,ty:.6,tz:.4},cue:'Sentado con los pies en el apoyo y las rodillas apenas flexionadas.',
  steps:['Arrancá con los brazos extendidos y el torso apenas inclinado adelante.','Llevá el agarre al ombligo con los codos pegados mientras el torso queda erguido.','Juntá los omóplatos un segundo y volvé estirando los brazos.']},
 {id:'rdelt',name:'Rear delt fly en máquina',main:['Deltoide posterior'],sec:['Romboides','Trapecio medio'],lab:['Abrí','Volvé controlado'],work:{deltR:1,rhomb:.6,traps:.25},
  cam:{yaw:205,pitch:16,dist:3.1,ty:.86,tz:.1},cue:'Sentado mirando a la máquina, con el pecho apoyado en el pad.',
  steps:['Agarrá las manijas con los brazos al frente y los codos apenas flexionados.','Abrí los brazos en arco hasta la línea de los hombros, juntando los omóplatos.','Volvé despacio, sin dejar que el peso choque.']},
 {id:'lat',name:'Elevaciones laterales',main:['Deltoide lateral'],sec:['Trapecio (que no suba)'],lab:['Subí','Bajá controlado'],work:{deltS:1,deltF:.35,traps:.12},
  cam:{yaw:22,pitch:8,dist:3.9,ty:.98,tz:0},cue:'De pie, mancuernas a los costados, rodillas apenas flexionadas.',
  steps:['Codos apenas flexionados, guiando el movimiento con el codo.','Subí hasta la altura de los hombros, con los brazos un poco adelante del cuerpo.','Bajá en 2–3 segundos sin balancear el torso ni encoger el cuello.']},
 {id:'preacher',name:'Curl predicador con barra EZ',main:['Bíceps'],sec:['Braquial','Antebrazo'],lab:['Subí','Bajá controlado'],work:{biceps:1,forearm:.45},
  cam:{yaw:66,pitch:16,dist:2.9,ty:.86,tz:.2},cue:'Sentado en el banco Scott, con la parte de atrás de los brazos apoyada en el pad.',
  steps:['Agarrá la barra EZ por la parte interna, con las axilas pegadas al borde del pad.','Subí doblando solo el codo hasta que la barra llegue cerca de los hombros.','Bajá en 2–3 segundos casi hasta extender, sin despegar los brazos del pad.']},
 {id:'hammer',name:'Curl martillo sentado',main:['Braquial','Bíceps'],sec:['Braquiorradial'],lab:['Subí','Bajá controlado'],work:{biceps:1,forearm:.8},
  cam:{yaw:58,pitch:10,dist:2.7,ty:.86,tz:0},cue:'Sentado con la espalda apoyada y el respaldo apenas reclinado.',
  steps:['Mancuernas a los costados con las palmas mirando hacia el cuerpo.','Subí doblando solo el codo, que queda quieto al costado del torso.','Bajá en 2–3 segundos hasta extender el brazo.']},
 {id:'bench',name:'Press banca con barra',main:['Pectoral'],sec:['Deltoide anterior','Tríceps'],lab:['Empujá','Bajá controlado'],work:{pec:1,deltF:.6,triceps:.55},
  cam:{yaw:60,pitch:40,dist:3.6,ty:.62,tz:-.2},cue:'Acostado, ojos debajo de la barra, pies firmes en el piso.',
  steps:['Agarre un poco más ancho que los hombros y omóplatos juntos contra el banco.','Bajá la barra a la parte baja del pecho con los codos a unos 45° del cuerpo.','Empujá en una leve diagonal hasta que la barra quede sobre los hombros.']},
 {id:'incline',name:'Press inclinado con mancuernas',main:['Pectoral superior'],sec:['Deltoide anterior','Tríceps'],lab:['Empujá','Bajá controlado'],work:{pec:1,deltF:.7,triceps:.5},
  cam:{yaw:52,pitch:24,dist:3.4,ty:.85,tz:0},cue:'Banco inclinado a 30–45°, espalda y cabeza apoyadas, pies firmes en el piso.',
  steps:['Mancuernas a los costados del pecho, codos a unos 45° del torso.','Empujá hacia arriba y un poco hacia adentro hasta casi extender los brazos.','Bajá controlado hasta sentir el estiramiento del pecho.']},
 {id:'fly',name:'Aperturas en máquina',main:['Pectoral'],sec:['Deltoide anterior'],lab:['Cerrá','Abrí controlado'],work:{pec:1,deltF:.45},
  cam:{yaw:24,pitch:14,dist:3.3,ty:.92,tz:0},cue:'Sentado con la espalda apoyada y las manijas a la altura del pecho.',
  steps:['Agarrá las manijas con los codos apenas flexionados y el pecho afuera.','Cerrá los brazos en arco hasta juntar las manos delante del pecho.','Volvé despacio hasta sentir el estiramiento, sin pasar la línea de los hombros.']},
 {id:'skull',name:'Skull crusher con barra',main:['Tríceps'],sec:['Cabeza larga del tríceps'],lab:['Extendé','Bajá controlado'],work:{triceps:1},
  cam:{yaw:62,pitch:26,dist:3.2,ty:.72,tz:-.3},cue:'Acostado en banco plano, brazos hacia el techo y un poco inclinados hacia la cabeza.',
  steps:['Agarre cerrado, a la altura de los hombros, con los codos apuntando al techo.','Bajá la barra doblando solo los codos hasta cerca de la frente.','Extendé los brazos sin abrir los codos ni mover los hombros.']},
 {id:'pushdown',name:'Pushdown con soga',main:['Tríceps'],sec:['Antebrazo'],lab:['Empujá','Volvé controlado'],work:{triceps:1,forearm:.25},
  cam:{yaw:62,pitch:10,dist:3.5,ty:1.12,tz:.2},cue:'De pie frente a la polea alta, torso apenas inclinado y codos pegados al cuerpo.',
  steps:['Agarrá la soga con las palmas enfrentadas y los codos al costado del torso.','Extendé los codos hacia abajo y separá los extremos de la soga al final.','Volvé hasta que los antebrazos queden paralelos al piso, sin mover los codos.']},
 {id:'rower',name:'Remo en máquina (cardio)',main:['Cuádriceps','Dorsal ancho'],sec:['Glúteo','Espalda media','Bíceps'],lab:['Remá','Volvé'],work:{quads:.85,lats:.8,rhomb:.6,glutes:.5,biceps:.35},
  cam:{yaw:78,pitch:14,dist:3.8,ty:.55,tz:.25},cue:'Pies trabados en el apoyo, espalda recta y el agarre al frente.',
  steps:['Empujá primero con las piernas, con los brazos todavía estirados.','Cuando las rodillas se extienden, inclinate un poco atrás y llevá el agarre a las costillas bajas.','Volvé en orden inverso: brazos, torso y por último las rodillas.']},
 {id:'hack',name:'Hack squat',main:['Cuádriceps'],sec:['Glúteo','Aductores'],lab:['Subí','Bajá controlado'],work:{quads:1,glutes:.7,adductors:.4},
  cam:{yaw:72,pitch:12,dist:3.4,ty:.78,tz:.1},cue:'Espalda y hombros apoyados en el respaldo, pies a la altura de los hombros.',
  steps:['Destrabá las manijas y bajá controlando, con las rodillas siguiendo la línea de los pies.','Llegá hasta que el muslo quede paralelo a la plataforma sin despegar la espalda baja.','Subí empujando con todo el pie, sin trabar las rodillas arriba.']},
 {id:'press',name:'Prensa de piernas',main:['Cuádriceps','Glúteo'],sec:['Isquiotibiales'],lab:['Empujá','Bajá controlado'],work:{quads:1,glutes:.75,hams:.35},
  cam:{yaw:112,pitch:26,dist:3.6,ty:.75,tz:.35},cue:'Recostado en el respaldo con la cadera bien apoyada y los pies al ancho de los hombros.',
  steps:['Destrabá el carro con las piernas casi extendidas.','Bajá hasta que las rodillas lleguen cerca del pecho sin que la cadera se despegue.','Empujá con todo el pie hasta casi extender, sin trabar las rodillas.']},
 {id:'calfpress',name:'Gemelo en prensa',main:['Gemelos'],sec:['Sóleo'],lab:['Empujá con la punta','Bajá controlado'],work:{calves:1},
  cam:{yaw:96,pitch:24,dist:3.7,ty:.8,tz:.45},cue:'En la prensa con las piernas casi extendidas y solo la punta de los pies en el borde de la plataforma.',
  steps:['Bajá los talones hasta sentir el estiramiento del gemelo.','Empujá con la punta de los pies, moviendo solo el tobillo.','Pausá un segundo arriba y bajá controlado.']},
 {id:'hyper',name:'Hiperextensiones a 45°',main:['Lumbares','Glúteo'],sec:['Isquiotibiales'],lab:['Subí','Bajá controlado'],work:{lowback:1,glutes:.85,hams:.6},
  cam:{yaw:80,pitch:10,dist:3.4,ty:.8,tz:-.05},cue:'En el banco a 45°, con el apoyo justo debajo de la cadera y los tobillos trabados.',
  steps:['Cruzá los brazos sobre el pecho y bajá el torso doblándote desde la cadera.','Subí apretando el glúteo hasta que el cuerpo quede en línea recta.','No arquees la espalda de más arriba: pausá un segundo y bajá controlado.']},
 {id:'legcurl',name:'Curl femoral sentado',main:['Isquiotibiales'],sec:['Gemelos'],lab:['Doblá','Volvé controlado'],work:{hams:1,calves:.3},
  cam:{yaw:70,pitch:14,dist:3.0,ty:.58,tz:.25},cue:'Sentado con la rodilla alineada con el eje de la máquina y el rodillo sobre los tobillos.',
  steps:['Bajá el pad de muslos para que las piernas queden trabadas.','Doblá las rodillas llevando el rodillo hacia abajo y atrás.','Volvé despacio hasta casi extender, sin despegar la cadera del asiento.']},
 {id:'legext',name:'Extensión de cuádriceps',main:['Cuádriceps'],sec:['Recto femoral'],lab:['Extendé','Bajá controlado'],work:{quads:1},
  cam:{yaw:70,pitch:14,dist:3.0,ty:.58,tz:.25},cue:'Sentado con la espalda apoyada, la rodilla alineada con el eje y el rodillo delante de los tobillos.',
  steps:['Agarrate de las manijas laterales para no despegar la cadera.','Extendé las rodillas hasta casi trabarlas y apretá el cuádriceps un segundo.','Bajá controlado hasta que la rodilla quede a 90°.']},
 {id:'abd',name:'Abductores en máquina',main:['Glúteo medio'],sec:['Glúteo mayor'],lab:['Abrí','Cerrá controlado'],work:{glutes:1},
  cam:{yaw:118,pitch:22,dist:3.1,ty:.55,tz:.1},cue:'Sentado con la espalda apoyada y los pads del lado de afuera de las rodillas.',
  steps:['Espalda pegada al respaldo y manos en las manijas.','Abrí las piernas empujando con el costado de las rodillas.','Volvé despacio sin que las placas choquen.']},
 {id:'add',name:'Aductores en máquina',main:['Aductores'],sec:[],lab:['Cerrá','Abrí controlado'],work:{adductors:1},
  cam:{yaw:16,pitch:30,dist:3.1,ty:.6,tz:.2},cue:'Sentado con la espalda apoyada y los pads del lado de adentro de las rodillas.',
  steps:['Espalda pegada al respaldo, piernas abiertas con los pads por dentro.','Cerrá las piernas apretando la cara interna del muslo.','Abrí despacio hasta sentir el estiramiento, sin rebotar.']}
];
A3.list=META;
A3.meta=id=>META.find(m=>m.id===id)||null;
// ids de la app → animación; si no hay, se busca por nombre
const BY_APP={dom:'pull',remov:'row',rdelt:'rdelt',lat1:'lat',lat2:'lat',pred:'preacher',mart:'hammer',banca:'bench',incl:'incline',apert:'fly',skull:'skull',push:'pushdown',remo:'rower',hack:'hack',prensa:'press',gem:'calfpress',hiper:'hyper',femsen:'legcurl',ext:'legext',abdm:'abd',addm:'add'};
const BY_NAME=[[/(gemelo|pantorr|calf).*prensa|prensa.*(gemelo|pantorr)/,'calfpress'],[/cu[aá]driceps|extensi[oó]n de pierna/,'legext'],[/femoral|isquio/,'legcurl'],[/skull|franc[eé]s|rompecr/,'skull'],[/pushdown|soga|tr[ií]ceps en polea/,'pushdown'],[/dominad|jal[oó]n|pulldown/,'pull'],[/rear delt|p[aá]jaro|deltoide post|face pull/,'rdelt'],[/remo.*(m[aá]quina.*cardio|cardio|ergo)/,'rower'],[/remo/,'row'],[/abduc/,'abd'],[/aduc/,'add'],[/hiperext|lumbar/,'hyper'],[/hack/,'hack'],[/prensa/,'press'],[/predicador|scott/,'preacher'],[/martillo|hammer/,'hammer'],[/lateral|elevaci/,'lat'],[/inclinad/,'incline'],[/apertura|pec ?deck|cruce/,'fly'],[/press.*banca|banca|bench/,'bench']];
A3.match=ex=>{
  if(!ex) return null;
  if(ex.type==='cardio' && /remo/i.test(ex.name||'')) return 'rower';
  if(BY_APP[ex.id]) return BY_APP[ex.id];
  const n=(ex.name||'').toLowerCase(); for(const [re,id] of BY_NAME) if(re.test(n)) return id;
  return null;
};

// ---------- carga ----------
const loadScript=src=>new Promise((res,rej)=>{const s=document.createElement('script'); s.src=src; s.onload=res; s.onerror=()=>rej(new Error('No se pudo cargar '+src)); document.head.appendChild(s)});
let loading=null;
A3.load=()=>loading||(loading=(async()=>{
  const lib=(async()=>{if(!window.THREE) await loadScript(A3.libThree||CDN+'build/three.min.js'); if(!THREE.GLTFLoader) await loadScript(A3.libGltf||CDN+'examples/js/loaders/GLTFLoader.js')})();
  const url=A3.modelUrl||'male.js';
  // .glb directo (app instalada) o .glb envuelto en un script base64 (artifact)
  const body=/\.glb$/i.test(url)
    ? fetch(url).then(r=>{if(!r.ok) throw new Error('modelo '+r.status); return r.arrayBuffer()})
    : (window.MALE_GLB?Promise.resolve():loadScript(url)).then(()=>{const bin=atob(window.MALE_GLB), u=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) u[i]=bin.charCodeAt(i); window.MALE_GLB=null; return u.buffer});
  const [,buf]=await Promise.all([lib,body]);
  const gltf=await new Promise((res,rej)=>new THREE.GLTFLoader().parse(buf,'',res,rej));
  return engine(gltf);
})().catch(e=>{loading=null; throw e}));

// estilos del visor
const style=document.createElement('style');
style.textContent=`.a3{position:relative;touch-action:none;cursor:grab;overflow:hidden}
.a3 canvas{display:block;width:100%;height:100%}
.a3-chip{position:absolute;font:800 .72rem/1 var(--font,system-ui,sans-serif);letter-spacing:.06em;text-transform:uppercase;padding:7px 10px;border-radius:999px;background:color-mix(in srgb,var(--bg,#0c0e12) 78%,transparent);color:var(--fg-2,#a3abb8);backdrop-filter:blur(6px);pointer-events:none}
.a3-phase{left:12px;top:12px}.a3-phase.up{color:var(--muscle,#ff4a3d)}
.a3-hint{right:12px;bottom:12px;text-transform:none;letter-spacing:0;font-weight:600}
.a3-ctrls{position:absolute;right:12px;top:12px;display:flex;gap:6px}
.a3-ctrls button{font:700 .8rem var(--font,system-ui,sans-serif);height:32px;padding:0 12px;border-radius:999px;border:0;background:color-mix(in srgb,var(--bg,#0c0e12) 78%,transparent);color:var(--fg,#f1f3f6);cursor:pointer;backdrop-filter:blur(6px)}
.a3-ctrls button[aria-pressed="true"]{background:var(--fg,#f1f3f6);color:var(--bg,#0c0e12)}`;
document.head.appendChild(style);

// ---------- motor ----------
function engine(gltf){
const T=THREE;
const V=(x,y,z)=>new T.Vector3(x,y,z), X=V(1,0,0), Y=V(0,1,0);
const rad=d=>d*Math.PI/180, lerp=(a,b,t)=>a+(b-a)*t, clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;
const at=(o,...pairs)=>{const r=o.clone(); for(let i=0;i<pairs.length;i+=2) r.addScaledVector(pairs[i],pairs[i+1]===undefined?1:pairs[i+1]); return r};
const mid=(a,b,t=.5)=>a.clone().lerp(b,t);
const perp=(v,axis)=>v.clone().addScaledVector(axis,-v.dot(axis)).normalize();
const dirTo=(a,b)=>b.clone().sub(a).normalize();
const css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim()||{'--floor':'#1a1e25','--mach':'#4a5260','--metal':'#8a93a1','--pad':'#2a3039','--muscle':'#ff4a3d'}[n]||'#888';
const basisQ=(a,b,c)=>new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(a,b,c));
const wp=o=>o.getWorldPosition(new T.Vector3()), wq=o=>o.getWorldQuaternion(new T.Quaternion());
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a)); return t*t*(3-2*t)};

// ----- cuerpo -----
const LEN={ua:.30,fa:.27,th:.45,sh:.44};
const DIM={neck:{l:0,u:.52,f:0},sh:{l:.19,u:.47,f:0},hip:{l:.095,u:-.04,f:0}};
function frame(P,U,F){
  U=U.clone().normalize(); F=F.clone().addScaledVector(U,-F.dot(U)).normalize();
  const L=new T.Vector3().crossVectors(U,F);
  const f={P,U,F,L,neck:at(P,U,DIM.neck.u,F,DIM.neck.f),
    sL:at(P,L,DIM.sh.l,U,DIM.sh.u,F,DIM.sh.f), sR:at(P,L,-DIM.sh.l,U,DIM.sh.u,F,DIM.sh.f),
    hL:at(P,L,DIM.hip.l,U,DIM.hip.u,F,DIM.hip.f), hR:at(P,L,-DIM.hip.l,U,DIM.hip.u,F,DIM.hip.f)};
  f.at=(l,u,ff)=>at(P,L,l,U,u,F,ff); f.sh=s=>s>0?f.sL:f.sR; f.hip=s=>s>0?f.hL:f.hR;
  return f;
}
const tilt=(deg)=>{const a=rad(deg); return [V(0,Math.cos(a),Math.sin(a)),V(0,-Math.sin(a),Math.cos(a))]}; // inclinación adelante (+) o atrás (−)
function ik(a,t,L1,L2,pole){
  const d=t.clone().sub(a), D=Math.max(.001,Math.min(d.length(),L1+L2-.002)); d.normalize();
  const x=(L1*L1-L2*L2+D*D)/(2*D), h=Math.sqrt(Math.max(0,L1*L1-x*x));
  const pd=pole.clone().addScaledVector(d,-pole.dot(d)).normalize();
  return {j:at(a,d,x,pd,h), e:at(a,d,D)};
}
const arm=(f,s,target,pole)=>{const r=ik(f.sh(s),target,LEN.ua,LEN.fa,pole); return {s:f.sh(s),e:r.j,w:r.e,t:target.clone(),tc:target.clone(),pole}};
const leg=(f,s,ankle,pole)=>{const r=ik(f.hip(s),ankle,LEN.th,LEN.sh,pole); return {h:f.hip(s),k:r.j,a:r.e}};
const seatedLegs=(f,fw=.44)=>[1,-1].map(s=>{const k=at(f.hip(s),V(s*.03,-.03,1).normalize(),LEN.th); return {h:f.hip(s),k,a:at(k,V(0,-1,.08).normalize(),LEN.sh)}});
const standLegs=f=>[1,-1].map(s=>{const k=at(f.hip(s),V(s*.012,-1,.03).normalize(),LEN.th); return {h:f.hip(s),k,a:at(k,V(0,-1,-.03).normalize(),LEN.sh)}});

// ----- escena -----
const renderer=new T.WebGLRenderer({antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1));
renderer.outputEncoding=T.sRGBEncoding; renderer.shadowMap.enabled=true; renderer.shadowMap.type=T.PCFSoftShadowMap;
const scene=new T.Scene(), cam=new T.PerspectiveCamera(32,1,.05,50);
scene.add(new T.HemisphereLight(0xffffff,0x404650,.75));
const key=new T.DirectionalLight(0xffffff,.95); key.position.set(2.2,4.2,2.6); key.castShadow=true;
key.shadow.mapSize.set(1024,1024); Object.assign(key.shadow.camera,{left:-2.5,right:2.5,top:2.5,bottom:-2.5,near:.5,far:12}); key.shadow.bias=-.0008; key.shadow.radius=4;
scene.add(key,key.target); const rim=new T.DirectionalLight(0xbcd0ff,.35); rim.position.set(-3,2.5,-3); scene.add(rim);
const floor=new T.Mesh(new T.CircleGeometry(2.6,64),new T.MeshStandardMaterial({roughness:1}));
floor.rotation.x=-Math.PI/2; floor.position.y=-.004; floor.receiveShadow=true; scene.add(floor);
const MAT={};
function mats(){
  MAT.mach=new T.MeshStandardMaterial({color:css('--mach'),roughness:.7,metalness:.15});
  MAT.metal=new T.MeshStandardMaterial({color:css('--metal'),roughness:.25,metalness:.85});
  MAT.pad=new T.MeshStandardMaterial({color:css('--pad'),roughness:.85,metalness:0});
  floor.material.color.set(css('--floor'));
  [MAT.mach,MAT.metal,MAT.pad,floor.material].forEach(m=>m.color.convertSRGBToLinear());
}
mats();
const mesh=(g,m)=>{const o=new T.Mesh(g,m); o.castShadow=true; o.receiveShadow=true; return o};
function setSeg(o,a,b){const d=b.clone().sub(a), l=d.length(); o.position.copy(a).addScaledVector(d,.5); o.quaternion.setFromUnitVectors(Y,d.normalize()); o.scale.y=Math.max(l,.0001)}

// ----- modelo y músculos -----
const MG={pec:1,abs:2,lats:3,rhomb:4,traps:5,deltF:6,deltS:7,deltR:8,biceps:9,triceps:10,forearm:11,glutes:12,quads:13,hams:14,adductors:15,calves:16,lowback:17}, NG=18;
const actU={value:new Array(NG).fill(0)}, redU={value:new T.Color(css('--muscle')).convertSRGBToLinear()};
const MODEL=gltf.scene, BN={}, BIND={}, SKM=[];
scene.add(MODEL);
MODEL.traverse(o=>{if(o.isBone) BN[o.name]=o; if(o.isMesh){o.castShadow=true; o.receiveShadow=true; o.frustumCulled=false; if(o.isSkinnedMesh) SKM.push(o);
  (Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{if(/hair/i.test(m.name||'')){m.color.setRGB(.06,.04,.03); m.roughness=.95}})}});
MODEL.updateMatrixWorld(true);
Object.values(BN).forEach(b=>BIND[b.name]=b.quaternion.clone());
const P0=wp(BN.pelvis), sL0=wp(BN.upperarm_l), sR0=wp(BN.upperarm_r), nk0=wp(BN.neck_01);
const L0=sL0.clone().sub(sR0).normalize(), U0=perp(nk0.clone().sub(P0),L0), F0=new T.Vector3().crossVectors(L0,U0);
const J0={sL:sL0,sR:sR0,eL:wp(BN.lowerarm_l),eR:wp(BN.lowerarm_r),hL:wp(BN.thigh_l),hR:wp(BN.thigh_r),kL:wp(BN.calf_l),kR:wp(BN.calf_r),aL:wp(BN.foot_l),aR:wp(BN.foot_r)};
const Q0inv=basisQ(L0,U0,F0).invert();
const rel=v=>{const d=v.clone().sub(P0); return {l:d.dot(L0),u:d.dot(U0),f:d.dot(F0)}};
DIM.sh=rel(sL0); DIM.hip=rel(J0.hL); DIM.neck=rel(nk0);
LEN.ua=sL0.distanceTo(J0.eL); LEN.fa=J0.eL.distanceTo(wp(BN.hand_l)); LEN.th=J0.hL.distanceTo(J0.kL); LEN.sh=J0.kL.distanceTo(J0.aL);
const CURL=[];
const GRIP={pull:'pro',row:'neu',rdelt:'neu',lat:'dbz',preacher:'sup',hammer:'neu',bench:'pro',incline:'proL',fly:'neu',skull:'pro',pushdown:'neu',rower:'pro',hack:'neu',press:'neu',calfpress:'neu',legcurl:'neu',legext:'neu',abd:'neu',add:'neu'};
const cl1=x=>Math.max(-1,Math.min(1,x));
function twistA(bone,axis,ang){const q=new T.Quaternion().setFromAxisAngle(axis,ang); bone.quaternion.copy(wq(bone.parent).invert().multiply(q.multiply(wq(bone)))); bone.updateWorldMatrix(false,true)}
function twist(bone,axis,from,to){const a=perp(from,axis), b=perp(to,axis); let ang=Math.acos(cl1(a.dot(b))); if(new T.Vector3().crossVectors(a,b).dot(axis)<0) ang=-ang;
  const q=new T.Quaternion().setFromAxisAngle(axis,ang); bone.quaternion.copy(wq(bone.parent).invert().multiply(q.multiply(wq(bone)))); bone.updateWorldMatrix(false,true)}
Object.keys(BN).forEach(n=>{const m=n.match(/^(index|middle|ring|pinky|thumb)_0([123])_(l|r)$/); if(!m) return;
  let ax;
  if(m[1]==='thumb'){ // el pulgar se cierra hacia la palma, no en el mismo eje que los dedos
    const t1=wp(BN['thumb_01_'+m[3]]), t2=wp(BN['thumb_02_'+m[3]]); ax=new T.Vector3().crossVectors(t2.sub(t1).normalize(),U0.clone().negate()).normalize();
  } else ax=(m[3]==='l'?F0.clone().negate():F0.clone());
  ax.applyQuaternion(wq(BN[n]).invert());
  CURL.push({b:BN[n],ax,amt:m[1]==='thumb'?-.75:1,seg:+m[2]})});

function classify(skm){
  const g=skm.geometry, pos=g.attributes.position, nor=g.attributes.normal, si=g.attributes.skinIndex, sw=g.attributes.skinWeight;
  const n=pos.count, mg=new Float32Array(n), ms=new Float32Array(n), bones=skm.skeleton.bones;
  const M=skm.bindMatrix, NM=new T.Matrix3().getNormalMatrix(M), p=new T.Vector3(), nn=new T.Vector3();
  const uS=J0.sL.clone().sub(P0).dot(U0);
  for(let i=0;i<n;i++){
    p.fromBufferAttribute(pos,i).applyMatrix4(M); nn.fromBufferAttribute(nor,i).applyMatrix3(NM).normalize();
    let bi=0,bw=-1; const gc=(a,k)=>k===0?a.getX(i):k===1?a.getY(i):k===2?a.getZ(i):a.getW(i);
    for(let k=0;k<4;k++){const w=gc(sw,k); if(w>bw){bw=w;bi=gc(si,k)}}
    const b=bones[bi].name, d=p.clone().sub(P0), l=d.dot(L0), u=d.dot(U0), nf=nn.dot(F0), nl=nn.dot(L0), nu=nn.dot(U0);
    const side=l>=0?1:-1, al=Math.abs(l);
    const sh=side>0?J0.sL:J0.sR, el=side>0?J0.eL:J0.eR, hp=side>0?J0.hL:J0.hR, kn=side>0?J0.kL:J0.kR, an=side>0?J0.aL:J0.aR;
    let id=0, s=0;
    if(/upperarm/.test(b) || (/clavicle|spine_03/.test(b) && al>sh.clone().sub(P0).dot(L0)*side*.78)){
      const along=Math.abs(p.clone().sub(sh).dot(L0));
      if(along<.13){const so=Math.max(nu,nl*side);
        if(nf>.45){id=MG.deltF;s=smooth(.45,.75,nf)} else if(nf<-.45){id=MG.deltR;s=smooth(.45,.75,-nf)} else if(so>-.05){id=MG.deltS;s=smooth(-.05,.4,so)}
        s*=1-smooth(.09,.13,along);
      } else if(/upperarm/.test(b)){
        if(nf>.25){id=MG.biceps;s=smooth(.25,.65,nf)} else if(nf<-.25){id=MG.triceps;s=smooth(.25,.65,-nf)}
        const t=along/el.clone().sub(sh).length(); s*=smooth(.15,.35,t)*(1-smooth(.85,1,t));
      }
    } else if(/lowerarm/.test(b)){id=MG.forearm; s=1-smooth(.45,.85,p.clone().sub(el).length()/LEN.fa)}
    else if(/thigh/.test(b)){
      const t=Math.max(0,p.clone().sub(hp).dot(U0.clone().negate()))/hp.distanceTo(kn);
      if(nf<-.3 && t<.12){id=MG.glutes;s=smooth(.3,.6,-nf)}
      else{ if(nl*side<-.35 && t<.6){id=MG.adductors;s=smooth(.35,.7,-nl*side)} else if(nf>.1){id=MG.quads;s=smooth(.1,.5,nf)} else if(nf<-.25){id=MG.hams;s=smooth(.25,.6,-nf)}
        s*=smooth(.04,.16,t)*(1-smooth(.82,.96,t)); }
    }
    else if(/calf/.test(b)){const t=p.clone().sub(kn).length()/kn.distanceTo(an); if(nf<-.15){id=MG.calves;s=smooth(.15,.5,-nf)*smooth(.03,.15,t)*(1-smooth(.55,.75,t))}}
    else if(/pelvis/.test(b)){ if(nf<-.3 && u<.02){id=MG.glutes;s=smooth(.3,.6,-nf)} else if(nf<-.4 && al<.08 && u>=.02){id=MG.lowback;s=smooth(.4,.7,-nf)} else if(nf>.45 && al<.08 && u>.06){id=MG.abs;s=smooth(.45,.8,nf)} }
    else if(/spine|clavicle|neck/.test(b)){
      if(nf>.35 && u>uS-.2 && u<uS+.01 && al>.025 && al<.17 && /spine_03|clavicle|spine_02/.test(b)){id=MG.pec;s=smooth(.35,.7,nf)*smooth(uS-.2,uS-.13,u)}
      else if(nf>.4 && al<.09 && u<uS-.17 && u>.04){id=MG.abs;s=smooth(.4,.75,nf)}
      else if(nf<-.35 && al<.11 && u>uS-.22 && u<uS-.02){id=MG.rhomb;s=smooth(.35,.7,-nf)*(1-smooth(.08,.11,al))}
      else if(nu>.25 && u>uS-.04 && al>.04 && al<.16){id=MG.traps;s=smooth(.25,.6,nu)}
      else if(nf<.15 && al>.08 && u>uS-.36 && u<uS-.06 && (Math.abs(nl)>.35 || nf<-.25)){id=MG.lats;s=smooth(.08,.13,al)*(1-smooth(uS-.1,uS-.05,u))*smooth(uS-.36,uS-.3,u)}
      else if(nf<-.4 && al<.09 && u<uS-.22 && u>.0){id=MG.lowback;s=smooth(.4,.7,-nf)}
    }
    mg[i]=id; ms[i]=s;
  }
  g.setAttribute('mg',new T.BufferAttribute(mg,1)); g.setAttribute('ms',new T.BufferAttribute(ms,1));
}
function patch(m){
  m.onBeforeCompile=sh=>{
    sh.uniforms.uAct=actU; sh.uniforms.uRed=redU;
    sh.vertexShader='attribute float mg;\nattribute float ms;\nuniform float uAct['+NG+'];\nvarying float vAct;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n vAct=uAct[int(mg+0.5)]*ms;');
    sh.fragmentShader='varying float vAct;\nuniform vec3 uRed;\n'+sh.fragmentShader
      .replace('#include <map_fragment>','#include <map_fragment>\n diffuseColor.rgb=mix(diffuseColor.rgb,uRed,clamp(vAct,0.,1.)*.82);')
      .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance+=uRed*clamp(vAct,0.,1.)*.22;');
  };
  m.needsUpdate=true;
}
SKM.forEach(m=>{classify(m); (Array.isArray(m.material)?m.material:[m.material]).forEach(patch)});

function aim(bone,child,dir){
  bone.updateWorldMatrix(true,true);
  const d0=wp(child).sub(wp(bone)).normalize(), q=new T.Quaternion().setFromUnitVectors(d0,dir.clone().normalize());
  bone.quaternion.copy(wq(bone.parent).invert().multiply(q.multiply(wq(bone)))); bone.updateWorldMatrix(false,true);
}
function placeBody(J){
  Object.values(BN).forEach(b=>b.quaternion.copy(BIND[b.name]));
  const f=J.f;
  MODEL.position.set(0,0,0); MODEL.quaternion.copy(basisQ(f.L,f.U,f.F).multiply(Q0inv)); MODEL.updateMatrixWorld(true);
  MODEL.position.copy(f.P.clone().sub(wp(BN.pelvis))); MODEL.updateMatrixWorld(true);
  J.arms.forEach((a,i)=>{const s=i?'r':'l', UA=BN['upperarm_'+s], LA=BN['lowerarm_'+s], HD=BN['hand_'+s];
    // brazo con bisagra de codo: el antebrazo siempre se flexiona hacia el frente del brazo, sin rotaciones raras
    const A0=wp(LA).sub(wp(UA)).normalize(), B0=perp(f.F,A0), A=a.e.clone().sub(a.s).normalize(), fw=a.w.clone().sub(a.e);
    const bp=fw.clone().addScaledVector(A,-fw.dot(A)), bm=bp.length()/Math.max(.01,fw.length());
    const pd=a.pole?perp(perp(a.pole,dirTo(a.s,a.w)).negate(),A):perp(a.bd||f.F,A), hyper=bp.dot(pd)<0, wB=hyper?0:smooth(.02,.3,bm);
    let Bv=bm>1e-4?bp.normalize().multiplyScalar(wB).addScaledVector(pd,1-wB):pd; if(Bv.length()<1e-3) Bv=pd; Bv=perp(Bv,A);
    const R=basisQ(A,Bv,new T.Vector3().crossVectors(A,Bv)).multiply(basisQ(A0,B0,new T.Vector3().crossVectors(A0,B0)).invert());
    UA.quaternion.copy(wq(UA.parent).invert().multiply(R.multiply(wq(UA)))); UA.updateWorldMatrix(false,true);
    aim(LA,HD,fw);
    aim(HD,BN['middle_01_'+s],a.hd||fw);
    const gt=J.gtype, fd=fw.clone().normalize(), sg=i?-1:1; a.tw=0;
    if(gt){
      const want=gt==='pro'?X.clone().multiplyScalar(sg):gt==='sup'?X.clone().multiplyScalar(-sg):gt==='proL'?f.L.clone().multiplyScalar(sg):gt==='dbz'?V(0,0,-1):new T.Vector3().crossVectors(fd,X).negate();
      if(Math.abs(want.dot(fd))<.95){const k=perp(wp(BN['pinky_01_'+s]).sub(wp(BN['index_01_'+s])),fd), w2=perp(want,fd);
        let ang=Math.acos(cl1(k.dot(w2))); if(new T.Vector3().crossVectors(k,w2).dot(fd)<0) ang=-ang;
        a.tw=Math.round(ang*180/Math.PI); ang=Math.max(-rad(100),Math.min(rad(100),ang));
        twistA(LA,fd,ang*.5); twistA(HD,fd,ang*.5)}
    }
  });
  J.legs.forEach((l,i)=>{const s=i?'r':'l', sd=l.a.clone().sub(l.k).normalize();
    let fw=l.k.clone().sub(mid(l.h,l.a)); fw=fw.addScaledVector(sd,-fw.dot(sd)); const m=fw.length();
    const fb=perp(f.F,sd); fw=m>.01?fw.normalize().multiplyScalar(Math.min(1,m*8)).add(fb.multiplyScalar(1-Math.min(1,m*8))).normalize():fb;
    const toe=(J.toes&&J.toes[i])||at(l.a,fw,.14,sd,.035);
    aim(BN['thigh_'+s],BN['calf_'+s],l.k.clone().sub(l.h));
    aim(BN['calf_'+s],BN['foot_'+s],l.a.clone().sub(l.k));
    aim(BN['foot_'+s],BN['ball_'+s],toe.clone().sub(l.a));
  });
  const g=J.grip==null?1:J.grip;
  CURL.forEach(c=>{const ang=g*c.amt*(c.seg===1?.95:c.seg===2?1.2:.8); c.b.quaternion.copy(BIND[c.b.name]).multiply(new T.Quaternion().setFromAxisAngle(c.ax,ang))});
  MODEL.updateMatrixWorld(true);
  J.arms.forEach((a,i)=>{const s=i?'r':'l', fd=wp(BN['middle_01_'+s]).sub(wp(BN['hand_'+s])).normalize();
    const i1=wp(BN['index_01_'+s]), p1=wp(BN['pinky_01_'+s]), kn=mid(i1,p1), palm=perp(wp(BN['middle_02_'+s]).sub(wp(BN['middle_01_'+s])),fd);
    const ring=[]; ['index','middle','ring','pinky'].forEach(fn=>['01','02','03'].forEach(k=>ring.push(wp(BN[fn+'_'+k+'_'+s]))));
    const cen=ring.reduce((acc,v)=>acc.add(v),new T.Vector3()).multiplyScalar(1/ring.length);
    a.grip=cen.lerp(at(kn,fd,.018,palm,.026),.35); a.kax=p1.clone().sub(i1).normalize()});
}

// ----- utilería -----
let props=new T.Group(); scene.add(props); let DYN={};
const B={
  mkBox(s,m){const o=mesh(new T.BoxGeometry(...s),MAT[m]); props.add(o); return o},
  mkCyl(r,m){const o=mesh(new T.CylinderGeometry(r,r,1,28),MAT[m]); props.add(o); return o},
  box(s,p,m){const o=B.mkBox(s,m); o.position.copy(p); return o},
  cyl(a,b,r,m){const o=B.mkCyl(r,m); setSeg(o,a,b); return o},
  obox(s,p,bs,m){const o=B.mkBox(s,m); o.position.copy(p); o.quaternion.copy(basisQ(...bs)); return o},
  dyn(k,mk){DYN[k]=mk()},
  place(o,p,bs){o.position.copy(p); o.quaternion.copy(basisQ(...bs))},
  seg:setSeg, grip:a=>a.grip||at(a.w,dirTo(a.e,a.w),.06)
};
const dumbbells=(names)=>names.forEach(k=>B.dyn(k,()=>B.mkCyl(k[0]==='h'?.016:.05,k[0]==='h'?'metal':'mach')));
function placeDumbbell(D,k,c,ax){B.seg(D['h'+k],at(c,ax,-.075),at(c,ax,.075)); B.seg(D['a'+k],at(c,ax,.075),at(c,ax,.125)); B.seg(D['b'+k],at(c,ax,-.125),at(c,ax,-.075))}
function barbell(D,c,half,pr){B.seg(D.bar,at(c,X,-half),at(c,X,half)); B.seg(D.p1,at(c,X,half-.14),at(c,X,half-.08)); B.seg(D.p2,at(c,X,-half+.08),at(c,X,-half+.14))}
const mkBarbell=pr=>{B.dyn('bar',()=>B.mkCyl(.015,'metal')); B.dyn('p1',()=>B.mkCyl(pr,'mach')); B.dyn('p2',()=>B.mkCyl(pr,'mach'))};
const flatBench=()=>{B.box([.3,.09,1.25],V(0,.42,-.15),'pad'); [-.6,.35].forEach(z=>B.box([.24,.38,.05],V(0,.19,z),'mach'))};
const LYING=()=>frame(V(0,.53,.02),V(0,0,-1),V(0,1,0));
const lyingLegs=f=>[1,-1].map(s=>{const k=at(f.hip(s),V(s*.06,-.05,.41)); return {h:f.hip(s),k,a:at(k,V(s*.03,-.44,-.06))}});

// ----- poses de cada ejercicio -----
const P={
pull:{
 build(){[-1,1].forEach(s=>{B.cyl(V(s*.95,0,0),V(s*.95,2.6,0),.035,'mach'); B.box([.12,.03,.5],V(s*.95,.015,0),'mach')}); B.cyl(V(-1,2.5,0),V(1,2.5,0),.02,'metal')},
 pose(p){const by=2.5,[U,F]=tilt(-lerp(0,10,p)), sc=V(0,lerp(by-.53,by-.2,p),0), f=frame(at(sc,U,-DIM.sh.u),U,F);
   const arms=[1,-1].map(s=>arm(f,s,V(s*.4,by,0),V(s,-.5,.3)));
   const legs=[1,-1].map(s=>{const k=at(f.hip(s),V(s*.02,-.94,.33).normalize(),LEN.th); return {h:f.hip(s),k,a:at(k,V(0,-.83,-.55).normalize(),LEN.sh)}});
   return {f,arms,legs}}},
row:{
 build(){B.box([.36,.07,.5],V(0,.4,-.05),'pad'); B.box([.18,.05,1.7],V(0,.2,.3),'mach'); B.cyl(V(0,.02,-.05),V(0,.37,-.05),.035,'metal');
   const fp=B.mkBox([.48,.32,.04],'mach'); fp.position.copy(V(0,.42,.84)); fp.rotation.x=.25;
   B.box([.16,1.25,.16],V(0,.62,1.18),'mach'); B.cyl(V(-.04,.5,1.07),V(.04,.5,1.07),.065,'metal');
   B.dyn('cable',()=>B.mkCyl(.007,'metal')); B.dyn('vL',()=>B.mkCyl(.014,'mach')); B.dyn('vR',()=>B.mkCyl(.014,'mach'))},
 pose(p){const [U,F]=tilt(lerp(16,-6,p)), f=frame(V(0,.48,0),U,F);
   const sc=mid(f.sL,f.sR), wC=mid(at(sc,V(0,-.14,.52)),f.at(0,.17,.17),ease(p));
   return {f,wC,arms:[1,-1].map(s=>arm(f,s,at(wC,X,s*.045),V(s*.25,-.6,-1))),legs:[1,-1].map(s=>leg(f,s,V(s*.13,.38,.79),V(s*.1,1,.2))),toes:[1,-1].map(s=>V(s*.13,.5,.8))}},
 dyn(J,D){const ap=at(J.wC,J.f.F,.08); B.seg(D.cable,V(0,.5,1.02),ap); B.seg(D.vL,B.grip(J.arms[0]),ap); B.seg(D.vR,B.grip(J.arms[1]),ap)}},
rdelt:{
 build(){B.box([.42,.07,.42],V(0,.44,-.02),'pad'); B.cyl(V(0,.06,0),V(0,.41,0),.035,'metal'); B.box([.6,.05,1.15],V(0,.03,.3),'pad');
   B.box([.14,1.9,.14],V(0,.95,.66),'mach'); B.box([.3,.08,.3],V(0,1.92,.6),'mach');
   B.dyn('pad',()=>B.mkBox([.36,.44,.07],'pad')); B.dyn('stem',()=>B.mkCyl(.025,'metal'));
   ['lvL','lvR','hdL','hdR'].forEach(k=>B.dyn(k,()=>B.mkCyl(k[0]==='l'?.022:.02,k[0]==='l'?'metal':'mach')))},
 pose(p){const [U,F]=tilt(12), f=frame(V(0,.52,0),U,F), ph=rad(lerp(10,80,p));
   const arms=[1,-1].map(s=>{const d=V(s*Math.sin(ph),-.05,Math.cos(ph)).normalize(); return arm(f,s,at(f.sh(s),d,(LEN.ua+LEN.fa)*.95),V(s*.5,-.8,-.2))});
   return {f,arms,legs:seatedLegs(f)}},
 dyn(J,D){const f=J.f; B.place(D.pad,f.at(0,.33,.2),[f.L,f.U,f.F]); B.seg(D.stem,f.at(0,.33,.24),V(0,f.at(0,.33,0).y,.6));
   J.arms.forEach((a,i)=>{const hd=B.grip(a), y=f.sL.y+.16, k=i?'R':'L'; B.seg(D['lv'+k],V(0,y,.6),V(hd.x,y,hd.z)); B.seg(D['hd'+k],V(hd.x,y,hd.z),V(hd.x,hd.y-.08,hd.z))})}},
lat:{
 build(){dumbbells(['aL','bL','hL','aR','bR','hR'])},
 pose(p){const f=frame(V(0,.98,0),Y,V(0,0,1)), th=rad(lerp(8,86,p)), sc=rad(15);
   const arms=[1,-1].map(s=>{const d=V(s*Math.sin(th)*Math.cos(sc),-Math.cos(th),Math.sin(th)*Math.sin(sc)).normalize(); return arm(f,s,at(f.sh(s),d,(LEN.ua+LEN.fa)*.95),V(0,.25,-1))});
   return {f,arms,legs:standLegs(f)}},
 dyn(J,D){J.arms.forEach((a,i)=>placeDumbbell(D,i?'R':'L',B.grip(a),a.kax||V(0,0,1)))}},
preacher:{
 build(){const J=P.preacher.pose(0), du=P.preacher.du, nrm=V(0,.89,.45).normalize();
   const c=at(mid(J.arms[0].s,J.arms[1].s),du,.29);
   const pc=at(c,nrm,-.085); B.obox([.5,.26,.07],pc,[X,du,nrm.clone().negate()],'pad'); B.cyl(at(pc,nrm,-.04),V(0,0,pc.z+.05),.03,'metal');
   B.box([.38,.07,.34],V(0,.47,-.08),'pad'); B.cyl(V(0,0,-.08),V(0,.44,-.08),.035,'metal'); B.box([.6,.04,.9],V(0,.02,.12),'pad'); mkBarbell(.09)},
 du:null,
 pose(p){const [U,F]=tilt(14), f=frame(V(0,.56,-.04),U,F); const du=P.preacher.du||(P.preacher.du=V(0,-.45,.89).normalize());
   const ph=rad(lerp(-22,56,p));
   const arms=[1,-1].map(s=>{const sh=f.sh(s), e=at(sh,du,LEN.ua,X,-s*.035), fd=V(-s*.1,Math.sin(ph),Math.cos(ph)).normalize(); return {s:sh,e,w:at(e,fd,LEN.fa),bd:V(0,.89,.45)}});
   return {f,arms,legs:seatedLegs(f)}},
 dyn(J,D){const c=mid(B.grip(J.arms[0]),B.grip(J.arms[1])); barbell(D,c,.62)}},
hammer:{
 build(){B.box([.38,.07,.42],V(0,.44,.02),'pad'); B.cyl(V(0,0,0),V(0,.41,0),.035,'metal'); B.box([.55,.04,.7],V(0,.025,0),'pad');
   const [U,F]=tilt(-8); B.obox([.38,.66,.06],at(V(0,.53,-.02),U,.33,F,-.15),[X,U,F],'pad'); dumbbells(['hL','hR','aL','bL','aR','bR'])},
 pose(p){const [U,F]=tilt(-8), f=frame(V(0,.53,-.02),U,F);
   const th=rad(lerp(6,124,p)), ax=V(0,Math.sin(th),Math.cos(th));
   const arms=[1,-1].map(s=>{const sh=f.sh(s), e=at(sh,V(s*.13,-1,.02).normalize(),LEN.ua), d=V(s*.2*(1-p),-Math.cos(th),Math.sin(th)).normalize(); return {s:sh,e,w:at(e,d,LEN.fa),ax,d,bd:f.F}});
   return {f,arms,legs:seatedLegs(f)}},
 dyn(J,D){J.arms.forEach((a,i)=>placeDumbbell(D,i?'R':'L',B.grip(a),a.kax||a.ax))}},
bench:{
 build(){flatBench(); [-1,1].forEach(s=>{B.cyl(V(s*.56,0,-.5),V(s*.56,1.25,-.5),.03,'mach'); B.box([.06,.05,.1],V(s*.56,1.1,-.46),'metal'); B.box([.14,.03,.32],V(s*.56,.015,-.5),'mach')});
   B.dyn('bar',()=>B.mkCyl(.016,'metal')); ['p1','p2','p3','p4'].forEach(k=>B.dyn(k,()=>B.mkCyl(k==='p1'||k==='p3'?.225:.19,'mach')))},
 pose(p){const f=LYING(), by=lerp(.68,1.06,p), bz=lerp(-.25,-.45,p);
   return {f,bar:V(0,by,bz),arms:[1,-1].map(s=>arm(f,s,V(s*.31,by,bz),V(s*.7,-1,.45))),legs:lyingLegs(f)}},
 dyn(J,D){const c=J.bar; B.seg(D.bar,at(c,X,-1.05),at(c,X,1.05)); [[D.p1,.8,.86],[D.p2,.87,.92],[D.p3,-.86,-.8],[D.p4,-.92,-.87]].forEach(([m,a,b])=>B.seg(m,at(c,X,a),at(c,X,b)))}},
incline:{
 build(){const [U,F]=P.incline.ax(); B.box([.32,.07,.36],V(0,.47,.14),'pad'); B.obox([.32,.8,.07],at(V(0,.56,.05),U,.36,F,-.14),[X,U,F],'pad');
   B.box([.5,.04,1.3],V(0,.02,-.1),'mach'); B.cyl(V(0,0,.14),V(0,.44,.14),.035,'metal'); B.cyl(V(0,0,-.35),at(V(0,.56,.05),U,.4,F,-.2),.035,'metal');
   dumbbells(['hL','hR','aL','bL','aR','bR'])},
 ax(){return [V(0,Math.sin(rad(40)),-Math.cos(rad(40))),V(0,Math.cos(rad(40)),Math.sin(rad(40)))]},
 pose(p){const [U,F]=P.incline.ax(), f=frame(V(0,.56,.05),U,F);
   const arms=[1,-1].map(s=>{const sh=f.sh(s), bot=at(sh,f.L,s*.24,f.F,.11,f.U,.05), top=at(sh,f.F,.47,f.U,.12,f.L,-s*.04);
     return arm(f,s,mid(bot,top,ease(p)),at(V(0,0,0),f.F,-1,f.L,s*.9,f.U,-.6))});
   return {f,arms,legs:[1,-1].map(s=>leg(f,s,V(s*.2,.09,.62),V(s*.1,.7,.7)))}},
 dyn(J,D){J.arms.forEach((a,i)=>placeDumbbell(D,i?'R':'L',B.grip(a),a.kax||J.f.L))}},
fly:{
 build(){B.box([.4,.07,.4],V(0,.44,.02),'pad'); B.cyl(V(0,0,0),V(0,.41,0),.035,'metal'); B.box([.6,.04,1],V(0,.02,-.1),'pad');
   B.box([.4,.72,.07],V(0,.86,-.17),'pad'); B.box([.16,1.9,.14],V(0,.95,-.36),'mach'); B.box([.8,.08,.12],V(0,1.62,-.3),'mach');
   ['lvL','lvR','hdL','hdR'].forEach(k=>B.dyn(k,()=>B.mkCyl(k[0]==='l'?.022:.02,k[0]==='l'?'metal':'mach')))},
 pose(p){const f=frame(V(0,.52,0),Y,V(0,0,1)), ph=rad(lerp(80,12,p));
   const arms=[1,-1].map(s=>{const d=V(s*Math.sin(ph),-.08,Math.cos(ph)).normalize(); return arm(f,s,at(f.sh(s),d,(LEN.ua+LEN.fa)*.92),V(s*.3,-1,-.3))});
   return {f,arms,legs:seatedLegs(f)}},
 dyn(J,D){const y=J.f.sL.y+.2; J.arms.forEach((a,i)=>{const s=i?-1:1, k=i?'R':'L', hd=B.grip(a); B.seg(D['lv'+k],V(s*.3,y,-.28),V(hd.x,y,hd.z)); B.seg(D['hd'+k],V(hd.x,y,hd.z),V(hd.x,hd.y-.07,hd.z))})}},
skull:{
 build(){flatBench(); mkBarbell(.13)},
 pose(p){const f=LYING(), a0=Math.atan2(.3,.95), du=at(V(0,0,0),f.F,Math.cos(a0),f.U,Math.sin(a0)).normalize(), bend=rad(lerp(112,4,p));
   const arms=[1,-1].map(s=>{const sh=f.sh(s), e=at(sh,du,LEN.ua,f.L,-s*.05), fd=at(V(0,0,0),f.F,Math.cos(a0+bend),f.U,Math.sin(a0+bend),f.L,-s*.06).normalize(); return {s:sh,e,w:at(e,fd,LEN.fa),bd:f.U}});
   return {f,arms,legs:lyingLegs(f)}},
 dyn(J,D){barbell(D,mid(B.grip(J.arms[0]),B.grip(J.arms[1])),.62)}},
pushdown:{
 build(){B.box([.2,2.25,.18],V(0,1.12,.78),'mach'); B.cyl(V(-.04,2.06,.66),V(.04,2.06,.66),.055,'metal'); B.box([.7,.04,.6],V(0,.02,.7),'mach');
   B.dyn('cable',()=>B.mkCyl(.007,'metal')); B.dyn('rL',()=>B.mkCyl(.016,'pad')); B.dyn('rR',()=>B.mkCyl(.016,'pad'))},
 pose(p){const [U,F]=tilt(10), f=frame(V(0,.98,0),U,F), ph=rad(lerp(16,-92,p));
   const arms=[1,-1].map(s=>{const sh=f.sh(s), e=at(sh,V(-s*.03,-1,.14).normalize(),LEN.ua), fd=V(s*.16*p,Math.sin(ph),Math.cos(ph)).normalize(); return {s:sh,e,w:at(e,fd,LEN.fa),bd:f.F}});
   return {f,arms,legs:standLegs(f)}},
 dyn(J,D){const gL=B.grip(J.arms[0]), gR=B.grip(J.arms[1]), rc=at(mid(gL,gR),V(0,1,0),.1); B.seg(D.cable,V(0,2.02,.64),rc); B.seg(D.rL,rc,at(gL,dirTo(rc,gL),.045)); B.seg(D.rR,rc,at(gR,dirTo(rc,gR),.045))}},
rower:{
 build(){B.box([.14,.06,2.1],V(0,.22,.2),'mach'); B.box([.1,.2,.1],V(0,.1,-.8),'mach'); B.box([.5,.04,.12],V(0,.02,-.8),'mach'); B.box([.6,.04,.14],V(0,.02,1.2),'mach');
   B.cyl(V(-.08,.5,1.24),V(.08,.5,1.24),.27,'mach'); B.cyl(V(0,.22,1.05),V(0,.5,1.2),.04,'mach'); B.cyl(V(0,.62,1.15),V(0,1.02,1),.02,'metal'); B.box([.18,.13,.03],V(0,1.04,.98),'pad');
   [1,-1].forEach(s=>{const fp=B.mkBox([.13,.04,.3],'pad'); fp.position.copy(V(s*.12,.34,.84)); fp.rotation.x=-.75});
   B.dyn('seat',()=>B.mkBox([.32,.06,.32],'pad')); B.dyn('hb',()=>B.mkCyl(.016,'pad')); B.dyn('ch',()=>B.mkCyl(.006,'metal'))},
 pose(p){const lp=ease(clamp(p/.6)), bp=ease(clamp((p-.3)/.5)), ap=ease(clamp((p-.55)/.45));
   const z=lerp(.12,-.22,lp), [U,F]=tilt(lerp(24,-14,bp)), f=frame(V(0,.42,z),U,F);
   const sc=mid(f.sL,f.sR), start=at(sc,V(0,-.16,1).normalize(),(LEN.ua+LEN.fa)*.96), fin=f.at(0,.28,.17), hc=mid(start,fin,ap);
   const arms=[1,-1].map(s=>arm(f,s,at(hc,X,s*.11),V(s*.3,-.6,-1)));
   const legs=[1,-1].map(s=>leg(f,s,V(s*.12,.32,.8),V(s*.12,1,.15)));
   return {f,arms,legs,hc,z,toes:[1,-1].map(s=>V(s*.12,.45,.92))}},
 dyn(J,D){B.place(D.seat,V(0,.3,J.z-.03),[X,Y,V(0,0,1)]); B.seg(D.hb,at(J.hc,X,-.16),at(J.hc,X,.16)); B.seg(D.ch,V(0,.5,1.08),J.hc)}},
hack:{
 build(){B.box([.8,.05,.6],V(0,.06,.36),'mach'); B.box([1,.04,1.6],V(0,.02,.05),'mach');
   const [U,F]=P.hack.ax(); [-1,1].forEach(s=>B.obox([.06,2.1,.06],at(V(s*.33,.92,0),U,.05,F,-.22),[X,U,F],'mach'));
   B.dyn('pad',()=>B.mkBox([.44,.74,.07],'pad')); B.dyn('spL',()=>B.mkCyl(.045,'pad')); B.dyn('spR',()=>B.mkCyl(.045,'pad'))},
 ax(){const a=rad(35); return [V(0,Math.cos(a),-Math.sin(a)),V(0,Math.sin(a),Math.cos(a))]},
 pose(p){const [U,F]=P.hack.ax(), f=frame(at(V(0,.92,0),U,-.40*(1-p)),U,F);
   return {f,legs:[1,-1].map(s=>leg(f,s,V(s*.14,.11,.33),V(s*.25,.15,1))),arms:[1,-1].map(s=>arm(f,s,at(f.sh(s),f.F,.15,f.L,s*-.03,f.U,.02),V(s*.5,-1,.2)))}},
 dyn(J,D){const f=J.f; B.place(D.pad,f.at(0,.33,-.15),[f.L,f.U,f.F]); [[D.spL,f.sL],[D.spR,f.sR]].forEach(([m,s])=>B.seg(m,at(s,f.U,.06,f.F,-.08),at(s,f.U,.06,f.F,.1)))}},
press:{
 ax(){return {U:V(0,Math.sin(rad(40)),-Math.cos(rad(40))),F:V(0,Math.cos(rad(40)),Math.sin(rad(40))),u:V(0,Math.sin(rad(45)),Math.cos(rad(45))),w:V(0,Math.cos(rad(45)),-Math.sin(rad(45))),base:V(0,.82,.32)}},
 build(){const {U,F,u,base}=P.press.ax();
   B.box([.44,.07,.4],V(0,.4,.05),'pad'); B.obox([.44,.78,.07],at(V(0,.52,0),U,.3,F,-.14),[X,U,F],'pad');
   B.box([1.1,.04,2.1],V(0,.02,.5),'mach'); B.box([.12,.38,.12],V(0,.19,.02),'mach');
   [-1,1].forEach(s=>{B.cyl(at(base,X,s*.45,u,-.3),at(base,X,s*.45,u,1.05),.03,'metal'); B.box([.08,.95,.08],V(s*.45,.47,1.18),'mach')});
   B.dyn('plate',()=>B.mkBox([.74,.56,.045],'mach')); ['w1','w2'].forEach(k=>B.dyn(k,()=>B.mkCyl(.16,'mach'))); ['hL','hR'].forEach(k=>B.dyn(k,()=>B.mkCyl(.02,'metal')))},
 pose(p){const {U,F,u,w,base}=P.press.ax(), f=frame(V(0,.52,0),U,F), fc=at(base,u,.36*p);
   const legs=[1,-1].map(s=>leg(f,s,at(fc,X,s*.13),V(s*.2,.8,-.6)));
   return {f,legs,fc,u,w,arms:[1,-1].map(s=>arm(f,s,f.at(s*.3,.02,.05),V(s,-.3,-.3))),toes:legs.map(l=>at(l.a,w,.14,u,.02))}},
 dyn(J,D){B.place(D.plate,at(J.fc,J.u,.045,J.w,.06),[X,J.w,J.u]);
   B.seg(D.w1,at(J.fc,J.u,.14,X,.42),at(J.fc,J.u,.14,X,.48)); B.seg(D.w2,at(J.fc,J.u,.14,X,-.48),at(J.fc,J.u,.14,X,-.42));
   J.arms.forEach((a,i)=>{const h=B.grip(a); B.seg(D[i?'hR':'hL'],at(h,J.f.F,-.06),at(h,J.f.F,.06))})}},
calfpress:{
 build(){P.press.build()},
 pose(p){const {U,F,u,w,base}=P.press.ax(), f=frame(V(0,.52,0),U,F), fc=at(base,u,.27+.06*p);
   const a1=lerp(.12,.05,p), b1=lerp(.07,.13,p);
   const toes=[1,-1].map(s=>at(fc,X,s*.13,w,-.17)), ankles=toes.map(t=>at(t,w,-a1,u,-b1));
   const legs=[1,-1].map((s,i)=>leg(f,s,ankles[i],V(s*.2,.8,-.6)));
   return {f,legs,fc,u,w,toes,arms:[1,-1].map(s=>arm(f,s,f.at(s*.3,.02,.05),V(s,-.3,-.3)))}},
 dyn(J,D){P.press.dyn(J,D); D.w1.visible=D.w2.visible=false}},
hyper:{
 ax(){const ld=V(0,-Math.sin(rad(45)),-Math.cos(rad(45))); return {ld,fl:V(0,-Math.sin(rad(45)),Math.cos(rad(45))),Pp:V(0,.98,.1)}},
 build(){const {ld,fl,Pp}=P.hyper.ax(), aC=at(Pp,ld,(LEN.th+LEN.sh)*.97);
   B.obox([.46,.26,.09],at(Pp,ld,.12,fl,.16),[X,ld,fl],'pad');
   B.cyl(at(aC,fl,-.07,ld,-.04,X,-.2),at(aC,fl,-.07,ld,-.04,X,.2),.045,'pad');
   B.obox([.42,.24,.03],at(aC,ld,.07,fl,.06),[X,fl,ld],'mach');
   B.cyl(at(Pp,ld,.12,fl,.22),V(0,.04,at(Pp,ld,.12,fl,.22).z+.15),.04,'mach'); B.cyl(at(aC,ld,.07,fl,.08),V(0,.04,aC.z+.05),.04,'mach');
   B.box([.5,.04,1.2],V(0,.02,-.25),'mach')},
 pose(p){const {ld,fl,Pp}=P.hyper.ax(), al=rad(lerp(-48,45,p)), U=V(0,Math.sin(al),Math.cos(al)), F=V(0,-Math.cos(al),Math.sin(al)), f=frame(Pp,U,F);
   const legs=[1,-1].map(s=>leg(f,s,at(Pp,X,s*DIM.hip.l,ld,(LEN.th+LEN.sh)*.97),fl));
   const arms=[1,-1].map(s=>arm(f,s,at(f.sh(-s),f.F,.07,f.U,-.11),at(V(0,0,0),f.F,1,f.U,-.7)));
   return {f,legs,arms,grip:.4,toes:legs.map(l=>at(l.a,fl,.14))}}},
legcurl:{
 seat(dir){const [U,F]=tilt(-15), f=frame(V(0,.55,-.02),U,F);
   B.box([.42,.08,.44],V(0,.43,.0),'pad'); B.obox([.42,.72,.07],at(f.P,U,.34,F,-.15),[X,U,F],'pad'); B.box([.7,.04,1.1],V(0,.02,.1),'mach');
   B.cyl(V(0,0,0),V(0,.39,0),.04,'metal');
   const J=P[dir].pose(0), k=mid(J.legs[0].k,J.legs[1].k);
   [-1,1].forEach(s=>{B.cyl(V(s*.3,0,k.z),V(s*.3,k.y,k.z),.035,'mach'); B.cyl(V(s*.3,k.y,k.z-.02),V(s*.24,k.y,k.z-.02),.05,'mach')});
   B.dyn('rol',()=>B.mkCyl(.05,'pad')); B.dyn('lvL',()=>B.mkCyl(.022,'metal')); B.dyn('lvR',()=>B.mkCyl(.022,'metal'));
   if(dir==='legcurl') B.cyl(at(k,V(0,1,0),.1,V(0,0,1),-.1,X,-.22),at(k,V(0,1,0),.1,V(0,0,1),-.1,X,.22),.05,'pad')},
 build(){P.legcurl.seat('legcurl')},
 legs(f,ps){return [1,-1].map(s=>{const k=at(f.hip(s),V(s*.03,-.04,1).normalize(),LEN.th), sd=V(0,-Math.sin(ps),Math.cos(ps)), a=at(k,sd,LEN.sh); return {h:f.hip(s),k,a,sd,fd:V(0,Math.cos(ps),Math.sin(ps))}})},
 pose(p){const [U,F]=tilt(-15), f=frame(V(0,.55,-.02),U,F), legs=P.legcurl.legs(f,rad(lerp(10,100,p)));
   return {f,legs,toes:legs.map(l=>at(l.a,l.fd,.14)),arms:[1,-1].map(s=>arm(f,s,f.at(s*.29,-.02,.13),V(s,-.4,-.4))),side:-1}},
 dyn(J,D){const l=J.legs, c0=mid(l[0].a,l[1].a), c=at(c0,l[0].fd,.06*J.side,l[0].sd,-.03); B.seg(D.rol,at(c,X,-.2),at(c,X,.2));
   const k=mid(l[0].k,l[1].k); B.seg(D.lvL,V(.27,k.y,k.z),V(.27,c.y,c.z)); B.seg(D.lvR,V(-.27,k.y,k.z),V(-.27,c.y,c.z))}},
legext:{
 build(){P.legcurl.seat('legext')},
 pose(p){const [U,F]=tilt(-15), f=frame(V(0,.55,-.02),U,F), legs=P.legcurl.legs(f,rad(lerp(92,8,p)));
   return {f,legs,toes:legs.map(l=>at(l.a,l.fd,.14)),arms:[1,-1].map(s=>arm(f,s,f.at(s*.29,-.02,.13),V(s,-.4,-.4))),side:1}},
 dyn(J,D){P.legcurl.dyn(J,D)}},
abd:{
 build(){const [U,F]=tilt(-8); B.box([.44,.08,.44],V(0,.43,.02),'pad'); B.obox([.44,.7,.07],at(V(0,.54,-.02),U,.34,F,-.15),[X,U,F],'pad');
   B.box([.7,.04,1],V(0,.02,.1),'mach'); B.cyl(V(0,0,0),V(0,.39,0),.04,'metal');
   ['pL','pR','aL','aR','fL','fR'].forEach(k=>B.dyn(k,()=>k[0]==='f'?B.mkBox([.12,.03,.16],'mach'):B.mkCyl(k[0]==='p'?.045:.02,k[0]==='p'?'pad':'metal')))},
 legs(f,g,io){return [1,-1].map(s=>{const td=V(s*Math.sin(g),-.04,Math.cos(g)).normalize(), k=at(f.hip(s),td,LEN.th), a=at(k,V(s*.05,-1,.06).normalize(),LEN.sh*.97); return {h:f.hip(s),k,a,o:perp(V(s,0,0),td).multiplyScalar(io)}})},
 pose(p){const [U,F]=tilt(-8), f=frame(V(0,.54,-.02),U,F), legs=P.abd.legs(f,rad(lerp(6,36,p)),1);
   return {f,legs,arms:[1,-1].map(s=>arm(f,s,f.at(s*.28,-.02,.14),V(s,-.4,-.4)))}},
 dyn(J,D){J.legs.forEach((l,i)=>{const k=i?'R':'L', pc=at(l.k,l.o,.085,V(0,0,1),-.06);
   B.seg(D['p'+k],at(pc,Y,-.08),at(pc,Y,.08)); B.seg(D['a'+k],at(pc,Y,-.08),V(pc.x*.4,.3,.15)); B.place(D['f'+k],at(l.a,Y,-.05,V(0,0,1),.04),[X,Y,V(0,0,1)])})}},
add:{
 build(){P.abd.build()},
 pose(p){const [U,F]=tilt(-8), f=frame(V(0,.54,-.02),U,F), legs=P.abd.legs(f,rad(lerp(38,6,p)),-1);
   return {f,legs,arms:[1,-1].map(s=>arm(f,s,f.at(s*.28,-.02,.14),V(s,-.4,-.4)))}},
 dyn(J,D){P.abd.dyn(J,D)}}
};

// ----- ritmo, cámara y bucle -----
const TT=[1,.25,1.5,.4], TS=TT.reduce((a,b)=>a+b,0);
const phaseAt=t=>{t%=TS; if(t<TT[0]) return {p:ease(t/TT[0]),up:true}; t-=TT[0]; if(t<TT[1]) return {p:1,up:true}; t-=TT[1]; if(t<TT[2]) return {p:1-ease(t/TT[2]),up:false}; return {p:0,up:false}};
let reduced=false; try{reduced=matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}
const st={cur:null,meta:null,playing:!reduced,slow:false,clock:reduced?.7:0,last:null,wall:0,uy:0,up:0,user:0,run:false,host:null,raf:0};
const ui={};
function buildUI(host){
  host.classList.add('a3'); host.appendChild(renderer.domElement);
  host.insertAdjacentHTML('beforeend','<span class="a3-chip a3-phase"></span><div class="a3-ctrls"><button type="button" data-a3="play" aria-pressed="false">Pausar</button><button type="button" data-a3="slow" aria-pressed="false">Lento</button></div><span class="a3-chip a3-hint">Arrastrá para girar</span>');
  ui.ph=host.querySelector('.a3-phase'); ui.hint=host.querySelector('.a3-hint'); ui.play=host.querySelector('[data-a3=play]'); ui.slow=host.querySelector('[data-a3=slow]');
  ui.play.addEventListener('click',()=>{st.playing=!st.playing; sync()}); ui.slow.addEventListener('click',()=>{st.slow=!st.slow; sync()});
  let drag=null;
  host.addEventListener('pointerdown',e=>{if(e.target.closest('button')) return; drag={x:e.clientX,y:e.clientY,uy:st.uy,up:st.up}; try{host.setPointerCapture(e.pointerId)}catch(_){} st.user=1; ui.hint.hidden=true});
  host.addEventListener('pointermove',e=>{if(!drag) return; st.uy=drag.uy-(e.clientX-drag.x)*.01; st.up=drag.up+(e.clientY-drag.y)*.006});
  const end=()=>{drag=null}; host.addEventListener('pointerup',end); host.addEventListener('pointercancel',end);
  new ResizeObserver(resize).observe(host); resize(); sync();
}
function sync(){if(!ui.play) return; ui.play.textContent=st.playing?'Pausar':'Seguir'; ui.play.setAttribute('aria-pressed',String(!st.playing)); ui.slow.setAttribute('aria-pressed',String(st.slow))}
function resize(){const h=st.host; if(!h) return; const w=h.clientWidth||1, hh=h.clientHeight||1; renderer.setSize(w,hh,false); cam.aspect=w/hh; cam.updateProjectionMatrix()}
function show(id){
  const meta=A3.meta(id)||META[0], def=P[meta.id];
  st.meta=meta; st.cur=def;
  scene.remove(props); props.traverse(o=>{if(o.geometry) o.geometry.dispose()}); props=new T.Group(); scene.add(props); DYN={};
  def.build(); st.uy=0; st.up=0; st.user=0; if(ui.hint) ui.hint.hidden=false;
  frameOnce();
}
function frameOnce(){
  const {p,up}=phaseAt(st.clock), def=st.cur, meta=st.meta, J=def.pose(p);
  if(J.gtype===undefined) J.gtype=GRIP[meta.id]||null;
  placeBody(J);
  // corrige el brazo para que el centro del puño (no la muñeca) quede sobre la barra o la manija
  for(let it=0;it<4;it++){let moved=false;
    J.arms.forEach(a=>{if(!a.t||!a.grip) return; const err=a.grip.clone().sub(a.t); if(err.length()<.003) return;
      a.tc.sub(err); const r=ik(a.s,a.tc,LEN.ua,LEN.fa,a.pole); a.e=r.j; a.w=r.e; moved=true});
    if(!moved) break; placeBody(J)} const arr=actU.value; arr.fill(0); Object.entries(meta.work).forEach(([g,w])=>{if(MG[g]) arr[MG[g]]=w*(.38+.62*p)});
  if(def.dyn) def.dyn(J,DYN);
  if(ui.ph){ui.ph.textContent=up?meta.lab[0]:meta.lab[1]; ui.ph.classList.toggle('up',up)}
  const c=st.camO||meta.cam, sway=(st.user||st.camO)?0:Math.sin(st.wall*.35)*rad(14);
  const yaw=rad(c.yaw)+st.uy+sway, pitch=Math.max(rad(-5),Math.min(rad(60),rad(c.pitch)+st.up)), tg=c.tx!=null?V(c.tx,c.ty,c.tz):V(0,c.ty,c.tz);
  st.lastJ=J;
  cam.position.set(tg.x+c.dist*Math.cos(pitch)*Math.sin(yaw),tg.y+c.dist*Math.sin(pitch),tg.z+c.dist*Math.cos(pitch)*Math.cos(yaw));
  cam.lookAt(tg); key.target.position.copy(tg); renderer.render(scene,cam);
}
function loop(ts){
  if(!st.run) return;
  const dt=st.last==null?0:Math.min(.1,(ts-st.last)/1000); st.last=ts; st.wall+=dt;
  if(st.playing) st.clock+=dt*(st.slow?.4:1);
  frameOnce(); st.raf=requestAnimationFrame(loop);
}
const retheme=()=>{mats(); redU.value.set(css('--muscle')).convertSRGBToLinear(); if(st.meta) show(st.meta.id)};
try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',retheme)}catch(e){}
new MutationObserver(retheme).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
return {
  attach(host){if(st.host===host) return; st.host=host; buildUI(host)},
  show, start(){if(st.run) return; st.run=true; st.last=null; st.raf=requestAnimationFrame(loop)}, stop(){st.run=false; cancelAnimationFrame(st.raf)},
  play(b){st.playing=b; sync()}, camO(c){st.camO=c}, grips(){return st.lastJ?st.lastJ.arms.map(a=>a.grip&&a.grip.toArray()):[]}, twists(){return st.lastJ?st.lastJ.arms.map(a=>a.tw):[]}, gerr(){return st.lastJ?st.lastJ.arms.map(a=>a.t&&a.grip?Math.round(a.grip.distanceTo(a.t)*1000):-1):[]}, slow(b){st.slow=b; sync()}, setClock(c){st.clock=c}, frame:frameOnce, dims:()=>({LEN,DIM})
};
}
A3.mount=async host=>{const e=await A3.load(); e.attach(host); return e};
})();
