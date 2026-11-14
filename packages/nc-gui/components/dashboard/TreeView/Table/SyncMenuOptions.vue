<script lang="ts" setup>
import type { TableType } from 'universaldatabase-sdk'

defineProps<{
  baseId: string
  table: TableType
}>()

defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <NcSpanHidden />
</template>
