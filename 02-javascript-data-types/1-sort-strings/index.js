/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const arrNormalize = arr.map(item => item.normalize());
  const compareFn = (a, b) => a.localeCompare(b, ['ru', 'en'], {sensitivity: 'variant', caseFirst: 'upper'});
  const resArr = arrNormalize.sort(compareFn);

  if (param === 'asc') {
    return resArr;
  }

  if (param === 'desc') {
    return resArr.reverse();
  }
}
