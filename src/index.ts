import * as props from "properties"
import { promises } from "fs"
import { escape, escapeKey } from "./escape"

/**
 * Parse the file pointed by the given path as [the Properties defined by Java](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/util/Properties.html).
 *
 * @param path - Path to the target file to parse
 * @returns Promise which returns parsed properties
 */
export async function parseFile(path: string): Promise<Map<string, string>> {
  return new Promise((resolve, reject) => {
    props.parse(path, { path: true }, (err: Error, result: { [key: string]: string }) => {
      if (err) {
        reject(err)
      } else {
        resolve(objToMap(result))
      }
    })
  })
}

function objToMap<V>(obj: { [key: string]: string }): Map<string, string> {
    return new Map(Object.entries(obj));
}

/**
 * Parse given text as [the Properties defined by Java](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/util/Properties.html).
 *
 * @param data - Text to parse
 * @returns Promise which returns parsed properties
 */
export async function parse(data: string): Promise<Map<string, string>> {
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

/**
 * Convert properties data to text, based on [the spec defined by Java](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/util/Properties.html).
 * @param data - Properties data to convert into text format
 * @returns Converted text which represents the given properties
 */
export function stringify<T extends object, K extends keyof T>(data: T): Promise<string> {
  let result = ''
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const element = data[key];
      result += escape(escapeKey(key)) + ' = ' + escape('' + element) + '\n'
    }
  }
  return Promise.resolve(result)
}
/**
 * Convert properties data to text, based on [the spec defined by Java](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/util/Properties.html),
 * and write it to the file pointed by the given path.
 * @param data - Properties data to convert into text format
 * @param path - Path to the target file to write
 * @returns Promise which is resolved when file is successfully written
 */
export function write(data: object, path: string): Promise<void> {
  return stringify(data).then(s => promises.writeFile(path, s, {
    encoding: 'utf8'
  }))
}
