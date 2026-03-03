<template>
  <div class="designer-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-icon"><el-icon><View /></el-icon></div>
        <h1>3D 场景设计器</h1>
        <p>可视化布置派对场景，实时预览设计效果</p>
      </div>
    </div>

    <div class="designer-container">
      <!-- Toolbar -->
      <div class="toolbar">
        <div class="toolbar-section">
          <el-button @click="clearScene">
            <el-icon><Delete /></el-icon>清空
          </el-button>
          <el-button @click="saveDesign">
            <el-icon><Save /></el-icon>保存
          </el-button>
          <el-button @click="loadDesign">
            <el-icon><FolderOpened /></el-icon>加载
          </el-button>
        </div>
        
        <div class="toolbar-section center">
          <span class="info-item">
            <el-icon><OfficeBuilding /></el-icon>
            {{ venueName }}
          </span>
          <el-divider direction="vertical" />
          <span class="info-item">
            <el-icon><Box /></el-icon>
            对象: {{ objectCount }}
          </span>
          <el-divider direction="vertical" />
          <span class="info-item budget">
            <el-icon><Money /></el-icon>
            预估: ${{ totalBudget.toLocaleString() }}
          </span>
        </div>
        
        <div class="toolbar-section">
          <el-button type="primary" @click="goToQuotation">
            生成报价 <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
      </div>

      <div class="designer-layout">
        <!-- Sidebar -->
        <aside class="object-sidebar">
          <el-tabs v-model="activeTab" type="border-card">
            <!-- Furniture Tab -->
            <el-tab-pane label="家具" name="furniture">
              <div class="object-grid">
                <div
                  v-for="item in furnitureItems"
                  :key="item.type"
                  class="object-card"
                  draggable="true"
                  @dragstart="onDragStart($event, item)"
                  @click="addObject(item)"
                >
                  <div class="object-icon" :style="{ background: item.color }">
                    <el-icon><component :is="item.icon" /></el-icon>
                  </div>
                  <span class="object-name">{{ item.name }}</span>
                  <span class="object-price">${{ item.price }}</span>
                </div>
              </div>
            </el-tab-pane>

            <!-- Lighting Tab -->
            <el-tab-pane label="灯光" name="lighting">
              <div class="object-grid">
                <div
                  v-for="item in lightingItems"
                  :key="item.type"
                  class="object-card"
                  draggable="true"
                  @dragstart="onDragStart($event, item)"
                  @click="addObject(item)"
                >
                  <div class="object-icon" :style="{ background: item.color }">
                    <el-icon><component :is="item.icon" /></el-icon>
                  </div>
                  <span class="object-name">{{ item.name }}</span>
                  <span class="object-price">${{ item.price }}</span>
                </div>
              </div>
            </el-tab-pane>

            <!-- Decoration Tab -->
            <el-tab-pane label="装饰" name="decoration">
              <div class="object-grid">
                <div
                  v-for="item in decorationItems"
                  :key="item.type"
                  class="object-card"
                  draggable="true"
                  @dragstart="onDragStart($event, item)"
                  @click="addObject(item)"
                >
                  <div class="object-icon" :style="{ background: item.color }">
                    <el-icon><component :is="item.icon" /></el-icon>
                  </div>
                  <span class="object-name">{{ item.name }}</span>
                  <span class="object-price">${{ item.price }}</span>
                </div>
              </div>
            </el-tab-pane>

            <!-- Stage Tab -->
            <el-tab-pane label="舞台" name="stage">
              <div class="object-grid">
                <div
                  v-for="item in stageItems"
                  :key="item.type"
                  class="object-card"
                  draggable="true"
                  @dragstart="onDragStart($event, item)"
                  @click="addObject(item)"
                >
                  <div class="object-icon" :style="{ background: item.color }">
                    <el-icon><component :is="item.icon" /></el-icon>
                  </div>
                  <span class="object-name">{{ item.name }}</span>
                  <span class="object-price">${{ item.price }}</span>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>

          <!-- Venue Settings -->
          <div class="settings-panel">
            <h4>场地设置</h4>
            <el-form label-position="top" size="small">
              <el-form-item label="场地类型">
                <el-select v-model="venueType" @change="changeVenueType" style="width: 100%">
                  <el-option label="室内宴会厅" value="indoor_hall" />
                  <el-option label="户外花园" value="outdoor_garden" />
                  <el-option label="海滩场地" value="beach" />
                  <el-option label="屋顶露台" value="rooftop" />
                  <el-option label="工业仓库" value="warehouse" />
                </el-select>
              </el-form-item>
              
              <el-form-item label="主题颜色">
                <el-color-picker v-model="themeColor" @change="updateTheme" />
              </el-form-item>
              
              <el-form-item label="光照强度">
                <el-slider v-model="lightingIntensity" :min="0" :max="2" :step="0.1" @change="updateLighting" />
              </el-form-item>
              
              <el-form-item>
                <el-checkbox v-model="showGrid" @change="toggleGrid">显示网格</el-checkbox>
              </el-form-item>
            </el-form>

            <el-divider />

            <div class="venue-info">
              <p><strong>尺寸:</strong> {{ venueSize }}</p>
              <p><strong>容量:</strong> {{ venueCapacity }}人</p>
              <p><strong>高度:</strong> {{ venueHeight }}</p>
            </div>
          </div>
        </aside>

        <!-- 3D Canvas -->
        <div class="canvas-container" ref="canvasContainer">
          <canvas id="three-canvas" ref="threeCanvas" />
          
          <!-- Selection Info -->
          <div v-if="selectedObject" class="selection-info">
            <span>已选择: {{ selectedObjectName }}</span>
            <el-button-group>
              <el-button size="small" @click="duplicateSelected">
                <el-icon><CopyDocument /></el-icon> 复制
              </el-button>
              <el-button size="small" type="danger" @click="deleteSelected">
                <el-icon><Delete /></el-icon> 删除
              </el-button>
            </el-button-group>
          </div>

          <!-- Canvas Overlay -->
          <div class="canvas-overlay">
            <el-tooltip content="左键拖拽移动物体，右键旋转视角，滚轮缩放">
              <el-icon><InfoFilled /></el-icon>
            </el-tooltip>
          </div>
        </div>
      </div>
    </div>

    <!-- Save Design Dialog -->
    <el-dialog v-model="saveDialogVisible" title="保存设计" width="500px">
      <el-form label-position="top">
        <el-form-item label="设计名称">
          <el-input v-model="designForm.name" placeholder="输入设计名称" />
        </el-form-item>
        <el-form-item label="设计描述">
          <el-input v-model="designForm.description" type="textarea" rows="3" placeholder="描述您的设计..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="saveDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSave">保存</el-button>
      </template>
    </el-dialog>

    <!-- Load Design Dialog -->
    <el-dialog v-model="loadDialogVisible" title="加载设计" width="600px">
      <div v-if="savedDesigns.length === 0" class="empty-designs">
        <el-empty description="暂无保存的设计" />
      </div>
      <div v-else class="design-list">
        <div
          v-for="design in savedDesigns"
          :key="design.id"
          class="design-list-item"
        >
          <div class="design-info">
            <h4>{{ design.name }}</h4>
            <p>{{ design.description || '无描述' }} · ${{ design.budget?.toLocaleString() || 0 }}</p>
            <span class="design-date">{{ formatDate(design.createdAt) }}</span>
          </div>
          <div class="design-actions">
            <el-button type="primary" size="small" @click="loadDesignData(design)">加载</el-button>
            <el-button type="danger" size="small" @click="deleteDesign(design.id)">删除</el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { 
  View, Delete, Save, FolderOpened, ArrowRight, OfficeBuilding, 
  Box, Money, CopyDocument, InfoFilled, Food, Tickets, UserFilled, 
  FirstAidKit, Lightning, Search, MagicStick, Star, Orange, Tree, 
  Picture, Platform, PictureRounded, Monitor, Postcard
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { venueAPI } from '@/api/modules'
import { usePlanStore } from '@/store'

const router = useRouter()
const route = useRoute()
const planStore = usePlanStore()

// Refs
const canvasContainer = ref(null)
const threeCanvas = ref(null)
const activeTab = ref('furniture')
const saveDialogVisible = ref(false)
const loadDialogVisible = ref(false)
const selectedObject = ref(null)
const showGrid = ref(true)

// Three.js refs
let scene, camera, renderer, controls, raycaster, mouse
let objects = []
let groundPlane, gridHelper
let isDragging = false

// Design form
const designForm = ref({
  name: '',
  description: ''
})
const savedDesigns = ref([])

// Venue settings
const venueType = ref('indoor_hall')
const themeColor = ref('#ff6b6b')
const lightingIntensity = ref(0.8)
const venueName = ref('未命名场地')
const venueSize = ref('20m × 15m')
const venueCapacity = ref(200)
const venueHeight = ref('6m')

const currentVenue = ref({
  type: 'indoor_hall',
  width: 20,
  depth: 15,
  height: 6
})

// Object items
const furnitureItems = [
  { type: 'round_table', name: '圆桌', price: 50, icon: 'Food', color: '#8B4513' },
  { type: 'rect_table', name: '长桌', price: 60, icon: 'Tickets', color: '#8B4513' },
  { type: 'chair', name: '椅子', price: 10, icon: 'UserFilled', color: '#ff6b6b' },
  { type: 'sofa', name: '沙发', price: 200, icon: 'FirstAidKit', color: '#ff6b6b' }
]

const lightingItems = [
  { type: 'chandelier', name: '吊灯', price: 300, icon: 'Lightning', color: '#FFD700' },
  { type: 'spotlight', name: '射灯', price: 80, icon: 'Search', color: '#FFD700' },
  { type: 'led_strip', name: 'LED灯带', price: 40, icon: 'MagicStick', color: '#ff6b6b' },
  { type: 'fairy_lights', name: '串灯', price: 25, icon: 'Star', color: '#ff6b6b' }
]

const decorationItems = [
  { type: 'flower_centerpiece', name: '桌花', price: 80, icon: 'Orange', color: '#ff69b4' },
  { type: 'flower_arch', name: '花拱门', price: 500, icon: 'Orange', color: '#ff69b4' },
  { type: 'potted_plant', name: '绿植', price: 60, icon: 'Tree', color: '#228B22' },
  { type: 'flower_wall', name: '花墙', price: 800, icon: 'Picture', color: '#ff69b4' }
]

const stageItems = [
  { type: 'stage', name: '舞台', price: 2000, icon: 'Platform', color: '#4a4a4a' },
  { type: 'backdrop', name: '背景板', price: 600, icon: 'PictureRounded', color: '#ff6b6b' },
  { type: 'screen', name: 'LED屏', price: 1500, icon: 'Monitor', color: '#222222' },
  { type: 'podium', name: '演讲台', price: 150, icon: 'Postcard', color: '#ff6b6b' }
]

const objectPrices = {
  round_table: 50, rect_table: 60, chair: 10, sofa: 200,
  chandelier: 300, spotlight: 80, led_strip: 40, fairy_lights: 25,
  flower_centerpiece: 80, flower_arch: 500, potted_plant: 60, flower_wall: 800,
  stage: 2000, backdrop: 600, screen: 1500, podium: 150
}

// Computed
const objectCount = computed(() => objects.length)
const totalBudget = computed(() => {
  return objects.reduce((sum, obj) => sum + (objectPrices[obj.userData?.type] || 0), 0)
})
const selectedObjectName = computed(() => {
  if (!selectedObject.value) return ''
  const names = {
    round_table: '圆桌', rect_table: '长桌', chair: '椅子', sofa: '沙发',
    chandelier: '吊灯', spotlight: '射灯', led_strip: 'LED灯带', fairy_lights: '串灯',
    flower_centerpiece: '桌花', flower_arch: '花拱门', potted_plant: '绿植', flower_wall: '花墙',
    stage: '舞台', backdrop: '背景板', screen: 'LED屏', podium: '演讲台'
  }
  return names[selectedObject.value.userData?.type] || '未知对象'
})

// Three.js initialization
const initThreeJS = () => {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0a0a1a)
  scene.fog = new THREE.Fog(0x0a0a1a, 10, 100)

  const aspect = canvasContainer.value.clientWidth / canvasContainer.value.clientHeight
  camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000)
  camera.position.set(15, 12, 15)
  camera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({ 
    canvas: threeCanvas.value,
    antialias: true,
    alpha: true
  })
  renderer.setSize(canvasContainer.value.clientWidth, canvasContainer.value.clientHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.minDistance = 5
  controls.maxDistance = 50
  controls.maxPolarAngle = Math.PI / 2 - 0.05

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(10, 20, 10)
  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.width = 2048
  directionalLight.shadow.mapSize.height = 2048
  scene.add(directionalLight)

  const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.3)
  scene.add(hemisphereLight)

  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()

  createVenue()

  threeCanvas.value.addEventListener('mousedown', onMouseDown)
  threeCanvas.value.addEventListener('mousemove', onMouseMove)
  threeCanvas.value.addEventListener('mouseup', onMouseUp)
  threeCanvas.value.addEventListener('dragover', (e) => e.preventDefault())
  threeCanvas.value.addEventListener('drop', onDrop)
  window.addEventListener('resize', onWindowResize)
  document.addEventListener('keydown', onKeyDown)

  animate()
}

