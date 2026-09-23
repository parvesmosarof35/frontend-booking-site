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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Online Food Delivery & Pickup</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Gourmet Online Ordering
          </h1>
          <p className="text-sm text-slate-400">
            Freshly prepared by our culinary team with premium ingredients. Delivered in insulated temperature packaging.
          </p>
        </div>

        {/* Floating Cart Trigger */}
        <button
          onClick={() => dispatch(toggleCartDrawer())}
          className="flex items-center gap-2.5 px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-2xl shadow-xl shadow-amber-500/20 transition hover:scale-105"
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
            <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search dishes, ingredients, steaks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeCategory === cat
                  ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Food Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500">Loading culinary selections...</div>
      ) : filteredItems.length === 0 ? (
        <div className="py-16 text-center text-slate-400 space-y-2">
          <Utensils className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-base font-semibold">No dishes found matching your search.</p>
          <p className="text-xs text-slate-500">Try searching with a different keyword or category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => {
            const inCart = cartItems.find((ci) => ci.menuItemId === item._id);

            return (
              <div
                key={item._id}
                className="group bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-3xl overflow-hidden shadow-xl hover:shadow-amber-500/10 transition duration-300 flex flex-col"
              >
                {/* Image */}
                <div className="relative h-60 overflow-hidden bg-slate-950">
                  <img
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800'}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-semibold text-amber-400 border border-amber-500/30">
                    {item.category}
                  </div>
                  <div className="absolute bottom-4 right-4 bg-slate-950/90 backdrop-blur-md px-3 py-1 rounded-xl text-sm font-bold text-white border border-slate-700">
                    {formatPrice(item.price)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-serif text-lg font-bold text-white group-hover:text-amber-400 transition">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                      <span>{item.viewCount || 100}+ ordered</span>
                    </div>

                    <button
                      onClick={() => handleAddItem(item)}
                      className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition duration-200 ${
                        inCart
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500 hover:text-white'
                          : 'bg-amber-500/10 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/30'
                      }`}
                    >
                      {inCart ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added ({inCart.qty})</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Add to Order</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
