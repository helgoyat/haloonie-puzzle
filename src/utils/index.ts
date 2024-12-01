import type { ICanva, IBlock, IPosition, BaseEnum } from "@/types";

export function getBlockPositionList(block: IBlock): IPosition[] {
  const initialBlock = { base: block.base, x: block.x, y: block.y };

  const result = [initialBlock];

  // 3 Rotations
  for (let i = 1; i < 4; i++) {
    const fromPosition = result[result.length - 1];
    const position = rotate90(fromPosition);
    result.push(position);
  }

  // Vertical Symmetry and 3 Rotations
  const symmetricalPosition = verticalAxialSymmetry(initialBlock);
  result.push(symmetricalPosition);

  for (let i = 1; i < 4; i++) {
    const fromPosition = result[result.length - 1];
    const position = rotate90(fromPosition);
    result.push(position);
  }

  return result;
}

export function rotate90(data: IPosition): IPosition {
  const base: Array<BaseEnum> = [];

  for (let x = 0; x < data.x; x++) {
    for (let y = data.y - 1; y >= 0; y--) {
      const index = y * data.x + x;
      base.push(data.base[index]);
    }
  }

  return { base, x: data.y, y: data.x };
}

export function verticalAxialSymmetry(data: IPosition): IPosition {
  const base: Array<BaseEnum> = [];

  for (let y = 0; y < data.y; y++) {
    for (let x = data.x - 1; x >= 0; x--) {
      const index = y * data.x + x;
      base.push(data.base[index]);
    }
  }

  return { base, x: data.x, y: data.y };
}

export function solvePuzzle(
  length: number,
  height: number,
  blockList: Record<number, IPosition[]>,
): Array<number[]> {
  const results: Array<number[]> = [];

  const canva: ICanva = {
    canva: new Array(length * height).fill(0),
    x: length,
    y: height,
  };

  for (const block in blockList) {
    const positionList = blockList[block];

    for (const position in positionList) {
      const res = fitBlockPosition(positionList[position], { ...canva });
      if (res) {
        results.push(res);
      }
    }

    break;
  }

  return results;
}

function fitBlockPosition(position: IPosition, canva: ICanva): number[] | null {
  function getLine(index: number): number {
    return Math.floor((index + 1) / canva.x) + 1;
  }

  const result = [...canva.canva];

  const entryIndex = canva.canva.findIndex((e) => e === 0);
  const entryLine = getLine(entryIndex);

  const fitInX = entryLine === getLine(entryIndex + position.x - 1);
  const fitInY = entryLine + position.y <= canva.y;

  let overlap = false;

  if (fitInX && fitInY) {
    for (let y = 0; y < position.y; y++) {
      if (overlap) break;

      for (let x = 0; x < position.x; x++) {
        const canvaIndex = entryIndex + x + y * canva.x;
        const positionIndex = x + y * position.x;

        if (result[canvaIndex] === 0) {
          result[canvaIndex] = position.base[positionIndex];
        } else if (
          result[canvaIndex] !== 0 &&
          position.base[positionIndex] !== 0
        ) {
          overlap = true;
          break;
        }
      }
    }
  }

  if (overlap) return null;

  const firstSpotIndex = result.findIndex((e) => e === 0);
  const isValid = firstSpotIndex > entryIndex;

  return isValid ? result : null;
}
