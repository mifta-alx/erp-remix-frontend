const formatToDecimal = (value) => {
  const number = parseFloat(value);
  if (isNaN(number)) return "Input harus berupa angka.";

  // konversi value menjadi string
  const valueStr = value.toString();
  const decimalPlaces = valueStr.includes(".")
    ? valueStr.split(".")[1].length
    : 0;

  // jika jumlah desimal lebih dari 2, show sesuai input, jika tidak, format ke 2 desimal
  if (decimalPlaces > 2) {
    return number.toString();
  }
  return number.toFixed(2);
};

const unformatToDecimal = (formattedValue) => {
  if (typeof formattedValue === "string") {
    const number = parseFloat(formattedValue);
    if (isNaN(number)) return "Input harus berupa angka.";
    return number;
  }
  return "Input harus berupa angka."; // Handle non-string input
};

export { formatToDecimal, unformatToDecimal };