const createVenue = () => {
  if (groundPlane) scene.remove(groundPlane)
  if (gridHelper) scene.remove(gridHelper)

  const { width, depth, type } = currentVenue.value

  const colors = {
    indoor_hall: 0x8B7355, outdoor_garden: 0x4a7c59,
    beach: 0xe6d5a7, rooftop: 0x666666, warehouse: 0x4a4a4a
  }
  const planeGeometry = new THREE.PlaneGeometry(width, depth)
  const planeMaterial = new THREE.MeshStandardMaterial({ 
    color: colors[type] || 0x8B7355, roughness: 0.8, metalness: 0.1
  })
  groundPlane = new THREE.Mesh(planeGeometry, planeMaterial)
  groundPlane.rotation.x = -Math.PI / 2
  groundPlane.receiveShadow = true
  groundPlane.userData = { isGround: true }
  scene.add(groundPlane)

  gridHelper = new THREE.GridHelper(Math.max(width, depth), Math.max(width, depth), 0x444444, 0x2a2a4a)
  gridHelper.position.y = 0.01
  scene.add(gridHelper)

  updateVenueInfo()
}

const updateVenueInfo = () => {
  const { width, depth, height } = currentVenue.value
  venueSize.value = `${width}m × ${depth}m`
  venueCapacity.value = Math.floor((width * depth) / 1.5)
  venueHeight.value = `${height}m`
}

