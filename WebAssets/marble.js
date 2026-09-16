import * as THREE from 'three';

// World-space UVs keep the same scale on merged walls, columns and instanced slabs.
export function marbleMaterial(url,scale=8,joints=true){
 const map=new THREE.TextureLoader().load(url);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;map.anisotropy=4;
 const material=new THREE.MeshStandardMaterial({map,color:0xffffff,roughness:.33,metalness:.035,envMapIntensity:.8});
 material.onBeforeCompile=shader=>{
  shader.vertexShader='varying vec3 vMarbleWorld; varying vec3 vMarbleNormal;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   vec4 marbleP=vec4(position,1.0);vec3 marbleN=normal;
   #ifdef USE_INSTANCING
    marbleP=instanceMatrix*marbleP;marbleN=mat3(instanceMatrix)*marbleN;
   #endif
   vMarbleWorld=(modelMatrix*marbleP).xyz;vMarbleNormal=normalize(mat3(modelMatrix)*marbleN);`);
  shader.fragmentShader='varying vec3 vMarbleWorld; varying vec3 vMarbleNormal; float marbleJoint;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`
   vec3 marbleN=abs(normalize(vMarbleNormal));
   vec2 marbleUV=marbleN.y>0.65?vMarbleWorld.xz:(marbleN.x>marbleN.z?vMarbleWorld.zy:vMarbleWorld.xy);
   marbleUV/=${scale.toFixed(1)};
   vec4 marbleSample=texture2D(map,marbleUV);
   vec2 tileEdge=min(fract(marbleUV),1.0-fract(marbleUV));
   float edge=min(tileEdge.x,tileEdge.y);
   marbleJoint=${joints?'1.0-smoothstep(0.0015-max(fwidth(marbleUV.x),fwidth(marbleUV.y)),0.004+max(fwidth(marbleUV.x),fwidth(marbleUV.y)),edge)':'0.0'};
   diffuseColor*=vec4(mix(marbleSample.rgb,vec3(.56,.62,.68),marbleJoint),marbleSample.a);`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,.24,marbleJoint);');
  shader.fragmentShader=shader.fragmentShader.replace('#include <metalnessmap_fragment>','#include <metalnessmap_fragment>\nmetalnessFactor=mix(metalnessFactor,.72,marbleJoint);');
 };
 material.customProgramCacheKey=()=>`ipu-marble-${scale}-${joints}`;
 return material;
}

export function createBeatController(scene,getAudioContext,music){
 let analyser,source,bytes,energy=0,average=.02,pulse=0,cooldown=0,enabled=!matchMedia('(prefers-reduced-motion: reduce)').matches,beats=0;
 const lights=()=>scene.children.filter(o=>o.isLight&&o.userData.beatBase);
 return {toggle(){enabled=!enabled;return enabled;},stats:()=>({enabled,energy,average,pulse,beats,connected:!!source,lights:lights().length}),update(dt){
  const ctx=getAudioContext();
  if(ctx&&!source){try{analyser=ctx.createAnalyser();analyser.fftSize=512;analyser.smoothingTimeConstant=.35;analyser.minDecibels=-100;analyser.maxDecibels=-25;bytes=new Uint8Array(analyser.frequencyBinCount);source=ctx.createMediaElementSource(music);source.connect(analyser);analyser.connect(ctx.destination);}catch(e){console.warn('Music-reactive lighting unavailable',e);}}
  cooldown=Math.max(0,cooldown-dt);pulse*=Math.exp(-dt*3.3);
  if(analyser&&!music.paused&&!music.muted){analyser.getByteFrequencyData(bytes);energy=0;for(let i=1;i<9;i++)energy+=bytes[i]/2040;average=THREE.MathUtils.damp(average,energy,.8,dt);if(energy>Math.max(.025,average*1.13)&&cooldown===0){pulse=1;cooldown=.48;beats++;}}
  else energy=0;
  const gain=enabled?.88+pulse*.28:1;
  lights().forEach(l=>{l.intensity=THREE.MathUtils.damp(l.intensity,l.userData.beatBase*gain,5,dt);});
  if(scene.userData.columnWash)scene.userData.columnWash.opacity=enabled?.8+pulse*.2:1;
 }};
}
