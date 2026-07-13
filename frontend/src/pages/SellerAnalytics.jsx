import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import SellerSidebar from '../components/SellerSidebar';
import { BarChart2, TrendingUp, Package, Award } from 'lucide-react';

const SellerAnalytics = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState({
    total_revenue: 0,
    revenue_this_month: 0,
    total_items_sold: 0,
    monthly_data: [],
    top_products: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'seller') {
      navigate('/login');
      return;
    }

    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`http://localhost/Spec%20Zone/backend/api/seller_analytics.php?seller_id=${user.id}`);
        const data = await res.json();
        if (!data.message) {
          setAnalytics(data);
        }
      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user, navigate]);

  // Find max revenue for scaling the bar chart
  const maxRevenue = analytics.monthly_data.length > 0 
    ? Math.max(...analytics.monthly_data.map(d => d.revenue)) 
    : 0;

  return (
    <div className="dashboard-layout" style={{ minHeight: '100vh' }}>
      <SellerSidebar />
      <main className="dashboard-content">
        <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Sales Analytics</h2>
        
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>Loading analytics...</div>
        ) : (
          <>
            {/* Top Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
              <div className="glass-panel stat-card" style={{ borderTop: '4px solid var(--accent-primary)' }}>
                <div className="stat-icon"><BarChart2 size={24} color="var(--accent-primary)" /></div>
                <div className="stat-info">
                  <h3 style={{ fontSize: '1.8rem' }}>Rs. {analytics.total_revenue.toLocaleString('en-IN')}</h3>
                  <p style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem' }}>Total Revenue</p>
                </div>
              </div>
              <div className="glass-panel stat-card" style={{ borderTop: '4px solid var(--success)' }}>
                <div className="stat-icon"><TrendingUp size={24} color="var(--success)" /></div>
                <div className="stat-info">
                  <h3 style={{ fontSize: '1.8rem' }}>Rs. {analytics.revenue_this_month.toLocaleString('en-IN')}</h3>
                  <p style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem' }}>Revenue This Month</p>
                </div>
              </div>
              <div className="glass-panel stat-card" style={{ borderTop: '4px solid var(--warning)' }}>
                <div className="stat-icon"><Package size={24} color="var(--warning)" /></div>
                <div className="stat-info">
                  <h3 style={{ fontSize: '1.8rem' }}>{analytics.total_items_sold}</h3>
                  <p style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem' }}>Items Sold</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'start' }}>
              
              {/* Bar Chart Section */}
              <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={20} color="var(--accent-primary)" /> Revenue Trend (Last 6 Months)
                </h3>
                
                {analytics.monthly_data.length === 0 ? (
                  <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No sales data available yet.
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '300px', paddingBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
                    {analytics.monthly_data.map((data, index) => {
                      // Calculate height percentage (min 5% to show at least a small bar if revenue > 0)
                      const heightPercent = maxRevenue > 0 ? Math.max((data.revenue / maxRevenue) * 100, data.revenue > 0 ? 5 : 0) : 0;
                      
                      return (
                        <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', position: 'relative' }}>
                          
                          {/* Tooltip on hover */}
                          <div className="chart-tooltip" style={{ opacity: 0, position: 'absolute', top: `calc(${100 - heightPercent}% - 30px)`, background: 'var(--bg-dark)', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap', pointerEvents: 'none', transition: 'opacity 0.2s', zIndex: 10 }}>
                            Rs. {data.revenue.toLocaleString('en-IN')}
                          </div>
                          
                          {/* The Bar */}
                          <div 
                            style={{ 
                              width: '100%', 
                              maxWidth: '60px', 
                              height: `${heightPercent}%`, 
                              background: 'linear-gradient(to top, var(--accent-secondary), var(--accent-primary))',
                              borderRadius: '4px 4px 0 0',
                              transition: 'height 1s ease-out',
                              cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.currentTarget.previousSibling.style.opacity = 1}
                            onMouseLeave={(e) => e.currentTarget.previousSibling.style.opacity = 0}
                          ></div>
                          
                          {/* X-Axis Label */}
                          <span style={{ position: 'absolute', bottom: '-25px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {data.month}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Top Products Section */}
              <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award size={20} color="var(--warning)" /> Top Selling Products
                </h3>
                
                {analytics.top_products.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0' }}>
                    No products sold yet.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {analytics.top_products.map((prod, index) => (
                      <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: index === 0 ? 'var(--warning)' : index === 1 ? '#e2e8f0' : index === 2 ? '#b45309' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', color: index < 3 ? '#000' : '#fff' }}>
                            {index + 1}
                          </div>
                          <span style={{ fontWeight: 'bold' }}>{prod.name}</span>
                        </div>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                          {prod.sold} sold
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default SellerAnalytics;
