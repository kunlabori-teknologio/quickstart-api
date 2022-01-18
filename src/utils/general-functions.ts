// Unique id type and length interface
interface UniqueIdTypeLength {
  type: string,
  length: number,
}
// Length of unique id by county
const uniqueIdLength: Map<String, UniqueIdTypeLength[]> = new Map([
  ['br', [
    {type: 'person', length: 11},
    {type: 'company', length: 14},
  ]]
]);
/**
 * Check if unique belongs a person or a company
 * @param uniqueId
 * @param country ex.: 'br'
 * @returns 'person' or 'company'
 */
export function checkIfPersonOrCompanyUniqueId(uniqueId: string, country: string): any {
  const uniqueIdOnlyNumber: string = uniqueId.replace(/[^a-zA-Z0-9]/g, '');
  const uniqueIdNumberCount: number = uniqueIdOnlyNumber.length;
  const type = uniqueIdLength.get(country)?.find(el => el.length === uniqueIdNumberCount);
  return (type && type.type) || '';
}
