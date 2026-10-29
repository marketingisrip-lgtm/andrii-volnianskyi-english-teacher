// Just enough PDF reading for the document checks: page count, whether any text layer exists, and
// the Info title. Flate streams are inflated, so object streams and compressed content count too.
import { inflateSync } from "node:zlib";

export function pdfFacts(buf) {
  if (buf.subarray(0, 5).toString("latin1") !== "%PDF-") return null;
  const raw = buf.toString("latin1");
  const parts = [raw];
  for (const m of raw.matchAll(/stream\r?\n/g)) {
    if (raw.slice(m.index - 3, m.index) === "end") continue;
    const dict = raw.slice(Math.max(0, m.index - 400), m.index);
    if (!/\/FlateDecode/.test(dict.slice(dict.lastIndexOf("<<")))) continue;
    const end = raw.indexOf("endstream", m.index);
    try {
      parts.push(inflateSync(buf.subarray(m.index + m[0].length, end)).toString("latin1"));
    } catch {
      // Not every Flate stream inflates cleanly from a regex slice; text detection does not need all of them.
    }
  }
  const all = parts.join("\n");
  const literal = all.match(/\/Title\s*\(((?:\\.|[^\\)])*)\)/)?.[1];
  const hex = all.match(/\/Title\s*<([0-9A-Fa-f\s]+)>/)?.[1];
  const title = literal !== undefined ? text(Buffer.from(unescapeLiteral(literal), "latin1")) : hex ? text(Buffer.from(hex.replace(/\s/g, ""), "hex")) : null;
  return {
    pages: (all.match(/\/Type\s*\/Page(?![s\w])/g) || []).length,
    hasText: /\/Font\b/.test(all) && /\bT[Jj]\b/.test(all),
    title,
  };
}

// PDF strings are PDFDocEncoding (close enough to Latin-1 for titles) or UTF-16BE after a byte-order mark.
function text(bytes) {
  return bytes[0] === 0xfe && bytes[1] === 0xff ? Buffer.from(bytes.subarray(2)).swap16().toString("utf16le") : bytes.toString("latin1");
}

function unescapeLiteral(s) {
  const named = { n: "\n", r: "\r", t: "\t", b: "\b", f: "\f" };
  return s.replace(/\\([0-7]{1,3}|.)/gs, (_, c) => (/^[0-7]/.test(c) ? String.fromCharCode(parseInt(c, 8)) : named[c] ?? c));
}
