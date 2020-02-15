import Parsimmon from "parsimmon";

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
type Entry = {
  key: string
  value?: string
}
export const PropertiesParser: Parsimmon.Language = Parsimmon.createLanguage({
  /**
   * WhiteSpace defined in the spec
   */
  WhiteSpace: (r: Parsimmon.Language) => {
    return Parsimmon.regexp(/( |\f|\t|\\u0009|\\u0020|\\u000C)*/);
  },
  NaturalLine: (r: Parsimmon.Language) => {
    return r.CommentLine.or(r.BrankLine).or(Parsimmon.regexp(/.*/))
  },
  /**
   * The natural line that contains only white space characters.
   * Ignored by parser.
   */
  BrankLine: (r: Parsimmon.Language) => {
    return Parsimmon.regexp(/^( |\f|\t|\\u0009|\\u0020|\\u000C)*$/)
  },
  /**
   * The natural line that has an ASCII '#' or '!' as its first non-white space character.
   * Ignored by parser.
   */
  CommentLine: (r: Parsimmon.Language) => {
    return Parsimmon.regexp(/^[!#].*$/).trim(r.WhiteSpace)
  },
  LogicalLine: (r: Parsimmon.Language) => {
    // TODO The line terminator (\r, \n, \r\n) can be escaped by \
    const p1: Parsimmon.Parser<Entry> = Parsimmon.seqObj(
      ['key', r.Key.trim(r.WhiteSpace)],
      r.KeyTerminator,
      ['value', r.Value.trim(r.WhiteSpace)]
    )
    const p2: Parsimmon.Parser<Entry> = Parsimmon.seqObj(
      ['key', r.Key.trim(r.WhiteSpace)],
      r.KeyTerminator,
      r.WhiteSpace
    )
    const p3: Parsimmon.Parser<Entry> = Parsimmon.seqObj(
      ['key', r.Key.trim(r.WhiteSpace)],
      r.WhiteSpace
    )
    return p1.or(p2).or(p3).or(r.CommentLine.map(_ => {}))
  },
  /**
   * Key terminator defined in the spec
   */
  KeyTerminator: (r: Parsimmon.Language) => {
    return Parsimmon.oneOf(":=");
  },
  Key: (r: Parsimmon.Language) => {
    return Parsimmon.regexp(
      /([a-zA-Z_.-]|\\\\|\\r|\\n|\\=|\\:|\\u[a-z0-9]{4})+/
    )
      .trim(r.WhiteSpace)
      .map(interpretEscapes);
  },
  Value: (r: Parsimmon.Language) => {
    return Parsimmon.regexp(/([a-zA-Z_.-]|\\\\|\\r|\\n|\\f|\\u[a-z0-9]{4})+/)
      .or(r.KeyTerminator)
      .trim(r.WhiteSpace)
      .map(interpretEscapes);
  },
  Properties: (r: Parsimmon.Language) => {
    return r.LogicalLine.sepBy(Parsimmon.newline)
      .map(lines => {
      const map = new Map<string, string>();
      lines.forEach((line: Entry) => {
        if (line.value) {
          map.set(line.key, line.value.trim());
        } else {
          map.set(line.key, '')
        }
      });
      return map;
    });
  }
});

export function parse(s: string): Map<string, string> {
  return PropertiesParser.Properties.tryParse(s);
}
