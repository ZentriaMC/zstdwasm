{ lib, buildEmscriptenPackage, stdenv, fetchFromGitHub, bash, emscripten }:

buildEmscriptenPackage rec {
  pname = "zstd-wasm";
  version = "1.5.0";

  src = fetchFromGitHub {
    owner = "facebook";
    repo = "zstd";
    rev = "v${version}";
    sha256 = "sha256-R+Y10gd3GE17AJ5zIXGI4tuOdyCikdZXwbkMllAHjEU=";
  };

  NIX_CFLAGS_COMPILE = "-Os -g0 -flto -DNDEBUG=1"; #-Wall -Wextra -Werror";
  EM_FLAGS = "-s WASM=1 -s EXPORT_ES6=1 -s ENVIRONMENT=web -s ALLOW_MEMORY_GROWTH=1 -s FILESYSTEM=0";
  exportedFunctions = [ "_ZSTD_isError" "_ZSTD_getFrameContentSize" "_ZSTD_decompress" "_ZSTD_compress" "_ZSTD_compressBound" "_ZSTD_getErrorString" "_ZSTD_getErrorCode" "_malloc" "_free" ];

  dontConfigure = 1;
  dontFixup = 1;

  postPatch = ''
    patchShebangs build/single_file_libs
  '';

  preBuild = ''
    t=$PWD

    # Create amalgamated source
    pushd build/single_file_libs >/dev/null
    ./create_single_file_library.sh
    cp zstd.c $t/zstd.c
    popd >/dev/null
  '';

  buildPhase = ''
    runHook preBuild

    emcc zstd.c -flto -o zstd.js -Oz --memory-init-file 0 \
      $NIX_CFLAGS_COMPILE $EM_FLAGS \
      -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap"]' \
      -s EXPORTED_FUNCTIONS='${builtins.toJSON exportedFunctions}'

    runHook postBuild
  '';

  checkPhase = ''
    runHook preCheck

    # TODO

    runHook postCheck
  '';

  installPhase = ''
    runHook preInstall

    install -D -m 644 zstd.js $out/zstd.js
    install -D -m 644 zstd.wasm $out/zstd.wasm

    runHook postInstall
  '';

  meta = with lib; {
    platforms = platforms.unix;
    badPlatforms = platforms.darwin; # wasm-ld gets passed broken arguments
  };
}
