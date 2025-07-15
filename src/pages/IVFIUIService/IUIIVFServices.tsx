import React, { useEffect, useState } from "react";
import "./IUIIVFServices.css";
import { useNavigate } from "react-router-dom";
import { Baby } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface ServicePackage {
  id: string;
  name: string;
  originalPrice: number;
  discountPrice: number;
  discount: number;
  image: string;
  description: string;
  features: string[];
}

const IUIIVFServices: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "iui" | "ivf"
  >("all");
  const [servicePackages, setServicePackages] = useState<ServicePackage[]>([]);
  const navigate = useNavigate();

  const handleBookConsultation = (serviceId: string) => {
    navigate(`/detail-services/${serviceId}`);
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch("https://mirava-f0rz.onrender.com/api/service");
        const data = await res.json();

        const enrichedData = await Promise.all(
          data.map(async (item: any) => {
            const detailRes = await fetch(
              `https://mirava-f0rz.onrender.com/api/service/${item._id}`
            );
            const detailData = await detailRes.json();

            const originalPrice = item.price;
            const discountPrice = detailData.salePrice || originalPrice;
            console.log(
              "Original Price:",
              originalPrice,
              "Discount Price:",
              discountPrice
            );
            const discount = Math.round(
              originalPrice * (1 - discountPrice / 100)
            );

            return {
              id: item._id,
              name: item.name,
              originalPrice,
              discountPrice,
              discount,
              image: item.imageUrl,
              description: item.shortDescription || "",
              features: [], // bạn có thể cập nhật thêm nếu có trong API
            };
          })
        );

        setServicePackages(enrichedData);
      } catch (error) {
        console.error("Failed to fetch services:", error);
      }
    };

    fetchServices();
  }, []);

  const filteredServices = servicePackages.filter((service) => {
    if (selectedCategory === "all") return true;
    if (selectedCategory === "iui")
      return service.name.toLowerCase().includes("iui");
    if (selectedCategory === "ivf")
      return service.name.toLowerCase().includes("ivf");
    return true;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + " đ";
  };

  return (
    <div>
      <Header />
      <div className="min-h-screen">
        <section className="services">
          <div className="text-center">
            <h2 style={{ textAlign: "center", color: "#ffffff" }}>
              Dịch vụ IUI / IVF chuyên nghiệp
            </h2>
            <p>
              Trung tâm Hiếm muộn MIRAVA tự hào là đơn vị tiên phong xây dựng và
              ứng dụng thành công mô hình điều trị DFT 1:1 nâng tỷ lệ đậu thai
              thành công tối 86%.
            </p>
          </div>

          <div className="filter-buttons">
            <button
              onClick={() => setSelectedCategory("all")}
              className={selectedCategory === "all" ? "active" : ""}
            >
              Tất cả
            </button>
            <button
              onClick={() => setSelectedCategory("iui")}
              className={selectedCategory === "iui" ? "active" : ""}
            >
              Dịch vụ IUI
            </button>
            <button
              onClick={() => setSelectedCategory("ivf")}
              className={selectedCategory === "ivf" ? "active" : ""}
            >
              Dịch vụ IVF
            </button>
            <button>Gói khám IUI</button>
            <button>Gói khám IVF</button>
          </div>

          <div className="card-grid">
            {filteredServices.map((service) => (
              <div key={service.id} className="service-card">
                <div className="card-image">
                  <div className="badge">-{service.discountPrice}%</div>
                  <div className="icon-container">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="service-image"
                      onError={(e) => {
                        // Fallback nếu ảnh không tải được
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextElementSibling?.classList.add(
                          "show-fallback"
                        );
                      }}
                    />
                    <Baby className="icon fallback-icon" />
                  </div>
                </div>
                <div className="card-content">
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                  <ul>
                    {service.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                  <div className="price-info">
                    <p className="original-price">
                      {formatPrice(service.originalPrice)}
                    </p>
                    <p className="price">{formatPrice(service.discount)}</p>
                  </div>
                  <button onClick={() => handleBookConsultation(service.id)}>
                    Đặt lịch tư vấn
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default IUIIVFServices;
