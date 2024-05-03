export function removeDuplicates(arr: [], key:string) {
    const uniqueValues = new Set();
    return arr.filter((obj) => {
      const keyValue = obj[key];
      if (uniqueValues.has(keyValue)) {
        return false;
      } else {
        uniqueValues.add(keyValue);
        return true;
      }
    });
  }