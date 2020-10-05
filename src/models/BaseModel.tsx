export interface BaseModelInterface {
  id: string;
}

export interface BaseModelConstructor<
  T = Record<string, any>,
  C = BaseModelInterface
> {
  new (id: string, data: T): C;
}
