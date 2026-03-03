/**
 * PartyOnce 3D Designer
 * Three.js based event planning and design system
 */

class PartyOnce3DDesigner {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        this.objects = []; // Store all placed objects
        this.selectedObject = null;
        this.gridHelper = null;
        this.groundPlane = null;
        
        this.currentVenue = {
            type: 'indoor_hall',
            width: 20,
            depth: 15,
            height: 6
        };
        
        this.themeColor = '#ff6b6b';
        this.apiBaseUrl = 'http://localhost:8000/api';
        
        this.objectPrices = {
            round_table: 50,
            rect_table: 60,
            chair: 10,
            sofa: 200,
            chandelier: 300,
            spotlight: 80,
            led_strip: 40,
            fairy_lights: 25,
            flower_centerpiece: 80,
            flower_arch: 500,
            potted_plant: 60,
            flower_wall: 800,
            stage: 2000,
            backdrop: 600,
            screen: 1500,
            podium: 150
        };
        
        this.init();
    }
    
    init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLights();
        this.setupControls();
        this.setupEventListeners();
        this.createVenue();
        this.animate();
        this.updateBudget();
        
        console.log('🎉 PartyOnce 3D Designer initialized');
    }
    
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a1a);
        this.scene.fog = new THREE.Fog(0x0a0a1a, 10, 100);
    }
    
    setupCamera() {
        const aspect = this.getCanvasAspect();
        this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
        this.camera.position.set(15, 12, 15);
        this.camera.lookAt(0, 0, 0);
    }
    
    getCanvasAspect() {
        const canvas = document.getElementById('three-canvas');
        const parent = canvas.parentElement;
        return parent.clientWidth / parent.clientHeight;
    }
    
    setupRenderer() {
        const canvas = document.getElementById('three-canvas');
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            antialias: true,
            alpha: true
        });
        
        const parent = canvas.parentElement;
        this.renderer.setSize(parent.clientWidth, parent.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
    }
    
    setupLights() {
        // Ambient light
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(this.ambientLight);
        
        // Directional light (sun/main light)
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        this.directionalLight.position.set(10, 20, 10);
        this.directionalLight.castShadow = true;
        this.directionalLight.shadow.camera.near = 0.1;
        this.directionalLight.shadow.camera.far = 50;
        this.directionalLight.shadow.camera.left = -20;
        this.directionalLight.shadow.camera.right = 20;
        this.directionalLight.shadow.camera.top = 20;
        this.directionalLight.shadow.camera.bottom = -20;
        this.directionalLight.shadow.mapSize.width = 2048;
        this.directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(this.directionalLight);
        
        // Hemisphere light for natural feel
        this.hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.3);
        this.scene.add(this.hemisphereLight);
    }
    
    setupControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 50;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.05; // Prevent going below ground
        this.controls.target.set(0, 0, 0);
    }
    
    createVenue() {
        // Clear existing venue
        if (this.gridHelper) {
            this.scene.remove(this.gridHelper);
        }
        if (this.groundPlane) {
            this.scene.remove(this.groundPlane);
        }
        
        const { width, depth, type } = this.currentVenue;
        
        // Create ground plane
        const planeGeometry = new THREE.PlaneGeometry(width, depth);
        const planeMaterial = new THREE.MeshStandardMaterial({ 
            color: this.getVenueGroundColor(type),
            roughness: 0.8,
            metalness: 0.1
        });
        this.groundPlane = new THREE.Mesh(planeGeometry, planeMaterial);
        this.groundPlane.rotation.x = -Math.PI / 2;
        this.groundPlane.receiveShadow = true;
        this.groundPlane.userData = { isGround: true };
        this.scene.add(this.groundPlane);
        
        // Create grid helper
        this.gridHelper = new THREE.GridHelper(Math.max(width, depth), Math.max(width, depth), 0x444444, 0x2a2a4a);
        this.gridHelper.position.y = 0.01;
        this.scene.add(this.gridHelper);
        
        // Create venue walls based on type
        this.createVenueWalls(type, width, depth);
        
        // Update venue info display
        this.updateVenueInfo();
    }
    
    getVenueGroundColor(type) {
        const colors = {
            indoor_hall: 0x8B7355,
            outdoor_garden: 0x4a7c59,
            beach: 0xe6d5a7,
            rooftop: 0x666666,
            warehouse: 0x4a4a4a
        };
        return colors[type] || 0x8B7355;
    }
    
    createVenueWalls(type, width, depth) {
        // Remove existing walls
        if (this.walls) {
            this.walls.forEach(wall => this.scene.remove(wall));
        }
        this.walls = [];
        
        if (type === 'outdoor_garden' || type === 'beach') {
            // Outdoor venues don't have walls
            return;
        }
        
        const height = this.currentVenue.height;
        const wallThickness = 0.2;
        const wallMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xcccccc,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        
        // Create 4 walls
        const wallConfigs = [
            { w: width, h: height, d: wallThickness, x: 0, y: height/2, z: -depth/2 }, // Back
            { w: width, h: height, d: wallThickness, x: 0, y: height/2, z: depth/2 },  // Front
            { w: wallThickness, h: height, d: depth, x: -width/2, y: height/2, z: 0 }, // Left
            { w: wallThickness, h: height, d: depth, x: width/2, y: height/2, z: 0 }   // Right
        ];
        
        wallConfigs.forEach(config => {
            const geometry = new THREE.BoxGeometry(config.w, config.h, config.d);
            const wall = new THREE.Mesh(geometry, wallMaterial);
            wall.position.set(config.x, config.y, config.z);
            wall.userData = { isWall: true };
            this.walls.push(wall);
            this.scene.add(wall);
        });
    }
    
    updateVenueInfo() {
        const { width, depth, height } = this.currentVenue;
        const capacity = Math.floor((width * depth) / 1.5);
        
        document.getElementById('venueSize').textContent = `${width}m × ${depth}m`;
        document.getElementById('venueCapacity').textContent = `${capacity}人`;
        document.getElementById('venueHeight').textContent = `${height}m`;
    }
    
    setupEventListeners() {
        const canvas = document.getElementById('three-canvas');
        
        // Mouse events for object selection
        canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        
        // Drag and drop from sidebar
        const itemCards = document.querySelectorAll('.item-card');
        itemCards.forEach(card => {
            card.addEventListener('dragstart', this.onDragStart.bind(this));
        });
        
        canvas.addEventListener('dragover', (e) => e.preventDefault());
        canvas.addEventListener('drop', this.onDrop.bind(this));
        
        // Window resize
        window.addEventListener('resize', this.onWindowResize.bind(this));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', this.onKeyDown.bind(this));
    }
    
    onDragStart(event) {
        const type = event.target.dataset.type;
        const category = event.target.dataset.category;
        event.dataTransfer.setData('objectType', type);
        event.dataTransfer.setData('objectCategory', category);
        event.target.classList.add('dragging');
    }
    
    onDrop(event) {
        event.preventDefault();
        
        const type = event.dataTransfer.getData('objectType');
        const category = event.dataTransfer.getData('objectCategory');
        
        // Remove dragging class from all cards
        document.querySelectorAll('.item-card').forEach(card => {
            card.classList.remove('dragging');
        });
        
        // Calculate drop position
        const rect = this.renderer.domElement.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        this.mouse.set(x, y);
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        const intersects = this.raycaster.intersectObject(this.groundPlane);
        
        if (intersects.length > 0) {
            const point = intersects[0].point;
            this.addObject(type, category, point);
        }
    }
    
    addObject(type, category, position) {
        const objectGroup = new THREE.Group();
        objectGroup.userData = { 
            type: type, 
            category: category,
            id: Date.now() + Math.random(),
            selectable: true
        };
        
        switch(type) {
            case 'round_table':
                this.createRoundTable(objectGroup);
                break;
            case 'rect_table':
                this.createRectTable(objectGroup);
                break;
            case 'chair':
                this.createChair(objectGroup);
                break;
            case 'sofa':
                this.createSofa(objectGroup);
                break;
            case 'chandelier':
                this.createChandelier(objectGroup);
                break;
            case 'spotlight':
                this.createSpotlight(objectGroup);
                break;
            case 'led_strip':
                this.createLEDStrip(objectGroup);
                break;
            case 'fairy_lights':
                this.createFairyLights(objectGroup);
                break;
            case 'flower_centerpiece':
                this.createFlowerCenterpiece(objectGroup);
                break;
            case 'flower_arch':
                this.createFlowerArch(objectGroup);
                break;
            case 'potted_plant':
                this.createPottedPlant(objectGroup);
                break;
            case 'flower_wall':
                this.createFlowerWall(objectGroup);
                break;
            case 'stage':
                this.createStage(objectGroup);
                break;
            case 'backdrop':
                this.createBackdrop(objectGroup);
                break;
            case 'screen':
                this.createScreen(objectGroup);
                break;
            case 'podium':
                this.createPodium(objectGroup);
                break;
        }
        
        objectGroup.position.copy(position);
        objectGroup.position.y = 0;
        
        // Add selection highlight box
        const box = new THREE.Box3().setFromObject(objectGroup);
        const size = new THREE.Vector3();
        box.getSize(size);
        
        const highlightGeometry = new THREE.BoxGeometry(size.x + 0.2, size.y + 0.2, size.z + 0.2);
        const highlightMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff6b6b, 
            wireframe: true,
            visible: false
        });
        const highlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
        highlight.position.y = size.y / 2;
        highlight.userData = { isHighlight: true };
        objectGroup.add(highlight);
        
        this.scene.add(objectGroup);
        this.objects.push(objectGroup);
        
        this.updateObjectCount();
        this.updateBudget();
        
        // Select the newly added object
        this.selectObject(objectGroup);
        
        this.showToast(`已添加: ${this.getObjectName(type)}`, 'success');
    }
    
    // Object creation methods
    createRoundTable(group) {
        // Table top
        const topGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.05, 32);
        const topMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8B4513,
            roughness: 0.3
        });
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.y = 0.75;
        top.castShadow = true;
        top.receiveShadow = true;
        group.add(top);
        
        // Table leg
        const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.75, 16);
        const legMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.y = 0.375;
        leg.castShadow = true;
        group.add(leg);
        
        // Base
        const baseGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.05, 16);
        const base = new THREE.Mesh(baseGeometry, legMaterial);
        base.position.y = 0.025;
        base.castShadow = true;
        group.add(base);
    }
    
    createRectTable(group) {
        // Table top
        const topGeometry = new THREE.BoxGeometry(1.8, 0.05, 0.9);
        const topMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8B4513,
            roughness: 0.3
        });
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.y = 0.75;
        top.castShadow = true;
        top.receiveShadow = true;
        group.add(top);
        
        // Legs
        const legGeometry = new THREE.BoxGeometry(0.08, 0.75, 0.08);
        const legMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
        
        const positions = [
            [-0.8, 0.375, -0.35],
            [0.8, 0.375, -0.35],
            [-0.8, 0.375, 0.35],
            [0.8, 0.375, 0.35]
        ];
        
        positions.forEach(pos => {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(...pos);
            leg.castShadow = true;
            group.add(leg);
        });
    }
    
    createChair(group) {
        // Seat
        const seatGeometry = new THREE.BoxGeometry(0.5, 0.05, 0.5);
        const material = new THREE.MeshStandardMaterial({ 
            color: this.hexToInt(this.themeColor)
        });
        const seat = new THREE.Mesh(seatGeometry, material);
        seat.position.y = 0.45;
        seat.castShadow = true;
        group.add(seat);
        
        // Back
        const backGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.05);
        const back = new THREE.Mesh(backGeometry, material);
        back.position.set(0, 0.7, -0.225);
        back.castShadow = true;
        group.add(back);
        
        // Legs
        const legGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.45, 8);
        const legMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
        
        const positions = [
            [-0.2, 0.225, -0.2],
            [0.2, 0.225, -0.2],
            [-0.2, 0.225, 0.2],
            [0.2, 0.225, 0.2]
        ];
        
        positions.forEach(pos => {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(...pos);
            leg.castShadow = true;
            group.add(leg);
        });
    }
    
    createSofa(group) {
        const material = new THREE.MeshStandardMaterial({ 
            color: this.hexToInt(this.themeColor),
            roughness: 0.8
        });
        
        // Base
        const baseGeometry = new THREE.BoxGeometry(2, 0.4, 0.8);
        const base = new THREE.Mesh(baseGeometry, material);
        base.position.y = 0.2;
        base.castShadow = true;
        group.add(base);
        
        // Back
        const backGeometry = new THREE.BoxGeometry(2, 0.6, 0.15);
        const back = new THREE.Mesh(backGeometry, material);
        back.position.set(0, 0.7, -0.325);
        back.castShadow = true;
        group.add(back);
        
        // Armrests
        const armGeometry = new THREE.BoxGeometry(0.15, 0.5, 0.8);
        const leftArm = new THREE.Mesh(armGeometry, material);
        leftArm.position.set(-0.925, 0.65, 0);
        leftArm.castShadow = true;
        group.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeometry, material);
        rightArm.position.set(0.925, 0.65, 0);
        rightArm.castShadow = true;
        group.add(rightArm);
    }
    
    createChandelier(group) {
        // Ceiling mount
        const mountGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.2, 16);
        const mountMaterial = new THREE.MeshStandardMaterial({ color: 0xFFD700 });
        const mount = new THREE.Mesh(mountGeometry, mountMaterial);
        mount.position.y = this.currentVenue.height - 0.1;
        group.add(mount);
        
        // Chain
        const chainGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1, 8);
        const chain = new THREE.Mesh(chainGeometry, mountMaterial);
        chain.position.y = this.currentVenue.height - 0.7;
        group.add(chain);
        
        // Main body
        const bodyGeometry = new THREE.CylinderGeometry(0.6, 0.4, 0.5, 8);
        const body = new THREE.Mesh(bodyGeometry, mountMaterial);
        body.position.y = this.currentVenue.height - 1.4;
        group.add(body);
        
        // Crystals
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const crystalGeometry = new THREE.ConeGeometry(0.05, 0.3, 8);
            const crystalMaterial = new THREE.MeshStandardMaterial({ 
                color: 0xffffff,
                transparent: true,
                opacity: 0.7
            });
            const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
            crystal.position.set(
                Math.cos(angle) * 0.5,
                this.currentVenue.height - 1.8,
                Math.sin(angle) * 0.5
            );
            group.add(crystal);
        }
        
        // Point light
        const light = new THREE.PointLight(0xffaa00, 0.8, 10);
        light.position.y = this.currentVenue.height - 1.5;
        light.castShadow = true;
        group.add(light);
    }
    
    createSpotlight(group) {
        // Housing
        const housingGeometry = new THREE.ConeGeometry(0.15, 0.3, 16, 1, true);
        const housingMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const housing = new THREE.Mesh(housingGeometry, housingMaterial);
        housing.position.y = this.currentVenue.height - 0.15;
        housing.rotation.x = Math.PI;
        group.add(housing);
        
        // Light beam effect
        const beamGeometry = new THREE.ConeGeometry(0.5, 3, 32, 1, true);
        const beamMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffffaa,
            transparent: true,
            opacity: 0.1,
            side: THREE.DoubleSide
        });
        const beam = new THREE.Mesh(beamGeometry, beamMaterial);
        beam.position.y = this.currentVenue.height - 1.8;
        group.add(beam);
        
        // Spot light
        const spotLight = new THREE.SpotLight(0xffffff, 1);
        spotLight.position.y = this.currentVenue.height - 0.3;
        spotLight.target.position.set(0, 0, 0);
        spotLight.angle = Math.PI / 6;
        spotLight.penumbra = 0.3;
        spotLight.castShadow = true;
        group.add(spotLight);
        group.add(spotLight.target);
    }
    
    createLEDStrip(group) {
        const stripGeometry = new THREE.BoxGeometry(2, 0.05, 0.1);
        const stripMaterial = new THREE.MeshStandardMaterial({ 
            color: this.hexToInt(this.themeColor),
            emissive: this.hexToInt(this.themeColor),
            emissiveIntensity: 0.5
        });
        const strip = new THREE.Mesh(stripGeometry, stripMaterial);
        strip.position.y = 0.1;
        group.add(strip);
        
        // Glow effect
        const light = new THREE.PointLight(this.hexToInt(this.themeColor), 0.5, 3);
        light.position.y = 0.3;
        group.add(light);
    }
    
    createFairyLights(group) {
        const points = [];
        const colors = [];
        const color = new THREE.Color(this.hexToInt(this.themeColor));
        
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const radius = 1 + Math.sin(i * 0.5) * 0.3;
            points.push(
                Math.cos(angle) * radius,
                2.5 + Math.sin(i * 0.3) * 0.5,
                Math.sin(angle) * radius
            );
            colors.push(color.r, color.g, color.b);
        }
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        
        const material = new THREE.PointsMaterial({
            size: 0.08,
            vertexColors: true,
            transparent: true,
            opacity: 0.9
        });
        
        const lights = new THREE.Points(geometry, material);
        group.add(lights);
    }
    
    createFlowerCenterpiece(group) {
        // Vase
        const vaseGeometry = new THREE.CylinderGeometry(0.15, 0.1, 0.3, 16);
        const vaseMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        });
        const vase = new THREE.Mesh(vaseGeometry, vaseMaterial);
        vase.position.y = 0.15;
        vase.castShadow = true;
        group.add(vase);
        
        // Flowers
        const flowerColors = [0xff6b6b, 0xffd93d, 0xffffff, 0xff9ff3];
        for (let i = 0; i < 5; i++) {
            const flowerGeometry = new THREE.SphereGeometry(0.1, 8, 8);
            const flowerMaterial = new THREE.MeshStandardMaterial({ 
                color: flowerColors[i % flowerColors.length]
            });
            const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);
            flower.position.set(
                (Math.random() - 0.5) * 0.3,
                0.4 + Math.random() * 0.2,
                (Math.random() - 0.5) * 0.3
            );
            group.add(flower);
        }
    }
    
    createFlowerArch(group) {
        const archRadius = 1.5;
        const tubeRadius = 0.15;
        
        // Create arch structure
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-archRadius, 0, 0),
            new THREE.Vector3(-archRadius * 0.7, archRadius * 1.5, 0),
            new THREE.Vector3(0, archRadius * 2, 0),
            new THREE.Vector3(archRadius * 0.7, archRadius * 1.5, 0),
            new THREE.Vector3(archRadius, 0, 0)
        ]);
        
        const tubeGeometry = new THREE.TubeGeometry(curve, 64, tubeRadius, 16, false);
        const tubeMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const arch = new THREE.Mesh(tubeGeometry, tubeMaterial);
        arch.castShadow = true;
        group.add(arch);
        
        // Add flowers along the arch
        const flowerColors = [0xffffff, 0xffb7b2, 0xffdac1, 0xe2f0cb];
        const points = curve.getPoints(30);
        
        points.forEach((point, i) => {
            if (i % 2 === 0) {
                const flowerGeometry = new THREE.SphereGeometry(0.12, 8, 8);
                const flowerMaterial = new THREE.MeshStandardMaterial({ 
                    color: flowerColors[Math.floor(Math.random() * flowerColors.length)]
                });
                const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);
                flower.position.copy(point);
                flower.position.add(new THREE.Vector3(
                    (Math.random() - 0.5) * 0.3,
                    (Math.random() - 0.5) * 0.3,
                    (Math.random() - 0.5) * 0.3
                ));
                group.add(flower);
            }
        });
    }
    
    createPottedPlant(group) {
        // Pot
        const potGeometry = new THREE.CylinderGeometry(0.25, 0.2, 0.4, 16);
        const potMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const pot = new THREE.Mesh(potGeometry, potMaterial);
        pot.position.y = 0.2;
        pot.castShadow = true;
        group.add(pot);
        
        // Plant
        const plantGeometry = new THREE.ConeGeometry(0.4, 1.2, 16);
        const plantMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
        const plant = new THREE.Mesh(plantGeometry, plantMaterial);
        plant.position.y = 0.9;
        plant.castShadow = true;
        group.add(plant);
    }
    
    createFlowerWall(group) {
        // Wall base
        const wallGeometry = new THREE.BoxGeometry(3, 2.5, 0.2);
        const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wall.position.y = 1.25;
        wall.castShadow = true;
        group.add(wall);
        
        // Flowers pattern
        const flowerColors = [0xffffff, 0xff69b4, 0xffd700, 0xff6347, 0xdda0dd];
        for (let x = -1.2; x <= 1.2; x += 0.3) {
            for (let y = 0.3; y <= 2.2; y += 0.3) {
                const flowerGeometry = new THREE.SphereGeometry(0.12, 8, 8);
                const flowerMaterial = new THREE.MeshStandardMaterial({ 
                    color: flowerColors[Math.floor(Math.random() * flowerColors.length)]
                });
                const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);
                flower.position.set(x, y, 0.15);
                group.add(flower);
            }
        }
    }
    
    createStage(group) {
        // Stage platform
        const platformGeometry = new THREE.BoxGeometry(6, 0.4, 4);
        const platformMaterial = new THREE.MeshStandardMaterial({ color: 0x4a4a4a });
        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.position.y = 0.2;
        platform.castShadow = true;
        platform.receiveShadow = true;
        group.add(platform);
        
        // Carpet
        const carpetGeometry = new THREE.BoxGeometry(5.8, 0.02, 3.8);
        const carpetMaterial = new THREE.MeshStandardMaterial({ 
            color: this.hexToInt(this.themeColor)
        });
        const carpet = new THREE.Mesh(carpetGeometry, carpetMaterial);
        carpet.position.y = 0.41;
        group.add(carpet);
    }
    
    createBackdrop(group) {
        // Frame
        const frameWidth = 4;
        const frameHeight = 3;
        const frameDepth = 0.1;
        
        // Main panel
        const panelGeometry = new THREE.BoxGeometry(frameWidth, frameHeight, frameDepth);
        const panelMaterial = new THREE.MeshStandardMaterial({ 
            color: this.hexToInt(this.themeColor)
        });
        const panel = new THREE.Mesh(panelGeometry, panelMaterial);
        panel.position.y = frameHeight / 2;
        panel.castShadow = true;
        group.add(panel);
        
        // Decorative border
        const borderGeometry = new THREE.BoxGeometry(frameWidth + 0.2, frameHeight + 0.2, frameDepth - 0.05);
        const borderMaterial = new THREE.MeshStandardMaterial({ color: 0xFFD700 });
        const border = new THREE.Mesh(borderGeometry, borderMaterial);
        border.position.y = frameHeight / 2;
        group.add(border);
    }
    
    createScreen(group) {
        // Screen frame
        const frameWidth = 4;
        const frameHeight = 2.5;
        const frameDepth = 0.15;
        
        const frameGeometry = new THREE.BoxGeometry(frameWidth, frameHeight, frameDepth);
        const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.y = frameHeight / 2 + 1;
        frame.castShadow = true;
        group.add(frame);
        
        // Screen
        const screenGeometry = new THREE.PlaneGeometry(frameWidth - 0.2, frameHeight - 0.2);
        const screenMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x000000,
            emissive: 0x111111,
            roughness: 0.2
        });
        const screen = new THREE.Mesh(screenGeometry, screenMaterial);
        screen.position.set(0, frameHeight / 2 + 1, frameDepth / 2 + 0.01);
        group.add(screen);
        
        // Stand
        const standGeometry = new THREE.BoxGeometry(0.3, 1, 0.3);
        const standMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
        const stand = new THREE.Mesh(standGeometry, standMaterial);
        stand.position.y = 0.5;
        group.add(stand);
    }
    
    createPodium(group) {
        // Podium base
        const baseGeometry = new THREE.BoxGeometry(0.6, 1.1, 0.5);
        const baseMaterial = new THREE.MeshStandardMaterial({ 
            color: this.hexToInt(this.themeColor)
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.55;
        base.castShadow = true;
        group.add(base);
        
        // Top surface
        const topGeometry = new THREE.BoxGeometry(0.7, 0.05, 0.6);
        const topMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.y = 1.125;
        group.add(top);
    }
    
    // Utility methods
    hexToInt(hex) {
        return parseInt(hex.replace('#', ''), 16);
    }
    
    getObjectName(type) {
        const names = {
            round_table: '圆桌',
            rect_table: '长桌',
            chair: '椅子',
            sofa: '沙发',
            chandelier: '吊灯',
            spotlight: '射灯',
            led_strip: 'LED灯带',
            fairy_lights: '串灯',
            flower_centerpiece: '桌花',
            flower_arch: '花拱门',
            potted_plant: '绿植',
            flower_wall: '花墙',
            stage: '舞台',
            backdrop: '背景板',
            screen: 'LED屏',
            podium: '演讲台'
        };
        return names[type] || type;
    }
    
    // Interaction methods
    onMouseDown(event) {
        if (event.button !== 0) return; // Only left click
        
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        const selectableObjects = this.objects.filter(obj => obj.userData.selectable);
        const intersects = this.raycaster.intersectObjects(selectableObjects, true);
        
        if (intersects.length > 0) {
            // Find the root group
            let object = intersects[0].object;
            while (object.parent && !object.userData.selectable) {
                object = object.parent;
            }
            
            if (object.userData.selectable) {
                this.selectObject(object);
                this.isDragging = true;
                this.dragStart = { x: event.clientX, y: event.clientY };
            }
        } else {
            this.deselectObject();
        }
    }
    
    onMouseMove(event) {
        if (this.isDragging && this.selectedObject) {
            const rect = this.renderer.domElement.getBoundingClientRect();
            this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObject(this.groundPlane);
            
            if (intersects.length > 0) {
                this.selectedObject.position.x = intersects[0].point.x;
                this.selectedObject.position.z = intersects[0].point.z;
            }
        }
    }
    
    onMouseUp(event) {
        this.isDragging = false;
    }
    
    onKeyDown(event) {
        switch(event.key) {
            case 'Delete':
            case 'Backspace':
                this.deleteSelected();
                break;
            case 'd':
                if (event.ctrlKey) {
                    event.preventDefault();
                    this.duplicateSelected();
                }
                break;
            case 'Escape':
                this.deselectObject();
                break;
        }
    }
    
    onWindowResize() {
        const canvas = document.getElementById('three-canvas');
        const parent = canvas.parentElement;
        
        this.camera.aspect = parent.clientWidth / parent.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(parent.clientWidth, parent.clientHeight);
    }
    
    // Selection methods
    selectObject(object) {
        this.deselectObject();
        
        this.selectedObject = object;
        
        // Show highlight
        const highlight = object.children.find(child => child.userData.isHighlight);
        if (highlight) {
            highlight.material.visible = true;
        }
        
        // Update UI
        document.getElementById('selectionInfo').style.display = 'flex';
        document.getElementById('selectedObjectName').textContent = this.getObjectName(object.userData.type);
    }
    
    deselectObject() {
        if (this.selectedObject) {
            const highlight = this.selectedObject.children.find(child => child.userData.isHighlight);
            if (highlight) {
                highlight.material.visible = false;
            }
            this.selectedObject = null;
        }
        
        document.getElementById('selectionInfo').style.display = 'none';
    }
    
    deleteSelected() {
        if (this.selectedObject) {
            this.scene.remove(this.selectedObject);
            this.objects = this.objects.filter(obj => obj !== this.selectedObject);
            this.deselectObject();
            this.updateObjectCount();
            this.updateBudget();
            this.showToast('对象已删除', 'success');
        }
    }
    
    duplicateSelected() {
        if (this.selectedObject) {
            const type = this.selectedObject.userData.type;
            const category = this.selectedObject.userData.category;
            const position = this.selectedObject.position.clone();
            position.x += 1;
            position.z += 1;
            
            this.addObject(type, category, position);
        }
    }
    
    // Scene management
    clearScene() {
        if (confirm('确定要清空所有布置吗？')) {
            this.objects.forEach(obj => this.scene.remove(obj));
            this.objects = [];
            this.deselectObject();
            this.updateObjectCount();
            this.updateBudget();
            this.showToast('场景已清空', 'success');
        }
    }
    
    changeVenueType(type) {
        const venueConfigs = {
            indoor_hall: { width: 20, depth: 15, height: 6 },
            outdoor_garden: { width: 25, depth: 20, height: 10 },
            beach: { width: 30, depth: 25, height: 10 },
            rooftop: { width: 15, depth: 12, height: 8 },
            warehouse: { width: 30, depth: 20, height: 8 }
        };
        
        this.currentVenue = { type, ...venueConfigs[type] };
        this.createVenue();
        this.showToast(`已切换到: ${this.getVenueName(type)}`, 'success');
    }
    
    getVenueName(type) {
        const names = {
            indoor_hall: '室内宴会厅',
            outdoor_garden: '户外花园',
            beach: '海滩场地',
            rooftop: '屋顶露台',
            warehouse: '工业仓库'
        };
        return names[type] || type;
    }
    
    updateTheme(color) {
        this.themeColor = color;
        this.showToast('主题颜色已更新', 'success');
    }
    
    updateLighting(intensity) {
        this.directionalLight.intensity = parseFloat(intensity);
        this.ambientLight.intensity = parseFloat(intensity) * 0.5;
    }
    
    toggleGrid(show) {
        if (this.gridHelper) {
            this.gridHelper.visible = show;
        }
    }
    
    updateObjectCount() {
        document.getElementById('objectCount').textContent = `对象: ${this.objects.length}`;
    }
    
    updateBudget() {
        let total = 0;
        this.objects.forEach(obj => {
            const price = this.objectPrices[obj.userData.type] || 0;
            total += price;
        });
        document.getElementById('budgetEstimate').textContent = `预估: $${total.toLocaleString()}`;
    }
    
    // Save/Load methods
    saveDesign() {
        document.getElementById('saveModal').style.display = 'flex';
    }
    
    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }
    
    async confirmSave() {
        const name = document.getElementById('designName').value;
        const description = document.getElementById('designDescription').value;
        
        if (!name) {
            this.showToast('请输入设计名称', 'error');
            return;
        }
        
        const designData = {
            name: name,
            description: description,
            venue: this.currentVenue,
            themeColor: this.themeColor,
            objects: this.objects.map(obj => ({
                type: obj.userData.type,
                category: obj.userData.category,
                position: {
                    x: obj.position.x,
                    y: obj.position.y,
                    z: obj.position.z
                },
                rotation: {
                    x: obj.rotation.x,
                    y: obj.rotation.y,
                    z: obj.rotation.z
                }
            })),
            budget: this.calculateTotalBudget(),
            createdAt: new Date().toISOString()
        };
        
        try {
            // Try to save to API
            const response = await axios.post(`${this.apiBaseUrl}/designs`, designData);
            this.showToast('设计保存成功！', 'success');
            this.closeModal('saveModal');
        } catch (error) {
            // Fallback to localStorage
            const designs = JSON.parse(localStorage.getItem('partyonce_designs') || '[]');
            designData.id = Date.now();
            designs.push(designData);
            localStorage.setItem('partyonce_designs', JSON.stringify(designs));
            this.showToast('设计已保存到本地', 'success');
            this.closeModal('saveModal');
        }
    }
    
    calculateTotalBudget() {
        let total = 0;
        this.objects.forEach(obj => {
            total += this.objectPrices[obj.userData.type] || 0;
        });
        return total;
    }
    
    async loadDesign() {
        const designList = document.getElementById('designList');
        designList.innerHTML = '';
        
        try {
            // Try to load from API
            const response = await axios.get(`${this.apiBaseUrl}/designs`);
            const designs = response.data;
            this.renderDesignList(designs);
        } catch (error) {
            // Fallback to localStorage
            const designs = JSON.parse(localStorage.getItem('partyonce_designs') || '[]');
            this.renderDesignList(designs);
        }
        
        document.getElementById('loadModal').style.display = 'flex';
    }
    
    renderDesignList(designs) {
        const designList = document.getElementById('designList');
        
        if (designs.length === 0) {
            designList.innerHTML = '<p style="text-align: center; color: var(--text-muted);">暂无保存的设计</p>';
            return;
        }
        
        designs.forEach(design => {
            const item = document.createElement('div');
            item.className = 'design-item';
            item.innerHTML = `
                <div class="design-item-info">
                    <h4>${design.name}</h4>
                    <p>${design.description || '无描述'} · $${design.budget?.toLocaleString() || 0}</p>
                </div>
                <div class="design-item-actions">
                    <button class="btn btn-primary" onclick="app.loadDesignData(${design.id})">加载</button>
                    <button class="btn btn-danger" onclick="app.deleteDesign(${design.id})">删除</button>
                </div>
            `;
            designList.appendChild(item);
        });
    }
    
    async loadDesignData(designId) {
        try {
            let design;
            
            try {
                const response = await axios.get(`${this.apiBaseUrl}/designs/${designId}`);
                design = response.data;
            } catch (error) {
                const designs = JSON.parse(localStorage.getItem('partyonce_designs') || '[]');
                design = designs.find(d => d.id === designId);
            }
            
            if (!design) {
                this.showToast('设计未找到', 'error');
                return;
            }
            
            // Clear current scene
            this.objects.forEach(obj => this.scene.remove(obj));
            this.objects = [];
            
            // Load venue
            this.currentVenue = design.venue;
            document.getElementById('venueType').value = design.venue.type;
            this.createVenue();
            
            // Load theme
            this.themeColor = design.themeColor || '#ff6b6b';
            document.getElementById('themeColor').value = this.themeColor;
            
            // Load objects
            design.objects.forEach(objData => {
                const position = new THREE.Vector3(
                    objData.position.x,
                    objData.position.y,
                    objData.position.z
                );
                this.addObject(objData.type, objData.category, position);
                
                // Apply rotation
                const lastObj = this.objects[this.objects.length - 1];
                if (lastObj && objData.rotation) {
                    lastObj.rotation.set(
                        objData.rotation.x,
                        objData.rotation.y,
                        objData.rotation.z
                    );
                }
            });
            
            this.closeModal('loadModal');
            this.showToast('设计加载成功！', 'success');
        } catch (error) {
            this.showToast('加载失败', 'error');
        }
    }
    
    async deleteDesign(designId) {
        if (!confirm('确定要删除这个设计吗？')) return;
        
        try {
            await axios.delete(`${this.apiBaseUrl}/designs/${designId}`);
        } catch (error) {
            const designs = JSON.parse(localStorage.getItem('partyonce_designs') || '[]');
            const filtered = designs.filter(d => d.id !== designId);
            localStorage.setItem('partyonce_designs', JSON.stringify(filtered));
        }
        
        this.loadDesign();
        this.showToast('设计已删除', 'success');
    }
    
    // API Integration
    async fetchVenueInfo(venueId) {
        try {
            const response = await axios.get(`${this.apiBaseUrl}/venues/${venueId}`);
            const venue = response.data;
            
            // Update venue dimensions if available
            if (venue.dimensions) {
                this.currentVenue.width = venue.dimensions.width || 20;
                this.currentVenue.depth = venue.dimensions.depth || 15;
                this.currentVenue.height = venue.dimensions.height || 6;
                this.createVenue();
            }
            
            return venue;
        } catch (error) {
            console.error('Failed to fetch venue info:', error);
            return null;
        }
    }
    
    // UI Utilities
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
    
    // Animation loop
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PartyOnce3DDesigner();
});
