import * as THREE from 'three';
const yieldFrame=()=>new Promise(resolve=>requestAnimationFrame(resolve));
export function trackStartupAssets(){
 const manager=THREE.DefaultLoadingManager,start=manager.itemStart,end=manager.itemEnd;let pending=0;
 manager.itemStart=function(url){pending++;return start.call(this,url);};
 manager.itemEnd=function(url){pending=Math.max(0,pending-1);return end.call(this,url);};
 return async()=>{const until=performance.now()+30000;let idle=0;while(idle<3&&performance.now()<until){await yieldFrame();idle=pending?0:idle+1;}return pending;};
}
export async function prepareFirstEntry(renderer,scene,camera,insideY){
 const started=performance.now(),textures=new Set();
 scene.traverse(object=>{for(const material of [].concat(object.material||[])){for(const value of Object.values(material))if(value?.isTexture)textures.add(value);for(const uniform of Object.values(material.uniforms||{}))if(uniform.value?.isTexture)textures.add(uniform.value);}});
 for(const value of [scene.background,scene.environment])if(value?.isTexture)textures.add(value);
 let uploaded=0;
 for(const texture of textures){
  if(texture.isVideoTexture||texture.isRenderTargetTexture||!texture.image)continue;
  const images=Array.isArray(texture.image)?texture.image:[texture.image];
  await Promise.all(images.map(image=>image?.decode?image.decode().catch(()=>{}):Promise.resolve()));
  renderer.initTexture(texture);uploaded++;if(uploaded%3===0)await yieldFrame();
 }
 scene.updateMatrixWorld(true);
 await renderer.compileAsync(scene,camera);
 // Draw each area once behind the unchanged loader to upload geometry and shadow buffers.
 const probe=camera.clone();
 for(const [position,target] of [[[0,insideY+3,40],[0,insideY+3,-10]],[[0,insideY+3,-44],[-29,insideY+4,-55]],[[0,insideY+3,-64],[29,insideY+4,-65]],[[0,insideY+3,-101],[0,insideY+4,-145]]]){
  probe.position.fromArray(position);probe.lookAt(...target);renderer.render(scene,probe);await yieldFrame();
 }
 renderer.render(scene,camera);await yieldFrame();
 return {textures:uploaded,programs:renderer.info.programs.length,durationMs:Math.round(performance.now()-started)};
}
