<script setup lang="ts">
import type { PropType } from "vue";
import type { IBlock } from "@/types";

defineProps({
  block: { type: Object as PropType<IBlock>, required: true },
});
</script>

<template>
  <div
    class="w-8 h-8 outline outline-2 rounded-sm"
    :style="{
      backgroundColor: block.backgroundColor,
      outlineColor: block.outlineColor,
    }"
  ></div>
</template>
