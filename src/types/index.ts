export interface ICanva {
  canva: Array<number>;
  x: number;
  y: number;
}

export interface IBlock extends IPosition {
  backgroundColor: string;
  outlineColor: string;
}

export interface IPosition {
  base: Array<BaseEnum>;
  x: number;
  y: number;
}

export enum BaseEnum {
  NONE = 0,
  ENTITY = 1,
}
