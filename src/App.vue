<script setup lang="ts">
import { ref, computed } from "vue";
import { type IBlock, type IPosition, BaseEnum } from "@/types";
import { DataBlockList } from "@/data";
import { addTemplateBlock, getPositions, solvePuzzle } from "@/utils";
import CanvaSpot from "@/components/CanvaSpot.vue";
import CanvaBlock from "@/components/CanvaBlock.vue";

const BLOCK_STEP = 48;

const length = ref<number>(11);
const height = ref<number>(5);
const blockList = ref<IBlock[]>([...DataBlockList]);
const selectedBlockId = ref<number | null>(null);
const selectedBlockPositionList = ref<IPosition[]>([]);
const solutions = ref<Array<number[]>>([]);
const viewSolutionIndex = ref<number>(0);

const base = ref<number[]>(new Array(length.value * height.value).fill(0));

const dragging = ref(false);
const cursor = ref<{ x: number; y: number } | null>(null);
const cloneData = ref<{ blockId: number; positionIndex: number } | null>(null);

const diff_up = ref(0);
const diff_right = ref(0);
const diff_down = ref(0);
const diff_left = ref(0);

const _baseTemplate = ref<number[]>([
  2, 4, 4, 4, 4, 11, 11, 11, 9, 9, 9, 2, 2, 0, 4, 0, 0, 0, 11, 9, 12, 9, 2, 0,
  0, 0, 0, 0, 0, 11, 8, 12, 12, 0, 0, 0, 0, 0, 0, 0, 8, 8, 7, 7, 0, 0, 0, 0, 0,
  0, 0, 8, 7, 7, 7,
]);
const clonePosition = computed((): IPosition | null => {
  if (!cloneData.value) return null;
  return selectedBlockPositionList.value[cloneData.value.positionIndex] ?? null;
});

function handleSelectBlock(id: number) {
  if (cloneData.value) return;
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
  const templateBlockIdList = [...new Set(_baseTemplate.value)].filter(
    (e) => e !== 0,
  );
  const _blockList: IBlock[] = blockList.value.filter(
    (b) => !templateBlockIdList.includes(b.id),
  );

  const result = solvePuzzle(
    { base: _baseTemplate.value, x: length.value, y: height.value },
    _blockList,
  );
  solutions.value = result;
}

function handlePositionSelect(event: Event, index: number): void {
  if (!selectedBlockId.value || cloneData.value) return;
  const node = document.getElementById(index.toString());
  if (!node) return;
  const clone = node.cloneNode(true);

  const container = document.createElement("div");
  container.appendChild(clone);
  container.id = "clone";
  container.style.position = "absolute";
  container.style.top = "10px";
  container.style.left = "10px";

  container.firstElementChild?.classList.remove("position");
  container.firstElementChild?.classList.add("clone");

  const deleteBtn = document.createElement("div");
  deleteBtn.classList.add("delete-btn");
  deleteBtn.innerHTML = "<span class='material-icons-outlined'>close</span>";
  deleteBtn.addEventListener("click", handleDeleteClone);
  container.appendChild(deleteBtn);

  const confirmBtn = document.createElement("div");
  confirmBtn.classList.add("confirm-btn");
  confirmBtn.innerHTML = "<span class='material-icons-outlined'>check</span>";
  confirmBtn.addEventListener("click", handleAddClone);
  container.appendChild(confirmBtn);

  container.addEventListener("pointerdown", handleDragStart);
  container.addEventListener("pointermove", handleDragging);
  window.addEventListener("pointerup", handleDragEnd);

  const canva = document.getElementById("canva");
  if (!canva) return;
  cloneData.value = { blockId: selectedBlockId.value, positionIndex: index };
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
  const cloneElement = document.getElementById("clone");
  if (!cloneElement || !canva || !clonePosition.value) return;
  const { left: canva_left, top: canva_top } = canva.getBoundingClientRect();
  const { left, top } = cloneElement.getBoundingClientRect();

  if (!dragging.value || !cursor.value) return;
  const { clientX, clientY } = event;

  if (
    clientX > cursor.value.x &&
    left - canva_left <
      10 + BLOCK_STEP * length.value - BLOCK_STEP * clonePosition.value.x
  ) {
    diff_right.value += Math.round(clientX - cursor.value.x);
    if (diff_right.value >= BLOCK_STEP) {
      cloneElement.style.left = left - canva_left + BLOCK_STEP + "px";
      diff_right.value = 0;
    }
  }
  if (clientX < cursor.value.x && left - canva_left > 10) {
    diff_left.value += Math.round(cursor.value.x - clientX);
    if (diff_left.value >= BLOCK_STEP) {
      cloneElement.style.left = left - canva_left - BLOCK_STEP + "px";
      diff_left.value = 0;
    }
  }
  if (
    clientY > cursor.value.y &&
    top - canva_top <
      10 + BLOCK_STEP * height.value - BLOCK_STEP * clonePosition.value.y
  ) {
    diff_down.value += Math.round(clientY - cursor.value.y);
    if (diff_down.value >= BLOCK_STEP) {
      cloneElement.style.top = top - canva_top + BLOCK_STEP + "px";
      diff_down.value = 0;
    }
  }
  if (clientY < cursor.value.y && top - canva_top > 10) {
    diff_up.value += Math.round(cursor.value.y - clientY);
    if (diff_up.value >= BLOCK_STEP) {
      cloneElement.style.top = top - canva_top - BLOCK_STEP + "px";
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

function handleAddClone() {
  if (!cloneData.value) return;
  const blockToAdd =
    selectedBlockPositionList.value[cloneData.value!.positionIndex];
  if (!blockToAdd) return;

  const entryIndex = 0;

  const result = addTemplateBlock(
    { x: length.value, y: height.value, base: base.value },
    blockToAdd,
    cloneData.value.blockId,
    entryIndex,
  );
  if (!result) {
    alert("Blocks cannot overlap.");
    return;
  };
  base.value = result;
  handleDeleteClone();
}

function handleDeleteClone() {
  const cloneElement = document.getElementById("clone");
  if (!cloneElement) return;
  cloneElement.remove();
  cloneData.value = null;
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
  @apply p-[6px] relative rounded outline-dashed outline-gray-400 outline-[3px] hover:cursor-grab hover:outline-gray-100;
}
.delete-btn {
  @apply absolute -top-3 -left-3 w-6 h-6 bg-rose-600 rounded-full hover:cursor-pointer;
}
.confirm-btn {
  @apply absolute -top-3 -right-3 w-6 h-6 bg-green-500 rounded-full hover:cursor-pointer;
}
</style>
