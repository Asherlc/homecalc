export class RequestError extends Error {
  info: any;
  status: number;

  constructor(res: Response) {
    super("An error occurred while fetching the data");

    this.status = res.status;
  }
}
