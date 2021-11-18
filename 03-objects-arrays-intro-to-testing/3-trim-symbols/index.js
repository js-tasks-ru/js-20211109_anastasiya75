/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size === undefined) {
    return string;
  }

  if (size === 0) {
    return '';
  }

  const arr = string.split('');
  let counter = 0;

  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === arr[i + 1]) {
      counter += 1;

      if (counter >= size) {
        arr[i] = '';
      }
    } else {
      counter = 0;
    }
  }
  return arr.join('');
}
