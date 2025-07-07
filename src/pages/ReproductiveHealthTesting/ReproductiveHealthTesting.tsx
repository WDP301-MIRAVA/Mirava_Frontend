import { useState } from "react";
import "./ReproductiveHealthTesting.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
const ReproductiveHealthTesting = () => {
  const [selectedPackage, setSelectedPackage] = useState("all");
  const [selectedGender, setSelectedGender] = useState("");

  const testingPackages = {
    female: {
      title: "Gói Nữ",
      tests: ["AMH", "FSH", "LH", "Estradiol", "Siêu âm nang noãn"],
      price: "1,500,000",
      originalPrice: "2,100,000",
      discount: 30,
      description: "Gói xét nghiệm toàn diện cho sức khỏe sinh sản nữ giới",
    },
    male: {
      title: "Gói Nam",
      tests: ["Tinh dịch đồ", "Hormone testosterone"],
      price: "800,000",
      originalPrice: "1,200,000",
      discount: 35,
      description: "Gói xét nghiệm chuyên biệt cho sức khỏe sinh sản nam giới",
    },
  };

  const handlePackageSelect = (packageType: string) => {
    setSelectedPackage(packageType);
    setSelectedGender("");
  };

  const handleGenderSelect = (gender: string) => {
    setSelectedGender(gender);
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
          <button
            className={`tab-button ${
              selectedPackage === "combo" ? "active" : ""
            }`}
            onClick={() => handlePackageSelect("combo")}
          >
            Gói Combo
          </button>
          <button
            className={`tab-button ${
              selectedPackage === "consultation" ? "active" : ""
            }`}
            onClick={() => handlePackageSelect("consultation")}
          >
            Tư vấn
          </button>
        </div>

        <div className="packages-grid">
          {(selectedPackage === "all" || selectedPackage === "female") && (
            <div className="package-card">
              <div className="discount-badge">
                -{testingPackages.female.discount}%
              </div>
              <div className="package-icon">
                <div className="icon-female">♀</div>
              </div>
              <h3 className="package-title">{testingPackages.female.title}</h3>
              <p className="package-description">
                {testingPackages.female.description}
              </p>

              <div className="tests-list">
                <h4>Bao gồm các xét nghiệm:</h4>
                <ul>
                  {testingPackages.female.tests.map((test, index) => (
                    <li key={index}>{test}</li>
                  ))}
                </ul>
              </div>

              <div className="price-section">
                <div className="current-price">
                  {testingPackages.female.price} VNĐ
                </div>
                <div className="original-price">
                  {testingPackages.female.originalPrice} VNĐ
                </div>
              </div>

              <button
                className="select-button"
                onClick={() => handleGenderSelect("female")}
              >
                Chọn gói này
              </button>
            </div>
          )}

          {(selectedPackage === "all" || selectedPackage === "male") && (
            <div className="package-card">
              <div className="discount-badge">
                -{testingPackages.male.discount}%
              </div>
              <div className="package-icon">
                <div className="icon-male">♂</div>
              </div>
              <h3 className="package-title">{testingPackages.male.title}</h3>
              <p className="package-description">
                {testingPackages.male.description}
              </p>

              <div className="tests-list">
                <h4>Bao gồm các xét nghiệm:</h4>
                <ul>
                  {testingPackages.male.tests.map((test, index) => (
                    <li key={index}>{test}</li>
                  ))}
                </ul>
              </div>

              <div className="price-section">
                <div className="current-price">
                  {testingPackages.male.price} VNĐ
                </div>
                <div className="original-price">
                  {testingPackages.male.originalPrice} VNĐ
                </div>
              </div>

              <button
                className="select-button"
                onClick={() => handleGenderSelect("male")}
              >
                Chọn gói này
              </button>
            </div>
          )}

          {(selectedPackage === "all" || selectedPackage === "combo") && (
            <div className="package-card combo-card">
              <div className="discount-badge">-40%</div>
              <div className="package-icon">
                <div className="icon-combo">👫</div>
              </div>
              <h3 className="package-title">Gói Combo Cặp đôi</h3>
              <p className="package-description">
                Gói xét nghiệm tổng hợp cho cả hai vợ chồng
              </p>

              <div className="tests-list">
                <h4>Bao gồm tất cả xét nghiệm:</h4>
                <ul>
                  <li>Tất cả xét nghiệm gói nữ</li>
                  <li>Tất cả xét nghiệm gói nam</li>
                  <li>Tư vấn miễn phí</li>
                </ul>
              </div>

              <div className="price-section">
                <div className="current-price">1,800,000 VNĐ</div>
                <div className="original-price">3,000,000 VNĐ</div>
              </div>

              <button
                className="select-button"
                onClick={() => handleGenderSelect("combo")}
              >
                Chọn gói này
              </button>
            </div>
          )}
        </div>

        {selectedGender && (
          <div className="selected-package-info">
            <h3>
              Bạn đã chọn:{" "}
              {selectedGender === "female"
                ? testingPackages.female.title
                : selectedGender === "male"
                ? testingPackages.male.title
                : "Gói Combo Cặp đôi"}
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
