import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

export function createOpenWardrobe({scene,insideY,garments,tex,stone,silver,collisionMeshes,interactableModels,onGarment}){
 const group=new THREE.Group();group.name='Open wardrobe / folded collection';group.position.set(-40.1,insideY,-99);group.rotation.y=Math.PI/2;scene.add(group);
 const backing=new THREE.MeshStandardMaterial({color:0xe1e0d9,roughness:.95});
 const ivory=new THREE.MeshStandardMaterial({color:0xf0ece4,roughness:1});
 const navy=new THREE.MeshStandardMaterial({color:0x172332,roughness:1});
 const seam=new THREE.LineBasicMaterial({color:0x98978f,transparent:true,opacity:.42});
 const boxes=[];
 function box(w,h,d,x,y,z,mat,solid=false){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);group.add(m);boxes.push(m);if(solid)collisionMeshes.push(m);return m;}
 box(12.8,.3,2.8,0,.15,0,stone,true);box(12.8,.24,2.8,0,6.45,0,stone,true);
 box(12.5,6.1,.12,0,3.25,-1.32,backing);
 for(const x of [-6.25,-2.1,2.1,6.25])box(.14,6.1,2.73,x,3.25,0,silver,true);
 const glow=new THREE.MeshBasicMaterial({color:0xffe8c3,toneMapped:false});
 for(const y of [.42,2.42,4.42]){box(12.5,.12,2.65,0,y,0,stone,true);box(12.45,.04,.06,0,y+.085,1.36,silver);box(12.1,.035,.08,0,y+1.83,-.8,glow);}
 const folded=new RoundedBoxGeometry(2.65,.24,1.95,3,.10);
 const pos=folded.attributes.position;
 for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i);pos.setY(i,pos.getY(i)+.013*Math.sin(x*7+z*3)*Math.cos(z*4));}folded.computeVertexNormals();
 const seams=new THREE.BufferGeometry().setFromPoints(Array.from({length:19},(_,i)=>new THREE.Vector3(-1.23+i*2.46/18,-.02,.977)));
 const collar=new THREE.RingGeometry(.20,.30,24,1,0,Math.PI);
 const labels=[];let stacks=0;
 for(let row=0;row<3;row++)for(let col=0;col<3;col++){
  const data=garments[(row*3+col)*2 % garments.length],x=(col-1)*4.2,y=.6+row*2;
  for(let layer=0;layer<3;layer++){
   const mat=layer===2?(data.fabric==='Ivory'?ivory:navy):(layer%2?ivory:navy);
   const shirt=new THREE.Mesh(folded,mat);shirt.name=`Folded ${data.title} / ${layer+1}`;shirt.position.set(x+(layer===1?.045:0),y+layer*.255,.10);shirt.receiveShadow=true;shirt.userData={atelierAction:()=>onGarment(data)};group.add(shirt);interactableModels.push(shirt);
   const stitch=new THREE.Line(seams,seam);shirt.add(stitch);
  }
  const top=y+.635;
  const print=new THREE.Mesh(new THREE.PlaneGeometry(1.1,1.45),new THREE.MeshStandardMaterial({map:tex(data.image),transparent:true,depthWrite:false,roughness:1,polygonOffset:true,polygonOffsetFactor:-1}));print.position.set(x,top+.005,.20);print.rotation.x=-Math.PI/2;print.userData={atelierAction:()=>onGarment(data)};group.add(print);interactableModels.push(print);
  const neck=new THREE.Mesh(collar,data.fabric==='Ivory'?ivory:navy);neck.rotation.x=-Math.PI/2;neck.position.set(x,top+.012,-.55);group.add(neck);
  labels.push({title:data.title,x,y:y-.17});stacks++;
 }
 function plaque(text,x,y,z,width){const c=document.createElement('canvas');c.width=768;c.height=100;const d=c.getContext('2d');d.fillStyle='#34424b';d.font='38px Georgia';d.textAlign='center';d.textBaseline='middle';d.fillText(text,384,50);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const p=new THREE.Mesh(new THREE.PlaneGeometry(width,width/7.68),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false}));p.position.set(x,y,z);group.add(p);}
 labels.forEach(l=>plaque(l.title,l.x,l.y,1.45,3.2));
 // No doors and no additional real lights. Batch the fixed cabinet pieces.
 group.updateMatrixWorld(true);
 const batches=new Map();for(const m of boxes){if(!batches.has(m.material))batches.set(m.material,[]);batches.get(m.material).push(m);}
 for(const [material,meshes]of batches){const inst=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),material,meshes.length);meshes.forEach((m,i)=>{const p=m.geometry.parameters;const matrix=new THREE.Matrix4().compose(m.position,m.quaternion,new THREE.Vector3(p.width,p.height,p.depth));inst.setMatrixAt(i,matrix);m.visible=false;});inst.computeBoundingSphere();group.add(inst);}
 return {group,stacks,pieces:stacks*3};
}


