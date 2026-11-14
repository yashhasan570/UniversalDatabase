<script lang="ts" setup>
import type { ViewSettingOverrideOptions, ViewType } from 'universaldatabase-sdk'

interface Props {
  view: ViewType
  defaultOptions?: ViewSettingOverrideOptions[]
}

defineProps<Props>()
</script>

<template>
  <NcSpanHidden />
</template>
