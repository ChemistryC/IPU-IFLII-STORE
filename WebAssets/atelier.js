import * as THREE from 'three';
import {marbleMaterial} from './marble.js';
import {createOpenWardrobe} from './wardrobe.js';
import {createCinema} from './cinema.js';

/** Rear gallery extension. All URLs are relative for portable local hosting. */
export async function createAtelier(ctx) {
  const {scene,camera,renderer,insideY,createBox,collisionMeshes,interactableModels,loader,setModal,travel,rebuildCollisions,beatController,musicAudio}=ctx;
  const [garments,books,artworks]=await Promise.all(['WebAssets/Collection/garments.json','WebAssets/Magazines/manifest.json','WebAssets/Collection/manifest.json'].map(async u=>{const r=await fetch(u);if(!r.ok)throw Error(u);return r.json();}));
  const textures=new Map(), gallery=new THREE.Group();gallery.name='New collection and Reading room';scene.add(gallery);
  const tex=url=>{if(!textures.has(url)){const t=new THREE.TextureLoader().load(url);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());textures.set(url,t);}return textures.get(url);};
  const stone=marbleMaterial('WebAssets/Materials/marble-walls.webp',10,false);stone.emissive.set(0xffffff);stone.emissiveIntensity=.12;
  const floor=marbleMaterial('WebAssets/Materials/marble-floors.webp',4,true);floor.emissive.set(0xffffff);floor.emissiveIntensity=.10;
  const slab=marbleMaterial('WebAssets/Materials/marble-floors.webp',8,false);
  const ceiling=new THREE.MeshBasicMaterial({color:0xf5f5f3});
  const brass=new THREE.MeshStandardMaterial({color:0xb9c3cd,roughness:.25,metalness:.78});
  const cream=new THREE.MeshStandardMaterial({color:0xf6f5f1,roughness:.75});
  const glow=new THREE.MeshBasicMaterial({color:0xffd29b,toneMapped:false});
  const blue=new THREE.MeshBasicMaterial({color:0xd9e6f2,toneMapped:false});
  const architectural=[];
  const box=(w,h,d,x,y,z,m=stone,solid=false)=>{const mesh=createBox(w,h,d,x,insideY+y,z,m,solid,false);architectural.push(mesh);return mesh;};
  box(83,.16,92,0,-.04,-66,floor);
  box(84,.4,92,0,20.6,-66,ceiling);
  box(.2,20,92,-41.8,10,-66);box(.2,20,92,41.8,10,-66);for(const x of [-24.5,24.5])box(35,20,.2,x,10,-110.8,stone,true);box(14,10,.2,0,15,-110.8,stone,true);
  // A real partition separates clothing from the philosophy reading room.
  for(const x of [-24.5,24.5])box(35,20,.32,x,10,-88,stone,true);
  box(14,9,.32,0,15.5,-88,stone,true);
  for(let z=-25;z>=-109;z-=8){box(82,.20,.12,0,20.22,z,brass);for(let x=-36;x<=36;x+=8){box(.12,.20,8,x,20.22,z+4,brass);box(3,.04,.12,x+4,20.01,z+3,glow);}}
  for(const x of [-40.9,40.9])box(.06,.09,90,x,.08,-66,blue);
  for(const x of [-14.1,-5.9,5.9,14.1]){box(.16,10,.45,x,5,-19.2,brass);box(.05,9,.08,x,4.8,-18.93,glow);}
  function label(text,x,y,z,width=12,color='#34434d'){
    const c=document.createElement('canvas'),measure=c.getContext('2d');measure.font='56px Georgia';c.width=Math.ceil(measure.measureText(text).width+70);c.height=120;
    const d=c.getContext('2d');d.font='56px Georgia';d.fillStyle=color;d.textAlign='center';d.textBaseline='middle';d.fillText(text,c.width/2,60);
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
    const p=new THREE.Mesh(new THREE.PlaneGeometry(width,width*c.height/c.width),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,toneMapped:false}));p.position.set(x,insideY+y,z);gallery.add(p);return p;
  }
  function board(title,lines,x,y,z,width=12){
    const c=document.createElement('canvas');c.width=1024;c.height=768;const d=c.getContext('2d');d.fillStyle='#fafaf7';d.fillRect(0,0,1024,768);d.fillStyle='#34434d';d.font='50px Georgia';d.fillText(title,70,105);d.fillStyle='#65727a';d.font='31px Arial';let py=180;
    for(const text of lines){let line='';for(const word of text.split(' ')){if(d.measureText(line+' '+word).width>884){d.fillText(line,70,py);py+=43;line=word;}else line=(line+' '+word).trim();}d.fillText(line,70,py);py+=72;}
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const p=new THREE.Mesh(new THREE.PlaneGeometry(width,width*.75),new THREE.MeshBasicMaterial({map:t,toneMapped:false}));p.position.set(x,insideY+y,z);gallery.add(p);return p;
  }
  // Lower reading table, three physical volumes, silver details.
  box(14,.22,6.0,0,.91,-101,slab,true);box(12.4,.12,5.5,0,.73,-101,brass);
  for(const x of [-5.4,5.4])box(.3,.64,4.8,x,.32,-101,brass,true);
  // Reading seats sit at the sides, leaving a clear route to the cinema doorway.
  for(const x of [-17,17]){box(2,.50,9,x,.55,-101,cream,true);box(.3,.85,9,x+Math.sign(x)*.85,1.25,-101,stone,true);for(const z of [-105.25,-96.75])box(1.8,.7,.25,x,.8,z,brass,true);}

  const fill=new THREE.PointLight(0xffffff,360,44,2);fill.position.set(-8,insideY+12,-40);scene.add(fill);
  const spots=[];for(const x of [-20,20]){const l=new THREE.SpotLight(0xfff6e8,0,20,.68,.85,1.5);l.position.set(x,insideY+8.4,-25);l.target.position.set(x,insideY+3.3,-25);scene.add(l,l.target);spots.push(l);}
  const meshModels=[];let loaded=0;const failures=[];
  // One shared geometry load; each display has its own lightweight print texture.
  // Standalone GLBs remain available for download without loading all of them into the scene.
  const sources={};for(const kind of ['tee','hoodie']){const first=garments.find(g=>g.kind===kind);if(first)sources[kind]=(await loader().loadAsync(first.model)).scene;}
  for(let i=0;i<garments.length;i++){
    const data=garments[i],x=i%2?-29:29,z=-25-Math.floor(i/2)*7;
    box(4.5,.65,4.5,x,.325,z,cream,true);box(4.6,.055,4.6,x,.69,z,brass);
    box(4.8,.10,4.8,x,8.6,z,stone);box(3.8,.03,.13,x,8.53,z+.9,glow);
    const caption=label(data.title,x,.38,z+2.30,Math.min(3.5,data.title.length*.15),'#34434d');
    caption.userData={atelierAction:()=>openGarment(data)};interactableModels.push(caption);
    try{
      const model=sources[data.kind].clone(true);model.name=data.title;
      model.traverse(m=>{if(!m.isMesh)return;m.material=m.material.clone();if(m.name.toLowerCase().includes('conforming')){m.material.map=tex(data.image);m.material.color.set(0xffffff);m.material.needsUpdate=true;}else m.material.color.set(data.fabric==='Ivory'?0xe5dece:0x19212b);});
      const b=new THREE.Box3().setFromObject(model),s=b.getSize(new THREE.Vector3()),center=b.getCenter(new THREE.Vector3());
      const content=new THREE.Group();content.add(model);model.position.sub(new THREE.Vector3(center.x,b.min.y,center.z));
      const scale=Math.min(4.8/s.y,3.4/s.x,3.4/s.z);content.scale.setScalar(scale);
      const holder=new THREE.Group();holder.position.set(x,insideY+1.25,z);holder.rotation.y=i%2?Math.PI/2:-Math.PI/2;holder.add(content);gallery.add(holder);
      model.traverse(m=>{if(!m.isMesh)return;m.castShadow=true;m.receiveShadow=true;m.userData={atelierAction:()=>openGarment(data)};interactableModels.push(m);if(m.material)m.material.side=THREE.DoubleSide;});
      meshModels.push(holder);loaded++;
    }catch(e){failures.push(data.id);label('Artwork / '+data.title,x,4,z+1.8,5);console.warn('Atelier garment unavailable',data.model,e);}
  }
  // Pegasus artwork replaces the on-wall model photographs.
  function pegasusPanel(x,y,z,name,width=8){
    box(width+.3,width*1.5+.3,.16,x,y,z-.10,brass);
    const p=new THREE.Mesh(new THREE.PlaneGeometry(width,width*1.5),new THREE.MeshBasicMaterial({map:tex(`WebAssets/Pegasus/${name}.webp`),toneMapped:false}));p.position.set(x,insideY+y,z);gallery.add(p);
  }
  pegasusPanel(-18,7.5,-87.78,'standing',7);pegasusPanel(18,7.5,-87.78,'flight',7);
  pegasusPanel(-20,8,-110.5,'flight',7);pegasusPanel(20,8,-110.5,'standing',7);
  const wardrobe=createOpenWardrobe({scene,insideY,garments,tex,stone,silver:brass,collisionMeshes,interactableModels,onGarment:openGarment});
  const cinema=await createCinema({scene,camera,insideY,stone,floor,silver:brass,tex,collisionMeshes,interactableModels,music:musicAudio,travel,cursor:ctx.cinemaCursor});
  const physical=[];let activeBook=-1;
  for(let i=0;i<books.length;i++){
    const book=books[i],group=new THREE.Group();group.position.set((i-1)*4.1,insideY+1.13,-100.7);group.rotation.y=i?-.22:.14;gallery.add(group);
    const paper=new THREE.Mesh(new THREE.BoxGeometry(2.6,.10,3.5),cream);group.add(paper);
    const spine=new THREE.Mesh(new THREE.BoxGeometry(.07,.16,3.55),brass);spine.position.x=-1.31;group.add(spine);
    const hinge=new THREE.Group();hinge.position.set(-1.3,.08,0);group.add(hinge);
    const cover=new THREE.Mesh(new THREE.PlaneGeometry(2.6,3.5),new THREE.MeshStandardMaterial({map:tex(book.pages[0]),side:THREE.DoubleSide,roughness:.65}));cover.rotation.x=-Math.PI/2;cover.position.x=1.3;hinge.add(cover);
    const inside=new THREE.Mesh(new THREE.PlaneGeometry(2.57,3.47),new THREE.MeshStandardMaterial({map:tex(book.pages[1]),roughness:.9}));inside.rotation.x=-Math.PI/2;inside.position.y=.055;group.add(inside);
    [cover,paper,inside].forEach(m=>{m.userData={atelierAction:()=>openBook(i)};interactableModels.push(m);});physical.push(hinge);
  }
  const tableLabel=label('Three volumes. One world.',0,.91,-97.95,3,'#52606a');
  const batches=new Map();for(const m of architectural){if(!batches.has(m.material))batches.set(m.material,[]);batches.get(m.material).push(m);}
  for(const [material,meshes]of batches){const inst=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),material,meshes.length);const matrix=new THREE.Matrix4();meshes.forEach((m,i)=>{const p=m.geometry.parameters;matrix.compose(m.position,m.quaternion,new THREE.Vector3(p.width,p.height,p.depth));inst.setMatrixAt(i,matrix);m.visible=false;});inst.castShadow=true;inst.receiveShadow=true;inst.computeBoundingSphere();gallery.add(inst);}
  rebuildCollisions();renderer.shadowMap.needsUpdate=true;
  const style=document.createElement('link');style.rel='stylesheet';style.href='WebAssets/atelier.css';document.head.append(style);
  const modal=document.createElement('section');modal.className='atelier-ui atelier-modal';modal.hidden=true;modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','IPU IFLII magazine reader');document.body.append(modal);
  let index=0,spread=0,returnFocus=null,turnTimer,turnAnimation;
  const enter=()=>{returnFocus=document.activeElement;setModal(true);modal.hidden=false;};
  const exit=()=>{clearTimeout(turnTimer);turnAnimation?.cancel();modal.hidden=true;activeBook=-1;setModal(false);returnFocus?.focus();};
  function openBook(i){index=i;spread=0;activeBook=i;enter();renderBook();modal.querySelector('[data-close]').focus();}
  function renderBook(){const book=books[index];modal.innerHTML=`<header><div><small>IPU IFLII / THE EDITORIAL ARCHIVE</small><h2>${book.title}</h2></div><button data-close aria-label="Close magazine">Close ×</button></header><div class="atelier-spread"><img src="${book.pages[spread]}" alt="${book.title}, page ${spread+1}" loading="lazy"><img src="${book.pages[spread+1]}" alt="${book.title}, page ${spread+2}" loading="lazy"></div><details class="atelier-transcript"><summary>Read page text</summary><div>${(book.texts?.slice(spread,spread+2)||[]).map(t=>`<p>${t.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('\n','<br>')}</p>`).join('')}</div></details><footer><button data-prev ${spread===0?'disabled':''}>← Previous</button><span aria-live="polite">${spread+1}–${spread+2} / ${book.pages.length}</span><button data-next ${spread+2>=book.pages.length?'disabled':''}>Next →</button></footer>`;}
  function turn(delta){
    const next=spread+delta,book=books[index];if(next<0||next>=book.pages.length)return;
    const el=modal.querySelector('.atelier-spread');if(!el||el.classList.contains('page-turn-active'))return;
    const images=el.querySelectorAll(':scope > img'),forward=delta>0,source=images[forward?1:0],rect=source.getBoundingClientRect(),outer=el.getBoundingClientRect();
    el.classList.add('page-turn-active');
    const leaf=document.createElement('div');leaf.className='book-turn-leaf';
    leaf.style.cssText=`left:${rect.left-outer.left}px;top:${rect.top-outer.top}px;width:${rect.width}px;height:${rect.height}px;transform-origin:${forward?'left':'right'} center`;
    leaf.innerHTML=`<img class="leaf-front" src="${book.pages[spread+(forward?1:0)]}" alt="Turning page"><img class="leaf-back" src="${book.pages[next+(forward?0:1)]}" alt="Next page">`;
    el.append(leaf);source.src=book.pages[next+(forward?1:0)];
    const animation=turnAnimation=leaf.animate([{transform:'rotateY(0deg)'},{transform:`rotateY(${forward?-75:75}deg)`,offset:.45},{transform:`rotateY(${forward?-180:180}deg)`}],{duration:1100,easing:'cubic-bezier(.25,.1,.2,1)',fill:'forwards'});
    animation.onfinish=()=>{if(modal.hidden)return;spread=next;renderBook();modal.querySelector(delta>0?'[data-next]':'[data-prev]')?.focus();};
  }

  function openGarment(data){window.location.assign(data.url || 'https://ipuiflii.com/');return;enter();activeBook=-1;modal.innerHTML=`<header><div><small>IPU IFLII / ORIGINAL ARCHIVE</small><h2>${data.title}</h2></div><button data-close>Close ×</button></header><div class="atelier-product"><img src="${data.image}" alt="${data.title} artwork"><article><small>FORM & HERITAGE</small><h3>Heritage, in form.</h3><p>${data.title}, from your original IPU IFLII artwork archive.</p><p>${data.fabric} tee · Original 3D garment with a new print.</p><p class="atelier-caption">Collection preview. This concept is not currently listed for purchase.</p><a href="${data.model}" download>Download garment GLB ↓</a><a href="${data.image}" target="_blank" rel="noopener">View artwork ↗</a><button data-book-link>Explore the magazine →</button></article></div>`;modal.querySelector('[data-close]').focus();}
  const go=dest=>{exit();if(dest==='cinema'){cinema.enter();return;}if(dest==='wardrobe'){travel([-29,insideY+2.9,-97],[-40,insideY+3.2,-99]);return;}const reading=dest==='reading'||dest==='philosophy';travel(dest==='hall'?[0,insideY+2.9,24]:reading?[9,insideY+2.9,-93]:[10,insideY+2.9,-24],dest==='hall'?[0,insideY+3,-10]:reading?[0,insideY+4,-105]:[0,insideY+4,-46]);};
  modal.addEventListener('click',e=>{e.stopPropagation();if(e.target.closest('[data-close]'))exit();if(e.target.closest('[data-next]'))turn(2);if(e.target.closest('[data-prev]'))turn(-2);if(e.target.closest('[data-book-link]'))openBook(1);});
  for(const name of ['mousedown','mouseup','touchstart','touchend','pointerdown'])modal.addEventListener(name,e=>e.stopPropagation());
  document.addEventListener('keydown',e=>{if(modal.hidden)return;if(['Escape','ArrowRight','ArrowLeft','Tab'].includes(e.key)){e.preventDefault();e.stopImmediatePropagation();}if(e.key==='Escape')exit();if(e.key==='ArrowRight')turn(2);if(e.key==='ArrowLeft')turn(-2);if(e.key==='Tab'){const els=[...modal.querySelectorAll('button:not(:disabled),a,summary')];const at=els.indexOf(document.activeElement);els[(at+(e.shiftKey?-1:1)+els.length)%els.length]?.focus();}},true);
  document.documentElement.dataset.atelierReady='true';
  return {visit:go,openBook,close:exit,stats:()=>({cinema:cinema.stats(),garments:loaded,foldedPieces:wardrobe.pieces,wardrobeStacks:wardrobe.stacks,failures,books:physical.length,artworks:artworks.length,lights:3,pages:books.map(b=>b.pages.length),wallPhotography:'Pegasus only',sharedGarmentGeometry:true,hoodies:garments.filter(g=>g.kind==='hoodie').length}),update(dt){
    cinema.update(!modal.hidden||ctx.isScenePaused(),dt);
    // Fixed room lighting never follows the visitor or fades on entry.
    fill.position.set(-8,insideY+12,-54);fill.intensity=['high','ultra'].includes(scene.userData.qualityTier)?130:220;
    spots.forEach(s=>s.intensity=0);
    physical.forEach((h,i)=>h.rotation.z=THREE.MathUtils.damp(h.rotation.z,activeBook===i?-2.2:0,2,dt));
  }};
}
