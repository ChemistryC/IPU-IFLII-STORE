import {batchStaticArchitecture} from './WebAssets/performance.js';
import {currentCatalog} from './WebAssets/shop-catalog.js';

        import * as THREE from 'three';
        import { createAtelier } from './WebAssets/atelier.js';
import { marbleMaterial, createBeatController } from './WebAssets/marble.js';
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
        import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js';
        import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
        import { Reflector } from 'three/addons/objects/Reflector.js';
        import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
        import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
        import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
        import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';

        const webModelCache = new Map();
        let isTouchMode = window.matchMedia && window.matchMedia("(hover: none) and (pointer: coarse)").matches;
        const mobileControlsLabel = document.querySelector('.mobile-controls');
        if (mobileControlsLabel && isTouchMode) {
            mobileControlsLabel.style.display = 'inline';
        }

        let activeProductUrl = "";
        const quoteEl = document.getElementById('quote-container');
        let quoteOverride = false;
        let quoteHideTimer = null;

        function showNextQuoteOverride(text) {
            if (!quoteEl) return;
            quoteOverride = true;
            clearTimeout(quoteHideTimer);
            quoteEl.style.opacity = 0;
            setTimeout(() => {
                quoteEl.innerText = text;
                quoteEl.style.opacity = 1;
                quoteHideTimer = setTimeout(() => {
                    quoteOverride = false;
                    quoteEl.style.opacity = 0;
                    setTimeout(() => { if (!quoteOverride) quoteEl.innerText = ''; }, 1000);
                }, 5000);
            }, 400);
        }

        // All owned files resolve from the folder that contains index.html.
        // This stays portable on localhost, a subfolder, or a completely new domain.
        if(window.templeLocal) THREE.DefaultLoadingManager.setURLModifier(window.templeLocal.resolve);
        const assetUrl = (path) => new URL(String(path).replace(/^\/+/, ''), document.baseURI).href;

        const HOSTED_VIDEO_URLS = [
            "Videos/1.mp4",
            "Videos/2.mp4",
            "Videos/3.mp4",
            "Videos/Firefly 10 frames per second, an ancient greek celeb he walks,, keep the painting style, he smiles, (1).mp4",
            "Videos/Firefly 10 frames per second, an ancient greek celeb he walks,, keep the painting style, he smiles, .mp4",
            "Videos/Firefly 10 frames per second, an ancient greek celeb stands still with his sword, slight movements 8.mp4"
        ].map(assetUrl);
        const HOSTED_IMAGE_URLS = [
            "ChatGPT Image 3 Ιουλ 2026, 02_32_15 μ.μ..png",
            "ChatGPT Image 3 Ιουλ 2026, 02_37_28 μ.μ..png",
            "ChatGPT Image 3 Ιουλ 2026, 02_55_57 μ.μ..png",
            "ChatGPT Image 3 Ιουλ 2026, 02_56_01 μ.μ..png",
            "ChatGPT Image 3 Ιουλ 2026, 02_56_04 μ.μ..png",
            "ChatGPT Image 3 Ιουλ 2026, 02_58_11 μ.μ..png",
            "ChatGPT Image 3 Ιουλ 2026, 04_15_11 μ.μ..png",
            "ChatGPT Image 3 Ιουλ 2026, 04_18_23 μ.μ..png"
        ].map(name => assetUrl(`Videos/${name}`));

        const IS_FILE_PROTOCOL = location.protocol === "file:";

        let autoPlaylistPaths = ["Timeless/1 .mp3", "Timeless/103.mp3", "Timeless/105.mp3", "Timeless/106.mp3", "Timeless/107.mp3", "Timeless/109.mp3", "Timeless/11.mp3", "Timeless/113.mp3", "Timeless/114.mp3", "Timeless/115.mp3", "Timeless/116.mp3", "Timeless/117.mp3", "Timeless/118.mp3", "Timeless/119.mp3", "Timeless/120.mp3", "Timeless/121.mp3", "Timeless/122.mp3", "Timeless/123.mp3", "Timeless/125.mp3", "Timeless/126.mp3", "Timeless/127.mp3", "Timeless/128.mp3", "Timeless/130.mp3", "Timeless/131.mp3", "Timeless/132.mp3", "Timeless/133.mp3", "Timeless/134.mp3", "Timeless/135.mp3", "Timeless/136.mp3", "Timeless/137.mp3", "Timeless/138.mp3", "Timeless/139.mp3", "Timeless/140.mp3", "Timeless/141.mp3", "Timeless/142.mp3", "Timeless/144.mp3", "Timeless/145.mp3", "Timeless/146.mp3", "Timeless/147.mp3", "Timeless/148.mp3", "Timeless/150.mp3", "Timeless/151.mp3", "Timeless/152.mp3", "Timeless/154.mp3", "Timeless/155.mp3", "Timeless/156.mp3", "Timeless/157.mp3", "Timeless/158.mp3", "Timeless/159.mp3", "Timeless/160.mp3", "Timeless/161.mp3", "Timeless/162.mp3", "Timeless/163.mp3", "Timeless/164.mp3", "Timeless/165.mp3", "Timeless/166.mp3", "Timeless/167.mp3", "Timeless/168.mp3", "Timeless/169.mp3", "Timeless/19.mp3", "Timeless/23.mp3", "Timeless/25.mp3", "Timeless/27.mp3", "Timeless/29.mp3", "Timeless/3.mp3", "Timeless/34.mp3", "Timeless/38.mp3", "Timeless/39.mp3", "Timeless/44.mp3", "Timeless/5.mp3", "Timeless/58.mp3", "Timeless/64.mp3", "Timeless/68.mp3", "Timeless/70.mp3", "Timeless/74.mp3", "Timeless/76.mp3", "Timeless/77.mp3", "Timeless/78.mp3", "Timeless/79.mp3", "Timeless/8.mp3", "Timeless/80.mp3", "Timeless/84.mp3", "Timeless/85.mp3", "Timeless/87.mp3", "Timeless/88.mp3", "Timeless/89.mp3", "Timeless/90.mp3", "Timeless/91.mp3", "Timeless/92.mp3", "Timeless/95.mp3", "Timeless/96.mp3", "Timeless/99.mp3"].map(assetUrl);

        const blockerEl = document.getElementById('blocker');
        if (blockerEl) blockerEl.style.visibility = 'hidden';

        let loadingScreenHidden = false;
        const loadedAssetKeys = new Set();

        function markAssetLoaded(key) {
            loadedAssetKeys.add(key);document.documentElement.dataset.loadedAssets=Array.from(loadedAssetKeys).join(',');
        }

        function hideLoadingScreen() {
            if (loadingScreenHidden) return;
            loadingScreenHidden = true;
            const ls = document.getElementById('loading-screen');
            if (ls) {
                ls.classList.add('done');
                setTimeout(() => ls.remove(), 1200);
            }
            if (blockerEl) blockerEl.style.visibility = '';
        }

        let dynamicPlaylistNames = Array.from({ length: autoPlaylistPaths.length }, (_, i) => `Timeless ${i + 1}`);

        let customModelFile = null;
        let currentTrackIndex = 0;
        const statuePedestals = [];
        const interactableModels = [];
        let pedimentEmblemSpot = null;   // filled in when the pediment is built

        import {addSoftContacts} from './WebAssets/soft-contacts.js';
        import {createStoreLighting} from './WebAssets/store-lighting.js';
        const floorY = 22.0;
        const TEMPLE_RISE = 2.8;
        const COURTYARD_Y = 8.8; // Forty 0.4-unit steps reach the existing temple level.
        const insideY = floorY + TEMPLE_RISE;

        function groundHeightAt(x,z) {
            const halfWidth=z<-20?42:36;
            if(Math.abs(x)<halfWidth && z<=61.2 && z>=-149.7)return insideY;
            if(z>61.2 && z<109.2 && Math.abs(x)<36){
                return COURTYARD_Y+Math.ceil((109.2-z)/1.2)*.4;
            }
            return COURTYARD_Y;
        }

        const MODEL_URLS = {
            apollo: [
                "WebAssets/Models/ApolloStatue.glb", "Models/ApolloStatue.glb", "models/ApolloStatue.glb", "Models/apollostatue.glb", "models/apollostatue.glb", "ApolloStatue.glb",
            ],
            athena: [
                "WebAssets/Models/AthenaStatue.glb", "Models/AthenaStatue.glb", "models/AthenaStatue.glb", "Models/athenastatue.glb", "models/athenastatue.glb", "Models/Athena.glb", "Models/ATHENA.glb", "Models/athena.glb", "models/Athena.glb", "models/athena.glb", "AthenaStatue.glb", "Athena.glb", "ATHENA.glb",
            ],
            pegasus: [
                "WebAssets/Models/PegasusStatue.glb", "Models/PegasusStatue.glb", "models/PegasusStatue.glb", "Models/pegasusstatue.glb", "models/pegasusstatue.glb", "PegasusStatue.glb",
            ]
        };

        // ORDER MATTERS: this list is matched one-to-one with modelPositions
        // below, and each file is linked to a product in PRODUCTS_BY_MODEL.
        const SHIRT_MODEL_FILES = [
            "PEGASUS.glb", "Playyourharp.glb", "TIMELESSZIGZAG.glb", "TIMELESSZIGZAG2.glb", "ZIGZAG.glb", "ATLAS.glb", "IPUIFLII.glb", "IPUIFLIICLASSIC.glb", "IPUIFLIIHERCUES.glb", "IPU_IFLII_BLUE.glb"
        ];

        let sharedDraco=null;
        function createGLTFLoader() {
            if(!sharedDraco){sharedDraco=new DRACOLoader();sharedDraco.setDecoderPath('./WebAssets/vendor/three/examples/jsm/libs/draco/');sharedDraco.setWorkerLimit(2);}
            return new GLTFLoader().setDRACOLoader(sharedDraco);
        }
        const SHIRT_MODEL_URLS = Object.fromEntries(
            SHIRT_MODEL_FILES.map(name => [name.toLowerCase(), [
                `WebAssets/Designs/${name}`, `Designs/${name}`, `designs/${name}`, name
            ]])
        );

        if (IS_FILE_PROTOCOL) {
            for (const key of Object.keys(MODEL_URLS)) {
                MODEL_URLS[key] = MODEL_URLS[key].filter(u => !u.startsWith("http"));
            }
            for (const key of Object.keys(SHIRT_MODEL_URLS)) {
                SHIRT_MODEL_URLS[key] = SHIRT_MODEL_URLS[key].filter(u => !u.startsWith("http"));
            }
        }

        document.querySelectorAll('.reception-btn[data-answer]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const box = document.getElementById('reception-answer');
                if (box) {
                    box.style.display = 'block';
                    box.innerText = btn.dataset.answer;
                }
                document.querySelectorAll('.reception-btn').forEach((b) => {
                    b.classList.toggle('active-item', b === btn);
                });
            });
        });

        const statueInput = document.getElementById('statue-input');
        const statueBtnLabel = document.getElementById('statue-btn-label');
        const statueStatus = document.getElementById('statue-status');

        const musicInput = document.getElementById('music-input');
        const musicBtnLabel = document.getElementById('music-btn-label');
        const musicStatusText = document.getElementById('music-status-text');

        const enterText = document.getElementById('enter-text');
        const previewBtn = document.getElementById('preview-btn');

        let isPreviewMode = false;
        let isReceptionOpen = false;

        function copyToClipboard(text, labelElement, originalText) {
            const el = document.createElement('textarea');
            el.value = text;
            el.style.position = 'absolute';
            el.style.left = '-9999px';
            document.body.appendChild(el);
            el.select();
            try { document.execCommand('copy'); } catch (err) {}
            document.body.removeChild(el);
            if (labelElement) {
                labelElement.innerText = "Path copied. Paste it in Explorer.";
                setTimeout(() => labelElement.innerText = originalText, 3000);
            }
        }

        if (statueBtnLabel) {
            statueBtnLabel.addEventListener('click', () => {
                copyToClipboard('.\\Models', statueBtnLabel, 'Locate statues folder (GLB)');
            });
        }

        if (musicBtnLabel) {
            musicBtnLabel.addEventListener('click', () => {
                copyToClipboard('.\\Timeless', musicBtnLabel, 'Locate music folder');
            });
        }

        function checkReadyToEnter() {
            if (enterText) {
                enterText.style.display = 'block';
                if (previewBtn) previewBtn.style.display = 'inline-block';
            }
        }

        if (musicInput) {
            musicInput.addEventListener('change', (e) => {
                const files = Array.from(e.target.files).filter(f => f.type.startsWith('audio/') || f.name.toLowerCase().endsWith('.wav') || f.name.toLowerCase().endsWith('.mp3'));
                if (files.length > 0) {
                    autoPlaylistPaths = files.map(file => URL.createObjectURL(file));
                    dynamicPlaylistNames = files.map(file => file.name.replace(/\.[^/.]+$/, ""));

                    musicBtnLabel.style.display = 'none';
                    musicStatusText.innerText = `${files.length} tracks ready to play.`;
                    checkReadyToEnter();
                }
            });
        }

        function addStatueUplight(x,z,height){
            const light=new THREE.SpotLight(0xff8c3a,115,20,.62,.85,1.4);
            light.position.set(x,insideY+.2,z+2.5);light.target.position.set(x,insideY+height*.6,z);
            light.userData.beatBase=115;light.name='Orange statue uplight';light.castShadow=false;scene.add(light,light.target);
        }
        async function loadAndPlaceStatue(url, fileName) {
            const gltfLoader = createGLTFLoader();
            const gltf = await new Promise((resolve, reject) => {
                gltfLoader.load(url, resolve, undefined, reject);
            });

            renderer.shadowMap.needsUpdate=true;
            const object = gltf.scene;
            object.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    if (child.material) {
                        const mats = Array.isArray(child.material) ? child.material : [child.material];
                        mats.forEach((m) => {
                            m.roughness = 0.82;
                            m.metalness = 0.05;
                            m.side = THREE.DoubleSide;
                        });
                    }
                }
            });

            const originalBox = new THREE.Box3().setFromObject(object);
            const originalSize = originalBox.getSize(new THREE.Vector3());

            function makePreparedModel(targetHeight) {
                const cloned = object.clone(true);
                cloned.scale.setScalar(targetHeight / originalSize.y);

                const scaledBox = new THREE.Box3().setFromObject(cloned);
                const center = scaledBox.getCenter(new THREE.Vector3());

                const wrapper = new THREE.Group();
                cloned.position.x = -center.x;
                cloned.position.z = -center.z;
                cloned.position.y = -scaledBox.min.y;
                wrapper.add(cloned);
                return wrapper;
            }

            const name = fileName.toLowerCase();

            if (name.includes("athena")) {
                const athena = makePreparedModel(6.2);
                athena.position.set(-6.5, insideY + 0.05, 52.0);
                athena.rotation.y = Math.PI;
                scene.add(athena);athena.name="Athena";
                athena.traverse((child) => {
                    if (child.isMesh) interactableModels.push(child);
                });
            } else if (name.includes("apollo")) {
                const apollo = makePreparedModel(6.2);
                apollo.position.set(6.5, insideY + 0.05, 52.0);
                apollo.rotation.y = Math.PI;
                scene.add(apollo);apollo.name="Apollo";
                apollo.traverse((child) => {
                    if (child.isMesh) interactableModels.push(child);
                });
            } else if (name.includes("pegasus")) {
                const emblem=makePreparedModel(10.0);
                emblem.name='Monumental Pegasus / original material';
                emblem.position.set(0,insideY+.3,-15);emblem.rotation.y=-Math.PI/2;
                scene.add(emblem);
                emblem.traverse(child=>{if(child.isMesh)interactableModels.push(child);});
            }
        }

        async function loadFirstAvailableModel(urlCandidates, filename) {
            let lastError = null;
            for (const url of urlCandidates) {
                try {
                    await loadAndPlaceStatue(url, filename);
                    return url;
                } catch (error) {
                    lastError = error;
                    console.warn(`Model attempt failed: ${url}`, error);
                }
            }
            throw lastError || new Error(`No working URL found for ${filename}`);
        }

        const shirtModelSources = new Map();
        let shirtDisplaysBuilt = false;

        function normalizeFileName(name) {
            return String(name || '').split(/[\\/]/).pop().toLowerCase();
        }

        function registerShirtSource(name, url) {
            const key = normalizeFileName(name);
            if (SHIRT_MODEL_FILES.some(file => file.toLowerCase() === key)) {
                shirtModelSources.set(key, url);
                return true;
            }
            return false;
        }

        async function autoLocateShirtModels() {
            shirtModelSources.clear();
            for (const fileName of SHIRT_MODEL_FILES) {
                registerShirtSource(fileName, new URL(`WebAssets/Designs/${fileName}`, document.baseURI).href);
            }
            shirtDisplaysBuilt = false;
            await buildShirtModelDisplays(true);
            return shirtModelSources.size;
        }

        window.addEventListener('dragover', (e) => e.preventDefault());
        window.addEventListener('drop', async (e) => {
            e.preventDefault();
            const files = Array.from(e.dataTransfer.files || []);
            const glbs = files.filter(f => f.name.toLowerCase().endsWith('.glb'));
            if (glbs.length === 0) return;
            if (statueStatus) statueStatus.innerText = 'Loading dropped statues...';
            let ok = 0;
            for (const f of glbs) {
                const url = URL.createObjectURL(f);
                try {
                    await loadAndPlaceStatue(url, f.name.toLowerCase());
                    ok++;
                } catch (err) {
                    console.error('Dropped GLB failed:', f.name, err);
                }
            }
            if (statueStatus) statueStatus.innerText = 'Placed ' + ok + ' dropped model(s) in position.';
            if (ok > 0 && statueBtnLabel) statueBtnLabel.style.display = 'none';
            checkReadyToEnter();
        });

        async function autoLoadHostedStatues() {
            if (statueStatus) statueStatus.innerText = "Loading Apollo, Athena and Pegasus";

            const hostedModels = [
                [MODEL_URLS.apollo, "ApolloStatue.glb"],
                [MODEL_URLS.athena, "AthenaStatue.glb"],
                [MODEL_URLS.pegasus, "Pegasus.glb"]
            ];

            let loaded = 0;
            const failedNames = [];

            for (const [urls, filename] of hostedModels) {
                try {
                    const workingUrl = await loadFirstAvailableModel(urls, filename);
                    console.info(`Loaded ${filename} from ${workingUrl}`);
                    loaded++;
                    markAssetLoaded(`statue:${filename.toLowerCase()}`);
                } catch (error) {
                    failedNames.push(filename);
                    console.error(`Could not load ${filename}.`, error);
                }
            }

            if (loaded === hostedModels.length) {
                if (statueStatus) statueStatus.innerText = "Apollo, Athena and the monumental Pegasus loaded.";
                if (statueBtnLabel) statueBtnLabel.style.display = "none";
            } else {
                const failedText = failedNames.join(", ");
                if (statueStatus) statueStatus.innerText = `Loaded ${loaded}/3 models. Missing: ${failedText}`;
                if (statueBtnLabel) statueBtnLabel.style.display = "inline-block";
            }
            checkReadyToEnter();
        }
        const statuesReady=new Promise(resolve=>setTimeout(()=>autoLoadHostedStatues().then(resolve),1800));

        if (statueInput) {
            statueInput.addEventListener('change', async (e) => {
                const files = Array.from(e.target.files).filter(f => f.name.toLowerCase().endsWith('.glb'));
                if (files.length > 0) {
                    customModelFile = files[0];
                    statueBtnLabel.style.display = 'none';
                    statueStatus.innerText = `Loading statues...`;
                    for (const file of files) {
                        const url = URL.createObjectURL(file);
                        try {
                            await loadAndPlaceStatue(url, file.name.toLowerCase());
                        } catch (error) {
                            console.error("Error loading GLB:", error);
                        }
                    }
                    if (statueStatus) statueStatus.innerText = `Statues placed.`;
                    checkReadyToEnter();
                }
            });
        }

        if (previewBtn) {
            previewBtn.addEventListener('click', (e) => {
                isPreviewMode = true;
                if (blocker) blocker.style.display = 'none';
                if (window.matchMedia && window.matchMedia("(hover: none) and (pointer: coarse)").matches) {
                    isTouchMode = true;
                }
                if (!isTouchMode) {
                    safeLockControls();
                } else {
                    const jl = document.getElementById('joysticks-layer');
                    if (jl) jl.style.display = 'block';
                }
                initAudio();
            });
        }

        let audioCtx, shootingStarSfxGain;
        const windAudio = new Audio('Sounds/wind.wav');
        const poolAudio = new Audio('Sounds/water%20fountain.wav');
        const activeStarSounds = new Set();
        const shootingStarAudioPaths = Array.from({ length: 4 }, (_, i) => `Sounds/star${i + 1}.wav`);
        [windAudio, poolAudio].forEach(audio => {
            audio.loop = true;
            audio.preload = 'none';
            audio.playsInline = true;
            audio.volume = 0;
        });
        let musicAudio = new Audio();
        musicAudio.preload = "auto";
        musicAudio.playsInline = true;
        let isAudioInit = false;
        const MUSIC_DAY_START_HOUR = 1;
        const FALLBACK_TRACK_DURATION = 210;
        const MUSIC_DURATION_CACHE_KEY = 'ipu-iflii-track-durations-v1';
        let trackDurations = [160.026, 163.788, 191.007, 114.984, 178.632, 123.864, 144.927, 84.96, 150.792, 155.952, 179.88, 132.792, 141.624, 165.744, 111.504, 151.224, 119.904, 150.84, 74.904, 95.424, 130.56, 109.224, 130.512, 188.544, 197.304, 182.544, 189.6, 189.6, 222.72, 218.52, 145.789, 124.992, 139.833, 48.312, 112.824, 124.8, 95.64, 154.358, 223.164, 105.6, 188.552, 152.189, 220.996, 36.96, 152.346, 176.953, 61.08, 192.235, 162.847, 176.953, 192.235, 120.0, 192.235, 162.847, 119.76, 214.282, 171.05, 121.944, 156.97, 145.006, 124.392, 161.646, 132.024, 185.443, 172.278, 133.632, 160.836, 60.504, 136.224, 150.126, 83.76, 137.718, 124.92, 147.435, 133.752, 141.244, 129.312, 141.244, 142.89, 199.915, 144.588, 136.803, 120.0, 137.117, 142.315, 131.4, 159.033, 154.645, 159.086, 233.561, 248.398, 291.971, 206.707, 201.43, 154.331, 191.478, 172.931, 152.398, 164.571, 197.355, 144.875, 479.399, 143.647, 119.712, 197.355, 214.439, 194.952, 157.884, 145.006, 144.797, 140.722, 122.352, 170.005, 139.651, 176.849, 152.451, 108.384, 124.944, 172.33, 109.704, 162.792];
        let scheduledStartOffset = 0;
        let lastMusicClockSync = 0;
        let marqueeCanvas, marqueeCtx, marqueeTexture;

        function loadCachedTrackDurations() {
            try {
                const cached = JSON.parse(localStorage.getItem(MUSIC_DURATION_CACHE_KEY) || '[]');
                if (Array.isArray(cached) && cached.length === autoPlaylistPaths.length) {
                    trackDurations = cached.map(value => Number.isFinite(value) && value > 1 ? value : FALLBACK_TRACK_DURATION);
                }
            } catch (error) {}
        }

        function getDailyMusicPosition(now = new Date()) {
            const anchor = new Date(now);
            anchor.setHours(MUSIC_DAY_START_HOUR, 0, 0, 0);
            if (now < anchor) anchor.setDate(anchor.getDate() - 1);

            const durations = autoPlaylistPaths.map((_, index) => trackDurations[index] || FALLBACK_TRACK_DURATION);
            const cycleDuration = durations.reduce((sum, duration) => sum + duration, 0);
            let elapsed = ((now.getTime() - anchor.getTime()) / 1000) % cycleDuration;

            for (let index = 0; index < durations.length; index++) {
                if (elapsed < durations[index]) return { index, offset: elapsed };
                elapsed -= durations[index];
            }
            return { index: 0, offset: 0 };
        }

        function discoverTrackDurations() {
            // Durations were measured from the supplied files at build time: no 168 metadata downloads.
        }

        function updateMarqueeText(text) {
            if (!marqueeCtx || !marqueeTexture) return;
            marqueeCtx.fillStyle = '#ffffff';
            marqueeCtx.fillRect(0, 0, marqueeCanvas.width, marqueeCanvas.height);
            marqueeCtx.fillStyle = '#14161a';
            marqueeCtx.font = '500 46px "Helvetica Neue", Helvetica, Arial, sans-serif';
            marqueeCtx.textAlign = 'center';
            marqueeCtx.textBaseline = 'middle';
            marqueeCtx.fillText("NOW PLAYING \u2014 " + text, marqueeCanvas.width / 2, marqueeCanvas.height / 2);
            marqueeTexture.needsUpdate = true;
        }

        function startMusic() {
            if (autoPlaylistPaths.length === 0) {
                if (musicStatusText) musicStatusText.innerText = "No tracks in the playlist.";
                return;
            }

            loadCachedTrackDurations();
            const dailyPosition = getDailyMusicPosition();
            currentTrackIndex = dailyPosition.index;
            scheduledStartOffset = dailyPosition.offset;
            musicAudio.preload = "auto";
            musicAudio.volume = 0.01;

            let failedTracks = 0;
            let switchingTrack = false;

            const playCurrent = async () => {
                if (switchingTrack) return;
                switchingTrack = true;

                if (currentTrackIndex >= autoPlaylistPaths.length) currentTrackIndex = 0;
                const currentFileUrl = autoPlaylistPaths[currentTrackIndex];
                const cleanName = dynamicPlaylistNames[currentTrackIndex] ||
                    decodeURIComponent(currentFileUrl.split('/').pop().replace(/\.[^/.]+$/, ""));

                musicAudio.pause();
                musicAudio.src = currentFileUrl;
                musicAudio.load();
                musicAudio.addEventListener('loadedmetadata', () => {
                    if (scheduledStartOffset > 0 && Number.isFinite(musicAudio.duration)) {
                        musicAudio.currentTime = Math.min(scheduledStartOffset, Math.max(0, musicAudio.duration - 0.15));
                    }
                    scheduledStartOffset = 0;
                }, { once: true });
                updateMarqueeText(cleanName);

                if (musicStatusText) {
                    musicStatusText.innerText = `Loading track ${currentTrackIndex + 1} of ${autoPlaylistPaths.length}...`;
                }

                try {
                    await musicAudio.play();
                    failedTracks = 0;
                    if (musicStatusText) {
                        musicStatusText.innerText = `Now playing: ${cleanName}`;
                    }
                } catch (error) {
                    console.warn("Could not start audio:", currentFileUrl, error);
                    if (error && error.name === "NotAllowedError") {
                        if (musicStatusText) musicStatusText.innerText = "Click once more to allow music playback.";
                    } else if (retryTrackWithHostedCopy()) {
                        switchingTrack = false;
                        setTimeout(playCurrent, 200);
                        return;
                    } else {
                        failedTracks++;
                        currentTrackIndex = (currentTrackIndex + 1) % autoPlaylistPaths.length;
                        if (musicStatusText) {
                            musicStatusText.innerText = `Track unavailable. Trying the next one (${failedTracks}/${autoPlaylistPaths.length})...`;
                        }
                        switchingTrack = false;
                        if (failedTracks < autoPlaylistPaths.length) setTimeout(playCurrent, 350);
                        return;
                    }
                }

                switchingTrack = false;
            };

            musicAudio.onended = () => {
                currentTrackIndex = (currentTrackIndex + 1) % autoPlaylistPaths.length;
                scheduledStartOffset = 0;
                playCurrent();
            };

            function retryTrackWithHostedCopy() {
                const cur = autoPlaylistPaths[currentTrackIndex];
                if (cur && !cur.startsWith("http") && !cur.startsWith("blob:")) {
                    console.info("Retrying track from hosted copy:", autoPlaylistPaths[currentTrackIndex]);
                    return true;
                }
                return false;
            }

            musicAudio.onerror = () => {
                console.warn("Audio file failed:", musicAudio.currentSrc || musicAudio.src);
                failedTracks++;
                currentTrackIndex = (currentTrackIndex + 1) % autoPlaylistPaths.length;
                switchingTrack = false;

                if (failedTracks >= autoPlaylistPaths.length) {
                    if (musicStatusText) {
                        musicStatusText.innerText = "No hosted tracks could load. Check that 1.mp3 to 108.mp3 exist in /Timeless/ and are public.";
                    }
                    if (musicBtnLabel) musicBtnLabel.style.display = "inline-block";
                    return;
                }

                if (musicStatusText) musicStatusText.innerText = "Track unavailable. Trying the next one...";
                setTimeout(playCurrent, 350);
            };

            playCurrent();
            discoverTrackDurations();
        }

        function syncMusicToClock(force = false) {
            if (!musicAudio.src || autoPlaylistPaths.length === 0) return;
            const position = getDailyMusicPosition();
            const drift = position.index === currentTrackIndex ? Math.abs((musicAudio.currentTime || 0) - position.offset) : Infinity;
            if (!force && drift < 8) return;

            currentTrackIndex = position.index;
            scheduledStartOffset = position.offset;
            musicAudio.src = autoPlaylistPaths[currentTrackIndex];
            musicAudio.load();
            musicAudio.addEventListener('loadedmetadata', () => {
                if (Number.isFinite(musicAudio.duration)) {
                    musicAudio.currentTime = Math.min(scheduledStartOffset, Math.max(0, musicAudio.duration - 0.15));
                }
                scheduledStartOffset = 0;
                if (!musicMutedByMenu) musicAudio.play().catch(() => {});
            }, { once: true });
            updateMarqueeText(dynamicPlaylistNames[currentTrackIndex] || `Timeless ${currentTrackIndex + 1}`);
        }

        function initAudio() {
            if (isAudioInit) return;
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) return;

            try {
                audioCtx = new AudioContextClass();
                shootingStarSfxGain = audioCtx.createGain();
                shootingStarSfxGain.gain.value = 1;
                shootingStarSfxGain.connect(audioCtx.destination);

                // Browsers allow these hosted ambience loops after the same
                // first click/touch that initializes the rest of the audio.
                windAudio.play().catch(() => {});
                poolAudio.play().catch(() => {});

                startMusic();
                isAudioInit = true;
            } catch (e) {
                console.warn("Audio Context initialization failed.", e);
            }
        }

        const scene = new THREE.Scene();
        const cssScene = new THREE.Scene();
        // Keep the temple crisp while softly hiding the distant ground edge.
        scene.fog = new THREE.Fog(0x7287a7, 210, 520);

        let flickeringStars = null;
        let horizonAtmosphere = null;
        let skyDome = null;
        let skyLayerLeft = null;
        let skyLayerRight = null;
        let layeredSkyActive = false;
        let groundFogSheet = null;
        let skyRotationAngle = 0;
        let shootingStar = null;
        let shootingStarStartedAt = -1;
        let nextShootingStarAt = 0;
        const shootingStarStart = new THREE.Vector3();
        const shootingStarEnd = new THREE.Vector3();
        const shootingStarStartNDC = new THREE.Vector2();
        const shootingStarEndNDC = new THREE.Vector2();

        function applySkyTexture(texture) {
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            texture.minFilter = THREE.LinearFilter;

            if (!skyDome) {
                const geometry = new THREE.SphereGeometry(1900, 64, 36);
                const material = new THREE.MeshBasicMaterial({
                    map: texture,
                    side: THREE.BackSide,
                    depthWrite: false,
                    depthTest: false,
                    fog: false
                });
                skyDome = new THREE.Mesh(geometry, material);
                skyDome.renderOrder = -10000;
                skyDome.frustumCulled = false;
                scene.add(skyDome);
            } else {
                if (skyDome.material.map && skyDome.material.map !== texture) {
                    skyDome.material.map.dispose();
                }
                skyDome.material.map = texture;
                skyDome.material.needsUpdate = true;
            }
            scene.background = null;
        }

        function applyMovingSkyLayer(texture, direction) {
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            texture.minFilter = THREE.LinearFilter;
            const geometry = new THREE.SphereGeometry(direction < 0 ? 1885 : 1870, 48, 24);
            const material = new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.BackSide,
                transparent: true,
                opacity: 0.52,
                depthWrite: false,
                depthTest: true,
                fog: false
            });
            const layer = new THREE.Mesh(geometry, material);
            layer.renderOrder = direction < 0 ? -9999 : -9998;
            layer.frustumCulled = false;
            layer.userData.skyDirection = direction;
            scene.add(layer);
            if (direction < 0) {
                if (skyLayerLeft) {
                    scene.remove(skyLayerLeft);
                    skyLayerLeft.geometry.dispose();
                    skyLayerLeft.material.map.dispose();
                    skyLayerLeft.material.dispose();
                }
                skyLayerLeft = layer;
            } else {
                if (skyLayerRight) {
                    scene.remove(skyLayerRight);
                    skyLayerRight.geometry.dispose();
                    skyLayerRight.material.map.dispose();
                    skyLayerRight.material.dispose();
                }
                skyLayerRight = layer;
            }
        }

        function loadSkyImage(url, statusElement) {
            new THREE.TextureLoader().load(url, (texture) => {
                applySkyTexture(texture);
                markAssetLoaded('sky');if (statusElement) statusElement.textContent = 'Sky.png loaded.';
            }, undefined, () => {
                if (statusElement) statusElement.textContent = 'Select Sky.png manually to allow offline access.';
            });
        }

        function createTimelessSky() {
            const canvas = document.createElement('canvas');
            canvas.width = 2048;
            canvas.height = 1024;
            const ctx = canvas.getContext('2d');

            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0.00, "#13294e");
            gradient.addColorStop(0.28, "#294c7f");
            gradient.addColorStop(0.56, "#6c83ad");
            gradient.addColorStop(0.82, "#a6a4b9");
            gradient.addColorStop(1.00, "#d0bca5");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const sunGlow = ctx.createRadialGradient(
                canvas.width * 0.72, canvas.height * 0.42, 10,
                canvas.width * 0.72, canvas.height * 0.42, 360
            );
            sunGlow.addColorStop(0, "rgba(255,249,225,0.62)");
            sunGlow.addColorStop(0.20, "rgba(255,232,185,0.28)");
            sunGlow.addColorStop(1, "rgba(255,255,255,0)");
            ctx.fillStyle = sunGlow;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const texture = new THREE.CanvasTexture(canvas);
            applySkyTexture(texture);

            // Prefer the user's painted sky when it is beside this file in
            // Images/Sky.png. The generated gradient remains as fallback.
            loadSkyImage('WebAssets/Environment/sky.webp', document.getElementById('sky-status'));
        }

        function createHorizonAtmosphere() {
            // Full distant horizon around the map. Depth testing keeps this
            // atmospheric shell behind the temple and every solid object.
            const geometry = new THREE.SphereGeometry(1150, 64, 32);
            const material = new THREE.ShaderMaterial({
                transparent: true,
                depthWrite: false,
                depthTest: true,
                side: THREE.BackSide,
                blending: THREE.AdditiveBlending,
                uniforms: {
                    uCool: { value: new THREE.Color(0xb9ddf3) },
                    uWarm: { value: new THREE.Color(0xffead0) },
                    uStrength: { value: 0.12 }
                },
                vertexShader: `
                    varying vec3 vDirection;
                    void main() {
                        vDirection = normalize(position);
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    varying vec3 vDirection;
                    uniform vec3 uCool;
                    uniform vec3 uWarm;
                    uniform float uStrength;
                    void main() {
                        float y = vDirection.y;
                        float horizon = exp(-pow(abs(y + 0.025) * 5.1, 1.55));
                        float lowerWarmth = smoothstep(0.14, -0.19, y);
                        vec3 colour = mix(uCool, uWarm, lowerWarmth * 0.68);
                        float fade = horizon * uStrength;
                        gl_FragColor = vec4(colour, fade);
                    }
                `
            });
            horizonAtmosphere = new THREE.Mesh(geometry, material);
            horizonAtmosphere.position.set(0, floorY + 12, 0);
            horizonAtmosphere.renderOrder = -900;
            horizonAtmosphere.frustumCulled = false;
            scene.add(horizonAtmosphere);
        }

        function makeCloudTexture() {
            const c = document.createElement('canvas');
            c.width = 256;
            c.height = 128;
            const ctx = c.getContext('2d');
            for (let i = 0; i < 22; i++) {
                const x = 40 + Math.random() * 176;
                const y = 44 + Math.random() * 44;
                const r = 16 + Math.random() * 26;
                const g = ctx.createRadialGradient(x, y, 0, x, y, r);
                g.addColorStop(0, 'rgba(255,255,255,0.55)');
                g.addColorStop(0.6, 'rgba(255,255,255,0.22)');
                g.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fill();
            }
            const tex = new THREE.CanvasTexture(c);
            tex.colorSpace = THREE.SRGBColorSpace;
            return tex;
        }

        function createClouds() {
            const tex = makeCloudTexture();
            for (let i = 0; i < 16; i++) {
                const mat = new THREE.SpriteMaterial({
                    map: tex, color: 0x7d91b4, transparent: true, opacity: 0.25 + Math.random() * 0.2, depthWrite: false, fog: false
                });
                const cloud = new THREE.Sprite(mat);
                const angle = Math.random() * Math.PI * 2;
                const dist = 250 + Math.random() * 650;
                cloud.position.set(
                    Math.cos(angle) * dist,
                    floorY + 130 + Math.random() * 120,
                    Math.sin(angle) * dist
                );
                const w = 160 + Math.random() * 240;
                cloud.scale.set(w, w * 0.42, 1);
                cloud.userData.driftSpeed = 1.2 + Math.random() * 1.8;
                clouds.push(cloud);
                scene.add(cloud);
            }
        }

        function createShootingStar() {
            shootingStar = new THREE.Group();
            shootingStar.userData.segments = [];
            for (let i = 0; i < 18; i++) {
                const geometry = new THREE.BufferGeometry();
                geometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, 0], 3));
                const material = new THREE.LineBasicMaterial({
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false,
                    depthTest: true,
                    fog: false
                });
                const segment = new THREE.Line(geometry, material);
                shootingStar.userData.segments.push(segment);
                shootingStar.add(segment);
            }
            shootingStar.renderOrder = -800;
            shootingStar.visible = false;
            scene.add(shootingStar);
            nextShootingStarAt = performance.now() + 700 + Math.random() * 900;
        }

        function shootingStarPointAtDepth(ndcPoint, target, depth = 620) {
            target.set(ndcPoint.x, ndcPoint.y, 0.5).unproject(camera);
            target.sub(camera.position).normalize().multiplyScalar(depth).add(camera.position);
            return target;
        }

        function isCameraInsideTemple() {
            return camera.position.z < 62 && camera.position.z > -151 && Math.abs(camera.position.x) < 43;
        }

        function playShootingStarSound() {
            if (!isAudioInit || isCameraInsideTemple()) return;
            const starSound = new Audio(shootingStarAudioPaths[Math.floor(Math.random() * shootingStarAudioPaths.length)]);
            starSound.preload = 'auto';
            starSound.playsInline = true;
            starSound.volume = 0.075;
            starSound.playbackRate = 1.14 + Math.random() * 0.10;
            activeStarSounds.add(starSound);starSound.onended=()=>activeStarSounds.delete(starSound);starSound.play().catch(() => activeStarSounds.delete(starSound));
        }

        function updateShootingStar(time) {
            if (!shootingStar) return;
            if(isCameraInsideTemple()){shootingStar.visible=false;shootingStarStartedAt=-1;nextShootingStarAt=time+2000;return;}
            if (shootingStarStartedAt < 0 && time >= nextShootingStarAt) {
                // Choose point A inside the visible upper sky so every audible
                // event has a star the player can actually see.
                shootingStarStartNDC.set(
                    -0.82 + Math.random() * 1.64,
                    0.48 + Math.random() * 0.38
                );
                shootingStarPointAtDepth(shootingStarStartNDC, shootingStarStart, 220);
                shootingStarEnd.set(0, floorY + 1.2, -56);
                playShootingStarSound();
                shootingStarStartedAt = time;
                shootingStar.visible = true;
            }
            if (shootingStarStartedAt >= 0) {
                const elapsed = time - shootingStarStartedAt;
                const travelDuration = 560;
                const totalDuration = 920;
                const p = Math.min(1, elapsed / travelDuration);
                const tailLength = 0.34;
                const segments = shootingStar.userData.segments;
                const globalFade = elapsed <= travelDuration
                    ? 1
                    : 1 - THREE.MathUtils.smoothstep(elapsed, travelDuration, totalDuration);
                for (let i = 0; i < segments.length; i++) {
                    const segment = segments[i];
                    const t0 = Math.max(0, p - tailLength + tailLength * (i / segments.length));
                    // Occupy only part of each slot, leaving a visible dotted gap.
                    const t1 = Math.max(0, p - tailLength + tailLength * ((i + 0.42) / segments.length));
                    const positions = segment.geometry.attributes.position.array;
                    positions[0] = THREE.MathUtils.lerp(shootingStarStart.x, shootingStarEnd.x, t0);
                    positions[1] = THREE.MathUtils.lerp(shootingStarStart.y, shootingStarEnd.y, t0);
                    positions[2] = THREE.MathUtils.lerp(shootingStarStart.z, shootingStarEnd.z, t0);
                    positions[3] = THREE.MathUtils.lerp(shootingStarStart.x, shootingStarEnd.x, t1);
                    positions[4] = THREE.MathUtils.lerp(shootingStarStart.y, shootingStarEnd.y, t1);
                    positions[5] = THREE.MathUtils.lerp(shootingStarStart.z, shootingStarEnd.z, t1);
                    segment.geometry.attributes.position.needsUpdate = true;
                    segment.material.opacity = globalFade * (0.05 + 0.80 * Math.pow((i + 1) / segments.length, 1.35));
                }
                if (elapsed >= totalDuration) {
                    shootingStar.visible = false;
                    shootingStarStartedAt = -1;
                    nextShootingStarAt = time + 1800 + Math.random() * 2200;
                }
            }
        }

        const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.15, 4000);

        const renderer = new THREE.WebGLRenderer({ antialias: !isTouchMode, powerPreference: "high-performance", alpha: true });
        renderer.setClearColor(0x000000, 0);
        renderer.setSize(window.innerWidth, window.innerHeight);
        let renderPixelRatio = Math.min(window.devicePixelRatio, isTouchMode ? 0.85 : 1.0);
        renderer.setPixelRatio(renderPixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        renderer.outputColorSpace = THREE.SRGBColorSpace;

        renderer.domElement.style.position = 'absolute';
        renderer.domElement.style.top = '0px';
        renderer.domElement.style.zIndex = '1';
        document.body.appendChild(renderer.domElement);

        const cssRenderer = new CSS3DRenderer();
        cssRenderer.setSize(window.innerWidth, window.innerHeight);
        cssRenderer.domElement.style.position = 'absolute';
        cssRenderer.domElement.style.top = '0px';
        cssRenderer.domElement.style.zIndex = '0';
        document.body.appendChild(cssRenderer.domElement);

        const controls = new PointerLockControls(camera, document.body);
        controls.pointerSpeed = 0.75;
        const blocker = document.getElementById('blocker');
        const movePrompt = document.getElementById('move-prompt');
        if (blocker) blocker.style.display = 'none';
        let isCatalogOpen = false;

        function showMovePrompt() {
            if (isTouchMode || isPaused || isCatalogOpen || isReceptionOpen) return;
            if (movePrompt) movePrompt.classList.add('visible');
            document.body.classList.remove('game-active');
        }

        function hideMovePrompt() {
            if (movePrompt) movePrompt.classList.remove('visible');
        }

        function enableFallbackControls() {
            isTouchMode = true;
            const jl = document.getElementById('joysticks-layer');
            if (jl) jl.style.display = 'block';
            if (blocker) blocker.style.display = 'none';
        }

        function safeLockControls() {
            try {
                const promise = document.body.requestPointerLock();
                if (promise !== undefined && typeof promise.catch === 'function') {
                    promise.catch(err => {
                        console.warn("Pointer lock needs another click.");
                        showMovePrompt();
                    });
                }
            } catch (err) {
                console.warn("Pointer lock needs another click.", err);
                showMovePrompt();
            }
        }

        document.addEventListener('pointerlockerror', () => {
            console.warn("Pointer lock error event. Waiting for click to continue.");
            showMovePrompt();
        });

        if (movePrompt) movePrompt.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            hideMovePrompt();
            safeLockControls();
        });

        const startGameInteraction = (e) => {
            if (e.target && (e.target.tagName === 'LABEL' || e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON')) return;

            if (e.type.includes('touch') || (window.matchMedia && window.matchMedia("(hover: none) and (pointer: coarse)").matches)) {
                isTouchMode = true;
                const jl = document.getElementById('joysticks-layer');
                if (jl) jl.style.display = 'block';
            } else if (!isTouchMode) {
                safeLockControls();
            }

            if (blocker) blocker.style.display = 'none';
            initAudio();
            if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
            if (musicAudio.paused && isAudioInit && autoPlaylistPaths.length > 0) {
                const p = musicAudio.play();
                if (p) p.catch(() => {});
            }
        };

        if (blocker) {
            blocker.addEventListener('click', startGameInteraction);
            blocker.addEventListener('touchstart', startGameInteraction);
        }

        controls.addEventListener('lock', () => {
            if (blocker) blocker.style.display = 'none';
            hideMovePrompt();
            document.body.classList.add('game-active');
        });

        controls.addEventListener('unlock', () => {
            if (blocker) blocker.style.display = 'none';
            if (isPaused) document.body.classList.remove('game-active');
            requestAnimationFrame(() => {
                if (performance.now() >= suppressPauseUntil && !controls.isLocked && !isPaused && !isCatalogOpen && !isReceptionOpen && !isTouchMode) openPauseMenu();
            });
        });

        const controlsHud = document.getElementById('controls-hud');

        const beginInstantExperience = (event) => {

            if (event.target && event.target.closest &&
                (event.target.closest('.atelier-ui') || event.target.closest('#catalog-overlay') ||
                 event.target.closest('#reception-overlay') ||
                 event.target.closest('#pause-menu') ||
                 event.target.closest('.offline-designs-panel') ||
                 event.target.closest('.wasd-key'))) {
                return;
            }
            if (!isTouchMode && !controls.isLocked && !isPaused) {
                safeLockControls();
            }
            initAudio();
            if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
            if (musicAudio.paused && isAudioInit && camera.position.z>-111.5) {
                const playback = musicAudio.play();
                if (playback) playback.catch(() => {});
            }
        };

        document.addEventListener('click', beginInstantExperience);

        const movementButtonMap = {
            forward: () => { moveForward = true; },
            backward: () => { moveBackward = true; },
            left: () => { moveLeft = true; },
            right: () => { moveRight = true; }
        };

        const movementButtonReleaseMap = {
            forward: () => { moveForward = false; },
            backward: () => { moveBackward = false; },
            left: () => { moveLeft = false; },
            right: () => { moveRight = false; }
        };

        document.querySelectorAll('.wasd-key').forEach((button) => {
            const directionName = button.dataset.move;
            const press = (event) => {
                event.preventDefault();
                event.stopPropagation();
                button.classList.add('active');
                movementButtonMap[directionName]();
                initAudio();
            };
            const release = (event) => {
                if (event) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                button.classList.remove('active');
                movementButtonReleaseMap[directionName]();
            };
            button.addEventListener('mousedown', press);
            button.addEventListener('touchstart', press, { passive: false });
            button.addEventListener('mouseup', release);
            button.addEventListener('mouseleave', release);
            button.addEventListener('touchend', release, { passive: false });
            button.addEventListener('touchcancel', release, { passive: false });
        });

        const pauseMenu = document.getElementById('pause-menu');
        const pauseHint = document.getElementById('pause-hint');
        const resumeBtn = document.getElementById('resume-btn');
        const musicToggleBtn = document.getElementById('music-toggle-btn');

        let isPaused = false;
        let suppressPauseUntil = 0;
        let musicMutedByMenu = false;

        function openPauseMenu() {
            storeReturnFocus=document.activeElement;
            showStore('browse');
            isPaused = true;
            hideMovePrompt();
            document.body.classList.remove('game-active');
            moveForward = false; moveBackward = false; moveLeft = false; moveRight = false;
            if (controls.isLocked) {
                try { controls.unlock(); } catch (error) {}
            }
            if (pauseMenu) pauseMenu.classList.add('visible');
            if (controlsHud) controlsHud.classList.add('hidden');
        }

        function closePauseMenu() {
            suppressPauseUntil = performance.now() + 1200;
            document.activeElement?.blur();
            disposeProductViewer();productLoadSequence++;
            isCatalogOpen=false;isReceptionOpen=false;
            for(const id of ['catalog-overlay','reception-overlay']){const el=document.getElementById(id);if(el)el.style.display='none';}
            isPaused = false;
            if (!isTouchMode) document.body.classList.add('game-active');
            showcaseTestCue = null;
            if (pauseMenu) pauseMenu.classList.remove('visible');
            if (pauseMenu) pauseMenu.classList.remove('testing');
            if (controlsHud) controlsHud.classList.remove('hidden');
            if (!isTouchMode) {
                safeLockControls();
                setTimeout(() => { if (!controls.isLocked && !isPaused) showMovePrompt(); }, 220);
            }
            if (!musicMutedByMenu && camera.position.z>=-111.5) {
                initAudio();
                if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
                const playback = musicAudio.play();
                if (playback) playback.catch(() => {});
            }
        }

        function toggleMusicFromMenu() {
            musicMutedByMenu = !musicMutedByMenu;
            musicAudio.muted = musicMutedByMenu;
            if (musicToggleBtn) {
                musicToggleBtn.textContent = musicMutedByMenu ? 'Music: Off' : 'Music: On';
            }
        }

        if (pauseHint) pauseHint.addEventListener('click', (event) => {
            event.preventDefault(); event.stopPropagation(); openPauseMenu();
        });
        if (resumeBtn) resumeBtn.addEventListener('click', (event) => {
            event.preventDefault(); event.stopPropagation(); closePauseMenu();
        });
        if (musicToggleBtn) musicToggleBtn.addEventListener('click', (event) => {
            event.preventDefault(); event.stopPropagation(); toggleMusicFromMenu();
        });

        document.addEventListener('keydown', (event) => {
            if (event.code === 'Escape') {
                event.preventDefault();
                if(event.repeat)return;
                if(isPaused || pauseMenu.classList.contains('visible')) { closePauseMenu(); return; }
                if(performance.now() < suppressPauseUntil)return;
                if (isCatalogOpen) { closeCatalog(); return; }
                if (isReceptionOpen) { closeReception(); return; }
                if (isPaused) closePauseMenu(); else openPauseMenu();
            }
        });

        const velocity = new THREE.Vector3();
        const direction = new THREE.Vector3();
        let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
        const joyState = { left: { x: 0, y: 0, id: null } };

        function stopPlayerMomentum() {
            velocity.set(0, 0, 0);
            moveForward = moveBackward = moveLeft = moveRight = false;
            joyState.left.x = 0;
            joyState.left.y = 0;
        }

        window.addEventListener('blur', stopPlayerMomentum);
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) stopPlayerMomentum();
        });

        let lastMoveInputTime = 0;
        function setKeyHudActive(moveName, on) {
            const el = document.querySelector('.wasd-key[data-move="' + moveName + '"]');
            if (el) el.classList.toggle('active', on);
        }
        function revealControlsHud() {
            lastMoveInputTime = performance.now();
            if (controlsHud && !isPaused) controlsHud.classList.remove('hidden');
        }

        document.addEventListener('keydown', (event) => {
            if(event.target.closest?.('input,textarea,select,[contenteditable=true]'))return;
            if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.code)){
                if(isPaused && !isCatalogOpen && !isReceptionOpen)closePauseMenu();
                if(!isPaused){if(!controls.isLocked&&!isTouchMode)safeLockControls();hideMovePrompt();if(blocker)blocker.style.display='none';event.preventDefault();}
            }
            switch (event.code) {
                case 'ArrowUp': case 'KeyW': moveForward = true; setKeyHudActive('forward', true); revealControlsHud(); break;
                case 'ArrowLeft': case 'KeyA': moveLeft = true; setKeyHudActive('left', true); revealControlsHud(); break;
                case 'ArrowDown': case 'KeyS': moveBackward = true; setKeyHudActive('backward', true); revealControlsHud(); break;
                case 'ArrowRight': case 'KeyD': moveRight = true; setKeyHudActive('right', true); revealControlsHud(); break;
            }
        });

        document.addEventListener('keyup', (event) => {
            switch (event.code) {
                case 'ArrowUp': case 'KeyW': moveForward = false; setKeyHudActive('forward', false); break;
                case 'ArrowLeft': case 'KeyA': moveLeft = false; setKeyHudActive('left', false); break;
                case 'ArrowDown': case 'KeyS': moveBackward = false; setKeyHudActive('backward', false); break;
                case 'ArrowRight': case 'KeyD': moveRight = false; setKeyHudActive('right', false); break;
            }
        });

        function setupJoystick(joyEl, nubEl, stateObj) {
            if (!joyEl || !nubEl) return;
            let rect, centerX, centerY, maxDist;
            const updateMetrics = () => {
                rect = joyEl.getBoundingClientRect();
                centerX = rect.width / 2;
                centerY = rect.height / 2;
                maxDist = rect.width / 2;
            };
            const handleStart = (clientX, clientY, identifier) => {
                updateMetrics();
                isTouchMode = true;
                if (controls.isLocked) controls.unlock();
                if (blocker && blocker.style.display !== 'none') {
                    blocker.style.display = 'none';
                    initAudio();
                }
                stateObj.id = identifier;
                processMove(clientX, clientY);
            };
            const handleMove = (clientX, clientY, identifier) => {
                if (stateObj.id === identifier) processMove(clientX, clientY);
            };
            const handleEnd = (identifier) => {
                if (stateObj.id === identifier) {
                    stateObj.id = null; stateObj.x = 0; stateObj.y = 0;
                    nubEl.style.transform = `translate(-50%, -50%)`;
                }
            };
            const processMove = (clientX, clientY) => {
                let dx = clientX - (rect.left + centerX);
                let dy = clientY - (rect.top + centerY);
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > maxDist) { dx = (dx / dist) * maxDist; dy = (dy / dist) * maxDist; }
                if (maxDist > 0) { stateObj.x = dx / maxDist; stateObj.y = dy / maxDist; }
                nubEl.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
            };

            joyEl.addEventListener('touchstart', (e) => {
                e.preventDefault();
                for (let i = 0; i < e.changedTouches.length; i++) {
                    if (stateObj.id === null) handleStart(e.changedTouches[i].clientX, e.changedTouches[i].clientY, e.changedTouches[i].identifier);
                }
            }, { passive: false });
            joyEl.addEventListener('touchmove', (e) => {
                e.preventDefault();
                for (let i = 0; i < e.changedTouches.length; i++) handleMove(e.changedTouches[i].clientX, e.changedTouches[i].clientY, e.changedTouches[i].identifier);
            }, { passive: false });
            const resetTouch = (e) => {
                e.preventDefault();
                for (let i = 0; i < e.changedTouches.length; i++) handleEnd(e.changedTouches[i].identifier);
            };
            joyEl.addEventListener('touchend', resetTouch, { passive: false });
            joyEl.addEventListener('touchcancel', resetTouch, { passive: false });
            joyEl.addEventListener('mousedown', (e) => { e.preventDefault(); handleStart(e.clientX, e.clientY, 'mouse'); });
            window.addEventListener('mousemove', (e) => { if (stateObj.id === 'mouse') { e.preventDefault(); handleMove(e.clientX, e.clientY, 'mouse'); } }, { passive: false });
            window.addEventListener('mouseup', (e) => { if (stateObj.id === 'mouse') handleEnd('mouse'); });
        }
        setupJoystick(document.getElementById('joystick-left'), document.getElementById('nub-left'), joyState.left);

        /* ------------------------------------------------------------------
           PRODUCT PANEL
           One place that fills the panel from a product object, so every
           display model shows its own title, price, image, copy and link.
        ------------------------------------------------------------------ */
        const catalogPanel = document.querySelector('.catalog-left-panel');
        const catalogTitleEl = catalogPanel.querySelector('h3');
        const catalogPriceEl = catalogPanel.querySelector('.catalog-price');
        const catalogGalleryEl = catalogPanel.querySelector('.catalog-gallery');
        const catalogThumbsEl = catalogPanel.querySelector('.catalog-thumbnails');
        const catalogDescEl = catalogPanel.querySelector('.catalog-desc-box');
        const mainProductImg = document.getElementById('main-product-img');

        function bindThumbnails() {
            catalogThumbsEl.querySelectorAll('.catalog-thumb').forEach((thumb) => {
                thumb.addEventListener('click', () => {
                    if (mainProductImg) mainProductImg.src = thumb.src;
                    catalogThumbsEl.querySelectorAll('.catalog-thumb').forEach(t => t.classList.remove('active'));
                    thumb.classList.add('active');
                });
            });
        }

        function openProductPanel(data) {
            const key=Object.keys(PRODUCTS_BY_MODEL).find(k=>PRODUCTS_BY_MODEL[k]===data || PRODUCTS_BY_MODEL[k].title===data.title);
            openTempleProduct({...data,key:key || data.title,file:key,images:[data.img].filter(Boolean)});
        }

        const raycaster = new THREE.Raycaster();
        const centerCoords = new THREE.Vector2(0, 0);
        const lookState = { id: null, startX: 0, startY: 0, lastX: 0, lastY: 0, isDragging: false };

        const attemptInteraction = (pointer) => {
            if (isPaused || isCatalogOpen || isReceptionOpen) return;
            if (controls.isLocked || isTouchMode || (blocker && blocker.style.display === 'none')) {
                const point=(!controls.isLocked && pointer && Number.isFinite(pointer.clientX))?new THREE.Vector2(pointer.clientX/innerWidth*2-1,1-pointer.clientY/innerHeight*2):centerCoords;
                raycaster.setFromCamera(point, camera);
                const intersects = raycaster.intersectObjects(interactableModels, false);

                if (intersects.length > 0) {
                    const hit = intersects[0];
                    if (hit.object.userData?.atelierAction && hit.distance < (hit.object.userData.cinemaAction?55:18)) { hit.object.userData.atelierAction(hit); return; }
                    if (hit.object.userData && hit.object.userData.isQuote) {
                        showNextQuoteOverride(hit.object.userData.text);
                    } else if (hit.object.userData && hit.object.userData.isProduct) {
                        openProductPanel(hit.object.userData.data);
                    } else if (hit.object.userData && hit.object.userData.isReception) {
                        openPauseMenu();showStore('reception');
                    }
                }
            }
        };

        document.addEventListener('mousedown', (event) => {
            if (event.target && typeof event.target.closest === 'function') {
                if (event.target.closest('.joystick-container') || event.target.closest('#catalog-overlay') || event.target.closest('#reception-overlay') || event.target.closest('#pause-menu') || event.target.closest('#blocker')) return;
            }
            if (!controls.isLocked) {
                lookState.id = 'mouse';
                lookState.startX = event.clientX; lookState.startY = event.clientY;
                lookState.lastX = event.clientX; lookState.lastY = event.clientY;
                lookState.isDragging = false;
            } else {
                attemptInteraction();
            }
        });

        document.addEventListener('mousemove', (event) => {
            if (isCatalogOpen || isReceptionOpen || isPaused || (blocker && blocker.style.display !== 'none')) return;
            if(!controls.isLocked && !isTouchMode && !event.target.closest?.('.atelier-ui,#pause-menu')){
                const euler=new THREE.Euler().setFromQuaternion(camera.quaternion,'YXZ');euler.y-=event.movementX*.002;euler.x=THREE.MathUtils.clamp(euler.x-event.movementY*.002,-Math.PI/2,Math.PI/2);camera.quaternion.setFromEuler(euler);return;
            }
            if (lookState.id === 'mouse' && !controls.isLocked) {
                const dx = event.clientX - lookState.lastX;
                const dy = event.clientY - lookState.lastY;
                if (Math.abs(event.clientX - lookState.startX) > 5 || Math.abs(event.clientY - lookState.startY) > 5) lookState.isDragging = true;

                const euler = new THREE.Euler(0, 0, 0, 'YXZ');
                euler.setFromQuaternion(camera.quaternion);
                euler.y -= dx * 0.005;
                euler.x -= dy * 0.005;
                euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));
                camera.quaternion.setFromEuler(euler);

                lookState.lastX = event.clientX; lookState.lastY = event.clientY;
            }
        });

        document.addEventListener('mouseup', (event) => {
            if (lookState.id === 'mouse') {
                if (!lookState.isDragging) attemptInteraction(event);
                lookState.id = null; lookState.isDragging = false;
            }
        });

        document.addEventListener('touchstart', (event) => {
            if (event.target && typeof event.target.closest === 'function') {
                if (event.target.closest('.joystick-container') || event.target.closest('#catalog-overlay') || event.target.closest('#reception-overlay') || event.target.closest('#pause-menu') || event.target.closest('#blocker')) return;
            }
            for (let i = 0; i < event.changedTouches.length; i++) {
                const touch = event.changedTouches[i];
                if (lookState.id === null) {
                    lookState.id = touch.identifier;
                    lookState.startX = touch.clientX; lookState.startY = touch.clientY;
                    lookState.lastX = touch.clientX; lookState.lastY = touch.clientY;
                    lookState.isDragging = false;
                }
            }
        }, { passive: true });

        document.addEventListener('touchmove', (event) => {
            if (isCatalogOpen || isReceptionOpen || isPaused || (blocker && blocker.style.display !== 'none')) return;
            for (let i = 0; i < event.changedTouches.length; i++) {
                const touch = event.changedTouches[i];
                if (touch.identifier === lookState.id) {
                    const dx = touch.clientX - lookState.lastX;
                    const dy = touch.clientY - lookState.lastY;
                    if (Math.abs(touch.clientX - lookState.startX) > 5 || Math.abs(touch.clientY - lookState.startY) > 5) lookState.isDragging = true;

                    if (isTouchMode || controls.isLocked) {
                        const euler = new THREE.Euler(0, 0, 0, 'YXZ');
                        euler.setFromQuaternion(camera.quaternion);
                        euler.y -= dx * 0.005; euler.x -= dy * 0.005;
                        euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));
                        camera.quaternion.setFromEuler(euler);
                    }
                    lookState.lastX = touch.clientX; lookState.lastY = touch.clientY;
                }
            }
        }, { passive: false });

        const resetLookTouch = (event) => {
            for (let i = 0; i < event.changedTouches.length; i++) {
                const touch = event.changedTouches[i];
                if (touch.identifier === lookState.id) {
                    if (!lookState.isDragging && event.type === 'touchend') attemptInteraction(touch);
                    lookState.id = null; lookState.isDragging = false;
                }
            }
        };

        document.addEventListener('touchend', resetLookTouch, { passive: true });
        document.addEventListener('touchcancel', resetLookTouch, { passive: true });

        function closeCatalog() {
            if (isCatalogOpen) {
                isCatalogOpen = false;
                document.getElementById('catalog-overlay').style.display = 'none';
                revealControlsHud();
                if (isTouchMode) { document.getElementById('joysticks-layer').style.display = 'block'; } else { safeLockControls(); }
            }
        }

        function closeReception() {
            if (isReceptionOpen) {
                isReceptionOpen = false;
                document.getElementById('reception-overlay').style.display = 'none';
                revealControlsHud();
                if (isTouchMode) { document.getElementById('joysticks-layer').style.display = 'block'; } else { safeLockControls(); }
            }
        }

        const closeBtn = document.getElementById('close-catalog');
        if (closeBtn) closeBtn.addEventListener('click', closeCatalog);

        const closeRecBtn = document.getElementById('close-reception');
        if (closeRecBtn) closeRecBtn.addEventListener('click', closeReception);

        function overlayBackToMainMenu() {
            isReceptionOpen = false; isCatalogOpen = false;
            const ro = document.getElementById('reception-overlay'); if (ro) ro.style.display = 'none';
            const co = document.getElementById('catalog-overlay'); if (co) co.style.display = 'none';
            openPauseMenu();
        }
        const recMenuBtn = document.getElementById('reception-main-menu');
        if (recMenuBtn) recMenuBtn.addEventListener('click', overlayBackToMainMenu);
        const catMenuBtn = document.getElementById('catalog-main-menu');
        if (catMenuBtn) catMenuBtn.addEventListener('click', overlayBackToMainMenu);

        const acquireBtn = document.getElementById('acquire-btn');
        if (acquireBtn) {
            acquireBtn.addEventListener('click', () => {
                window.open(activeProductUrl || STORE_URL, '_blank');
            });
        }

        const catOverlay = document.getElementById('catalog-overlay');
        if (catOverlay) catOverlay.addEventListener('click', (e) => { if (e.target.id === 'catalog-overlay') closeCatalog(); });

        const recOverlay = document.getElementById('reception-overlay');
        if (recOverlay) recOverlay.addEventListener('click', (e) => { if (e.target.id === 'reception-overlay') closeReception(); });

        const sizeBtns = document.querySelectorAll('.size-btn');
        sizeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                sizeBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        const hemiLight = new THREE.HemisphereLight(0xa8c5ff, 0x494039, 0.52);
        hemiLight.position.set(0, 50, 0);
        scene.add(hemiLight);

        const dirLight = new THREE.DirectionalLight(0xc0d3ff, 0.85);
        const sun = new THREE.Vector3();
        const phi = THREE.MathUtils.degToRad(75);
        const theta = THREE.MathUtils.degToRad(-45);
        sun.setFromSphericalCoords(1, phi, theta);
        dirLight.position.copy(sun).multiplyScalar(100);
        dirLight.castShadow = true;

        dirLight.shadow.mapSize.width = isTouchMode ? 512 : 1024;
        dirLight.shadow.mapSize.height = isTouchMode ? 512 : 1024;
        dirLight.shadow.camera.near = 10;
        dirLight.shadow.camera.far = 300;
        dirLight.shadow.camera.top = 100;
        dirLight.shadow.camera.bottom = -100;
        dirLight.shadow.camera.left = -100;
        dirLight.shadow.camera.right = 100;
        dirLight.shadow.bias = -0.0002;
        dirLight.shadow.normalBias = 0.05;
        scene.add(dirLight);

        dirLight.target.position.set(0,22,45);scene.add(dirLight.target);
        dirLight.shadow.autoUpdate=false;
        const sunCanvas=document.createElement('canvas');sunCanvas.width=128;sunCanvas.height=128;const sd=sunCanvas.getContext('2d'),sg=sd.createRadialGradient(64,64,0,64,64,64);sg.addColorStop(0,'rgba(255,248,221,1)');sg.addColorStop(.18,'rgba(255,244,212,.95)');sg.addColorStop(.27,'rgba(255,234,189,.22)');sg.addColorStop(1,'rgba(255,227,180,0)');sd.fillStyle=sg;sd.fillRect(0,0,128,128);
        const daylightSun=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(sunCanvas),transparent:true,depthWrite:false,fog:false,toneMapped:false}));daylightSun.name='Moving daytime sun';daylightSun.scale.set(75,75,1);scene.add(daylightSun);
        let lastSunShadow=0;
        function updateDaylight(time){
            const phase=time/1080000*Math.PI*2,azimuth=-.7+1.0*Math.sin(phase),elevation=THREE.MathUtils.degToRad(44+12*Math.sin(phase*.5));
            sun.set(Math.sin(azimuth)*Math.cos(elevation),Math.sin(elevation),-Math.cos(azimuth)*Math.cos(elevation));
            dirLight.position.copy(dirLight.target.position).addScaledVector(sun,140);dirLight.color.set(0xffedcf);dirLight.intensity=1.02+.12*Math.sin(elevation);
            daylightSun.position.copy(camera.position).addScaledVector(sun,900);
            const interval=scene.userData.qualityTier==='high'?500:1500;
            if(time-lastSunShadow>interval){dirLight.shadow.needsUpdate=true;renderer.shadowMap.needsUpdate=true;lastSunShadow=time;}
        }
        const ambientLight = new THREE.AmbientLight(0xcbdbe7, 0.16);
        scene.add(ambientLight);

        function createMarbleTexture() {
            const canvas = document.createElement('canvas');
            canvas.width = 512; canvas.height = 512;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 512, 512);
                ctx.globalAlpha = 0.025;
                for (let i = 0; i < 1000; i++) {
                    ctx.beginPath();
                    const x = Math.random() * 512; const y = Math.random() * 512;
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + (Math.random() * 200 - 50), y + (Math.random() * 200 + 50));
                    ctx.lineWidth = Math.random() * 8;
                    ctx.strokeStyle = '#000000';
                    ctx.stroke();
                }
            }
            const tex = new THREE.CanvasTexture(canvas);
            tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
            tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
            return tex;
        }

        const marbleBump = createMarbleTexture();

        function makeMarbleCanvas(size) {
            const c = document.createElement('canvas');
            c.width = c.height = size;
            const ctx = c.getContext('2d');
            ctx.fillStyle = '#f1f1ef';
            ctx.fillRect(0, 0, size, size);

            // Broad grey brushstrokes: keeps every marble surface from
            // reading as flat white without introducing any hue.
            ctx.lineCap = 'round';
            for (let b = 0; b < 11; b++) {
                const tone = 120 + Math.floor(Math.random() * 55);
                ctx.strokeStyle = 'rgba(' + tone + ',' + tone + ',' + (tone + 4) + ',' + (0.030 + Math.random() * 0.055).toFixed(3) + ')';
                ctx.lineWidth = size * (0.05 + Math.random() * 0.13);
                const ang = (Math.random() - 0.5) * 1.6;
                let x = Math.random() * size, y = Math.random() * size;
                ctx.beginPath();
                ctx.moveTo(x, y);
                for (let seg = 0; seg < 3; seg++) {
                    const len = size * (0.25 + Math.random() * 0.4);
                    const nx = x + Math.cos(ang) * len + (Math.random() - 0.5) * size * 0.18;
                    const ny = y + Math.sin(ang) * len + (Math.random() - 0.5) * size * 0.18;
                    ctx.quadraticCurveTo(
                        x + (Math.random() - 0.5) * size * 0.25,
                        y + (Math.random() - 0.5) * size * 0.25,
                        nx, ny
                    );
                    x = nx; y = ny;
                }
                ctx.stroke();
            }

            for (let i = 0; i < 46; i++) {
                const x = Math.random() * size, y = Math.random() * size;
                const r = size * (0.06 + Math.random() * 0.16);
                const g = ctx.createRadialGradient(x, y, 0, x, y, r);
                const a = 0.012 + Math.random() * 0.025;
                g.addColorStop(0, 'rgba(165,170,180,' + a + ')');
                g.addColorStop(1, 'rgba(165,170,180,0)');
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fill();
            }

            for (let v = 0; v < 14; v++) {
                ctx.strokeStyle = 'rgba(122,126,136,' + (0.08 + Math.random() * 0.12) + ')';
                ctx.lineWidth = 0.8 + Math.random() * 2.4;
                ctx.lineCap = 'round';
                ctx.beginPath();
                let x = Math.random() * size, y = Math.random() * size;
                ctx.moveTo(x, y);
                const segs = 5 + Math.floor(Math.random() * 5);
                for (let s = 0; s < segs; s++) {
                    const nx = x + (Math.random() - 0.5) * size * 0.45;
                    const ny = y + (Math.random() - 0.5) * size * 0.45;
                    const cx = x + (Math.random() - 0.5) * size * 0.3;
                    const cy = y + (Math.random() - 0.5) * size * 0.3;
                    ctx.quadraticCurveTo(cx, cy, nx, ny);
                    x = nx; y = ny;
                }
                ctx.stroke();
                ctx.strokeStyle = 'rgba(148,152,164,' + (0.035 + Math.random() * 0.05) + ')';
                ctx.lineWidth = 0.6;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.quadraticCurveTo(
                    x + (Math.random() - 0.5) * size * 0.2, y + (Math.random() - 0.5) * size * 0.2,
                    x + (Math.random() - 0.5) * size * 0.35, y + (Math.random() - 0.5) * size * 0.35
                );
                ctx.stroke();
            }
            return c;
        }

        function makeMarbleColorTexture() {
            const tex = new THREE.CanvasTexture(makeMarbleCanvas(512));
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            return tex;
        }

        function makeMarbleTileTexture(repeatX, repeatY) {
            const size = 512;
            const c = makeMarbleCanvas(size);
            const ctx = c.getContext('2d');
            ctx.strokeStyle = 'rgba(115,112,106,0.32)';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(0, 0, size, size);
            ctx.strokeStyle = 'rgba(200,200,205,0.5)';
            ctx.lineWidth = 2;
            // Fine joints between large, honed stone slabs.
            const tex = new THREE.CanvasTexture(c);
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(repeatX, repeatY);
            tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
            return tex;
        }

        const marbleColorTex = makeMarbleColorTexture();

        const whiteStoneMat=marbleMaterial('WebAssets/Materials/marble-walls.webp',10,false);
        const floorMat=marbleMaterial('WebAssets/Materials/marble-floors.webp',4,true);
        const groundTileMat=marbleMaterial('WebAssets/Materials/marble-floors.webp',4,true);
        const platformTileMat=marbleMaterial('WebAssets/Materials/marble-floors.webp',4,true);
        const carpetMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9, metalness: 0.1 });
        const platinumFrameMat = new THREE.MeshStandardMaterial({ color: 0xe5e4e2, roughness: 0.2, metalness: 0.8 });
        const outlineMat = new THREE.LineBasicMaterial({ color: 0x9999a0, transparent: true, opacity: 0.0 });

        function addOutline(mesh) { return;
            const edges = new THREE.EdgesGeometry(mesh.geometry);
            const line = new THREE.LineSegments(edges, outlineMat);
            mesh.add(line);
        }

        const collisionMeshes = [];

        function createBox(w, h, d, x, y, z, mat = whiteStoneMat, isObstacle = true, outlined = true) {
            const geo = new THREE.BoxGeometry(w, h, d);
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(x, y, z);
            mesh.castShadow = true; mesh.receiveShadow = true;
            if (outlined) addOutline(mesh);
            scene.add(mesh);
            if (isObstacle) collisionMeshes.push(mesh);
            return mesh;
        }

        function makeDoricShaftGeometry(rTop, rBottom, h, flutes = 20, depth = 0.05) {
            const geo = new THREE.CylinderGeometry(rTop, rBottom, h, isTouchMode ? 40 : 80, 6, false);
            const pos = geo.attributes.position;
            for (let i = 0; i < pos.count; i++) {
                const x = pos.getX(i), z = pos.getZ(i);
                const rr = Math.sqrt(x * x + z * z);
                if (rr < 1e-4) continue;
                const theta = Math.atan2(z, x);
                const f = 1 - depth * (0.5 + 0.5 * Math.cos(flutes * theta));
                pos.setX(i, x * f);
                pos.setZ(i, z * f);
            }
            geo.computeVertexNormals();
            return geo;
        }

        function createPillar(x, z, h = 12, r = 0.9, baseY = 22.0, showTopCapital = true) {
            createBox(r * 2.6, 0.4, r * 2.6, x, baseY + 0.2, z, whiteStoneMat, true, true);

            const torus1 = new THREE.Mesh(new THREE.TorusGeometry(r * 1.15, r * 0.25, 12, 48), whiteStoneMat);
            torus1.position.set(x, baseY + 0.4 + r * 0.25, z); torus1.rotation.x = Math.PI / 2;
            torus1.castShadow = true; torus1.receiveShadow = true; scene.add(torus1);

            const scotia = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.9, r * 1.0, r * 0.4, 16), whiteStoneMat);
            scotia.position.set(x, baseY + 0.4 + r * 0.5 + r * 0.2, z);
            scotia.castShadow = true; scotia.receiveShadow = true; scene.add(scotia);

            const torus2 = new THREE.Mesh(new THREE.TorusGeometry(r * 1.05, r * 0.2, 12, 48), whiteStoneMat);
            torus2.position.set(x, baseY + 0.4 + r * 0.5 + r * 0.4 + r * 0.2, z); torus2.rotation.x = Math.PI / 2;
            torus2.castShadow = true; torus2.receiveShadow = true; scene.add(torus2);

            const shaftMat = whiteStoneMat;
            const shaft = new THREE.Mesh(makeDoricShaftGeometry(r * 0.72, r * 0.96, h), shaftMat);
            const shaftBaseY = baseY + 0.4 + r * 0.9 + r * 0.4;
            shaft.position.set(x, shaftBaseY + h / 2, z);
            shaft.castShadow = true; shaft.receiveShadow = true; scene.add(shaft);
            collisionMeshes.push(shaft);

            // No top capital at all on the exterior facade columns: neither the
            // rounded support nor its square slab can obscure the wordmark.
            if (showTopCapital) {
                const echinus = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.2, r * 0.75, 0.4, 16), whiteStoneMat);
                echinus.position.set(x, shaftBaseY + h + 0.2, z);
                echinus.castShadow = true; echinus.receiveShadow = true; scene.add(echinus);
                createBox(r * 2.4, 0.4, r * 2.4, x, shaftBaseY + h + 0.4 + 0.2, z, whiteStoneMat, true, true);
            }
        }

        const wallH = 24.0;
        const wallT = 2;

        const ground = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), groundTileMat);
        ground.rotation.x = -Math.PI / 2; ground.position.y = COURTYARD_Y; ground.receiveShadow = true; scene.add(ground);

        // Ground-only distance fog: transparent nearby, increasingly opaque
        // across the far floor so the plane never reads as infinite.
        groundFogSheet = new THREE.Mesh(
            new THREE.PlaneGeometry(700, 700, 1, 1),
            new THREE.ShaderMaterial({
                transparent: true,
                depthWrite: false,
                depthTest: true,
                fog: false,
                uniforms: { uColor: { value: new THREE.Color(0x7287a7) } },
                vertexShader: `varying vec2 vGroundPos; void main(){ vGroundPos = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
                fragmentShader: `uniform vec3 uColor; varying vec2 vGroundPos; void main(){ float a = smoothstep(165.0, 315.0, length(vGroundPos)); gl_FragColor = vec4(uColor, a * 0.94); }`
            })
        );
        groundFogSheet.rotation.x = -Math.PI / 2;
        groundFogSheet.position.set(0, COURTYARD_Y + 0.08, 0);
        groundFogSheet.renderOrder = 8;
        scene.add(groundFogSheet);

        createBox(86, 0.18, 270, 0, COURTYARD_Y - 0.12, 70, floorMat, false, false);
        createBox(wallT,wallH,80,-36,floorY+wallH/2,20);
        createBox(wallT,wallH,92,-42,floorY+wallH/2,-66);
        createBox(12,wallH,2,-36,floorY+wallH/2,-20);
        createBox(7,wallH,2,-33,floorY+wallH/2,60);
        createBox(wallT,wallH,80,36,floorY+wallH/2,20);
        createBox(wallT,wallH,92,42,floorY+wallH/2,-66);
        createBox(12,wallH,2,36,floorY+wallH/2,-20);
        createBox(7,wallH,2,33,floorY+wallH/2,60);
        for(const x of [-24.5,24.5])createBox(35,wallH,wallT,x,floorY+wallH/2,-112);
        createBox(14,wallH-TEMPLE_RISE-10,wallT,0,insideY+10+(wallH-TEMPLE_RISE-10)/2,-112);

        const frontColL = createBox(26, wallH, wallT, -17, floorY + wallH / 2, 60, whiteStoneMat, true, false);
        const frontColR = createBox(26, wallH, wallT, 17, floorY + wallH / 2, 60, whiteStoneMat, true, false);
        const frontColT = createBox(8, 10.5, wallT, 0, floorY + wallH - 5.25, 60, whiteStoneMat, true, false);
        frontColL.visible = false; frontColR.visible = false; frontColT.visible = false;

        {
            const facadeShape = new THREE.Shape();
            facadeShape.moveTo(-30, 0); facadeShape.lineTo(30, 0); facadeShape.lineTo(30, wallH); facadeShape.lineTo(-30, wallH); facadeShape.lineTo(-30, 0);
            const bayHole = new THREE.Path();
            bayHole.moveTo(-22.5, 0); bayHole.lineTo(22.5, 0); bayHole.lineTo(22.5, 24); bayHole.lineTo(-22.5, 24); bayHole.lineTo(-22.5, 0);
            facadeShape.holes.push(bayHole);
            const facadeGeo = new THREE.ExtrudeGeometry(facadeShape, { depth: wallT, bevelEnabled: false });
            const facadeMesh = new THREE.Mesh(facadeGeo, whiteStoneMat);
            facadeMesh.position.set(0, floorY, 60 - wallT / 2);
            facadeMesh.castShadow = true; facadeMesh.receiveShadow = true;
            scene.add(facadeMesh);
        }

        const ceilingTex = makeMarbleColorTexture();
        ceilingTex.repeat.set(9, 14);
        const ceilingMat = new THREE.MeshPhysicalMaterial({
            color: 0xf2f2f0, roughness: 0.3, metalness: 0.05,
            clearcoat: 0.4, clearcoatRoughness: 0.2,
            map: ceilingTex, bumpMap: marbleBump, bumpScale: 0.005
        });
        const ceilingThickness = 0.65;
        createBox(72.0, ceilingThickness, 80.0, 0, floorY + wallH - ceilingThickness * 0.5, 20, ceilingMat, true, true);
        // Two walk-through doorways connect the original hall and After Hours.
        createBox(12,wallH,wallT,0,floorY+wallH/2,-20);
        createBox(16,wallH,wallT,-22,floorY+wallH/2,-20);
        createBox(16,wallH,wallT,22,floorY+wallH/2,-20);
        for(const x of [-10,10])createBox(8,wallH-10,wallT,x,floorY+10+(wallH-10)/2,-20);

        for(let step=0;step<40;step++){
            const top=COURTYARD_Y+(step+1)*.4;
            const tread=createBox(72,top-COURTYARD_Y,1.2,0,(top+COURTYARD_Y)/2,108.6-step*1.2,whiteStoneMat,false,true);
            tread.userData.grandApproach=true;
        }
        createBox(72,insideY-COURTYARD_Y,81,0,(insideY+COURTYARD_Y)/2,-0+21,platformTileMat,false,false);
        createBox(84,insideY-COURTYARD_Y,130,0,(insideY+COURTYARD_Y)/2,-85,platformTileMat,false,false);

        // Ten substantial exterior columns, pulled clearly in front of the
        // glass facade to create the full temple frontage seen in the reference.
        // Exactly ten balanced columns. The centre pair is opened slightly
        // wider so the doorway remains clearly visible between them.
        const frontColumnXs = [-27.2, -21.55, -15.9, -10.25, -4.6, 4.6, 10.25, 15.9, 21.55, 27.2];
        frontColumnXs.forEach(x => createPillar(x, 59.35, 18.95, 1.18, insideY, false));

        /* ------------------------------------------------------------------
           ROOF
           A hipped roof: four sloping faces rising to a flat top rather than
           a point, sat on a two-step cornice that caps the walls.
        ------------------------------------------------------------------ */
        /* ------------------------------------------------------------------
           PORTICO, WINGS AND PEDIMENT
           A tall eight-column portico in the middle, lower solid wings either
           side. The pediment sits on the portico only; the wings are capped
           by their own low cornice and a flat roof deck.
        ------------------------------------------------------------------ */

        function makeWordmarkTexture() {
            const W = 2048, H = 260;
            const c = document.createElement('canvas');
            c.width = W; c.height = H;
            const ctx = c.getContext('2d');
            ctx.clearRect(0, 0, W, H);

            const track = 40;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            if ('letterSpacing' in ctx) ctx.letterSpacing = track + 'px';
            ctx.font = '700 174px Arial, "Helvetica Neue", Helvetica, sans-serif';
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';

            const cx = W / 2 - track / 2;
            const cy = H * 0.54;

            // Clean Arial Bold lettering without the chunky Arial Black outline.
            ctx.fillStyle = '#202124';
            ctx.fillText('IPU IFLII', cx, cy);

            const tex = new THREE.CanvasTexture(c);
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
            return tex;
        }

        function makeTympanumTexture() {
            const W = 1024, H = 320;
            const c = document.createElement('canvas');
            c.width = W; c.height = H;
            const ctx = c.getContext('2d');

            ctx.fillStyle = '#f3f3f1';
            ctx.fillRect(0, 0, W, H);
            for (let i = 0; i < 26; i++) {
                const x = Math.random() * W, y = Math.random() * H, r = 40 + Math.random() * 160;
                const g = ctx.createRadialGradient(x, y, 0, x, y, r);
                g.addColorStop(0, 'rgba(150,152,158,0.09)');
                g.addColorStop(1, 'rgba(168,172,180,0)');
                ctx.fillStyle = g;
                ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
            }

            const band = (x0, y0, x1, y1) => {
                const g = ctx.createLinearGradient(x0, y0, x1, y1);
                g.addColorStop(0, 'rgba(40,40,44,0.45)');
                g.addColorStop(0.5, 'rgba(40,40,44,0.11)');
                g.addColorStop(1, 'rgba(40,40,44,0)');
                ctx.fillStyle = g;
                ctx.fillRect(0, 0, W, H);
            };
            band(0, 0, 0, H * 0.42);
            band(0, H, 0, H * 0.80);
            band(0, 0, W * 0.12, 0);
            band(W, 0, W * 0.88, 0);

            const tex = new THREE.CanvasTexture(c);
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
            return tex;
        }

        function createTempleCrown() {
            const crownStart=new Set(scene.children);
            const wallTopY = floorY + wallH;      // 46

            const roofMat = whiteStoneMat.clone();
            // ExtrudeGeometry lays UVs out in world units, so both maps have
            // to be scaled down or the marble tiles once per unit.
            const roofStoneTex = makeMarbleColorTexture();
            roofStoneTex.repeat.set(1 / 70, 1 / 70);
            roofStoneTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
            roofMat.map = roofStoneTex;
            const roofBump = marbleBump.clone();
            roofBump.needsUpdate = true;
            roofBump.repeat.set(1 / 70, 1 / 70);
            roofMat.bumpMap = roofBump;
            roofMat.bumpScale = 0.004;
            roofMat.color = new THREE.Color(0xf8f8f6);
            roofMat.roughness = 0.45;
            roofMat.clearcoat = 0.3;

            // The former full-width wing cornice crossed in front of the sign
            // and clipped the IPU IFLII letters. It is intentionally removed.

            // ---- portico entablature, front block only ----
            const zC = 55.0;                      // centre of the portico depth
            // The former projecting architrave beneath the wordmark was removed:
            // it cast a heavy shadow over the entrance and visually hid the sign.
            // Taller sign fascia gives the wordmark proper vertical space.
            const archH = 0, friezeH = 6.00;
            const friezeY = wallTopY + archH + friezeH / 2;

            const friezeD = 13.8;
            // Wide fascia reaches beyond the two outer pillars.
            createBox(64.0, friezeH, friezeD, 0, friezeY, zC, roofMat, false, true);

            // ---- wordmark on the frieze ----
            const markTex = makeWordmarkTexture();
            const markMat = new THREE.MeshStandardMaterial({
                map: markTex, transparent: true, alphaTest: 0.30,
                side: THREE.DoubleSide, roughness: 0.5, metalness: 0.0
            });
            // Preserve the canvas aspect ratio so Arial is never squeezed short.
            const markW = 43.5, markH = markW * (260 / 2048);
            const mark = new THREE.Mesh(new THREE.PlaneGeometry(markW, markH), markMat);
            mark.position.set(0, friezeY + 0.05, zC + friezeD / 2 + 0.10);
            mark.name="IPU IFLII / solid frieze inscription";mark.renderOrder = 2;
            scene.add(mark);

            // ---- pediment over the portico ----
            // Pediment begins directly on the sign fascia. The two projecting
            // crown/visor ledges were removed completely so they cast no shade.
            const baseY = friezeY + friezeH / 2;
            // Broader, taller pediment spanning nearly the full temple width.
            const hw = 33.0;
            const rise = 11.5;
            const depth = 15.0;
            const zBack = zC - depth / 2;
            const L = Math.sqrt(hw * hw + rise * rise);

            const gable = new THREE.Shape();
            gable.moveTo(-hw, 0);
            gable.lineTo(hw, 0);
            gable.lineTo(0, rise);
            gable.lineTo(-hw, 0);

            const m = 1.45;
            const yb = m;
            const apexY = rise - m * L / hw;
            const xAt = (y) => hw * (1 - y / rise) - m * L / rise;
            const inner = [[-xAt(yb), yb], [xAt(yb), yb], [0, apexY]];

            const hole = new THREE.Path();
            hole.moveTo(inner[0][0], inner[0][1]);
            for (let i = 1; i < inner.length; i++) hole.lineTo(inner[i][0], inner[i][1]);
            hole.lineTo(inner[0][0], inner[0][1]);
            gable.holes.push(hole);

            const roof = new THREE.Mesh(
                new THREE.ExtrudeGeometry(gable, { depth: depth, bevelEnabled: false }),
                roofMat
            );
            roof.name="Upper temple pediment";roof.position.set(0, baseY, zBack);
            roof.castShadow = true;
            roof.receiveShadow = true;
            scene.add(roof);

            const recess = 0.70;
            const panelShape = new THREE.Shape();
            panelShape.moveTo(inner[0][0], inner[0][1]);
            for (let i = 1; i < inner.length; i++) panelShape.lineTo(inner[i][0], inner[i][1]);
            panelShape.lineTo(inner[0][0], inner[0][1]);

            const tympanumTex = makeTympanumTexture();
            const iw = xAt(yb);
            tympanumTex.repeat.set(1 / (iw * 2), 1 / (apexY - yb));
            tympanumTex.offset.set(0.5, -yb / (apexY - yb));
            const tympanumMat = new THREE.MeshStandardMaterial({
                map: tympanumTex, color: 0xf5f5f3, roughness: 0.8, metalness: 0.0
            });

            const panel = new THREE.Mesh(
                new THREE.ExtrudeGeometry(panelShape, { depth: depth - recess * 2, bevelEnabled: false }),
                [tympanumMat, roofMat]
            );
            panel.position.set(0, baseY, zBack + recess);
            panel.receiveShadow = true;
            scene.add(panel);

            // Raking cornice, stepped proud of the gable face.
            const lipW = 1.00, lipOut = 0.40;
            const mo = m - lipW;
            const apexY2 = rise - mo * L / hw;
            const xAt2 = (y) => hw * (1 - y / rise) - mo * L / rise;
            const outer = [[-xAt2(mo), mo], [xAt2(mo), mo], [0, apexY2]];

            const frameShape = new THREE.Shape();
            frameShape.moveTo(outer[0][0], outer[0][1]);
            for (let i = 1; i < outer.length; i++) frameShape.lineTo(outer[i][0], outer[i][1]);
            frameShape.lineTo(outer[0][0], outer[0][1]);
            const frameHole = new THREE.Path();
            frameHole.moveTo(inner[0][0], inner[0][1]);
            for (let i = 1; i < inner.length; i++) frameHole.lineTo(inner[i][0], inner[i][1]);
            frameHole.lineTo(inner[0][0], inner[0][1]);
            frameShape.holes.push(frameHole);

            const frameGeo = new THREE.ExtrudeGeometry(frameShape, { depth: lipOut, bevelEnabled: false });
            [zBack + depth, zBack - lipOut].forEach((z) => {
                const lip = new THREE.Mesh(frameGeo, roofMat);
                lip.position.set(0, baseY, z);
                lip.castShadow = true;
                lip.receiveShadow = true;
                scene.add(lip);
            });

            for(const object of scene.children)if(!crownStart.has(object))object.userData.preserveElevation=true;
            // Where the Pegasus emblem goes once the model has loaded.
            pedimentEmblemSpot = {
                x: 0,
                y: baseY + yb + (apexY - yb) * 0.30,
                z: zBack + depth + 0.55
            };
        }
        createTempleCrown();

        /* ------------------------------------------------------------------
           MARBLE ENTRANCE WALL
           Solid marble across the full facade, with only the central doorway
           left open as the entrance.
        ------------------------------------------------------------------ */
        function createCurtainWall() {
            const glass = new THREE.MeshPhysicalMaterial({
                color: 0xc4d0d8, metalness: 0.12, roughness: 0.16,
                transparent: true, opacity: 0.24, transmission: 0,
                thickness: 0.12, ior: 1.5, envMapIntensity: 1.55,
                depthWrite: false, side: THREE.DoubleSide
            });
            const bronze = new THREE.MeshStandardMaterial({color: 0x504439, metalness: 0.82, roughness: 0.27});
            const z = 57.12;
            const pane = (left, right, bottom, top) => {
                createBox(right-left, top-bottom, 0.16, (left+right)/2, (bottom+top)/2, z, glass, true, false).castShadow = false;
            };
            pane(-22.5, -3.7, floorY, floorY+24);
            pane(3.7, 22.5, floorY, floorY+24);
            pane(-3.7, 3.7, floorY+10.4, floorY+24);
            [-22.5,-16.2,-9.9,-3.7,3.7,9.9,16.2,22.5].forEach(x => {
                createBox(0.19,24,0.32,x,floorY+12,z+0.16,bronze,false,false);
            });
            [10.4, 18.2, 23.7].forEach(y => createBox(45,0.22,0.32,0,floorY+y,z+0.16,bronze,false,false));
        }
        createCurtainWall();

        function createMarbleDoorSurround() {
            const doorwayHalf = 3.7;
            const doorwayTop = floorY + 10.4;
            const frontZ = 57.42;
            const addTrim = (w, h, d, x, y, z, mat) => {
                const trim = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
                trim.position.set(x, y, z);
                trim.castShadow = true;
                trim.receiveShadow = true;
                scene.add(trim);
            };

            // Broad outer surround, then a slimmer projecting inner step. The
            // two depths read as a clean carved bevel without heavy geometry.
            addTrim(0.82, 11.25, 0.58, -(doorwayHalf + 0.41), floorY + 5.63, frontZ, whiteStoneMat);
            addTrim(0.82, 11.25, 0.58,  (doorwayHalf + 0.41), floorY + 5.63, frontZ, whiteStoneMat);
            addTrim(9.04, 0.82, 0.58, 0, doorwayTop + 0.41, frontZ, whiteStoneMat);

            const bevelMat = whiteStoneMat.clone();
            bevelMat.color = new THREE.Color(0xf8f7f2);
            addTrim(0.28, 10.52, 0.32, -(doorwayHalf + 0.14), floorY + 5.26, frontZ + 0.38, bevelMat);
            addTrim(0.28, 10.52, 0.32,  (doorwayHalf + 0.14), floorY + 5.26, frontZ + 0.38, bevelMat);
            addTrim(7.96, 0.28, 0.32, 0, doorwayTop + 0.14, frontZ + 0.38, bevelMat);
        }
        createMarbleDoorSurround();

        function createEntranceGeometryQuote() {
            const canvas = document.createElement('canvas');
            canvas.width = 1024;
            canvas.height = 256;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#4f555d';
            ctx.font = '300 38px "Helvetica Neue", Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Let no one untrained', canvas.width / 2, 96);
            ctx.fillText('in geometry enter.', canvas.width / 2, 162);
            const texture = new THREE.CanvasTexture(canvas);
            texture.colorSpace = THREE.SRGBColorSpace;
            const material = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                depthWrite: false,
                toneMapped: false,
                polygonOffset: true,
                polygonOffsetFactor: -2,
                polygonOffsetUnits: -2
            });
            const quote = new THREE.Mesh(new THREE.PlaneGeometry(8.0, 2.0), material);
            // Flush against the front face of the marble curtain wall and
            // narrow enough to remain between the two central pillars.
            quote.position.set(0, floorY + 13.2, 57.17);
            quote.renderOrder = 20;
            scene.add(quote);
        }


        /* ------------------------------------------------------------------
           FACADE LIGHTING
           Warm wash at the foot of each column and light lines along the
           steps, as in the reference.
        ------------------------------------------------------------------ */
        function createFacadeLighting() {
            const glowMat = new THREE.MeshStandardMaterial({
                color: 0xfff2d8, emissive: 0xffe9c4, emissiveIntensity: 3.4, roughness: 0.2
            });

            // Exactly four uplights on the outer columns, leaving the entrance
            // and its four central pillars clean and unobstructed.
            const litColumnXs = [-21.55, -4.6, 4.6, 21.55];
            litColumnXs.forEach((x) => {
                const plate = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.10, 0.62), glowMat);
                plate.position.set(x, insideY + 0.06, 60.15);
                scene.add(plate);

                const uplight = new THREE.SpotLight(0xff9b43, 280, 32, 0.48, 0.98, 1.35);
                uplight.position.set(x, insideY + 0.24, 60.15);
                uplight.castShadow = false;

                const target = new THREE.Object3D();
                target.position.set(x, insideY + 16.5, 59.35);
                scene.add(target);
                uplight.target = target;
                uplight.userData.beatBase=280;scene.add(uplight);
            });
        }
        createFacadeLighting();

        // Dark decorative side slots removed from both the left and right wings.


        const desk = createBox(9.7, 3.3, 3.9, 0, insideY + 1.65, -5, whiteStoneMat, true, true);
        desk.userData = { isReception: true };
        interactableModels.push(desk);

        function createQuoteWall(text, x, y, z) {
            const canvas = document.createElement('canvas');
            canvas.width = 1024; canvas.height = 512;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#f7f6f4'; ctx.fillRect(0, 0, 1024, 512);

            ctx.strokeStyle = 'rgba(20,22,26,0.16)'; ctx.lineWidth = 2; ctx.strokeRect(38, 38, 948, 436);

            ctx.fillStyle = '#14161a'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            let fontSize = 58; ctx.font = '300 ' + fontSize + 'px "Helvetica Neue", Helvetica, Arial, sans-serif';
            const words = text.split(' '); let lines = [text];
            if (ctx.measureText(text).width > 800) {
                let best = 1, bestDiff = Infinity;
                for (let i = 1; i < words.length; i++) {
                    const diff = Math.abs(ctx.measureText(words.slice(0, i).join(' ')).width - ctx.measureText(words.slice(i).join(' ')).width);
                    if (diff < bestDiff) { bestDiff = diff; best = i; }
                }
                lines = [words.slice(0, best).join(' '), words.slice(best).join(' ')];
            }
            if (lines.length === 1) ctx.fillText(lines[0], 512, 238); else { ctx.fillText(lines[0], 512, 205); ctx.fillText(lines[1], 512, 285); }

            ctx.strokeStyle = 'rgba(20,22,26,0.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(462, 360); ctx.lineTo(562, 360); ctx.stroke();
            ctx.fillStyle = 'rgba(20,22,26,0.55)';
            if ('letterSpacing' in ctx) ctx.letterSpacing = '12px';
            ctx.font = '500 26px Arial, Helvetica, sans-serif'; ctx.fillText('IPU IFLII', 512, 408);

            const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace;
            const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.4 });
            const mesh = new THREE.Mesh(new THREE.PlaneGeometry(6.0, 3.0), mat);
            const faceRot = x < 0 ? Math.PI / 2 : -Math.PI / 2;
            mesh.name = 'Raised wall quote';
            mesh.position.set(x, y, z); mesh.rotation.y = faceRot; mesh.translateZ(0.24); scene.add(mesh);
            const backing = new THREE.Mesh(new THREE.BoxGeometry(6.08,3.08,0.2),new THREE.MeshStandardMaterial({color:0xe9e7e2,roughness:0.72}));
            backing.name='Marble quote backing';backing.position.set(x,y,z);backing.rotation.y=faceRot;backing.translateZ(0.12);backing.castShadow=true;backing.receiveShadow=true;scene.add(backing);

            const hitBox = new THREE.Mesh(new THREE.BoxGeometry(6.0, 3.0, 0.5), new THREE.MeshBasicMaterial({ visible: false }));
            hitBox.position.set(x, y, z); hitBox.rotation.y = faceRot; scene.add(hitBox);
            interactableModels.push(hitBox); hitBox.userData = { isQuote: true, text: text };
        }




        statuePedestals.push({ x: -7, y: insideY + 0.05, z: 50, rotY: Math.PI / 2 });
        statuePedestals.push({ x: 7, y: insideY + 0.05, z: 50, rotY: -Math.PI / 2 });
        statuePedestals.push({ x: -12, y: floorY + 0.05, z: 70, rotY: 0 });
        statuePedestals.push({ x: 12, y: floorY + 0.05, z: 70, rotY: 0 });

        const mediaPanels = [];

        function createDisplayPanel(x, y, z, width, height, rotY, isHole = false) {
            const frameThickness = 0.4;
            const frame = new THREE.Mesh(new THREE.BoxGeometry(width + 0.4, height + 0.4, frameThickness), platinumFrameMat);
            frame.position.set(x, y, z); frame.rotation.y = rotY; addOutline(frame); scene.add(frame);

            const screenMat = isHole ? new THREE.MeshBasicMaterial({ colorWrite: false }) : new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2 });
            const screen = new THREE.Mesh(new THREE.PlaneGeometry(width, height), screenMat);
            screen.position.set(x, y, z); screen.rotation.y = rotY; screen.translateZ(frameThickness / 2 + 0.01);
            scene.add(screen);
            mediaPanels.push({ screen, frame, defaultWidth: width, defaultHeight: height, isHole: isHole });
        }

        function adjustPanelSize(panelObj, aspect) {
            let newW, newH;
            const defaultW = panelObj.defaultWidth; const defaultH = panelObj.defaultHeight;
            if (aspect > 1) {
                newW = defaultW; newH = defaultW / aspect;
                if (newH > defaultH) { newH = defaultH; newW = defaultH * aspect; }
            } else {
                newH = defaultH; newW = defaultH * aspect;
                if (newW > defaultW) { newW = defaultW; newH = defaultW / aspect; }
            }
            panelObj.screen.geometry.dispose(); panelObj.screen.geometry = new THREE.PlaneGeometry(newW, newH);
            panelObj.frame.geometry.dispose(); panelObj.frame.geometry = new THREE.BoxGeometry(newW + 0.4, newH + 0.4, 0.4);
            panelObj.frame.children.forEach(c => { if (c.isLineSegments) panelObj.frame.remove(c); });
            addOutline(panelObj.frame);
        }

        marqueeCanvas = document.createElement('canvas');
        marqueeCanvas.width = 2048; marqueeCanvas.height = 128;
        marqueeCtx = marqueeCanvas.getContext('2d');
        if (marqueeCtx) { marqueeCtx.fillStyle = '#ffffff'; marqueeCtx.fillRect(0, 0, marqueeCanvas.width, marqueeCanvas.height); }

        marqueeTexture = new THREE.CanvasTexture(marqueeCanvas);
        marqueeTexture.wrapS = THREE.RepeatWrapping; marqueeTexture.wrapT = THREE.RepeatWrapping;
        marqueeTexture.colorSpace = THREE.SRGBColorSpace;

        const marqueeMat = new THREE.MeshStandardMaterial({
            map: marqueeTexture, emissive: 0xffffff, emissiveMap: marqueeTexture, emissiveIntensity: 0.35, roughness: 0.2
        });
        const marqueeMesh = new THREE.Mesh(new THREE.PlaneGeometry(20, 1.25), marqueeMat);
        marqueeMesh.position.set(0, floorY + wallH - 3, -18.94);

        const marqueeFrame = new THREE.Mesh(new THREE.BoxGeometry(20.4, 1.65, 0.1), new THREE.MeshStandardMaterial({ color: 0xe9e9e6, roughness: 0.35, metalness: 0.4 }));
        marqueeFrame.position.set(0, floorY + wallH - 3, -19.0); addOutline(marqueeFrame);

        window.applyVisualsToPanels = function () {
            const panelImageSets = [['WebAssets/Pegasus/standing.webp'],['WebAssets/Pegasus/flight.webp']];

            for (let i = 0; i < mediaPanels.length; i++) {
                const panelObj = mediaPanels[i];
                if (panelObj.isHole) continue;
                const candidates = panelImageSets[i % panelImageSets.length];

                const applyImage = (candidateIndex) => {
                    if (candidateIndex >= candidates.length) return;
                    const url = candidates[candidateIndex];
                    const img = new Image();
                    img.crossOrigin = "Anonymous";
                    img.onload = () => {
                        adjustPanelSize(panelObj, img.width / img.height);
                        const textureLoader = new THREE.TextureLoader();
                        const texture = textureLoader.load(url);
                        texture.colorSpace = THREE.SRGBColorSpace;
                        panelObj.screen.material = new THREE.MeshBasicMaterial({ map: texture, color: 0xffffff });
                    };
                    img.onerror = () => applyImage(candidateIndex + 1);
                    img.src = url;
                };
                applyImage(0);
            }
        };

        applyVisualsToPanels();

        createBox(60, 0.18, 140, 0, COURTYARD_Y - 0.12, 130, floorMat, false, false);

        function createSimplePillar(x,z){
            const first=new Set(scene.children),baseY=groundHeightAt(x,z),h=16+(baseY-COURTYARD_Y)*.22;
            const foot=createBox(3.8,.45,3.8,x,baseY+.225,z,whiteStoneMat,true,false);
            foot.name='Stair column square footing';
            createBox(3.1,1.1,3.1,x,baseY+1,z,whiteStoneMat,true,false);
            createBox(3.55,.24,3.55,x,baseY+1.67,z,whiteStoneMat,true,false);
            const shaft=new THREE.Mesh(makeDoricShaftGeometry(.984,1.128,h,16),whiteStoneMat);shaft.position.set(x,baseY+1.79+h/2,z);shaft.name='Ascending stair column';shaft.castShadow=true;shaft.receiveShadow=true;scene.add(shaft);collisionMeshes.push(shaft);
            createBox(2.9,.5,2.9,x,baseY+1.79+h+.25,z,whiteStoneMat,true,false);
            for(const object of scene.children)if(!first.has(object))object.userData.preserveElevation=true;
        }
        for(let i=3;i<12;i++){const z=65+i*5.5;createSimplePillar(-27,z);createSimplePillar(27,z);}

        /* Reflecting pools and restrained gardens inspired by the reference.
           They sit outside the colonnade, preserving the full central route. */
        const reflectingPoolWaters = [];
        const waterMat = new THREE.ShaderMaterial({
            transparent: true,
            side: THREE.DoubleSide,
            extensions: { derivatives: true },
            uniforms: { uTime: { value: 0 } },
            vertexShader: `
                uniform float uTime;
                varying float vHeight;
                varying float vStripe;
                varying vec3 vWorldPosition;
                void main() {
                    vec3 p = position;
                    float stagger = floor((p.y + 52.0) / 3.2) * 0.32;
                    float broad = sin(p.y * 0.19 + uTime * 1.75 + stagger);
                    float crossWave = sin(p.x * 0.52 - p.y * 0.075 - uTime * 1.18);
                    float spinRhythm = sin(uTime * 3.14159 + stagger);
                    float height = broad * 0.034 + crossWave * 0.018;
                    height *= 0.90 + spinRhythm * 0.10;
                    p.z += height;
                    vHeight = height;
                    vStripe = broad * 0.5 + 0.5;
                    vWorldPosition = (modelMatrix * vec4(p, 1.0)).xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
                }
            `,
            fragmentShader: `
                varying float vHeight;
                varying float vStripe;
                varying vec3 vWorldPosition;
                void main() {
                    // Two-tone palette only: #1185AE and #28AECD.
                    vec3 deepColor = vec3(0.018, 0.055, 0.070);
                    vec3 lightColor = vec3(0.075, 0.17, 0.19);
                    float level = smoothstep(-0.052, 0.052, vHeight);
                    vec3 surfaceNormal = normalize(cross(dFdx(vWorldPosition), dFdy(vWorldPosition)));
                    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
                    float fresnel = pow(1.0 - abs(dot(surfaceNormal, viewDirection)), 2.15);
                    float reflection = clamp(level * 0.48 + fresnel * 0.72 + vStripe * 0.05, 0.0, 1.0);
                    vec3 color = mix(deepColor, lightColor, reflection);
                    // Mostly invisible head-on, more reflective at shallow angles.
                    float alpha = 0.78 + fresnel * 0.15;
                    gl_FragColor = vec4(color, alpha);
                }
            `
        });
        function createReflectingPool(x) {
            const poolW = 18;
            const poolL = 104;
            const poolZ = 137;
            createBox(poolW + 1.2, 0.20, poolL + 1.2, x, floorY + 0.02, poolZ, whiteStoneMat, false, false);
            // Extra segments let the surface move gently instead of looking flat.
            const waterGeometry = new THREE.PlaneGeometry(poolW, poolL, 18, 72);
            const water = new THREE.Mesh(waterGeometry, waterMat);
            water.rotation.x = -Math.PI / 2;
            // Keep the complete animated surface above the basin floor while
            // leaving it slightly below the marble rim.
            water.position.set(x, floorY + 0.32, poolZ);
            water.receiveShadow = true;
            reflectingPoolWaters.push(water);
            scene.add(water);
            createBox(0.55, 0.46, poolL + 1.2, x - poolW / 2 - 0.3, floorY + 0.23, poolZ, whiteStoneMat, true, false);
            createBox(0.55, 0.46, poolL + 1.2, x + poolW / 2 + 0.3, floorY + 0.23, poolZ, whiteStoneMat, true, false);
            createBox(poolW + 1.2, 0.46, 0.55, x, floorY + 0.23, poolZ - poolL / 2 - 0.3, whiteStoneMat, true, false);
            createBox(poolW + 1.2, 0.46, 0.55, x, floorY + 0.23, poolZ + poolL / 2 + 0.3, whiteStoneMat, true, false);
        }

        createReflectingPool(-41);
        createReflectingPool(41);

        const endBoundary = createBox(62, 8, 1, 0, floorY + 4, 188, floorMat, true, false);
        endBoundary.visible = false;

        /* ==================================================================
           PRODUCT CATALOGUE
           Every entry is keyed by the exact GLB file name of the display
           model, so clicking a piece in the hall always opens its own
           product: title, price, photo, copy and store link.
           To re-link a model, change only the key it sits under.
        ================================================================== */
        const STORE_URL = "https://ipuiflii.com";

        const CLASSIC_TEE_DESCRIPTION = `
            <p><strong>Unisex classic tee</strong><br>
            100% cotton with a structured drape. It holds its shape, keeps sharp lines at the edges and layers well under heavier pieces.</p>
            <ul>
                <li>100% cotton (Sport Grey 90% cotton / 10% polyester, Ash 99% / 1%, Heather colours 50% / 50%)</li>
                <li>Fabric weight: 5.0–5.3 oz/yd² (170–180 g/m²)</li>
                <li>Open-end yarn, tubular fabric</li>
                <li>Taped neck and shoulders</li>
                <li>Double seam at the sleeves and bottom hem</li>
            </ul>
            <p><strong>Good to know</strong></p>
            <ul>
                <li>White can read slightly off-white because of the fabric.</li>
                <li>Dark speckles in the Natural colourway are expected.</li>
            </ul>
            <p>Each piece is made once you order it. Making on demand instead of in bulk keeps overproduction down, so it takes a little longer to reach you.</p>`;

        const OVERSIZED_TEE_DESCRIPTION = `
            <p><strong>Oversized faded t-shirt</strong><br>
            A boxy, garment-dyed cut made for layering. Loose enough to play with proportion, with a worn-in finish from the first wear.</p>
            <ul>
                <li>100% carded cotton</li>
                <li>Fabric weight: 7.1 oz/yd² (240 g/m²)</li>
                <li>Garment-dyed, pre-shrunk</li>
                <li>Boxy oversized fit with dropped shoulders</li>
                <li>Wide neck ribbing, tear-away label</li>
            </ul>
            <p>Each piece is made once you order it. Making on demand instead of in bulk keeps overproduction down, so it takes a little longer to reach you.</p>`;

        const COMING_SOON_DESCRIPTION = `
            <p>Part of the IPU IFLII collection. Open the store for the current colourways, sizing and price.</p>`;

        const CDN = "https://ipuiflii.com/cdn/shop/files/";

        const PRODUCTS_BY_MODEL = {
            "atlas.glb": {
                title: "IPU IFLII All Fine Design",
                price: "",
                img: CDN + "unisex-classic-tee-black-front-6a7d0100a9794.png?v=1786577172&width=832",
                url: "https://ipuiflii.com/products/ipu-iflii-logo-tee",
                description: CLASSIC_TEE_DESCRIPTION
            },
            "pegasus.glb": {
                title: "Timeless Pegasus",
                price: "",
                img: CDN + "unisex-classic-tee-white-front-6a7d03d31a42b.jpg?v=1786577896&width=832",
                url: "https://ipuiflii.com/products/ipu-iflii-pegasus-hoodie",
                description: CLASSIC_TEE_DESCRIPTION
            },
            "timelesszigzag.glb": {
                title: "Timeless — Zig Zag",
                price: "",
                img: CDN + "unisex-classic-tee-white-front-6a7d04a9772a4.jpg?v=1786578111&width=832",
                url: "https://ipuiflii.com/products/zig-zag-t-shirt",
                description: CLASSIC_TEE_DESCRIPTION
            },
            "zigzag.glb": {
                title: "IPU IFLII Zig Zag Logo",
                price: "",
                img: CDN + "unisex-classic-tee-maroon-front-6a754f16a5202.png?v=1786072877&width=3840",
                url: "https://ipuiflii.com/products/zig-zag-logo-t-shirt",
                description: CLASSIC_TEE_DESCRIPTION
            },
            // Zig-zag emblem: no photo yet, so the panel opens without a
            // gallery and sends people to the full collection.
            "timelesszigzag2.glb": {
                title: "IPU IFLII Zig-Zag Emblem",
                price: "",
                img: "",
                url: "https://ipuiflii.com/collections/all",
                description: CLASSIC_TEE_DESCRIPTION
            },
            "ipuiflii.glb": {
                title: "The Unique IFLII",
                price: "",
                img: CDN + "unisex-classic-tee-white-front-6a7d0384b66ee.png?v=1786577815&width=832",
                url: "https://ipuiflii.com/products/ipu-iflii",
                description: CLASSIC_TEE_DESCRIPTION
            },
            "ipuifliiclassic.glb": {
                title: "IPU IFLII Classic",
                price: "",
                img: CDN + "unisex-classic-tee-white-front-6a7d06da29254.jpg?v=1786578670&width=832",
                url: "https://ipuiflii.com/products/ipu-iflii-logo-center",
                description: CLASSIC_TEE_DESCRIPTION
            },
            "playyourharp.glb": {
                title: "Just Play Your Harp",
                price: "",
                img: CDN + "unisex-classic-tee-white-front-6a7550c20ce4d.png?v=1786073306&width=832",
                url: "https://ipuiflii.com/products/just-play-your-harp?variant=58786201993561",
                description: CLASSIC_TEE_DESCRIPTION
            },
            "ipuifliihercues.glb": {
                title: "Oversized IPU IFLII T-Shirt",
                price: "",
                img: CDN + "mens-oversized-faded-t-shirt-faded-black-front-6a75509c8c943.png?v=1786073264&width=832",
                url: "https://ipuiflii.com/products/ipu-iflii-logo-t-shirt",
                description: OVERSIZED_TEE_DESCRIPTION
            },
            "ipu_iflii_blue.glb": {
                title: "IPU IFLII Blue",
                price: "",
                img: "",
                url: "https://ipuiflii.com/collections/all",
                description: COMING_SOON_DESCRIPTION
            }
        };

        const FALLBACK_PRODUCT = {
            title: "IPU IFLII",
            price: "",
            img: "",
            url: STORE_URL,
            description: COMING_SOON_DESCRIPTION
        };

        function productForModel(fileName) {
            return PRODUCTS_BY_MODEL[String(fileName || '').toLowerCase()] || FALLBACK_PRODUCT;
        }

        const shirtDisplaySlots = [];

        // All garment displays use the same cinematic aperture-bloom cue.
        const SHOWCASE_LIGHT_CUES = [
            { name: '01 Aperture Bloom', type: 'bloom', color: 0xffffff, duration: 160, start: 0.045, end: 0.70, peak: 46 }
        ];
        let showcaseTestCue = null;
        let selectedShowcaseCue = null;
        let showcaseTestStartedAt = 0;

        // Each entry pairs with SHIRT_MODEL_FILES at the same index.
        const modelPositions = [
            { x: -18.5, z: 40 }, { x: 18.5, z: 40 },
            { x: -18.5, z: 31 }, { x: 18.5, z: 31 },
            { x: -18.5, z: 22 }, { x: 18.5, z: 22 },
            { x: -18.5, z: 13 }, { x: 18.5, z: 13 },
            { x: -18.5, z: 4 }, { x: 18.5, z: 4 }
        ];

        const showcaseGlassMat = new THREE.MeshPhysicalMaterial({
            color: 0xf4fbff,
            transparent: true,
            opacity: 0.14,
            roughness: 0.06,
            metalness: 0,
            clearcoat: 1.0,
            clearcoatRoughness: 0.03,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        const showcaseFrameMat = new THREE.LineBasicMaterial({
            color: 0xeef6ff,
            transparent: true,
            opacity: 0.72
        });
        const showcaseLampMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0xffffff,
            emissiveIntensity: 5,
            roughness: 0.08
        });

        function buildGlassShowcase(group, cueIndex) {
            const caseW = 3.5;
            const caseD = 3.5;
            const caseBottom = 1.5;
            const caseH = 4.2;
            const caseTop = caseBottom + caseH;
            const caseGeometry = new THREE.BoxGeometry(caseW, caseH, caseD);
            const glassShell = new THREE.Mesh(caseGeometry, showcaseGlassMat);
            glassShell.position.set(0, caseBottom + caseH / 2, 0);
            glassShell.renderOrder = 3;
            group.add(glassShell);

            const frame = new THREE.LineSegments(new THREE.EdgesGeometry(caseGeometry), showcaseFrameMat);
            frame.position.copy(glassShell.position);
            frame.renderOrder = 4;
            group.add(frame);

            const caseCollider = new THREE.Mesh(
                new THREE.BoxGeometry(caseW + 0.12, caseH + caseBottom, caseD + 0.12),
                new THREE.MeshBasicMaterial({ visible: false })
            );
            caseCollider.position.set(0, (caseH + caseBottom) / 2, 0);
            caseCollider.visible = false;
            caseCollider.userData.isShowcaseCollider = true;
            group.add(caseCollider);
            collisionMeshes.push(caseCollider);

            // Clone the material so the small ceiling lamp can brighten on its
            // own without making every showcase flash at the same time.
            const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.055, 24), showcaseLampMat.clone());
            lamp.position.set(0, caseTop - 0.07, 0);
            group.add(lamp);

            const cue = SHOWCASE_LIGHT_CUES[cueIndex % SHOWCASE_LIGHT_CUES.length];
            const downLight = new THREE.SpotLight(cue.color, 0, 7.0, cue.start, 0.82, 1.4);
            downLight.position.set(0, caseTop - 0.16, 0);
            downLight.target.position.set(0, caseBottom + 0.65, 0);
            downLight.castShadow = false;
            // One shared hall key lights the garments; fittings retain their reveal animation.
            group.add(downLight.target);

            // Independent floor lamp for upward, crossed and rotating cues.
            const upLight = new THREE.SpotLight(cue.under || cue.color, 0, 7.0, 0.10, 0.72, 1.3);
            upLight.position.set(0, caseBottom + 0.10, 0);
            upLight.target.position.set(0, caseBottom + 3.0, 0);
            upLight.castShadow = false;
            // Decorative upward fitting; no additional per-pixel light.
            group.add(upLight.target);

            // Four slim line lights rise from the lower side corners around
            // the clothing. They share one soft fill light for performance.
            const miniLamps = [];
            const proximityFill = new THREE.PointLight(0xeaf8ff, 0, 5.4, 1.8);
            proximityFill.position.set(0, caseBottom + 1.25, 0);
            proximityFill.castShadow = false;
            // Emissive mini-lamps respond to approach without another dynamic light.

            return { downLight, upLight, lamp, cue, miniLamps, proximityFill };
        }

        // Small engraved plate on the front of each pedestal, so the piece is
        // named before you click it.
        function addPedestalPlate(group, product, facesLeft) {
            if (!product || !product.title) return;
            const c = document.createElement('canvas');
            c.width = 512; c.height = 128;
            const ctx = c.getContext('2d');
            ctx.clearRect(0, 0, c.width, c.height);
            ctx.fillStyle = '#14161a';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            if ('letterSpacing' in ctx) ctx.letterSpacing = '4px';

            let title = product.title.toUpperCase();
            let size = 40;
            ctx.font = '500 ' + size + 'px Arial, Helvetica, sans-serif';
            while (ctx.measureText(title).width > 470 && size > 20) {
                size -= 2;
                ctx.font = '500 ' + size + 'px Arial, Helvetica, sans-serif';
            }
            ctx.fillText(title, c.width / 2, product.price ? 52 : 64);

            if (product.price) {
                ctx.fillStyle = 'rgba(20,22,26,0.55)';
                ctx.font = '400 28px Arial, Helvetica, sans-serif';
                ctx.fillText(product.price, c.width / 2, 94);
            }

            const tex = new THREE.CanvasTexture(c);
            tex.colorSpace = THREE.SRGBColorSpace;
            const plate = new THREE.Mesh(
                new THREE.PlaneGeometry(2.6, 0.65),
                new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false })
            );
            plate.position.set(facesLeft ? 1.77 : -1.77, 0.95, 0);
            plate.rotation.y = facesLeft ? Math.PI / 2 : -Math.PI / 2;
            group.add(plate);
        }

        modelPositions.forEach((pos, index) => {
            if (index >= SHIRT_MODEL_FILES.length) return;
            const fileName = SHIRT_MODEL_FILES[index];
            const prod = productForModel(fileName);
            const group = new THREE.Group();
            group.position.set(pos.x, insideY, pos.z);

            const pedestal = createBox(3.5, 1.5, 3.5, 0, 0.75, 0, whiteStoneMat, true, true);
            group.add(pedestal);
            const cinematicLight = buildGlassShowcase(group, 0);
            addPedestalPlate(group, prod, pos.x < 0);

            scene.add(group);
            shirtDisplaySlots.push({
                group, prod, fileName, label: null,
                ...cinematicLight,
                lightActive: false,
                lightStartedAt: 0,
                lightAmount: 0,
                proximityAmount: 0
            });
        });

        function easeOutCubic(t) {
            return 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);
        }

        function lightSequence(type, raw) {
            const t = Math.max(0, Math.min(1, raw));
            const open = easeOutCubic(t);
            const hit = (at, width) => Math.exp(-Math.pow((t - at) / width, 2));
            switch (type) {
                case 'bottomRise': return { open, power: .56 + .30 * open, up: .25 + .75 * open, spin: 0 };
                case 'goldOrbit':  return { open, power: .66 + .22 * open, up: .55 + .25 * hit(.55,.22), spin: t * Math.PI * 2 };
                case 'cross':      return { open, power: .68 + .30 * hit(.28,.09), up: .78 + .28 * hit(.62,.12), spin: Math.PI * .25 };
                case 'iceOrbit':   return { open, power: .72 + .10 * Math.sin(t*Math.PI*4), up: .45 + .18 * Math.sin(t*Math.PI*4+1), spin: -t*Math.PI*2 };
                case 'floorBeat':  return { open, power: .58 + .18*open, up: .48 + .48*hit(.32,.05) + .40*hit(.43,.04), spin: 0 };
                case 'royalSweep': return { open: 1-Math.pow(1-t,2), power: .54+.40*open, up: .38+.42*open, spin: Math.sin(t*Math.PI*2)*1.15 };
                case 'sideSweep':  return { open, power: .70+.16*open, up: .34+.25*open, spin: Math.sin(t*Math.PI*4)*1.25 };
                case 'twinWave':   return { open, power: .68+.20*Math.sin(t*Math.PI*3), up: .62+.22*Math.sin(t*Math.PI*3+Math.PI), spin: Math.sin(t*Math.PI*2)*.65 };
                case 'finale':     return { open, power: .62+.22*hit(.22,.06)+.25*hit(.48,.08)+.38*hit(.78,.11), up: .30+.26*hit(.30,.08)+.45*hit(.72,.15), spin: t*Math.PI*2.5 };
                default:           return { open, power: 0.62 + 0.38 * open, up: 0, spin: 0 };
            }
        }

        let templeShowcaseRevealStarted = false;
        let templeShowcaseRevealAt = 0;
        const SHOWCASE_PAIR_DELAY = 200;

        function cameraHasEnteredTemple() {
            // 61.2 is the first fully raised interior marble, immediately
            // after the entrance steps defined in groundHeightAt().
            return camera.position.z <= 61.2 && camera.position.z >= -149.7 && Math.abs(camera.position.x) < 30;
        }

        // Two reusable lights shade only nearby garments; each display has one overhead fitting.
        const garmentLightPool=Array.from({length:2},()=>{
            const light=new THREE.SpotLight(0xfff3df,0,7,.045,.82,1.4);
            light.castShadow=false;scene.add(light,light.target);return light;
        });
        function updateShowcaseLights(time,delta){
            const nearby=[];
            for(const slot of shirtDisplaySlots){
                const dx=camera.position.x-slot.group.position.x,dz=camera.position.z-slot.group.position.z;
                const facing=slot.group.position.x<0?dx>0:dx<0;
                const distance=Math.hypot(dx,dz);
                const close=facing&&distance<8.8&&Math.abs(dz)<7.8;
                slot.proximityAmount+=(Number(close)-slot.proximityAmount)*(1-Math.exp(-delta*(close?.85:.55)));
                slot.lightAmount=slot.proximityAmount;
                slot.lamp.material.emissiveIntensity=.04+slot.proximityAmount*3.6;
                if(slot.proximityAmount>.005)nearby.push({slot,distance});
            }
            nearby.sort((a,b)=>a.distance-b.distance);
            garmentLightPool.forEach((light,i)=>{
                const selected=nearby[i];
                if(!selected){light.intensity=0;return;}
                const slot=selected.slot,amount=slot.proximityAmount*slot.proximityAmount*(3-2*slot.proximityAmount);
                light.position.set(slot.group.position.x,insideY+5.63,slot.group.position.z);
                light.target.position.set(slot.group.position.x,insideY+2.8,slot.group.position.z);
                light.angle=THREE.MathUtils.lerp(.045,.70,amount);
                light.penumbra=THREE.MathUtils.lerp(.9,.55,amount);
                light.intensity=46*amount;
            });
            renderer.domElement.dataset.litGarments=nearby.slice(0,2).map(x=>x.slot.fileName).join(',');
        }

        const designsInput = document.getElementById('designs-input');
        const designsStatus = document.getElementById('designs-status');
        const skyInput = document.getElementById('sky-input');
        const skyStatus = document.getElementById('sky-status');
        const lightTestGrid = document.getElementById('light-test-grid');

        function setDesignsStatus(message) {
            document.querySelectorAll('.designs-status').forEach(el => { el.textContent = message; });
        }

        if (IS_FILE_PROTOCOL && !window.templeLocal) {
            document.querySelectorAll('.offline-designs-panel').forEach(el => { el.style.display = 'block'; });
            setDesignsStatus('Offline mode: choose the Designs folder to load all 10 models.');
        }

        if (lightTestGrid) {
            SHOWCASE_LIGHT_CUES.forEach((cue, index) => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'pause-menu-btn';
                button.textContent = cue.name;
                button.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    showcaseTestCue = index;
                    selectedShowcaseCue = index;
                    showcaseTestStartedAt = performance.now();
                    shirtDisplaySlots.forEach(slot => { slot.lightAmount = 0; });
                    if (pauseMenu) pauseMenu.classList.add('testing');
                    document.querySelectorAll('#light-test-grid .pause-menu-btn').forEach((item, i) => {
                        item.classList.toggle('primary', i === index);
                    });
                });
                lightTestGrid.appendChild(button);
            });
        }

        if (designsInput) {
            designsInput.addEventListener('change', async (event) => {
                const files = Array.from(event.target.files || []).filter(file => file.name.toLowerCase().endsWith('.glb'));
                for (const oldUrl of shirtModelSources.values()) {
                    if (String(oldUrl).startsWith('blob:')) URL.revokeObjectURL(oldUrl);
                }
                shirtModelSources.clear();
                let matched = 0;
                for (const file of files) {
                    const objectUrl = URL.createObjectURL(file);
                    if (registerShirtSource(file.name, objectUrl)) matched++;
                    else URL.revokeObjectURL(objectUrl);
                }
                setDesignsStatus(`Loading ${matched}/${SHIRT_MODEL_FILES.length} matching 3D models…`);
                if (matched > 0) {
                    shirtDisplaysBuilt = false;
                    const result = await buildShirtModelDisplays(true);
                    if (result.loaded === SHIRT_MODEL_FILES.length) {
                        const blueSlot = shirtDisplaySlots.find(slot => slot.fileName.toLowerCase() === 'ipu_iflii_blue.glb');
                        const blueStatus = blueSlot && blueSlot.animationClipCount > 0
                            ? ` Blue animation playing (${blueSlot.animationClipCount} clip${blueSlot.animationClipCount === 1 ? '' : 's'}).`
                            : ' Blue model loaded, but the GLB contains no animation clips.';
                        setDesignsStatus(`All ${result.loaded} models loaded successfully.${blueStatus}`);
                    } else {
                        const missing = result.failed.length ? ` Missing: ${result.failed.join(', ')}` : '';
                        setDesignsStatus(`${result.loaded}/${SHIRT_MODEL_FILES.length} models loaded.${missing}`);
                    }
                    return;
                }
                setDesignsStatus('No matching GLB files found. Please choose the Designs folder itself.');
            });
        }

        if (skyInput) {
            skyInput.addEventListener('change', (event) => {
                const files = Array.from(event.target.files || []);
                if (files.length === 1) {
                    const file = files[0];
                    const url = URL.createObjectURL(file);
                    new THREE.TextureLoader().load(url, texture => {
                        applySkyTexture(texture);
                        URL.revokeObjectURL(url);
                        [skyLayerLeft, skyLayerRight].forEach(layer => {
                            if (!layer) return;
                            scene.remove(layer);
                            layer.geometry.dispose();
                            layer.material.map.dispose();
                            layer.material.dispose();
                        });
                        skyLayerLeft = null;
                        skyLayerRight = null;
                        layeredSkyActive = false;
                        if (skyStatus) skyStatus.textContent = 'Single sky image loaded.';
                    }, undefined, () => {
                        URL.revokeObjectURL(url);
                        if (skyStatus) skyStatus.textContent = 'Could not load that sky image.';
                    });
                    return;
                }
                const bgFile = files.find(file => file.name.toLowerCase() === 'bg.png');
                const leftFile = files.find(file => file.name.toLowerCase() === '1.png');
                const rightFile = files.find(file => file.name.toLowerCase() === '2.png');
                if (!bgFile || !leftFile || !rightFile) {
                    if (skyStatus) skyStatus.textContent = 'Please select bg.png, 1.png and 2.png together.';
                    return;
                }
                const loader = new THREE.TextureLoader();
                const loadFile = (file, apply) => {
                    const url = URL.createObjectURL(file);
                    loader.load(url, texture => {
                        apply(texture);
                        URL.revokeObjectURL(url);
                    }, undefined, () => URL.revokeObjectURL(url));
                };
                loadFile(bgFile, applySkyTexture);
                loadFile(leftFile, texture => applyMovingSkyLayer(texture, -1));
                loadFile(rightFile, texture => applyMovingSkyLayer(texture, 1));
                layeredSkyActive = true;
                if (skyStatus) skyStatus.textContent = '3 sky layers loaded: background + opposite cloud motion.';
            });
        }

        async function loadShirtIntoSlot(slot, sourceUrl) {
            const loader = createGLTFLoader();
            let gltf;
            try {gltf=await loader.loadAsync(sourceUrl);}
            catch(error){if(String(sourceUrl).includes('/WebAssets/'))gltf=await loader.loadAsync(String(sourceUrl).replace('/WebAssets/','/'));else throw error;}
            webModelCache.set(slot.fileName.toLowerCase(),gltf);
            queueModelThumbnail(slot.fileName.toLowerCase(),gltf);
            const model = gltf.scene;

            model.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = false;
                    child.receiveShadow = true;
                    child.frustumCulled = true;
                    if (child.material) {
                        const mats = Array.isArray(child.material) ? child.material : [child.material];
                        mats.forEach(mat => {
                            mat.side = THREE.DoubleSide; mat.flatShading=false; mat.roughness=Math.max(mat.roughness||0,.7); mat.metalness=0; if(mat.normalScale)mat.normalScale.multiplyScalar(.45); for(const key of ["map","normalMap","roughnessMap"]){const tex=mat[key];if(tex){tex.magFilter=THREE.LinearFilter;tex.minFilter=THREE.LinearMipmapLinearFilter;tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());tex.needsUpdate=true;}}
                            mat.needsUpdate = true;
                        });
                    }
                }
            });

            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const maxHeight = 3.05;
            const maxWidth = 2.30;
            const maxDepth = 2.30;
            const scale = Math.min(maxHeight / Math.max(size.y, 0.001), maxWidth / Math.max(size.x, 0.001), maxDepth / Math.max(size.z, 0.001));

            // Keep sizing and pedestal placement outside the animated GLB root.
            // This prevents an animation track from overwriting our scale/offset.
            const centeredModel = new THREE.Group();
            centeredModel.position.set(-box.getCenter(new THREE.Vector3()).x, -box.min.y, -box.getCenter(new THREE.Vector3()).z);
            centeredModel.add(model);

            const normalizedModel = new THREE.Group();
            normalizedModel.scale.setScalar(scale);
            normalizedModel.add(centeredModel);

            const productHolder = new THREE.Group();
            productHolder.position.set(0, 1.55, 0);
            productHolder.rotation.y = slot.group.position.x < 0 ? Math.PI / 2 : -Math.PI / 2;
            productHolder.add(normalizedModel);

            // Retain and play every animation embedded in the GLB. In
            // particular, IPU_IFLII_BLUE.glb now runs its authored animation.
            slot.mixer = null;
            slot.animationClipCount = gltf.animations ? gltf.animations.length : 0;
            if (slot.animationClipCount > 0) {
                slot.mixer = new THREE.AnimationMixer(model);
                gltf.animations.forEach(clip => {
                    const action = slot.mixer.clipAction(clip);
                    action.setLoop(THREE.LoopRepeat, Infinity);
                    action.clampWhenFinished = false;
                    action.play();
                });
            }

            // The product data travels with every mesh, so a click anywhere on
            // the garment opens that garment's own page.
            productHolder.userData = { isProduct: true, data: slot.prod };
            model.userData = { isProduct: true, data: slot.prod };
            model.traverse(child => {
                if (child.isMesh) {
                    child.userData = { isProduct: true, data: slot.prod };
                    interactableModels.push(child);
                }
            });

            if (slot.label) {
                slot.group.remove(slot.label);
                slot.label = null;
            }
            slot.group.add(productHolder);
            slot.model = productHolder;
        }

        async function buildShirtModelDisplays(forceReload = false) {
            if (shirtDisplaysBuilt && !forceReload) return;
            let loaded = 0;
            const failed = [];

            for (const slot of shirtDisplaySlots) {
                if (slot.model && !forceReload) { loaded++; continue; }
                if (slot.model && forceReload) {
                    if (slot.mixer) {
                        slot.mixer.stopAllAction();
                        slot.mixer.uncacheRoot(slot.mixer.getRoot());
                        slot.mixer = null;
                    }
                    slot.group.remove(slot.model);
                    slot.model = null;
                }

                const source = shirtModelSources.get(slot.fileName.toLowerCase());
                if (!source) { failed.push(slot.fileName); continue; }

                try {
                    await loadShirtIntoSlot(slot, source);
                    loaded++;
                    markAssetLoaded(`product:${slot.fileName.toLowerCase()}`);
                    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
                } catch (error) {
                    failed.push(slot.fileName);
                }
            }

            shirtDisplaysBuilt = loaded === shirtDisplaySlots.length;
            return { loaded, failed };
        }

        // Hosted pages can fetch the sibling Designs folder automatically.
        // A file:// page must receive explicit folder permission from the user.
        setTimeout(autoLocateShirtModels, 2400);

        const collidableBoxes = [];
        function rebuildCollisionBoxes() {
            collidableBoxes.length = 0;
            scene.updateMatrixWorld(true);

            collisionMeshes.forEach(mesh => {
                mesh.updateWorldMatrix(true, false);
                const worldBox = new THREE.Box3().setFromObject(mesh, true);
                if (!worldBox.isEmpty()) collidableBoxes.push(worldBox);
            });
        }
        rebuildCollisionBoxes();

        camera.position.set(0, COURTYARD_Y + 2.9, 145);
        camera.lookAt(0,floorY+13,57);

        function createEdgeLight(x, yLevel, zStart, zEnd) {
            const length = Math.abs(zEnd - zStart);
            const zCenter = (zStart + zEnd) / 2;

            const barGeo = new THREE.BoxGeometry(0.4, 0.2, length);
            const barMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 5, roughness: 0.1 });
            const bar = new THREE.Mesh(barGeo, barMat);
            bar.position.set(x, yLevel, zCenter); scene.add(bar);

            const numLights = 1;
            for (let i = 0; i <= numLights; i++) {
                const fraction = (i / numLights) - 0.5;
                const lz = zCenter + (length * fraction * 0.95);

                const light = new THREE.PointLight(0xffd6a6, 65.0, 48);
                const lightX = x < 0 ? x + 1 : x - 1;
                light.position.set(lightX, yLevel - 0.5, lz); scene.add(light);
            }
        }

        createEdgeLight(-29.5, floorY + wallH - 0.1, -20, 60);
        // The opposite cove uses an emissive strip without another bank of point lights.

        function createCinematicTempleFills() {
            const fills = [
                [-23.5, insideY + 8.5, 48, 0xffd6aa, 24, 40],
                [ 23.5, insideY + 8.5, 48, 0xffd6aa, 24, 40],
                [-23.5, insideY + 7.5, 12, 0xbfdcff, 20, 38],
                [ 23.5, insideY + 7.5, 12, 0xbfdcff, 20, 38],
                [-22.0, insideY + 6.0, -14, 0xe4edff, 18, 34],
                [ 22.0, insideY + 6.0, -14, 0xe4edff, 18, 34]
            ];
            const activeFills = [fills[0], fills[1]];
            activeFills.forEach(([x, y, z, color, intensity, distance]) => {
                const light = new THREE.PointLight(color, intensity, distance, 2.0);
                light.position.set(x, y, z);
                light.castShadow = false;
                scene.add(light);
            });

            // Soft pool accents make the water read as reflective cyan without
            // adding screen-space reflections or other heavy post-processing.
            [-41, 41].forEach(x => {
                const poolGlow = new THREE.PointLight(0x7de8ff, isTouchMode ? 8 : 13, 34, 2.0);
                poolGlow.position.set(x, COURTYARD_Y + 2.4, 126);
                poolGlow.castShadow = false;
                scene.add(poolGlow);
            });
        }
        createCinematicTempleFills();

        const brandCanvas = document.createElement('canvas');
        brandCanvas.width = 2048; brandCanvas.height = 512;
        const brandCtx = brandCanvas.getContext('2d');
        const brandTexture = new THREE.CanvasTexture(brandCanvas);
        brandTexture.colorSpace = THREE.SRGBColorSpace;
        brandTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

        function drawBrandInscription() {
            if (!brandCtx) return;
            brandCtx.clearRect(0, 0, brandCanvas.width, brandCanvas.height);
            brandCtx.textAlign = 'center'; brandCtx.textBaseline = 'middle';
            if ('letterSpacing' in brandCtx) brandCtx.letterSpacing = '24px';
            brandCtx.font = '600 250px Arial, "Helvetica Neue", Helvetica, sans-serif';
            brandCtx.shadowColor = 'rgba(0,0,0,0.35)'; brandCtx.shadowBlur = 7; brandCtx.shadowOffsetY = 5;
            brandCtx.fillStyle = '#0a0a0a';
            brandCtx.fillText('IPU IFLII', brandCanvas.width / 2, brandCanvas.height / 2);
            brandCtx.shadowColor = 'transparent'; brandCtx.shadowBlur = 0; brandCtx.shadowOffsetY = 0;
            brandTexture.needsUpdate = true;
        }

        drawBrandInscription();
        // (the facade wordmark now lives in the pediment instead)
        const brandMaterial = new THREE.MeshBasicMaterial({ map: brandTexture, transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide, depthTest: true });
        const brandPlane = new THREE.Mesh(new THREE.PlaneGeometry(40, 9.6), brandMaterial);
        brandPlane.position.set(0, floorY + wallH - 4.9, 61.12);
        brandPlane.rotation.y = 0;
        brandPlane.visible = false;

        let prevTime = performance.now();

        function createDiagramHallLayout() {
            const columnRadius = 1.05;
            const columnHeight = wallH - TEMPLE_RISE - 0.9;
            const columnMaterial = whiteStoneMat.clone();
            columnMaterial.roughness = 0.78; columnMaterial.metalness = 0.04;

            function addColumn(x, z) {
                const shaft = new THREE.Mesh(makeDoricShaftGeometry(columnRadius, columnRadius * 1.08, columnHeight, 16), columnMaterial);
                shaft.position.set(x, insideY + columnHeight / 2, z);
                shaft.castShadow = true; shaft.receiveShadow = true;
                scene.add(shaft); collisionMeshes.push(shaft);

                const cap = new THREE.Mesh(new THREE.CylinderGeometry(columnRadius * 1.32, columnRadius * 1.32, 0.42, 16), columnMaterial);
                cap.position.set(x, insideY + columnHeight - 0.21, z); cap.castShadow = true; scene.add(cap);

                const base = new THREE.Mesh(new THREE.CylinderGeometry(columnRadius * 1.3, columnRadius * 1.3, 0.42, 16), columnMaterial);
                base.position.set(x, insideY + 0.21, z); base.receiveShadow = true; scene.add(base);
            }

            [-25, -12.5, 12.5, 25].forEach((x) => addColumn(x, -17.0));
            [-4.5, 8.0, 20.5, 33.0, 45.5].forEach((z) => { addColumn(-28.0, z); addColumn(28.0, z); });
        }

        const clouds = [];
        createTimelessSky(); createHorizonAtmosphere(); createClouds(); createShootingStar(); createDiagramHallLayout();

        const animatedScreens = [];
        const LOCAL_MEDIA = [
            ...HOSTED_IMAGE_URLS.map(url => ({ type: 'image', name: url })),
            ...HOSTED_VIDEO_URLS.map(url => ({ type: 'video', name: url }))
        ];
        const localMediaScreens = [];


        // ---- Blue-hour architectural edition ----
        const architecturalReflections = [];
        const reflectionShader = {
            uniforms: {
                color: { value: new THREE.Color(0xffffff) },
                tDiffuse: { value: null }, textureMatrix: { value: new THREE.Matrix4() },
                uTime: { value: 0 }, uWater: { value: 0 }, uStrength: { value: 0.45 },
                uTexel: { value: 1 / (isTouchMode ? 512 : 1024) }
            },
            vertexShader: `
                uniform mat4 textureMatrix;
                varying vec4 vReflection;
                varying vec3 vWorld;
                void main() {
                    vReflection = textureMatrix * vec4(position,1.0);
                    vWorld = (modelMatrix * vec4(position,1.0)).xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
                }`,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform float uTime, uWater, uStrength, uTexel;
                varying vec4 vReflection;
                varying vec3 vWorld;
                void main() {
                    // Both pools share one reflection camera. Discard the central promenade.
                    if (uWater > 0.5 && (abs(vWorld.x) < 32.0 || abs(vWorld.x) > 50.0)) discard;
                    vec2 p = vReflection.xy / vReflection.w;
                    float wave = sin(vWorld.z*2.4 + uTime*0.8) * sin(vWorld.x*1.8-uTime*0.5);
                    p += vec2(wave, sin(vWorld.z*4.7+uTime)) * (0.0015*uWater);
                    vec2 blur = vec2(uTexel*1.5, uTexel*2.8);
                    vec3 reflected = texture2D(tDiffuse,p).rgb * 0.40;
                    reflected += texture2D(tDiffuse,p+vec2(blur.x,0.0)).rgb * 0.15;
                    reflected += texture2D(tDiffuse,p-vec2(blur.x,0.0)).rgb * 0.15;
                    reflected += texture2D(tDiffuse,p+vec2(0.0,blur.y)).rgb * 0.15;
                    reflected += texture2D(tDiffuse,p-vec2(0.0,blur.y)).rgb * 0.15;
                    float facing = abs(normalize(cameraPosition-vWorld).y);
                    float fresnel = pow(1.0-facing, 3.0);
                    float alpha = mix(0.055 + fresnel*uStrength, 0.50+fresnel*0.40, uWater);
                    gl_FragColor = vec4(reflected, alpha);
                    #include <tonemapping_fragment>
                    #include <colorspace_fragment>
                }`
        };
        function architecturalMirror(w,d,x,y,z,water=false) {
            const size = isTouchMode ? 512 : 1024;
            const mirror = new Reflector(new THREE.PlaneGeometry(w,d), {
                textureWidth:size, textureHeight:size, clipBias:0.003,
                multisample:0, shader:reflectionShader
            });
            mirror.rotation.x = -Math.PI/2;
            mirror.position.set(x,y,z);
            mirror.material.transparent = true;
            mirror.material.depthWrite = false;
            mirror.material.uniforms.uWater.value = water ? 1 : 0;
            mirror.renderOrder = 3;
            const capture = mirror.onBeforeRender;
            mirror.onBeforeRender = function(r,s,c) {
                // Never recursively render one planar mirror inside another.
                const now=performance.now();
                // Capture with the current camera matrix every rendered frame: no delayed reflections.
                this.userData.lastCapture=now;
                const visible = architecturalReflections.map(m => m.visible);
                architecturalReflections.forEach(m => m.visible=false);
                try { capture.call(this,r,s,c); }
                finally { architecturalReflections.forEach((m,i) => m.visible=visible[i]); }
            };
            architecturalReflections.push(mirror);
            scene.add(mirror);
            return mirror;
        }

        const hallReflection=architecturalMirror(70,78,0,insideY+.08,20,false);hallReflection.userData.room='hall';
        const galleryReflection=architecturalMirror(82,90,0,insideY+.08,-66,false);galleryReflection.userData.room='gallery';
        // An HDR-like lighting environment gives stone, glass and metallic models real highlights.
        const environmentScene = new THREE.Scene();
        const environmentShell = new THREE.Mesh(new THREE.SphereGeometry(100,32,16), new THREE.ShaderMaterial({
            side:THREE.BackSide,
            vertexShader:`varying vec3 vDirection; void main(){vDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
            fragmentShader:`varying vec3 vDirection; void main(){
                vec3 n=normalize(vDirection);
                vec3 c=mix(vec3(0.11,0.09,0.065),vec3(0.32,0.48,0.78),smoothstep(-0.3,0.8,n.y));
                c+=vec3(1.4,0.9,0.45)*pow(max(0.0,dot(n,normalize(vec3(-0.6,0.18,0.7)))),22.0);
                gl_FragColor=vec4(c,1.0);
            }`
        }));
        environmentScene.add(environmentShell);
        const environmentGenerator = new THREE.PMREMGenerator(renderer);
        const architecturalEnvironment = environmentGenerator.fromScene(environmentScene,0.025);
        scene.environment = architecturalEnvironment.texture;
        environmentShell.geometry.dispose(); environmentShell.material.dispose(); environmentGenerator.dispose();
        [whiteStoneMat,floorMat,groundTileMat,platformTileMat,ceilingMat].forEach(m => {
            m.metalness=0; m.envMapIntensity=0.65; m.needsUpdate=true;
        });
        floorMat.roughness=0.20; groundTileMat.roughness=0.23; platformTileMat.roughness=0.22;
        // Environment highlights replace the expensive full-promenade reflection pass.
        // Interior floor uses the shared physical environment.
        architecturalMirror(100,104,0,floorY+0.39,137,true);

        const bronzeDetail = new THREE.MeshStandardMaterial({color:0x8e7954,metalness:0.78,roughness:0.30});
        const lampDetail = new THREE.MeshStandardMaterial({color:0xffe5b9,emissive:0xffbc69,emissiveIntensity:3.3,roughness:0.22});
        const detailBox = (w,h,d,x,y,z,m=whiteStoneMat) => createBox(w,h,d,x,y,z,m,false,false);

        // Projecting mouldings and small dentils create real self-shadow across the entablature.
        [
            [65.0,0.30,14.8,45.85], [65.6,0.24,15.2,46.1],
            [65.1,0.20,14.9,51.8], [66.1,0.30,15.7,52.10]
        ].forEach(([w,h,d,y]) => detailBox(w,h,d,0,y,55));
        for(let x=-31.7;x<=31.7;x+=1.2) detailBox(0.40,0.34,0.55,x,51.54,62.35);
        frontColumnXs.forEach(x => {
            const capital = new THREE.Mesh(new THREE.CylinderGeometry(1.45,0.93,0.38,48),whiteStoneMat);
            capital.position.set(x,45.64,59.35); capital.castShadow=true; capital.receiveShadow=true;scene.add(capital);
            detailBox(2.85,0.20,2.85,x,45.87,59.35);
        });
        // A coffered vestibule and hall, with recessed warm luminous centres.
        for(let z=-14;z<=52;z+=11) {
            detailBox(58,0.42,0.34,0,45.31,z);
            for(let x=-24;x<=24;x+=8) {
                detailBox(0.28,0.42,10.7,x,45.31,z+5.3);
                detailBox(1.1,0.045,1.1,x+4,45.22,z+4.8,lampDetail);
            }
        }
        // Warm step lights and fine metal nosings follow the existing walkable stairs.
        for(let step=0;step<40;step++){
            const y=COURTYARD_Y+(step+1)*.4,z=109.19-step*1.2;
            const n=detailBox(71.8,.025,.045,0,y+.02,z,bronzeDetail);n.userData.grandApproach=true;
            for(const x of [-34.8,34.8]){const m=detailBox(.25,.08,.3,x,y+.05,z-.22,lampDetail);m.userData.grandApproach=true;}
        }


        // Billowed optical glow is local to each fitting, keeping product media crisp.
        const glowCanvas=document.createElement('canvas');glowCanvas.width=64;glowCanvas.height=64;
        const glowCtx=glowCanvas.getContext('2d');
        const glowGradient=glowCtx.createRadialGradient(32,32,1,32,32,32);
        glowGradient.addColorStop(0,'rgba(255,224,176,0.7)');
        glowGradient.addColorStop(0.15,'rgba(255,193,113,0.20)');
        glowGradient.addColorStop(1,'rgba(255,171,72,0)');
        glowCtx.fillStyle=glowGradient;glowCtx.fillRect(0,0,64,64);
        const glowTexture=new THREE.CanvasTexture(glowCanvas);
        const glowMaterial=new THREE.SpriteMaterial({map:glowTexture,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false});
        function fittingGlow(x,y,z,scale=1.4) {
            const glow=new THREE.Sprite(glowMaterial);glow.position.set(x,y,z);glow.scale.set(scale,scale,1);scene.add(glow);
        }
        frontColumnXs.forEach(x=>fittingGlow(x,insideY+0.30,60.4,2.2));


        // Web edition: a small fixed light budget and cached, low-resolution pool reflections.
        function finishWebScene(){
            const bronze = new THREE.MeshStandardMaterial({color:0x8d6638,metalness:.65,roughness:.4});
            const warm = new THREE.MeshStandardMaterial({color:0xffce8b,emissive:0xff8b2d,emissiveIntensity:2.8});
            // Rear-axis reception, with the freestanding Pegasus behind it.
            desk.visible=false;const oldDeskIndex=collisionMeshes.indexOf(desk);if(oldDeskIndex>=0)collisionMeshes.splice(oldDeskIndex,1);
            const gold = new THREE.MeshStandardMaterial({color:0xc6a153,metalness:.72,roughness:.28});
            scene.userData.webGoldMaterial=gold;
            function roundedShape(w,d,r){const shape=new THREE.Shape();shape.moveTo(-w/2+r,-d/2);shape.lineTo(w/2-r,-d/2);shape.quadraticCurveTo(w/2,-d/2,w/2,-d/2+r);shape.lineTo(w/2,d/2-r);shape.quadraticCurveTo(w/2,d/2,w/2-r,d/2);shape.lineTo(-w/2+r,d/2);shape.quadraticCurveTo(-w/2,d/2,-w/2,d/2-r);shape.lineTo(-w/2,-d/2+r);shape.quadraticCurveTo(-w/2,-d/2,-w/2+r,-d/2);return shape;}
            function counter(w,d,h,y,mat){const mesh=new THREE.Mesh(new THREE.ExtrudeGeometry(roundedShape(w,d,.7),{depth:h,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.05,bevelThickness:.05,curveSegments:12}),mat);mesh.rotation.x=-Math.PI/2;mesh.position.set(0,insideY+y,-5);mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData={isReception:true};scene.add(mesh);interactableModels.push(mesh);return mesh;}
            counter(9.5,3.75,.18,.05,gold);counter(9.2,3.5,1.55,.24,whiteStoneMat);counter(9.7,3.9,.18,1.8,whiteStoneMat);
            createBox(8.7,.055,.06,0,insideY+.30,-3.20,warm,false,false);
            for(let x=-4.1;x<=4.1;x+=.23)createBox(.047,1.15,.045,x,insideY+.95,-3.22,gold,false,false);
            createBox(4.6,.82,.10,0,insideY+1.23,-3.1,whiteStoneMat,false,false);
            const letters=document.createElement('canvas');letters.width=1536;letters.height=256;const lc2=letters.getContext('2d');
            const ink=lc2.createLinearGradient(0,60,0,205);ink.addColorStop(0,'#e6c772');ink.addColorStop(.45,'#b08a36');ink.addColorStop(1,'#8a6326');lc2.fillStyle=ink;lc2.textAlign='center';lc2.textBaseline='middle';lc2.font='500 135px Georgia';if('letterSpacing'in lc2)lc2.letterSpacing='10px';lc2.fillText('RECEPTION',768,138);
            const lt=new THREE.CanvasTexture(letters);lt.colorSpace=THREE.SRGBColorSpace;lt.anisotropy=4;
            const label=new THREE.Mesh(new THREE.PlaneGeometry(4.2,.7),new THREE.MeshBasicMaterial({map:lt,transparent:true,depthWrite:false,toneMapped:false}));label.position.set(0,insideY+1.23,-3.035);scene.add(label);
            const deskLight=new THREE.PointLight(0xffd59c,36,17,2);deskLight.position.set(0,insideY+5,-1);scene.add(deskLight);
            const emblemLight=new THREE.SpotLight(0xffd8a2,110,18,.62,.85,1.4);emblemLight.color.set(0xff8c3a);emblemLight.userData.beatBase=115;emblemLight.position.set(0,insideY+.2,-12.5);emblemLight.target.position.set(0,insideY+6,-15);scene.add(emblemLight,emblemLight.target);
            // A low stone plinth anchors the freestanding statue to the floor.
            createBox(4.6,.3,4.6,0,insideY+.15,-15,whiteStoneMat,true,true);
            const terminal=new THREE.Group();terminal.position.set(2.8,insideY+2.05,-5.1);
            const monitor=new THREE.Mesh(new THREE.BoxGeometry(1.35,.92,.10),gold);monitor.rotation.x=-.22;monitor.position.y=.52;terminal.add(monitor);
            const canvas=document.createElement('canvas');canvas.width=768;canvas.height=480;const c=canvas.getContext('2d');c.fillStyle='#fffcf5';c.fillRect(0,0,768,480);c.fillStyle='#aa8133';c.font='38px Georgia';c.textAlign='center';c.fillText('IPU IFLII',384,115);c.font='26px Arial';c.fillText('EXPLORE THE COLLECTION',384,215);c.fillStyle='#b38a3d';c.fillRect(145,292,478,80);c.fillStyle='#fff';c.font='26px Arial';c.fillText('Search  ·  Sizes  ·  Your bag',384,343);
            const st=new THREE.CanvasTexture(canvas);st.colorSpace=THREE.SRGBColorSpace;
            const screen=new THREE.Mesh(new THREE.PlaneGeometry(1.23,.78),new THREE.MeshBasicMaterial({map:st}));screen.position.set(0,.52,.061);screen.rotation.x=-.22;terminal.add(screen);scene.add(terminal);[screen,monitor].forEach(m=>{m.userData={isReception:true};interactableModels.push(m);});
            // Organic leaf cards, clustered around forked trunks rather than solid polygonal balls.
            const leafCanvas=document.createElement('canvas');leafCanvas.width=256;leafCanvas.height=256;const lc=leafCanvas.getContext('2d');
            let seed=773;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
            lc.strokeStyle='#746c48';lc.lineWidth=4;lc.beginPath();lc.moveTo(125,255);lc.bezierCurveTo(143,158,89,92,135,0);lc.stroke();
            for(let i=0;i<95;i++){const x=25+rand()*205,y=rand()*246;lc.save();lc.translate(x,y);lc.rotate(rand()*6.28);lc.fillStyle=['#415238','#657151','#819077','#344b34','#a1a78c'][Math.floor(rand()*5)];lc.beginPath();lc.ellipse(0,0,3+rand()*3,9+rand()*6,0,0,6.28);lc.fill();lc.restore();}
            const leafTexture=new THREE.CanvasTexture(leafCanvas);leafTexture.colorSpace=THREE.SRGBColorSpace;
            const leafMat=new THREE.MeshStandardMaterial({map:leafTexture,alphaTest:.4,side:THREE.DoubleSide,roughness:1,color:0xbac3a2});
            const leaves=new THREE.InstancedMesh(new THREE.PlaneGeometry(1.8,2),leafMat,1152);const obj=new THREE.Object3D();let index=0;
            const bark=new THREE.MeshStandardMaterial({color:0x746a52,roughness:1});
            function branch(a,b,r){const delta=b.clone().sub(a);const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r*.45,r,delta.length(),7),bark);mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());scene.add(mesh);}
            for(const side of [-1,1])for(let t=0;t<6;t++){
                const x=side*(53+(t%2)*2),z=73+t*19,y=floorY;
                branch(new THREE.Vector3(x,y,z),new THREE.Vector3(x+.35,y+4.4,z),.20);
                for(let b=0;b<4;b++){const angle=b*Math.PI/2+.4;branch(new THREE.Vector3(x+.2,y+2.7,z),new THREE.Vector3(x+Math.cos(angle)*1.6,y+4.6,z+Math.sin(angle)*1.6),.10);}
                for(let i=0;i<96;i++){const a=rand()*6.28,r=Math.sqrt(rand())*2.45;obj.position.set(x+Math.cos(a)*r,y+3.9+rand()*2.1,z+Math.sin(a)*r);obj.rotation.set(rand()*1.6,rand()*6.28,rand()*1.5);obj.scale.setScalar(.65+rand()*.55);obj.updateMatrix();leaves.setMatrixAt(index++,obj.matrix);}
                createBox(5.8,.35,5.8,x,y+.17,z,whiteStoneMat,false,false);fittingGlow(x,y+.50,z+1.7,1.1);
            }
            scene.add(leaves);
            // Bake visual light washes into simple emissive gradients; only a few lights shade the scene.
            const washCanvas=document.createElement('canvas');washCanvas.width=128;washCanvas.height=256;const wc=washCanvas.getContext('2d');
            wc.save();wc.translate(64,252);wc.scale(1,3);const wg=wc.createRadialGradient(0,0,2,0,0,58);wg.addColorStop(0,'rgba(255,170,85,.25)');wg.addColorStop(.35,'rgba(255,162,70,.12)');wg.addColorStop(1,'rgba(255,154,62,0)');wc.fillStyle=wg;wc.fillRect(-64,-85,128,86);wc.restore();
            const washTexture=new THREE.CanvasTexture(washCanvas);const washMat=new THREE.MeshBasicMaterial({map:washTexture,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false});scene.userData.columnWash=washMat;
            frontColumnXs.forEach(x=>{const wash=new THREE.Mesh(new THREE.PlaneGeometry(3.2,10),washMat);wash.position.set(x,insideY+5,60.65);scene.add(wash);});
            // Garden pavilions and seating: static, batched marble with restrained gold details.
            for(const side of [-1,1]){
                const x=side*64,z=104;
                createBox(16,.45,18,x,floorY+.22,z,whiteStoneMat,false,false);
                for(const dx of [-6,6])for(const dz of [-7,7]){
                    const column=new THREE.Mesh(new THREE.CylinderGeometry(.55,.65,8.4,20),whiteStoneMat);column.position.set(x+dx,floorY+4.65,z+dz);column.castShadow=true;column.receiveShadow=true;scene.add(column);
                    createBox(1.6,.25,1.6,x+dx,floorY+.57,z+dz,whiteStoneMat,false,false);
                    createBox(1.6,.25,1.6,x+dx,floorY+8.95,z+dz,whiteStoneMat,false,false);
                }
                createBox(15.1,.7,16.3,x,floorY+9.4,z,whiteStoneMat,false,false);
                createBox(15.6,.20,16.8,x,floorY+9.83,z,whiteStoneMat,false,false);
                const triangle=new THREE.Shape();triangle.moveTo(-7.7,0);triangle.lineTo(7.7,0);triangle.lineTo(0,2.5);triangle.closePath();
                const pediment=new THREE.Mesh(new THREE.ExtrudeGeometry(triangle,{depth:.6,bevelEnabled:false}),whiteStoneMat);pediment.position.set(x,floorY+9.93,z+7.9);pediment.castShadow=true;scene.add(pediment);
                createBox(11,.08,.09,x,floorY+9.04,z+7.4,warm,false,false);
                for(const at of [95,133,167]){
                    // Narrow seats frame the central path without blocking the main axis.
                    createBox(2.3,.32,6.5,side*26,floorY+1.1,at,whiteStoneMat,true,false);
                    for(const dz of [-2.4,2.4])createBox(1.4,.85,.35,side*26,floorY+.43,at+dz,gold,false,false);
                    const points=[new THREE.Vector2(.44,0),new THREE.Vector2(.64,.12),new THREE.Vector2(.47,.35),new THREE.Vector2(.62,1.1),new THREE.Vector2(.77,1.5),new THREE.Vector2(.72,1.64)];
                    const urn=new THREE.Mesh(new THREE.LatheGeometry(points,20),whiteStoneMat);urn.position.set(side*27,floorY,at+4.5);urn.castShadow=true;scene.add(urn);
                }
                // Low perimeter walls give the water gardens a finished architectural edge.
                createBox(.55,.85,106,side*51.2,floorY+.42,137,whiteStoneMat,false,false);
                createBox(.75,.12,106,side*51.2,floorY+.91,137,whiteStoneMat,false,false);
                for(const at of [88,118,148,181]){
                    createBox(1.25,1.4,1.25,side*51.2,floorY+.7,at,whiteStoneMat,false,false);
                    createBox(1.4,.12,1.4,side*51.2,floorY+1.46,at,gold,false,false);
                    fittingGlow(side*51.2,floorY+1.6,at,1.4);
                }
            }

        }
        finishWebScene();
        scene.updateMatrixWorld(true);
        for(const object of [...scene.children]){
            if(object.userData.preserveElevation || object.userData.grandApproach || object===ground || object===groundFogSheet || object.isLight)continue;
            const bounds=new THREE.Box3().setFromObject(object);
            if(!bounds.isEmpty() && bounds.min.z>65 && bounds.max.y<65 && bounds.max.z<220)object.position.y-=floorY-COURTYARD_Y;
        }
        const fountainGroup=new THREE.Group();fountainGroup.name='Courtyard fountain';fountainGroup.position.set(0,COURTYARD_Y,128);scene.add(fountainGroup);
        const fountainStone=whiteStoneMat;
        const fountainWater=new THREE.MeshPhysicalMaterial({color:0x80c8df,roughness:.23,metalness:.15,transparent:true,opacity:.8});
        function fountainMesh(g,m,y){const o=new THREE.Mesh(g,m);o.position.y=y;fountainGroup.add(o);return o;}
        fountainMesh(new THREE.CylinderGeometry(7.7,8.2,.5,64),fountainStone,.25);
        const rim=fountainMesh(new THREE.TorusGeometry(7.3,.42,10,64),fountainStone,.75);rim.rotation.x=Math.PI/2;
        fountainMesh(new THREE.CylinderGeometry(6.95,6.95,.08,64),fountainWater,.67);
        fountainMesh(new THREE.CylinderGeometry(.6,1.2,3.5,24),fountainStone,2.05);
        fountainMesh(new THREE.CylinderGeometry(3,1.2,.5,48),fountainStone,3.85);
        fountainMesh(new THREE.CylinderGeometry(2.75,2.75,.07,48),fountainWater,4.13);
        fountainMesh(new THREE.CylinderGeometry(.3,.55,2,24),fountainStone,4.95);
        fountainMesh(new THREE.CylinderGeometry(1.5,.6,.4,40),fountainStone,6.05);
        const dropPositions=new Float32Array(360*3);
        const dropGeometry=new THREE.BufferGeometry();dropGeometry.setAttribute('position',new THREE.BufferAttribute(dropPositions,3));
        const drops=new THREE.Points(dropGeometry,new THREE.PointsMaterial({color:0xc4f3ff,size:.09,transparent:true,opacity:.8,depthWrite:false}));fountainGroup.add(drops);
        const basinCollision=new THREE.Mesh(new THREE.CylinderGeometry(7.7,7.7,1.2,24),fountainStone);basinCollision.visible=false;basinCollision.position.y=.6;fountainGroup.add(basinCollision);collisionMeshes.push(basinCollision);
        function updateGrandFountain(t){
            for(let i=0;i<360;i++){const angle=(i%24)/24*Math.PI*2,phase=((i/24)*.067+t*.48)%1;const radius=.25+phase*5.8;dropPositions[i*3]=Math.cos(angle)*radius;dropPositions[i*3+1]=6.3+3.5*phase-9*phase*phase;dropPositions[i*3+2]=Math.sin(angle)*radius;}
            dropGeometry.attributes.position.needsUpdate=true;
        }

        addStatueUplight(-6.5,52,6.2);addStatueUplight(6.5,52,6.2);
        // Batch stationary architecture by material and location; keep original collision meshes intact.
        function batchTempleArchitecture(){
            scene.updateMatrixWorld(true);
            const materials=new Set([whiteStoneMat,floorMat,groundTileMat,platformTileMat,ceilingMat,bronzeDetail,lampDetail,scene.userData.webGoldMaterial]);
            const buckets=new Map();
            for(const mesh of scene.children){
                if(!mesh.isMesh||mesh.isInstancedMesh||!mesh.visible||!materials.has(mesh.material)||interactableModels.includes(mesh)||mesh.userData.isReception)continue;
                const key=mesh.material.uuid+':'+Math.floor(mesh.position.x/24)+':'+Math.floor(mesh.position.z/24)+':'+mesh.castShadow;
                if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(mesh);
            }
            for(const meshes of buckets.values()){
                if(meshes.length<3)continue;
                const parts=meshes.map(m=>{const g=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();return g.applyMatrix4(m.matrixWorld);});
                const geometry=mergeGeometries(parts,false);parts.forEach(g=>g.dispose());
                if(!geometry)continue;
                const combined=new THREE.Mesh(geometry,meshes[0].material);combined.castShadow=meshes[0].castShadow;combined.receiveShadow=true;combined.matrixAutoUpdate=false;scene.add(combined);
                meshes.forEach(m=>{m.visible=false;m.matrixAutoUpdate=false;});
            }
        }
        batchTempleArchitecture();

        function mediaURL(name) { return name; }

        function drawCover(ctx, source, cw, ch) {
            const sw = source.videoWidth || source.naturalWidth || source.width;
            const sh = source.videoHeight || source.naturalHeight || source.height;
            if (!sw || !sh) return false;
            const scale = Math.max(cw / sw, ch / sh);
            const dw = sw * scale, dh = sh * scale;
            ctx.fillStyle = '#050505'; ctx.fillRect(0, 0, cw, ch);
            ctx.drawImage(source, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
            return true;
        }

        const youtubePlayers = [];
        let youtubeApiReady = false;

        function createWallScreen(x, z, yaw, contentDrawer) {
            const screenW = 7.8, screenH = 4.4;
            const y = floorY + wallH - 4.2;
            const group = new THREE.Group();

            const mount = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.0, 0.6), new THREE.MeshStandardMaterial({ color: 0x22262c, roughness: 0.4, metalness: 0.6 }));
            mount.position.set(0, screenH * 0.28, -0.42); group.add(mount);

            const frame = new THREE.Mesh(new THREE.BoxGeometry(screenW + 0.5, screenH + 0.5, 0.3), new THREE.MeshStandardMaterial({ color: 0x0c0f13, roughness: 0.5 }));
            group.add(frame);

            const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 288;
            const ctx = canvas.getContext('2d');
            const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace;
            const screen = new THREE.Mesh(new THREE.PlaneGeometry(screenW, screenH), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
            screen.position.z = 0.17; group.add(screen);

            if (contentDrawer) {
                contentDrawer(ctx, canvas, tex, 0);
                animatedScreens.push({ update: (t) => contentDrawer(ctx, canvas, tex, t) });
            }

            group.position.set(x, y - 0.2, z); group.rotation.y = yaw; group.rotateX(0.24);
            scene.add(group);
            return {};
        }

        window.onYouTubeIframeAPIReady = function () {
            youtubeApiReady = true;
        };

        rebuildCollisionBoxes();

        let webFrames=0,webFrameStart=performance.now(),slowWindows=0;
        scene.userData.qualityTier=isTouchMode?"mobile":"balanced";
        let graphicsChoice='low';try{graphicsChoice=localStorage.getItem('ipu-graphics-v2')||'low';}catch{}
        function applyGraphics(choice){
            graphicsChoice=['auto','low','balanced','high','ultra'].includes(choice)?choice:'low';
            const level=graphicsChoice==='auto'?(isTouchMode?'low':'balanced'):graphicsChoice;
            scene.userData.qualityTier=level==='low'?'lite':level;
            renderPixelRatio=level==='ultra'?Math.min(devicePixelRatio*1.5,2):Math.min(devicePixelRatio,level==='high'?1.5:level==='low'?.8:1);
            renderer.setPixelRatio(renderPixelRatio);
            const size=level==='ultra'?4096:level==='high'?2048:level==='low'?512:1024;
            if(dirLight.shadow.mapSize.x!==size){dirLight.shadow.mapSize.set(size,size);dirLight.shadow.map?.dispose();dirLight.shadow.map=null;}
            dirLight.shadow.needsUpdate=true;dirLight.shadow.normalBias=.035;dirLight.shadow.bias=-.00015;
            hallReflection.material.uniforms.uStrength.value=level==='ultra'?.34:level==='high'?.26:.14;
            galleryReflection.material.uniforms.uStrength.value=level==='ultra'?.30:level==='high'?.24:.12;
            architecturalReflections.forEach(m=>{m.visible=level!=="low";const resolution=level==='ultra'?1536:level==='high'?1024:512;m.getRenderTarget().setSize(resolution,resolution);m.material.uniforms.uTexel.value=1/resolution;});
            scene.userData.storeLighting?.setQuality(level);
            renderer.shadowMap.needsUpdate=true;
            try{localStorage.setItem('ipu-graphics-v2',graphicsChoice);}catch{}
        }
        applyGraphics(graphicsChoice);
        function renderGraphics(){storeContent.innerHTML=`<p class="store-kicker">THE TEMPLE / GRAPHICS</p><h1 tabindex="-1">Light, detail & reflections.</h1><p class="store-note">Choose the balance that feels best on your device. Changes apply immediately and are remembered.</p><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:16px;margin:30px 0">${[['auto','Automatic','Adjusts to your device and lowers quality if performance drops.'],['low','Performance','Softer resolution, simple shadows and environment reflections.'],['balanced','Balanced','Sharper shadows and subtle reflections across the marble.'],['high','Cinematic','Steady store lighting, wall shadows and live marble reflections.'],['ultra','Super Cinematic','Highest shadow detail, sharper reflections and supersampled rendering. Best for a strong desktop GPU.']].map(([id,title,description])=>`<button class="store-secondary" data-graphics="${id}" aria-pressed="${graphicsChoice===id}" style="padding:24px;text-align:left;${graphicsChoice===id?'border:2px solid #a68957;background:#eee7db':''}"><strong style="display:block;font-size:20px;margin-bottom:12px">${title}</strong><span>${description}</span></button>`).join('')}</div><p class="store-note">Current mode: ${scene.userData.qualityTier}. Performance is the default. Increase quality when you want cinematic effects. Cinema controls disappear after 3.5 seconds; click the screen to show them again.</p>`;storeContent.querySelectorAll('[data-graphics]').forEach(button=>button.onclick=()=>{applyGraphics(button.dataset.graphics);renderGraphics();});}

        function animate() {
            requestAnimationFrame(animate);
            const time = performance.now();
            if(document.hidden){prevTime=time;return;}
            updateDaylight(time);
            beatController.update(Math.min((time-prevTime)/1000,.05));
            if(document.hidden || isPaused){if(!document.hidden){atelier?.update(Math.min((time-prevTime)/1000,.05));renderer.render(scene,camera);}prevTime=time;webFrames=0;webFrameStart=time;return;}
            const frameDelta = Math.min((time - prevTime) / 1000, 1 / 30);

            if (flickeringStars) {
                flickeringStars.material.uniforms.uTime.value = time * 0.001;
                flickeringStars.rotation.y = time * 0.000003;
            }

            // Rotate the actual Sky.png sphere, not merely a background value.
            if (skyDome) {
                skyDome.position.copy(camera.position);
                // Delta-based rotation keeps moving during gameplay and while paused.
                if (!layeredSkyActive) skyRotationAngle = (skyRotationAngle + frameDelta * 0.0034) % (Math.PI * 2);
                else skyRotationAngle = 0;
                skyDome.rotation.y = skyRotationAngle;
            }
            if (skyLayerLeft) {
                skyLayerLeft.position.copy(camera.position);
                skyLayerLeft.rotation.y -= frameDelta * 0.055;
            }
            if (skyLayerRight) {
                skyLayerRight.position.copy(camera.position);
                skyLayerRight.rotation.y += frameDelta * 0.045;
            }
            if (horizonAtmosphere) {
                horizonAtmosphere.position.x = camera.position.x;
                horizonAtmosphere.position.z = camera.position.z;
                horizonAtmosphere.material.uniforms.uStrength.value = 0.10 + Math.sin(time * 0.00012) * 0.01;
            }
            if (groundFogSheet) {
                groundFogSheet.position.x = camera.position.x;
                groundFogSheet.position.z = camera.position.z;
            }
            atelier?.update(frameDelta);
            updateGrandFountain(time*.001);
            const insideTempleNow=isCameraInsideTemple();
            if(insideTempleNow){
                windAudio.volume=0;poolAudio.volume=0;
                if(!windAudio.paused)windAudio.pause();
                if(!poolAudio.paused)poolAudio.pause();
                for(const a of activeStarSounds)a.pause();activeStarSounds.clear();
            } else if(isAudioInit) {
                if(windAudio.paused)windAudio.play().catch(()=>{});
                if(poolAudio.paused)poolAudio.play().catch(()=>{});
            }
            
            updateShootingStar(time);

            // One continuous staggered animation controls the whole surface.
            // Height and cyan-to-white gradient are calculated together.
            waterMat.uniforms.uTime.value = time * 0.001;

            if (shootingStarSfxGain && audioCtx) {
                const outdoorVolume = isCameraInsideTemple() ? 0 : 1;
                shootingStarSfxGain.gain.setTargetAtTime(outdoorVolume, audioCtx.currentTime, 0.025);
            }

            const isGameActive = !isPaused;

            if (isGameActive) {
                const delta = frameDelta;

                // Advance animation clips retained from animated garment GLBs.
                for (const slot of shirtDisplaySlots) {
                    if (slot.mixer) slot.mixer.update(delta);
                }

                if (controlsHud) {
                    const isInsideForHud = camera.position.z < 57.5 && camera.position.z > -22 && camera.position.x > -20 && camera.position.x < 20;
                    const idle = (time - lastMoveInputTime) > 3000;
                    controlsHud.classList.toggle('hidden', isPaused || isCatalogOpen || isReceptionOpen || (isInsideForHud && idle));
                }

                if (musicAudio) {
                    const insideShop = insideTempleNow;
                    const entranceDistance = Math.hypot(camera.position.x, Math.max(0, camera.position.z - 58));
                    const outdoorReach = 18;
                    const proximity = insideShop ? 1 : Math.max(0, 1 - entranceDistance / outdoorReach);
                    const smoothProximity = proximity * proximity * (3 - 2 * proximity);

                    // Distance to the closest point of either long pool. Water
                    // is audible nearby, then disappears smoothly beyond 24 m.
                    const poolZDistance = Math.max(0, 85 - camera.position.z, camera.position.z - 189);
                    const leftPoolDistance = Math.hypot(Math.max(0, Math.abs(camera.position.x + 41) - 9), poolZDistance);
                    const rightPoolDistance = Math.hypot(Math.max(0, Math.abs(camera.position.x - 41) - 9), poolZDistance);
                    const nearestPoolDistance = Math.min(leftPoolDistance, rightPoolDistance,Math.max(0,Math.hypot(camera.position.x,camera.position.z-128)-7));
                    const poolProximity = THREE.MathUtils.smoothstep(24 - Math.min(24, nearestPoolDistance), 0, 24);

                    const inCinema=camera.position.z<-111.5 && Math.abs(camera.position.x)<43;
                    const cinemaBlend=THREE.MathUtils.smoothstep(-camera.position.z,106,119);
                    const targetMusic = .78*smoothProximity*(1-cinemaBlend);
                    const targetPool = 0.24 * poolProximity * (1 - smoothProximity);
                    const targetWind = 0.18 * (1 - smoothProximity) * (1 - poolProximity * 0.72);

                    if(!insideTempleNow){
                        windAudio.volume += (targetWind - windAudio.volume) * 0.04;
                        poolAudio.volume += (targetPool - poolAudio.volume) * 0.04;
                    }
                    musicAudio.volume = THREE.MathUtils.damp(musicAudio.volume,targetMusic,.75,delta);
                    if(camera.position.z<-119 && musicAudio.volume<.004 && !musicAudio.paused)musicAudio.pause();

                    if (time - lastMusicClockSync > 60000) {
                        lastMusicClockSync = time;
                        if(camera.position.z>=-111.5)syncMusicToClock();
                    }
                }

                if (marqueeTexture) marqueeTexture.offset.x += 0.002 * (delta * 60);

                velocity.x -= velocity.x * 8.0 * delta;
                velocity.z -= velocity.z * 8.0 * delta;

                direction.z = Number(moveForward) - Number(moveBackward) - joyState.left.y;
                direction.x = Number(moveRight) - Number(moveLeft) + joyState.left.x;

                if (direction.length() > 1.0) direction.normalize();

                const speed = 150.0;
                if (direction.z !== 0) velocity.z -= direction.z * speed * delta;
                if (direction.x !== 0) velocity.x -= direction.x * speed * delta;

                const playerCollider = new THREE.Box3();
                const getPlayerCollider = (pos) => {
                    playerCollider.setFromCenterAndSize(
                        new THREE.Vector3(pos.x, pos.y - 0.95, pos.z),
                        new THREE.Vector3(1.0, 2.6, 1.0)
                    );
                    return playerCollider;
                };

                const collidesAtPlayerPosition = () => {
                    const box = getPlayerCollider(camera.position);
                    const x=camera.position.x,z=camera.position.z;
                    // Full footprints remain solid even when the visible rim is below eye level.
                    if(Math.abs(x)<5.35 && z>-7.5 && z<-2.5)return true;
                    if(z>84.3 && z<189.7 && (Math.abs(x-41)<9.7 || Math.abs(x+41)<9.7))return true;
                    if(Math.hypot(x,z-128)<8.2)return true;
                    for(const door of scene.userData.cinemaDoorBoxes||[])if(box.intersectsBox(door))return true;
                    for (const obstacle of collidableBoxes) {
                        if (box.intersectsBox(obstacle)) return true;
                    }
                    return false;
                };

                const moveSolid = (distance, moveFunction) => {
                    if (Math.abs(distance) < 1e-7) return false;
                    const maxStep = 0.10;
                    const steps = Math.max(1, Math.ceil(Math.abs(distance) / maxStep));
                    const stepDistance = distance / steps;
                    let blocked = false;

                    for (let i = 0; i < steps; i++) {
                        const safePosition = camera.position.clone();
                        moveFunction(stepDistance);
                        if (collidesAtPlayerPosition()) {
                            camera.position.copy(safePosition);
                            blocked = true;
                            break;
                        }
                    }
                    return blocked;
                };

                if (moveSolid(-velocity.x * delta, distance => controls.moveRight(distance))) {
                    velocity.x = 0;
                }
                if (moveSolid(-velocity.z * delta, distance => controls.moveForward(distance))) {
                    velocity.z = 0;
                }

                for (const s of animatedScreens) s.update(time);

                for (const cloud of clouds) {
                    cloud.position.x += cloud.userData.driftSpeed * delta;
                    if (cloud.position.x - camera.position.x > 950) { cloud.position.x = camera.position.x - 950; }
                }

                const targetGroundY = groundHeightAt(camera.position.x, camera.position.z);
                camera.position.y += ((targetGroundY + 2.9) - camera.position.y) * 0.2;

                const travelHalfWidth=camera.position.z<-20?40.8:camera.position.z<61.2?34.8:60;
                if (camera.position.x > travelHalfWidth) camera.position.x = travelHalfWidth;
                if (camera.position.x < -travelHalfWidth) camera.position.x = -travelHalfWidth;
                if (camera.position.z > 187) camera.position.z = 187;
                if (camera.position.z < -149) camera.position.z = -149;
            }

            // Keep showcase tests playing behind the ESC menu while movement
            // and the rest of the scene remain paused.
            updateShowcaseLights(time, frameDelta);

            prevTime = time;
            architecturalReflections.forEach(m => {
                m.material.uniforms.uTime.value = time * 0.001;
                // Avoid exterior reflection passes while browsing inside, and vice versa.
                m.visible = scene.userData.qualityTier!=="lite";
            });
            renderer.render(scene, camera);
            cssRenderer.render(cssScene, camera);
            webFrames++;
            if(webFrames>=120){
                const fps=webFrames*1000/(time-webFrameStart);
                renderer.domElement.dataset.fps=fps.toFixed(1);
                slowWindows=fps<28?slowWindows+1:0;
                if(['auto','low'].includes(graphicsChoice) && slowWindows>=2 && renderPixelRatio>.65){renderPixelRatio=Math.max(.65,renderPixelRatio-.15);renderer.setPixelRatio(renderPixelRatio);scene.userData.qualityTier="lite";slowWindows=0;}
                renderer.domElement.dataset.quality=scene.userData.qualityTier;
                renderer.domElement.dataset.drawCalls=String(renderer.info.render.calls);
                renderer.domElement.dataset.triangles=String(renderer.info.render.triangles);
                webFrames=0;webFrameStart=time;
            }
        }

const StoreCore = (() => {
    const validID = value => /^\d{5,20}$/.test(String(value || ''));
    const normal = value => String(value || '').trim().toLowerCase();
    function variantFor(product, choices) {
        if (!product.live) return null;
        const selected = product.options.map(option => {
            const key = Object.keys(choices).find(key => normal(key) === normal(option.name));
            return choices[key];
        });
        return product.variants.find(v => v.options.every((value,i) => normal(value) === normal(selected[i]))) || null;
    }
    function lineKey(key, choices) {
        return key + ':' + Object.entries(choices).sort(([a],[b]) => a.localeCompare(b)).map(([k,v]) => `${k}=${v}`).join('|');
    }
    function cleanBag(value, knownKeys) {
        if (!Array.isArray(value)) return [];
        return value.filter(x => x && knownKeys.includes(x.productKey) && x.choices && typeof x.choices === 'object')
            .slice(0,50).map(x => ({productKey:x.productKey,choices:Object.fromEntries(Object.entries(x.choices).filter(([k,v]) => typeof v === 'string' && k.length<80 && v.length<120)),quantity:Math.max(1,Math.min(20,Math.floor(Number(x.quantity)||1))),price:Number.isFinite(x.price)&&x.price>=0?x.price:0,variantID:validID(x.variantID)?String(x.variantID):null}));
    }
    function cartURL(origin, lines) {
        if (!lines.length || lines.some(x => !validID(x.variantID) || !Number.isInteger(x.quantity) || x.quantity<1 || x.quantity>20)) throw new Error('Choose valid product options before checkout.');
        const base = new URL(origin);
        if (base.protocol !== 'https:') throw new Error('Checkout requires a secure store URL.');
        return base.origin + '/cart/' + lines.map(x => `${x.variantID}:${x.quantity}`).join(',');
    }
    return {variantFor,lineKey,cleanBag,cartURL};
})();

        // ---- One catalogue for the walk-through, reception and 2D shop ----
        const storeProducts = currentCatalog;
        for(const [file,data] of Object.entries(PRODUCTS_BY_MODEL)){data.price='';const product=storeProducts.find(p=>p.url===data.url);if(product)product.file=file;}
        function openTempleProduct(data){
            const linked=storeProducts.find(p=>p.url===data.url);
            const key=data.id || data.key || data.title;
            const p={...linked,...data,key,images:linked?.images?.length?linked.images:(data.images||[data.image].filter(Boolean)),description:data.description||'',options:[],variants:[]};
            storeProductMap.set(key,p);openPauseMenu();openStoreProduct(key);
        }
        const storeProductMap = new Map(storeProducts.map(p=>[p.key,p]));
        let storeView='browse', storeQuery='', storeSort='featured', activeStoreProduct=null;
        let chosenOptions={}, productViewer=null, productLoadSequence=0;
        let storeReturnFocus=null, toastTimer=null;
        let bag=[];
        try {bag=StoreCore.cleanBag(JSON.parse(localStorage.getItem('ipu-bag-v2')||'[]'),storeProducts.map(p=>p.key));} catch {}
        const storeContent=document.getElementById('store-content');
        const escHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
        const money=cents=>new Intl.NumberFormat('en',{style:'currency',currency:'EUR'}).format((cents||0)/100);
        const safeImage=url=>{try {const u=new URL(url,document.baseURI);return ['https:','http:','blob:','data:'].includes(u.protocol)?u.href:'';}catch{return '';}};
        const imageFor=p=>p.thumbnail || (!p.imageFailed?p.images[0]:'') || '';
        const statusText=p=>p.live?'Live price':p.price?'Guide price':'Price in store';

        function saveBag() {try {localStorage.setItem('ipu-bag-v2',JSON.stringify(bag));}catch{} updateBagCount();}
        function updateBagCount(){document.querySelectorAll('[data-bag-count]').forEach(el=>el.textContent=bag.reduce((n,x)=>n+x.quantity,0));}
        function storeToast(message){const el=document.getElementById('shop-toast');el.textContent=message;clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.textContent='',3000);}

        async function refreshProduct(p,force=false) {
            if(!p.handle) throw new Error('This piece is not linked to a purchasable store product yet.');
            if(p.live && !force && Date.now()-(p.checkedAt||0)<180000) return p;
            const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),9000);
            try {
                const response=await fetch(`${STORE_URL}/products/${encodeURIComponent(p.handle)}.js`,{signal:controller.signal,mode:'cors',cache:'no-store'});
                if(!response.ok) throw new Error(`Store unavailable (${response.status}).`);
                const live=await response.json();
                if(!Array.isArray(live.variants)||!live.variants.length||!Array.isArray(live.options)) throw new Error('The store returned no product options.');
                p.options=live.options.map((option,i)=>({name:typeof option==='string'?option:option.name,values:typeof option==='string'?[...new Set(live.variants.map(v=>v.options?.[i]??v['option'+(i+1)]).filter(Boolean))]:option.values}));
                p.variants=live.variants.filter(v=>/^\d+$/.test(String(v.id))).map(v=>({id:String(v.id),price:Number(v.price),available:v.available===true,options:v.options||p.options.map((_,i)=>v['option'+(i+1)]),image:v.featured_image?.src||null}));
                p.price=Number(live.price)||p.variants[0]?.price||0;
                p.images=(live.images||[]).map(i=>safeImage(typeof i==='string'?i:i.src)).filter(Boolean);
                p.imageFailed=false;p.live=true;p.checkedAt=Date.now();
                return p;
            } finally {clearTimeout(timer);}
        }

        function showStore(view='browse',focus=true) {
            disposeProductViewer(); productLoadSequence++; storeView=view;
            document.querySelector('.store-shell').scrollTop=0;
            document.querySelectorAll('[data-store-view]').forEach(el=>el.setAttribute('aria-current',String(el.dataset.storeView===view)));
            if(view==='graphics') renderGraphics(); else if(view==='bag') renderStoreBrowse(); else if(view==='reception') renderStoreReception(); else if(view==='lookbook') renderLookbook(); else renderStoreBrowse();
            if(focus) storeContent.querySelector('h1')?.focus({preventScroll:true});
        }
        function storeCard(p) {
            const src=imageFor(p);
            return `<button class="product-card" type="button" data-product="${escHTML(p.key)}" aria-label="View ${escHTML(p.title)}">
                <span class="card-image">${src?`<img src="${escHTML(src)}" alt="${escHTML(p.title)}" loading="lazy" decoding="async" data-product-image="${escHTML(p.key)}">`:`<span class="card-fallback">IPU IFLII</span>`}<span class="card-tag">${p.thumbnail?'3D garment':'THE COLLECTION'}</span></span>
                <h3>${escHTML(p.title)}</h3><p>Discover the piece</p></button>`;
        }
        function filteredProducts(){let items=storeProducts.filter(p=>(p.title+' '+p.key).toLowerCase().includes(storeQuery.toLowerCase()));if(storeSort==='price-low')items.sort((a,b)=>a.price-b.price);if(storeSort==='price-high')items.sort((a,b)=>b.price-a.price);return items;}
        function updateStoreGrid(){const items=filteredProducts();const grid=document.getElementById('store-grid');if(grid)grid.innerHTML=items.length?items.map(storeCard).join(''):'<div class="store-empty">No pieces match your search. Try another name.</div>';const count=document.getElementById('store-result-count');if(count)count.textContent=`${items.length} ${items.length===1?'piece':'pieces'}`;}
        function renderStoreBrowse(){
            storeContent.innerHTML=`<div class="store-intro"><div><p class="store-kicker">IPU IFLII · The temple collection</p><h1 tabindex="-1">Find your timeless piece.</h1><p>Explore the garments, choose your fit, make them yours.</p></div><label class="store-search"><span class="store-kicker">Search the collection</span><input id="store-search" type="search" placeholder="Pegasus, Zig Zag, classic…" value="${escHTML(storeQuery)}" autocomplete="off"></label></div><div class="store-tools"><span id="store-result-count"></span><select id="store-sort" aria-label="Sort products"><option value="featured">Featured</option></select></div><div class="store-grid" id="store-grid"></div><p class="store-note">Explore a piece, then visit IPUIFLII.com to buy.</p>`;
            document.getElementById('store-sort').value=storeSort;updateStoreGrid();
            document.getElementById('store-search').addEventListener('input',e=>{storeQuery=e.target.value;updateStoreGrid();});
            document.getElementById('store-sort').addEventListener('change',e=>{storeSort=e.target.value;updateStoreGrid();});
        }
        function optionsHTML(p){return p.options.map(option=>`<fieldset class="option-group"><legend>${escHTML(option.name)}</legend><div class="option-row">${option.values.map(value=>{
            const candidate={...chosenOptions,[option.name]:value};
            const compatible=p.variants.filter(v=>p.options.every((o,i)=>!candidate[o.name]||candidate[o.name]===v.options[i]));
            const disabled=p.live&&compatible.length>0&&compatible.every(v=>!v.available);
            return `<button type="button" data-option="${escHTML(option.name)}" data-value="${escHTML(value)}" aria-pressed="${chosenOptions[option.name]===value}" class="${chosenOptions[option.name]===value?'selected':''}" ${disabled?'disabled':''}>${escHTML(value)}</button>`;
        }).join('')}</div></fieldset>`).join('');}
        function renderProductOptions(){
            const p=activeStoreProduct;if(!p)return;
            document.getElementById('product-options').innerHTML=optionsHTML(p);
            const variant=StoreCore.variantFor(p,chosenOptions);
            document.getElementById('detail-price').textContent=money(variant?.price??p.price);
            document.getElementById('detail-stock').textContent=p.live?(variant?(variant.available?'Available':'Sold out'):'Choose your options'):'Live availability is temporarily unavailable. Your selections can be saved in the bag.';
            const add=document.getElementById('store-add');add.disabled=Boolean(p.live&&variant&&!variant.available)||!p.handle;
            if(!p.handle)document.getElementById('detail-stock').textContent='This piece is not available to order from the temple yet.';
        }
        async function openStoreProduct(key) {
            const p=storeProductMap.get(key);if(!p)return;
            document.querySelector('.store-shell').scrollTop=0;
            disposeProductViewer();storeView='product';activeStoreProduct=p;++productLoadSequence;
            storeContent.innerHTML=`<button class="store-link" data-store-view="browse">← Back to collection</button><div class="store-detail"><div><div class="product-media" id="product-media"></div><div class="media-actions"><button type="button" id="show-product-photo" class="selected">Images</button>${p.file||p.model||p.previewScene?'<button type="button" id="show-product-3d">View in 3D</button>':''}</div><div class="media-thumbs" id="product-thumbnails"></div><p class="store-note" id="product-media-note"></p></div><div class="product-info"><p class="store-kicker">IPU IFLII · Timeless</p><h1 tabindex="-1">${escHTML(p.title)}</h1><a class="store-primary" id="store-buy" href="https://ipuiflii.com/">Buy on IPUIFLII.com ↗</a><p class="store-note">Choose your size and colour in the store.</p>${p.description?`<details open><summary>About this piece</summary>${p.description}</details>`:''}</div></div>`;
            showProductImage(p);renderProductThumbnails(p);
            document.getElementById('show-product-photo').onclick=()=>showProductImage(p);
            const viewButton=document.getElementById('show-product-3d');if(viewButton)viewButton.onclick=()=>startProductViewer(p);
            storeContent.querySelector('h1').focus({preventScroll:true});
        }
        function renderProductThumbnails(p){const el=document.getElementById('product-thumbnails');if(!el)return;el.innerHTML=p.images.map((src,i)=>`<button type="button" data-gallery-index="${i}" aria-label="Product image ${i+1}"><img src="${escHTML(src)}" alt="${escHTML(p.title)} — view ${i+1}" loading="lazy"></button>`).join('');}
        function showProductImage(p,index=0){
            disposeProductViewer();++productLoadSequence;const el=document.getElementById('product-media');if(!el)return;
            const src=!p.imageFailed&&p.images[index]?p.images[index]:p.thumbnail;
            el.innerHTML=src?`<img src="${escHTML(src)}" alt="${escHTML(p.title)}" id="detail-image">`:'<p class="store-note">Preparing your garment preview…</p>';
            const img=el.querySelector('img');if(img)img.onerror=()=>{if(p.thumbnail&&img.src!==p.thumbnail){img.src=p.thumbnail;p.imageFailed=true;}else{el.innerHTML='<p class="store-note">Select View in 3D to explore this piece.</p>';}};
            document.getElementById('show-product-photo')?.classList.add('selected');document.getElementById('show-product-3d')?.classList.remove('selected');
            const note=document.getElementById('product-media-note');if(note)note.textContent=p.imageFailed||!p.images.length?'Preview of your actual 3D garment.':'Browse every available product photo, including on-body photos when supplied by the store.';
        }
        function addActiveProductToBag(){
            const p=activeStoreProduct;const error=document.getElementById('detail-error');
            if(!p.handle){error.textContent='This product needs its store link before it can be purchased.';return;}
            const missing=p.options.find(o=>!chosenOptions[o.name]);if(missing){error.textContent=`Please select ${missing.name.toLowerCase()}.`;return;}
            const variant=StoreCore.variantFor(p,chosenOptions);if(p.live&&(!variant||!variant.available)){error.textContent='That option combination is unavailable. Please choose another.';return;}
            const key=StoreCore.lineKey(p.key,chosenOptions);const existing=bag.find(x=>StoreCore.lineKey(x.productKey,x.choices)===key);
            if(existing)existing.quantity=Math.min(20,existing.quantity+1);else bag.push({productKey:p.key,choices:{...chosenOptions},quantity:1,price:variant?.price??p.price,variantID:variant?.id||null});
            saveBag();error.textContent='';storeToast('Added to your bag');
        }
        function renderBag(){
            const total=bag.reduce((sum,x)=>sum+x.price*x.quantity,0);
            storeContent.innerHTML=`<p class="store-kicker">Your selection</p><h1 tabindex="-1">The bag.</h1>${bag.length?`<div class="bag-layout"><div>${bag.map((line,i)=>{const p=storeProductMap.get(line.productKey);return `<article class="bag-item">${imageFor(p)?`<img src="${escHTML(imageFor(p))}" alt="${escHTML(p.title)}">`:'<div></div>'}<div><h3><button class="store-link" data-edit-line="${i}">${escHTML(p.title)}</button></h3><p>${Object.entries(line.choices).map(([k,v])=>`${escHTML(k)}: ${escHTML(v)}`).join(' · ')}</p><div class="quantity"><button data-quantity="${i}" data-delta="-1" aria-label="Decrease quantity">−</button><span>${line.quantity}</span><button data-quantity="${i}" data-delta="1" aria-label="Increase quantity" ${line.quantity>=20?'disabled':''}>+</button></div><button class="store-link" data-remove-line="${i}">Remove</button></div><span>${money(line.price*line.quantity)}</span></article>`;}).join('')}</div><aside class="bag-summary"><h2>Order summary</h2><p class="store-note">${bag.reduce((n,x)=>n+x.quantity,0)} items</p><div class="bag-total"><span>Subtotal</span><span>${money(total)}</span></div><p class="store-note">Shipping and taxes calculated at checkout. Prices and availability are checked before continuing.</p><button class="store-primary" id="store-checkout">Continue to secure checkout ↗</button><p class="store-error" id="checkout-error" role="status"></p><button class="store-link" data-store-view="browse">Continue exploring</button></aside></div>`:'<div class="store-empty"><h2>Your bag is waiting.</h2><p>Choose a piece from the collection and select your fit.</p><button class="store-return" data-store-view="browse">Explore the collection</button></div>'}`;
            document.getElementById('store-checkout')?.addEventListener('click',checkoutBag);
        }
        async function checkoutBag(){
            const button=document.getElementById('store-checkout'), error=document.getElementById('checkout-error');if(!bag.length)return;
            const checkoutSequence=productLoadSequence,bagSnapshot=JSON.stringify(bag);
            button.disabled=true;button.textContent='Checking your selections…';error.textContent='';
            try{
                await Promise.all([...new Set(bag.map(x=>x.productKey))].map(key=>refreshProduct(storeProductMap.get(key),true)));
                if(storeView!=='bag'||checkoutSequence!==productLoadSequence||bagSnapshot!==JSON.stringify(bag))return;
                let changed=false;
                for(const line of bag){const p=storeProductMap.get(line.productKey),v=StoreCore.variantFor(p,line.choices);if(!v||!v.available)throw new Error(`${p.title}: please reopen this piece and choose an available size and colour.`);if(v.price!==line.price)changed=true;line.price=v.price;line.variantID=v.id;}
                saveBag();
                if(changed){renderBag();document.getElementById('checkout-error').textContent='The store updated a price. Review your refreshed subtotal, then continue.';return;}
                window.location.assign(StoreCore.cartURL(STORE_URL,bag));
            }catch(e){error.textContent=/available size/.test(e.message)?e.message:'We couldn’t confirm availability with the store. Your bag is saved. Please try again when the store is available.';}
            finally{if(button.isConnected){button.disabled=false;button.textContent='Continue to secure checkout ↗';}}
        }
        function renderStoreReception(){
            storeContent.innerHTML=`<p class="store-kicker">At your service</p><h1 tabindex="-1">Welcome to reception.</h1><div class="reception-layout"><section class="reception-welcome"><h2>Find something that feels like you.</h2><p>Explore the collection, inspect a garment in 3D, or return to the marble hall. Buy your favourite piece on IPUIFLII.com.</p><label class="store-search"><input id="reception-search" type="search" placeholder="Search garments…" aria-label="Search from reception"></label><button class="store-primary" id="reception-find" style="margin-top:12px">Find a piece</button><button class="store-secondary" id="visit-reception-3d">Visit reception in 3D ↗</button></section><section class="reception-faq"><details open><summary>Choosing your size</summary><p>Open a piece to choose its size and colour. The available options come from its store listing. Exact measurements are linked from each product’s size guide.</p></details><details><summary>How purchasing works</summary><p>Open a product preview and select Buy to visit IPUIFLII.com and complete your order.</p></details><details><summary>Product &amp; on-body imagery</summary><p>Every product gallery includes the photographs available from the store. You can also rotate and zoom the actual 3D garment.</p></details><details><summary>Music in the temple</summary><p>Your Timeless music and the fountain and wind sounds play after you enter. You can mute or resume the music below.</p></details><details><summary>Contact the store</summary><p>For custom pieces, sizing assistance or an existing order, visit <a href="${STORE_URL}" target="_blank" rel="noopener">IPU IFLII ↗</a>.</p></details></section></div>`;
            const search=()=>{storeQuery=document.getElementById('reception-search').value;showStore('browse');};document.getElementById('reception-find').onclick=search;document.getElementById('reception-search').onkeydown=e=>{if(e.key==='Enter')search();};
        }
        const lookNames=['Midnight blue','Emerald','Everyday green','Champagne','In motion','Up close'];
        function renderLookbook(selected=null){
            if(selected!==null){
                storeContent.innerHTML=`<button class="store-link" data-store-view="lookbook">← Back to lookbook</button><p class="store-kicker">IPU IFLII · Campaign</p><h1 tabindex="-1">${lookNames[selected]}</h1><div style="display:flex;justify-content:center;background:#e8e7df"><img src="WebAssets/Lookbook/${selected+1}.jpg" alt="IPU IFLII ${lookNames[selected]} worn look" style="max-width:100%;max-height:75vh;object-fit:contain"></div><div class="media-actions"><button data-look="${(selected+5)%6}">← Previous look</button><button data-look="${(selected+1)%6}">Next look →</button></div><p class="store-note">Campaign styling. Explore the collection for pieces currently available to order.</p>`;return;
            }
            storeContent.innerHTML=`<p class="store-kicker">IPU IFLII · Campaign imagery</p><h1 tabindex="-1">The lookbook.</h1><p class="store-note">Colour, texture and the way it’s worn.</p><div class="store-grid lookbook-grid">${lookNames.map((name,i)=>`<button class="product-card" data-look="${i}"><span class="card-image"><img src="WebAssets/Lookbook/${i+1}.jpg" alt="IPU IFLII ${name} worn look" loading="lazy" style="object-fit:cover"></span><h3>${name}</h3><p>View look ↗</p></button>`).join('')}</div>`;
        }
        document.getElementById('pause-menu').addEventListener('click',e=>{
            const el=e.target.closest('button');if(!el)return;
            if(el.id==='visit-reception-3d'){camera.position.set(12,insideY+3.4,2);camera.lookAt(0,insideY+2.8,-10);closePauseMenu();return;}
            if(el.dataset.look!==undefined){storeView='lookbook';renderLookbook(Number(el.dataset.look));document.querySelector('.store-shell').scrollTop=0;return;}
            if(el.dataset.storeView){showStore(el.dataset.storeView);return;}
            if(el.dataset.product){openStoreProduct(el.dataset.product);return;}
            if(el.dataset.option){chosenOptions[el.dataset.option]=el.dataset.value;renderProductOptions();return;}
            if(el.dataset.galleryIndex!==undefined){showProductImage(activeStoreProduct,Number(el.dataset.galleryIndex));return;}
            if(el.dataset.removeLine!==undefined){bag.splice(Number(el.dataset.removeLine),1);saveBag();renderBag();return;}
            if(el.dataset.quantity!==undefined){const i=Number(el.dataset.quantity);bag[i].quantity+=Number(el.dataset.delta);if(bag[i].quantity<1)bag.splice(i,1);saveBag();renderBag();return;}
            if(el.dataset.editLine!==undefined){const line=bag[Number(el.dataset.editLine)];openStoreProduct(line.productKey,line.choices);}
        });
        storeContent.addEventListener('error',e=>{const img=e.target;if(img.matches?.('[data-product-image]')){const p=storeProductMap.get(img.dataset.productImage);p.imageFailed=true;if(p.thumbnail&&img.src!==p.thumbnail)img.src=p.thumbnail;else img.style.visibility='hidden';}},true);
        document.getElementById('pause-menu').addEventListener('keydown',e=>{
            if(e.key!=='Tab')return;const items=[...document.querySelectorAll('#pause-menu button:not(:disabled),#pause-menu input,#pause-menu select,#pause-menu a[href],#pause-menu summary')].filter(x=>x.getClientRects().length);
            if(!items.length)return;const first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
        });
        updateBagCount();showStore('browse',false);
        const shopOpen=document.getElementById('web-shop-open');
        ['pointerdown','mousedown','touchstart'].forEach(type=>shopOpen.addEventListener(type,e=>e.stopPropagation()));
        shopOpen.addEventListener('click',e=>{e.stopPropagation();openPauseMenu();});

        function productScene(gltf){
            const result=new THREE.Scene();result.background=new THREE.Color(0xffffff);result.environment=scene.environment;
            const model=cloneSkeleton(gltf.scene);const box=new THREE.Box3().setFromObject(model);const size=box.getSize(new THREE.Vector3());const center=box.getCenter(new THREE.Vector3());
            const wrapper=new THREE.Group();model.position.sub(center);wrapper.add(model);wrapper.scale.setScalar(3.1/Math.max(size.x,size.y,size.z));result.add(wrapper);
            result.add(new THREE.HemisphereLight(0xffffff,0x888573,2.0));const key=new THREE.DirectionalLight(0xffefdb,3);key.position.set(3,5,5);result.add(key);const fill=new THREE.DirectionalLight(0xc0d5ed,1.6);fill.position.set(-4,1,2);result.add(fill);
            return {scene:result,model,wrapper};
        }
        const thumbnailQueue=[];let thumbnailBusy=false;
        function queueModelThumbnail(key,gltf){if(!storeProductMap.has(key))return;thumbnailQueue.push({key,gltf});if(!thumbnailBusy){thumbnailBusy=true;setTimeout(renderNextThumbnail,120);}}
        function renderNextThumbnail(){
            const item=thumbnailQueue.shift();if(!item){thumbnailBusy=false;return;}
            try{
                const view=productScene(item.gltf),cam=new THREE.PerspectiveCamera(36,0.8,0.1,50);cam.position.set(0,0.1,6.2);cam.lookAt(0,0,0);
                const w=640,h=800,target=new THREE.WebGLRenderTarget(w,h,{type:THREE.UnsignedByteType});target.texture.colorSpace=THREE.SRGBColorSpace;
                const old=renderer.getRenderTarget();renderer.setRenderTarget(target);renderer.render(view.scene,cam);
                const pixels=new Uint8Array(w*h*4);renderer.readRenderTargetPixels(target,0,0,w,h,pixels);renderer.setRenderTarget(old);target.dispose();
                const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d'),data=ctx.createImageData(w,h);
                for(let y=0;y<h;y++)data.data.set(pixels.subarray((h-y-1)*w*4,(h-y)*w*4),y*w*4);ctx.putImageData(data,0,0);
                const p=storeProductMap.get(item.key);if(p){p.thumbnail=canvas.toDataURL('image/webp',0.86);if(storeView==='browse'&&isPaused)updateStoreGrid();if(activeStoreProduct===p&&storeView==='product'&&!productViewer)showProductImage(p);}
            }catch(error){console.warn('Garment thumbnail unavailable',item.key,error);renderer.setRenderTarget(null);}
            setTimeout(renderNextThumbnail,180);
        }
        async function startProductViewer(p){
            disposeProductViewer();const sequence=++productLoadSequence;const container=document.getElementById('product-media');container.innerHTML='<p class="store-note">Loading your 3D garment…</p>';
            let gltf=p.previewScene?{scene:p.previewScene,animations:[]}:webModelCache.get(p.file||p.key);
            try{if(!gltf){gltf=await createGLTFLoader().loadAsync(assetUrl(p.model || `WebAssets/Designs/${p.file}`));webModelCache.set(p.file||p.key,gltf);}}
            catch{if(sequence===productLoadSequence)container.innerHTML='<p class="store-note">The model could not load. Check that WebAssets is beside this HTML.</p>';return;}
            if(sequence!==productLoadSequence||!isPaused||storeView!=='product')return;
            const view=productScene(gltf);const r=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});r.setPixelRatio(Math.min(devicePixelRatio,1.5));r.toneMapping=THREE.ACESFilmicToneMapping;r.outputColorSpace=THREE.SRGBColorSpace;
            const camera3d=new THREE.PerspectiveCamera(36,1,0.1,50);camera3d.position.set(0,0.1,6.2);
            container.replaceChildren(r.domElement);r.domElement.className='viewer-canvas';r.domElement.setAttribute('aria-label','3D garment. Drag to rotate; scroll or pinch to zoom.');
            const orbit=new OrbitControls(camera3d,r.domElement);orbit.enablePan=false;orbit.minDistance=3;orbit.maxDistance=10;orbit.enableDamping=true;orbit.autoRotate=false;
            const resize=()=>{if(!container.isConnected)return;const w=container.clientWidth,h=container.clientHeight;r.setSize(w,h,false);camera3d.aspect=w/h;camera3d.updateProjectionMatrix();};const observer=new ResizeObserver(resize);observer.observe(container);resize();
            const mixer=gltf.animations?.length?new THREE.AnimationMixer(view.model):null;gltf.animations?.forEach(clip=>mixer?.clipAction(clip).play());
            productViewer={renderer:r,orbit,observer,frame:0};let last=performance.now();
            const draw=now=>{if(!productViewer||productViewer.renderer!==r)return;productViewer.frame=requestAnimationFrame(draw);if(now-last<33)return;const delta=Math.min((now-last)/1000,.1);last=now;orbit.update();mixer?.update(delta);r.render(view.scene,camera3d);};productViewer.frame=requestAnimationFrame(draw);
            document.getElementById('show-product-photo').classList.remove('selected');document.getElementById('show-product-3d').classList.add('selected');document.getElementById('product-media-note').textContent='Drag to rotate · Scroll or pinch to zoom';
        }
        function disposeProductViewer(){if(productViewer){cancelAnimationFrame(productViewer.frame);productViewer.observer.disconnect();productViewer.orbit.dispose();productViewer.renderer.dispose();productViewer.renderer.forceContextLoss();productViewer=null;}}


        const beatController=createBeatController(scene,()=>audioCtx,musicAudio);
        let atelier=null;
        const atelierReady=new Promise(resolve=>setTimeout(resolve,1600)).then(()=>createAtelier({scene,camera,renderer,insideY,createBox,collisionMeshes,interactableModels,
          registerProduct(data){const p=storeProducts.find(p=>p.url===data.url);if(p&&!p.previewScene)p.previewScene=data.previewScene;},openProduct:openTempleProduct,loader:createGLTFLoader,rebuildCollisions:rebuildCollisionBoxes,beatController,musicAudio,
          isScenePaused:()=>isPaused,cinemaCursor(active){scene.userData.cinemaCursor=active;},
          setModal(open){isCatalogOpen=open;isPaused=open;stopPlayerMomentum();hideMovePrompt();if(open)controls.unlock();},
          travel(position,target){initAudio();if(audioCtx?.state==='suspended')audioCtx.resume();isPaused=false;isCatalogOpen=false;isReceptionOpen=false;stopPlayerMomentum();pauseMenu?.classList.remove('visible');if(blocker)blocker.style.display='none';hideMovePrompt();camera.position.fromArray(position);camera.lookAt(...target);document.body.classList.add('game-active');if(!isTouchMode)safeLockControls();}
        })).then(value=>{atelier=value;return value;}).catch(error=>{console.error('After Hours could not load',error);const notice=document.createElement('div');notice.className='atelier-ui';notice.style.cssText='position:fixed;right:20px;top:90px;z-index:90;background:#151515;color:white;padding:16px';notice.textContent='After Hours could not load. Refresh to try again.';document.body.append(notice);});
        // Inspection hooks for local QA; no checkout or account actions.
        window.templeInspection={beat:()=>beatController.stats(),music:musicAudio,ambience:{wind:windAudio,pool:poolAudio},groundHeightAt,ready:atelierReady,stats:()=>({...atelier?.stats(),calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,position:camera.position.toArray()}),visit:dest=>atelier?.visit(dest),read:i=>atelier?.openBook(i),close:()=>atelier?.close(),scene,camera,renderer};

        // Show the entrance immediately. The heavier rear rooms, statues and
        // contact shadows finish in the background while the visitor can move.
        scene.userData.storeLighting=createStoreLighting(scene,renderer,insideY);
        scene.userData.storeLighting.setQuality(scene.userData.qualityTier);
        scene.userData.architectureBatch=batchStaticArchitecture(scene,interactableModels);
        document.documentElement.dataset.renderReady='true';prevTime=performance.now();animate();
        requestAnimationFrame(()=>requestAnimationFrame(hideLoadingScreen));
        Promise.allSettled([atelierReady,statuesReady]).then(()=>{
            scene.userData.contactShadows=addSoftContacts(scene,insideY,COURTYARD_Y,shirtDisplaySlots);
            renderer.shadowMap.needsUpdate=true;
            document.documentElement.dataset.fullExperienceReady='true';
        });

        window.addEventListener('resize', () => {
            const aspect = window.innerWidth / Math.max(1, window.innerHeight);
            camera.aspect = aspect;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            cssRenderer.setSize(window.innerWidth, window.innerHeight);
        });

        async function autoLoadAssets() {
            const mediaStatus = document.getElementById('media-status');
            checkReadyToEnter();
            if (musicStatusText) musicStatusText.innerText = `168 Timeless tracks queued.`;
            if (mediaStatus) mediaStatus.innerText = 'Preparing the marble galleries and lighting…';
        }

        autoLoadAssets();
    
