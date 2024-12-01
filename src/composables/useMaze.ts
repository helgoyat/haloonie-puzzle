import { computed, ref } from "vue";
import { type TMaze, BlockTypeEnum, DirectionEnum } from "@/types";

export const useMaze = () => {
  const maze = ref<TMaze>([]);
  const loading = ref(false);
  const solutions = ref<TMaze[]>([]);

  const isMaze = computed((): boolean => maze.value.length > 0);
  const size = computed((): number => Math.sqrt(maze.value.length));

  const solutionCount = computed((): number => solutions.value.length);
  const isSolved = computed((): boolean => solutionCount.value > 0);

  const orderedSolutions = computed(
    (): Array<{ maze: TMaze; steps: number }> =>
      solutions.value
        .map((i, index) => ({ maze: i.filter((e) => e === BlockTypeEnum.Path), index }))
        .sort((a, b) => {
          return a.maze.length - b.maze.length;
        })
        .map((i) => ({ maze: solutions.value[i.index], steps: i.maze.length }))
  );

  const reset = () => {
    solutions.value = [];
  };

  const generateRandomMaze = (size: number) => {
    loading.value = true;
    maze.value = [];
    solutions.value = [];

    const blockCount = Math.pow(size, 2);

    maze.value = Array(blockCount)
      .fill(BlockTypeEnum.Ground)
      .map((i, index) => {
        if (index === 0) {
          return BlockTypeEnum.Cursor;
        } else if (index === blockCount - 1) {
          return BlockTypeEnum.End;
        } else {
          const randomInt = Math.floor(Math.random() * 2);
          const key = Object.keys(BlockTypeEnum)[Object.values(BlockTypeEnum).indexOf(randomInt)];
          if (key) {
            return BlockTypeEnum[key as keyof typeof BlockTypeEnum];
          } else {
            return BlockTypeEnum.Ground;
          }
        }
      });
    loading.value = false;
  };

  const solve = (): void => {
    loading.value = true;
    solutions.value = [];

    const _solutions: TMaze[] = [];

    moveCursor([...maze.value], _solutions);

    solutions.value = _solutions;
    loading.value = false;
  };

  const moveCursor = (maze: TMaze, solutions: TMaze[]): void => {
    const size = Math.sqrt(maze.length);
    if (!Number.isInteger(size)) {
      throw new Error("An issue happened in 'moveCursor' function: incorrect maze size.");
    }

    const cursorIndex = maze.findIndex((i) => i === BlockTypeEnum.Cursor);
    if (cursorIndex < 0) {
      throw new Error("An issue happened in 'moveCursor' function: cursor not found.");
    }

    function resolve(index: number) {
      const mz = [...maze];

      if (mz[index] === BlockTypeEnum.Ground) {
        mz[cursorIndex] = BlockTypeEnum.Path;
        mz[index] = BlockTypeEnum.Cursor;
        moveCursor(mz, solutions);
      } else if (mz[index] === BlockTypeEnum.End) {
        mz[cursorIndex] = BlockTypeEnum.Path;
        solutions.push(mz);
      }
    }

    // UP - direction === DirectionEnum.UP
    const upIndex = cursorIndex - size;
    if (upIndex >= 0) {
      resolve(upIndex);
    }

    // RIGHT - direction === DirectionEnum.RIGHT
    const rightIndex = cursorIndex + 1;
    if (rightIndex % size !== 0) {
      resolve(rightIndex);
    }

    // DOWN - direction === DirectionEnum.DOWN
    const downIndex = cursorIndex + size;
    if (downIndex <= maze.length - 1) {
      resolve(downIndex);
    }

    // LEFT - direction === DirectionEnum.LEFT
    const leftIndex = cursorIndex - 1;
    if (cursorIndex % size !== 0) {
      resolve(leftIndex);
    }
  };

  return {
    maze,
    loading,
    solutions,
    isMaze,
    size,
    solutionCount,
    isSolved,
    orderedSolutions,
    reset,
    generateRandomMaze,
    solve,
  };
};
