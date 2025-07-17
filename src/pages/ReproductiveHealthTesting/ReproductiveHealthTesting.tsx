import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ReproductiveHealthTesting.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import axios from "axios";

type Test = {
  _id: string;
  testName: string;
};

type Package = {
  _id: string;
  name: string;
  description: string;
  type: string;
  price: number;
  discount?: number;
  tests: Test[];
  salePrice?: number; // Thêm salePrice để tương thích với dữ liệu từ API

  imageUrl?: string; // Thêm imageUrl vào interface
};

const ReproductiveHealthTesting = () => {
  const [selectedPackage, setSelectedPackage] = useState("all");
  const [selectedGender, setSelectedGender] = useState("");
  const [packages, setPackages] = useState<Package[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await axios.get(
          "https://mirava-f0rz.onrender.com/api/test-packages"
        );
        if (response.data.success) {
          const mappedData = response.data.data.map((pkg: Package) => ({
            ...pkg,
            discount: pkg.salePrice, // Gán đúng field
          }));
          setPackages(mappedData);
        }
      } catch (error) {
        console.error("Error fetching packages:", error);
      }
    };

    fetchPackages();
  }, []);

  const handlePackageSelect = (packageType: string) => {
    setSelectedPackage(packageType);
    setSelectedGender("");
  };

  const handleSelectPackage = (packageId: string) => {
    navigate(`/test-package-detail/${packageId}`);
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const calculateDiscountedPrice = (
    price: number,
    discountPercent?: number
  ): number => {
    if (!discountPercent) return price;
    return Math.round(price * (1 - discountPercent / 100));
  };

  return (
    <>
      <Header />

      <div className="reproductive-health-container">
        <div className="header-section">
          <h1 className="main-title">Dịch vụ Xét nghiệm Hỗ trợ Sinh sản</h1>
          <p className="subtitle">
            Trung tâm Hiếm muộn MIRAVA tự hào là đơn vị tiên phong xây dựng và
            ứng dụng thành công mô hình điều trị DFT 1:1 nâng tỷ lệ đậu thai
            thành công tối 86%.
          </p>
        </div>

        <div className="filter-tabs">
          <button
            className={`tab-button ${
              selectedPackage === "all" ? "active" : ""
            }`}
            onClick={() => handlePackageSelect("all")}
          >
            Tất cả
          </button>
          <button
            className={`tab-button ${
              selectedPackage === "female" ? "active" : ""
            }`}
            onClick={() => handlePackageSelect("female")}
          >
            Gói Nữ
          </button>
          <button
            className={`tab-button ${
              selectedPackage === "male" ? "active" : ""
            }`}
            onClick={() => handlePackageSelect("male")}
          >
            Gói Nam
          </button>
        </div>

        <div className="packages-grid">
          {packages
            .filter(
              (pkg) => selectedPackage === "all" || pkg.type === selectedPackage
            )
            .map((pkg) => (
              <div className="package-card" key={pkg._id}>
                {pkg.discount && (
                  <div className="discount-badge">-{pkg.discount}%</div>
                )}

                <div className="package-icon">
                  {pkg.imageUrl ? (
                    <div className="package-image-container">
                      <img
                        src={pkg.imageUrl}
                        alt={pkg.name}
                        className="package-image"
                        onError={(e) => {
                          // Fallback về icon mặc định nếu ảnh không tải được
                          e.currentTarget.style.display = "none";
                          const fallbackIcon = e.currentTarget
                            .nextElementSibling as HTMLElement;
                          if (fallbackIcon) {
                            fallbackIcon.style.display = "flex";
                          }
                        }}
                      />
                      <div
                        className={`icon-${pkg.type} fallback-icon`}
                        style={{ display: "none" }}
                      >
                        {pkg.type === "female" ? "♀" : "♂"}
                      </div>
                    </div>
                  ) : (
                    <div className={`icon-${pkg.type}`}>
                      {pkg.type === "female" ? "♀" : "♂"}
                    </div>
                  )}
                </div>

                <h3 className="package-title">{pkg.name}</h3>
                <p className="package-description">{pkg.description}</p>

                <div className="tests-list">
                  <h4>Bao gồm các xét nghiệm:</h4>
                  <ul>
                    {pkg.tests.map((test) => (
                      <li key={test._id}>{test.testName}</li>
                    ))}
                  </ul>
                </div>

                <div className="price-section">
                  {pkg.discount ? (
                    <>
                      <div
                        className="original-price"
                        style={{ marginBottom: "4px" }}
                      >
                        <span className="price-number">
                          {formatPrice(pkg.price)}
                        </span>
                        <span className="price-currency">đ</span>
                      </div>
                      <div className="current-price">
                        <span className="price-number">
                          {formatPrice(
                            calculateDiscountedPrice(pkg.price, pkg.discount)
                          )}
                        </span>
                        <span className="price-currency">đ</span>
                      </div>
                    </>
                  ) : (
                    <div className="current-price">
                      <span className="price-number">
                        {formatPrice(pkg.price)}
                      </span>
                      <span className="price-currency">đ</span>
                    </div>
                  )}
                </div>

                <button
                  className="select-button"
                  onClick={() => handleSelectPackage(pkg._id)}
                >
                  Chọn gói này
                </button>
              </div>
            ))}
        </div>

        {selectedGender && (
          <div className="selected-package-info">
            <h3>
              Bạn đã chọn:{" "}
              {packages.find((pkg) => pkg.type === selectedGender)?.name}
            </h3>
            <p>Vui lòng liên hệ để đặt lịch hẹn và được tư vấn chi tiết.</p>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default ReproductiveHealthTesting;
