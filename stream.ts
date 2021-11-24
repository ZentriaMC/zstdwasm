import type {
  Closer,
  Reader,
  ReaderSync,
  Writer,
  WriterSync,
} from "https://deno.land/std@0.115.1/io/types.d.ts";

// size_t ZSTD_CStreamInSize(void);    /**< recommended size for input buffer */
// size_t ZSTD_CStreamOutSize(void);   /**< recommended size for output buffer. Guarantee to successfully flush at least one complete compressed block. */
// size_t ZSTD_DStreamInSize(void);    /*!< recommended size for input buffer */
// size_t ZSTD_DStreamOutSize(void);   /*!< recommended size for output buffer. Guarantee to successfully flush at least one complete block in all circumstances. */

export class ZstdCompressor implements Writer, WriterSync, Closer {
  constructor(buffer: ArrayBuffer, level: number = 3) {
    // const ctx = ZSTD_createCStream();
    // // note : since v1.3.0, ZSTD_CStream and ZSTD_CCtx are the same thing.
    // // size_t ZSTD_CCtx_setParameter(ZSTD_CCtx* cctx, ZSTD_cParameter param, int value);
    // if (isError(ZSTD_CCtx_setParameter(ctx, ZSTD_c_compressionLevel, ${level}))) {
    //   throw new Error(...);
    // }
  }

  async write(p: Uint8Array): Promise<number> {
    const res = this.writeSync(p);
    return Promise.resolve(res);
  }

  writeSync(p: Uint8Array): number {
    return 0;
  }

  close(): void {
    // ZSTD_freeCStream(ctx);
  }
}

export class ZstdDeompressor implements Reader, ReaderSync, Closer {
  constructor(buffer: ArrayBuffer) {
    // const ctx = ZSTD_createDStream();
  }

  async read(p: Uint8Array): Promise<number | null> {
    const res = this.readSync(p);
    return Promise.resolve(res);
  }

  readSync(p: Uint8Array): number | null {
    return 0;
  }

  close(): void {
    // ZSTD_freeDStream(this.ctx);
  }
}
