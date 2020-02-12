declare module "properties" {
  function parse(
    data: string | object,
    options: { path: boolean },
    callback: Function
  ): undefined | object;
}
