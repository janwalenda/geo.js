/**
 * The first element matching `selector` inside `root`. Throws if there is
 * none, so a broken demo page fails loudly instead of later with `null`.
 */
export function requireElement(
  selector: string,
  root: ParentNode = document,
): HTMLElement {
  const element = root.querySelector(selector);
  if (!(element instanceof HTMLElement)) {
    throw new TypeError(`demo: missing element "${selector}"`);
  }
  return element;
}

/** The 2D context of `canvas`; throws if the browser cannot provide one. */
export function require2d(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('demo: canvas 2D context is not available');
  }
  return context;
}
