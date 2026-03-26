/**
 * Utility to convert numbers to words (English) for Omani Rial currency.
 */

const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const thousands = ['', 'Thousand', 'Million', 'Billion'];

function convertGroup(n: number): string {
  let res = '';
  if (n >= 100) {
    res += units[Math.floor(n / 100)] + ' Hundred ';
    n %= 100;
  }
  if (n >= 10 && n <= 19) {
    res += teens[n - 10] + ' ';
  } else if (n >= 20 || n > 0) {
    res += tens[Math.floor(n / 10)] + ' ' + (n % 10 > 0 ? units[n % 10] + ' ' : '');
  }
  return res.trim();
}

export function numberToWords(num: number): string {
  if (num === 0) return 'Zero';
  
  // Split into Rial and Baiza
  const rials = Math.floor(num);
  const baizas = Math.round((num - rials) * 1000);
  
  let result = '';
  
  if (rials > 0) {
    let groupIdx = 0;
    let tempRials = rials;
    while (tempRials > 0) {
      const group = tempRials % 1000;
      if (group > 0) {
        result = convertGroup(group) + (thousands[groupIdx] ? ' ' + thousands[groupIdx] : '') + ' ' + result;
      }
      tempRials = Math.floor(tempRials / 1000);
      groupIdx++;
    }
    result = result.trim() + ' Omani Rial';
  }
  
  if (baizas > 0) {
    if (result) result += ' and ';
    result += convertGroup(baizas) + ' Baiza';
  }
  
  return result.trim();
}