// Object creation methods
const createObject3D = (type) => {
  const group = new THREE.Group()
  const color = parseInt(themeColor.value.replace('#', ''), 16)

  switch(type) {
    case 'round_table': createRoundTable(group); break
    case 'rect_table': createRectTable(group); break
    case 'chair': createChair(group, color); break
    case 'sofa': createSofa(group, color); break
    case 'chandelier': createChandelier(group); break
    case 'spotlight': createSpotlight(group); break
    case 'stage': createStage(group, color); break
    case 'backdrop': createBackdrop(group, color); break
    case 'podium': createPodium(group, color); break
    default:
      const geometry = new THREE.BoxGeometry(1, 1, 1)
      const material = new THREE.MeshStandardMaterial({ color })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.y = 0.5
      mesh.castShadow = true
      group.add(mesh)
  }
  return group
}

const createRoundTable = (group) => {
  const top = new THREE.Mesh(
    new THREE.CylinderGeometry(0.8, 0.8, 0.05, 32),
    new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.3 })
  )
  top.position.y = 0.75
  top.castShadow = true
  group.add(top)

  const legMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 })
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.75, 16), legMaterial)
  leg.position.y = 0.375
  leg.castShadow = true
  group.add(leg)

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.05, 16), legMaterial)
  base.position.y = 0.025
  base.castShadow = true
  group.add(base)
}

