import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSellerProducts, fetchSellerHistory } from '../slices/sellerSlice';
import axios from 'axios';
import toast from 'react-hot-toast';

const SellerDashboard = () => {
    const dispatch = useDispatch();
    const { products, history, status, error } = useSelector((state) => state.seller);

    const [form, setForm] = useState({
        name: '',
        price: '',
        description: '',
        category: '',
        stock: '',
    });
    
    // State to hold the actual file object
    const [imageFile, setImageFile] = useState(null);
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

    // Handle file selection
    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleAddOrEditProduct = async (e) => {
        e.preventDefault();
        
        // Use FormData for multipart/form-data (required for Multer)
        const data = new FormData();
        data.append('name', form.name);
        data.append('price', form.price);
        data.append('description', form.description);
        data.append('category', form.category);
        data.append('stock', form.stock);
        
        // Only append image if one is selected
        if (imageFile) {
            data.append('image', imageFile); // 'image' must match upload.single('image') in backend
        }

        try {
            if (editId) {
                await axios.put(`http://localhost:8001/market/seller/product/${editId}`, data, {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data' 
                    },
                });
                toast.success('Product updated');
                setEditId(null);
            } else {
                if (!imageFile) return toast.error("Please select an image");
                
                await axios.post('http://localhost:8001/market/seller/product', data, {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data' 
                    },
                });
                toast.success('Product added');
            }

            // Reset form
            setForm({ name: '', price: '', description: '', category: '', stock: '' });
            setImageFile(null);
            document.getElementById('fileInput').value = ""; // Clear file input
            dispatch(fetchSellerProducts(token));
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
        // We don't set imageFile here as they might want to keep the old image
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Delete this product?")) return;
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
            <div className="max-w-5xl mx-auto px-4">
                <h2 className="text-3xl font-bold mb-6 text-center text-purple-800">Seller Dashboard</h2>
                
                {status === 'loading' && <div className="text-center">Loading...</div>}
                {status === 'failed' && <div className="text-center text-red-500">{error}</div>}

                {/* Add/Edit Product Form */}
                <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4">{editId ? 'Edit Product' : 'Add Product'}</h3>
                    <form onSubmit={handleAddOrEditProduct} className="bg-white rounded-lg shadow-md p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="name" value={form.name} onChange={handleInput} placeholder="Name" className="border p-2 rounded" required />
                        <input name="price" value={form.price} onChange={handleInput} placeholder="Price" type="number" className="border p-2 rounded" required />
                        <input name="category" value={form.category} onChange={handleInput} placeholder="Category" className="border p-2 rounded" required />
                        <input name="stock" value={form.stock} onChange={handleInput} placeholder="Stock" type="number" className="border p-2 rounded" required />
                        <input name="description" value={form.description} onChange={handleInput} placeholder="Description" className="border p-2 rounded col-span-1 md:col-span-2" required />
                        
                        {/* New File Input */}
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                            <input 
                                id="fileInput"
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileChange} 
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                                required={!editId} // Image required only for new products
                            />
                        </div>

                        <button type="submit" className="col-span-1 md:col-span-2 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition">
                            {editId ? 'Update' : 'Add'} Product
                        </button>
                        
                        {editId && (
                            <button type="button" className="col-span-1 md:col-span-2 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition" 
                                onClick={() => { 
                                    setEditId(null); 
                                    setForm({ name: '', price: '', description: '', category: '', stock: '' });
                                    setImageFile(null);
                                }}>
                                Cancel Edit
                            </button>
                        )}
                    </form>

                    <h3 className="text-xl font-semibold mb-4">My Products</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {products.length === 0 && <div className="text-gray-500">No products found.</div>}
                        {products.map((product) => (
                            <div key={product._id} className="bg-white rounded-lg shadow p-4 flex gap-4">
                                {/* Display Product Image */}
                                {product.images && product.images[0] && (
                                    <img 
                                        src={product.images[0]} 
                                        alt={product.name} 
                                        className="w-24 h-24 object-cover rounded shadow-sm"
                                    />
                                )}
                                <div className="flex-1">
                                    <h4 className="font-bold text-lg mb-1">{product.name}</h4>
                                    <p className="text-gray-600 text-sm mb-1 line-clamp-2">{product.description}</p>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-blue-600 font-bold">₹{product.price}</span>
                                        <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600" onClick={() => handleEdit(product)}>Edit</button>
                                        <button className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600" onClick={() => handleDelete(product._id)}>Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sales History section remains the same... */}
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
                                <div className="mb-2 text-sm">Buyer: {order.buyer?.userName} ({order.buyer?.email})</div>
                                <div className="mb-2">Status: <span className="font-semibold px-2 py-1 bg-green-100 text-green-800 rounded text-xs capitalize">{order.status}</span></div>
                                <div className="mb-2">Total Earnings: <span className="font-bold text-green-600">₹{order.totalEarnings}</span></div>
                                <div>
                                    <h4 className="font-semibold text-sm mb-1">Items Sold:</h4>
                                    <ul className="list-disc pl-6 text-sm text-gray-700">
                                        {order.itemsSold.map((item, idx) => (
                                            <li key={idx}>
                                                {item.name} x {item.quantity} (₹{item.price})
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