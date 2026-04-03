export const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export const formatMoney = (amount: number) => currencyFormatter.format(amount);

const parseUtcDateString = (value: string): Date => {
  if (value.includes("T")) {
    return new Date(value);
  }

  return new Date(`${value}T00:00:00.000Z`);
};

export const formatDate = (value: string) =>
  dateFormatter.format(parseUtcDateString(value));

export const formatDateTime = (value: string) =>
  dateTimeFormatter.format(parseUtcDateString(value));
