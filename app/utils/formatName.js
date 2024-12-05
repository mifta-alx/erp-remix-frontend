const formatProductName = (item) => {
  return item.internal_reference
    ? `[${item.internal_reference}] ${item.name}`
    : item.name;
};

const formatBomName = (item) => {
  if (item?.bom_reference && item?.product.internal_reference) {
    return `${item?.bom_reference}: [${item?.product.internal_reference}] ${item?.product.name}`;
  }

  if (item?.bom_reference) {
    return `${item?.bom_reference}: ${item?.product.name}`;
  }
  if (item?.product.internal_reference) {
    return `[${item?.product.internal_reference}] ${item?.product.name}`;
  }
  return item?.product.name;
};

export { formatProductName, formatBomName };
