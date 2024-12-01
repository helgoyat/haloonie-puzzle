<script setup lang="ts">
import { ref } from "vue";
import { IBlock, BaseEnum } from "@/types";
import { DataBlockList } from "@/data";
import CanvaSpot from "@/components/CanvaSpot.vue";

const length = ref<number>(11);
const width = ref<number>(5);
const blockList = ref<IBlock[]>([...DataBlockList]);
</script>

<template>
  <main class="flex flex-col justify-center items-center gap-4">
    <div class="flex flex-col justify-center items-center h-screen">
      <div
        class="p-4 outline-dashed outline-4 outline-gray-900 rounded bg-gray-700 grid gap-2"
        :style="`grid-template-columns: repeat(${length}, minmax(0, 1fr))`"
      >
        <template v-for="(block, index) in length * width">
          <component :is="CanvaSpot"></component>
        </template>
      </div>
    </div>
    <div class="w-full bg-gray-700 p-12 text-white flex flex-col gap-6">
      <div>Puzzle Blocks</div>
      <div class="flex flex-row flex-wrap gap-8">
        <div v-for="block in blockList">
          <div
            class="grid gap-2 w-fit"
            :style="`grid-template-columns: repeat(${block.x}, minmax(0, 1fr))`"
          >
            <template v-for="(el, index) in block.base">
              <div
                v-if="el === BaseEnum.ENTITY"
                class="w-8 h-8 outline outline-2 rounded-sm"
                :style="{
                  backgroundColor: block.backgroundColor,
                  outlineColor: block.outlineColor,
                }"
              ></div>
              <div
                v-if="el === BaseEnum.NONE"
                class="bg-transparent w-8 h-8"
              ></div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
