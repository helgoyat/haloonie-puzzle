<script setup lang="ts">
import { ref } from "vue";
import { type IBlock, type IPosition, BaseEnum } from "@/types";
import { DataBlockList } from "@/data";
import { getPositions, solvePuzzle } from "@/utils";
import CanvaSpot from "@/components/CanvaSpot.vue";
import CanvaBlock from "@/components/CanvaBlock.vue";

const length = ref<number>(3);
const height = ref<number>(4);
const blockList = ref<IBlock[]>([...DataBlockList]);
const selectedBlock = ref<number | null>(null);
const blockPositionList = ref<IPosition[]>([]);
const solutions = ref<Array<number[]>>([]);
const selectedSolutionIndex = ref<number>(0);
const loading = ref<boolean>(false);

function handleSelectBlock(index: number) {
  const block = blockList.value[index];
  if (!block) return;

  if (selectedBlock.value === index) {
    selectedBlock.value = null;
    blockPositionList.value = [];
    return;
  }
  selectedBlock.value = index;
  const result = getPositions(block);
  blockPositionList.value = [...result];
}

function solve() {
  selectedSolutionIndex.value = 0;
  loading.value = true;

  const result = solvePuzzle(length.value, height.value, blockList.value);
  solutions.value = result;

  loading.value = false;
}

function nextSolution() {
  selectedSolutionIndex.value = selectedSolutionIndex.value + 1;
  if (selectedSolutionIndex.value === solutions.value.length) {
    selectedSolutionIndex.value = 0;
  }
}
</script>

<template>
  <main class="flex flex-col justify-center items-center gap-4">
    <div class="flex flex-col justify-center items-center h-screen gap-6">
      <div
        v-if="!loading"
        class="p-4 outline-dashed outline-4 outline-gray-900 rounded bg-gray-700 grid gap-2"
        :style="`grid-template-columns: repeat(${length}, minmax(0, 1fr))`"
      >
        <template v-if="!solutions.length">
          <component
            v-for="(block, index) in length * height"
            :is="CanvaSpot"
          ></component>
        </template>
        <template v-else>
          <component
            v-for="value in solutions[selectedSolutionIndex]"
            :is="value === 0 ? CanvaSpot : CanvaBlock"
            :block="blockList[value - 1]"
          ></component>
        </template>
      </div>
      <div class="flex flex-row gap-2">
        <button class="w-28" @click="solve">Solve</button>
        <button class="w-28" @click="nextSolution">Next</button>
      </div>
    </div>
    <div class="w-full bg-gray-700 p-12 text-white flex flex-col gap-8">
      <div class="text-xl">Puzzle Blocks</div>
      <div class="flex flex-row items-start flex-wrap gap-6">
        <div
          v-for="(block, index) in blockList"
          class="p-3 grid gap-2 w-fit hover:cursor-pointer hover:outline outline-gray-600 outline-2 hover:bg-gray-800 rounded"
          :class="selectedBlock === index && 'bg-gray-800'"
          :style="`grid-template-columns: repeat(${block.x}, minmax(0, 1fr))`"
          @click="handleSelectBlock(index)"
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
      <template v-if="selectedBlock !== null && blockPositionList.length">
        <div class="text-xl">Positions</div>
        <div class="flex flex-row items-start flex-wrap gap-6">
          <div
            v-for="block in blockPositionList"
            class="p-3 grid gap-2 w-fit"
            :style="`grid-template-columns: repeat(${block.x}, minmax(0, 1fr))`"
          >
            <template v-for="el in block.base">
              <div
                v-if="el === BaseEnum.ENTITY"
                class="w-8 h-8 outline outline-2 rounded-sm bg-gray-800 outline-gray-900"
              ></div>
              <div
                v-if="el === BaseEnum.NONE"
                class="bg-transparent w-8 h-8"
              ></div>
            </template>
          </div>
        </div>
      </template>
    </div>
  </main>
</template>
