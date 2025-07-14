import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Clock, FileText, Users } from "lucide-react";
import "./TestPackageDetail.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import toast from "react-hot-toast";

// Khai báo kiểu cho window.gtag để tránh lỗi TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

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

// Interface cho cart item
interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  type: "service" | "test-package";
  addedAt: string;
  quantity: number;
  // Thông tin đặc biệt cho test package
  testPackageInfo?: {
    duration: string;
    preparation: string;
    packageType: "male" | "female" | "couple";
    testsCount: number;
  };
}

const TestPackageDetail: React.FC = () => {
  const [testPackage, setTestPackage] = useState<TestPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const { id: packageId } = useParams();
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
          
          // Xử lý danh sách hình ảnh
          const images: string[] = [];
          if (data.data.imageUrl) {
            images.push(data.data.imageUrl);
          }
          if (data.data.treatmentProcessImage && data.data.treatmentProcessImage !== data.data.imageUrl) {
            images.push(data.data.treatmentProcessImage);
          }
          
          setAvailableImages(images);
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

  // Auto-slide images khi có nhiều hình ảnh
  useEffect(() => {
    if (availableImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % availableImages.length);
      }, 4000); // Chuyển ảnh mỗi 4 giây

      return () => clearInterval(interval);
    }
  }, [availableImages.length]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  // Xử lý thêm vào giỏ hàng
  const handleAddToCart = async () => {
    if (!testPackage) {
      toast.error("Không thể thêm vào giỏ hàng. Gói xét nghiệm không tồn tại.");
      return;
    }

    // Prevent multiple clicks
    if (isAddingToCart) {
      return;
    }

    setIsAddingToCart(true);

    try {
      // Lấy giỏ hàng hiện tại từ localStorage
      const storedCart = localStorage.getItem("cart");
      const cartItems: CartItem[] = storedCart ? JSON.parse(storedCart) : [];

      // Kiểm tra nếu gói xét nghiệm đã tồn tại trong giỏ hàng
      const existingItemIndex = cartItems.findIndex(
        (item: CartItem) => item.id === testPackage._id
      );

      if (existingItemIndex !== -1) {
        toast.error("Gói xét nghiệm đã có trong giỏ hàng.");
        return;
      }

      // Tạo cart item mới cho test package
      const newCartItem: CartItem = {
        id: testPackage._id,
        name: testPackage.name,
        price: testPackage.price,
        image: testPackage.imageUrl,
        type: "test-package",
        addedAt: new Date().toISOString(),
        quantity: 1,
        testPackageInfo: {
          duration: testPackage.duration,
          preparation: testPackage.preparation,
          packageType: testPackage.type,
          testsCount: testPackage.tests.length,
        },
      };

      // Thêm gói xét nghiệm vào giỏ hàng
      const updatedCart = [...cartItems, newCartItem];

      // Validate cart size (tối đa 10 items)
      if (updatedCart.length > 10) {
        toast.error(
          "Giỏ hàng đã đầy. Vui lòng xóa một số items trước khi thêm mới."
        );
        return;
      }

      // Lưu vào localStorage
      localStorage.setItem("cart", JSON.stringify(updatedCart));

      // Phát sự kiện để cập nhật UI
      window.dispatchEvent(new Event("storage"));

      // Hiển thị thông báo thành công
      toast.success(
        `Đã thêm gói xét nghiệm "${testPackage.name}" vào giỏ hàng!`,
        {
          duration: 3000,
          position: "top-right",
        }
      );

      // Optional: Analytics tracking
      if (window.gtag) {
        window.gtag("event", "add_to_cart", {
          currency: "VND",
          value: testPackage.price,
          items: [
            {
              item_id: testPackage._id,
              item_name: testPackage.name,
              category: "test_package",
              price: testPackage.price,
              quantity: 1,
            },
          ],
        });
      }
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Utility function để kiểm tra xem gói xét nghiệm đã có trong giỏ hàng chưa
  const isInCart = (): boolean => {
    if (!testPackage) return false;

    const storedCart = localStorage.getItem("cart");
    if (!storedCart) return false;

    const cartItems: CartItem[] = JSON.parse(storedCart);
    return cartItems.some((item: CartItem) => item.id === testPackage._id);
  };

  const handleBookNow = () => {
    if (testPackage) {
      navigate("/checkout-page", {
        state: {
          testPackage: testPackage,
        },
      });
    }
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  const getImageTypeIcon = (imageUrl: string, index: number) => {
    if (!testPackage) return "📋";
    
    // Nếu là hình ảnh chính của gói
    if (imageUrl === testPackage.imageUrl) {
      return "📋";
    }
    // Nếu là hình ảnh quy trình điều trị
    if (imageUrl === testPackage.treatmentProcessImage) {
      return "🔬";
    }
    // Fallback cho các hình ảnh khác
    return ["📊", "🧪", "📈", "🔍"][index % 4];
  };

  if (loading) {
    return (
      <div className="test-package-detail">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải thông tin gói xét nghiệm...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="test-package-detail">
        <Header />
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Thử lại
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  if (!testPackage) {
    return (
      <div className="test-package-detail">
        <Header />
        <div className="error-container">
          <p className="error-message">Không tìm thấy gói xét nghiệm</p>
        </div>
        <Footer />
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
                  {availableImages.length > 0 ? (
                    <img
                      src={availableImages[currentImageIndex]}
                      alt={`${testPackage.name} - Image ${currentImageIndex + 1}`}
                      className="main-img"
                      onError={(e) => {
                        // Fallback nếu hình ảnh không tải được
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = `
                          <div class="image-fallback">
                            <div class="fallback-icon">🧬</div>
                            <p>Hình ảnh gói xét nghiệm</p>
                          </div>
                        `;
                      }}
                    />
                  ) : (
                    <div className="image-fallback">
                      <div className="fallback-icon">🧬</div>
                      <p>Hình ảnh gói xét nghiệm</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Chỉ hiển thị thumbnail khi có nhiều hơn 1 hình ảnh */}
              {availableImages.length > 1 && (
                <div className="thumbnail-images">
                  {availableImages.map((imageUrl, index) => (
                    <div
                      key={index}
                      className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={() => handleThumbnailClick(index)}
                    >
                      <div className="thumb-icon">
                        {getImageTypeIcon(imageUrl, index)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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

                <button
                  className={`add-to-cart-btn ${
                    isInCart() ? "btn-in-cart" : ""
                  }`}
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || isInCart()}
                >
                  {isAddingToCart ? (
                    <>
                      <div className="spinner"></div>
                      ĐANG THÊM...
                    </>
                  ) : isInCart() ? (
                    <>
                      <div className="check-icon">✓</div>
                      ĐÃ CÓ TRONG GIỎ
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={16} />
                      THÊM VÀO GIỎ HÀNG
                    </>
                  )}
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
                {testPackage.treatmentProcessImage ? (
                  <img
                    src={testPackage.treatmentProcessImage}
                    alt="Quy trình xét nghiệm"
                    className="process-img"
                    onError={(e) => {
                      // Fallback nếu hình ảnh không tải được
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = `
                        <div class="medical-image">
                          <div class="medical-icon">🔬</div>
                          <p>Quy trình xét nghiệm</p>
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <div className="medical-image">
                    <div className="medical-icon">🔬</div>
                    <p>Quy trình xét nghiệm</p>
                  </div>
                )}
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
                  {testPackage.imageUrl ? (
                    <img
                      src={testPackage.imageUrl}
                      alt="Thông tin xét nghiệm"
                      className="info-img"
                      onError={(e) => {
                        // Fallback nếu hình ảnh không tải được
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = `
                          <div class="info-icon">🧬</div>
                          <p>Xét nghiệm chuyên sâu</p>
                        `;
                      }}
                    />
                  ) : (
                    <>
                      <div className="info-icon">🧬</div>
                      <p>Xét nghiệm chuyên sâu</p>
                    </>
                  )}
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

      <Footer />
    </div>
  );
};

export default TestPackageDetail;