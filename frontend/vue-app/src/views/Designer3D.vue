<template>
  <div class="designer-page">
    <div class="designer-header">
      <h1>3D 场地设计器</h1>
      <div class="header-actions">
        <el-select v-model="selectedVenue" placeholder="选择场地" style="width: 200px; margin-right: 12px;">
          <el-option
            v-for="venue in venues"
            :key="venue.id"
            :label="venue.name"
            :value="venue.id"
          />
        </el-select>
        <el-button type="primary" @click="saveDesign" :loading="saving">
          <el-icon><Download /></el-icon> 保存设计
        </el-button>
        <el-button @click="clearScene">
          <el-icon><Delete /></el-icon> 清空
        </el-button>
      </div>
    </div>

    <div class="designer-container">
      <!-- 左侧物品面板 -->
      <aside class="objects-panel">
        <h3>装饰物品</h3>
        
        <div class="category" v-for="category in objectCategories" :key="category.name">
          <h4>{{ category.name }}</h4>
          <div class="object-grid">
            <div
              v-for="obj in category.objects"
              :key="obj.type"
              class="object-item"
              draggable="true"
              @dragstart="handleDragStart($event, obj)"
              @click="addObject(obj)"
            >
              <div class="object-icon">{{ obj.icon }}</div>
              <div class="object-name">{{ obj.name }}</div>
              <div class="object-price">${{ obj.price }}</div>
            </div>
          </div>
        </div>

        <div class="budget-section">
          <h4>预算概览</h4>
          <div class="budget-item">
            <span>当前费用</span>
            <span class="price">${{ totalCost }}</span>
          </div>
          <div class="budget-item">
            <span>物品数量</span>
            <span>{{ sceneObjects.length }}</span>
          </div>
        </div>
      </aside>

      <!-- 中间 3D 场景 -->
      <div class="scene-container" ref="sceneContainer">
        <div v-if="!selectedVenue" class="venue-placeholder">
          <el-icon><OfficeBuilding /></el-icon>
          <p>请先选择一个场地开始设计</p>
        </div>
        <canvas v-show="selectedVenue" ref="canvas" class="scene-canvas"></canvas>
        
        <!-- 场景控制 -->
        <div class="scene-controls">
          <el-button-group>
            <el-button size="small" @click="resetCamera">
              <el-icon><View /></el-icon> 重置视角
            </el-button>
            <el-button size="small" @click="toggleGrid">
              <el-icon><Grid /></el-icon> 网格
            </el-button>
          </el-button-group>
        </div>
      </div>

      <!-- 右侧属性面板 -->
      <aside class="properties-panel" v-if="selectedObject">
        <h3>物品属性</h3>
        <el-form label-position="top">
          <el-form-item label="名称">
            <el-input v-model="selectedObject.name" disabled />
          </el-form-item>
          
          <el-form-item label="位置 X">
            <el-slider v-model="selectedObject.position.x" :min="-50" :max="50" :step="0.5" />
          </el-form-item>
          
          <el-form-item label="位置 Z">
            <el-slider v-model="selectedObject.position.z" :min="-50" :max="50" :step="0.5" />
          </el-form-item>
          
          <el-form-item label="旋转">
            <el-slider v-model="selectedObject.rotation" :min="0" :max="360" :step="15" />
          </el-form-item>
          
          <el-form-item label="缩放">
            <el-slider v-model="selectedObject.scale" :min="0.5" :max="2" :step="0.1" />
          </el-form-item>
          
          <el-form-item>
            <el-button type="danger" @click="removeObject" style="width: 100%">
              删除物品
            </el-button>
          </el-form-item>
        </el-form>
      </aside>

      <aside v-else class="properties-panel empty">
        <p>点击场景中的物品进行编辑</p>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Download, Delete, OfficeBuilding, View, Grid } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

// 场景相关
const sceneContainer = ref(null)
const canvas = ref(null)
let scene, camera, renderer, controls
let raycaster, mouse
const sceneObjects = ref([])
const selectedObject = ref(null)
const selectedVenue = ref(null)
const saving = ref(false)

