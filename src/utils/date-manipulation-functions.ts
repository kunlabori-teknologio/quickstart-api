export function convertBirthdayStringToDate(birthday: string): Date {
  const dateSplited = birthday.split('/');
  const dateString = `${dateSplited[1]}/${dateSplited[0]}/${dateSplited[2]}`;
  const date = new Date(dateString);
  return date;
}

export function theDatesMatch(date1: Date, date2: string): boolean {
  return date1.toISOString().substring(0, 10) === date2.substring(0, 10);
}
