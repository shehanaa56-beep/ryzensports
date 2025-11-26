import React, { useState, useEffect } from 'react';
import { useLogin } from './LoginContext';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
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
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    currentPrice: '',
    originalPrice: '',
    discount: '',
    category: '',
    section: 'home', // 'home' or 'outlet'
    image: null,
    imageUrl: '',
    useUrl: false,
    image2: null,
    image2Url: '',
    image3: null,
    image3Url: '',
    sizes: {
      XS: 10,
      S: 10,
      M: 10,
      L: 10,
      XL: 10,
      '2XL': 10,
      '3XL': 10,
      '4XL': 10
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
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'orders'));
      const ordersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchSupportSubmissions = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'supportSubmissions'));
      const submissionsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSupportSubmissions(submissionsData);
    } catch (error) {
      console.error('Error fetching support submissions:', error);
    }
  };

  const handleDeleteSubmission = async (submissionId) => {
    try {
      await deleteDoc(doc(db, 'supportSubmissions', submissionId));
      // Refresh the support submissions list
      await fetchSupportSubmissions();
      alert('Support ticket resolved and removed successfully!');
    } catch (error) {
      console.error('Error deleting support submission:', error);
      alert('Error deleting support submission. Please try again.');
    }
  };

  const handleImageUpload = async (file, folder = 'products') => {
    if (!file) return '';
    try {
      const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      return '';
    }
  };

  const fetchInstaCollections = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'instaCollections'));
      const collectionsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setInstaCollections(collectionsData);
    } catch (error) {
      console.error('Error fetching insta collections:', error);
    }
  };

  const handleInstaSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = collectionForm.imageUrl;

      if (collectionForm.image) {
        imageUrl = await handleImageUpload(collectionForm.image, 'insta');
        if (!imageUrl) {
          alert('Failed to upload image. Please try again.');
          return;
        }
      }

      const collectionData = {
        image: imageUrl,
        title: collectionForm.title,
        description: collectionForm.description,
        cta: collectionForm.cta,
        hasLogo: collectionForm.hasLogo,
        brandName: collectionForm.brandName,
        isBordered: collectionForm.isBordered,
        createdAt: new Date()
      };

      if (editingCollection) {
        await updateDoc(doc(db, 'instaCollections', editingCollection.id), collectionData);
      } else {
        await addDoc(collection(db, 'instaCollections'), collectionData);
      }

      setCollectionForm({
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
      setEditingCollection(null);
      fetchInstaCollections();
      alert('Collection saved successfully!');
    } catch (error) {
      console.error('Error saving collection:', error);
      alert('Error saving collection. Please try again.');
    }
  };

  const handleEditCollection = (collection) => {
    setEditingCollection(collection);
    setCollectionForm({
      image: null,
      imageUrl: collection.image,
      title: collection.title,
      description: collection.description,
      cta: collection.cta,
      hasLogo: collection.hasLogo || false,
      brandName: collection.brandName || '',
      isBordered: collection.isBordered !== false
    });
  };

  const handleDeleteCollection = async (collectionId) => {
    if (window.confirm('Are you sure you want to delete this collection?')) {
      try {
        await deleteDoc(doc(db, 'instaCollections', collectionId));
        fetchInstaCollections();
      } catch (error) {
        console.error('Error deleting collection:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = productForm.imageUrl;
      let image2Url = productForm.image2Url;
      let image3Url = productForm.image3Url;

      if (productForm.image) {
        imageUrl = await handleImageUpload(productForm.image);
        if (!imageUrl) {
          alert('Failed to upload main image. Please try again.');
          return;
        }
      }
      if (productForm.image2) {
        image2Url = await handleImageUpload(productForm.image2);
        if (!image2Url) {
          alert('Failed to upload secondary image. Please try again.');
          return;
        }
      }
      if (productForm.image3) {
        image3Url = await handleImageUpload(productForm.image3);
        if (!image3Url) {
          alert('Failed to upload tertiary image. Please try again.');
          return;
        }
      }

      const productData = {
        name: productForm.name,
        currentPrice: productForm.currentPrice,
        originalPrice: productForm.originalPrice,
        discount: productForm.discount,
        category: productForm.category,
        section: productForm.section,
        image: imageUrl,
        image2: image2Url,
        image3: image3Url,
        sizes: productForm.sizes,
        createdAt: new Date()
      };

      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), productData);
      } else {
        await addDoc(collection(db, 'products'), productData);
      }

      setProductForm({
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
          XS: 10,
          S: 10,
          M: 10,
          L: 10,
          XL: 10,
          '2XL': 10,
          '3XL': 10,
          '4XL': 10
        }
      });
      setEditingProduct(null);
      fetchProducts();
      alert('Product saved successfully!');
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product. Please try again.');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      currentPrice: product.currentPrice,
      originalPrice: product.originalPrice,
      discount: product.discount,
      category: product.category,
      section: product.section,
      image: null,
      imageUrl: product.image,
      image2: null,
      image2Url: product.image2 || '',
      image3: null,
      image3Url: product.image3 || '',
      sizes: product.sizes || {
        XS: 10,
        S: 10,
        M: 10,
        L: 10,
        XL: 10,
        '2XL': 10,
        '3XL': 10,
        '4XL': 10
      }
    });
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', productId));
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  if (!isLoggedIn || !isAdmin) {
    return (
      <div className="admin-login">
        <div className="login-container">
          <h2>Access Denied</h2>
          <p>You must be logged in as an admin to access this page.</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'products':
        return (
          <div className="dashboard-content">
            <div className="product-form">
              <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Product Name:</label>
                    <input
                      type="text"
                      value={productForm.name}
                      onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Category:</label>
                    <input
                      type="text"
                      value={productForm.category}
                      onChange={(e) => setProductForm({...productForm, category: e.target.value})}
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
                      onChange={(e) => setProductForm({...productForm, currentPrice: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Original Price:</label>
                    <input
                      type="text"
                      value={productForm.originalPrice}
                      onChange={(e) => setProductForm({...productForm, originalPrice: e.target.value})}
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
                      onChange={(e) => setProductForm({...productForm, discount: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Section:</label>
                    <select
                      value={productForm.section}
                      onChange={(e) => setProductForm({...productForm, section: e.target.value})}
                    >
                      <option value="home">Home</option>
                      <option value="outlet">Outlet</option>
                    </select>
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
                        onChange={() => setProductForm({...productForm, useUrl: false, imageUrl: '', image2Url: '', image3Url: ''})}
                      />
                      Upload Files
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="uploadMethod"
                        checked={productForm.useUrl}
                        onChange={() => setProductForm({...productForm, useUrl: true, image: null, image2: null, image3: null})}
                      />
                      Use URLs
                    </label>
                  </div>
                </div>

                {!productForm.useUrl ? (
                  <>
                    <div className="form-group">
                      <label>Main Image File (for product card):</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setProductForm({...productForm, image: e.target.files[0]})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Secondary Image File (for product details):</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setProductForm({...productForm, image2: e.target.files[0]})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Tertiary Image File (for product details):</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setProductForm({...productForm, image3: e.target.files[0]})}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-group">
                      <label>Main Image URL (for product card):</label>
                      <input
                        type="url"
                        value={productForm.imageUrl}
                        onChange={(e) => setProductForm({...productForm, imageUrl: e.target.value})}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div className="form-group">
                      <label>Secondary Image URL (for product details):</label>
                      <input
                        type="url"
                        value={productForm.image2Url}
                        onChange={(e) => setProductForm({...productForm, image2Url: e.target.value})}
                        placeholder="https://example.com/image2.jpg"
                      />
                    </div>
                    <div className="form-group">
                      <label>Tertiary Image URL (for product details):</label>
                      <input
                        type="url"
                        value={productForm.image3Url}
                        onChange={(e) => setProductForm({...productForm, image3Url: e.target.value})}
                        placeholder="https://example.com/image3.jpg"
                      />
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label>Size Quantities (default 10 each):</label>
                  <div className="sizes-grid">
                    {Object.keys(productForm.sizes).map(size => (
                      <div key={size} className="size-input-group">
                        <label>{size}:</label>
                        <input
                          type="number"
                          min="0"
                          value={productForm.sizes[size]}
                          onChange={(e) => setProductForm({
                            ...productForm,
                            sizes: {
                              ...productForm.sizes,
                              [size]: parseInt(e.target.value) || 0
                            }
                          })}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {(productForm.useUrl ? productForm.imageUrl : productForm.image) && (
                  <div className="image-preview">
                    <img
                      src={productForm.useUrl ? productForm.imageUrl : URL.createObjectURL(productForm.image)}
                      alt="Product preview"
                      style={{width: '100px', height: '100px', objectFit: 'cover'}}
                    />
                  </div>
                )}

                <button type="submit" className="submit-btn">
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
                {editingProduct && (
                  <button type="button" onClick={() => setEditingProduct(null)} className="cancel-btn">
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
                    <img src={product.image} alt={product.name} className="product-image" />
                    <div className="product-info">
                      <h3>{product.name}</h3>
                      <p>Section: {product.section}</p>
                      <p>Category: {product.category}</p>
                      <p>Price: {product.currentPrice}</p>
                      <p>Original: {product.originalPrice}</p>
                      <p>Discount: {product.discount}</p>
                      <div className="product-actions">
                        <button onClick={() => handleEdit(product)} className="edit-btn">Edit</button>
                        <button onClick={() => handleDelete(product.id)} className="delete-btn">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'orders':
        return (
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
                      <span className="order-status">{order.status || 'Pending'}</span>
                    </div>
                    <div className="order-details">
                      <p><strong>Date:</strong> {order.createdAt ? new Date(order.createdAt.toDate()).toLocaleDateString() : 'N/A'}</p>
                      <p><strong>Total:</strong> ₹{order.total}</p>
                      <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
                      <div className="order-items">
                        <h4>Items:</h4>
                        <ul>
                          {order.items && order.items.map((item, index) => (
                            item ? (
                              <li key={index}>
                                {item.name} x {item.quantity} - ₹{(parseFloat(item.currentPrice.replace('₹', '')) * item.quantity).toFixed(2)}
                              </li>
                            ) : null
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

      case 'support':
        return (
          <div className="support-section">
            <h2>Customer Support Submissions ({supportSubmissions.length})</h2>
            {supportSubmissions.length === 0 ? (
              <p>No support submissions found.</p>
            ) : (
              <div className="support-list">
                {supportSubmissions.map((submission) => (
                  <div key={submission.id} className="support-card">
                    <div className="support-header">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <div>
                          <h3>Submission #{submission.id.slice(-6)}</h3>
                          <span className="submission-date">
                            {submission.createdAt ? new Date(submission.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteSubmission(submission.id)}
                          style={{
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <span>Mark as Resolved</span>
                        </button>
                      </div>
                    </div>
                    <div className="support-details">
                      <p><strong>Email:</strong> {submission.email}</p>
                      <p><strong>Help Type:</strong> {submission.helpType}</p>
                      {submission.whatsappNumber && (
                        <p><strong>WhatsApp:</strong> {submission.whatsappNumber}</p>
                      )}
                      {submission.orderId && (
                        <p><strong>Order ID:</strong> {submission.orderId}</p>
                      )}
                      <div className="enquiry-section">
                        <h4>Enquiry:</h4>
                        <p>{submission.enquiry}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'insta':
        return (
          <div className="dashboard-content">
            <div className="product-form">
              <h2>{editingCollection ? 'Edit Collection' : 'Add New Collection'}</h2>
              <form onSubmit={handleInstaSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Title:</label>
                    <input
                      type="text"
                      value={collectionForm.title}
                      onChange={(e) => setCollectionForm({...collectionForm, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description:</label>
                    <input
                      type="text"
                      value={collectionForm.description}
                      onChange={(e) => setCollectionForm({...collectionForm, description: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>CTA Text:</label>
                    <input
                      type="text"
                      value={collectionForm.cta}
                      onChange={(e) => setCollectionForm({...collectionForm, cta: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Brand Name (optional):</label>
                    <input
                      type="text"
                      value={collectionForm.brandName}
                      onChange={(e) => setCollectionForm({...collectionForm, brandName: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={collectionForm.hasLogo}
                        onChange={(e) => setCollectionForm({...collectionForm, hasLogo: e.target.checked})}
                      />
                      Has Logo
                    </label>
                  </div>
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={collectionForm.isBordered}
                        onChange={(e) => setCollectionForm({...collectionForm, isBordered: e.target.checked})}
                      />
                      Bordered
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Image Upload Method:</label>
                  <div className="upload-options">
                    <label>
                      <input
                        type="radio"
                        name="collectionUploadMethod"
                        checked={!collectionForm.useUrl}
                        onChange={() => setCollectionForm({...collectionForm, useUrl: false, imageUrl: ''})}
                      />
                      Upload File
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="collectionUploadMethod"
                        checked={collectionForm.useUrl}
                        onChange={() => setCollectionForm({...collectionForm, useUrl: true, image: null})}
                      />
                      Use URL
                    </label>
                  </div>
                </div>

                {!collectionForm.useUrl ? (
                  <div className="form-group">
                    <label>Image File:</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setCollectionForm({...collectionForm, image: e.target.files[0]})}
                    />
                  </div>
                ) : (
                  <div className="form-group">
                    <label>Image URL:</label>
                    <input
                      type="url"
                      value={collectionForm.imageUrl}
                      onChange={(e) => setCollectionForm({...collectionForm, imageUrl: e.target.value})}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                )}

                {(collectionForm.useUrl ? collectionForm.imageUrl : collectionForm.image) && (
                  <div className="image-preview">
                    <img
                      src={collectionForm.useUrl ? collectionForm.imageUrl : URL.createObjectURL(collectionForm.image)}
                      alt="Collection preview"
                      style={{width: '100px', height: '100px', objectFit: 'cover'}}
                    />
                  </div>
                )}

                <button type="submit" className="submit-btn">
                  {editingCollection ? 'Update Collection' : 'Add Collection'}
                </button>
                {editingCollection && (
                  <button type="button" onClick={() => setEditingCollection(null)} className="cancel-btn">
                    Cancel
                  </button>
                )}
              </form>
            </div>

            <div className="products-list">
              <h2>Collections ({instaCollections.length})</h2>
              <div className="products-grid">
                {instaCollections.map((collection) => (
                  <div key={collection.id} className="product-card">
                    <img src={collection.image} alt={collection.title} className="product-image" />
                    <div className="product-info">
                      <h3>{collection.title}</h3>
                      <p>{collection.description}</p>
                      <p>CTA: {collection.cta}</p>
                      <div className="product-actions">
                        <button onClick={() => handleEditCollection(collection)} className="edit-btn">Edit</button>
                        <button onClick={() => handleDeleteCollection(collection.id)} className="delete-btn">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div className="menu-container">
          <button
            className="menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
          {sidebarOpen && (
            <div className="dropdown-menu">
              <button
                className={`dropdown-btn ${activeTab === 'products' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('products');
                  setSidebarOpen(false);
                }}
              >
                Products
              </button>
              <button
                className={`dropdown-btn ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('orders');
                  setSidebarOpen(false);
                }}
              >
                Order History
              </button>
              <button
                className={`dropdown-btn ${activeTab === 'support' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('support');
                  setSidebarOpen(false);
                }}
              >
                Customer Support
              </button>
              <button
                className={`dropdown-btn ${activeTab === 'insta' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('insta');
                  setSidebarOpen(false);
                }}
              >
                Insta Collections
              </button>
            </div>
          )}
        </div>
        <h1>Admin Dashboard</h1>
        <button onClick={logout} className="logout-btn">Logout</button>
      </div>

      <div className="content-area">
        {renderContent()}
      </div>
    </div>
  );
}

export default AdminDashboard;
