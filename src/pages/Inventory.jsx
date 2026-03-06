import React, { useState, useEffect, useRef } from 'react';
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
  Clock,
  Printer,
  Download
} from 'lucide-react';

// Helper functions
const getCurrentDate = () => {
  return new Date().toISOString();
};

const loadProductsFromStorage = () => {
  try {
    const savedProducts = localStorage.getItem('restaurant_products');
    if (savedProducts) {
      const products = JSON.parse(savedProducts);
      return products.map((product) => ({
        ...product,
        createdAt: product.createdAt || getCurrentDate(),
        updatedAt: product.updatedAt || getCurrentDate()
      }));
    }
  } catch (error) {
    console.error('Error loading products:', error);
  }
  return [];
};

const saveProductsToStorage = (products) => {
  try {
    localStorage.setItem('restaurant_products', JSON.stringify(products));
  } catch (error) {
    console.error('Error saving products:', error);
  }
};

const CATEGORIES = ['Coffee', 'Beverages', 'BBQ', 'Snacks', 'Deserts'];

const translateCategory = (c) => {
  const map = {
    Coffee: 'កាហ្វេ',
    Beverages: 'ភេសជ្ជៈ',
    BBQ: 'អាំង',
    Snacks: 'អាហារសម្រន់',
    Deserts: 'នំ'
  };
  return map[c] || c;
};

