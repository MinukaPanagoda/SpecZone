import React, { useState } from 'react';
import { Cpu, Monitor, Zap, HardDrive, Shield, Fan, Box, Trash2 } from 'lucide-react';
import ProductSelectionModal from '../components/ProductSelectionModal';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const Builder = () => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  
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
      const cpuSocket = cpu.specs?.Socket || cpu.specs?.socket;
      const moboSocket = mobo.specs?.Socket || mobo.specs?.socket;
      if (cpuSocket && moboSocket && cpuSocket.toLowerCase() !== moboSocket.toLowerCase()) {
        warnings.push(`Socket Mismatch (${cpuSocket} vs ${moboSocket})`);
      }
    }
    
    if (ram && mobo) {
      const ramType = ram.specs?.['Memory Type'] || ram.specs?.['Type'] || ram.specs?.type;
      const moboMemType = mobo.specs?.['Memory Type'] || mobo.specs?.['Supported Memory'];
      if (ramType && moboMemType && !moboMemType.toLowerCase().includes(ramType.toLowerCase())) {
        warnings.push("RAM Type Mismatch");
      }
    }

    if (warnings.length > 0) return { status: 'Warning: ' + warnings.join(', '), color: 'var(--danger)' };
    if (Object.values(selectedParts).every(p => p !== null)) return { status: 'All Good!', color: 'var(--success)' };
    return { status: 'Pending components...', color: 'var(--warning)' };
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
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Compatibility</span>
              <span style={{ color: compStatus.color, fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'right', maxWidth: '60%' }}>{compStatus.status}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <span style={{ fontSize: '1.2rem' }}>Total</span>
              <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>Rs. {totalPrice.toLocaleString('en-IN')}</span>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', marginBottom: '1rem' }} 
              disabled={selectedCount === 0}
              onClick={handleAddBuildToCart}
            >
              Add Build to Cart
            </button>
            <button className="btn btn-outline" style={{ width: '100%', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }} disabled>Save Build (Coming Soon)</button>
          </div>
        </div>
      </div>

      <ProductSelectionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categoryName={activeSlot}
        onSelect={handleProductSelect}
      />
    </div>
  );
};

export default Builder;
