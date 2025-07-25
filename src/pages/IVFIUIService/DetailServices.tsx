import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "./DetailServices.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import toast from "react-hot-toast";
import { isLoggedIn } from "@/utils/Auth";
interface ContentBlock {
  title: string;
  description: string;
  imageUrl: string;
  eligibilityCriteria: string[];
  imageImportant?: string;
  summary: string;
}

interface Doctor {
  user: { userName: string };
  workSchedule: string[];
}

interface ServicePackage {
  id: string;
  name: string;
  originalPrice: number;
  discountPrice: number;
  discount: number;
  image: string;
  description: string;
  shortDescription: string[];
  content: ContentBlock[];
  doctor: Doctor[];
}

const DetailServices: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedService, setSelectedService] = useState<ServicePackage | null>(
    null
  );
  const location = useLocation();

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(
          `https://mirava-f0rz.onrender.com/api/service/${id}`
        );
        const data = await res.json();

        const originalPrice = data.price;
        const discount = data.salePrice || 0;
        const discountPrice = Math.round(originalPrice * (1 - discount / 100));

        const mappedData: ServicePackage = {
          id: data._id,
          name: data.name,
          originalPrice,
          discountPrice,
          discount,
          image: data.imageUrl,
          description: data.description || "",
          shortDescription: data.shortDescription || [],
          content: data.content || [],
          doctor: data.doctor || [],
        };

        setSelectedService(mappedData);
      } catch (error) {
        console.error("Failed to fetch service detail:", error);
      }
    };

    if (id) fetchDetail();
  }, [id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + " đ";
  };

  const handleBuyNow = () => {
    if (!isLoggedIn()) {
      localStorage.setItem(
        "redirectAfterLogin",
        location.pathname + location.search
      );
      navigate("/login");
      return;
    }
    if (id) navigate(`/checkout/${id}`);
  };

  const handleAddToCart = () => {
    if (!selectedService) {
      toast.error("Không thể thêm vào giỏ hàng. Dịch vụ không tồn tại.");
      return;
    }

    // Lấy giỏ hàng hiện tại từ localStorage
    const storedCart = localStorage.getItem("cart");
    const cartItems = storedCart ? JSON.parse(storedCart) : [];

    // Kiểm tra nếu dịch vụ đã tồn tại trong giỏ hàng
    const isAlreadyInCart = cartItems.some(
      (item: any) => item.id === selectedService.id
    );

    if (isAlreadyInCart) {
      toast.error("Dịch vụ đã có trong giỏ hàng.");
      return;
    }

    // ✅ Tạo cart item với cấu trúc chuẩn
    const cartItem = {
      id: selectedService.id,
      name: selectedService.name,
      price: selectedService.originalPrice,
      discountPrice: selectedService.discountPrice,
      originalPrice: selectedService.originalPrice,
      image: selectedService.image,
      type: "service", // ✅ Đảm bảo type được set đúng
      quantity: 1,
      addedAt: new Date().toISOString(),
    };

    console.log("🛒 Thêm dịch vụ vào giỏ hàng:", cartItem);

    // Thêm dịch vụ vào giỏ hàng
    const updatedCart = [...cartItems, cartItem];
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    // Phát sự kiện để cập nhật UI
    window.dispatchEvent(new Event("storage"));

    toast.success(`Đã thêm "${selectedService.name}" vào giỏ hàng!`);
  };

  if (!selectedService) {
    return (
      <div>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <p>Không tìm thấy dịch vụ</p>
        </div>
        <Footer />
      </div>
    );
  }

  const galleryImages = [
    selectedService.image,
    ...(selectedService.content?.map((c) => c.imageUrl).filter(Boolean) || []),
  ];

  return (
    <div>
      <Header />
      <div className="ivf-detail">
        <div className="ivf-detail-container">
          <div className="ivf-detail-top">
            <div className="ivf-images">
              <div className="main-image">
                <img src={galleryImages[selectedImage]} alt="Gói dịch vụ" />
                <div className="discount-badge">
                  -{selectedService.discount}%
                </div>
              </div>
              <div className="thumbs">
                {galleryImages.map((img, idx) => (
                  <div
                    key={idx}
                    className={`thumb ${selectedImage === idx ? "active" : ""}`}
                    onClick={() => setSelectedImage(idx)}
                  >
                    <img src={img} alt={`Hình ${idx + 1}`} />
                  </div>
                ))}
              </div>
            </div>

            <div className="ivf-info">
              <h1>{selectedService.name}</h1>
              <div className="price-group">
                <span className="original-price">
                  {formatPrice(selectedService.originalPrice)}
                </span>
                <span className="discounted-price">
                  {formatPrice(selectedService.discountPrice)}
                </span>
              </div>
              <div className="gift-box">
                🎁 <span>TẶNG THÊM</span>
              </div>
              <div className="features">
                <h3>Ưu đãi:</h3>
                <ul>
                  {selectedService.shortDescription.map((desc, i) => (
                    <li key={i}>{desc}</li>
                  ))}
                </ul>
              </div>
              <div className="actions">
                <div className="btn-group">
                  <button className="btn-secondary" onClick={handleAddToCart}>
                    🛒 THÊM VÀO GIỎ HÀNG
                  </button>
                  <button className="btn-secondary" onClick={handleBuyNow}>
                    MUA NGAY
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content Blocks */}
          {selectedService.content.map((block, idx) => (
            <div key={idx} className="ivf-process">
              <h2>{block.title}</h2>
              <div className="process-steps">
                <div className="process-step">
                  <img
                    className="img-description"
                    src={block.imageUrl}
                    alt={block.title}
                  />
                  <div className="process-step-content">
                    <p>{block.description}</p>
                    {block.eligibilityCriteria?.length > 0 && (
                      <>
                        <h4>Đối tượng áp dụng:</h4>
                        <ul>
                          {block.eligibilityCriteria.map((crit, i) => (
                            <li key={i}>{crit}</li>
                          ))}
                        </ul>
                      </>
                    )}
                    <img
                      className="img-important"
                      src={block.imageImportant || ""}
                      alt={""}
                    />
                    <p>{block.summary}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DetailServices;
