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
  length: number,
  height: number,
  blockList: Array<IBlock>,
): Array<number[]> {
  const results: Array<number[]> = [];

  const _blocks: Record<number, IPosition[]> = {};
  blockList.forEach((b, i) => {
    _blocks[i + 1] = getPositions(b);
  });

  // delete _blocks[2];
  // delete _blocks[4];
  // delete _blocks[11];
  // delete _blocks[9];
  // delete _blocks[12];
  // delete _blocks[8];
  // delete _blocks[7];

  const _canva: ICanva = {
    base: new Array(length * height).fill(0),
    x: length,
    y: height,
  };

  // _canva.base[0] = 2;
  // _canva.base[11] = 2;
  // _canva.base[12] = 2;
  // _canva.base[22] = 2;

  // _canva.base[1] = 4;
  // _canva.base[2] = 4;
  // _canva.base[3] = 4;
  // _canva.base[4] = 4;
  // _canva.base[14] = 4;

  // _canva.base[5] = 11;
  // _canva.base[6] = 11;
  // _canva.base[7] = 11;
  // _canva.base[18] = 11;
  // _canva.base[29] = 11;

  // _canva.base[8] = 9;
  // _canva.base[9] = 9;
  // _canva.base[10] = 9;
  // _canva.base[19] = 9;
  // _canva.base[21] = 9;

  // _canva.base[20] = 12;
  // _canva.base[31] = 12;
  // _canva.base[32] = 12;

  // _canva.base[40] = 8;
  // _canva.base[51] = 8;
  // _canva.base[41] = 8;
  // _canva.base[30] = 8;

  // _canva.base[42] = 7;
  // _canva.base[43] = 7;
  // _canva.base[52] = 7;
  // _canva.base[53] = 7;
  // _canva.base[54] = 7;

  function fit(canva: ICanva, blocks: Record<number, IPosition[]>) {
    outer_loop: for (const spotKey in canva.base) {
      const index = parseInt(spotKey);
      const line = getLine(index, canva.x);

      for (const blockKey in blocks) {
        const key = parseInt(blockKey);
        const positions = blocks[blockKey];

        for (const positionKey in positions) {
          const position = positions[positionKey];

          const res = addBlock(canva, position, key, index, line);
          if (res) {
            const updatedCanva = { base: res, x: canva.x, y: canva.y };
            const updatedBlocks = { ...blocks };
            delete updatedBlocks[key];

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
  key: number,
  entryIndex: number,
  entryLine: number,
): number[] | null {
  const result = [...canva.base];

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
          position.base[cursorIndex] === BaseEnum.ENTITY ? key : BaseEnum.NONE;
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
