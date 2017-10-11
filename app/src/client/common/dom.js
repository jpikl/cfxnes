const focusableElementSelector = [
  'a[href]', 'area[href]', 'button', 'details',
  'input', 'iframe', 'select', 'textarea',
].join(', ');

function isFocusAllowed({disabled, tabIndex}) {
  return !disabled && (!tabIndex || tabIndex >= 0);
}

export function findFocusableDescendants(root) {
  const nodeList = root.querySelectorAll(focusableElementSelector);
  return Array.from(nodeList).filter(isFocusAllowed);
}

export function isAncestorOrSelf(node, target) {
  for (; node != null; node = node.parentNode) {
    if (node === target) {
      return true;
    }
  }
  return false;
}