const createRectTable = (group) => {
  const top = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.05, 0.9),
    new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.3 })
  )
  top.position.y = 0.75
  top.castShadow = true
  group.add(top)

  const legMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 })
  const legGeometry = new THREE.BoxGeometry(0.08, 0.75, 0.08)
  const positions = [[-0.8, 0.375, -0.35], [0.8, 0.375, -0.35], [-0.8, 0.375, 0.35], [0.8, 0.375, 0.35]]
  positions.forEach(pos => {
    const leg = new THREE.Mesh(legGeometry, legMaterial)
    leg.position.set(...pos)
    leg.castShadow = true
    group.add(leg)
  })
}

const createChair = (group, color) => {
  const material = new THREE.MeshStandardMaterial({ color })
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.5), material)
  seat.position.y = 0.45
  seat.castShadow = true
  group.add(seat)

  const back = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.05), material)
  back.position.set(0, 0.7, -0.225)
  back.castShadow = true
  group.add(back)

  const legMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 })
  const legGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.45, 8)
  const positions = [[-0.2, 0.225, -0.2], [0.2, 0.225, -0.2], [-0.2, 0.225, 0.2], [0.2, 0.225, 0.2]]
  positions.forEach(pos => {
    const leg = new THREE.Mesh(legGeometry, legMaterial)
    leg.position.set(...pos)
    leg.castShadow = true
    group.add(leg)
  })
}

