/**
 * Rupiah Currency Formatter
 * Formats numbers as Indonesian Rupiah: Rp 1.250.000
 */
export function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Short Rupiah formatter for charts (e.g., Rp 1,2jt)
 */
export const formatRupiahShort = (value: number) => {
  // Jika nilainya 0 atau kosong
  if (!value) return 'Rp 0';

  // Jika nilainya Jutaan (contoh: 1.500.000 menjadi Rp 1.5jt)
  if (value >= 1000000) {
    const formatted = (value / 1000000).toFixed(1);
    // .replace('.0', '') berfungsi agar 2.0jt tampil sebagai 2jt saja
    return `Rp ${formatted.replace('.0', '')}jt`;
  }

  // Jika nilainya Ribuan (contoh: 450.000 menjadi Rp 450rb)
  if (value >= 1000) {
    const formatted = (value / 1000).toFixed(0);
    return `Rp ${formatted}rb`;
  }

  // Jika nilainya ratusan perak (contoh: 500 menjadi Rp 500)
  return `Rp ${value}`;
};
