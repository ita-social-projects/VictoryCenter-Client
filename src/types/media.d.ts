// Enables importing media files in TypeScript.
// Webpack will return a URL string for the asset.

declare module '*.mp4' {
    const src: string;
    export default src;
}
