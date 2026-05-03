import React, { useEffect, useMemo, useRef, useState } from 'react';
import translations from '../translations/index';
import { useLang } from '../context/LangContext';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Filter,
  ChevronDown,
  ImageIcon,
  Upload,
  X,
  Tag,
  DollarSign,
  Printer,
  Download
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const PRODUCTS_API = `${API_BASE}/api/products`;
const CATEGORIES_API = `${API_BASE}/api/categories`;

const formatDate = (dateString, lang = 'en') => {
  if (!dateString) return '-';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '-';

  if (lang === 'km') {
    return date.toLocaleDateString('km-KH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default function Inventory() {
  const { lang } = useLang();
  const fileInputRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showItemModal, setShowItemModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingItemId, setEditingItemId] = useState(null);
  const [uploadMethod, setUploadMethod] = useState('url');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const [newItem, setNewItem] = useState({
    productName: '',
    price: '',
    cost: '',
    stockQty: 0,
    available: true,
    categoryId: '',
    trackMode: 'DIRECT',
    imageUrl: '',
    imageFile: null,
    imagePreview: null
  });

  const t = (key) => translations?.[lang]?.inventory?.[key] || key;

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter((p) => (p.productName || '').toLowerCase().includes(q));
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        (p) => String(p.category?.categoryId || '') === String(selectedCategory)
      );
    }

    return filtered;
  }, [products, search, selectedCategory]);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(CATEGORIES_API);
      if (!res.ok) throw new Error('Failed to fetch categories');

      const data = await res.json();
      setCategories(data);

      if (data.length > 0) {
        setNewItem((prev) => ({
          ...prev,
          categoryId: prev.categoryId || data[0].categoryId
        }));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(PRODUCTS_API);
      if (!res.ok) throw new Error('Failed to fetch products');

      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    return {
      totalItems: filteredProducts.length,
      totalValue: filteredProducts.reduce(
        (sum, p) => sum + (Number(p.price) || 0) * (Number(p.stockQty) || 0),
        0
      ),
      averagePrice:
        filteredProducts.length > 0
          ? filteredProducts.reduce((sum, p) => sum + (Number(p.price) || 0), 0) /
          filteredProducts.length
          : 0,
      lowStockItems: filteredProducts.filter((p) => {
        const stock = Number(p.stockQty) || 0;
        return stock <= 10 && stock > 0;
      }).length,
      outOfStockItems: filteredProducts.filter((p) => (Number(p.stockQty) || 0) === 0).length,
      inStockItems: filteredProducts.filter((p) => (Number(p.stockQty) || 0) > 10).length
    };
  };

  const stats = calculateStats();

  const getStockStatus = (stock) => {
    const s = Number(stock) || 0;

    if (s === 0) {
      return { text: t('outOfStock'), color: 'bg-red-100 text-red-800' };
    }
    if (s <= 10) {
      return { text: t('lowStock'), color: 'bg-yellow-100 text-yellow-800' };
    }
    return { text: t('inStock'), color: 'bg-green-100 text-green-800' };
  };

  const toggleSelectItem = (id) => {
    const updated = new Set(selectedItems);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedItems(updated);
  };

  const selectAllItems = () => {
    if (selectedItems.size === filteredProducts.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredProducts.map((p) => p.productId)));
    }
  };

  const resetImage = () => {
    setNewItem((prev) => ({
      ...prev,
      imageUrl: '',
      imageFile: null,
      imagePreview: null
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileInput = () => {
    fileInputRef.current?.click();
  };

  const openAddItemModal = () => {
    setModalMode('add');
    setEditingItemId(null);
    setNewItem({
      productName: '',
      price: '',
      cost: '',
      stockQty: 0,
      available: true,
      categoryId: categories.length > 0 ? categories[0].categoryId : '',
      trackMode: 'DIRECT',
      imageUrl: '',
      imageFile: null,
      imagePreview: null
    });
    setUploadMethod('url');
    setIsUploading(false);
    setShowItemModal(true);
  };

  const openEditItemModal = (product) => {
    setModalMode('edit');
    setEditingItemId(product.productId);
    setNewItem({
      productName: product.productName || '',
      price: product.price?.toString() || '',
      cost: product.cost?.toString() || '',
      stockQty: product.stockQty ?? 0,
      available: product.available ?? true,
      categoryId: product.category?.categoryId || '',
      trackMode: product.trackMode || 'DIRECT',
      imageUrl: product.image || '',
      imageFile: null,
      imagePreview: null
    });
    setUploadMethod('url');
    setIsUploading(false);
    setShowItemModal(true);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      alert(t('selectImageFile'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(t('fileTooLarge'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setNewItem((prev) => ({
        ...prev,
        imageFile: file,
        imagePreview: e.target?.result || null,
        imageUrl: ''
      }));
    };
    reader.readAsDataURL(file);
  };

  const uploadImageToServer = async () => {
    if (!newItem.imageFile) return newItem.imageUrl;

    const formData = new FormData();
    formData.append('file', newItem.imageFile);

    const res = await fetch(`${PRODUCTS_API}/upload-image`, {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      throw new Error('Image upload failed');
    }

    const imagePath = await res.text();
   return imagePath.startsWith('http') ? imagePath : `${API_BASE}${imagePath}`;
  };

  const handleSaveItem = async () => {
    if (!newItem.productName || !newItem.price || !newItem.categoryId) {
      alert(t('enterNamePrice'));
      return;
    }

    setIsUploading(true);

    try {
      let finalImageUrl = newItem.imageUrl;

      if (uploadMethod === 'file' && newItem.imageFile) {
        finalImageUrl = await uploadImageToServer();
      }

      const payload = {
        productName: newItem.productName,
        price: parseFloat(newItem.price) || 0,
        cost: parseFloat(newItem.cost) || 0,
        stockQty: parseInt(newItem.stockQty, 10) || 0,
        available: (parseInt(newItem.stockQty, 10) || 0) > 0,
        image: finalImageUrl || '',
        trackMode: newItem.trackMode || 'DIRECT',
        category: {
          categoryId: Number(newItem.categoryId)
        }
      };

      const isEdit = modalMode === 'edit';

      const res = await fetch(
        isEdit ? `${PRODUCTS_API}/${editingItemId}` : PRODUCTS_API,
        {
          method: isEdit ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );

      if (!res.ok) {
        throw new Error('Failed to save product');
      }

      await fetchProducts();

      setShowItemModal(false);
      setEditingItemId(null);
      setUploadMethod('url');
      setNewItem({
        productName: '',
        price: '',
        cost: '',
        stockQty: 0,
        available: true,
        categoryId: categories.length > 0 ? categories[0].categoryId : '',
        trackMode: 'DIRECT',
        imageUrl: '',
        imageFile: null,
        imagePreview: null
      });

      alert(isEdit ? t('itemUpdated') : t('itemAdded'));
    } catch (error) {
      console.error('Error saving product:', error);
      alert(t('uploadFailed'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm(t('deleteConfirm'))) return;

    try {
      const res = await fetch(`${PRODUCTS_API}/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        throw new Error('Failed to delete product');
      }

      await fetchProducts();

      setSelectedItems((prev) => {
        const updated = new Set(prev);
        updated.delete(id);
        return updated;
      });

      alert(t('itemDeleted'));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['ID', 'Name', 'Category', 'Price ($)', 'Cost ($)', 'Stock', 'Value ($)', 'Track Mode'],
      ...filteredProducts.map((product) => [
        product.productId,
        product.productName,
        product.category?.categoryName || '',
        Number(product.price || 0).toFixed(2),
        Number(product.cost || 0).toFixed(2),
        product.stockQty || 0,
        (Number(product.price || 0) * Number(product.stockQty || 0)).toFixed(2),
        product.trackMode || ''
      ]),
      [],
      ['SUMMARY'],
      ['Total Items', stats.totalItems],
      ['Total Value', `$${stats.totalValue.toFixed(2)}`],
      ['Average Price', `$${stats.averagePrice.toFixed(2)}`],
      ['Low Stock Items', stats.lowStockItems],
      ['Out of Stock Items', stats.outOfStockItems],
      ['In Stock Items', stats.inStockItems],
      ['Report Generated', new Date().toLocaleString()]
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `inventory_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert(t('exportSuccess'));
  };

  const printInventoryReport = (printAll = true) => {
    const itemsToPrint = printAll
      ? filteredProducts
      : filteredProducts.filter((p) => selectedItems.has(p.productId));

    if (!printAll && itemsToPrint.length === 0) {
      alert(t('noItemsSelected'));
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Popup blocked');
      return;
    }

    const printDate = new Date().toLocaleString();

    const itemsList = itemsToPrint
      .map(
        (product) => `
      <tr>
        <td>${product.productId}</td>
        <td>${product.productName}</td>
        <td>${product.category?.categoryName || ''}</td>
        <td>$${Number(product.price || 0).toFixed(2)}</td>
        <td>${product.stockQty || 0}</td>
        <td>$${(Number(product.price || 0) * Number(product.stockQty || 0)).toFixed(2)}</td>
      </tr>
    `
      )
      .join('');

    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${t('inventoryReport')}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background: #f3f4f6; }
          .header { margin-bottom: 20px; }
          .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 20px 0; }
          .card { border: 1px solid #ddd; padding: 12px; border-radius: 8px; }
          @media print {
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${t('inventoryReport')}</h1>
          <div>${t('printDate')}: ${printDate}</div>
        </div>

        <div class="stats">
          <div class="card">${t('totalItems')}: ${itemsToPrint.length}</div>
          <div class="card">${t('totalValue')}: $${itemsToPrint
        .reduce((sum, p) => sum + Number(p.price || 0) * Number(p.stockQty || 0), 0)
        .toFixed(2)}</div>
          <div class="card">${t('averagePrice')}: $${(
        itemsToPrint.reduce((sum, p) => sum + Number(p.price || 0), 0) /
        (itemsToPrint.length || 1)
      ).toFixed(2)}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>${t('itemId')}</th>
              <th>${t('name')}</th>
              <th>${t('category')}</th>
              <th>${t('price')}</th>
              <th>${t('stock')}</th>
              <th>${t('value')}</th>
            </tr>
          </thead>
          <tbody>${itemsList}</tbody>
        </table>

        <div class="no-print" style="margin-top:20px;">
          <button onclick="window.print()">${t('printReport')}</button>
          <button onclick="window.close()">${t('close')}</button>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(reportHTML);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black dark:text-white">{t('inventory')}</h1>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={exportToCSV}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2"
          >
            <Download size={18} />
            <span className="hidden sm:inline">{t('exportInventory')}</span>
            <span className="sm:hidden">{t('exportReport')}</span>
          </button>

          <button
            type="button"
            onClick={() => printInventoryReport(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2"
          >
            <Printer size={18} />
            <span className="hidden sm:inline">{t('printInventory')}</span>
            <span className="sm:hidden">{t('printReport')}</span>
          </button>

          <button
            type="button"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2"
            onClick={openAddItemModal}
          >
            <Plus size={20} /> {t('addItem')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('totalItems')}</div>
          <div className="text-2xl font-bold dark:text-white">{stats.totalItems}</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('totalValue')}</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            ${stats.totalValue.toFixed(2)}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('averagePrice')}</div>
          <div className="text-2xl font-bold dark:text-white">${stats.averagePrice.toFixed(2)}</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('lowStockItems')}</div>
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.lowStockItems}</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('outOfStockItems')}</div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.outOfStockItems}</div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-3 pl-10"
                placeholder={t('searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <div className="relative">
              <select
                className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-3 appearance-none min-w-45"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">{t('allCategories')}</option>
                {categories.map((category) => (
                  <option key={category.categoryId} value={category.categoryId}>
                    {category.categoryName}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {t('showing')} {filteredProducts.length} {t('of')} {products.length} {t('items')}
          </div>

          {filteredProducts.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500">
                {selectedItems.size} {t('selectedItems')}
              </div>

              <button
                type="button"
                onClick={selectAllItems}
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
              >
                {selectedItems.size === filteredProducts.length ? t('deselectAll') : t('selectAll')}
              </button>

              {selectedItems.size > 0 && (
                <button
                  type="button"
                  onClick={() => printInventoryReport(false)}
                  className="text-sm bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Printer size={16} />
                  {t('printSelected')}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-300">Loading...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Search size={64} className="mx-auto" />
            </div>

            <h3 className="text-xl font-bold text-gray-600 dark:text-gray-300 mb-2">
              {search || selectedCategory !== 'all' ? t('noProducts') : t('addFirstItem')}
            </h3>

            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {search || selectedCategory !== 'all'
                ? t('tryAdjustingSearch')
                : t('startAddingFirstMenuItem')}
            </p>

            {!search && selectedCategory === 'all' && (
              <button
                type="button"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto"
                onClick={openAddItemModal}
              >
                <Plus size={20} />
                {t('addItem')}
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700 border-b">
                  <th className="py-4 px-6">
                    <input
                      type="checkbox"
                      checked={
                        filteredProducts.length > 0 &&
                        selectedItems.size === filteredProducts.length
                      }
                      onChange={selectAllItems}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-600 dark:text-gray-300">
                    {t('name')}
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-600 dark:text-gray-300">
                    {t('category')}
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-600 dark:text-gray-300">
                    {t('price')}
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-600 dark:text-gray-300">
                    {t('stock')}
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-600 dark:text-gray-300">
                    {t('value')}
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-600 dark:text-gray-300">
                    Track
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-600 dark:text-gray-300">
                    {t('actions')}
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stockQty);
                  const itemValue = (Number(product.price) || 0) * (Number(product.stockQty) || 0);

                  return (
                    <tr
                      key={product.productId}
                      className="border-b hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="py-4 px-6">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(product.productId)}
                          onChange={() => toggleSelectItem(product.productId)}
                          className="rounded border-gray-300"
                        />
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              product.image
                                ? product.image.startsWith('http')
                                  ? product.image
                                  : `${API_BASE}${product.image}`
                                : 'https://placehold.co/80x80?text=No+Image'
                            }
                            alt={product.productName}
                            className="w-12 h-12 object-cover rounded-lg border"
                            onError={(e) => {
                              e.currentTarget.src = 'https://placehold.co/80x80?text=No+Image';
                              e.currentTarget.onerror = null;
                            }}
                          />
                          <div>
                            <div className="font-medium dark:text-white">{product.productName}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm">
                          <Tag size={14} />
                          {product.category?.categoryName || '-'}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1 font-bold text-green-600 dark:text-green-400">
                          <DollarSign size={16} />
                          {Number(product.price || 0).toFixed(2)}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                            {stockStatus.text}
                          </span>
                          <span className="font-medium dark:text-white">{product.stockQty || 0}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-medium dark:text-white">${itemValue.toFixed(2)}</div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {product.trackMode || '-'}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEditItemModal(product)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30"
                            title={t('edit')}
                          >
                            <Edit2 size={18} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteItem(product.productId)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30"
                            title={t('delete')}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showItemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white dark:bg-gray-800 pb-4">
              <h2 className="text-xl font-bold dark:text-white">
                {modalMode === 'add' ? t('addNewItemTitle') : t('editItemTitle')}
              </h2>

              <button
                type="button"
                onClick={() => {
                  setShowItemModal(false);
                  resetImage();
                  setIsUploading(false);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                disabled={isUploading}
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-white">
                  {t('name')}
                </label>
                <input
                  type="text"
                  className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-3"
                  value={newItem.productName}
                  onChange={(e) => setNewItem({ ...newItem, productName: e.target.value })}
                  placeholder={t('enterEnglishName')}
                  disabled={isUploading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-white">
                  {t('priceLabel')}
                </label>
                <input
                  type="number"
                  className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-3"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  disabled={isUploading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-white">
                  Cost
                </label>
                <input
                  type="number"
                  className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-3"
                  value={newItem.cost}
                  onChange={(e) => setNewItem({ ...newItem, cost: e.target.value })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  disabled={isUploading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-white">
                  {t('stockQuantity')}
                </label>
                <input
                  type="number"
                  className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-3"
                  value={newItem.stockQty}
                  onChange={(e) => setNewItem({ ...newItem, stockQty: e.target.value })}
                  placeholder={t('enterStockQuantity')}
                  min="0"
                  disabled={isUploading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-white">
                  {t('category')}
                </label>
                <div className="relative">
                  <select
                    className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-3 appearance-none"
                    value={newItem.categoryId}
                    onChange={(e) => setNewItem({ ...newItem, categoryId: e.target.value })}
                    disabled={isUploading}
                  >
                    {categories.map((c) => (
                      <option key={c.categoryId} value={c.categoryId}>
                        {c.categoryName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-white">
                  Track Mode
                </label>
                <div className="relative">
                  <select
                    className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-3 appearance-none"
                    value={newItem.trackMode}
                    onChange={(e) => setNewItem({ ...newItem, trackMode: e.target.value })}
                    disabled={isUploading}
                  >
                    <option value="DIRECT">DIRECT</option>
                    <option value="INGREDIENT">INGREDIENT</option>
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">
                  {t('itemImage')}
                </label>

                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    className={`flex-1 py-2 rounded-lg ${uploadMethod === 'url'
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                        : 'bg-gray-100 dark:bg-gray-700'
                      }`}
                    onClick={() => setUploadMethod('url')}
                    disabled={isUploading}
                  >
                    <div className="flex items-center justify-center gap-2 dark:text-white">
                      <ImageIcon size={16} />
                      <span>{t('imageUrl')}</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`flex-1 py-2 rounded-lg ${uploadMethod === 'file'
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                        : 'bg-gray-100 dark:bg-gray-700'
                      }`}
                    onClick={() => setUploadMethod('file')}
                    disabled={isUploading}
                  >
                    <div className="flex items-center justify-center gap-2 dark:text-white">
                      <Upload size={16} />
                      <span>{t('uploadFile')}</span>
                    </div>
                  </button>
                </div>

                {uploadMethod === 'url' && (
                  <div>
                    <input
                      type="text"
                      className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-3"
                      value={newItem.imageUrl}
                      onChange={(e) =>
                        setNewItem({
                          ...newItem,
                          imageUrl: e.target.value,
                          imageFile: null,
                          imagePreview: null
                        })
                      }
                      placeholder={t('enterImageUrl')}
                      disabled={isUploading}
                    />
                  </div>
                )}

                {uploadMethod === 'file' && (
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />

                    {newItem.imagePreview ? (
                      <div className="relative">
                        <img
                          src={newItem.imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-xl mb-2 border"
                        />

                        {!isUploading && (
                          <button
                            type="button"
                            onClick={resetImage}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div
                        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={openFileInput}
                      >
                        <div className="flex flex-col items-center">
                          <Upload className="text-gray-400 mb-2" size={32} />
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {t('clickToUpload')}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {t('fileTypes')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {uploadMethod === 'url' && newItem.imageUrl && (
                  <div className="mt-3">
                    <p className="text-sm font-medium mb-1 dark:text-white">{t('preview')}</p>
                    <img
                      src={newItem.imageUrl}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-xl border"
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://via.placeholder.com/300x200?text=Invalid+Image+URL';
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 sticky bottom-0 bg-white dark:bg-gray-800 pb-4">
                <button
                  type="button"
                  className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white py-3 rounded-xl font-medium transition-colors"
                  onClick={() => {
                    setShowItemModal(false);
                    resetImage();
                    setIsUploading(false);
                  }}
                  disabled={isUploading}
                >
                  {t('cancel')}
                </button>

                <button
                  type="button"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSaveItem}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {t('saving')}
                    </span>
                  ) : modalMode === 'add' ? (
                    t('addItemBtn')
                  ) : (
                    t('updateItem')
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}