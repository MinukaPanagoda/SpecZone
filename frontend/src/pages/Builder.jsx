import React, { useState, useEffect } from 'react';
import { Cpu, Monitor, Zap, HardDrive, Shield, Fan, Box, Trash2, BookmarkPlus, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import ProductSelectionModal from '../components/ProductSelectionModal';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Builder = () => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [selectedParts, setSelectedParts] = useState({
    'Processors (CPU)': null,
    'Motherboards': null,
    'Memory (RAM)': null,
    'Graphics Cards (GPU)': null,
    'Storage (SSD/HDD)': null,
    'Power Supplies (PSU)': null,
    'Cases': null
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState('');
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [buildName, setBuildName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveStatusModal, setSaveStatusModal] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  // Support preloading build when loaded from Buyer Dashboard
  useEffect(() => {
    if (location.state?.loadBuildParts) {
      setSelectedParts(location.state.loadBuildParts);
    }
  }, [location.state]);

  const slots = [
    { id: 'Processors (CPU)', name: 'Processor (CPU)', icon: <Cpu size={24} /> },
    { id: 'Motherboards', name: 'Motherboard', icon: <Shield size={24} /> },
    { id: 'Memory (RAM)', name: 'Memory (RAM)', icon: <Zap size={24} /> },
    { id: 'Graphics Cards (GPU)', name: 'Graphics Card (GPU)', icon: <Monitor size={24} /> },
    { id: 'Storage (SSD/HDD)', name: 'Storage (SSD/HDD)', icon: <HardDrive size={24} /> },
    { id: 'Power Supplies (PSU)', name: 'Power Supply (PSU)', icon: <Fan size={24} /> },
    { id: 'Cases', name: 'Case', icon: <Box size={24} /> },
  ];

  const handleSelectClick = (slotId) => {
    setActiveSlot(slotId);
    setIsModalOpen(true);
  };

  const handleProductSelect = (product) => {
    setSelectedParts({ ...selectedParts, [activeSlot]: product });
    setIsModalOpen(false);
  };

  const handleRemovePart = (slotId) => {
    setSelectedParts({ ...selectedParts, [slotId]: null });
  };

  const totalPrice = Object.values(selectedParts).reduce((acc, part) => {
    if (part && part.price) return acc + parseFloat(part.price);
    return acc;
  }, 0);

  const calculateWattage = () => {
    let base = 50; 
    if (selectedParts['Processors (CPU)']) base += 85; 
    if (selectedParts['Graphics Cards (GPU)']) base += 250; 
    return base;
  };

  const checkCompatibility = () => {
    const cpu = selectedParts['Processors (CPU)'];
    const mobo = selectedParts['Motherboards'];
    const ram = selectedParts['Memory (RAM)'];
    
    let warnings = [];
    
    if (cpu && mobo) {
      const cpuSocket = cpu.specs?.Socket || cpu.specs?.socket || cpu.specs?.['CPU Socket'];
      const moboSocket = mobo.specs?.Socket || mobo.specs?.socket || mobo.specs?.['CPU Socket'];
      if (cpuSocket && moboSocket && cpuSocket.trim().toLowerCase() !== moboSocket.trim().toLowerCase()) {
        warnings.push(`Socket Mismatch (${cpuSocket} vs ${moboSocket})`);
      }
    }
    
    if (ram && mobo) {
      const ramType = ram.specs?.['Memory Type'] || ram.specs?.['Type'] || ram.specs?.type || ram.specs?.['RAM Type'];
      const moboMemType = mobo.specs?.['Memory Type'] || mobo.specs?.['Supported Memory'] || mobo.specs?.['Memory Slots'] || mobo.specs?.type;
      if (ramType && moboMemType && !moboMemType.toLowerCase().includes(ramType.toLowerCase())) {
        warnings.push(`RAM Type Mismatch (${ramType} vs ${moboMemType})`);
      }
    }

    if (warnings.length > 0) {
      return { 
        isValid: false, 
        status: warnings.join(', '), 
        color: 'var(--danger)',
        warnings
      };
    }

    if (Object.values(selectedParts).every(p => p !== null)) {
      return { 
        isValid: true, 
        status: 'All Good! 100% Compatible', 
        color: 'var(--success)',
        warnings: []
      };
    }

    return { 
      isValid: true, 
      status: 'Pending components...', 
      color: 'var(--warning)',
      warnings: []
    };
  };

  const compStatus = checkCompatibility();
  const selectedCount = Object.values(selectedParts).filter(p => p !== null).length;

  const handleAddBuildToCart = async () => {
    let success = true;
    for (const part of Object.values(selectedParts)) {
      if (part) {
        const added = await addToCart(part.id, 1);
        if(!added) success = false;
      }
    }
    if (success) {
      navigate('/cart');
    }
  };

  const handleOpenSaveModal = () => {
    if (!user || user.role !== 'buyer') {
      setSaveStatusModal({
        isOpen: true,
        type: 'error',
        title: 'Authentication Required',
        message: 'Please log in as a buyer to save your custom PC configurations.'
      });
      return;
    }

    if (selectedCount === 0) {
      setSaveStatusModal({
        isOpen: true,
        type: 'error',
        title: 'No Parts Selected',
        message: 'Please select at least one component before saving your build.'
      });
      return;
    }

    if (!compStatus.isValid) {
      setSaveStatusModal({
        isOpen: true,
        type: 'error',
        title: 'Incompatible Configuration',
        message: `Cannot save build with compatibility conflicts: ${compStatus.status}. Please select compatible parts first.`
      });
      return;
    }

    setBuildName(`Custom Rig - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`);
    setSaveModalOpen(true);
  };

  const handleConfirmSaveBuild = async (e) => {
    e.preventDefault();
    if (!buildName.trim()) return;

    if (!compStatus.isValid) {
      setSaveStatusModal({
        isOpen: true,
        type: 'error',
        title: 'Incompatible Configuration',
        message: `Cannot save build with compatibility conflicts: ${compStatus.status}. Please fix the conflicting parts.`
      });
      return;
    }

    setSaving(true);
    const product_ids = Object.values(selectedParts).filter(p => p !== null).map(p => p.id);

    try {
      const res = await fetch('http://localhost/SpecZone/backend/api/builds.php?action=create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyer_id: user.id,
          build_name: buildName.trim(),
          product_ids: product_ids
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSaveModalOpen(false);
        setSaveStatusModal({
          isOpen: true,
          type: 'success',
          title: 'Build Saved Successfully!',
          message: `"${buildName.trim()}" has been saved to your account. You can view, load, or order it anytime.`
        });
      } else {
        setSaveStatusModal({
          isOpen: true,
          type: 'error',
          title: 'Save Failed',
          message: data.message || 'Unable to save PC build configuration.'
        });
      }
    } catch {
      setSaveStatusModal({
        isOpen: true,
        type: 'error',
        title: 'Connection Error',
        message: 'An error occurred while connecting to the server. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container">
      <div style={{ textAlign: 'center', marginBottom: '3rem', paddingTop: '2rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Custom PC Builder</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Select compatible parts to build your ultimate rig.</p>
      </div>

      <div className="builder-layout">
        {/* Left Side: Slots */}
        <div>
          {slots.map((slot) => {
            const part = selectedParts[slot.id];
            return (
              <div className="builder-slot" key={slot.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="builder-slot-info" style={{ flex: 1, display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div className="builder-slot-icon">
                    {slot.icon}
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 0.3rem 0', fontSize: '1.1rem' }}>{slot.name}</h4>
                    {part ? (
                      <div>
                        <p style={{ margin: 0, color: 'var(--accent-primary)', fontWeight: 'bold' }}>{part.title || part.name}</p>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Rs. {parseFloat(part.price).toLocaleString('en-IN')}</p>
                      </div>
                    ) : (
                      <p style={{ margin: 0, color: 'var(--danger)', fontSize: '0.9rem' }}>Not Selected</p>
                    )}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {part && (
                    <button 
                      className="btn btn-outline" 
                      style={{ padding: '0.5rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}
                      onClick={() => handleRemovePart(slot.id)}
                      title="Remove part"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  <button className="btn btn-outline" onClick={() => handleSelectClick(slot.id)}>
                    {part ? 'Change' : 'Choose'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Summary */}
        <div>
          <div className="glass-panel builder-summary" style={{ padding: '2rem', position: 'sticky', top: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>Build Summary</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Estimated Wattage</span>
              <span style={{ fontWeight: 'bold' }}>{calculateWattage()} W</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Compatibility</span>
              <span style={{ color: compStatus.color, fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'right', maxWidth: '60%' }}>{compStatus.status}</span>
            </div>

            {/* Incompatibility Alert Box */}
            {!compStatus.isValid && (
              <div style={{
                background: 'rgba(255, 51, 102, 0.12)',
                border: '1px solid rgba(255, 51, 102, 0.35)',
                borderRadius: '8px',
                padding: '0.8rem',
                marginBottom: '1.5rem',
                fontSize: '0.85rem',
                color: '#ff6b8b',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                lineHeight: '1.4'
              }}>
                <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--danger)' }} />
                <div>
                  <strong>Compatibility Issue:</strong>
                  <div style={{ marginTop: '0.2rem', color: '#ffccd5' }}>{compStatus.status}</div>
                  <div style={{ marginTop: '0.3rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Save Build is locked until conflicting parts are resolved.
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <span style={{ fontSize: '1.2rem' }}>Total</span>
              <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>Rs. {totalPrice.toLocaleString('en-IN')}</span>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', marginBottom: '0.8rem' }} 
              disabled={selectedCount === 0}
              onClick={handleAddBuildToCart}
            >
              Add Build to Cart
            </button>
            <button 
              className="btn btn-outline" 
              style={{ 
                width: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.5rem',
                opacity: (selectedCount === 0 || !compStatus.isValid) ? 0.55 : 1,
                cursor: (selectedCount === 0 || !compStatus.isValid) ? 'not-allowed' : 'pointer'
              }} 
              disabled={selectedCount === 0 || !compStatus.isValid}
              onClick={handleOpenSaveModal}
              title={!compStatus.isValid ? "Resolve compatibility issues to save your build" : "Save this build"}
            >
              <BookmarkPlus size={18} /> Save Build
            </button>
          </div>
        </div>
      </div>

      <ProductSelectionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categoryName={activeSlot}
        onSelect={handleProductSelect}
      />

      {/* Name Custom Build Modal */}
      {saveModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1500,
            padding: '1rem',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => setSaveModalOpen(false)}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '450px',
              padding: '2rem',
              borderRadius: '16px',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              background: 'linear-gradient(145deg, rgba(18, 22, 34, 0.98), rgba(10, 14, 22, 0.98))',
              position: 'relative',
              animation: 'popupScaleIn 0.25s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)' }}>
                <BookmarkPlus size={20} /> Save PC Build
              </h3>
              <button
                type="button"
                onClick={() => setSaveModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.2rem' }}>
              Give your configuration a name so you can load or order it anytime from your dashboard.
            </p>

            <form onSubmit={handleConfirmSaveBuild}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Build Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Dream Gaming Rig 2026"
                  value={buildName}
                  onChange={(e) => setBuildName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.8rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', color: 'var(--text-secondary)' }}>
                  <span>Selected Components:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{selectedCount} parts</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Estimated Total:</span>
                  <strong style={{ color: 'var(--accent-primary)' }}>Rs. {totalPrice.toLocaleString('en-IN')}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setSaveModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving || !buildName.trim()}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  {saving ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feedback Popup Modal */}
      {saveStatusModal.isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.78)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '1.2rem',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => setSaveStatusModal(prev => ({ ...prev, isOpen: false }))}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '420px',
              padding: '2.2rem 1.8rem',
              borderRadius: '16px',
              border: `1px solid ${saveStatusModal.type === 'success' ? 'rgba(0, 230, 118, 0.35)' : 'rgba(255, 51, 102, 0.4)'}`,
              boxShadow: `0 0 35px ${saveStatusModal.type === 'success' ? 'rgba(0, 230, 118, 0.2)' : 'rgba(255, 51, 102, 0.2)'}`,
              background: 'linear-gradient(145deg, rgba(18, 22, 34, 0.98), rgba(10, 14, 22, 0.98))',
              textAlign: 'center',
              position: 'relative',
              animation: 'popupScaleIn 0.25s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: saveStatusModal.type === 'success' ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 51, 102, 0.15)',
                border: `2px solid ${saveStatusModal.type === 'success' ? 'var(--success)' : 'var(--danger)'}`,
                color: saveStatusModal.type === 'success' ? 'var(--success)' : 'var(--danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.2rem',
                boxShadow: `0 0 25px ${saveStatusModal.type === 'success' ? 'rgba(0, 230, 118, 0.3)' : 'rgba(255, 51, 102, 0.3)'}`
              }}
            >
              {saveStatusModal.type === 'success' ? (
                <CheckCircle2 size={36} />
              ) : (
                <AlertTriangle size={36} />
              )}
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', color: '#ffffff' }}>
              {saveStatusModal.title}
            </h3>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.5', margin: '0 0 1.5rem 0' }}>
              {saveStatusModal.message}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {saveStatusModal.type === 'success' && (
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem' }}
                  onClick={() => navigate('/buyer/dashboard', { state: { tab: 'builds' } })}
                >
                  View My Saved Builds
                </button>
              )}
              <button
                type="button"
                className="btn btn-outline"
                style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem' }}
                onClick={() => setSaveStatusModal(prev => ({ ...prev, isOpen: false }))}
              >
                {saveStatusModal.type === 'success' ? 'Keep Building' : 'Dismiss'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Builder;
