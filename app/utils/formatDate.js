const formatDate = (date) => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = months[date.getMonth()];
  const monthNumber = date.getMonth();
  const day = date.getDate();
  const year = date.getFullYear();

  return `${day}/${monthNumber}/${year}`;
};

const formatDatetime = (date) => {
  const utcOffset = 7; // UTC+7
  const localDate = new Date(date);

  // Menambahkan offset UTC+7 ke waktu asli
  localDate.setHours(localDate.getHours() + utcOffset);

  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, "0"); // Bulan 1-12
  const day = String(localDate.getDate()).padStart(2, "0");
  const hours = String(localDate.getHours()).padStart(2, "0");
  const minutes = String(localDate.getMinutes()).padStart(2, "0");
  const seconds = String(localDate.getSeconds()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

export { formatDate, formatDatetime };
