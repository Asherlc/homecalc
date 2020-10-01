import { FirestoreRecord } from "../hooks/firebase";

interface BaseModelInterface {}

interface BaseModelConstructor<T, C> {
  new (id: string, data: T): C;
}

export default abstract class BaseModel<T> implements BaseModelInterface {
  protected data: T;
  id: string;

  constructor(id: string, data: T) {
    this.data = data;
    this.id = id;
  }

  firebasePath: any;
}

export function modelsFactory<T, C>(
  Constructor: BaseModelConstructor<T, C>,
  data: FirestoreRecord<T>[]
): C[] {
  return data.map(({ id, data }) => new Constructor(id, data));
}
