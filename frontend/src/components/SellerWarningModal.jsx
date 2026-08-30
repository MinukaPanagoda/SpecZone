import React from 'react';
import { AlertTriangle, Star, X, Check, ShieldAlert } from 'lucide-react';

const SellerWarningModal = ({ isOpen, onClose, onConfirm, product, currentRating }) => {
  if (!isOpen || !product) return null;

  const ratingVal = currentRating !== undefined 
    ? parseFloat(currentRating) 
    : parseFloat(product.avg_rating || product.seller_avg_rating || 0);

  const displayRating = ratingVal > 0 ? `${ratingVal}/10` : 'Below 5/10 Rating';
  const warningCount = parseInt(product.seller_warning_count || 0);
  const complaintCount = parseInt(product.seller_complaint_count || 0);
  const sellerName = product.shop_name ? `${product.shop_name} (${product.seller_name})` : (product.seller_name || 'Seller');

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1200,
        padding: '1.2rem',
        overflowY: 'auto',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '520px',
          maxHeight: 'calc(100vh - 2.5rem)',
          overflowY: 'auto',
          padding: '2.2rem',
          borderRadius: '14px',
          border: '1px solid rgba(255, 180, 0, 0.45)',
          boxShadow: '0 0 40px rgba(255, 180, 0, 0.22)',
          background: 'linear-gradient(145deg, rgba(25, 20, 15, 0.96), rgba(15, 15, 20, 0.98))',
          position: 'relative',
          margin: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.2rem',
            right: '1.2rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '0.4rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Close"
        >
          <X size={20} />
        </button>

        {/* Warning Icon & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '1.4rem' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'rgba(255, 180, 0, 0.15)',
              border: '2px solid var(--warning)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--warning)',
              flexShrink: 0
            }}
          >
            <AlertTriangle size={28} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#ffb400' }}>Seller Notice & Advisory</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Low Rating & Customer Satisfaction Alert</span>
          </div>
        </div>

        {/* Seller Info Card */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.45)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '1.1rem 1.3rem',
            borderRadius: '8px',
            marginBottom: '1.3rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Merchant / Store</span>
            <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{sellerName}</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Rating Status</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  background: 'rgba(255, 51, 102, 0.18)',
                  color: 'var(--danger)',
                  border: '1px solid rgba(255, 51, 102, 0.3)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  fontSize: '0.85rem'
                }}
              >
                <Star size={13} fill="currentColor" /> {displayRating} (Low Rating)
              </span>
            </div>
          </div>

          {(warningCount > 0 || complaintCount > 0) && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Dispute / Notice Record</span>
              <span style={{ color: 'var(--danger)', fontSize: '0.8rem', fontWeight: 'bold' }}>
                {warningCount > 0 ? `${warningCount} Official Warning(s)` : `${complaintCount} Active Dispute(s)`}
              </span>
            </div>
          )}
        </div>

        {/* Warning Message Description */}
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0 0 1.6rem 0' }}>
          This seller currently holds an average customer rating below <strong>5/10</strong> or active dispute notices. Please verify the component details and return terms carefully. All transactions are protected under SpecZone Buyer Protection.
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-outline"
            style={{ flex: 1, minWidth: '130px', padding: '0.75rem' }}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn"
            style={{
              flex: 1.4,
              minWidth: '180px',
              padding: '0.75rem',
              background: '#ffb400',
              color: '#000',
              fontWeight: 'bold',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              cursor: 'pointer'
            }}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            <Check size={16} /> I Understand, Proceed
          </button>
        </div>

      </div>
    </div>
  );
};

export default SellerWarningModal;
