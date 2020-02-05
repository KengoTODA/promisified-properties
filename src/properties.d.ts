declare module "properties" {
  function parse(
    data: string | object,
    options: { path: boolean },
    callback: Function
  ): undefined | object;
  function stringify(
    obj: object,
    options?: { path?: string, unicode?: boolean },
    callback?: Function
  ): undefined | string;
}
