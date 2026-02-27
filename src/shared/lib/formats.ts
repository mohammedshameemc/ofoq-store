export const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-QA", {
    style: "currency",
    currency: "QAR",
    minimumFractionDigits: 2,
  }).format(price);
};

export const formatNumber = (number: number) => {
  return new Intl.NumberFormat("en-QA").format(number);
};
