const EOL = '\n';

export function splitLines(source: string) {
  return source.split(EOL);
}

export function joinLines(lines: string[]) {
  return lines.join(EOL);
}

export function countLines(source: string) {
  return splitLines(source).length;
}

export function emptyLines(n: number) {
  return EOL.repeat(n);
}
