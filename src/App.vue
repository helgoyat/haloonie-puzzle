<script setup lang="ts">
import { ref } from "vue";
import { type IBlock, type IPosition, BaseEnum } from "@/types";
import { DataBlockList } from "@/data";
import { getBlockPositionList, solvePuzzle } from "@/utils";
import CanvaSpot from "@/components/CanvaSpot.vue";
import CanvaBlock from "@/components/CanvaBlock.vue";

const length = ref<number>(11);
const height = ref<number>(5);
const blockList = ref<IBlock[]>([...DataBlockList]);
const selectedBlock = ref<number | null>(null);
const blockPositionList = ref<IPosition[]>([]);
const solutions = ref<Array<number[]>>([]);
const selectedSolution = ref<number>(0);

function handleSelectBlock(index: number) {
  const block = blockList.value[index];
  if (!block) return;

  if (selectedBlock.value === index) {
    selectedBlock.value = null;
    blockPositionList.value = [];
    return;
  }
  selectedBlock.value = index;
  const result = getBlockPositionList(block);
  blockPositionList.value = [...result];
}

function solve() {
  selectedSolution.value = 0;

  const _blockList: Record<number, IPosition[]> = {};
  blockList.value.forEach((b, i) => {
    _blockList[i + 1] = getBlockPositionList(b);
  });

  solutions.value = solvePuzzle(length.value, height.value, _blockList);
}

function nextSolution() {
  selectedSolution.value = selectedSolution.value + 1;
  if (selectedSolution.value === solutions.value.length - 1) {
    selectedSolution.value = 0;
  }
}
</script>

<template>
  <main class="flex flex-col justify-center items-center gap-4">
    <div class="flex flex-col justify-center items-center h-screen gap-6">
      <div
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
            v-for="block in solutions[selectedSolution]"
            :is="block === 0 ? CanvaSpot : CanvaBlock"
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
