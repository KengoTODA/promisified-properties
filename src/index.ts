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
export async function parse(data: string): Promise<object> {
  return new Promise((resolve, reject) => {
    props.parse(data, { path: false }, (err: Error, result: object) => {
      if (err) {
        reject(err)
      } else {
        resolve(result)
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
