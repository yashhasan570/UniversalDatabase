<script lang="ts" setup>
import type { ViewSettingOverrideOptions, ViewType } from 'universaldatabase-sdk'

interface Props {
  modelValue?: boolean
  defaultSelectedCopyViewConfigTypes?: ViewSettingOverrideOptions[]
  destView: ViewType
}
defineProps<Props>()
</script>

<template>
  <NcSpanHidden />
</template>
