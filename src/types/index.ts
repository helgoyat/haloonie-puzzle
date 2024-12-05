export interface ICanva {
  base: Array<number>;
  x: number;
  y: number;
}

export interface IBlock extends IPosition {
  id: number;
  backgroundColor: string;
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
