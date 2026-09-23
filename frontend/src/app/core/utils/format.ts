export function formatFcfa(amount: number): string {
  const formatted = amount.toLocaleString('fr-FR', {
    maximumFractionDigits: 0,
  });
  return `${formatted} FCFA`;
}