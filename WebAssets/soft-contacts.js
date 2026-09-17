import * as THREE from 'three';

// Static contact shading: one batched draw, no additional lights or shadow passes.
export function addSoftContacts(scene, insideY, courtyardY, displays){
 const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;
 const ctx=canvas.getContext('2d'),g=ctx.createRadialGradient(64,64,8,64,64,64);
 g.addColorStop(0,'rgba(31,39,49,.26)');g.addColorStop(.35,'rgba(31,39,49,.20)');g.addColorStop(.7,'rgba(31,39,49,.08)');g.addColorStop(1,'rgba(31,39,49,0)');ctx.fillStyle=g;ctx.fillRect(0,0,128,128);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 const material=new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
 const contacts=[];
 const add=(x,y,z,w,d)=>contacts.push([x,y,z,w,d]);
 for(const display of scene.userData.galleryDisplays||[]){const {x,z}=display.position;add(x,insideY+.055,z,7.2,7.2);add(x,insideY+.73,z,3.6,2.8);}
 for(const slot of displays){const p=slot.group?.position;if(p)add(p.x,insideY+.055,p.z,6.8,6.8);}
 add(0,insideY+.055,-5,13,7);add(0,insideY+.055,-15,7,7);
 for(const x of [-6.5,6.5])add(x,insideY+.055,52,5.5,5.5);
 add(0,insideY+.06,-101,18,9);for(const x of [-17,17])add(x,insideY+.06,-101,4.8,12);
 add(-39.8,insideY+.06,-99,5.8,15);
 add(0,courtyardY+.04,128,19,19);
 for(const z of [-124,-131,-138])for(const x of [-16,-10,10,16])add(x,insideY+.055,z,6.4,5.8);
 
 
 for(const x of [-28,28])for(const z of [-4.5,8,20.5,33,45.5])add(x,insideY+.055,z,5.5,5.5);
 const geometry=new THREE.PlaneGeometry(1,1);geometry.rotateX(-Math.PI/2);
 const mesh=new THREE.InstancedMesh(geometry,material,contacts.length);mesh.name='Subtle contact shadows';mesh.renderOrder=2;
 contacts.forEach(([x,y,z,w,d],i)=>mesh.setMatrixAt(i,new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion(),new THREE.Vector3(w,1,d))));
 mesh.computeBoundingSphere();scene.add(mesh);return contacts.length;
}
