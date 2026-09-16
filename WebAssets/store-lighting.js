import * as THREE from 'three';
export function createStoreLighting(scene,renderer,y){
 const lights=[];
 // Fixed light positions: directional store lighting, with shadows on the walls.
 for(const z of [12,42,-38,-76])for(const side of [-1,1]){
  const light=new THREE.SpotLight(0xfff2df,0,85,1.05,.88,2);
  light.name='High detail wall and display light';light.position.set(side*9,y+(z<0?9:16),z+8);
  light.target.position.set(side*(z<0?40:34),y+4,z-8);
  light.shadow.mapSize.set(1024,1024);light.shadow.camera.near=.5;light.shadow.camera.far=100;
  light.shadow.bias=-.00012;light.shadow.normalBias=.035;light.shadow.radius=2;light.shadow.autoUpdate=false;light.userData.roomPower=z<0?1050:600;
  scene.add(light,light.target);lights.push(light);
 }
 const materials=new Map();scene.traverse(o=>{if(!o.isMesh)return;for(const m of Array.isArray(o.material)?o.material:[o.material]){if(m?.isMeshStandardMaterial&&!materials.has(m))materials.set(m,{emissive:m.emissiveIntensity,env:m.envMapIntensity});}});
 function setQuality(tier){const high=tier==='high'||tier==='ultra';const ultra=tier==='ultra';
  lights.forEach(l=>{l.intensity=l.userData.roomPower*(high?1:tier==='balanced'?.35:.2);l.castShadow=high;const size=ultra?2048:1024;if(l.shadow.mapSize.x!==size){l.shadow.mapSize.set(size,size);l.shadow.map?.dispose();l.shadow.map=null;}l.shadow.needsUpdate=true;});
  for(const [m,original] of materials){
   // Keep luminous fittings intact; reduce ambient wash only on pale stone.
   if(m.emissive&&original.emissive>0&&original.emissive<.2)m.emissiveIntensity=high?original.emissive*.25:original.emissive;
  }
  renderer.shadowMap.needsUpdate=true;
 }
 return {setQuality,lights};
}
