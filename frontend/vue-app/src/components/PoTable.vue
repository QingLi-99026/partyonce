<template>
  <div class="po-table-wrapper">
    <table class="po-table">
      <thead>
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            :class="{ 'po-table__th--sortable': col.sortable }"
            :style="col.width ? { width: col.width } : {}"
            @click="col.sortable && $emit('sort', col.key)"
          >
            {{ col.title }}
            <span v-if="col.sortable" class="po-table__sort"></span>
          </th>
        </tr>
      </thead>
      
      <tbody>
        <tr v-for="(row, index) in data" :key="rowKey ? row[rowKey] : index">
          <td v-for="col in columns" :key="col.key">
            <slot :name="col.key" :row="row" :value="row[col.key]">
              {{ row[col.key] }}
            </slot>
          </td>
        </tr>
        
        <tr v-if="data.length === 0">
          <td :colspan="columns.length" class="po-table__empty">
            <slot name="empty">{{ emptyText }}</slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  data: { type: Array, default: () => [] },
  columns: { type: Array, required: true },
  rowKey: String,
  emptyText: { type: String, default: '暂无数据' }
})

defineEmits(['sort'])
</script>

<style scoped>
.po-table-wrapper {
  overflow-x: auto;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
}

.po-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
  background: var(--bg-card);
}

.po-table thead {
  background: var(--gray-50);
}

.po-table th {
  padding: var(--space-4) var(--space-5);
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
  text-align: left;
  border-bottom: 1px solid var(--border-light);
  white-space: nowrap;
}

.po-table__th--sortable {
  cursor: pointer;
  user-select: none;
}

.po-table__th--sortable:hover {
  color: var(--text-primary);
  background: var(--gray-100);
}

.po-table__sort {
  display: inline-block;
  width: 0;
  height: 0;
  margin-left: var(--space-2);
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 4px solid var(--text-tertiary);
  vertical-align: middle;
}

.po-table td {
  padding: var(--space-4) var(--space-5);
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-light);
}

.po-table tbody tr:hover {
  background: var(--bg-hover);
}

.po-table tbody tr:last-child td {
  border-bottom: none;
}

.po-table__empty {
  text-align: center;
  color: var(--text-tertiary);
  padding: var(--space-12) !important;
}
</style>
