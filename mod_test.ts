import { initialize } from "./mod.ts";
import {
  compress,
  compressBound,
  decompress,
  errorString,
  isError,
} from "./mod.ts";

import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.115.1/testing/asserts.ts";

await initialize();

Deno.test("compress bound", () => {
  const size = 1024;
  const bound = compressBound(size);

  assert(bound >= size);
});

Deno.test("error", () => {
  const errorCode = 22; // lib/zstd_errors.h: ZSTD_error_checksum_wrong

  assert(isError(-1));
  assertEquals("Restored data doesn't match checksum", errorString(errorCode));
});

Deno.test("compress & decompress cycle", () => {
  const text =
    "On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment, so blinded by desire, that they cannot foresee the pain and trouble that are bound to ensue; and equal blame belongs to those who fail in their duty through weakness of will, which is the same as saying through shrinking from toil and pain. These cases are perfectly simple and easy to distinguish. In a free hour, when our power of choice is untrammelled and when nothing prevents our being able to do what we like best, every pleasure is to be welcomed and every pain avoided. But in certain circumstances and owing to the claims of duty or the obligations of business it will frequently occur that pleasures have to be repudiated and annoyances accepted. The wise man therefore always holds in these matters to this principle of selection: he rejects pleasures to secure other greater pleasures, or else he endures pains to avoid worse pains.";

  const encoded = new TextEncoder().encode(text);
  const compressed = compress(encoded);
  const decompressed = decompress(compressed);
  const decoded = new TextDecoder().decode(decompressed);

  assertEquals(text, decoded);
});
