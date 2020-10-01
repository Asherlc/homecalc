export type FirebaseTable<T> = {
  [key: string]: T;
};

interface BaseModelInterface {}

interface BaseModelConstructor<T, C> {
  new (key: string, data: T): C;
}

export default abstract class BaseModel<T> implements BaseModelInterface {
  protected data: T;
  key: string;

  constructor(key: string, data: T) {
    this.data = data;
    this.key = key;
  }

  firebasePath: any;
}

export function modelFactory<T, C>(
  Constructor: BaseModelConstructor<T, C>,
  data: FirebaseTable<T>
): C[] {
  return Object.entries(data).map(([key, data]) => new Constructor(key, data));
}
