import Parsimmon from "parsimmon";

/**
 * Append a line-break to the end of line, if the end of line is not escaped by '\'
 */
function appendLineBreak(line: string): string {
  if (/(^|[^\\])(\\\\)*\\$/.test(line)) {
    return line.substring(0, line.length - 1);
  } else {
    return line + "\n";
  }
}

function interpretEscapes(str: string): string {
  return str.replace(/\\(u[0-9a-fA-F]{4}|[^u])/g, (_: any, escape: string) => {
    const type = escape.charAt(0);
    if (type === "u") {
      const hex = escape.slice(1);
      return String.fromCharCode(parseInt(hex, 16));
    }
    switch (type) {
      case "f":
        return "\f";
      case "n":
        return "\n";
      case "r":
        return "\r";
      case "t":
        return "\t";
    }
    return type;
  });
}
export const PropertiesParser: Parsimmon.Language = Parsimmon.createLanguage({
  /**
   * WhiteSpace defined in the spec
   */
  WhiteSpace: (r: Parsimmon.Language) => {
    return Parsimmon.regexp(/( |\f|\t|\\u0009|\\u0020|\\u000C)*/);
  },
  NaturalLine: (r: Parsimmon.Language) => {
    return r.CommentLine.map((_) => "")
      .or(r.BrankLine)
      .map((_) => "")
      .or(Parsimmon.regexp(/.*/));
  },
  /**
   * The natural line that contains only white space characters.
   * Ignored by parser.
   */
  BrankLine: (r: Parsimmon.Language) => {
    return Parsimmon.regexp(/^( |\f|\t|\\u0009|\\u0020|\\u000C)*$/);
  },
  /**
   * The natural line that has an ASCII '#' or '!' as its first non-white space character.
   * Ignored by parser.
   */
  CommentLine: (r: Parsimmon.Language) => {
    return Parsimmon.regexp(/^[!#].*/).trim(r.WhiteSpace);
  },
  LogicalLine: (r: Parsimmon.Language) => {
    const p1: Parsimmon.Parser<Entry> = Parsimmon.seqObj(
      ["key", r.Key.trim(r.WhiteSpace)],
      r.KeyTerminator,
      ["value", r.Value.trim(r.WhiteSpace)],
    );
    const p2: Parsimmon.Parser<Entry> = Parsimmon.seqObj(
      ["key", r.Key.trim(r.WhiteSpace)],
      r.WhiteSpace,
    );
    return p1.or(p2);
  },
  /**
   * Key terminator defined in the spec
   */
  KeyTerminator: (r: Parsimmon.Language) => {
    return Parsimmon.oneOf(":=");
  },
  Key: (r: Parsimmon.Language) => {
    return Parsimmon.regexp(
      /([a-zA-Z0-9_.-]|\\u[a-z0-9]{4}|\\[\\a-zA-Z0-9=:])+/,
    )
      .trim(r.WhiteSpace)
      .map(interpretEscapes);
  },
  Value: (r: Parsimmon.Language) => {
    return Parsimmon.all.trim(r.WhiteSpace).map(interpretEscapes);
  },
});

export function parse(s: string): Map<string, string> {
  const logicalLines: string[] = PropertiesParser.NaturalLine.sepBy(
    Parsimmon.newline,
  )
    .map((naturalLines) => {
      return naturalLines
        .map(appendLineBreak)
        .join("")
        .split("\n")
        .filter((s) => s.length > 0);
    })
    .tryParse(s);
  const map: Map<string, string> = new Map<string, string>();
  logicalLines.forEach((line) => {
    const entry = PropertiesParser.LogicalLine.tryParse(line);
    if (!entry) {
      return;
    }

    if (entry.value) {
      map.set(entry.key, entry.value.trim());
    } else {
      map.set(entry.key, "");
    }
  });
  return map;
}
