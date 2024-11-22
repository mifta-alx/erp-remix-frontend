const formatToDecimal = (value) => {
  const number = parseFloat(value);
  if (isNaN(number)) return "Input harus berupa angka.";
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
