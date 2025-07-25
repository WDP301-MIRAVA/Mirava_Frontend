import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Plus, Clock, FileText, Users, ShoppingCart } from "lucide-react";
import "./TestPackageDetail.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import toast from "react-hot-toast";
import { isLoggedIn } from "@/utils/Auth";
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
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
  salePrice?: number; // ✅ Thêm salePrice để tương thích
  discount?: number; // ✅ Thêm discount computed
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
  discountPrice?: number; // ✅ Thêm discountPrice
  originalPrice: number; // ✅ Thêm originalPrice
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
  const location = useLocation();
  useEffect(() => {
    const fetchTestPackage = async () => {
      try {
        const response = await fetch(
          `https://mirava-f0rz.onrender.com/api/test-packages/${packageId}`
        );
        const data: ApiResponse = await response.json();

        if (data.success) {
          // ✅ Chuẩn hóa dữ liệu discount giống như trang danh sách
          const packageData = {
            ...data.data,
            discount: data.data.salePrice || 0, // Gán discount từ salePrice
          };

          setTestPackage(packageData);

          // Xử lý danh sách hình ảnh
          const images: string[] = [];
          if (packageData.imageUrl) {
            images.push(packageData.imageUrl);
          }
          if (
            packageData.treatmentProcessImage &&
            packageData.treatmentProcessImage !== packageData.imageUrl
          ) {
            images.push(packageData.treatmentProcessImage);
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
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [availableImages.length]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  // ✅ Hàm tính giá giảm giống như trang danh sách

  // ✅ Hàm tính giá gốc từ giá hiện tại và % giảm
  const calculateOriginalPrice = (
    currentPrice: number,
    discountPercent?: number
  ): number => {
    if (!discountPercent) return currentPrice;
    return Math.round(currentPrice / (1 - discountPercent / 100));
  };

  // Xử lý thêm vào giỏ hàng
  const handleAddToCart = async () => {
    if (!testPackage) {
      toast.error("Không thể thêm vào giỏ hàng. Gói xét nghiệm không tồn tại.");
      return;
    }

    if (isAddingToCart) {
      return;
    }

    setIsAddingToCart(true);

    try {
      const storedCart = localStorage.getItem("cart");
      const cartItems: CartItem[] = storedCart ? JSON.parse(storedCart) : [];

      const existingItemIndex = cartItems.findIndex(
        (item: CartItem) => item.id === testPackage._id
      );

      if (existingItemIndex !== -1) {
        toast.error("Gói xét nghiệm đã có trong giỏ hàng.");
        return;
      }

      // ✅ Tính toán giá chính xác dựa trên discount
      const discountPercent = testPackage.discount || 0;
      const originalPrice =
        discountPercent > 0
          ? calculateOriginalPrice(testPackage.price, discountPercent)
          : testPackage.price;
      const discountPrice =
        discountPercent > 0 ? testPackage.price : testPackage.price;

      // Tạo cart item mới cho test package
      const newCartItem: CartItem = {
        id: testPackage._id,
        name: testPackage.name,
        price: testPackage.price,
        discountPrice: discountPrice, // ✅ Giá sau giảm
        originalPrice: originalPrice, // ✅ Giá gốc
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

      const updatedCart = [...cartItems, newCartItem];

      if (updatedCart.length > 10) {
        toast.error(
          "Giỏ hàng đã đầy. Vui lòng xóa một số items trước khi thêm mới."
        );
        return;
      }

      localStorage.setItem("cart", JSON.stringify(updatedCart));
      window.dispatchEvent(new Event("storage"));

      const discountText =
        discountPercent > 0 ? ` với giá ưu đãi ${discountPercent}%` : "";

      toast.success(
        `Đã thêm gói xét nghiệm "${testPackage.name}" vào giỏ hàng${discountText}!`,
        {
          duration: 3000,
          position: "top-right",
        }
      );

      if (window.gtag) {
        window.gtag("event", "add_to_cart", {
          currency: "VND",
          value: discountPrice,
          items: [
            {
              item_id: testPackage._id,
              item_name: testPackage.name,
              category: "test_package",
              price: discountPrice,
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

  // ...existing utility functions...

  const isInCart = (): boolean => {
    if (!testPackage) return false;
    const storedCart = localStorage.getItem("cart");
    if (!storedCart) return false;
    const cartItems: CartItem[] = JSON.parse(storedCart);
    return cartItems.some((item: CartItem) => item.id === testPackage._id);
  };

  const handleBookNow = () => {
    if (!isLoggedIn()) {
      // Lưu lại đường dẫn hiện tại để redirect sau khi login
      localStorage.setItem(
        "redirectAfterLogin",
        location.pathname + location.search
      );
      navigate("/login");
      return;
    }
    if (testPackage) {
      navigate("/checkout-page", {
        state: { testPackage: testPackage },
      });
    }
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  const getImageTypeIcon = (imageUrl: string, index: number) => {
    if (!testPackage) return "📋";
    if (imageUrl === testPackage.imageUrl) return "📋";
    if (imageUrl === testPackage.treatmentProcessImage) return "🔬";
    return ["📊", "🧪", "📈", "🔍"][index % 4];
  };

  // ✅ Render loading và error states
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

  // ✅ Tính toán giá hiển thị
  const discountPercent = testPackage.discount || 0;
  const currentPrice = testPackage.price;
  const originalPrice =
    discountPercent > 0
      ? calculateOriginalPrice(currentPrice, discountPercent)
      : currentPrice;

  return (
    <div className="test-package-detail">
      <Header />
      <main className="main-content">
        <div className="container">
          <div className="content-wrapper">
            {/* Left Column - Images */}
            <div className="image-section">
              <div className="main-image">
                {/* ✅ Hiển thị discount badge chỉ khi có giảm giá */}
                {discountPercent > 0 && (
                  <div className="discount-badge">-{discountPercent}%</div>
                )}
                <div className="package-image">
                  {availableImages.length > 0 ? (
                    <img
                      src={availableImages[currentImageIndex]}
                      alt={`${testPackage.name} - Image ${
                        currentImageIndex + 1
                      }`}
                      className="main-img"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
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

              {availableImages.length > 1 && (
                <div className="thumbnail-images">
                  {availableImages.map((imageUrl, index) => (
                    <div
                      key={index}
                      className={`thumbnail ${
                        index === currentImageIndex ? "active" : ""
                      }`}
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
                {/* ✅ Hiển thị giá đúng logic như trang danh sách */}
                {discountPercent > 0 ? (
                  <>
                    <span className="original-price">
                      {formatPrice(originalPrice)} đ
                    </span>
                    <span className="current-price">
                      {formatPrice(currentPrice)} đ
                    </span>
                  </>
                ) : (
                  <span className="current-price">
                    {formatPrice(currentPrice)} đ
                  </span>
                )}
              </div>

              {/* ✅ Hiển thị thông tin tiết kiệm nếu có discount */}
              {discountPercent > 0 && (
                <div className="savings-info">
                  <span className="savings-text">
                    Tiết kiệm: {formatPrice(originalPrice - currentPrice)} đ
                  </span>
                  <span className="savings-percent">
                    (Giảm {discountPercent}%)
                  </span>
                </div>
              )}

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
                      e.currentTarget.style.display = "none";
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
                        e.currentTarget.style.display = "none";
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
