const str = require('@supercharge/strings');

exports.checkNames = (moduleNames, namingConvention) => {
  let isCamel;
  for (let index = 0; index < moduleNames.length; index++) {
    const name = moduleNames[index];
    switch (namingConvention) {
      case 'camelCase':
        isCamel = str(name).isCamel();
        if (!isCamel) throw new Error(`${name} is not camel case`);
        break;

      case 'UpperCamelCase':
        const isCapitalize = str(name.charAt(0)).isUpper();
        isCamel = str(name.substring(1)).isCamel();
        if (!isCapitalize || !isCamel) throw new Error(`${name} is not upper camel case`);
        break;

      case 'spinal-case':
        const hasUpper = name.toLowerCase() !== name;
        const hasSpecialCharLessHifen = /[`!@#$%^&*()_+\=\[\]{};':"\\|,.<>\/?~]/g.test(name);
        const hasSpaceChar = /\s/g.test(name);
        if (hasUpper || hasSpecialCharLessHifen || hasSpaceChar)
          throw new Error(`${name} is not spinal case`);
        break;

      default:
        break;
    }
    console.info(`${name}: OK`);
  }
}