// 场地列表
const venues = ref([
  { id: 1, name: '云端宴会厅', width: 20, length: 30, height: 8 },
  { id: 2, name: '海边草坪', width: 40, length: 50, height: 0 },
  { id: 3, name: '城市屋顶', width: 15, length: 25, height: 6 },
])

// 装饰物品分类
const objectCategories = [
  {
    name: '家具',
    objects: [
      { type: 'round_table', name: '圆桌', icon: '⚪', price: 50, color: '#8B4513' },
      { type: 'square_table', name: '方桌', icon: '⬜', price: 45, color: '#8B4513' },
      { type: 'chair', name: '椅子', icon: '🪑', price: 15, color: '#654321' },
      { type: 'bar_counter', name: '吧台', icon: '🍷', price: 200, color: '#2F4F4F' },
    ]
  },
  {
    name: '灯光',
    objects: [
      { type: 'chandelier', name: '吊灯', icon: '💡', price: 150, color: '#FFD700' },
      { type: 'floor_lamp', name: '落地灯', icon: '🕯️', price: 80, color: '#FFA500' },
      { type: 'string_lights', name: '串灯', icon: '✨', price: 30, color: '#FFFACD' },
      { type: 'led_panel', name: 'LED面板', icon: '🔲', price: 100, color: '#00CED1' },
    ]
  },
  {
    name: '花艺',
    objects: [
      { type: 'centerpiece', name: '中心花艺', icon: '💐', price: 60, color: '#FF69B4' },
      { type: 'arch_flowers', name: '拱门花艺', icon: '🌸', price: 300, color: '#FFB6C1' },
      { type: 'wall_greenery', name: '墙面绿植', icon: '🌿', price: 120, color: '#228B22' },
      { type: 'floor_plants', name: '地面花艺', icon: '🪴', price: 80, color: '#32CD32' },
    ]
  },
  {
    name: '舞台',
    objects: [
      { type: 'main_stage', name: '主舞台', icon: '🎪', price: 500, color: '#4B0082' },
      { type: 'backdrop', name: '背景板', icon: '🖼️', price: 250, color: '#9370DB' },
      { type: 'signin_board', name: '签到台', icon: '✍️', price: 100, color: '#DDA0DD' },
      { type: 'dessert_table', name: '甜品台', icon: '🍰', price: 150, color: '#FFB6C1' },
    ]
  }
]

// 计算总费用
const totalCost = computed(() => {
  return sceneObjects.value.reduce((sum, obj) => sum + (obj.price || 0), 0)
})

// 初始化 Three.js 场景
const initScene = () => {
  if (!canvas.value) return

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x1a1a2e)

  camera = new THREE.PerspectiveCamera(
    75,
    sceneContainer.value.clientWidth / sceneContainer.value.clientHeight,
    0.1,
    1000
  )
  camera.position.set(0, 20, 30)

  renderer = new THREE.WebGLRenderer({ canvas: canvas.value, antialias: true })
  renderer.setSize(sceneContainer.value.clientWidth, sceneContainer.value.clientHeight)
  renderer.shadowMap.enabled = true

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.maxPolarAngle = Math.PI / 2

  // 灯光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(10, 20, 10)
  directionalLight.castShadow = true
  scene.add(directionalLight)

  // 网格
  const gridHelper = new THREE.GridHelper(100, 100, 0x444444, 0x222222)
  scene.add(gridHelper)

  // 地面
  const floorGeometry = new THREE.PlaneGeometry(100, 100)
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x2a2a3e })
  const floor = new THREE.Mesh(floorGeometry, floorMaterial)
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  scene.add(floor)

  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()

  animate()
}

const animate = () => {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}

