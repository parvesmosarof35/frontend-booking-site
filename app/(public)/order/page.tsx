'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { addToCart } from '@/store/slices/cartSlice';
import { toggleCartDrawer } from '@/store/slices/uiSlice';
import {
  Utensils,
  Search,
  Plus,
  ShoppingBag,
  Sparkles,
  Star,
  Check,
} from 'lucide-react';
import api from '@/lib/axios';
import { formatPrice } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import toast from 'react-hot-toast';

export default function OrderPage() {
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const totalCartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);

  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trackEvent('view', 'page', 'order_menu_page');

    const fetchData = async () => {
      setLoading(true);
      try {
        const [itemsRes, catRes] = await Promise.all([
          api.get('/menu'),
          api.get('/menu/categories'),
        ]);
        setMenuItems(itemsRes.data || []);
        setCategories(['All', ...(catRes.data || [])]);
      } catch (e) {
        toast.error('Failed to load menu items');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddItem = (item: any) => {
    trackEvent('click', 'menuItem', item._id, { action: 'add_to_cart_menu' });
    dispatch(
      addToCart({
        menuItemId: item._id,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl,
        category: item.category,
      }),
    );
    toast.success(`Added "${item.name}" to cart!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Online Food Delivery & Pickup</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Gourmet Online Ordering
          </h1>
          <p className="text-sm text-slate-600">
            Freshly prepared by our culinary masters. Delivered in insulated temperature packaging.
          </p>
        </div>

        {/* Floating Cart Trigger */}
        <button
          onClick={() => dispatch(toggleCartDrawer())}
          className="flex items-center gap-2.5 px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm rounded-2xl shadow-md transition hover:scale-102"
        >
          <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
          <span>View Cart ({totalCartCount})</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search artisan dishes, wagyu, seafood, desserts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                activeCategory === cat
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Food Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500">Loading chef menu items...</div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-500">
          No menu items found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="relative h-56 overflow-hidden bg-slate-100">
                  <img
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=800&auto=format&fit=crop&q=80'}
                    alt={item.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=800&auto=format&fit=crop&q=80';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-slate-900 text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                    {item.category}
                  </div>
                  <div className="absolute top-4 right-4 bg-amber-500 text-slate-950 font-extrabold text-sm px-3 py-1 rounded-full shadow-xs">
                    {formatPrice(item.price)}
                  </div>
                </div>

                <div className="p-6 space-y-2">
                  <h3 className="font-serif text-xl font-bold text-slate-900 group-hover:text-amber-700 transition">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 flex items-center justify-between border-t border-slate-100 pt-4">
                <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                  <Star className="w-4 h-4 fill-current" />
                  <span>4.9 Chef Special</span>
                </div>

                <button
                  onClick={() => handleAddItem(item)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl shadow-xs transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
