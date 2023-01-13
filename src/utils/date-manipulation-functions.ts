export function convertBirthdayStringToDate(birthday: string): Date {
  const dateSplited = birthday.split('/');
  const dateString = `${dateSplited[1]}/${dateSplited[0]}/${dateSplited[2]}`;
  const date = new Date(dateString);
  return date;
}

export function theDatesMatch(date1: Date, date2: string): boolean {
  return date1.toISOString().substring(0, 10) === date2.substring(0, 10);
}

export function convertStringFieldsToDate(object: any, dateFieldsArray: string[]): any{

  const fields = Object.keys(object);

  for (let fieldIndex = 0; fieldIndex < fields.length; fieldIndex++) {
    const field = fields[fieldIndex];

    if(Array.isArray(object[field])){
      object[field] = object[field].map((obj:any) => convertStringFieldsToDate(obj, dateFieldsArray))
    } else if(dateFieldsArray.includes(field) && object[field]) object[field] = new Date(object[field])
  }

  return object;
}
