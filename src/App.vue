<script setup lang="ts">
import { ref, computed } from "vue";
import { type IBlock, type IPosition, BaseEnum } from "@/types";
import { DataBlockList } from "@/data";
import { getPositions, solvePuzzle } from "@/utils";
import CanvaSpot from "@/components/CanvaSpot.vue";
import CanvaBlock from "@/components/CanvaBlock.vue";

const CURSOR_STEP = 50;
const BLOCK_STEP = 48;

const length = ref<number>(11);
const height = ref<number>(5);
const blockList = ref<IBlock[]>([...DataBlockList]);
const selectedBlockId = ref<number | null>(null);
const selectedBlockPositionList = ref<IPosition[]>([]);
const solutions = ref<Array<number[]>>([]);
const viewSolutionIndex = ref<number>(0);

const dragging = ref(false);
const cursor = ref<{ x: number; y: number } | null>(null);

const diff_up = ref(0);
const diff_right = ref(0);
const diff_down = ref(0);
const diff_left = ref(0);

const _base = ref<number[]>([
  2, 4, 4, 4, 4, 11, 11, 11, 9, 9, 9, 2, 2, 0, 4, 0, 0, 0, 11, 9, 12, 9, 2, 0,
  0, 0, 0, 0, 0, 11, 8, 12, 12, 0, 0, 0, 0, 0, 0, 0, 8, 8, 7, 7, 0, 0, 0, 0, 0,
  0, 0, 8, 7, 7, 7,
]);
const base = computed(() => new Array(length.value * height.value).fill(0));

function handleSelectBlock(id: number) {
  const block = blockList.value.find((b) => b.id === id);
  if (!block) return;

  if (selectedBlockId.value === id) {
    selectedBlockId.value = null;
    selectedBlockPositionList.value = [];
    return;
  }
  selectedBlockId.value = id;
  const result = getPositions(block);
  selectedBlockPositionList.value = [...result];
}

function viewNextSolution() {
  viewSolutionIndex.value = viewSolutionIndex.value + 1;
  if (viewSolutionIndex.value === solutions.value.length) {
    viewSolutionIndex.value = 0;
  }
}

function solve() {
  viewSolutionIndex.value = 0;
  const templateBlockIdList = [...new Set(_base.value)].filter((e) => e !== 0);
  const _blockList: IBlock[] = blockList.value.filter(
    (b) => !templateBlockIdList.includes(b.id),
  );

  const result = solvePuzzle(
    { base: _base.value, x: length.value, y: height.value },
    _blockList,
  );
  solutions.value = result;
}

function handlePositionSelect(event: Event, index: number): void {
  const node = document.getElementById(index.toString());
  if (!node) return;
  const clone = node.cloneNode(true);

  const container = document.createElement("div");
  container.appendChild(clone);
  container.id = "cloned-position";
  container.style.position = "absolute";
  container.style.top = "10px";
  container.style.left = "10px";

  container.firstElementChild?.classList.remove("position");
  container.firstElementChild?.classList.add("clone");

  container.addEventListener("pointerdown", handleDragStart);
  container.addEventListener("pointermove", handleDragging);
  window.addEventListener("pointerup", handleDragEnd);

  const canva = document.getElementById("canva");
  if (!canva) return;
  canva.appendChild(container);
  window.scrollTo(0, 0);
}

function handleDragStart(event: PointerEvent) {
  dragging.value = true;
  const { clientX, clientY } = event;
  cursor.value = { x: clientX, y: clientY };
}

function handleDragging(event: PointerEvent) {
  const canva = document.getElementById("canva");
  const clonedPosition = document.getElementById("cloned-position");
  if (!clonedPosition || !canva) return;
  const { left: canva_left, top: canva_top } = canva.getBoundingClientRect();
  const { left, top } = clonedPosition.getBoundingClientRect();

  if (!dragging.value || !cursor.value) return;
  const { clientX, clientY } = event;

  if (clientX > cursor.value.x) {
    diff_right.value += Math.round(clientX - cursor.value.x);
    if (diff_right.value >= CURSOR_STEP) {
      clonedPosition.style.left = left - canva_left + BLOCK_STEP + "px";
      diff_right.value = 0;
    }
  }
  if (clientX < cursor.value.x) {
    diff_left.value += Math.round(cursor.value.x - clientX);
    if (diff_left.value >= CURSOR_STEP) {
      clonedPosition.style.left = left - canva_left - BLOCK_STEP + "px";
      diff_left.value = 0;
    }
  }
  if (clientY > cursor.value.y) {
    diff_down.value += Math.round(clientY - cursor.value.y);
    if (diff_down.value >= CURSOR_STEP) {
      clonedPosition.style.top = top - canva_top + BLOCK_STEP + "px";
      diff_down.value = 0;
    }
  }
  if (clientY < cursor.value.y) {
    diff_up.value += Math.round(cursor.value.y - clientY);
    if (diff_up.value >= CURSOR_STEP) {
      clonedPosition.style.top = top - canva_top - BLOCK_STEP + "px";
      diff_up.value = 0;
    }
  }

  cursor.value = { x: clientX, y: clientY };
}

