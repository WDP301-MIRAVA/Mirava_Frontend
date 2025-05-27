import React, { useState } from 'react';
import './SearchResult.css';
import Header from "../../components/Header/index";
import Footer from "../../components/Footer/index";

interface TreatmentResult {
  patientName: string;
  treatmentMethod: 'IUI' | 'IVF';
  startDate: string;
  status: 'Đang điều trị' | 'Hoàn tất' | 'Thất bại';
}

const SearchResult: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const [result, setResult] = useState<TreatmentResult | null>(null);
  const [showNotFound, setShowNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demonstration
  const mockResults: { [key: string]: TreatmentResult } = {
    'BN001': {
      patientName: 'Nguyễn Thị Hoa',
      treatmentMethod: 'IVF',
      startDate: '15/03/2024',
      status: 'Đang điều trị'
    },
    '0912345678': {
      patientName: 'Trần Văn Nam',
      treatmentMethod: 'IUI',
      startDate: '28/02/2024',
      status: 'Hoàn tất'
    },
    'BN002': {
      patientName: 'Lê Thị Mai',
      treatmentMethod: 'IVF',
      startDate: '10/01/2024',
      status: 'Thất bại'
    }
  };

  const handleSearch = async () => {
    if (!searchInput.trim()) return;

    setIsLoading(true);
    setResult(null);
    setShowNotFound(false);

    // Simulate API call delay
    setTimeout(() => {
      const foundResult = mockResults[searchInput.trim()];
      
      if (foundResult) {
        setResult(foundResult);
        setShowNotFound(false);
      } else {
        setResult(null);
        setShowNotFound(true);
      }
      
      setIsLoading(false);
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Đang điều trị':
        return 'status-ongoing';
      case 'Hoàn tất':
        return 'status-completed';
      case 'Thất bại':
        return 'status-failed';
      default:
        return '';
    }
  };

  return (
    <>
    <Header/>
    <div className="search-result-container">
        
      <div className="search-result-card">
        <h1 className="page-title">Tra cứu kết quả điều trị</h1>
        
        <div className="search-form">
          <div className="input-group">
            <label htmlFor="searchInput" className="input-label">
              Mã bệnh nhân hoặc Số điện thoại
            </label>
            <input
              id="searchInput"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập mã bệnh nhân hoặc số điện thoại"
              className="search-input"
              disabled={isLoading}
            />
          </div>
          
          <button
            onClick={handleSearch}
            disabled={isLoading || !searchInput.trim()}
            className="search-button"
          >
            {isLoading ? 'Đang tra cứu...' : 'Tra cứu kết quả'}
          </button>
        </div>

        {result && (
          <div className="result-card">
            <h2 className="result-title">Kết quả điều trị</h2>
            <div className="result-content">
              <div className="result-row">
                <span className="result-label">Họ tên bệnh nhân:</span>
                <span className="result-value">{result.patientName}</span>
              </div>
              <div className="result-row">
                <span className="result-label">Phương pháp điều trị:</span>
                <span className="result-value treatment-method">{result.treatmentMethod}</span>
              </div>
              <div className="result-row">
                <span className="result-label">Ngày bắt đầu:</span>
                <span className="result-value">{result.startDate}</span>
              </div>
              <div className="result-row">
                <span className="result-label">Trạng thái điều trị:</span>
                <span className={`result-value status ${getStatusClass(result.status)}`}>
                  {result.status}
                </span>
              </div>
            </div>
          </div>
        )}

        {showNotFound && (
          <div className="not-found-alert">
            <div className="alert-icon">ℹ️</div>
            <div className="alert-content">
              <p className="alert-title">Không tìm thấy kết quả</p>
              <p className="alert-description">
                Vui lòng kiểm tra lại mã bệnh nhân hoặc số điện thoại và thử lại.
              </p>
            </div>
          </div>
        )}

        <div className="demo-info">
          <p className="demo-title">Demo - Thử với:</p>
          <ul className="demo-list">
            <li>BN001 (Đang điều trị)</li>
            <li>0912345678 (Hoàn tất)</li>
            <li>BN002 (Thất bại)</li>
          </ul>
        </div>
      </div>
    </div>
    <Footer/>
    </>

  );
};

export default SearchResult;