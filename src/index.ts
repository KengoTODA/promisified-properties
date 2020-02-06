import * as props from "properties"

export async function parseFile(path: string): Promise<object> {
  return new Promise((resolve, reject) => {
    props.parse(path, { path: true }, (err: Error, result: object) => {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
}
function objToMap<V>(obj: { [key: string]: string }): Map<string, string> {
    return new Map(Object.entries(obj));
}
export async function parse(data: string): Promise<Map<string,string>> {
  return new Promise((resolve, reject) => {
    props.parse(data, { path: false }, (err: Error, result: { [key: string]: string }) => {
      if (err) {
        reject(err)
      } else {
        resolve(objToMap(result))
      }
    })
  })
}
export async function stringify(data: object): Promise<string> {
  const result = props.stringify(data, { unicode: true }) as string
  return Promise.resolve(result)
}
export async function write(data: object, path: string): Promise<undefined> {
  return new Promise((resolve, reject) => {
    props.stringify(data, { path }, (err: Error) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}
