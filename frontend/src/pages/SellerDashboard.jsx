import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSellerProducts, fetchSellerHistory } from '../slices/sellerSlice';
import axios from 'axios';
import toast from 'react-hot-toast';

const SellerDashboard = () => {
    const dispatch = useDispatch();
    const { products, history, status, error } = useSelector((state) => state.seller);


    // Add product form state
    const [form, setForm] = useState({
        name: '',
        price: '',
        description: '',
        category: '',
        stock: '',
        images: [],
    });
    const [editId, setEditId] = useState(null);

    const token = localStorage.getItem('accessToken');

    useEffect(() => {
        if (token) {
            dispatch(fetchSellerProducts(token));
            dispatch(fetchSellerHistory(token));
        }
    }, [dispatch, token]);

    const handleInput = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddOrEditProduct = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await axios.put(`http://localhost:8001/market/seller/product/${editId}`, form, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success('Product updated');
                setEditId(null);
            } else {
                await axios.post('http://localhost:8001/market/seller/product', form, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success('Product added');
            }
            setForm({ name: '', price: '', description: '', category: '', stock: '', images: [] });
            dispatch(fetchSellerProducts(token));
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Error');
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
            images: product.images || [],
        });
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:8001/market/seller/product/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('Product deleted');
            dispatch(fetchSellerProducts(token));
        } catch (err) {
            toast.error('Delete failed');
        }
    };

    return (
        <div className="min-h-screen bg-purple-50 py-8">
            <div className="max-w-5xl mx-auto">
                <h2 className="text-3xl font-bold mb-6 text-center">Seller Dashboard</h2>
                {status === 'loading' && <div className="text-center">Loading...</div>}
                {status === 'failed' && <div className="text-center text-red-500">{error}</div>}
                {/* Add/Edit Product Form */}
                <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4">{editId ? 'Edit Product' : 'Add Product'}</h3>
                    <form onSubmit={handleAddOrEditProduct} className="bg-white rounded-lg shadow p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="name" value={form.name} onChange={handleInput} placeholder="Name" className="border p-2 rounded" required />
                        <input name="price" value={form.price} onChange={handleInput} placeholder="Price" type="number" className="border p-2 rounded" required />
                        <input name="category" value={form.category} onChange={handleInput} placeholder="Category" className="border p-2 rounded" required />
                        <input name="stock" value={form.stock} onChange={handleInput} placeholder="Stock" type="number" className="border p-2 rounded" required />
                        <input name="description" value={form.description} onChange={handleInput} placeholder="Description" className="border p-2 rounded col-span-2" required />
                        <button type="submit" className="col-span-2 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition">{editId ? 'Update' : 'Add'} Product</button>
                        {editId && <button type="button" className="col-span-2 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition" onClick={() => { setEditId(null); setForm({ name: '', price: '', description: '', category: '', stock: '', images: [] }); }}>Cancel</button>}
                    </form>

                    <h3 className="text-xl font-semibold mb-4">My Products</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {products.length === 0 && <div className="text-gray-500">No products found.</div>}
                        {products.map((product) => (
                            <div key={product._id} className="bg-white rounded-lg shadow p-4">
                                <h4 className="font-bold text-lg mb-1">{product.name}</h4>
                                <p className="text-gray-600 mb-1">{product.description}</p>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-blue-600 font-bold">₹{product.price}</span>
                                    <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600" onClick={() => handleEdit(product)}>Edit</button>
                                    <button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600" onClick={() => handleDelete(product._id)}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-semibold mb-4">Sales History</h3>
                    <div className="space-y-4">
                        {history.length === 0 && <div className="text-gray-500">No sales history found.</div>}
                        {history.map((order) => (
                            <div key={order.orderId} className="bg-white rounded-lg shadow p-4">
                                <div className="flex justify-between mb-2">
                                    <span className="font-bold">Order ID: {order.orderId}</span>
                                    <span className="text-sm text-gray-500">{new Date(order.date).toLocaleString()}</span>
                                </div>
                                <div className="mb-2">Buyer: {order.buyer.userName} ({order.buyer.email})</div>
                                <div className="mb-2">Status: <span className="font-semibold">{order.status}</span></div>
                                <div className="mb-2">Total Earnings: <span className="font-bold text-green-600">₹{order.totalEarnings}</span></div>
                                <div>
                                    <h4 className="font-semibold mb-1">Items Sold:</h4>
                                    <ul className="list-disc pl-6">
                                        {order.itemsSold.map((item) => (
                                            <li key={item.productId}>
                                                {item.name} x {item.quantity} (₹{item.price} each)
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerDashboard;
