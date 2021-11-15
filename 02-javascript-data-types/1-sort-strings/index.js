/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const arrNormalize = arr.map(item => item.normalize());
  const compareFn = (a, b) => {
    const compareParams = [['ru', 'en'], {sensitivity: 'variant', caseFirst: 'upper'}];
    return (param === 'asc') ? a.localeCompare(b, ...compareParams) : b.localeCompare(a, ...compareParams);
  };

  return arrNormalize.sort(compareFn);
}
