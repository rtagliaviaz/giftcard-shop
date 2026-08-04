const giftCards = [
  { id: 1, name: 'Steam Gift Card', amount: '5.00' },
  { id: 2, name: 'Steam Gift Card', amount: '10.00' },
  { id: 3, name: 'Steam Gift Card', amount: '20.00' },
  { id: 4, name: 'Steam Gift Card', amount: '50.00' },
  { id: 5, name: 'Steam Gift Card', amount: '100.00' },
  { id: 6, name: 'Amazon Gift Card', amount: '10.00' },
  { id: 7, name: 'Amazon Gift Card', amount: '25.00' },
  { id: 8, name: 'Amazon Gift Card', amount: '50.00' },
  { id: 9, name: 'Eneba Gift Card', amount: '10.00' },
  { id: 10, name: 'Eneba Gift Card', amount: '25.00' },
  { id: 11, name: 'Eneba Gift Card', amount: '50.00' },
];

const usedCodes = new Set();

const generateUniqueCode = (name: string, amount: string): string => {
  let code;
  let attempts = 0;
  do {
    const random = Math.floor(Math.random() * 900000) + 100000;
    code = `${name}_${amount}_CODE_${random}`;
    attempts++;
  } while (usedCodes.has(code) && attempts < 100);
  usedCodes.add(code);
  return code;
};

giftCards.forEach(gc => {
  for (let i = 0; i < 20; i++) {
    const code = generateUniqueCode(gc.name, gc.amount);
    console.log(`(${gc.id}, '${code}'),`);
  }
});