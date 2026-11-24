/**
 * `window.devicePixelRatio` where it exists (browsers), otherwise `fallback`
 * (Node, workers without a screen).
 */
export function devicePixelRatioOr(fallback: number): number {
  const ratio: unknown = Reflect.get(globalThis, 'devicePixelRatio');
  return typeof ratio === 'number' ? ratio : fallback;
}