function handleDragEnd() {
  dragging.value = false;
  cursor.value = null;
  diff_up.value = 0;
  diff_right.value = 0;
  diff_down.value = 0;
  diff_left.value = 0;
}
</script>

<template>
  <main class="flex flex-col justify-center items-center gap-4">
    <div class="flex flex-col justify-center items-center h-screen gap-6">
      <div
        id="canva"
        class="relative p-4 outline-dashed outline-4 outline-gray-900 rounded bg-gray-700 grid gap-2"
        :style="`grid-template-columns: repeat(${length}, minmax(0, 1fr))`"
      >
        <template v-if="!solutions.length">
          <component
            v-for="value in base"
            :is="value === 0 ? CanvaSpot : CanvaBlock"
            :block="blockList.find((b) => b.id === value)"
          ></component>
        </template>
        <template v-else>
          <component
            v-for="value in solutions[viewSolutionIndex]"
            :is="value === 0 ? CanvaSpot : CanvaBlock"
            :block="blockList.find((b) => b.id === value)"
          ></component>
        </template>
      </div>
      <div class="flex flex-row gap-2">
        <button class="w-24" @click="solve">Solve</button>
        <button v-if="solutions.length" class="w-24" @click="viewNextSolution">
          Next
        </button>
      </div>
    </div>
    <!-- Puzzle Blocks -->
    <div class="w-full bg-gray-700 p-12 text-white flex flex-col gap-8">
      <div class="text-xl">Puzzle Blocks</div>
      <div class="flex flex-row items-start flex-wrap gap-6">
        <div
          v-for="block in blockList"
          class="p-3 grid gap-2 w-fit hover:cursor-pointer hover:outline outline-gray-500 outline-2 hover:bg-gray-800 rounded"
          :class="selectedBlockId === block.id && 'bg-gray-800'"
          :style="`grid-template-columns: repeat(${block.x}, minmax(0, 1fr))`"
          @click="handleSelectBlock(block.id)"
        >
          <template v-for="el in block.base">
            <div
              class="w-10 h-10"
              :class="el === BaseEnum.ENTITY && 'rounded shadow-lg'"
              :style="{
                backgroundColor:
                  el === BaseEnum.ENTITY
                    ? block.backgroundColor
                    : 'transparent',
              }"
            ></div>
          </template>
        </div>
      </div>
      <!-- Positions -->
      <template
        v-if="selectedBlockId !== null && selectedBlockPositionList.length"
      >
        <div class="text-xl">Positions</div>
        <div class="flex flex-row items-start flex-wrap gap-6">
          <div
            v-for="(position, index) in selectedBlockPositionList"
            :id="index.toString()"
            class="p-3 grid gap-2 w-fit rounded position"
            :style="`grid-template-columns: repeat(${position.x}, minmax(0, 1fr))`"
            @click="handlePositionSelect($event, index)"
          >
            <template v-for="el in position.base">
              <div
                class="w-10 h-10"
                :class="
                  el === BaseEnum.ENTITY
                    ? 'rounded shadow-lg bg-gray-950'
                    : 'bg-transparent'
                "
              ></div>
            </template>
          </div>
        </div>
      </template>
    </div>
  </main>
</template>

<style lang="css">
.position {
  @apply hover:cursor-pointer hover:outline outline-gray-500 outline-2 hover:bg-gray-600;
}
.clone {
  @apply p-[6px] rounded outline-dashed outline-white outline-[3px] hover:cursor-grab hover:outline-rose-600;
}
</style>
