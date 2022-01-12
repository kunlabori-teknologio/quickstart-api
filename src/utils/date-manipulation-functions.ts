export async function convertBirthdayStringToDate(birthday: string): Promise<Date> {
  const dateSplited = birthday.split('/');
  const dateString = `${dateSplited[1]}/${dateSplited[0]}/${dateSplited[2]}`;
  const date = new Date(dateString);
  return date;
}

export async function compareDates(date1: Date, date2: Date): Promise<boolean> {
  const date1WithoutTime = new Date(date1).setHours(0, 0, 0, 0);
  const date2WithoutTime = new Date(date2).setHours(0, 0, 0, 0);
  return date1WithoutTime === date2WithoutTime;
}
