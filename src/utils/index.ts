import { isEqual } from "lodash";
import { type ICanva, type IBlock, type IPosition, BaseEnum } from "@/types";

export function getPositions(block: IBlock): IPosition[] {
  const initialBlock = { base: block.base, x: block.x, y: block.y };

  const result = [{ ...initialBlock }];
  let cursor: IPosition = initialBlock;

  // 3 Rotations
  for (let i = 1; i < 4; i++) {
    const position = rotate90(cursor);

    const found = result.some((p) => isEqual(p, position));
    if (!found) {
      result.push(position);
    }

    cursor = position;
  }

  // Vertical Symmetry
  const symmetricalPosition = verticalAxialSymmetry(initialBlock);
  const found = result.some((p) => isEqual(p, symmetricalPosition));
  if (!found) {
    result.push(symmetricalPosition);
  }
  cursor = symmetricalPosition;

  // 3 Rotations from Vertical Symmetry
  for (let i = 1; i < 4; i++) {
    const position = rotate90(cursor);

    const found = result.some((p) => isEqual(p, position));
    if (!found) {
      result.push(position);
    }

    cursor = position;
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

function getLine(index: number, length: number): number {
  return Math.floor(index / length) + 1;
}

export function solvePuzzle(
  _canva: ICanva,
  blockList: Array<IBlock>,
): Array<number[]> {
  const results: Array<number[]> = [];

  const _blocks: Record<number, IPosition[]> = {};
  blockList.forEach((b) => {
    _blocks[b.id] = getPositions(b);
  });

  function fit(canva: ICanva, blocks: Record<number, IPosition[]>) {
    outer_loop: for (const spotKey in canva.base) {
      const index = parseInt(spotKey);

      for (const blockKey in blocks) {
        const blockId = parseInt(blockKey);
        const positions = blocks[blockKey];

        for (const positionKey in positions) {
          const position = positions[positionKey];

          const res = addBlock(canva, position, blockId, index);
          if (res) {
            const updatedCanva = { base: res, x: canva.x, y: canva.y };
            const updatedBlocks = { ...blocks };
            delete updatedBlocks[blockId];

            if (!res.some((e) => e === BaseEnum.NONE)) {
              results.push(res);
              break outer_loop;
            }

            // Stop at 4 solutions
            if (results.length < 5) {
              fit(updatedCanva, updatedBlocks);
            }
          }
        }
      }
    }
  }

  fit(_canva, _blocks);

  return results;
}

function addBlock(
  canva: ICanva,
  position: IPosition,
  blockId: number,
  entryIndex: number,
): number[] | null {
  const result = [...canva.base];
  const entryLine = getLine(entryIndex, canva.x);

  const fitInX = entryLine === getLine(entryIndex + position.x - 1, canva.x);
  const fitInY = entryLine + position.y - 1 <= canva.y;

  const fitInCanva = fitInX && fitInY;

  if (!fitInCanva) return null;

  const firstEntityIndex: number = position.base.findIndex(
    (e) => e === BaseEnum.ENTITY,
  );
  let firstEntitySpotIndex: number | null = null;
  let overlap = false;

  for (let y = 0; y < position.y; y++) {
    if (overlap) break;

    for (let x = 0; x < position.x; x++) {
      const spotIndex = entryIndex + x + y * canva.x;
      const cursorIndex = x + y * position.x;

      if (result[spotIndex] === BaseEnum.NONE) {
        result[spotIndex] =
          position.base[cursorIndex] === BaseEnum.ENTITY
            ? blockId
            : BaseEnum.NONE;
      } else if (
        result[spotIndex] !== BaseEnum.NONE &&
        position.base[cursorIndex] !== BaseEnum.NONE
      ) {
        overlap = true;
        break;
      }

      if (cursorIndex === firstEntityIndex) {
        firstEntitySpotIndex = spotIndex;
      }
    }
  }

  if (overlap || firstEntitySpotIndex === null) return null;
  const isValid = !result
    .slice(0, firstEntitySpotIndex + 1)
    .some((e) => e === BaseEnum.NONE);

  return isValid ? result : null;
}

export function addTemplateBlock(
  canva: ICanva,
  position: IPosition,
  blockId: number,
  entryIndex: number,
): number[] | string {
  const result = [...canva.base];
  const isDuplicate = result.some((id) => id === blockId);
  if (isDuplicate) return "This block is already present on the board.";
  const entryLine = getLine(entryIndex, canva.x);

  const fitInX = entryLine === getLine(entryIndex + position.x - 1, canva.x);
  const fitInY = entryLine + position.y - 1 <= canva.y;

  const fitInCanva = fitInX && fitInY;

  if (!fitInCanva) return "This block doesn't fit entirely in the board.";

  const firstEntityIndex: number = position.base.findIndex(
    (e) => e === BaseEnum.ENTITY,
  );
  let firstEntitySpotIndex: number | null = null;
  let overlap = false;

  for (let y = 0; y < position.y; y++) {
    if (overlap) break;

    for (let x = 0; x < position.x; x++) {
      const spotIndex = entryIndex + x + y * canva.x;
      const cursorIndex = x + y * position.x;

      if (result[spotIndex] === BaseEnum.NONE) {
        result[spotIndex] =
          position.base[cursorIndex] === BaseEnum.ENTITY
            ? blockId
            : BaseEnum.NONE;
      } else if (
        result[spotIndex] !== BaseEnum.NONE &&
        position.base[cursorIndex] !== BaseEnum.NONE
      ) {
        overlap = true;
        break;
      }

      if (cursorIndex === firstEntityIndex) {
        firstEntitySpotIndex = spotIndex;
      }
    }
  }

  if (overlap || firstEntitySpotIndex === null)
    return "This block overlaps another.";

  return result;
}
