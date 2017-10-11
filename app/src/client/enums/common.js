export function createOptions(values, labels) {
  return values.map(value => ({value, label: labels[value]}));
}