const createSofa = (group, color) => {
  const material = new THREE.MeshStandardMaterial({ color, roughness: 0.8 })
  const base = new THREE.Mesh(new THREE.BoxGeometry(2, 0.4, 0.8), material)
  base.position.y = 0.2
  base.castShadow = true
  group.add(base)

  const back = new THREE.Mesh(new THREE.BoxGeometry(2, 0.6, 0.15), material)
  back.position.set(0, 0.7, -0.325)
  back.castShadow = true
  group.add(back)

  const armGeometry = new THREE.BoxGeometry(0.15, 0.5, 0.8)
  const leftArm = new THREE.Mesh(armGeometry, material)
  leftArm.position.set(-0.925, 0.65, 0)
  leftArm.castShadow = true
  group.add(leftArm)

  const rightArm = new THREE.Mesh(armGeometry, material)
  rightArm.position.set(0.925, 0.65, 0)
  rightArm.castShadow = true
  group.add(rightArm)
}

const createChandelier = (group) => {
  const height = currentVenue.value.height
  const material = new THREE.MeshStandardMaterial({ color: 0xFFD700 })
  const mount = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.2, 16), material)
  mount.position.y = height - 0.1
  group.add(mount)

  const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1, 8), material)
  chain.position.y = height - 0.7
  group.add(chain)

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.4, 0.5, 8), material)
  body.position.y = height - 1.4
  group.add(body)

  const light = new THREE.PointLight(0xffaa00, 0.8, 10)
  light.position.y = height - 1.5
  light.castShadow = true
  group.add(light)
}

const createSpotlight = (group) => {
  const height = currentVenue.value.height
  const housing = new THREE.Mesh(
    new THREE.ConeGeometry(0.15, 0.3, 16, 1, true),
    new THREE.MeshStandardMaterial({ color: 0x333333 })
  )
  housing.position.y = height - 0.15
  housing.rotation.x = Math.PI
  group.add(housing)

  const spotLight = new THREE.SpotLight(0xffffff, 1)
  spotLight.position.y = height - 0.3
  spotLight.target.position.set(0, 0, 0)
  spotLight.angle = Math.PI / 6
  spotLight.penumbra = 0.3
  spotLight.castShadow = true
  group.add(spotLight)
  group.add(spotLight.target)
}

const createStage = (group, color) => {
  const platform = new THREE.Mesh(
    new THREE.BoxGeometry(6, 0.4, 4),
    new THREE.MeshStandardMaterial({ color: 0x4a4a4a })
  )
  platform.position.y = 0.2
  platform.castShadow = true
  platform.receiveShadow = true
  group.add(platform)

  const carpet = new THREE.Mesh(
    new THREE.BoxGeometry(5.8, 0.02, 3.8),
    new THREE.MeshStandardMaterial({ color })
  )
  carpet.position.y = 0.41
  group.add(carpet)
}

const createBackdrop = (group, color) => {
  const panel = new THREE.Mesh(
    new THREE.BoxGeometry(4, 3, 0.1),
    new THREE.MeshStandardMaterial({ color })
  )
  panel.position.y = 1.5
  panel.castShadow = true
  group.add(panel)

  const border = new THREE.Mesh(
    new THREE.BoxGeometry(4.2, 3.2, 0.08),
    new THREE.MeshStandardMaterial({ color: 0xFFD700 })
  )
  border.position.y = 1.5
  group.add(border)
}

