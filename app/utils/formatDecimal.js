export const formatToDecimal = (value) => {
  const number = parseFloat(value);
  if (isNaN(number)) return "Input harus berupa angka.";
  return number.toFixed(2);
};
