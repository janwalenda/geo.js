import { SVG_NS } from './svgMarkup';
import type { SVGNode } from './types';

/** Create the DOM elements for `tree`. */
export function createSvgElement(tree: SVGNode): SVGElement {
  const node = document.createElementNS(SVG_NS, tree.tag);
  if (!(node instanceof SVGElement)) {
    throw new TypeError(`geo: <${tree.tag}> is not an SVG element`);
  }
  for (const [name, value] of Object.entries(tree.attrs)) {
    node.setAttribute(name, value);
  }
  for (const child of tree.children ?? []) {
    node.appendChild(createSvgElement(child));
  }
  return node;
}

/**
 * Update `node` in place to exactly `tree` (attributes and children,
 * recursively), reusing elements whose tag still matches.
 */
export function syncSvgElement(node: SVGElement, tree: SVGNode): void {
  const { attrs } = tree;
  for (const name of node.getAttributeNames()) {
    if (!(name in attrs)) {
      node.removeAttribute(name);
    }
  }
  for (const [name, value] of Object.entries(attrs)) {
    if (node.getAttribute(name) !== value) {
      node.setAttribute(name, value);
    }
  }
  const children = tree.children ?? [];
  const existing = Array.from(node.children).filter(
    (child): child is SVGElement => child instanceof SVGElement,
  );
  children.forEach((child, i) => {
    writeSvgChild(node, existing.at(i), child);
  });
  for (const extra of existing.slice(children.length)) {
    extra.remove();
  }
}

/**
 * Make `current` (a child of `parent`, if any) match `tree`: update it in
 * place, replace it, or append a new child.
 */
export function writeSvgChild(
  parent: Element,
  current: SVGElement | undefined,
  tree: SVGNode,
): SVGElement {
  if (current?.tagName === tree.tag) {
    syncSvgElement(current, tree);
    return current;
  }
  const fresh = createSvgElement(tree);
  if (current) {
    current.replaceWith(fresh);
  } else {
    parent.appendChild(fresh);
  }
  return fresh;
}
