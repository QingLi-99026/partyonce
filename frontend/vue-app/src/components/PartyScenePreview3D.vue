<template>
  <section class="party-scene-preview" :style="sceneStyle" aria-label="Experimental Party Scene 3D Preview">
    <div class="scene-toolbar">
      <div>
        <p class="eyebrow">Restaurant A · party_scene_config</p>
        <h2>{{ model.config.themeLabel }} {{ model.config.packageTierLabel }} preview</h2>
      </div>
      <div class="density-pill">{{ model.density.density }} decor density</div>
    </div>

    <div class="room-stage">
      <div class="back-wall">
        <div class="backdrop">{{ model.config.decor.backdropStyle }}</div>
        <div class="photo-zone">Photo zone</div>
      </div>

      <div class="entrance-arch">
        <span v-for="balloon in model.balloons" :key="balloon.id"></span>
      </div>

      <div class="table-grid" aria-label="10 tables">
        <div
          v-for="(table, index) in model.tables"
          :key="table.id"
          class="table-block"
          :class="{ main: index === 4 }"
        >
          <span>{{ index === 4 ? 'Main' : index + 1 }}</span>
        </div>
      </div>

      <div class="chair-ring" aria-label="18 chairs">
        <span
          v-for="(chair, index) in model.chairs"
          :key="chair.id"
          class="chair-dot"
          :style="chairStyle(index)"
        ></span>
      </div>

      <div class="dessert-table">Dessert table</div>
      <div class="photo-platform">Photo corner</div>
      <div class="kids-zone">Kids activity zone</div>

      <div class="scene-props" aria-label="theme props">
        <span v-for="prop in model.props" :key="prop.id"></span>
      </div>
    </div>

    <div class="scene-legend">
      <div>
        <strong>Layout</strong>
        <span>10 tables · 18 chairs · dessert {{ model.config.layout.dessertTable }} · photo {{ model.config.layout.photoZone }}</span>
      </div>
      <div>
        <strong>Decor</strong>
        <span>{{ model.config.decor.tablecloth }} / {{ model.config.decor.balloons }} / {{ model.config.decor.lighting }}</span>
      </div>
      <div>
        <strong>Theme props</strong>
        <span>{{ model.theme.prop }}</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { buildPartyScenePreviewModel } from '@/services/partyScenePreviewService';

const props = defineProps({
  sceneConfig: {
    type: Object,
    required: true
  }
});

const model = computed(() => buildPartyScenePreviewModel(props.sceneConfig));

const sceneStyle = computed(() => ({
  '--scene-floor': model.value.theme.floor,
  '--scene-wall': model.value.theme.wall,
  '--scene-primary': model.value.theme.primary,
  '--scene-secondary': model.value.theme.secondary,
  '--scene-accent': model.value.theme.accent,
  '--scene-light': model.value.theme.light
}));

const chairStyle = (index) => {
  const positions = [
    [16, 32], [20, 43], [18, 55], [29, 28], [32, 40], [31, 55],
    [45, 31], [48, 43], [47, 57], [61, 29], [64, 41], [63, 55],
    [75, 33], [78, 45], [76, 58], [39, 67], [53, 69], [67, 67]
  ];
  const [left, top] = positions[index] || [50, 50];
  return {
    left: `${left}%`,
    top: `${top}%`
  };
};
</script>

<style scoped>
.party-scene-preview {
  width: 100%;
  min-height: 620px;
  color: #1f2633;
}

.scene-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-end;
  margin-bottom: 18px;
}

.eyebrow {
  margin: 0 0 6px;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #667085;
  font-weight: 700;
}

h2 {
  margin: 0;
  font-size: 1.8rem;
}

.density-pill {
  border: 1px solid color-mix(in srgb, var(--scene-primary) 50%, white);
  color: #263342;
  background: color-mix(in srgb, var(--scene-light) 55%, white);
  padding: 10px 14px;
  border-radius: 999px;
  font-weight: 800;
  white-space: nowrap;
}

.room-stage {
  position: relative;
  min-height: 500px;
  overflow: hidden;
  border: 1px solid rgba(31, 38, 51, 0.12);
  background:
    linear-gradient(155deg, color-mix(in srgb, var(--scene-wall) 80%, white), transparent 38%),
    linear-gradient(25deg, rgba(255,255,255,0.84), transparent 34%),
    var(--scene-floor);
  transform-style: preserve-3d;
  perspective: 1100px;
}

.room-stage::before {
  content: '';
  position: absolute;
  inset: 12% 8% 8%;
  border: 2px solid rgba(31, 38, 51, 0.14);
  transform: rotateX(58deg) rotateZ(-8deg);
  background:
    repeating-linear-gradient(90deg, rgba(255,255,255,0.18), rgba(255,255,255,0.18) 1px, transparent 1px, transparent 38px),
    rgba(255,255,255,0.18);
  box-shadow: 0 30px 70px rgba(16, 24, 40, 0.16);
}

.back-wall {
  position: absolute;
  left: 12%;
  right: 12%;
  top: 7%;
  height: 22%;
  background: linear-gradient(120deg, var(--scene-wall), color-mix(in srgb, var(--scene-secondary) 24%, white));
  border: 1px solid rgba(31, 38, 51, 0.12);
  box-shadow: 0 12px 24px rgba(16, 24, 40, 0.12);
}