const formatDate = (dateString, lang = 'en') => {
  const date = new Date(dateString);

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
  const [products, setProducts] = useState(() => loadProductsFromStorage());
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showItemModal, setShowItemModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingItemId, setEditingItemId] = useState(null);
  const [newItem, setNewItem] = useState({
    name: { en: '', km: '' },
    price: '',
    category: 'Coffee',
    stock: 0,
    image: null,
    imagePreview: null,
    imageUrl: ''
  });
  const [uploadMethod, setUploadMethod] = useState('url');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const fileInputRef = useRef(null);

  const t = (key) => translations?.[lang]?.inventory?.[key] || key;

  useEffect(() => {
    saveProductsToStorage(products);
  }, [products]);

  useEffect(() => {
    let filtered = [...products];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.en.toLowerCase().includes(searchLower) ||
          p.name.km.toLowerCase().includes(searchLower)
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  }, [products, search, selectedCategory]);

  const calculateStats = () => {
    return {
      totalItems: filteredProducts.length,
      totalValue: filteredProducts.reduce((sum, p) => sum + p.price * p.stock, 0),
      averagePrice:
        filteredProducts.length > 0
          ? filteredProducts.reduce((sum, p) => sum + p.price, 0) / filteredProducts.length
          : 0,
      lowStockItems: filteredProducts.filter((p) => p.stock <= 10 && p.stock > 0).length,
      outOfStockItems: filteredProducts.filter((p) => p.stock === 0).length,
      inStockItems: filteredProducts.filter((p) => p.stock > 10).length
    };
  };

  const stats = calculateStats();

  const toggleSelectItem = (id) => {
    const newSelected = new Set(selectedItems);

    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }

    setSelectedItems(newSelected);
  };

  const selectAllItems = () => {
    if (selectedItems.size === filteredProducts.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredProducts.map((p) => p.id)));
    }
  };

  const openAddItemModal = () => {
    setModalMode('add');
    setEditingItemId(null);
    setNewItem({
      name: { en: '', km: '' },
      price: '',
      category: 'Coffee',
      stock: 0,
      image: null,
      imagePreview: null,
      imageUrl: ''
    });
    setUploadMethod('url');
    setIsUploading(false);
    setShowItemModal(true);
  };

  const openEditItemModal = (product) => {
    setModalMode('edit');
    setEditingItemId(product.id);
    setNewItem({
      name: {
        en: product.name.en || '',
        km: product.name.km || product.name.en || ''
      },
      price: product.price.toString(),
      category: product.category,
      stock: product.stock || 0,
      image: null,
      imagePreview: null,
      imageUrl: product.image || ''
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
        image: file,
        imagePreview: e.target.result,
        imageUrl: ''
      }));
    };
    reader.readAsDataURL(file);
  };

  const resetImage = () => {
    setNewItem((prev) => ({
      ...prev,
      image: null,
      imagePreview: null,
      imageUrl: ''
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSaveItem = async () => {
    if (!newItem.name.en || !newItem.price) {
      alert(t('enterNamePrice'));
      return;
    }

    const itemName = {
      en: newItem.name.en,
      km: newItem.name.km || newItem.name.en
    };

    let imageUrl = newItem.imageUrl;

    if (uploadMethod === 'file' && newItem.image) {
      setIsUploading(true);

      try {
        await new Promise((resolve) => setTimeout(resolve, 1500));

        if (newItem.imagePreview) {
          imageUrl = newItem.imagePreview;
          alert(t('uploadComplete'));
        }
      } catch (error) {
        alert(t('uploadFailed'));
        setIsUploading(false);
        return;
      }

      setIsUploading(false);
    } else if (!imageUrl) {
      const defaultImages = {
        Coffee:
          'https://images.unsplash.com/photo-1513118171418-46b8c4e07e43?w-300&h=200&fit=crop',
        Beverages:
          'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w-300&h=200&fit=crop',
        BBQ:
          'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w-300&h=200&fit=crop',
        Snacks:
          'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w-300&h=200&fit=crop',
        Deserts:
          'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w-300&h=200&fit=crop'
      };

      imageUrl = defaultImages[newItem.category] || defaultImages.Coffee;
    }

    const currentTime = getCurrentDate();

    if (modalMode === 'add') {
      const newId =
        products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;

      const newProduct = {
        id: newId,
        category: newItem.category,
        name: itemName,
        price: parseFloat(newItem.price),
        stock: parseInt(newItem.stock, 10) || 0,
        image: imageUrl,
        createdAt: currentTime,
        updatedAt: currentTime
      };

      setProducts([newProduct, ...products]);
      alert(t('itemAdded'));
    } else {
      setProducts(
        products.map((p) =>
          p.id === editingItemId
            ? {
                ...p,
                category: newItem.category,
                name: itemName,
                price: parseFloat(newItem.price),
                stock: parseInt(newItem.stock, 10) || 0,
                image: imageUrl,
                updatedAt: currentTime
              }
            : p
        )
      );
      alert(t('itemUpdated'));
    }

    setNewItem({
      name: { en: '', km: '' },
      price: '',
      category: 'Coffee',
      stock: 0,
      image: null,
      imagePreview: null,
      imageUrl: ''
    });
    setUploadMethod('url');
    setShowItemModal(false);
    setEditingItemId(null);
  };

  const handleDeleteItem = (id) => {
    if (window.confirm(t('deleteConfirm'))) {
      setProducts(products.filter((p) => p.id !== id));

      setSelectedItems((prev) => {
        const updated = new Set(prev);
        updated.delete(id);
        return updated;
      });

      alert(t('itemDeleted'));
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) {
      return { text: t('outOfStock'), color: 'bg-red-100 text-red-800' };
    }
    if (stock <= 10) {
      return { text: t('lowStock'), color: 'bg-yellow-100 text-yellow-800' };
    }
    return { text: t('inStock'), color: 'bg-green-100 text-green-800' };
  };

  const printInventoryReport = (printAll = true) => {
    const itemsToPrint = printAll
      ? filteredProducts
      : filteredProducts.filter((p) => selectedItems.has(p.id));

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
      <tr class="border-b">
        <td class="py-2 px-3">${product.id}</td>
        <td class="py-2 px-3">
          <div><strong>${product.name.en}</strong></div>
          <div class="text-sm text-gray-600">${product.name.km}</div>
        </td>
        <td class="py-2 px-3">${lang === 'en' ? product.category : translateCategory(product.category)}</td>
        <td class="py-2 px-3 text-right">$${product.price.toFixed(2)}</td>
        <td class="py-2 px-3 text-right">${product.stock}</td>
        <td class="py-2 px-3 text-right">$${(product.price * product.stock).toFixed(2)}</td>
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
          @media print {
            @page { margin: 1cm; }
            body { margin: 0; }
            .no-print { display: none !important; }
          }
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #000;
            padding-bottom: 20px;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
          }
          .stat-card {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
          }
          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #10b981;
            margin: 10px 0;
          }
          .stat-label {
            font-size: 14px;
            color: #6c757d;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th {
            background-color: #f1f5f9;
            border: 1px solid #cbd5e1;
            padding: 10px;
            text-align: left;
            font-weight: bold;
          }
          td {
            border: 1px solid #cbd5e1;
            padding: 8px 10px;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px dashed #ccc;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          .print-button {
            text-align: center;
            margin-top: 30px;
          }
          button {
            padding: 10px 20px;
            background: #10b981;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin: 0 10px;
          }
          .selected-info {
            background: #e8f4ff;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 15px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${t('inventoryReport')}</h1>
          <div>${t('printDate')}: ${printDate}</div>
          <div>${t('restaurantPosSystem')}</div>
          ${!printAll ? `<div class="selected-info">${itemsToPrint.length} ${t('selectedItems')}</div>` : ''}
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">${t('totalItems')}</div>
            <div class="stat-value">${itemsToPrint.length}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">${t('totalValue')}</div>
            <div class="stat-value">$${itemsToPrint.reduce((sum, p) => sum + p.price * p.stock, 0).toFixed(2)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">${t('averagePrice')}</div>
            <div class="stat-value">$${(
              itemsToPrint.reduce((sum, p) => sum + p.price, 0) /
              (itemsToPrint.length || 1)
            ).toFixed(2)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">${t('lowStockItems')} (≤10)</div>
            <div class="stat-value">${itemsToPrint.filter((p) => p.stock <= 10 && p.stock > 0).length}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">${t('outOfStockItems')}</div>
            <div class="stat-value">${itemsToPrint.filter((p) => p.stock === 0).length}</div>
          </div>
        </div>

        <h2>${t('inventory')}</h2>
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
          <tbody>
            ${itemsList}
          </tbody>
        </table>

        <div class="footer">
          <div>${t('generatedBySystem')}</div>
          <div>© ${new Date().getFullYear()} - ${printDate}</div>
        </div>

        <div class="print-button no-print">
          <button onclick="window.print()">${t('printReport')}</button>
          <button onclick="window.close()" style="background: #6b7280">${t('close')}</button>
        </div>

        <script>
          setTimeout(() => {
            window.print();
          }, 500);
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(reportHTML);
    printWindow.document.close();

    setTimeout(() => {
      alert(t('printSuccess'));
    }, 1000);
  };

  const exportToCSV = () => {
    const csvContent = [
      ['ID', 'English Name', 'Khmer Name', 'Category', 'Price ($)', 'Stock', 'Value ($)', 'Last Updated'],
      ...filteredProducts.map((product) => [
        product.id,
        product.name.en,
        product.name.km,
        product.category,
        product.price.toFixed(2),
        product.stock,
        (product.price * product.stock).toFixed(2),
        formatDate(product.updatedAt, 'en')
      ]),
      [],
      ['SUMMARY', '', '', '', '', '', ''],
      ['Total Items', stats.totalItems],
      ['Total Value', `$${stats.totalValue.toFixed(2)}`],
      ['Average Price', `$${stats.averagePrice.toFixed(2)}`],
      ['Low Stock Items (≤10)', stats.lowStockItems],
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
    link.setAttribute('download', `inventory_report_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert(t('exportSuccess'));
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
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {t('totalItems')}
          </div>
          <div className="text-2xl font-bold dark:text-white">{stats.totalItems}</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {t('totalValue')}
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            ${stats.totalValue.toFixed(2)}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {t('averagePrice')}
          </div>
          <div className="text-2xl font-bold dark:text-white">
            ${stats.averagePrice.toFixed(2)}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {t('lowStockItems')}
          </div>
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {stats.lowStockItems}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {t('outOfStockItems')}
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {stats.outOfStockItems}
          </div>
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
            <select
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-3 appearance-none min-w-[180px]"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">{t('allCategories')}</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {lang === 'en' ? category : translateCategory(category)}
                </option>
              ))}
            </select>
            <ChevronDown className="text-gray-400 -ml-8 pointer-events-none" size={18} />
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
                {selectedItems.size === filteredProducts.length
                  ? t('deselectAll')
                  : t('selectAll')}
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
        {filteredProducts.length === 0 ? (
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
                    {t('lastUpdated')}
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-600 dark:text-gray-300">
                    {t('actions')}
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock);
                  const itemValue = product.price * product.stock;

                  return (
                    <tr
                      key={product.id}
                      className="border-b hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="py-4 px-6">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(product.id)}
                          onChange={() => toggleSelectItem(product.id)}
                          className="rounded border-gray-300"
                        />
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name[lang]}
                            className="w-12 h-12 object-cover rounded-lg border"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/48?text=No+Image';
                            }}
                          />
                          <div>
                            <div className="font-medium dark:text-white">
                              {product.name[lang]}
                            </div>
                            <div className="text-sm text-gray-500">
                              {lang === 'en' ? product.name.km : product.name.en}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm">
                          <Tag size={14} />
                          {lang === 'en'
                            ? product.category
                            : translateCategory(product.category)}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1 font-bold text-green-600 dark:text-green-400">
                          <DollarSign size={16} />
                          {product.price.toFixed(2)}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}
                          >
                            {stockStatus.text}
                          </span>
                          <span className="font-medium dark:text-white">{product.stock}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-medium dark:text-white">
                          ${itemValue.toFixed(2)}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock size={14} />
                          {formatDate(product.updatedAt, lang)}
                        </div>
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
                            onClick={() => handleDeleteItem(product.id)}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
                  {t('englishName')}
                </label>
                <input
                  type="text"
                  className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-3"
                  value={newItem.name.en}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      name: { ...newItem.name, en: e.target.value }
                    })
                  }
                  placeholder={t('enterEnglishName')}
                  disabled={isUploading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-white">
                  {t('khmerName')}
                </label>
                <input
                  type="text"
                  className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-3"
                  value={newItem.name.km}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      name: { ...newItem.name, km: e.target.value }
                    })
                  }
                  placeholder={t('enterKhmerName')}
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
                  {t('stockQuantity')}
                </label>
                <input
                  type="number"
                  className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-3"
                  value={newItem.stock}
                  onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })}
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
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    disabled={isUploading}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {lang === 'en' ? c : translateCategory(c)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
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
                    className={`flex-1 py-2 rounded-lg ${
                      uploadMethod === 'url'
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
                    className={`flex-1 py-2 rounded-lg ${
                      uploadMethod === 'file'
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
                          image: null,
                          imagePreview: null
                        })
                      }
                      placeholder={t('enterImageUrl')}
                      disabled={isUploading}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t('leaveEmpty')}
                    </p>
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

                        {isUploading && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-xl">
                            <div className="text-white">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                              <p className="mt-2">{t('uploading')}</p>
                            </div>
                          </div>
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
                        e.target.src =
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