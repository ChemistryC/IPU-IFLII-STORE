import * as THREE from 'three';

// Only fixed, opaque, uninteractive boxes directly attached to the scene.
// Original collision objects stay in place; only their rendering is batched.
export function batchStaticArchitecture(scene,interactables){
 const skip=new Set(interactables),groups=new Map();scene.updateMatrixWorld(true);
 for(const mesh of scene.children){
  if(!mesh.isMesh||mesh.isInstancedMesh||!mesh.visible||mesh.children.length||skip.has(mesh)||mesh.geometry.type!=='BoxGeometry'||Array.isArray(mesh.material)||mesh.material.transparent||Object.keys(mesh.userData).length)continue;
  const p=mesh.geometry.parameters;
  if(p.widthSegments!==1||p.heightSegments!==1||p.depthSegments!==1)continue;
  const key=[mesh.material.uuid,mesh.castShadow,mesh.receiveShadow,mesh.renderOrder,Math.floor(mesh.position.x/40),Math.floor(mesh.position.z/40)].join(':');
  if(!groups.has(key))groups.set(key,[]);groups.get(key).push(mesh);
 }
 let boxes=0,batches=0;
 for(const meshes of groups.values()){
  if(meshes.length<3)continue;
  const first=meshes[0],inst=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),first.material,meshes.length);
  inst.name='Static temple architecture';inst.castShadow=first.castShadow;inst.receiveShadow=first.receiveShadow;inst.renderOrder=first.renderOrder;
  const matrix=new THREE.Matrix4(),scale=new THREE.Matrix4();
  meshes.forEach((mesh,i)=>{const p=mesh.geometry.parameters;matrix.copy(mesh.matrixWorld).multiply(scale.makeScale(p.width,p.height,p.depth));inst.setMatrixAt(i,matrix);mesh.visible=false;});
  inst.computeBoundingSphere();scene.add(inst);boxes+=meshes.length;batches++;
 }
 return {boxes,batches,drawCallsSaved:boxes-batches};
}
