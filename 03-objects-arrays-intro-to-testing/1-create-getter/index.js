/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const arrKeys = path.split('.');
  return (obj) => getValue(obj, arrKeys);
}

function getValue(obj, props) {
  for (let [key, value] of Object.entries(obj)) {
    if (props.includes(key)) {
      if (typeof (value) === "object") {
        return getValue(value, props);
      } else {
        return value;
      }
    }
  }
}
