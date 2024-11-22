const formatPrice = (price) => {
  const priceNumber = Number(price);
  if (isNaN(priceNumber)) return "Invalid price";
  const formatted = "Rp. " + priceNumber.toLocaleString("id-ID");
  return formatted;
};

const formatPriceBase = (price) => {
  const priceNumber = Number(price);
  if (isNaN(priceNumber)) return "Invalid price";
  const formatted = priceNumber.toLocaleString("id-ID");
  return formatted;
};

const unformatPriceBase = (formattedPrice) => {
  if (!formattedPrice) return 0;
  const priceString = formattedPrice.replace(/[^0-9,.-]+/g, "");
  const cleanString = priceString.replace(/\./g, "").replace(",", ".");
  return parseFloat(cleanString);
};

export { formatPrice, formatPriceBase, unformatPriceBase };
