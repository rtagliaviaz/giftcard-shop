export const normalizeGiftCardName = (type: string, denomination: number | string) => {
  const num = typeof denomination === 'string' ? parseFloat(denomination) : denomination;
  const denomStr = Number.isInteger(num) ? num.toString() : num.toFixed(2);
  return `${type} $${denomStr}`;
};