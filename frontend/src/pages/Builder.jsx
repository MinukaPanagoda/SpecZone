import React from 'react';
import { Cpu, Monitor, Zap, HardDrive, Shield, Fan, Box } from 'lucide-react';

const Builder = () => {
  const slots = [
    { name: 'Processor (CPU)', icon: <Cpu size={24} />, selected: null },
    { name: 'Motherboard', icon: <Shield size={24} />, selected: null },
    { name: 'Memory (RAM)', icon: <Zap size={24} />, selected: null },
    { name: 'Graphics Card (GPU)', icon: <Monitor size={24} />, selected: null },
    { name: 'Storage (SSD/HDD)', icon: <HardDrive size={24} />, selected: null },
    { name: 'Power Supply (PSU)', icon: <Fan size={24} />, selected: null },
    { name: 'Case', icon: <Box size={24} />, selected: null },
  ];

  return (
    <div className="container">
      <div style={{ textAlign: 'center', marginBottom: '3rem', paddingTop: '2rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Custom PC Builder</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Select compatible parts to build your ultimate rig.</p>
      </div>

      <div className="builder-layout">
        {/* Left Side: Slots */}
        <div>
          {slots.map((slot, index) => (
            <div className="builder-slot" key={index}>
              <div className="builder-slot-info">
                <div className="builder-slot-icon">
                  {slot.icon}
                </div>
                <div>
                  <h4 style={{ margin: '0 0 0.3rem 0', fontSize: '1.1rem' }}>{slot.name}</h4>
                  {slot.selected ? (
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Selected Item Name</p>
                  ) : (
                    <p style={{ margin: 0, color: 'var(--danger)', fontSize: '0.9rem' }}>Not Selected</p>
                  )}
                </div>
              </div>
              <button className="btn btn-outline">Choose</button>
            </div>
          ))}
        </div>

        {/* Right Side: Summary */}
        <div>
          <div className="glass-panel builder-summary" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>Build Summary</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Estimated Wattage</span>
              <span style={{ fontWeight: 'bold' }}>0 W</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Compatibility</span>
              <span style={{ color: 'var(--warning)', fontWeight: 'bold' }}>Checking...</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <span style={{ fontSize: '1.2rem' }}>Total</span>
              <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>Rs. 0</span>
            </div>

            <button className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }} disabled>Proceed to Checkout</button>
            <button className="btn btn-outline" style={{ width: '100%', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Save Build</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Builder;
