import React, { useState, useEffect } from 'react';
import { useLogin } from './LoginContext';
import {
  collection, addDoc, getDocs, doc, updateDoc, deleteDoc,
  query, where, orderBy
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import './AdminDashboard.css';

function AdminDashboard() {
  const { isLoggedIn, isAdmin, logout } = useLogin();
  const [activeTab, setActiveTab] = useState('products');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [supportSubmissions, setSupportSubmissions] = useState([]);
  const [instaCollections, setInstaCollections] = useState([]);
  const [editingCollection, setEditingCollection] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  const [collectionForm, setCollectionForm] = useState({
    image: null,
    imageUrl: '',
    useUrl: false,
    title: '',
    description: '',
    cta: '',
    hasLogo: false,
    brandName: '',
    isBordered: true
  });

  const [productForm, setProductForm] = useState({
    name: '',
    currentPrice: '',
    originalPrice: '',
    discount: '',
    category: '',
    section: 'home',
    image: null,
    imageUrl: '',
    useUrl: false,
    image2: null,
    image2Url: '',
    image3: null,
    image3Url: '',
    sizes: {
      XS: 10, S: 10, M: 10, L: 10,
      XL: 10, '2XL': 10, '3XL': 10, '4XL': 10
    }
  });

  useEffect(() => {
    if (isLoggedIn && isAdmin) {
      fetchProducts();
      fetchOrders();
      fetchSupportSubmissions();
      fetchInstaCollections();
    }
  }, [isLoggedIn, isAdmin]);

  const fetchProducts = async () => {
    try {
      const q = await getDocs(collection(db, 'products'));
      const productsData = q.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsData);
    } catch (err) { console.error(err); }
  };

  const fetchOrders = async () => {
    try {
      const ordersRef = collection(db, "orders");
      const q = query(
        ordersRef,
        where("status", "==", "Paid"),
        orderBy("orderDate", "desc")
      );

      const snap = await getDocs(q);
      const ordersList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersList);
    } catch (err) { console.error(err); }
  };

  const fetchSupportSubmissions = async () => {
    try {
      const q = await getDocs(collection(db, 'supportSubmissions'));
      const list = q.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSupportSubmissions(list);
    } catch (err) { console.error(err); }
  };

  const fetchInstaCollections = async () => {
    try {
      const q = await getDocs(collection(db, 'instaCollections'));
      const list = q.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInstaCollections(list);
    } catch (err) { console.error(err); }
  };

  const handleImageUpload = async (file, folder = "products") => {
    if (!file) return '';
    try {
      const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    } catch (err) {
      console.error(err);
      return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = productForm.imageUrl;
      let image2Url = productForm.image2Url;
      let image3Url = productForm.image3Url;

      if (productForm.image)
        imageUrl = await handleImageUpload(productForm.image);

      if (productForm.image2)
        image2Url = await handleImageUpload(productForm.image2);

      if (productForm.image3)
        image3Url = await handleImageUpload(productForm.image3);

      const payload = {
        ...productForm,
        image: imageUrl,
        image2: image2Url,
        image3: image3Url,
        createdAt: new Date()
      };

      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), payload);
      } else {
        await addDoc(collection(db, 'products'), payload);
      }

      fetchProducts();
      alert("Product saved!");
      setEditingProduct(null);
    } catch (err) {
      console.error(err);
      alert("Error saving product");
    }
  };

  /* 🔥 FIXED handleEdit */
  const handleEdit = (product) => {
    setEditingProduct(product);

    setProductForm({
      ...productForm,
      name: product.name,
      currentPrice: product.currentPrice,
      originalPrice: product.originalPrice,
      discount: product.discount,
      category: product.category,
      section: product.section,

      useUrl: true,          // IMPORTANT FIX
      image: null,
      image2: null,
      image3: null,

      imageUrl: product.image,
      image2Url: product.image2 || "",
      image3Url: product.image3 || "",

      sizes: product.sizes
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete product?")) {
      await deleteDoc(doc(db, 'products', id));
      fetchProducts();
    }
  };

  const renderProductsTab = () => (
    <div className="dashboard-content">
      <div className="product-form">
        <h2>{editingProduct ? "Edit Product" : "Add New Product"}</h2>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Section:</label>
            <select
              value={productForm.section}
              onChange={(e) =>
                setProductForm({ ...productForm, section: e.target.value })
              }
            >
              <option value="home">Home</option>
              <option value="outlet">Outlet</option>
              <option value="fullsleeves">Fullsleeves</option>
              <option value="halfsleeves">Halfsleeves</option>
              <option value="oversized">Oversized</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Product Name:</label>
              <input
                type="text"
                value={productForm.name}
                onChange={(e) =>
                  setProductForm({ ...productForm, name: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Category:</label>
              <input
                type="text"
                value={productForm.category}
                onChange={(e) =>
                  setProductForm({ ...productForm, category: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Current Price:</label>
              <input
                type="text"
                value={productForm.currentPrice}
                onChange={(e) =>
                  setProductForm({ ...productForm, currentPrice: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Original Price:</label>
              <input
                type="text"
                value={productForm.originalPrice}
                onChange={(e) =>
                  setProductForm({ ...productForm, originalPrice: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Discount:</label>
              <input
                type="text"
                value={productForm.discount}
                onChange={(e) =>
                  setProductForm({ ...productForm, discount: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Image Upload Method:</label>
            <div className="upload-options">
              <label>
                <input
                  type="radio"
                  name="uploadMethod"
                  checked={!productForm.useUrl}
                  onChange={() =>
                    setProductForm({
                      ...productForm,
                      useUrl: false,
                      imageUrl: "",
                      image2Url: "",
                      image3Url: ""
                    })
                  }
                />
                Upload Files
              </label>

              <label>
                <input
                  type="radio"
                  name="uploadMethod"
                  checked={productForm.useUrl}
                  onChange={() =>
                    setProductForm({
                      ...productForm,
                      useUrl: true,
                      image: null,
                      image2: null,
                      image3: null
                    })
                  }
                />
                Use URLs
              </label>
            </div>
          </div>

          {!productForm.useUrl ? (
            <>
              <div className="form-group">
                <label>Main Image File:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      image: e.target.files[0]
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Secondary Image File:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      image2: e.target.files[0]
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Tertiary Image File:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      image3: e.target.files[0]
                    })
                  }
                />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>Main Image URL:</label>
                <input
                  type="url"
                  value={productForm.imageUrl}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      imageUrl: e.target.value
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Secondary Image URL:</label>
                <input
                  type="url"
                  value={productForm.image2Url}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      image2Url: e.target.value
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Tertiary Image URL:</label>
                <input
                  type="url"
                  value={productForm.image3Url}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      image3Url: e.target.value
                    })
                  }
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Size Quantities:</label>
            <div className="sizes-grid">
              {Object.keys(productForm.sizes).map((size) => (
                <div key={size} className="size-input-group">
                  <label>{size}:</label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.sizes[size]}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        sizes: {
                          ...productForm.sizes,
                          [size]: parseInt(e.target.value) || 0
                        }
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 🔥 FIXED - safe preview */}
          {(productForm.image || productForm.imageUrl) && (
            <div className="image-preview">
              <img
                src={
                  productForm.useUrl
                    ? productForm.imageUrl
                    : productForm.image instanceof File
                      ? URL.createObjectURL(productForm.image)
                      : ""
                }
                alt="Preview"
                style={{
                  width: "100px",
                  height: "100px",
                  objectFit: "cover",
                }}
              />
            </div>
          )}

          <button type="submit" className="submit-btn">
            {editingProduct ? "Update Product" : "Add Product"}
          </button>

          {editingProduct && (
            <button
              type="button"
              onClick={() => setEditingProduct(null)}
              className="cancel-btn"
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      <div className="products-list">
        <h2>Products ({products.length})</h2>

        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <img
                src={product.image}
                className="product-image"
                alt={product.name}
              />

              <div className="product-info">
                <h3>{product.name}</h3>
                <p>Section: {product.section}</p>
                <p>Category: {product.category}</p>
                <p>Price: {product.currentPrice}</p>
                <p>Original: {product.originalPrice}</p>
                <p>Discount: {product.discount}</p>

                <div className="product-actions">
                  <button
                    onClick={() => handleEdit(product)}
                    className="edit-btn"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(product.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ORDERS, SUPPORT, INSTA — UNCHANGED
  const renderOrdersTab = () => (
    <div className="orders-section">
      <h2>Order History ({orders.length})</h2>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <h3>Order #{order.id}</h3>
                <span className="order-status">{order.status}</span>
              </div>

              <div className="order-details">
                <p>
                  <strong>Date:</strong>{" "}
                  {order.createdAt
                    ? new Date(order.createdAt.toDate()).toLocaleDateString()
                    : "N/A"}
                </p>

                <p>
                  <strong>Total:</strong> ₹{order.total}
                </p>

                <p>
                  <strong>Payment Method:</strong> {order.paymentMethod}
                </p>

                <div className="order-items">
                  <h4>Items:</h4>
                  <ul>
                    {order.items?.map((item, i) => (
                      <li key={i}>
                        {item.name} x {item.quantity}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="order-address">
                  <h4>Shipping Address:</h4>
                  <p>{order.shippingAddress}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSupportTab = () => (
    <div className="support-section">
      <h2>Customer Support Submissions ({supportSubmissions.length})</h2>

      {supportSubmissions.length === 0 ? (
        <p>No support tickets available.</p>
      ) : (
        <div className="support-list">
          {supportSubmissions.map((sub) => (
            <div key={sub.id} className="support-card">
              <div className="support-header">
                <h3>Submission #{sub.id.slice(-6)}</h3>
                <span className="submission-date">
                  {sub.createdAt
                    ? new Date(sub.createdAt.toDate()).toLocaleDateString()
                    : "N/A"}
                </span>

                <button
                  onClick={() => handleDelete(sub.id)}
                  className="resolve-btn"
                >
                  Mark as Resolved
                </button>
              </div>

              <div className="support-details">
                <p><strong>Email:</strong> {sub.email}</p>
                <p><strong>Help Type:</strong> {sub.helpType}</p>
                {sub.whatsappNumber && (
                  <p><strong>WhatsApp:</strong> {sub.whatsappNumber}</p>
                )}
                {sub.orderId && (
                  <p><strong>Order ID:</strong> {sub.orderId}</p>
                )}

                <h4>Enquiry:</h4>
                <p>{sub.enquiry}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderInstaTab = () => (
    <div className="dashboard-content">
      <div className="product-form">
        <h2>{editingCollection ? "Edit Collection" : "Add New Collection"}</h2>
      </div>

      <div className="products-list">
        <h2>Collections ({instaCollections.length})</h2>

        <div className="products-grid">
          {instaCollections.map((col) => (
            <div key={col.id} className="product-card">
              <img src={col.image} alt={col.title} className="product-image" />

              <div className="product-info">
                <h3>{col.title}</h3>
                <p>{col.description}</p>
                <p>CTA: {col.cta}</p>

                <div className="product-actions">
                  <button
                    onClick={() => setEditingCollection(col)}
                    className="edit-btn"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteDoc(doc(db, "instaCollections", col.id))}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div className="menu-container">
          <button
            className="menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>

          {sidebarOpen && (
            <div className="dropdown-menu">
              <button
                className={`dropdown-btn ${activeTab === "products" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("products");
                  setSidebarOpen(false);
                }}
              >
                Products
              </button>

              <button
                className={`dropdown-btn ${activeTab === "orders" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("orders");
                  setSidebarOpen(false);
                }}
              >
                Order History
              </button>

              <button
                className={`dropdown-btn ${activeTab === "support" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("support");
                  setSidebarOpen(false);
                }}
              >
                Customer Support
              </button>

            </div>
          )}
        </div>

        <h1>Admin Dashboard</h1>

        <button onClick={logout} className="logout-btn">
          Logout
        </button>
      </div>

      <div className="content-area">
        {activeTab === "products" && renderProductsTab()}
        {activeTab === "orders" && renderOrdersTab()}
        {activeTab === "support" && renderSupportTab()}
        {activeTab === "insta" && renderInstaTab()}
      </div>
    </div>
  );
}

export default AdminDashboard;
