import { fromFileUrl } from "https://deno.land/std@0.115.1/path/mod.ts";

import Module from "./zstd/zstd.js";

// TODO: this is bad
// deno-lint-ignore
let module: any;

export async function initialize(): Promise<void> {
  // TODO: should bundle wasm blob into base64 string or something... this is annoyinh
  await Deno.permissions.request({
    name: "read",
    path: fromFileUrl(new URL("./zstd/zstd.wasm", import.meta.url)),
  });

  if (module) {
    return;
  }
  module = await Module();
}

export function compressBound(size: number): number {
  const bound = module["_ZSTD_compressBound"];
  return bound(size);
}

export function isError(code: number): boolean {
  const _isError = module["_ZSTD_isError"];
  return _isError(code) > 0;
}

export function errorString(code: number): string {
  /*
  const getErrorString = module["_ZSTD_getErrorString"];
  const ret = getErrorString(code);
  return module.UTF8ToString(ret);
  */
  return module.ccall("ZSTD_getErrorString", "string", ["number"], [code]);
}

export function getFrameContentSize(src: number, size: number): number {
  const getSize = module["_ZSTD_getFrameContentSize"];
  return getSize(src, size);
}

export function compress(buffer: ArrayBuffer, level: number = 3): Uint8Array {
  const bound = compressBound(buffer.byteLength);
  const src = module["_malloc"](buffer.byteLength);
  const compressed = module["_malloc"](bound);

  try {
    module["HEAP8"].set(buffer, src);
    const ret = module["_ZSTD_compress"](
      compressed,
      bound,
      src,
      buffer.byteLength,
      level,
    );
    if (isError(ret)) {
      throw new Error("Unable to compress: " + errorString(ret));
    }

    // Copy the buffer
    const copy = new Uint8Array(
      module["HEAPU8"].buffer,
      compressed,
      ret,
    );
    return copy.slice();
  } finally {
    module["_free"](src, buffer.byteLength);
    module["_free"](compressed, bound);
  }
}

export function decompress(
  buffer: ArrayBuffer,
  defaultHeapSize: number = (1024 * 1024),
): Uint8Array {
  const src = module["_malloc"](buffer.byteLength);
  module["HEAP8"].set(buffer, src);

  const contentSize = getFrameContentSize(src, buffer.byteLength);
  const size = contentSize === -1 ? defaultHeapSize : contentSize;

  const heap = module["_malloc"](size);
  try {
    const ret = module["_ZSTD_decompress"](
      heap,
      size,
      src,
      buffer.byteLength,
    );
    if (isError(ret)) {
      throw new Error("Unable to decompress: " + errorString(ret));
    }

    // Copy the buffer
    const copy = new Uint8Array(
      module["HEAPU8"].buffer,
      heap,
      ret,
    );
    return copy.slice();
  } finally {
    module["_free"](src, buffer.byteLength);
    module["_free"](heap, size);
  }
}
