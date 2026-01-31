export function getStartOfWeek(date: Date): Date {
  const dateCopy = new Date(date);
  const dayOfWeek = dateCopy.getDay();

  dateCopy.setDate(dateCopy.getDate() - dayOfWeek);

  dateCopy.setHours(0, 0, 0, 0);
  return dateCopy;
}

export function getStartOfMonth(date: Date) {
  const dateCopy = new Date(date);

  dateCopy.setDate(1);
  dateCopy.setHours(0, 0, 0, 0);
  return dateCopy;
}

export function getStartOfDay(date: Date): Date {
  const dateCopy = new Date(date);
  dateCopy.setHours(0, 0, 0, 0);
  return dateCopy;
}

export function isWithinRange(date: Date, start: Date, end: Date) {
  return start <= date && date <= end;
}
