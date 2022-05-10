import pluralize from 'pluralize';

export function pascalfy(text: string): string {
  const pascalCase = text
    .replace(/([A-Z])/g, '$1')
    .replace(/^./, function (str) {
      return str.toUpperCase();
    });

  return pascalCase;
}

export function kebabfy(text: string): string {
  const kebabCase = text
    .split('')
    .map((letter: string, idx: number) => {
      return letter.toUpperCase() === letter
        ? `${idx !== 0 ? '-' : ''}${letter.toLowerCase()}`
        : letter;
    })
    .join('');
  return kebabCase;
}

export function plurarize(text: string): string {
  return pluralize(text);
}

export function replaceKebabfyFunctionToString(template: string): string {
  const regex = /\%kebabfy(.*?)%/g;
  const foundKebabfies = template.match(regex);

  const stringsToKebakfy = foundKebabfies
    ?.join(',')
    .replace(/\%/g, '')
    .replace(/kebabfy/g, '')
    .replace(/\(|\)/g, '')
    .split(',');

  stringsToKebakfy?.forEach((stringToKebakfy, index) => {
    const kebabfyString = kebabfy(stringToKebakfy);
    const foundKebabfy =
      (foundKebabfies?.length && foundKebabfies[index]) || '';
    template = template.replace(foundKebabfy, kebabfyString);
  });

  return template;
}

export function replacePascalfyFunctionToString(template: string): string {
  const regex = /\%pascalfy(.*?)%/g;
  const foundPascalfies = template.match(regex);

  const stringsToPascalfy = foundPascalfies
    ?.join(',')
    .replace(/\%/g, '')
    .replace(/pascalfy/g, '')
    .replace(/\(|\)/g, '')
    .split(',');

  stringsToPascalfy?.forEach((stringToPascalfy, index) => {
    const pascalfyString = pascalfy(stringToPascalfy);
    const foundPascalfy =
      (foundPascalfies?.length && foundPascalfies[index]) || '';
    template = template.replace(foundPascalfy, pascalfyString);
  });
  return template;
}

export function replacePlurarizeFunctionToString(string: string): string {
  const regex = /\%pluralize(.*?)%/g;
  const foundPluralizes = string.match(regex);

  const stringsToPluralize = foundPluralizes
    ?.join(',')
    .replace(/\%/g, '')
    .replace(/pluralize/g, '')
    .replace(/\(|\)/g, '')
    .split(',');

  stringsToPluralize?.forEach((stringToPluralize, index) => {
    const pluralizeString = pluralize(stringToPluralize);
    const foundPluralize =
      (foundPluralizes?.length && foundPluralizes[index]) || '';
    string = string.replace(foundPluralize, pluralizeString);
  });
  return string;
}

export function kebabCaseToCamelCase(string: string) {
  return string.replace(/-\w/g, clearAndUpper);
}

export function kebabCaseToPascalCase(string: string) {
  return string.replace(/(^\w|-\w)/g, clearAndUpper);
}

export function clearAndUpper(string: string) {
  return string.replace(/-/, "").toUpperCase();
}
