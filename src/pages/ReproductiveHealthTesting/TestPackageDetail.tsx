import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, Plus, Clock, FileText, Users } from "lucide-react";
import "./TestPackageDetail.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
interface Test {
  testName: string;
  testCode: string;
  normalRange: string;
  unit: string;
  _id: string;
}

interface TestPackage {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  treatmentSubjects: string[];
  treatmentProcess: string[];
  treatmentProcessImage: string;
  type: "male" | "female" | "couple";
  tests: Test[];
  price: number;
  duration: string;
  preparation: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  data: TestPackage;
}

const TestPackageDetail: React.FC = () => {
  const [testPackage, setTestPackage] = useState<TestPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { id: packageId } = useParams(); // Get packageId from URL params
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTestPackage = async () => {
      try {
        const response = await fetch(
          `https://mirava-f0rz.onrender.com/api/test-packages/${packageId}`
        );
        const data: ApiResponse = await response.json();

        if (data.success) {
          setTestPackage(data.data);
        } else {
          setError("Không thể tải thông tin gói xét nghiệm");
        }
      } catch {
        setError("Lỗi kết nối. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    if (packageId) {
      fetchTestPackage();
    } else {
      setError("Không tìm thấy ID gói xét nghiệm trong URL");
      setLoading(false);
    }
  }, [packageId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };
  // const handleAddToCart = () => {
  //   if (testPackage) {
  //     // Add to cart logic here
  //     console.log("Adding to cart:", testPackage);
  //     alert("Đã thêm vào giỏ hàng!");
  //   }
  // };
  const handleBookNow = () => {
    if (testPackage) {
      // Navigate to order page with test package data
      navigate("/checkout-page", {
        state: {
          testPackage: testPackage,
        },
      });
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải thông tin gói xét nghiệm...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="retry-button"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (!testPackage) {
    return (
      <div className="error-container">
        <p className="error-message">Không tìm thấy gói xét nghiệm</p>
      </div>
    );
  }

  return (
    <div className="test-package-detail">
      <Header />
      {/* Main Content */}
      <main className="main-content">
        <div className="container">
          <div className="content-wrapper">
            {/* Left Column - Images */}
            <div className="image-section">
              <div className="main-image">
                <div className="discount-badge">-10%</div>
                <div className="package-image">
                  <img
                    src={testPackage.imageUrl}
                    alt={testPackage.name}
                    className="main-img"
                  />
                </div>
              </div>
              <div className="thumbnail-images">
                <div className="thumbnail active">
                  <div className="thumb-icon">📋</div>
                </div>
                <div className="thumbnail">
                  <div className="thumb-icon">🧪</div>
                </div>
                <div className="thumbnail">
                  <div className="thumb-icon">📊</div>
                </div>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="details-section">
              <h1 className="package-title">{testPackage.name}</h1>

              <div className="price-section">
                <span className="original-price">
                  {formatPrice(Math.round(testPackage.price * 1.1))} đ
                </span>
                <span className="current-price">
                  {formatPrice(testPackage.price)} đ
                </span>
              </div>

              <div className="add-to-wishlist">
                <Plus size={16} />
                <span>THÊM VÀO YÊU THÍCH</span>
              </div>

              <div className="package-info">
                <h3>Ưu đãi:</h3>
                <ul className="benefits-list">
                  <li>Kết quả xét nghiệm chính xác và nhanh chóng</li>
                  <li>
                    Được thực hiện bởi đội ngũ chuyên gia giàu kinh nghiệm
                  </li>
                  <li>Tư vấn và hỗ trợ chuyên sâu từ bác sĩ chuyên khoa</li>
                </ul>
              </div>
              <div className="treatment-subjects">
                <h4>Đối tượng điều trị phù hợp:</h4>
                <ul>
                  {testPackage.treatmentSubjects.map((subject, index) => (
                    <li key={index}>{subject}</li>
                  ))}
                </ul>
              </div>

              <div className="action-buttons">
                <button className="add-to-cart-btn">
                  <ShoppingCart size={16} />
                  THÊM VÀO GIỎ HÀNG
                </button>
                <button className="buy-now-btn" onClick={handleBookNow}>
                  ĐẶT LỊCH NGAY
                </button>
              </div>
            </div>
          </div>

          {/* Package Details */}
          <section className="package-details">
            <h2>Quy trình thực hiện xét nghiệm chuẩn y khoa</h2>
            <div className="details-content">
              <div className="details-image">
                <img
                  src={testPackage.treatmentProcessImage}
                  alt="Quy trình xét nghiệm"
                  className="process-img"
                />
              </div>
              <div className="details-text">
                <p>{testPackage.description}</p>
                <div className="process-steps">
                  <h4>Các bước thực hiện:</h4>
                  <ul>
                    {testPackage.treatmentProcess.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Test Information */}
          <section className="test-information">
            <h2>Thông tin chi tiết gói xét nghiệm</h2>
            <div className="test-info-content">
              <div className="test-info-image">
                <div className="info-image">
                  <div className="info-icon">🧬</div>
                  <p>Xét nghiệm chuyên sâu</p>
                </div>
              </div>
              <div className="test-info-details">
                <div className="info-grid">
                  <div className="info-item">
                    <Clock size={20} />
                    <div>
                      <strong>Thời gian có kết quả:</strong>
                      <p>{testPackage.duration}</p>
                    </div>
                  </div>

                  <div className="info-item">
                    <FileText size={20} />
                    <div>
                      <strong>Chuẩn bị:</strong>
                      <p>{testPackage.preparation}</p>
                    </div>
                  </div>

                  <div className="info-item">
                    <Users size={20} />
                    <div>
                      <strong>Đối tượng:</strong>
                      <p>
                        {testPackage.type === "male"
                          ? "Nam giới"
                          : testPackage.type === "female"
                          ? "Nữ giới"
                          : "Cặp đôi"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="tests-included">
                  <h4>Các xét nghiệm bao gồm:</h4>
                  <div className="tests-list">
                    {testPackage.tests.map((test) => (
                      <div key={test._id} className="test-item">
                        <div className="test-name">{test.testName}</div>
                        <div className="test-details">
                          <span className="test-code">Mã: {test.testCode}</span>
                          <span className="normal-range">
                            Chỉ số bình thường: {test.normalRange}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default TestPackageDetail;
