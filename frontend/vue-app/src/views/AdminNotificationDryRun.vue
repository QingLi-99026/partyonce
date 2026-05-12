<template>
  <main class="dry-run-page">
    <header class="page-hero">
      <div>
        <p class="eyebrow">Notification dry-run</p>
        <h1>Webhook / n8n / Message Payload Lab</h1>
        <p>Design payloads, templates, trigger conditions, and evidence without sending anything externally.</p>
      </div>
      <el-tag type="warning" effect="plain" size="large">dispatch blocked</el-tag>
    </header>

    <el-alert
      class="scope-alert"
      type="warning"
      :closable="false"
      show-icon
      title="Dry-run only: no webhook, no n8n workflow, no email, no SMS, no WhatsApp, no production dispatch."
    />

    <section class="content-grid">
      <article class="panel">
        <h2>Trigger Catalog</h2>
        <el-radio-group v-model="selectedTriggerId" class="trigger-list">
          <el-radio-button v-for="trigger in notificationTriggers" :key="trigger.id" :label="trigger.id">
            {{ trigger.label }}
          </el-radio-button>
        </el-radio-group>
        <dl class="detail-list">
          <div><dt>Condition</dt><dd>{{ selectedTrigger.condition }}</dd></div>
          <div><dt>Audience</dt><dd>{{ selectedTrigger.audience }}</dd></div>
          <div><dt>Channel plan</dt><dd>{{ selectedTrigger.channel }}</dd></div>
          <div><dt>Template</dt><dd>{{ selectedTrigger.template }}</dd></div>
        </dl>
        <div class="actions">
          <el-button type="primary" @click="runDryRun">Generate Dry-Run Evidence</el-button>
          <el-button @click="clearEvidence">Clear Local Evidence</el-button>
        </div>
      </article>

      <article class="panel">
        <h2>Payload Preview</h2>
        <pre>{{ previewPayload }}</pre>
      </article>
    </section>

    <section class="panel">
      <h2>Dry-Run Evidence</h2>
      <el-empty v-if="evidence.length === 0" description="No dry-run evidence yet" />
      <el-table v-else :data="evidence" stripe>
        <el-table-column prop="event_type" label="Event" min-width="190" />
        <el-table-column prop="channel" label="Channel" width="140" />
        <el-table-column prop="audience" label="Audience" width="130" />
        <el-table-column prop="rendered_message" label="Rendered message" min-width="320" />
        <el-table-column prop="created_at" label="Created" width="210" />
      </el-table>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  buildDryRunPayload,
  clearNotificationDryRunEvidence,
  listNotificationDryRunEvidence,
  notificationTriggers,
  runNotificationDryRun
} from '@/services/notificationDryRunService'

const selectedTriggerId = ref(notificationTriggers[0].id)
const evidence = ref([])

const selectedTrigger = computed(() => {
  return notificationTriggers.find((trigger) => trigger.id === selectedTriggerId.value) || notificationTriggers[0]
})

const previewPayload = computed(() => {
  return JSON.stringify(buildDryRunPayload(selectedTriggerId.value), null, 2)
})

const refreshEvidence = () => {
  evidence.value = listNotificationDryRunEvidence()
}

const runDryRun = () => {
  runNotificationDryRun(selectedTriggerId.value)
  refreshEvidence()
  ElMessage.success('Dry-run payload recorded locally. No external dispatch occurred.')
}

const clearEvidence = () => {
  evidence.value = clearNotificationDryRunEvidence()
  ElMessage.info('Local dry-run evidence cleared.')
}

onMounted(refreshEvidence)
</script>

<style scoped>
.dry-run-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 96px 24px 56px;
}

.page-hero {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-start;
  margin-bottom: 18px;
}

.eyebrow {
  margin: 0 0 8px;
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
}

h1,
h2 {
  margin: 0 0 8px;
  color: #0f172a;
}

.page-hero p,
dt {
  color: #64748b;
}

.scope-alert,
.content-grid,
.panel {
  margin-bottom: 18px;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(320px, 1.1fr);
  gap: 16px;
}

.panel {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  padding: 18px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.trigger-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.detail-list {
  display: grid;
  gap: 12px;
  margin: 0;
}

dd {
  margin: 4px 0 0;
  color: #0f172a;
  font-weight: 650;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
  flex-wrap: wrap;
}

pre {
  max-height: 520px;
  overflow: auto;
  border-radius: 8px;
  background: #0f172a;
  color: #e2e8f0;
  padding: 14px;
  font-size: 12px;
  line-height: 1.55;
}

@media (max-width: 860px) {
  .page-hero,
  .content-grid {
    display: block;
  }
}
</style>
