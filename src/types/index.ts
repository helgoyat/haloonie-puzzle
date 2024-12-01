export interface IBlock {
  base: Array<BaseEnum>;
  x: number;
  y: number;
  backgroundColor: string;
  outlineColor: string;
}

export enum BaseEnum {
  NONE = 0,
  ENTITY = 1,
}
