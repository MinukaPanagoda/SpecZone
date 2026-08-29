import React, { useState, useEffect, useRef } from 'react';
import { Filter, Star, Search, Image as ImageIcon, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, useSearchParams } from 'react-router-dom';

const Shop = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isResponsive, setIsResponsive] = useState(() => window.innerWidth <= 900);
  const [sortFocused, setSortFocused] = useState(false);
  const [sortHovered, setSortHovered] = useState(false);

  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  // Filter state
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);

  // Custom React dropdown state
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState('Popularity');
  const sortRef = useRef(null);

  const sortOptions = [
    'Popularity',
    'Low to High',
    'High to Low',
    'Newest Arrivals',
  ];

  useEffect(() => {
    // Fetch products
    fetch('http://localhost/SpecZone/backend/api/products.php?action=read')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });

    // Fetch categories
    fetch('http://localhost/SpecZone/backend/api/categories.php')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(data);
        }
      })
      .catch(err => console.error("Error fetching categories:", err));
  }, []);

  // Sync category or search query parameter from URL (e.g. from Home page links)
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam && categories.length > 0) {
      const lower = categoryParam.toLowerCase();
      const matchedCat = categories.find(c => {
        const catName = c.name.toLowerCase();
        if (lower === 'cpu') return catName.includes('processor') || catName.includes('cpu');
        if (lower === 'gpu') return catName.includes('graphics') || catName.includes('gpu');
        if (lower === 'ram') return catName.includes('memory') || catName.includes('ram');
        if (lower === 'storage') return catName.includes('storage') || catName.includes('ssd') || catName.includes('hdd');
        return catName.includes(lower);
      });
      if (matchedCat) {
        setSelectedCategories([matchedCat.id]);
      }
    }
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParams, categories]);

  useEffect(() => {
    const handleResize = () => {
      setIsResponsive(window.innerWidth <= 900);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close custom dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setSortOpen(false);
        setSortFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCategoryChange = (categoryId, checked) => {
    setSelectedCategories(prev =>
      checked ? [...prev, categoryId] : prev.filter(id => id !== categoryId)
    );
  };

  const handlePriceRangeChange = (range) => {
    setSelectedPriceRange(range);
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedPriceRange(null);
    setSearchQuery('');
  };

  const matchesPriceRange = (price, range) => {
    const p = parseFloat(price);
    switch (range) {
      case 'under-50k':
        return p < 50000;
      case '50k-100k':
        return p >= 50000 && p <= 100000;
      case '100k-200k':
        return p > 100000 && p <= 200000;
      case 'over-200k':
        return p > 200000;
      default:
        return true;
    }
  };

  const filteredProducts = products
    .filter(product => {
      const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(product.category_id);
      const priceMatch = selectedPriceRange === null || matchesPriceRange(product.price, selectedPriceRange);
      const query = searchQuery.trim().toLowerCase();
      const searchMatch = !query || 
        product.title?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category_name?.toLowerCase().includes(query);
      return categoryMatch && priceMatch && searchMatch;
    })
    .sort((a, b) => {
      if (selectedSort === 'Low to High') {
        return parseFloat(a.price) - parseFloat(b.price);
      }
      if (selectedSort === 'High to Low') {
        return parseFloat(b.price) - parseFloat(a.price);
      }
      if (selectedSort === 'Newest Arrivals') {
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
      return 0; // Popularity / Default
    });

  const sortSelectStyle = {
    width: isResponsive ? '100%' : 'auto',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    color: 'var(--text-primary)',
    border: `1px solid ${
      sortFocused
        ? 'var(--accent-primary)'
        : sortHovered
          ? 'var(--border-highlight)'
          : 'var(--border-color)'
    }`,
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.8rem 2.5rem 0.8rem 1rem',
    fontFamily: 'inherit',
    fontSize: '0.95rem',
    cursor: 'pointer',
    outline: 'none',
    boxShadow: sortFocused ? '0 0 10px rgba(0, 240, 255, 0.1)' : 'none',
    transition: 'all var(--transition-fast)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    userSelect: 'none',
  };

  return (
    <div className="container shop-page">
      <div className="shop-layout">
        {/* Sidebar Filters */}
        <aside
          id="filter-panel"
          className={`shop-sidebar glass-panel${filtersOpen ? ' filters-open' : ''}`}
          style={{
            padding: '2rem',
            height: 'fit-content',
            ...(isResponsive
              ? {
                  display: filtersOpen ? 'block' : 'none',
                  width: '100%',
                  order: 2,
                }
              : {}),
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
            <Filter size={20} />
            <h3 style={{ margin: 0 }}>Filters</h3>
          </div>

          <div className="filter-group">
            <h4>Categories</h4>
            {categories.map(cat => (
              <label key={cat.id} className="filter-label">
                <input
                  type="checkbox"
                  value={cat.id}
                  className="speczone-control"
                  checked={selectedCategories.includes(cat.id)}
                  onChange={(e) => handleCategoryChange(cat.id, e.target.checked)}
                />
                {cat.name}
              </label>
            ))}
          </div>

          <div className="filter-group">
            <h4>Price Range</h4>
            <label className="filter-label">
              <input
                type="radio"
                name="price"
                className="speczone-control"
                value="under-50k"
                checked={selectedPriceRange === 'under-50k'}
                onChange={(e) => handlePriceRangeChange(e.target.value)}
              />
              Under Rs. 50,000
            </label>
            <label className="filter-label">
              <input
                type="radio"
                name="price"
                className="speczone-control"
                value="50k-100k"
                checked={selectedPriceRange === '50k-100k'}
                onChange={(e) => handlePriceRangeChange(e.target.value)}
              />
              Rs. 50,000 - 100,000
            </label>
            <label className="filter-label">
              <input
                type="radio"
                name="price"
                className="speczone-control"
                value="100k-200k"
                checked={selectedPriceRange === '100k-200k'}
                onChange={(e) => handlePriceRangeChange(e.target.value)}
              />
              Rs. 100,000 - 200,000
            </label>
            <label className="filter-label">
              <input
                type="radio"
                name="price"
                className="speczone-control"
                value="over-200k"
                checked={selectedPriceRange === 'over-200k'}
                onChange={(e) => handlePriceRangeChange(e.target.value)}
              />
              Over Rs. 200,000
            </label>
          </div>

          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleClearFilters}>Clear Filters</button>
        </aside>

        {isResponsive && (
          <button
            type="button"
            className="btn btn-outline"
            aria-expanded={filtersOpen}
            aria-controls="filter-panel"
            onClick={() => setFiltersOpen(prev => !prev)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.5rem',
              order: 1,
            }}
          >
            <Filter size={18} />
            Filters
          </button>
        )}

        {/* Main Content */}
        <main
          className="shop-main"
          style={isResponsive ? { order: 3 } : undefined}
        >
          <div
            className="shop-header"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: isResponsive ? 'stretch' : 'center',
              marginBottom: '2rem',
              ...(isResponsive
                ? {
                    flexDirection: 'column',
                    gap: '1rem',
                  }
                : {}),
            }}
          >
            <h2 style={{ margin: 0 }}>All Components</h2>

            <div
              className="shop-header-controls"
              style={{
                display: 'flex',
                gap: '1rem',
                ...(isResponsive
                  ? {
                      width: '100%',
                      flexDirection: 'column',
                      alignItems: 'stretch',
                    }
                  : {}),
              }}
            >
              <div
                className="shop-search"
                style={{
                  position: 'relative',
                  ...(isResponsive ? { width: '100%' } : {}),
                }}
              >
                <Search
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-secondary)',
                  }}
                />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-control shop-search-input"
                  style={{
                    paddingLeft: '2.5rem',
                    ...(isResponsive ? { width: '100%' } : {}),
                  }}
                />
              </div>

              {/* Custom React Sort Dropdown */}
              <div
                ref={sortRef}
                style={{
                  position: 'relative',
                  width: isResponsive ? '100%' : 'auto',
                  zIndex: sortOpen ? 1000 : 'auto',
                }}
              >
                {/* Dropdown Trigger */}
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={sortOpen}
                  className="form-control shop-sort"
                  onMouseEnter={() => setSortHovered(true)}
                  onMouseLeave={() => setSortHovered(false)}
                  onFocus={() => setSortFocused(true)}
                  onBlur={() => {
                    // Keep focus styling while the dropdown is open
                    if (!sortOpen) {
                      setSortFocused(false);
                    }
                  }}
                  onClick={() => {
                    setSortOpen(prev => !prev);
                    setSortFocused(true);
                  }}
                  style={{
                    ...sortSelectStyle,
                    width: '100%',
                    textAlign: 'left',
                    border: `1px solid ${
                      sortFocused
                        ? 'var(--accent-primary)'
                        : sortHovered
                          ? 'var(--border-highlight)'
                          : 'var(--border-color)'
                    }`,
                  }}
                >
                  <span>{selectedSort}</span>

                  <ChevronDown
                    size={16}
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      right: '1rem',
                      top: '50%',
                      transform: `translateY(-50%) rotate(${sortOpen ? 180 : 0}deg)`,
                      color: 'var(--text-secondary)',
                      pointerEvents: 'none',
                      transition: 'transform 0.2s ease',
                    }}
                  />
                </button>

                {/* React-rendered Dropdown Menu */}
                {sortOpen && (
                  <div
                    role="listbox"
                    aria-label="Sort products"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 0.4rem)',
                      left: 0,
                      width: '100%',
                      minWidth: isResponsive ? '100%' : '180px',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--border-radius-sm)',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
                      overflow: 'hidden',
                      zIndex: 1001,
                    }}
                  >
                    {sortOptions.map(option => {
                      const isSelected = selectedSort === option;

                      return (
                        <div
                          key={option}
                          role="option"
                          aria-selected={isSelected}
                          onMouseDown={(event) => {
                            event.preventDefault();
                            setSelectedSort(option);
                            setSortOpen(false);
                            setSortFocused(false);
                          }}
                          style={{
                            padding: '0.8rem 1rem',
                            backgroundColor: isSelected
                              ? 'rgba(0, 240, 255, 0.12)'
                              : 'transparent',
                            color: isSelected
                              ? 'var(--accent-primary)'
                              : 'var(--text-primary)',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            transition: 'background-color 0.15s ease, color 0.15s ease',
                            borderBottom:
                              option !== sortOptions[sortOptions.length - 1]
                                ? '1px solid var(--border-color)'
                                : 'none',
                          }}
                          onMouseEnter={(event) => {
                            event.currentTarget.style.backgroundColor =
                              'rgba(0, 240, 255, 0.1)';
                            event.currentTarget.style.color =
                              'var(--accent-primary)';
                          }}
                          onMouseLeave={(event) => {
                            event.currentTarget.style.backgroundColor =
                              isSelected
                                ? 'rgba(0, 240, 255, 0.12)'
                                : 'transparent';
                            event.currentTarget.style.color =
                              isSelected
                                ? 'var(--accent-primary)'
                                : 'var(--text-primary)';
                          }}
                        >
                          {option}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="product-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
            {loading ? (
              <p>Loading products...</p>
            ) : products.length === 0 ? (
              <p>No products available yet.</p>
            ) : filteredProducts.length === 0 ? (
              <p>No products match the selected filters.</p>
            ) : (
              filteredProducts.map((product) => (
                <div className="product-card" key={product.id}>
                  <Link to={`/product/${product.id}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ position: 'relative', height: '200px', backgroundColor: 'rgba(0,0,0,0.3)', borderTopLeftRadius: '10px', borderTopRightRadius: '10px', overflow: 'hidden' }}>
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }} />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                          <ImageIcon size={48} color="var(--text-secondary)" />
                        </div>
                      )}
                      {product.stock <= 0 && (
                        <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--danger)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          Out of Stock
                        </div>
                      )}
                    </div>
                  </Link>

                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                      {product.category_name}
                    </div>

                    <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', lineHeight: '1.3' }}>{product.title}</h3>
                    </Link>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '1rem' }}>
                      <Star size={16} color="var(--warning)" fill="var(--warning)" />
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>--</span>
                    </div>

                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                        Rs. {parseFloat(product.price).toLocaleString('en-IN')}
                      </span>

                      {(!user || user.role === 'buyer') && (
                        <button
                          className="btn btn-outline"
                          style={{ padding: '0.4rem 0.8rem' }}
                          onClick={() => {
                            if (!user) alert("Please login first to add to cart!");
                            else addToCart(product.id, 1);
                          }}
                        >
                          Cart
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Shop;
