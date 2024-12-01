import type { IBlock, IPosition } from "@/types";

export function getBlockPositionList(block: IBlock): IPosition[] {
  const init = { base: block.base, x: block.x, y: block.y };
  return [init];
}
