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
          setPackages(response.data.data);
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
                <div className="discount-badge">
                  {pkg.discount ? `-${pkg.discount}%` : ""}
                </div>
                <div className="package-icon">
                  <div className={`icon-${pkg.type}`}>
                    {pkg.type === "female" ? "♀" : "♂"}
                  </div>
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
                  <div className="current-price">{pkg.price} VNĐ</div>
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
