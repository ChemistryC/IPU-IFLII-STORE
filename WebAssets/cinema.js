import * as THREE from 'three';

export async function createCinema({scene,camera,insideY,stone,floor,silver,tex,collisionMeshes,interactableModels,music,travel,cursor}){
 const films=await (await fetch('WebAssets/Cinema/manifest.json')).json();
 const group=new THREE.Group();group.name='Cinema room';scene.add(group);
 const ceiling=new THREE.MeshBasicMaterial({color:0xd9dad8});
 const dark=new THREE.MeshStandardMaterial({color:0x18232f,roughness:.95});
 const trim=new THREE.MeshBasicMaterial({color:0xffd8a1,toneMapped:false});
 const parts=[];
 function box(w,h,d,x,y,z,mat,solid=false){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,insideY+y,z);group.add(m);parts.push(m);if(solid)collisionMeshes.push(m);return m;}
 box(84,.16,38,0,-.04,-131,floor);box(84,.3,38,0,20.5,-131,ceiling);
 box(.3,20.65,38,-42,10.325,-131,stone,true);box(.3,20.65,38,42,10.325,-131,stone,true);box(84,20.65,.3,0,10.325,-150,stone,true);
 box(26.6,15.25,.35,0,10,-148.5,dark);box(27,.04,.08,0,2.25,-148.22,trim);
 const screenMaterial=new THREE.MeshBasicMaterial({map:tex(films[0].poster),toneMapped:false});
 const screen=new THREE.Mesh(new THREE.PlaneGeometry(26,14.625),screenMaterial);screen.name='Cinema projection screen';screen.position.set(0,insideY+10,-148.27);group.add(screen);
 for(const z of [-124,-131,-138]){
  for(const x of [-16,-10,10,16]){
   box(4,.6,3.1,x,.5,z,dark,true);box(4,1.7,.45,x,1.62,z+1.35,dark,true);
   for(const side of [-1,1])box(.35,.95,3.1,x+side*1.9,1.0,z,silver,true);
  }
  for(const x of [-5.5,5.5])box(.055,.03,4.6,x,.075,z,trim);
 }
 // Two sliding leaves open from either side without changing the player's controls.
 const doorLeaves=[],doorBoxes=[new THREE.Box3(),new THREE.Box3()];scene.userData.cinemaDoorBoxes=doorBoxes;
 const doorMaterial=new THREE.MeshPhysicalMaterial({color:0xbac8cd,metalness:.16,roughness:.28,transparent:true,opacity:.88,envMapIntensity:.7});
 for(const side of [-1,1]){
  const leaf=new THREE.Mesh(new THREE.BoxGeometry(6.9,9.7,.24),doorMaterial);leaf.position.set(side*3.5,insideY+4.85,-111.7);leaf.name='Automatic cinema door '+side;group.add(leaf);doorLeaves.push(leaf);
  const edge=new THREE.Mesh(new THREE.BoxGeometry(.08,9.7,.29),silver);edge.position.x=-side*3.4;leaf.add(edge);
 }
 for(const x of [-7.15,7.15])box(.22,10,.45,x,5,-111.7,silver);
 box(14.5,.22,.45,0,10,-111.7,silver);
 let doorOpen=0;
 function updateDoor(dt){const near=Math.abs(camera.position.z+111.7)<13&&Math.abs(camera.position.x)<12;doorOpen=THREE.MathUtils.damp(doorOpen,near?1:0,2.2,dt);doorLeaves.forEach((leaf,i)=>{leaf.position.x=(i?1:-1)*(3.5+7.2*doorOpen);leaf.updateWorldMatrix(true,false);doorBoxes[i].setFromObject(leaf);});}
 const batches=new Map();for(const m of parts){if(!batches.has(m.material))batches.set(m.material,[]);batches.get(m.material).push(m);}
 for(const [mat,meshes]of batches){const inst=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),mat,meshes.length);meshes.forEach((m,i)=>{const p=m.geometry.parameters;inst.setMatrixAt(i,new THREE.Matrix4().compose(m.position,m.quaternion,new THREE.Vector3(p.width,p.height,p.depth)));m.visible=false;});inst.computeBoundingSphere();group.add(inst);}
 const video=document.createElement('video');video.className='cinema-video-source';video.preload='none';video.playsInline=true;video.controls=false;video.volume=.8;video.setAttribute('aria-label','IPU IFLII cinema video');document.body.append(video);
 const videoTexture=new THREE.VideoTexture(video);videoTexture.colorSpace=THREE.SRGBColorSpace;videoTexture.minFilter=THREE.LinearFilter;videoTexture.magFilter=THREE.LinearFilter;videoTexture.generateMipmaps=false;
 const panel=document.createElement('section');panel.className='atelier-ui cinema-controls';panel.hidden=true;panel.setAttribute('aria-label','Cinema controls');
 panel.innerHTML=`<div class="cinema-heading"><strong data-film-title>Choose a film</strong><button data-exit-cinema>Leave cinema</button></div><div class="cinema-tiles">${films.map((f,i)=>`<button data-film="${i}" aria-pressed="false"><img src="${f.poster}" alt="" loading="lazy"><span>${f.title}</span></button>`).join('')}</div><div class="cinema-transport"><button data-play disabled>Play</button><label class="cinema-seek-label">Time<input data-seek type="range" min="0" max="100" value="0" step=".1" aria-label="Video position"></label><output data-time>0:00 / 0:00</output><button data-mute>Mute</button><button data-fullscreen>Fullscreen</button></div><p data-film-status role="status">Select a tile to watch on the cinema screen.</p>`;
 document.body.append(panel);
 let selected=-1,active=false,restoreMusic=false,sequence=0;
 const status=message=>panel.querySelector('[data-film-status]').textContent=message;
 const clock=n=>`${Math.floor((n||0)/60)}:${Math.floor((n||0)%60).toString().padStart(2,'0')}`;
 function holdMusic(){if(!music.paused)restoreMusic=true;}
 function releaseMusic(){if(restoreMusic){restoreMusic=false;music.play().catch(()=>{});}}
 async function play(i){
  const request=++sequence;selected=i;menu=false;menuButtons.visible=false;showTransport();holdMusic();panel.querySelector('[data-film-title]').textContent=films[i].title;
  panel.querySelectorAll('[data-film]').forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)));
  status('Loading the selected film…');video.pause();video.src=films[i].video;video.load();
  try{await video.play();if(request!==sequence)return;screenMaterial.map=videoTexture;screenMaterial.needsUpdate=true;status('Playing on the cinema screen.');}catch(e){if(request!==sequence)return;status(e.name==='NotAllowedError'?'Press Play to start the film.':'The film could not play. Try its tile again.');}
  panel.querySelector('[data-play]').disabled=false;
 }
 function leave(){sequence++;video.pause();video.removeAttribute('src');video.load();panel.querySelector('[data-play]').disabled=true;status('Select a tile to watch on the cinema screen.');menu=true;menuButtons.visible=true;transport.visible=false;screenMaterial.map=menuTexture;screenMaterial.needsUpdate=true;screen.scale.y=1;releaseMusic();}
 let menu=true;
 const menuCanvas=document.createElement('canvas');menuCanvas.width=1920;menuCanvas.height=1080;const md=menuCanvas.getContext('2d');
 const menuTexture=new THREE.CanvasTexture(menuCanvas);menuTexture.colorSpace=THREE.SRGBColorSpace;
 const posters=await Promise.all(films.map(f=>new Promise(resolve=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>resolve(null);im.src=f.poster;})));
 function drawMenu(){md.fillStyle='#101820';md.fillRect(0,0,1920,1080);md.fillStyle='#c4b393';md.font='24px Arial';md.fillText('IPU IFLII / PRIVATE CINEMA',105,125);md.fillStyle='#f4f2ed';md.font='66px Georgia';md.fillText('Choose your film.',105,235);md.font='26px Arial';md.fillStyle='#aebbc4';md.fillText('Three stories. One world.',105,290);
 films.forEach((f,i)=>{const x=105+i*585;md.fillStyle='#25323d';md.fillRect(x,400,540,430);if(posters[i])md.drawImage(posters[i],x,400,540,304);md.fillStyle='#cfbaa0';md.font='22px Arial';md.fillText('0'+(i+1)+' / PLAY FILM',x+24,749);md.fillStyle='#ffffff';md.font='26px Arial';md.fillText(f.title,x+24,795,492);});md.fillStyle='#8b9ca8';md.font='23px Arial';md.fillText('Select a film on the screen to watch.',105,970);menuTexture.needsUpdate=true;}
 drawMenu();screenMaterial.map=menuTexture;
 const menuButtons=new THREE.Group();group.add(menuButtons);
 films.forEach((f,i)=>{const tile=new THREE.Mesh(new THREE.PlaneGeometry(26*540/1920,14.625*430/1080),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));tile.position.set((105+i*585+270)/1920*26-13,insideY+10+(540-615)/1080*14.625,-148.24);tile.name='Screen episode '+(i+1);tile.userData={cinemaAction:true,atelierAction:()=>{if(menu)play(i);else showTransport()}};menuButtons.add(tile);interactableModels.push(tile);});
 const transportCanvas=document.createElement('canvas');transportCanvas.width=1920;transportCanvas.height=210;const td=transportCanvas.getContext('2d');
 const transportTexture=new THREE.CanvasTexture(transportCanvas);transportTexture.colorSpace=THREE.SRGBColorSpace;
 function drawTransport(){td.clearRect(0,0,1920,210);td.fillStyle='rgba(10,17,24,.94)';td.fillRect(0,0,1920,210);td.fillStyle='#f5f0e6';td.font='34px Arial';td.fillText('‹ Back',75,70);td.fillText(video.paused?'▶ Play':'Ⅱ Pause',350,70);td.fillStyle='#c6b392';td.font='26px Arial';td.fillText(selected<0?'':films[selected].title,690,70,900);td.fillStyle='#53616b';td.fillRect(80,132,1760,7);const progress=Number.isFinite(video.duration)?video.currentTime/video.duration:0;td.fillStyle='#e5d2ad';td.fillRect(80,132,1760*progress,7);td.beginPath();td.arc(80+1760*progress,135,10,0,Math.PI*2);td.fill();td.fillStyle='#b7c2c9';td.font='23px Arial';td.fillText(clock(video.currentTime),80,186);td.textAlign='right';td.fillText(clock(video.duration),1840,186);td.textAlign='left';transportTexture.needsUpdate=true;}
 const transport=new THREE.Mesh(new THREE.PlaneGeometry(26,2.84),new THREE.MeshBasicMaterial({map:transportTexture,transparent:true,toneMapped:false,depthWrite:false}));transport.name='Cinema screen controls';transport.position.set(0,insideY+4.10,-148.23);transport.visible=false;group.add(transport);interactableModels.push(transport);
 let controlsUntil=0;
 function showTransport(){controlsUntil=performance.now()+3500;transport.visible=true;transport.material.opacity=1;}
 transport.userData={cinemaAction:true,atelierAction:hit=>{if(menu)return;if(!transport.visible){showTransport();return;}showTransport();const x=hit.uv.x,y=1-hit.uv.y;
  if(y>.46 && Number.isFinite(video.duration)){video.currentTime=THREE.MathUtils.clamp((x-80/1920)/(1760/1920),0,1)*video.duration;drawTransport();return;}
  if(x<.15){video.pause();menu=true;screen.scale.y=1;screenMaterial.map=menuTexture;screenMaterial.needsUpdate=true;menuButtons.visible=true;transport.visible=false;}
  else if(x<.34){if(video.paused)video.play().catch(()=>{});else video.pause();drawTransport();}
 }};
 video.addEventListener('timeupdate',drawTransport);video.addEventListener('play',drawTransport);video.addEventListener('pause',drawTransport);video.addEventListener('loadedmetadata',drawTransport);drawTransport();
 screen.userData={cinemaAction:true,atelierAction:()=>{if(menu||selected<0)return;showTransport();}};interactableModels.push(screen);
 const enter=()=>travel([0,insideY+2.9,-117],[0,insideY+8,-148]);
 panel.addEventListener('click',async e=>{e.stopPropagation();const b=e.target.closest('button');if(!b)return;
  if(b.dataset.film!==undefined){play(+b.dataset.film);return;}
  if(b.hasAttribute('data-exit-cinema')){leave();travel([9,insideY+2.9,-93],[0,insideY+3,-104]);}
  if(b.hasAttribute('data-play')){if(video.paused){holdMusic();video.play().then(()=>{screenMaterial.map=videoTexture;screenMaterial.needsUpdate=true;status('Playing on the cinema screen.');}).catch(()=>status('Choose a film tile to try again.'));}else video.pause();}
  if(b.hasAttribute('data-mute')){video.muted=!video.muted;b.textContent=video.muted?'Unmute':'Mute';}
  if(b.hasAttribute('data-fullscreen')){if(selected<0){status('Choose a film first.');return;}try{if(video.requestFullscreen)await video.requestFullscreen();else if(video.webkitEnterFullscreen)video.webkitEnterFullscreen();}catch{status('Fullscreen is unavailable in this browser.');}}
 });
 for(const name of ['mousedown','mouseup','pointerdown','touchstart','touchend'])panel.addEventListener(name,e=>e.stopPropagation());
 panel.addEventListener('keydown',e=>e.stopPropagation());
 panel.querySelector('[data-seek]').addEventListener('input',e=>{if(Number.isFinite(video.duration))video.currentTime=(+e.target.value/100)*video.duration;});
 video.addEventListener('loadedmetadata',()=>{screen.scale.y=(16/9)/(video.videoWidth/video.videoHeight);});
 video.addEventListener('play',()=>panel.querySelector('[data-play]').textContent='Pause');
 video.addEventListener('pause',()=>panel.querySelector('[data-play]').textContent='Play');
 video.addEventListener('ended',()=>{status('Film finished. Choose another tile to continue.');if(!active)releaseMusic();});
 video.addEventListener('error',()=>{if(video.getAttribute('src'))status('Video unavailable. Check that the Cinema files were uploaded.');});
 video.addEventListener('timeupdate',()=>{panel.querySelector('[data-time]').textContent=`${clock(video.currentTime)} / ${clock(video.duration)}`;if(Number.isFinite(video.duration))panel.querySelector('[data-seek]').value=video.currentTime/video.duration*100;});
 return {enter,play,stats:()=>({films:films.length,selected,playing:!video.paused,currentTime:video.currentTime,videoWidth:video.videoWidth,menu,doorOpen,controlsVisible:transport.visible}),update(modalOpen,dt=1/60){updateDoor(dt);if(!menu){const remaining=controlsUntil-performance.now();transport.material.opacity=Math.min(1,Math.max(0,remaining/400));transport.visible=remaining>0;}video.volume=.8*THREE.MathUtils.smoothstep(-camera.position.z,111.5,119);const inside=camera.position.z<-111.5;if(active!==inside){cursor(inside);if(inside)holdMusic();}if(active&&!inside)leave();if(modalOpen&&!video.paused)video.pause();active=inside;panel.hidden=true;document.body.classList.toggle('cinema-active',inside);}};
}
