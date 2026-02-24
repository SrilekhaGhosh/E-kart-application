import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchSellerProducts, fetchSellerHistory } from '../slices/sellerSlice';
import Header from '../components/Header';
import axios from 'axios';
import toast from 'react-hot-toast';
import { apiUrl } from '../config/api';

const formatCurrency = (value) => {
    const numberValue = Number(value || 0);
    return `₹${numberValue.toFixed(0)}`;
};

const formatDayKey = (dateValue) => {
    const d = new Date(dateValue);
    const year = d.getFullYear();
    const month = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const formatMonthKey = (dateValue) => {
    const d = new Date(dateValue);
    const year = d.getFullYear();
    const month = `${d.getMonth() + 1}`.padStart(2, '0');
    return `${year}-${month}`;
};

const buildDailySeries = (history, days = 14) => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - (days - 1));

    const totalsByDay = new Map();
    for (let i = 0; i < days; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        totalsByDay.set(formatDayKey(d), 0);
    }

    for (const entry of history || []) {
        const key = formatDayKey(entry.date);
        if (totalsByDay.has(key)) {
            totalsByDay.set(key, (totalsByDay.get(key) || 0) + Number(entry.totalEarnings || 0));
        }
    }

    return Array.from(totalsByDay.entries()).map(([day, value]) => ({ day, value }));
};

const buildMonthlySeries = (history) => {
    const entries = Array.isArray(history) ? history : [];
    if (!entries.length) return [];

    const dates = entries
        .map((h) => new Date(h.date))
        .filter((d) => !Number.isNaN(d.getTime()))
        .sort((a, b) => a - b);

    if (!dates.length) return [];

    const start = new Date(dates[0].getFullYear(), dates[0].getMonth(), 1);
    const endDate = new Date();
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

    const totalsByMonth = new Map();
    const cursor = new Date(start);
    while (cursor <= end) {
        totalsByMonth.set(formatMonthKey(cursor), 0);
        cursor.setMonth(cursor.getMonth() + 1);
    }

    for (const entry of entries) {
        const key = formatMonthKey(entry.date);
        totalsByMonth.set(key, (totalsByMonth.get(key) || 0) + Number(entry.totalEarnings || 0));
    }

    return Array.from(totalsByMonth.entries()).map(([day, value]) => ({ day, value }));
};

const LineChart = ({ data }) => {
    const width = 560;
    const height = 180;
    const padding = 24;

    const values = (data || []).map((d) => d.value);
    const maxValue = Math.max(1, ...values);

    const points = (data || []).map((d, index) => {
        const x = padding + (index * (width - padding * 2)) / Math.max(1, (data.length - 1));
        const y = height - padding - (d.value * (height - padding * 2)) / maxValue;
        return { x, y };
    });

    const pathD = points
        .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
        .join(' ');

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[180px]">
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} className="stroke-gray-200" />
            <line x1={padding} y1={padding} x2={padding} y2={height - padding} className="stroke-gray-200" />

            <path d={pathD} fill="none" className="stroke-indigo-600" strokeWidth="3" />
            {points.map((p, idx) => (
                <circle key={idx} cx={p.x} cy={p.y} r="3.5" className="fill-indigo-600" />
            ))}
        </svg>
    );
};

