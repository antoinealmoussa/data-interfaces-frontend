export const formatDate = (date: Date | string): string =>
  new Date(date).toLocaleDateString("fr-FR");

export const formatNumber = (n: number): string => n.toLocaleString("fr-FR");
