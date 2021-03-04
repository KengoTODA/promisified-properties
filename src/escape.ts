/**
 * Escape the given string, based on the spec [defined by Java](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/util/Properties.html).
 *
 * @param s - string to escape
 * @returns Escaped string
 */
export function escape(s: string): string {
  if (s.length === 0) {
    return "";
  }

  const iterator = s[Symbol.iterator]();
  let result = "";
  let char = iterator.next();

  do {
    const code: string = char.value;
    if (code === "\r") {
      result += "\\r";
    } else if (code === "\n") {
      result += "\\n";
    } else if (code.charCodeAt(0) < 256) {
      result += code;
    } else {
      for (var i = 0; i < code.length; ++i) {
        let escapedCode = code.charCodeAt(i).toString(16);
        while (escapedCode.length < 4) {
          escapedCode = "0" + code;
        }
        result += `\\u${escapedCode}`;
      }
    }
    char = iterator.next();
  } while (!char.done);
  return result;
}

/**
 * Escape the given string as property key, based on the spec [defined by Java](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/util/Properties.html).
 *
 * @param s - string to escape
 * @returns Escaped string
 */
export function escapeKey(key: string): string {
  return key.replace(/:/g, "\\:").replace(/=/g, "\\=");
}
