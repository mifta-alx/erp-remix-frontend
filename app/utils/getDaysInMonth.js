function getDaysInMonth(
  month = new Date().getMonth(),
  year = new Date().getFullYear()
) {
  const date = new Date(year, month, 1);
  const days = [];

  const firstDayOfMonth = date.getDay();
  const previousMonth = month === 0 ? 11 : month - 1;
  const previousYear = month === 0 ? year - 1 : year;
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  const lastDateOfPreviousMonth = new Date(
    previousYear,
    previousMonth + 1,
    0
  ).getDate();

  for (let i = firstDayOfMonth; i > 0; i--) {
    days.push({
      date: new Date(
        previousYear,
        previousMonth,
        lastDateOfPreviousMonth - i + 1
      ),
      isFromPreviousMonth: true,
    });
  }

  while (date.getMonth() === month) {
    days.push({ date: new Date(date), isFromPreviousMonth: false });
    date.setDate(date.getDate() + 1);
  }

  const totalDaysInMonth = days.length;
  const remainingSlots = 42 - totalDaysInMonth;

  for (let i = 1; i <= remainingSlots; i++) {
    days.push({
      date: new Date(nextYear, nextMonth, i),
      isFromNextMonth: true,
    });
  }

  return days;
}

export default getDaysInMonth;
