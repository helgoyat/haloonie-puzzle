import type { IBlock, IPosition, BaseEnum } from "@/types";

export function getBlockPositionList(block: IBlock): IPosition[] {
  const initialBlock = { base: block.base, x: block.x, y: block.y };

  const result = [initialBlock];

  for (let i = 1; i < 4; i++) {
    const fromPosition = result[result.length - 1];
    const position = rotate90(fromPosition);
    result.push(position);
  }

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