const createPodium = (group, color) => {
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 1.1, 0.5),
    new THREE.MeshStandardMaterial({ color })
  )
  base.position.y = 0.55
  base.castShadow = true
  group.add(base)

  const top = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.05, 0.6),
    new THREE.MeshStandardMaterial({ color: 0x333333 })
  )
  top.position.y = 1.125
  group.add(top)
}

// Event handlers
const onMouseDown = (event) => {
  if (event.button !== 0) return

  const rect = renderer.domElement.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(mouse, camera)
  const selectableObjects = objects.filter(obj => obj.userData?.selectable)
  const intersects = raycaster.intersectObjects(selectableObjects, true)

  if (intersects.length > 0) {
    let object = intersects[0].object
    while (object.parent && !object.userData?.selectable) {
      object = object.parent
    }
    if (object.userData?.selectable) {
      selectObject(object)
      isDragging = true
    }
  } else {
    deselectObject()
  }
}

const onMouseMove = (event) => {
  if (isDragging && selectedObject.value && groundPlane) {
    const rect = renderer.domElement.getBoundingClientRect()
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObject(groundPlane)

    if (intersects.length > 0) {
      selectedObject.value.position.x = intersects[0].point.x
      selectedObject.value.position.z = intersects[0].point.z
    }
  }
}

const onMouseUp = () => {
  isDragging = false
}

const onDrop = (event) => {
  event.preventDefault()
  const itemData = event.dataTransfer.getData('item')
  if (!itemData) return
  
  const item = JSON.parse(itemData)
  const rect = renderer.domElement.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObject(groundPlane)

  if (intersects.length > 0) {
    addObjectAtPosition(item, intersects[0].point)
  }
}

const onKeyDown = (event) => {
  switch(event.key) {
    case 'Delete':
    case 'Backspace':
      deleteSelected()
      break
    case 'd':
      if (event.ctrlKey) {
        event.preventDefault()
        duplicateSelected()
      }
      break
    case 'Escape':
      deselectObject()
      break
  }
}

const onWindowResize = () => {
  if (!camera || !renderer || !canvasContainer.value) return
  camera.aspect = canvasContainer.value.clientWidth / canvasContainer.value.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(canvasContainer.value.clientWidth, canvasContainer.value.clientHeight)
}

const animate = () => {
  requestAnimationFrame(animate)
  if (controls) controls.update()
  if (renderer && scene && camera) renderer.render(scene, camera)
}

// Object management
const addObject = (item) => {
  const x = (Math.random() - 0.5) * 4
  const z = (Math.random() - 0.5) * 4
  addObjectAtPosition(item, new THREE.Vector3(x, 0, z))
  ElMessage.success(`已添加: ${item.name}`)
}

const addObjectAtPosition = (item, position) => {
  const group = createObject3D(item.type)
  group.userData = { 
    type: item.type, 
    category: activeTab.value,
    id: Date.now() + Math.random(),
    selectable: true
  }
  
  group.position.copy(position)
  group.position.y = 0

  // Add selection highlight
  const box = new THREE.Box3().setFromObject(group)
  const size = new THREE.Vector3()
  box.getSize(size)
  
  const highlightGeometry = new THREE.BoxGeometry(size.x + 0.2, size.y + 0.2, size.z + 0.2)
  const highlightMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xff6b6b, wireframe: true, visible: false
  })
  const highlight = new THREE.Mesh(highlightGeometry, highlightMaterial)
  highlight.position.y = size.y / 2
  highlight.userData = { isHighlight: true }
  group.add(highlight)

  scene.add(group)
  objects.push(group)
  selectObject(group)
}

const selectObject = (object) => {
  deselectObject()
  selectedObject.value = object
  
  const highlight = object.children.find(child => child.userData?.isHighlight)
  if (highlight) highlight.material.visible = true
}

const deselectObject = () => {
  if (selectedObject.value) {
    const highlight = selectedObject.value.children.find(child => child.userData?.isHighlight)
    if (highlight) highlight.material.visible = false
    selectedObject.value = null
  }
}

const deleteSelected = () => {
  if (selectedObject.value) {
    scene.remove(selectedObject.value)
    objects = objects.filter(obj => obj !== selectedObject.value)
    deselectObject()
    ElMessage.success('对象已删除')
  }
}

