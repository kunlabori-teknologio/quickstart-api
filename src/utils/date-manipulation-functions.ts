export function convertBirthdayStringToDate(birthday: string): Date {
  const dateSplited = birthday.split('/');
  const dateString = `${dateSplited[1]}/${dateSplited[0]}/${dateSplited[2]}`;
  const date = new Date(dateString);
  return date;
}

export function theDatesMatch(date1: Date, date2: Date): boolean {
  const date1WithoutTime = new Date(date1).setHours(0, 0, 0, 0);
  const date2WithoutTime = new Date(date2).setHours(0, 0, 0, 0);
  return date1WithoutTime === date2WithoutTime;
}
