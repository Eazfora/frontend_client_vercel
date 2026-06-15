import { useState, useEffect } from 'react';
import { X, Calendar, User, Package, Layers } from 'lucide-react';
import axios from 'axios';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
}

export default function TransactionModal({ isOpen, onClose, onSuccess }: TransactionModalProps) {
  const [formData, setFormData] = useState({
    invoiceDate: new Date().toISOString().split('T')[0],
    customerId: '', // Kembali diketik manual
    productId: '',
    quantity: 1,
    unitPrice: 0,
    status: 'Completed',
  });
  
  const [totalSales, setTotalSales] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [region, setRegion] = useState('Jakarta');
  
  // State khusus untuk Produk saja
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Tarik data produk saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/immutability
      fetchProducts();
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('https://backend-service-vercel-up9v.vercel.app', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data.data || []);
    } catch (err) {
      console.error('Gagal mengambil daftar produk:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Otomatis hitung total pendapatan
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTotalSales(formData.quantity * formData.unitPrice);
  }, [formData.quantity, formData.unitPrice]);

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedProductId = e.target.value;
    const selectedProduct = products.find(p => p.id === selectedProductId);
    
    setFormData({
      ...formData,
      productId: selectedProductId,
      unitPrice: selectedProduct ? selectedProduct.price : 0
    });
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('access_token');

    const payload = {
      ...formData,
      invoiceDate: new Date(formData.invoiceDate).toISOString(),
      quantity: Number(formData.quantity),
      unitPrice: Number(formData.unitPrice),
      totalSales: totalSales,
    };

    try {
      const finalPayload = {
        ...payload,
        region: region
      };

      await axios.post('https://backend-service-vercel-up9v.vercel.app/api/dashboard/transactions', finalPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onSuccess();
      onClose();
      // Reset form ke kondisi awal
      setFormData({
        invoiceDate: new Date().toISOString().split('T')[0],
        customerId: '',
        productId: '',
        quantity: 1,
        unitPrice: 0,
        status: 'Completed',
      });
    } catch (err: any) {
      console.error('Gagal menyimpan transaksi:', err);
      // Menampilkan pesan error dari backend (termasuk peringatan stok kurang)
      setError(err.response?.data?.message || 'Gagal menyimpan transaksi ke database.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden transform transition-all">
        
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Input Transaksi Baru</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Tanggal Invoice</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input type="date" required value={formData.invoiceDate} onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })} className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">ID Pelanggan</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input type="text" required placeholder="Contoh: 169559" value={formData.customerId} onChange={(e) => setFormData({ ...formData, customerId: e.target.value })} className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Pilih Produk</label>
            <div className="relative">
              <Package className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <select 
                required 
                value={formData.productId} 
                onChange={handleProductChange} 
                disabled={loadingProducts}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500 appearance-none"
              >
                <option value="" disabled>
                  {loadingProducts ? "Memuat produk..." : "-- Pilih Produk --"}
                </option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} (Sisa Stok: {product.stock})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Jumlah (Qty)</label>
              <input type="number" min="1" required value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: Math.max(1, parseInt(e.target.value) || 1) })} className="w-full px-4 py-2 text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Harga Satuan</label>
              <div className="relative">
                <input type="number" min="0" required placeholder="Rp" value={formData.unitPrice || ''} onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-2 text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Status</label>
            <div className="relative">
              <Layers className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500 appearance-none">
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>
          </div>

         <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Wilayah Penjualan
          </label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="Jakarta">Jakarta</option>
            <option value="Luar Jakarta">Luar Jakarta</option>
          </select>
        </div>

          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl flex justify-between items-center">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase">Estimasi Total:</span>
            <span className="text-base font-bold text-emerald-700 dark:text-emerald-300">
              Rp {totalSales.toLocaleString('id-ID')}
            </span>
          </div>

          

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white rounded-xl transition-all">
              Batal
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-md transition-all disabled:opacity-50">
              {loading ? 'Memproses...' : 'Simpan Transaksi'}
            </button>
          </div>
        </form>
      </div>
    </div>

    
  );
}