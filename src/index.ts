import { promises } from "fs";
import { escape, escapeKey } from "./escape";
import { parse as parseProperties } from "./parser";

/**
 * Parse the file pointed by the given path as [the Properties defined by Java](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/util/Properties.html).
 *
 * @param path - Path to the target file to parse
 * @returns Promise which returns parsed properties
 */
export async function parseFile(path: string): Promise<Map<string, string>> {
  return promises.readFile(path, { encoding: "utf8" }).then((s) => {
    return parseProperties(s);
  });
}

/**
 * Parse given text as [the Properties defined by Java](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/util/Properties.html).
 *
 * @param data - Text to parse
 * @returns Promise which returns parsed properties
 */
export function parse(data: string): Map<string, string> {
  return parseProperties(data);
}

/**
 * Convert properties data to text, based on [the spec defined by Java](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/util/Properties.html).
 * @param data - Properties data to convert into text format
 * @returns Converted text which represents the given properties
 */
export function stringify(data: Map<string, string>): string {
  let result = "";
  data.forEach((value: string, key: string) => {
    result += escape(escapeKey(key)) + " = " + escape(value) + "\n";
  });
  return result;
}
/**
 * Convert properties data to text, based on [the spec defined by Java](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/util/Properties.html),
 * and write it to the file pointed by the given path.
 * @param data - Properties data to convert into text format
 * @param path - Path to the target file to write
 * @returns Promise which is resolved when file is successfully written
 */
export function write(data: Map<string, string>, path: string): Promise<void> {
  return promises.writeFile(path, stringify(data), {
    encoding: "utf8"
  });
}
