import React, { useState, useEffect } from 'react';
import './ManagerDashboard.css';

interface StatCard {
  title: string;
  value: string;
  icon: string;
  trend?: string;
}

interface TreatmentData {
  month: string;
  treatments: number;
  successRate: number;
}

interface FilterState {
  searchTerm: string;
  dateFrom: string;
  dateTo: string;
  treatmentType: string;
}

const ManagerDashboard: React.ComponentType = () => {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    dateFrom: '',
    dateTo: '',
    treatmentType: 'all'
  });

  const [hoveredChart, setHoveredChart] = useState<string | null>(null);
  const [showEmptyAlert, setShowEmptyAlert] = useState(false);

  // Mock data
  const statsData: StatCard[] = [
    {
      title: 'Tổng số bệnh nhân',
      value: '1,247',
      icon: '👥',
      trend: '+12%'
    },
    {
      title: 'Tổng số điều trị',
      value: '2,156',
      icon: '🏥',
      trend: '+8%'
    },
    {
      title: 'Tỷ lệ thành công',
      value: '68.5%',
      icon: '📊',
      trend: '+5%'
    }
  ];

  const treatmentData: TreatmentData[] = [
    { month: 'T1', treatments: 180, successRate: 65 },
    { month: 'T2', treatments: 195, successRate: 68 },
    { month: 'T3', treatments: 210, successRate: 72 },
    { month: 'T4', treatments: 185, successRate: 69 },
    { month: 'T5', treatments: 220, successRate: 71 },
    { month: 'T6', treatments: 235, successRate: 74 }
  ];

  const successRateData = {
    successful: 68.5,
    unsuccessful: 31.5
  };

  const treatmentTypes = [
    { value: 'all', label: 'Tất cả loại điều trị' },
    { value: 'ivf', label: 'IVF (Thụ tinh ống nghiệm)' },
    { value: 'iui', label: 'IUI (Thụ tinh nhân tạo)' },
    { value: 'icsi', label: 'ICSI (Tiêm tinh trùng)' },
    { value: 'fet', label: 'FET (Chuyển phôi đông lạnh)' }
  ];

  useEffect(() => {
    // Simulate data filtering
    const hasData = filters.searchTerm !== 'empty' && 
                   !(filters.dateFrom && filters.dateTo && 
                     new Date(filters.dateFrom) > new Date(filters.dateTo));
    setShowEmptyAlert(!hasData && !!(filters.searchTerm || filters.dateFrom || filters.dateTo));
  }, [filters]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      searchTerm: '',
      dateFrom: '',
      dateTo: '',
      treatmentType: 'all'
    });
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Bảng điều khiển quản lý</h1>
        <p className="dashboard-subtitle">Thống kê dịch vụ và tỷ lệ thành công điều trị</p>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        {statsData.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <h3 className="stat-title">{stat.title}</h3>
              <div className="stat-value">{stat.value}</div>
              {stat.trend && (
                <div className="stat-trend">
                  <span className="trend-indicator">↗</span>
                  {stat.trend} so với tháng trước
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filters-card">
          <h3 className="filters-title">Bộ lọc và tìm kiếm</h3>
          <div className="filters-grid">
            <div className="filter-group">
              <label htmlFor="search">Tìm kiếm</label>
              <input
                id="search"
                type="text"
                placeholder="Mã bệnh nhân hoặc loại điều trị..."
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                className="filter-input"
              />
            </div>
            
            <div className="filter-group">
              <label htmlFor="dateFrom">Từ ngày</label>
              <input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="filter-input"
              />
            </div>
            
            <div className="filter-group">
              <label htmlFor="dateTo">Đến ngày</label>
              <input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="filter-input"
              />
            </div>
            
            <div className="filter-group">
              <label htmlFor="treatmentType">Loại điều trị</label>
              <select
                id="treatmentType"
                value={filters.treatmentType}
                onChange={(e) => handleFilterChange('treatmentType', e.target.value)}
                className="filter-select"
              >
                {treatmentTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <button onClick={resetFilters} className="reset-button">
            Đặt lại bộ lọc
          </button>
        </div>
      </div>

      {/* Empty Data Alert */}
      {showEmptyAlert && (
        <div className="empty-alert">
          <div className="alert-icon">ℹ️</div>
          <div className="alert-content">
            <h4>Không có dữ liệu</h4>
            <p>Không có dữ liệu cho lựa chọn của bạn. Vui lòng thử điều chỉnh bộ lọc.</p>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="charts-section">
        {/* Treatment Statistics Chart */}
        <div className="chart-card">
          <h3 className="chart-title">Thống kê điều trị theo tháng</h3>
          <div className="chart-container">
            <div className="bar-chart">
              {treatmentData.map((data, index) => (
                <div key={index} className="bar-group">
                  <div 
                    className="bar treatments-bar"
                    style={{ height: `${(data.treatments / 250) * 100}%` }}
                    onMouseEnter={() => setHoveredChart(`treatments-${index}`)}
                    onMouseLeave={() => setHoveredChart(null)}
                  >
                    {hoveredChart === `treatments-${index}` && (
                      <div className="tooltip">
                        {data.treatments} điều trị
                      </div>
                    )}
                  </div>
                  <div 
                    className="bar success-bar"
                    style={{ height: `${data.successRate}%` }}
                    onMouseEnter={() => setHoveredChart(`success-${index}`)}
                    onMouseLeave={() => setHoveredChart(null)}
                  >
                    {hoveredChart === `success-${index}` && (
                      <div className="tooltip">
                        {data.successRate}% thành công
                      </div>
                    )}
                  </div>
                  <span className="bar-label">{data.month}</span>
                </div>
              ))}
            </div>
            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-color treatments-color"></span>
                Số lượng điều trị
              </div>
              <div className="legend-item">
                <span className="legend-color success-color"></span>
                Tỷ lệ thành công (%)
              </div>
            </div>
          </div>
        </div>

        {/* Success Rate Pie Chart */}
        <div className="chart-card">
          <h3 className="chart-title">Tỷ lệ thành công điều trị</h3>
          <div className="pie-chart-container">
            <div className="pie-chart">
              <div 
                className="pie-slice successful"
                style={{
                  '--percentage': `${successRateData.successful}%`,
                  '--color': '#10B981'
                } as React.CSSProperties}
                onMouseEnter={() => setHoveredChart('pie-success')}
                onMouseLeave={() => setHoveredChart(null)}
              >
                {hoveredChart === 'pie-success' && (
                  <div className="pie-tooltip">
                    Thành công: {successRateData.successful}%
                  </div>
                )}
              </div>
              <div 
                className="pie-slice unsuccessful"
                style={{
                  '--percentage': `${successRateData.unsuccessful}%`,
                  '--color': '#EF4444'
                } as React.CSSProperties}
                onMouseEnter={() => setHoveredChart('pie-unsuccessful')}
                onMouseLeave={() => setHoveredChart(null)}
              >
                {hoveredChart === 'pie-unsuccessful' && (
                  <div className="pie-tooltip">
                    Không thành công: {successRateData.unsuccessful}%
                  </div>
                )}
              </div>
              <div className="pie-center">
                <div className="pie-center-text">
                  <span className="pie-percentage">{successRateData.successful}%</span>
                  <span className="pie-label">Thành công</span>
                </div>
              </div>
            </div>
            <div className="pie-legend">
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#10B981' }}></span>
                Điều trị thành công ({successRateData.successful}%)
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#EF4444' }}></span>
                Điều trị không thành công ({successRateData.unsuccessful}%)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Statistics Table */}
      <div className="table-section">
        <div className="table-card">
          <h3 className="table-title">Chi tiết thống kê điều trị</h3>
          <div className="table-container">
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Tháng</th>
                  <th>Số lượng điều trị</th>
                  <th>Thành công</th>
                  <th>Không thành công</th>
                  <th>Tỷ lệ thành công</th>
                </tr>
              </thead>
              <tbody>
                {treatmentData.map((data, index) => {
                  const successful = Math.round(data.treatments * data.successRate / 100);
                  const unsuccessful = data.treatments - successful;
                  return (
                    <tr key={index} className="table-row">
                      <td className="month-cell">{data.month}/2024</td>
                      <td className="number-cell">{data.treatments}</td>
                      <td className="success-cell">{successful}</td>
                      <td className="unsuccessful-cell">{unsuccessful}</td>
                      <td className="percentage-cell">
                        <div className="percentage-bar">
                          <div 
                            className="percentage-fill"
                            style={{ width: `${data.successRate}%` }}
                          ></div>
                          <span className="percentage-text">{data.successRate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;