const duplicateSelected = () => {
  if (selectedObject.value) {
    const itemType = selectedObject.value.userData.type
    const item = [...furnitureItems, ...lightingItems, ...decorationItems, ...stageItems]
      .find(i => i.type === itemType)
    if (item) {
      const position = selectedObject.value.position.clone()
      position.x += 1
      position.z += 1
      addObjectAtPosition(item, position)
    }
  }
}

const clearScene = () => {
  ElMessageBox.confirm('确定要清空所有布置吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    objects.forEach(obj => scene.remove(obj))
    objects = []
    deselectObject()
    ElMessage.success('场景已清空')
  })
}

// Venue and settings
const changeVenueType = () => {
  const venueConfigs = {
    indoor_hall: { width: 20, depth: 15, height: 6 },
    outdoor_garden: { width: 25, depth: 20, height: 10 },
    beach: { width: 30, depth: 25, height: 10 },
    rooftop: { width: 15, depth: 12, height: 8 },
    warehouse: { width: 30, depth: 20, height: 8 }
  }
  
  currentVenue.value = { type: venueType.value, ...venueConfigs[venueType.value] }
  createVenue()
  ElMessage.success(`已切换到: ${getVenueName(venueType.value)}`)
}

const getVenueName = (type) => {
  const names = {
    indoor_hall: '室内宴会厅', outdoor_garden: '户外花园',
    beach: '海滩场地', rooftop: '屋顶露台', warehouse: '工业仓库'
  }
  return names[type] || type
}

const updateTheme = () => {
  ElMessage.success('主题颜色已更新')
}

const updateLighting = () => {
  const lights = scene.children.filter(c => c instanceof THREE.DirectionalLight)
  lights.forEach(light => light.intensity = lightingIntensity.value)
}

const toggleGrid = () => {
  if (gridHelper) gridHelper.visible = showGrid.value
}

// Save/Load
const saveDesign = () => {
  saveDialogVisible.value = true
}

const confirmSave = () => {
  if (!designForm.value.name) {
    ElMessage.warning('请输入设计名称')
    return
  }
  
  const designData = {
    id: Date.now(),
    name: designForm.value.name,
    description: designForm.value.description,
    venue: currentVenue.value,
    themeColor: themeColor.value,
    objects: objects.map(obj => ({
      type: obj.userData.type,
      category: obj.userData.category,
      position: { x: obj.position.x, y: obj.position.y, z: obj.position.z },
      rotation: { x: obj.rotation.x, y: obj.rotation.y, z: obj.rotation.z }
    })),
    budget: totalBudget.value,
    createdAt: new Date().toISOString()
  }
  
  // Save to localStorage
  const designs = JSON.parse(localStorage.getItem('partyonce_designs') || '[]')
  designs.push(designData)
  localStorage.setItem('partyonce_designs', JSON.stringify(designs))
  
  ElMessage.success('设计已保存')
  saveDialogVisible.value = false
  designForm.value = { name: '', description: '' }
}

const loadDesign = () => {
  savedDesigns.value = JSON.parse(localStorage.getItem('partyonce_designs') || '[]')
  loadDialogVisible.value = true
}

const loadDesignData = (design) => {
  // Clear current scene
  objects.forEach(obj => scene.remove(obj))
  objects = []
  deselectObject()
  
  // Load venue
  currentVenue.value = design.venue
  venueType.value = design.venue.type
  createVenue()
  
  // Load theme
  themeColor.value = design.themeColor || '#ff6b6b'
  
  // Load objects
  design.objects.forEach(objData => {
    const item = [...furnitureItems, ...lightingItems, ...decorationItems, ...stageItems]
      .find(i => i.type === objData.type)
    if (item) {
      addObjectAtPosition(item, new THREE.Vector3(objData.position.x, objData.position.y, objData.position.z))
      const lastObj = objects[objects.length - 1]
      if (lastObj && objData.rotation) {
        lastObj.rotation.set(objData.rotation.x, objData.rotation.y, objData.rotation.z)
      }
    }
  })
  
  loadDialogVisible.value = false
  ElMessage.success('设计加载成功')
}

