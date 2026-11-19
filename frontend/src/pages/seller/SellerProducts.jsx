import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Package, 
  Plus, 
  Edit3, 
  Trash2, 
  ArrowLeft, 
  Upload, 
  Check, 
  AlertCircle, 
  Tag, 
  Eye, 
  ToggleLeft, 
  ToggleRight 
} from 'lucide-react';
import { api, formatUGX } from '../../services/api';

const CATEGORIES = [
  'Textbooks and Academic Materials',
  'Electronics and Gadgets',
  'Clothing and Fashion',
  'Furniture and Accommodation Items',
  'Sports and Fitness',
  'Other Campus Essentials'
];

const CONDITIONS = ['New', 'Like New', 'Used'];

export default function SellerProducts({ onToast }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form States
  const [isModalOpen, setIsModalOpen] = useState(searchParams.get('action') === 'add');
  const [editingItem, setEditingItem] = useState(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [condition, setCondition] = useState(CONDITIONS[2]); // Used
  const [imageUrl, setImageUrl] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadItems = async () => {
    try {
      setLoading(true);
      const res = await api.getSellerItems();
      if (res.success) {
        setItems(res.items || []);
      }
    } catch (err) {
      if (onToast) onToast('Failed to load your listings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
    if (searchParams.get('action') === 'add') {
      openAddModal();
    }
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setTitle('');
    setDescription('');
    setPrice('');
    setCategory(CATEGORIES[0]);
    setCondition(CONDITIONS[2]);
    setImageUrl('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600');
    setPhotoFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description);
    setPrice(item.price);
    setCategory(item.category);
    setCondition(item.condition_state);
    setImageUrl(item.image_url);
    setPhotoFile(null);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (item) => {
    try {
      const res = await api.toggleItemStatus(item.id);
      if (res.success) {
        if (onToast) onToast(res.message, 'success');
        await loadItems();
      }
    } catch (err) {
      if (onToast) onToast('Failed to update status.', 'error');
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete listing "${item.title}"?`)) {
      return;
    }

    try {
      const res = await api.deleteItem(item.id);
      if (res.success) {
        if (onToast) onToast('Product listing removed.', 'success');
        await loadItems();
      }
    } catch (err) {
      if (onToast) onToast('Failed to delete product.', 'error');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !price) {
      if (onToast) onToast('Please fill in all required fields.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      let finalImg = imageUrl;

      // Handle photo upload if a file was selected
      if (photoFile) {
        const formData = new FormData();
        formData.append('image', photoFile);
        const uploadRes = await api.uploadPhoto(formData);
        if (uploadRes.success && uploadRes.imageUrl) {
          finalImg = uploadRes.imageUrl;
        }
      }

      if (editingItem) {
        // Update existing item
        await api.updateItem(editingItem.id, {
          title: title.trim(),
          description: description.trim(),
          price: Number(price),
          category,
          condition_state: condition,
          image_url: finalImg
        });
        if (onToast) onToast('Listing updated successfully.', 'success');
      } else {
        // Create new item
        await api.createItem({
          title: title.trim(),
          description: description.trim(),
          price: Number(price),
          category,
          condition_state: condition,
          image_url: finalImg
        });
        if (onToast) onToast('New product listed on UniTrade!', 'success');
      }

      setIsModalOpen(false);
      await loadItems();
    } catch (err) {
      if (onToast) onToast(err.message || 'Operation failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            to="/seller/dashboard"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Manage Product Listings
          </h1>
          <p className="text-xs text-slate-500">
            Add, update, or remove your items currently available for campus students
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 rounded-xl bg-brand-orange hover:bg-orange-600 text-white font-black text-xs transition-colors shadow-md flex items-center space-x-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Product Listings Table */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center">
          <div className="w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Loading your listings...</p>
        </div>
      ) : items.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="py-4 px-6">Product</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Condition</th>
                  <th className="py-4 px-4">Price (UGX)</th>
                  <th className="py-4 px-4">Availability</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-12 h-12 object-cover rounded-xl border border-slate-200 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <Link
                            to={`/products/${item.id}`}
                            className="font-bold text-slate-900 hover:text-brand-blue truncate block max-w-xs"
                          >
                            {item.title}
                          </Link>
                          <span className="text-[11px] text-slate-400">
                            Listed: {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-medium text-slate-600 truncate max-w-[160px]">
                      {item.category}
                    </td>

                    <td className="py-4 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                        {item.condition_state}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-black text-brand-blue">
                      {formatUGX(item.price)}
                    </td>

                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                          item.is_available
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        }`}
                        title="Click to toggle availability"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${item.is_available ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span>{item.is_available ? 'Available' : 'Unavailable'}</span>
                      </button>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/products/${item.id}`}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                          title="View on Marketplace"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-amber-50"
                          title="Edit Listing"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-900 text-sm">No products listed yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Ready to sell? Click below to post your first textbook, calculator, or hostel item on UniTrade.
          </p>
          <button
            onClick={openAddModal}
            className="px-5 py-2.5 bg-brand-orange text-white rounded-xl text-xs font-bold hover:bg-orange-600 shadow-sm"
          >
            Add Your First Product
          </button>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-lg">
                  {editingItem ? 'Edit Product Listing' : 'List New Campus Item'}
                </h3>
                <p className="text-xs text-slate-500">
                  Provide accurate details to help campus students find your item
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Product Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Casio fx-991EX Scientific Calculator"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-blue focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-blue focus:outline-none bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Condition <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-blue focus:outline-none bg-white"
                  >
                    {CONDITIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Price in Ugandan Shillings (UGX) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="500"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 75000"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-brand-blue focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Detailed Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Specify edition, battery condition, accessories included, or any marks..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-blue focus:outline-none"
                />
              </div>

              {/* Photo Upload or URL */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Product Photograph (Upload File or Enter Image URL)
                </label>
                
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhotoFile(e.target.files[0])}
                    className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-brand-blue hover:file:bg-blue-100"
                  />
                </div>

                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Or paste web image link: https://..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-blue focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-brand-orange hover:bg-orange-600 text-white font-extrabold text-xs transition-colors shadow-md"
                >
                  {submitting ? 'Saving...' : editingItem ? 'Update Listing' : 'Publish Listing'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
