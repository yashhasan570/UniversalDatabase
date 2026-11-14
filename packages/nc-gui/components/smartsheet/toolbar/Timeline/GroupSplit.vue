<script lang="ts" setup>
import type { ColumnType } from 'universaldatabase-sdk'

defineProps<{ column: ColumnType; disabled?: boolean }>()
</script>

<template>
  <NcSpanHidden />
</template>
