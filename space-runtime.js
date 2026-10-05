globalThis.mas2db7bv92gl5qrngsifs = Object.assign({"prefix":"/s/res/","scramjetPath":"/s/cuf7avvz.js","wasmPath":"/s/cuf7avvz.wasm","injectPath":"/c/controller.inject.js"}, {buildId:JSON.parse(globalThis.String.fromCharCode(34,100,101,118,101,108,111,112,109,101,110,116,34))}, {codec:{encode:(function base32Encode(url) {
  let bits = 0, value = 0, output = "";
  for (const byte of new TextEncoder().encode(url)) {
    value = value << 8 | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      output += "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"[value >>> bits & 31];
    }
    value &= (1 << bits) - 1;
  }
  if (bits)
    output += "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"[value << 5 - bits & 31];
  return output;
}),decode:(function base32Decode(encoded) {
  let bits = 0, value = 0;
  const bytes = [];
  for (const char of encoded) {
    const digit = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".indexOf(char);
    if (digit < 0)
      throw Error("Invalid Base32 URL");
    value = value << 5 | digit;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      bytes.push(value >>> bits & 255);
    }
    value &= (1 << bits) - 1;
  }
  if (value || [
    1,
    3,
    6
  ].includes(encoded.length % 8))
    throw Error("Invalid Base32 padding");
  return new TextDecoder("utf-8", { fatal: !0 }).decode(new Uint8Array(bytes));
})}});