// 添加物体
const addObject = (objData) => {
  if (!scene) return

  const geometry = new THREE.BoxGeometry(2, 2, 2)
  const material = new THREE.MeshStandardMaterial({ color: objData.color })
  const mesh = new THREE.Mesh(geometry, material)
  
  mesh.position.set(
    (Math.random() - 0.5) * 20,
    1,
    (Math.random() - 0.5) * 20
  )
  mesh.castShadow = true
  mesh.receiveShadow = true
  
  mesh.userData = { ...objData, id: Date.now() }
  scene.add(mesh)
  
  sceneObjects.value.push({
    id: mesh.userData.id,
    name: objData.name,
    type: objData.type,
    price: objData.price,
    mesh: mesh,
    position: { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z },
    rotation: 0,
    scale: 1
  })

  ElMessage.success(`已添加 ${objData.name}`)
}

// 拖拽开始
const handleDragStart = (event, obj) => {
  event.dataTransfer.setData('object', JSON.stringify(obj))
}

// 删除物体
const removeObject = () => {
  if (!selectedObject.value) return
  
  const index = sceneObjects.value.findIndex(o => o.id === selectedObject.value.id)
  if (index > -1) {
    scene.remove(sceneObjects.value[index].mesh)
    sceneObjects.value.splice(index, 1)
    selectedObject.value = null
    ElMessage.success('已删除')
  }
}

// 清空场景
const clearScene = () => {
  sceneObjects.value.forEach(obj => {
    scene.remove(obj.mesh)
  })
  sceneObjects.value = []
  selectedObject.value = null
  ElMessage.success('场景已清空')
}

// 重置相机
const resetCamera = () => {
  camera.position.set(0, 20, 30)
  controls.reset()
}

// 切换网格
const toggleGrid = () => {
  // 实现网格显示/隐藏
}

// 保存设计
const saveDesign = async () => {
  saving.value = true
  try {
    // 调用 API 保存设计
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('设计已保存')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  initScene()
})

onUnmounted(() => {
  if (renderer) renderer.dispose()
})
</script>

<style scoped>
.designer-page {
  height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  background: #0f0f23;
}

.designer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #1a1a2e;
  border-bottom: 1px solid #2d2d44;
}

.designer-header h1 {
  margin: 0;
  color: #fff;
  font-size: 20px;
}

.header-actions {
  display: flex;
  align-items: center;
}

.designer-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.objects-panel {
  width: 280px;
  background: #1a1a2e;
  border-right: 1px solid #2d2d44;
  padding: 16px;
  overflow-y: auto;
}

.objects-panel h3 {
  color: #fff;
  margin-bottom: 20px;
  font-size: 16px;
}

.category {
  margin-bottom: 24px;
}

.category h4 {
  color: #a0a0b0;
  font-size: 12px;
  text-transform: uppercase;
  margin-bottom: 12px;
  letter-spacing: 1px;
}

.object-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.object-item {
  background: #252538;
  border-radius: 8px;
  padding: 12px 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid transparent;
}

.object-item:hover {
  background: #303050;
  border-color: #409EFF;
}

.object-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.object-name {
  color: #fff;
  font-size: 12px;
  margin-bottom: 4px;
}

.object-price {
  color: #67c23a;
  font-size: 11px;
}

.budget-section {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #2d2d44;
}

.budget-section h4 {
  color: #a0a0b0;
  font-size: 12px;
  margin-bottom: 12px;
}

.budget-item {
  display: flex;
  justify-content: space-between;
  color: #fff;
  margin-bottom: 8px;
  font-size: 14px;
}

.budget-item .price {
  color: #67c23a;
  font-weight: bold;
}

.scene-container {
  flex: 1;
  position: relative;
  background: #0f0f23;
}

.venue-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;
}

.venue-placeholder .el-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.scene-canvas {
  width: 100%;
  height: 100%;
}

.scene-controls {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
}

.properties-panel {
  width: 280px;
  background: #1a1a2e;
  border-left: 1px solid #2d2d44;
  padding: 16px;
  overflow-y: auto;
}

.properties-panel h3 {
  color: #fff;
  margin-bottom: 20px;
  font-size: 16px;
}

.properties-panel.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}

:deep(.el-form-item__label) {
  color: #a0a0b0;
}

:deep(.el-input__wrapper),
:deep(.el-slider__runway) {
  background: #252538;
}
</style>
