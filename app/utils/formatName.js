const formatProductName = (item) => {
  return item.internal_reference
    ? `[${item.internal_reference}] ${item.name}`
    : item.name;
};

const formatBomName = (item) => {
  return `${item?.bom_reference ? item.bom_reference + ":" : ""} ${
    item?.product?.internal_reference
      ? `[${item.product.internal_reference}]`
      : ""
  } ${item?.product?.name || ""}`;
};

export { formatProductName, formatBomName };
