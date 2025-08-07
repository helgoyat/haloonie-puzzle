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
const prevClient = ref<{ x: number; y: number } | null>(null);
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

function reset() {
  base.value = new Array(length.value * height.value).fill(0);
  solutions.value = [];
  viewSolutionIndex.value = 0;
}

function useTemplate() {
  base.value = [..._baseTemplate.value];
}

function solve() {
  viewSolutionIndex.value = 0;
  const templateBlockIdList = [...new Set(base.value)].filter((e) => e !== 0);
  const _blockList: IBlock[] = blockList.value.filter(
    (b) => !templateBlockIdList.includes(b.id),
  );

  const result = solvePuzzle(
    { base: base.value, x: length.value, y: height.value },
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
  container.style.top = "0px";
  container.style.left = "0px";

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
  window.addEventListener("pointermove", handleDragging);
  window.addEventListener("pointerup", handleDragEnd);

  const canva = document.getElementById("canva");
  if (!canva) return;
  cloneData.value = { blockId: selectedBlockId.value, positionIndex: index };
  canva.appendChild(container);
  window.scrollTo(0, document.getElementById("board")?.offsetTop ?? 0);
}

function handleDragStart(event: PointerEvent) {
  dragging.value = true;
  const { clientX, clientY } = event;
  prevClient.value = { x: clientX, y: clientY };
}

function handleDragging(event: PointerEvent) {
  const cloneElement = document.getElementById("clone");
  const canva = document.getElementById("canva");
  if (
    !cloneElement ||
    !canva ||
    !clonePosition.value ||
    !dragging.value ||
    !prevClient.value
  )
    return;

  const { clientX, clientY } = event;
  const {
    left: canva_left,
    top: canva_top,
    width: canva_width,
    height: canva_height,
  } = canva.getBoundingClientRect();

  const withinBoard =
    clientX >= canva_left &&
    clientX <= canva_left + canva_width &&
    clientY >= canva_top &&
    clientY <= canva_top + canva_height;
  if (!withinBoard) return;

  if (
    clientX > prevClient.value.x &&
    cloneElement.offsetLeft <
      BLOCK_STEP * length.value - BLOCK_STEP * clonePosition.value.x
  ) {
    diff_right.value += Math.round(clientX - prevClient.value.x);

    if (diff_right.value >= BLOCK_STEP) {
      // move right
      cloneElement.style.left = cloneElement.offsetLeft + BLOCK_STEP + "px";
      diff_right.value = 0;
    }
  }
  if (clientX < prevClient.value.x && cloneElement.offsetLeft > 0) {
    diff_left.value += Math.round(prevClient.value.x - clientX);

    if (diff_left.value >= BLOCK_STEP) {
      // move left
      cloneElement.style.left = cloneElement.offsetLeft - BLOCK_STEP + "px";
      diff_left.value = 0;
    }
  }
  if (
    clientY > prevClient.value.y &&
    cloneElement.offsetTop <
      BLOCK_STEP * height.value - BLOCK_STEP * clonePosition.value.y
  ) {
    diff_down.value += Math.round(clientY - prevClient.value.y);

    if (diff_down.value >= BLOCK_STEP) {
      // move down
      cloneElement.style.top = cloneElement.offsetTop + BLOCK_STEP + "px";
      diff_down.value = 0;
    }
  }
  if (clientY < prevClient.value.y && cloneElement.offsetTop > 0) {
    diff_up.value += Math.round(prevClient.value.y - clientY);

    if (diff_up.value >= BLOCK_STEP) {
      // move up
      cloneElement.style.top = cloneElement.offsetTop - BLOCK_STEP + "px";
      diff_up.value = 0;
    }
  }

  prevClient.value = { x: clientX, y: clientY };
}

function handleDragEnd() {
  dragging.value = false;
  prevClient.value = null;
  diff_up.value = 0;
  diff_right.value = 0;
  diff_down.value = 0;
  diff_left.value = 0;
}

function handleAddClone() {
  if (!cloneData.value) return;
  const cloneElement = document.getElementById("clone");
  if (!cloneElement) return;
  const blockToAdd =
    selectedBlockPositionList.value[cloneData.value!.positionIndex];
  if (!blockToAdd) return;

  const x = cloneElement.offsetLeft / BLOCK_STEP;
  const y = cloneElement.offsetTop / BLOCK_STEP;
  const entryIndex = y * length.value + x;
  if (entryIndex < 0 && entryIndex > base.value.length - 1) return;

  const result = addTemplateBlock(
    { x: length.value, y: height.value, base: base.value },
    blockToAdd,
    cloneData.value.blockId,
    entryIndex,
  );
  if (typeof result === "string") {
    alert(result);
    return;
  }
  base.value = result;
  handleDeleteClone();
}

function handleDeleteClone() {
  const cloneElement = document.getElementById("clone");
  if (!cloneElement) return;
  cloneElement.remove();
  cloneData.value = null;
  window.removeEventListener("pointermove", handleDragging);
  window.removeEventListener("pointerup", handleDragEnd);
}
</script>

<template>
  <main class="flex flex-col justify-center items-center">
    <div class="w-full p-12 text-white flex gap-4">
      <div class="grow flex flex-col gap-4">
        <div class="text-2xl">🧩 Background</div>
        <div>
          Inspired by my experience with IQ Puzzler, I recognized patterns in my
          problem-solving approach. I realized these strategies could be
          algorithmically replicated, leading me to develop an application
          capable of solving easy-to-medium difficulty templates from the game.
          Test.
        </div>
        <div class="text-2xl">📘 Instructions</div>
        <div>
          <ul class="list-disc list-inside">
            <li>
              Select a puzzle shape and its position to place on the board.
            </li>
            <li>
              Move the puzzle piece on the board using drag-and-drop
              functionality. You can delete or confirm placement.
            </li>
            <li>
              Click "Template" button to populate the board with a predefined
              puzzle template. Currently, one template is available, with more
              to come.
            </li>
          </ul>
        </div>
        <div class="text-red-500">
          This application is still under development.
        </div>
        <div>
          See the
          <a
            href="https://d32bxxnq6qs937.cloudfront.net/sites/default/files/SmartGames%2048%20FREE%20IQ%20PUZZLER%20PRO_1.pdf"
            class="text-blue-500 underline"
            target="_blank"
            >Puzzle Templates</a
          >
          book (Starter, Junior and Expert levels are functional)
        </div>
        <div>
          Select any template or find one online, this application solves it and
          displays multiple solutions if available - more than 1 found.
        </div>
      </div>
      <div>
        <img
          src="https://d32bxxnq6qs937.cloudfront.net/sites/default/files/smartgames-product-banner_IQ-Puzzler-Pro_1.jpg"
          class="rounded max-w-xs"
        />
      </div>
    </div>
    <!-- Puzzle Board -->
    <div
      id="board"
      class="flex flex-col justify-center items-center h-screen gap-8 bg-gray-800 w-full"
    >
      <div
        id="canva"
        class="relative p-2 outline-dashed outline-4 outline-gray-950 rounded bg-gray-800 grid gap-2"
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
      <div class="flex flex-row gap-3">
        <button
          v-if="!solutions.length"
          class="w-28 select-none"
          @click="useTemplate"
        >
          Template
        </button>
        <button v-if="solutions.length" class="w-28 select-none" @click="reset">
          Reset
        </button>
        <button
          class="w-28 select-none"
          :disabled="!!solutions.length"
          @click="solve"
        >
          Solve
        </button>
        <button
          v-if="solutions.length > 1"
          class="w-28 select-none"
          @click="viewNextSolution"
        >
          Next
        </button>
      </div>
    </div>
    <!-- Puzzle Shapes -->
    <div
      class="w-full bg-gray-900 p-12 text-white flex flex-col gap-8 min-h-screen"
    >
      <div class="text-2xl">Puzzle Shapes</div>
      <div class="flex flex-row items-start flex-wrap gap-6">
        <div
          v-for="block in blockList"
          class="p-3 grid gap-2 w-fit hover:cursor-pointer hover:bg-gray-800 rounded"
          :class="selectedBlockId === block.id && 'outline-3 outline-gray-600'"
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
        <div class="text-2xl">Positions</div>
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
                    ? 'rounded shadow-lg bg-gray-400'
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
