declare module 'lzma-purejs' {
    export function compress(data: Uint8Array | number[]): number[];
    export function decompress(data: Uint8Array | number[]): number[];
}
