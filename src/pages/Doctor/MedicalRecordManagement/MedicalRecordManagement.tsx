import React, { useState, useEffect } from "react";
import "./MedicalRecordManagement.css";

interface MedicalRecord {
  id: string;
  patientName: string;
  patientId: string;
  phoneNumber: string;
  treatmentType: string;
  treatmentDate: string;
  status: "Completed" | "In Progress" | "Scheduled" | "Cancelled";
  diagnosis: string;
  treatmentPlan: string;
  medications: string;
  notes: string;
}

const MedicalRecordManagement: React.FC = () => {
  const [searchPatientId, setSearchPatientId] = useState("");
  const [searchPhoneNumber, setSearchPhoneNumber] = useState("");
  const [searchDateFrom, setSearchDateFrom] = useState("");
  const [searchDateTo, setSearchDateTo] = useState("");
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Sample data for demonstration
  useEffect(() => {
    const sampleRecords: MedicalRecord[] = [
      {
        id: "1",
        patientName: "Nguyễn Thị Lan",
        patientId: "BN001",
        phoneNumber: "0901234567",
        treatmentType: "IVF",
        treatmentDate: "2024-06-15",
        status: "Completed",
        diagnosis: "Vô sinh nguyên phát",
        treatmentPlan: "Thụ tinh trong ống nghiệm - chu kỳ đầu tiên",
        medications: "Gonal-F, Cetrotide, Duphaston",
        notes: "Bệnh nhân phản ứng tốt với thuốc kích thích rụng trứng",
      },
      {
        id: "2",
        patientName: "Trần Thị Hoa",
        patientId: "BN002",
        phoneNumber: "0912345678",
        treatmentType: "IUI",
        treatmentDate: "2024-06-20",
        status: "In Progress",
        diagnosis: "Vô sinh thứ phát",
        treatmentPlan: "Thụ tinh nhân tạo trong tử cung",
        medications: "Clomid, HCG",
        notes: "Theo dõi phát triển nang trứng",
      },
      {
        id: "3",
        patientName: "Lê Thị Mai",
        patientId: "BN003",
        phoneNumber: "0923456789",
        treatmentType: "Tư vấn",
        treatmentDate: "2024-06-25",
        status: "Scheduled",
        diagnosis: "Khám sức khỏe sinh sản",
        treatmentPlan: "Tư vấn và xét nghiệm cơ bản",
        medications: "Acid folic",
        notes: "Lần đầu đến khám",
      },
    ];
    setRecords(sampleRecords);
  }, []);

  const handleSearch = () => {
    let filtered = records;

    if (searchPatientId) {
      filtered = filtered.filter((record) =>
        record.patientId.toLowerCase().includes(searchPatientId.toLowerCase())
      );
    }

    if (searchPhoneNumber) {
      filtered = filtered.filter((record) =>
        record.phoneNumber.includes(searchPhoneNumber)
      );
    }

    if (searchDateFrom) {
      filtered = filtered.filter(
        (record) => new Date(record.treatmentDate) >= new Date(searchDateFrom)
      );
    }

    if (searchDateTo) {
      filtered = filtered.filter(
        (record) => new Date(record.treatmentDate) <= new Date(searchDateTo)
      );
    }

    setFilteredRecords(filtered);
    setShowResults(true);
    setSelectedRecord(null);
  };

  const handleViewDetails = (record: MedicalRecord) => {
    setSelectedRecord({ ...record });
    setIsEditing(false);
    setIsAdding(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (selectedRecord) {
      if (isAdding) {
        const newRecord = { ...selectedRecord, id: Date.now().toString() };
        setRecords([...records, newRecord]);
        setFilteredRecords([...filteredRecords, newRecord]);
      } else {
        const updatedRecords = records.map((record) =>
          record.id === selectedRecord.id ? selectedRecord : record
        );
        setRecords(updatedRecords);
        const updatedFiltered = filteredRecords.map((record) =>
          record.id === selectedRecord.id ? selectedRecord : record
        );
        setFilteredRecords(updatedFiltered);
      }
      setIsEditing(false);
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsAdding(false);
    if (isAdding) {
      setSelectedRecord(null);
    }
  };

  const handleDelete = () => {
    if (
      selectedRecord &&
      window.confirm("Bạn có chắc chắn muốn xóa hồ sơ này?")
    ) {
      const updatedRecords = records.filter(
        (record) => record.id !== selectedRecord.id
      );
      setRecords(updatedRecords);
      const updatedFiltered = filteredRecords.filter(
        (record) => record.id !== selectedRecord.id
      );
      setFilteredRecords(updatedFiltered);
      setSelectedRecord(null);
    }
  };

  const handleAddNew = () => {
    const newRecord: MedicalRecord = {
      id: "",
      patientName: "",
      patientId: "",
      phoneNumber: "",
      treatmentType: "",
      treatmentDate: "",
      status: "Scheduled",
      diagnosis: "",
      treatmentPlan: "",
      medications: "",
      notes: "",
    };
    setSelectedRecord(newRecord);
    setIsAdding(true);
    setIsEditing(true);
  };

  const handleInputChange = (field: keyof MedicalRecord, value: string) => {
    if (selectedRecord) {
      setSelectedRecord({ ...selectedRecord, [field]: value });
    }
  };

  return (
    <div className="medical-container">
      <div className="medical-card">
        <div className="medical-header">
          <h1 className="medical-title">Quản lý Hồ sơ Bệnh án</h1>
          <p className="medical-subtitle">
            Hệ thống quản lý hồ sơ bệnh án phòng khám hiếm muộn
          </p>
        </div>

        {/* Search Section */}
        <div className="search-section">
          <h2 className="section-title">Tìm kiếm Hồ sơ</h2>
          <div className="search-form">
            <div className="search-row">
              <div className="input-group">
                <label htmlFor="patientId">Mã bệnh nhân</label>
                <input
                  id="patientId"
                  type="text"
                  placeholder="Nhập mã bệnh nhân"
                  value={searchPatientId}
                  onChange={(e) => setSearchPatientId(e.target.value)}
                  className="search-input"
                />
              </div>
              <div className="input-group">
                <label htmlFor="phoneNumber">Số điện thoại</label>
                <input
                  id="phoneNumber"
                  type="text"
                  placeholder="Nhập số điện thoại"
                  value={searchPhoneNumber}
                  onChange={(e) => setSearchPhoneNumber(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
            <div className="search-row">
              <div className="input-group">
                <label htmlFor="dateFrom">Từ ngày</label>
                <input
                  id="dateFrom"
                  type="date"
                  value={searchDateFrom}
                  onChange={(e) => setSearchDateFrom(e.target.value)}
                  className="search-input"
                />
              </div>
              <div className="input-group">
                <label htmlFor="dateTo">Đến ngày</label>
                <input
                  id="dateTo"
                  type="date"
                  value={searchDateTo}
                  onChange={(e) => setSearchDateTo(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
            <div className="search-actions">
              <button onClick={handleSearch} className="search-button">
                Tra cứu hồ sơ bệnh án
              </button>
              <button onClick={handleAddNew} className="add-button">
                Thêm hồ sơ mới
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {showResults && (
          <div className="results-section">
            <h2 className="section-title">Kết quả tìm kiếm</h2>
            {filteredRecords.length === 0 ? (
              <div className="no-results">
                <p>Không tìm thấy hồ sơ bệnh án</p>
              </div>
            ) : (
              <div className="records-grid">
                {filteredRecords.map((record) => (
                  <div key={record.id} className="record-card">
                    <div className="record-header">
                      <h3 className="patient-name">{record.patientName}</h3>
                      <span
                        className={`status-badge status-${record.status
                          .toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        {record.status === "Completed"
                          ? "Hoàn thành"
                          : record.status === "In Progress"
                          ? "Đang điều trị"
                          : record.status === "Scheduled"
                          ? "Đã lên lịch"
                          : "Đã hủy"}
                      </span>
                    </div>
                    <div className="record-info">
                      <p>
                        <strong>Mã BN:</strong> {record.patientId}
                      </p>
                      <p>
                        <strong>Loại điều trị:</strong> {record.treatmentType}
                      </p>
                      <p>
                        <strong>Ngày điều trị:</strong>{" "}
                        {new Date(record.treatmentDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => handleViewDetails(record)}
                      className="view-details-button"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Detail View */}
        {selectedRecord && (
          <div className="detail-section">
            <div className="detail-header">
              <h2 className="section-title">
                {isAdding ? "Thêm hồ sơ mới" : "Chi tiết hồ sơ bệnh án"}
              </h2>
              {!isEditing && !isAdding && (
                <div className="detail-actions">
                  <button onClick={handleEdit} className="edit-button">
                    Chỉnh sửa
                  </button>
                  <button onClick={handleDelete} className="delete-button">
                    Xóa
                  </button>
                </div>
              )}
            </div>

            <div className="detail-form">
              <div className="form-row">
                <div className="input-group">
                  <label>Tên bệnh nhân</label>
                  <input
                    type="text"
                    value={selectedRecord.patientName}
                    onChange={(e) =>
                      handleInputChange("patientName", e.target.value)
                    }
                    disabled={!isEditing}
                    className="detail-input"
                  />
                </div>
                <div className="input-group">
                  <label>Mã bệnh nhân</label>
                  <input
                    type="text"
                    value={selectedRecord.patientId}
                    onChange={(e) =>
                      handleInputChange("patientId", e.target.value)
                    }
                    disabled={!isEditing}
                    className="detail-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Số điện thoại</label>
                  <input
                    type="text"
                    value={selectedRecord.phoneNumber}
                    onChange={(e) =>
                      handleInputChange("phoneNumber", e.target.value)
                    }
                    disabled={!isEditing}
                    className="detail-input"
                  />
                </div>
                <div className="input-group">
                  <label>Loại điều trị</label>
                  <input
                    type="text"
                    value={selectedRecord.treatmentType}
                    onChange={(e) =>
                      handleInputChange("treatmentType", e.target.value)
                    }
                    disabled={!isEditing}
                    className="detail-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Ngày điều trị</label>
                  <input
                    type="date"
                    value={selectedRecord.treatmentDate}
                    onChange={(e) =>
                      handleInputChange("treatmentDate", e.target.value)
                    }
                    disabled={!isEditing}
                    className="detail-input"
                  />
                </div>
                <div className="input-group">
                  <label>Trạng thái</label>
                  <select
                    value={selectedRecord.status}
                    onChange={(e) =>
                      handleInputChange("status", e.target.value)
                    }
                    disabled={!isEditing}
                    className="detail-input"
                  >
                    <option value="Scheduled">Đã lên lịch</option>
                    <option value="In Progress">Đang điều trị</option>
                    <option value="Completed">Hoàn thành</option>
                    <option value="Cancelled">Đã hủy</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label>Chẩn đoán</label>
                <textarea
                  value={selectedRecord.diagnosis}
                  onChange={(e) =>
                    handleInputChange("diagnosis", e.target.value)
                  }
                  disabled={!isEditing}
                  className="detail-textarea"
                  rows={3}
                />
              </div>

              <div className="input-group">
                <label>Phác đồ điều trị</label>
                <textarea
                  value={selectedRecord.treatmentPlan}
                  onChange={(e) =>
                    handleInputChange("treatmentPlan", e.target.value)
                  }
                  disabled={!isEditing}
                  className="detail-textarea"
                  rows={3}
                />
              </div>

              <div className="input-group">
                <label>Thuốc sử dụng</label>
                <textarea
                  value={selectedRecord.medications}
                  onChange={(e) =>
                    handleInputChange("medications", e.target.value)
                  }
                  disabled={!isEditing}
                  className="detail-textarea"
                  rows={2}
                />
              </div>

              <div className="input-group">
                <label>Ghi chú</label>
                <textarea
                  value={selectedRecord.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  disabled={!isEditing}
                  className="detail-textarea"
                  rows={3}
                />
              </div>

              {isEditing && (
                <div className="form-actions">
                  <button onClick={handleSave} className="save-button">
                    Lưu
                  </button>
                  <button onClick={handleCancel} className="cancel-button">
                    Hủy
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalRecordManagement;
