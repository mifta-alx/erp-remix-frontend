export const formatPrice = price => {
    const priceNumber = Number(price);
    if (isNaN(priceNumber)) return "Invalid price";
    const formatted = "Rp. " + priceNumber.toLocaleString('id-ID');
    return formatted;
};
