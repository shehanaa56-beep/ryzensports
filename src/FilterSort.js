import React, { useState } from 'react';
import './FilterSort.css';

function FilterSort({ onClose, onApply, itemCount = 0 }) {
  const [sortExpanded, setSortExpanded] = useState(true);
  const [selectedSort, setSelectedSort] = useState('');
  const [appliedFilters, setAppliedFilters] = useState([]);

  const toggleSort = () => {
    setSortExpanded(!sortExpanded);
  };

  const clearFilters = (e) => {
    e.preventDefault();
    setAppliedFilters([]);
    setSelectedSort('');
  };

  const removeFilter = (filter) => {
    setAppliedFilters(appliedFilters.filter(f => f !== filter));
  };

  const closePanel = () => {
    onClose();
  };

  const applyFilters = () => {
    onApply(selectedSort, appliedFilters);
    onClose();
  };

  const handleSortChange = (value) => {
    setSelectedSort(value);
  };

  return (
    <div className="filter-sort-container open">
      <div className="container">
        <header className="header">
          <h1>FILTER & SORT</h1>
          <div className="header-right">
            <a href="#" className="clear-all" onClick={clearFilters}>Clear all</a>
            <span className="close-btn" onClick={closePanel}>×</span>
          </div>
        </header>

        <section className="applied-filters">
          <h2>Applied filters</h2>
          {appliedFilters.map(filter => (
            <div key={filter} className="filter-tag" onClick={() => removeFilter(filter)}>
              {filter}
            </div>
          ))}
        </section>

        <section className="sort-section">
          <div className="sort-header" onClick={toggleSort}>
            <h2>Sort by</h2>
            <span className={`chevron ${sortExpanded ? 'expanded' : ''}`}>⌃</span>
          </div>
          {sortExpanded && (
            <div className="sort-options">
              {[
                { id: 'price-low', value: 'price-low', label: 'Price (low - high)' },
                { id: 'newest', value: 'newest', label: 'Newest' },
                { id: 'top-sellers', value: 'top-sellers', label: 'Top Sellers' },
                { id: 'price-high', value: 'price-high', label: 'Price (high - low)' }
              ].map(option => (
                <div key={option.id} className="sort-option" onClick={() => handleSortChange(option.value)}>
                  <input
                    type="radio"
                    name="sort"
                    id={option.id}
                    value={option.value}
                    checked={selectedSort === option.value}
                    onChange={() => handleSortChange(option.value)}
                  />
                  <label htmlFor={option.id}>
                    <div className="radio-btn"></div>
                  </label>
                  <label htmlFor={option.id}>{option.label}</label>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="items-count">{itemCount} items found</div>

        <button className="apply-btn" onClick={applyFilters}>Apply</button>
      </div>
    </div>
  );
}

export default FilterSort;
