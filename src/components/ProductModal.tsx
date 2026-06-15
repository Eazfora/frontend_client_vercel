import { useState } from 'react';
import { X, Package, Tag, Database, DollarSign, Layers } from 'lucide-react';
import axios from 'axios';

export interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProductModal({ isOpen, onClose, onSuccess }: ProductModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    stock: 1,
    category: 'Elektronik',
    price: 0,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('access_token');

    const payload = {
      ...formData,
      stock: Number(formData.stock),
      price: Number(formData.price),
    };

    try {
      await axios.post('http://localhost:3000/api/dashboard/products', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onSuccess(); 
      onClose();   
      setFormData({ name: '', sku: '', stock: 1, category: 'Elektronik', price: 0 });
    } catch (err: any) {
      console.error('Gagal menyimpan produk:', err);
      setError(err.response?.data?.message || 'Gagal menyimpan produk ke database.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden transform transition-all">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Tambah Produk Baru</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Nama Produk</label>
            <div className="relative">
              <Package className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input type="text" required placeholder="Contoh: Monitor Gaming 24 Inch" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">SKU (Kode Barang)</label>
            <div className="relative">
              <Tag className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input type="text" required placeholder="Contoh: ELEC-003" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })} className="w-full pl-10 pr-4 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Kategori</label>
            <div className="relative">
              <Layers className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500 appearance-none">
                <option value="Elektronik">Elektronik</option>
                <option value="Perangkat Keras">Perangkat Keras</option>
                <option value="Aksesoris">Aksesoris</option>
                <option value="Minuman">Minuman</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Stok Awal</label>
              <div className="relative">
                <Database className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input type="number" min="0" required value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: Math.max(0, parseInt(e.target.value) || 0) })} className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Harga Satuan</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input type="number" min="0" required placeholder="Rp" value={formData.price || ''} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white rounded-xl transition-all">
              Batal
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-md transition-all disabled:opacity-50">
              {loading ? 'Menyimpan...' : 'Simpan Produk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}