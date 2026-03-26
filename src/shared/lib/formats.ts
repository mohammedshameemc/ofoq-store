export const formatPrice = (price = 0, currency = "QAR") => {
  return new Intl.NumberFormat("en-QA", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(price);
};

export const formatNumber = (number: number) => {
  return new Intl.NumberFormat("en-QA").format(number);
};
