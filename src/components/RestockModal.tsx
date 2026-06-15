import { useState, useEffect } from 'react';
import axios from 'axios';

// 1. Mendefinisikan tipe data untuk Props
interface RestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestockSuccess: () => void;
}

// 2. Mendefinisikan tipe data untuk Produk
interface Product {
  id: string;
  name: string;
  stock: number;
}

export default function RestockModal({ isOpen, onClose, onRestockSuccess }: RestockModalProps) {
  // 3. Memberitahu TypeScript bahwa state ini berisi Array of Product
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [addedQuantity, setAddedQuantity] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      // Menambahkan token autentikasi (karena Dashboard.tsx kamu menggunakan ini)
      const token = localStorage.getItem('access_token');
      
      axios.get('https://backend-service-vercel-up9v.vercel.app/api/dashboard/products', {
        headers: { Authorization: `Bearer ${token}` }
      }) 
        .then(res => setProducts(res.data.data))
        .catch(err => console.error("Gagal memuat produk:", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 4. Memberikan tipe data pada event form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // 5. Mengubah string menjadi Number sebelum melakukan perbandingan <= 0
    if (!selectedProductId || !addedQuantity || Number(addedQuantity) <= 0) {
      alert('Pilih produk dan masukkan jumlah yang valid!');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      await axios.patch(`https://backend-service-vercel-up9v.vercel.app/api/dashboard/update-stock/${selectedProductId}`, {
        addedQuantity: Number(addedQuantity)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Stok berhasil ditambahkan! Peringatan telah diperbarui.');
      setAddedQuantity('');
      setSelectedProductId('');
      onRestockSuccess(); 
      onClose(); 
    } catch (error) {
      alert('Gagal menambah stok.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg w-full max-w-md p-6 relative animate-fade-in-up border border-slate-100 dark:border-slate-700">
        
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-red-500 text-xl font-bold transition-colors"
        >
          &times;
        </button>

        <h2 className="text-xl font-bold mb-1 text-slate-900 dark:text-white">Tindakan Cepat: Restock</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
          Tambahkan stok barang untuk menghilangkan status peringatan.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Pilih Produk
            </label>
            <select 
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
            >
              <option value="">-- Pilih Produk --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} (Sisa: {p.stock})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Jumlah Tambahan
            </label>
            <input 
              type="number"
              min="1"
              placeholder="Contoh: 50"
              value={addedQuantity}
              onChange={(e) => setAddedQuantity(e.target.value)}
              className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
            />
          </div>

          <div className="flex gap-3 mt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 py-2.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-semibold"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 bg-brand-600 text-white py-2.5 rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-70 font-semibold"
            >
              {isLoading ? 'Memproses...' : 'Simpan Stok'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}