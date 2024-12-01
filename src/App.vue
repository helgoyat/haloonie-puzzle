<script setup lang="ts">
import { ref } from "vue";
import CanvaSpot from "@/components/CanvaSpot.vue";

const length = ref<number>(6);
const width = ref<number>(6);
</script>

<template>
  <main class="h-screen flex flex-col justify-center items-center gap-4">
    <div
      class="p-4 outline-dashed outline-4 outline-gray-900 rounded bg-gray-700 grid gap-4"
      :style="`grid-template-columns: repeat(${6}, minmax(0, 1fr))`"
    >
      <template v-for="(block, index) in length * width">
        <component :is="CanvaSpot"></component>
      </template>
    </div>
  </main>
</template>