const deleteDesign = (id) => {
  ElMessageBox.confirm('确定要删除这个设计吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const designs = JSON.parse(localStorage.getItem('partyonce_designs') || '[]')
    const filtered = designs.filter(d => d.id !== id)
    localStorage.setItem('partyonce_designs', JSON.stringify(filtered))
    savedDesigns.value = filtered
    ElMessage.success('设计已删除')
  })
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// Navigation
const goToQuotation = () => {
  // Save current design to store
  planStore.setCurrentPlan({
    ...planStore.currentPlan,
    design: {
      objects: objects.map(obj => ({ type: obj.userData.type })),
      totalBudget: totalBudget.value
    }
  })
  router.push('/quotation')
}

// Drag and drop
const onDragStart = (event, item) => {
  event.dataTransfer.setData('item', JSON.stringify(item))
}

// Fetch venue from route
const fetchVenueFromRoute = async () => {
  const venueId = route.query.venueId
  if (venueId) {
    try {
      const venue = await venueAPI.getVenue(venueId)
      if (venue) {
        venueName.value = venue.name
        if (venue.dimensions) {
          currentVenue.value.width = venue.dimensions.width || 20
          currentVenue.value.depth = venue.dimensions.depth || 15
          currentVenue.value.height = venue.dimensions.height || 6
          createVenue()
        }
      }
    } catch (error) {
      console.error('Failed to fetch venue:', error)
    }
  }
}

onMounted(() => {
  initThreeJS()
  fetchVenueFromRoute()
})

onUnmounted(() => {
  if (threeCanvas.value) {
    threeCanvas.value.removeEventListener('mousedown', onMouseDown)
    threeCanvas.value.removeEventListener('mousemove', onMouseMove)
    threeCanvas.value.removeEventListener('mouseup', onMouseUp)
  }
  window.removeEventListener('resize', onWindowResize)
  document.removeEventListener('keydown', onKeyDown)
  if (renderer) renderer.dispose()
})
</script>

<style scoped>
.designer-page {
  min-height: calc(100vh - 64px);
  background: #f5f7fa;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
  text-align: center;
  color: white;
}

.header-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.page-header h1 {
  font-size: 36px;
  margin-bottom: 12px;
}

.page-header p {
  font-size: 16px;
  opacity: 0.9;
}

.designer-container {
  padding: 20px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 12px 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.toolbar-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-section.center {
  flex: 1;
  justify-content: center;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #606266;
}

.info-item.budget {
  color: #f56c6c;
  font-weight: bold;
}

.designer-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 20px;
  height: calc(100vh - 280px);
}

.object-sidebar {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.object-sidebar :deep(.el-tabs) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.object-sidebar :deep(.el-tabs__content) {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.object-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.object-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.object-card:hover {
  background: #e6f2ff;
  transform: translateY(-2px);
}

.object-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.object-icon .el-icon {
  font-size: 24px;
  color: white;
}

.object-name {
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
}

.object-price {
  font-size: 12px;
  color: #f56c6c;
}

.settings-panel {
  padding: 16px;
  border-top: 1px solid #ebeef5;
}

.settings-panel h4 {
  margin-bottom: 16px;
  color: #303133;
}

.venue-info {
  font-size: 13px;
  color: #606266;
}

.venue-info p {
  margin-bottom: 8px;
}

.canvas-container {
  background: #0a0a1a;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}

#three-canvas {
  width: 100%;
  height: 100%;
  cursor: crosshair;
}

.selection-info {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.95);
  padding: 12px 24px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.canvas-overlay {
  position: absolute;
  top: 12px;
  right: 12px;
  color: rgba(255,255,255,0.6);
  font-size: 20px;
}

.design-list {
  max-height: 400px;
  overflow-y: auto;
}

.design-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #ebeef5;
}

.design-list-item:last-child {
  border-bottom: none;
}

.design-info h4 {
  margin-bottom: 4px;
  color: #303133;
}

.design-info p {
  font-size: 13px;
  color: #606266;
  margin-bottom: 4px;
}

.design-date {
  font-size: 12px;
  color: #909399;
}

.design-actions {
  display: flex;
  gap: 8px;
}

@media (max-width: 1024px) {
  .designer-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto 400px;
  }
  
  .toolbar-section.center {
    display: none;
  }
}
</style>