const DonutChart = ({ segments }) => {
    const radius = 54;
    const stroke = 14;
    const circumference = 2 * Math.PI * radius;
    const safeSegments = (segments || []).filter((s) => s.value > 0);

    let offset = 0;
    return (
        <div className="flex items-center gap-4">
            <svg width="140" height="140" viewBox="0 0 140 140" className="shrink-0">
                <circle cx="70" cy="70" r={radius} fill="none" className="stroke-gray-200" strokeWidth={stroke} />
                {safeSegments.map((seg, idx) => {
                    const dash = (seg.percent / 100) * circumference;
                    const dashArray = `${dash} ${circumference - dash}`;
                    const dashOffset = -offset;
                    offset += dash;
                    return (
                        <circle
                            key={idx}
                            cx="70"
                            cy="70"
                            r={radius}
                            fill="none"
                            strokeWidth={stroke}
                            strokeLinecap="butt"
                            className={seg.strokeClass}
                            strokeDasharray={dashArray}
                            strokeDashoffset={dashOffset}
                            transform="rotate(-90 70 70)"
                        />
                    );
                })}
            </svg>

            <div className="flex-1">
                <div className="text-sm font-semibold text-gray-700 mb-2">Sales Share</div>
                <div className="space-y-2">
                    {safeSegments.length === 0 && <div className="text-sm text-gray-500">No data yet</div>}
                    {safeSegments.map((seg, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-3 text-sm">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className={`inline-block w-3 h-3 rounded-sm ${seg.fillClass}`} />
                                <span className="text-gray-700 truncate">{seg.label}</span>
                            </div>
                            <div className="text-gray-600 shrink-0">{seg.percent.toFixed(0)}%</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const SellerDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { products, history, status, error } = useSelector((state) => state.seller);

    const [form, setForm] = useState({
        name: '',
        price: '',
        description: '',
        category: '',
        stock: '',
    });
    
    // State to hold selected image files
    const [imageFiles, setImageFiles] = useState([]);
    const [editId, setEditId] = useState(null);

    const [categoryOptions, setCategoryOptions] = useState([]);
    const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
    const [categoryQuery, setCategoryQuery] = useState("");

    const token = localStorage.getItem('accessToken');

    const rangeOptions = useMemo(() => (
        [
            { value: 'lifetime', label: 'Lifetime' },
            { value: '1m', label: '1 Month' },
            { value: '6m', label: '6 Months' },
            { value: '1y', label: '1 Year' },
        ]
    ), []);

    const [performanceRange, setPerformanceRange] = useState('6m');
    const [mixRange, setMixRange] = useState('6m');
    const [mixMetric, setMixMetric] = useState('amount');

    const filterHistoryByRange = (items, range) => {
        const list = Array.isArray(items) ? items : [];
        if (range === 'lifetime') return list;

        const days = range === '1m' ? 30 : range === '6m' ? 180 : 365;
        const cutoff = new Date();
        cutoff.setHours(0, 0, 0, 0);
        cutoff.setDate(cutoff.getDate() - (days - 1));

        return list.filter((h) => {
            const d = new Date(h.date);
            if (Number.isNaN(d.getTime())) return false;
            return d >= cutoff;
        });
    };

    useEffect(() => {
        const user = (() => {
            try {
                return JSON.parse(localStorage.getItem('user'));
            } catch {
                return null;
            }
        })();

        if (!user) {
            navigate('/login');
            return;
        }
        if (user.role !== 'seller') {
            navigate('/home');
        }
    }, [navigate]);

    useEffect(() => {
        if (token) {
            dispatch(fetchSellerProducts(token));
            dispatch(fetchSellerHistory(token));
        }
    }, [dispatch, token]);

    useEffect(() => {
        // Load category options for dropdown
        const load = async () => {
            try {
                const res = await fetch(apiUrl('/market/categories'));
                const data = await res.json();
                const items = Array.isArray(data?.items) ? data.items : [];
                // Backend already normalizes to lowercase, but keep it safe
                const normalized = items
                    .map((c) => String(c || "").trim().toLowerCase())
                    .filter(Boolean);
                setCategoryOptions(Array.from(new Set(normalized)));
            } catch {
                setCategoryOptions([]);
            }
        };
        load();
    }, []);

    useEffect(() => {
        if (!categoryDropdownOpen) return;
        const onDocClick = (e) => {
            const target = e.target;
            if (!(target instanceof HTMLElement)) return;
            // Close if click is outside the category dropdown container
            if (!target.closest('[data-category-dropdown="1"]')) {
                setCategoryDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, [categoryDropdownOpen]);

    const totals = useMemo(() => {
        const totalEarnings = (history || []).reduce((acc, o) => acc + Number(o.totalEarnings || 0), 0);
        const totalOrders = (history || []).length;
        const totalItemsSold = (history || []).reduce((acc, o) => {
            const itemCount = (o.itemsSold || []).reduce((a, item) => a + Number(item.quantity || 0), 0);
            return acc + itemCount;
        }, 0);
        const activeProducts = (products || []).length;
        return { totalEarnings, totalOrders, totalItemsSold, activeProducts };
    }, [history, products]);

    const performanceHistory = useMemo(
        () => filterHistoryByRange(history, performanceRange),
        [history, performanceRange]
    );

    const dailySeries = useMemo(() => {
        if (performanceRange === 'lifetime') {
            return buildMonthlySeries(performanceHistory);
        }
        const days = performanceRange === '1m' ? 30 : performanceRange === '6m' ? 180 : 365;
        return buildDailySeries(performanceHistory, days);
    }, [performanceHistory, performanceRange]);

    const performanceTotal = useMemo(
        () => (performanceHistory || []).reduce((acc, x) => acc + Number(x.totalEarnings || 0), 0),
        [performanceHistory]
    );

    const mixHistory = useMemo(
        () => filterHistoryByRange(history, mixRange),
        [history, mixRange]
    );

    const donutSegments = useMemo(() => {
        const palette = [
            { stroke: 'stroke-indigo-600', fill: 'bg-indigo-600' },
            { stroke: 'stroke-blue-600', fill: 'bg-blue-600' },
            { stroke: 'stroke-green-600', fill: 'bg-green-600' },
            { stroke: 'stroke-purple-600', fill: 'bg-purple-600' },
            { stroke: 'stroke-pink-600', fill: 'bg-pink-600' },
            { stroke: 'stroke-amber-600', fill: 'bg-amber-600' },
        ];

        const productIdToCategory = new Map((products || []).map((p) => [String(p._id), p.category]));

        const totalsByCategory = new Map();
        for (const entry of mixHistory || []) {
            for (const item of entry.itemsSold || []) {
                const productId = item.productId ? String(item.productId) : '';
                const category = productIdToCategory.get(productId) || item.category || 'Other';
                const amount = Number(item.price || 0) * Number(item.quantity || 0);
                const itemCount = Number(item.quantity || 0);
                const metricValue = mixMetric === 'items' ? itemCount : amount;
                totalsByCategory.set(category, (totalsByCategory.get(category) || 0) + metricValue);
            }
        }

        const total = Array.from(totalsByCategory.values()).reduce((a, v) => a + v, 0);
        const sorted = Array.from(totalsByCategory.entries())
            .map(([label, value]) => ({ label, value }))
            .sort((a, b) => b.value - a.value);

        const top = sorted.slice(0, 5);
        const otherValue = sorted.slice(5).reduce((a, x) => a + x.value, 0);
        const merged = otherValue > 0 ? [...top, { label: 'Other', value: otherValue }] : top;

        return merged.map((seg, idx) => {
            const percent = total > 0 ? (seg.value / total) * 100 : 0;
            const color = palette[idx % palette.length];
            return {
                ...seg,
                percent,
                strokeClass: color.stroke,
                fillClass: color.fill,
            };
        });
    }, [mixHistory, products, mixMetric]);

    const handleInput = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const normalizedCategoryQuery = categoryQuery.trim().toLowerCase();
    const filteredCategories = useMemo(() => {
        if (!normalizedCategoryQuery) return categoryOptions;
        return categoryOptions.filter((c) => c.includes(normalizedCategoryQuery));
    }, [categoryOptions, normalizedCategoryQuery]);

    // Handle file selection
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        setImageFiles((prev) => {
            const next = [...prev];
            for (const f of files) {
                const key = `${f.name}-${f.size}-${f.lastModified}`;
                const exists = next.some((x) => `${x.name}-${x.size}-${x.lastModified}` === key);
                if (!exists) next.push(f);
            }
            return next;
        });
    };

    const handleAddOrEditProduct = async (e) => {
        e.preventDefault();

        const categoryValue = (form.category || "").toString().trim().toLowerCase();
        if (!categoryValue) {
            toast.error("Please select or add a category");
            return;
        }
        
        // Use FormData for multipart/form-data (required for Multer)
        const data = new FormData();
        data.append('name', form.name);
        data.append('price', form.price);
        data.append('description', form.description);
        data.append('category', categoryValue);
        data.append('stock', form.stock);
        
        // Append selected images (multiple)
        if (imageFiles.length) {
            imageFiles.forEach((file) => data.append('images', file));
        }

        try {
            if (editId) {
                await axios.put(apiUrl(`/market/seller/product/${editId}`), data, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                toast.success('Product updated');
                setEditId(null);
            } else {
                if (!imageFiles.length) return toast.error("Please select at least one image");
                
                await axios.post(apiUrl('/market/seller/product'), data, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                toast.success('Product added');
            }

            // Reset form
            setForm({ name: '', price: '', description: '', category: '', stock: '' });
            setCategoryQuery("");
            setCategoryDropdownOpen(false);
            setImageFiles([]);
            document.getElementById('fileInput').value = ""; // Clear file input
            dispatch(fetchSellerProducts(token));
            dispatch(fetchSellerHistory(token));
        } catch (err) {
            toast.error(err.response?.data?.message || err.response?.data?.msg || 'Error');
        }
    };

    const handleEdit = (product) => {
        setEditId(product._id);
        setForm({
            name: product.name,
            price: product.price,
            description: product.description,
            category: product.category,
            stock: product.stock,
        });
        setCategoryQuery(product.category || "");
        setCategoryDropdownOpen(false);
        // We don't set imageFile here as they might want to keep the old image
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Delete this product?")) return;
        try {
            await axios.delete(apiUrl(`/market/seller/product/${id}`), {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('Product deleted');
            dispatch(fetchSellerProducts(token));
            dispatch(fetchSellerHistory(token));
        } catch (err) {
            toast.error('Delete failed');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
            <Header />
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex items-end justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900">Seller Dashboard</h2>
                        <button onClick={() => navigate("/home")} className="text-sm text-blue-500 hover:underline">Go to Home</button>
                        <p className="text-sm text-gray-600">Track performance, analyze sales, and manage products</p>
                    </div>
                </div>

                {status === 'loading' && <div className="text-center text-gray-600">Loading...</div>}
                {status === 'failed' && <div className="text-center text-red-500">{error}</div>}

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-2xl shadow p-5 border border-gray-100">
                        <div className="text-sm text-gray-500">Total Earnings</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totals.totalEarnings)}</div>
                        <div className="text-xs text-gray-500 mt-1">All-time (from history)</div>
                    </div>
                    <div className="bg-white rounded-2xl shadow p-5 border border-gray-100">
                        <div className="text-sm text-gray-500">Orders</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">{totals.totalOrders}</div>
                        <div className="text-xs text-gray-500 mt-1">Orders containing your items</div>
                    </div>
                    <div className="bg-white rounded-2xl shadow p-5 border border-gray-100">
                        <div className="text-sm text-gray-500">Items Sold</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">{totals.totalItemsSold}</div>
                        <div className="text-xs text-gray-500 mt-1">Total quantity sold</div>
                    </div>
                    <div className="bg-white rounded-2xl shadow p-5 border border-gray-100">
                        <div className="text-sm text-gray-500">My Products</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">{totals.activeProducts}</div>
                        <div className="text-xs text-gray-500 mt-1">Currently listed</div>
                    </div>
                </div>

                {/* Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <div className="text-lg font-bold text-gray-900">Performance</div>
                                <div className="text-sm text-gray-600">Earnings ({rangeOptions.find((x) => x.value === performanceRange)?.label || 'Range'})</div>
                            </div>
                            <div className="flex items-center gap-3">
                                <select
                                    value={performanceRange}
                                    onChange={(e) => setPerformanceRange(e.target.value)}
                                    className="border rounded-lg px-3 py-2 bg-white text-sm"
                                >
                                    {rangeOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                <div className="text-sm text-gray-700 font-semibold">{formatCurrency(performanceTotal)}</div>
                            </div>
                        </div>
                        <LineChart data={dailySeries} />
                        <div className="mt-3 flex justify-between text-xs text-gray-500">
                            <span>{dailySeries[0]?.day}</span>
                            <span>{dailySeries[dailySeries.length - 1]?.day}</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
                        <div className="flex items-center justify-between gap-3 mb-1">
                            <div className="text-lg font-bold text-gray-900">Product Mix</div>
                            <div className="flex items-center gap-2">
                                <select
                                    value={mixMetric}
                                    onChange={(e) => setMixMetric(e.target.value)}
                                    className="border rounded-lg px-3 py-2 bg-white text-sm"
                                >
                                    <option value="amount">Amount</option>
                                    <option value="items">Items</option>
                                </select>
                                <select
                                    value={mixRange}
                                    onChange={(e) => setMixRange(e.target.value)}
                                    className="border rounded-lg px-3 py-2 bg-white text-sm"
                                >
                                    {rangeOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="text-sm text-gray-600 mb-4">
                            {mixMetric === 'items' ? 'Items sold share by category (or Other)' : 'Sales amount share by category (or Other)'}
                        </div>
                        <DonutChart segments={donutSegments} />
                    </div>
                </div>

                {/* Management + Recent Sales */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 items-start">
                    <div className="lg:col-span-1 bg-white rounded-2xl shadow border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">{editId ? 'Edit Product' : 'Add Product'}</h3>
                            {editId && (
                                <button
                                    type="button"
                                    className="text-sm font-semibold text-gray-600 hover:text-gray-900"
                                    onClick={() => {
                                        setEditId(null);
                                        setForm({ name: '', price: '', description: '', category: '', stock: '' });
                                        setCategoryQuery("");
                                        setCategoryDropdownOpen(false);
                                        setImageFiles([]);
                                    }}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleAddOrEditProduct} className="space-y-3">
                            <input name="name" value={form.name} onChange={handleInput} placeholder="Name" className="w-full border px-3 py-2 rounded-lg" required />
                            <div className="grid grid-cols-2 gap-3">
                                <input name="price" value={form.price} onChange={handleInput} placeholder="Price" type="number" className="w-full border px-3 py-2 rounded-lg" required />
                                <input name="stock" value={form.stock} onChange={handleInput} placeholder="Stock" type="number" className="w-full border px-3 py-2 rounded-lg" required />
                            </div>
                            <div className="relative" data-category-dropdown="1">
                                <input
                                    value={categoryQuery}
                                    onChange={(e) => {
                                        const next = e.target.value;
                                        setCategoryQuery(next);
                                        setCategoryDropdownOpen(true);
                                        setForm((prev) => ({ ...prev, category: next.trim().toLowerCase() }));
                                    }}
                                    onFocus={() => setCategoryDropdownOpen(true)}
                                    placeholder="Category (search or type to add)"
                                    className="w-full border px-3 py-2 rounded-lg"
                                    required
                                />

                                {categoryDropdownOpen && (
                                    <div className="absolute z-20 mt-2 w-full bg-white border rounded-lg shadow p-2 max-h-56 overflow-auto">
                                        {filteredCategories.length === 0 && !normalizedCategoryQuery ? (
                                            <div className="text-sm text-gray-600 px-2 py-2">No categories found</div>
                                        ) : (
                                            <div className="space-y-1">
                                                {filteredCategories.map((c) => (
                                                    <button
                                                        key={c}
                                                        type="button"
                                                        onClick={() => {
                                                            setForm((prev) => ({ ...prev, category: c }));
                                                            setCategoryQuery(c);
                                                            setCategoryDropdownOpen(false);
                                                        }}
                                                        className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100"
                                                    >
                                                        {c}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {normalizedCategoryQuery && !categoryOptions.includes(normalizedCategoryQuery) && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newCat = normalizedCategoryQuery;
                                                    setForm((prev) => ({ ...prev, category: newCat }));
                                                    setCategoryQuery(newCat);
                                                    setCategoryOptions((prev) => Array.from(new Set([...prev, newCat])));
                                                    setCategoryDropdownOpen(false);
                                                }}
                                                className="mt-2 w-full text-left px-3 py-2 rounded-md bg-gray-900 text-white hover:bg-black"
                                            >
                                                Add "{normalizedCategoryQuery}"
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => setCategoryDropdownOpen(false)}
                                            className="mt-2 w-full text-center px-3 py-2 rounded-md bg-white border hover:bg-gray-50"
                                        >
                                            Close
                                        </button>
                                    </div>
                                )}
                            </div>
                            <input name="description" value={form.description} onChange={handleInput} placeholder="Description" className="w-full border px-3 py-2 rounded-lg" required />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                                <input
                                    id="fileInput"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFileChange}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                                    required={!editId}
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                    {imageFiles.length ? (
                                        <div className="flex items-center justify-between gap-3">
                                            <span>{imageFiles.length} photo(s) selected</span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setImageFiles([]);
                                                    const el = document.getElementById('fileInput');
                                                    if (el) el.value = '';
                                                }}
                                                className="font-semibold text-gray-700 hover:text-gray-900"
                                            >
                                                Clear selection
                                            </button>
                                        </div>
                                    ) : (
                                        <span>Tip: use Ctrl/Shift to pick multiple photos</span>
                                    )}
                                </div>
                                {editId && (
                                    <div className="text-xs text-gray-500 mt-1">Upload only if you want to replace the images</div>
                                )}
                            </div>

                            <button type="submit" className="w-full py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-semibold">
                                {editId ? 'Update Product' : 'Add Product'}
                            </button>
                        </form>
                    </div>

                    <div className="lg:col-span-2 bg-white rounded-2xl shadow border border-gray-100 p-6 flex flex-col min-h-0 max-h-[calc(100vh-260px)]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">My Products</h3>
                            <div className="text-sm text-gray-600">{products.length} items</div>
                        </div>

                        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                            {products.length === 0 ? (
                                <div className="text-gray-500">No products found.</div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {products.map((product) => (
                                        <div key={product._id} className="rounded-xl border border-gray-100 shadow-sm p-4 flex gap-4">
                                            {product.images && product.images[0] ? (
                                                <img src={product.images[0]} alt={product.name} className="w-20 h-20 object-cover rounded-lg" />
                                            ) : (
                                                <div className="w-20 h-20 rounded-lg bg-gray-100" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h4 className="font-bold text-gray-900 truncate">{product.name}</h4>
                                                    <div className="text-sm font-bold text-indigo-700 shrink-0">{formatCurrency(product.price)}</div>
                                                </div>
                                                <div className="text-xs text-gray-500">{product.category}</div>
                                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                                                <div className="flex items-center justify-between mt-3">
                                                    <div className="text-xs text-gray-500">Stock: <span className="font-semibold text-gray-700">{product.stock}</span></div>
                                                    <div className="flex gap-2">
                                                        <button className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600" onClick={() => handleEdit(product)}>Edit</button>
                                                        <button className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600" onClick={() => handleDelete(product._id)}>Delete</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sales History */}
                <div className="bg-white rounded-2xl shadow border border-gray-100 p-6 flex flex-col min-h-0 max-h-[calc(100vh-260px)]">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Sales History</h3>
                            <div className="text-xs text-gray-500">Latest first</div>
                        </div>
                        <div className="text-sm text-gray-600">{Array.isArray(history) ? history.length : 0} orders</div>
                    </div>

                    <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                        {!Array.isArray(history) || history.length === 0 ? (
                            <div className="text-gray-500">No sales history found.</div>
                        ) : (
                            <div className="space-y-3">
                                {history.map((order) => (
                                    <div key={order.orderId} className="rounded-xl border border-gray-100 shadow-sm p-4">
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="font-bold text-gray-900 truncate">Order: {order.orderId}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">{new Date(order.date).toLocaleString()}</div>
                                                <div className="text-sm text-gray-600 mt-2 truncate">
                                                    Buyer: <span className="font-semibold text-gray-800">{order.buyer?.userName || '-'}</span>
                                                    <span className="text-gray-500"> {order.buyer?.email ? `(${order.buyer.email})` : ''}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="text-xs font-semibold px-2 py-1 rounded bg-green-100 text-green-800 capitalize">
                                                    {order.status}
                                                </span>
                                                <span className="font-bold text-green-700">
                                                    {formatCurrency(order.totalEarnings)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-3">
                                            <div className="text-sm font-semibold text-gray-700 mb-2">Items Sold</div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                                                {(order.itemsSold || []).map((item, idx) => (
                                                    <div key={idx} className="text-sm text-gray-700 flex items-center justify-between gap-3">
                                                        <div className="min-w-0 truncate">
                                                            <span className="font-medium text-gray-900">{item.name}</span>
                                                            <span className="text-gray-500"> × {item.quantity}</span>
                                                        </div>
                                                        <div className="text-xs text-gray-500 shrink-0">
                                                            {formatCurrency(item.price)} each
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerDashboard;