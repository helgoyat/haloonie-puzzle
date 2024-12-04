<script setup lang="ts">
import type { PropType } from "vue";
import type { IBlock } from "@/types";

defineProps({
  block: { type: Object as PropType<IBlock>, required: true },
});
</script>

<template>
  <div
    class="w-10 h-10 rounded shadow-lg"
    :style="{
      backgroundColor: block.backgroundColor,
    }"
  ></div>
</template>