.backdrop {
  position: absolute;
  left: 36%;
  top: 18%;
  width: 28%;
  min-height: 48%;
  display: grid;
  place-items: center;
  text-align: center;
  padding: 8px;
  background: color-mix(in srgb, var(--scene-primary) 72%, white);
  color: #fff;
  border-radius: 8px 8px 2px 2px;
  font-size: 0.78rem;
  font-weight: 800;
}

.photo-zone {
  position: absolute;
  left: 8%;
  bottom: 12%;
  width: 20%;
  height: 42%;
  display: grid;
  place-items: center;
  background: rgba(255,255,255,0.72);
  border: 1px dashed var(--scene-accent);
  color: #344054;
  font-size: 0.78rem;
  font-weight: 800;
}

.entrance-arch {
  position: absolute;
  left: 8%;
  bottom: 13%;
  width: 19%;
  height: 31%;
  border-top: 9px solid var(--scene-primary);
  border-left: 9px solid var(--scene-primary);
  border-right: 9px solid var(--scene-secondary);
  border-radius: 80px 80px 0 0;
  transform: skewY(-5deg);
}

.entrance-arch span {
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: var(--scene-accent);
  box-shadow: 0 0 14px color-mix(in srgb, var(--scene-accent) 70%, white);
}

.entrance-arch span:nth-child(3n + 1) { left: 6%; top: 12%; }
.entrance-arch span:nth-child(3n + 2) { right: 4%; top: 26%; background: var(--scene-secondary); }
.entrance-arch span:nth-child(3n) { left: 45%; top: 1%; background: var(--scene-light); }

.table-grid {
  position: absolute;
  left: 23%;
  right: 20%;
  top: 37%;
  display: grid;
  grid-template-columns: repeat(5, minmax(54px, 1fr));
  gap: 24px 18px;
  transform: rotateX(54deg) rotateZ(-7deg);
}

.table-block {
  height: 50px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, color-mix(in srgb, var(--scene-primary) 45%, white), white);
  border: 2px solid color-mix(in srgb, var(--scene-accent) 48%, white);
  box-shadow: 0 12px 18px rgba(16, 24, 40, 0.16);
  color: #25304a;
  font-weight: 800;
  font-size: 0.74rem;
}

.table-block.main {
  background: linear-gradient(135deg, var(--scene-primary), var(--scene-accent));
  color: #fff;
}

.chair-ring {
  position: absolute;
  inset: 0;
}

.chair-dot {
  position: absolute;
  width: 14px;
  height: 14px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--scene-secondary) 72%, white);
  border: 2px solid rgba(255,255,255,0.72);
  box-shadow: 0 5px 12px rgba(16, 24, 40, 0.16);
}

.dessert-table {
  position: absolute;
  right: 10%;
  top: 39%;
  width: 15%;
  height: 19%;
  display: grid;
  place-items: center;
  text-align: center;
  background: linear-gradient(135deg, white, color-mix(in srgb, var(--scene-light) 70%, white));
  border: 2px solid var(--scene-accent);
  color: #25304a;
  font-weight: 900;
  transform: rotateX(50deg) rotateZ(-7deg);
}

.photo-platform,
.kids-zone {
  position: absolute;
  display: grid;
  place-items: center;
  text-align: center;
  font-size: 0.76rem;
  font-weight: 900;
  color: #25304a;
  border: 1px solid rgba(31, 38, 51, 0.16);
  background: rgba(255,255,255,0.7);
}

.photo-platform {
  left: 10%;
  top: 30%;
  width: 18%;
  height: 13%;
}

.kids-zone {
  left: 38%;
  bottom: 10%;
  width: 25%;
  height: 13%;
}

.scene-props {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.scene-props span {
  position: absolute;
  width: 20px;
  height: 20px;
  transform: rotate(45deg);
  background: var(--scene-accent);
  opacity: 0.78;
}

.scene-props span:nth-child(4n + 1) { left: 16%; top: 24%; }
.scene-props span:nth-child(4n + 2) { left: 72%; top: 31%; background: var(--scene-primary); }
.scene-props span:nth-child(4n + 3) { left: 84%; top: 63%; background: var(--scene-light); }
.scene-props span:nth-child(4n) { left: 33%; top: 74%; background: var(--scene-secondary); }

.scene-legend {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.scene-legend div {
  padding: 12px;
  border: 1px solid rgba(31, 38, 51, 0.1);
  background: #fff;
}

.scene-legend strong,
.scene-legend span {
  display: block;
}

.scene-legend strong {
  margin-bottom: 4px;
}

.scene-legend span {
  color: #667085;
  line-height: 1.45;
}

@media (max-width: 760px) {
  .party-scene-preview {
    min-height: auto;
  }

  .scene-toolbar,
  .scene-legend {
    grid-template-columns: 1fr;
    display: grid;
  }

  .room-stage {
    min-height: 430px;
  }

  .table-grid {
    left: 20%;
    right: 15%;
    grid-template-columns: repeat(2, minmax(54px, 1fr));
    gap: 14px;
  }

  .dessert-table {
    right: 5%;
    width: 20%;
  }
}
</style>
