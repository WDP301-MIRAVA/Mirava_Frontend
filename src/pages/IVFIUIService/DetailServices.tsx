import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './DetailServices.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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

const DetailServices: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedService, setSelectedService] = useState<ServicePackage | null>(null);

  // Dữ liệu dịch vụ (có thể tách ra file riêng hoặc fetch từ API)
  const servicePackages: ServicePackage[] = [
    {
      id: 'ivf-advanced',
      name: 'Gói IVF Công nghệ cao',
      originalPrice: 79435000,
      discountPrice: 63548000,
      discount: 20,
      image: '/api/placeholder/300/200',
      description: 'Gói điều trị hiếm muộn IVF toàn diện với công nghệ tiên tiến',
      features: ['Thụ tinh trong ống nghiệm', 'Chuyển phôi tươi', 'Theo dõi chu kỳ', 'Tư vấn chuyên sâu']
    },
    {
      id: 'ivf-premium',
      name: 'Gói IVF Như Ý (*)',
      originalPrice: 105110000,
      discountPrice: 78833500,
      discount: 25,
      image: '/api/placeholder/300/200',
      description: 'Gói IVF cao cấp với dịch vụ chăm sóc đặc biệt',
      features: ['IVF thế hệ mới', 'Chăm sóc VIP', 'Bảo hiểm thai kỳ', 'Hỗ trợ 24/7']
    },
    // ... thêm các dịch vụ khác
  ];

  useEffect(() => {
    if (id) {
      const service = servicePackages.find(pkg => pkg.id === id);
      setSelectedService(service || null);
    }
  }, [id]);

  const packageImages = [
    'https://online.benhvienphuongdong.vn/wp-content/uploads/2025/05/Thiet-ke-chua-co-ten.png',
    'https://online.benhvienphuongdong.vn/wp-content/uploads/2025/01/ivf-500px-4.jpg',
    '/api/placeholder/600/400',
    '/api/placeholder/600/400',
    '/api/placeholder/600/400'
  ];

  const packageFeatures = [
    'Ưu đãi 20% chi phí',
    'Chấp nhận các kết quả hợp lệ trước đó',
    'Phù hợp với người vợ khó khăn trong chuyển phôi tươi',
    'Phòng nghỉ Deluxe riêng tư sau chuyển phôi',
    'Chính sách trả góp lãi suất 0%'
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  const handleBuyNow = () => {
    if (id) {
      navigate(`/checkout/${id}`);
    }
  };

  const handleAddToCart = () => {
    // Logic thêm vào giỏ hàng (có thể implement sau)x  
    console.log('Added to cart:', id);
  };

  const handleDeposit = () => {
    // Logic đặt cọc (có thể implement sau)
    console.log('Deposit for:', id);
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

  return (
    <div>
        <Header />
    <div className="ivf-detail">
      

     <div className="ivf-detail-container">
  <div className="ivf-detail-top">
    {/* Left - Image gallery */}
    <div className="ivf-images">
      <div className="main-image">
        <img src={packageImages[selectedImage]} alt="Gói IVF" />
        <div className="discount-badge">-{selectedService.discount}%</div>
      </div>
      <div className="thumbs">
        {packageImages.map((image, index) => (
          <div
            key={index}
            className={`thumb ${selectedImage === index ? 'active' : ''}`}
            onClick={() => setSelectedImage(index)}
          >
            <img src={image} alt={`Hình ${index + 1}`} />
          </div>
        ))}
      </div>
    </div>

    {/* Right - Text content */}
    <div className="ivf-info">
      <h1>{selectedService.name}</h1>
      <div className="price-group">
        <span className="original-price">{formatPrice(selectedService.originalPrice)}</span>
        <span className="discounted-price">{formatPrice(selectedService.discountPrice)}</span>
      </div>
      <div className="gift-box">
        🎁 <span>TẶNG THÊM</span>
      </div>
      <div className="features">
        <h3>Ưu điểm nổi bật:</h3>
        <ul>
          {packageFeatures.map((feature, i) => (
            <li key={i}>{feature}</li>
          ))}
        </ul>
      </div>
      <div className="actions">
        <button className="btn-primary" onClick={handleDeposit}>
          ĐẶT CỌC NGAY &gt;&gt;
        </button>
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

  {/* Quy trình xuống dưới */}
  <div className="ivf-process">
    <h2>Quy trình điều trị IVF</h2>
    <div className="process-steps">
      {[
        { step: '01', title: 'Tư vấn & Khám', desc: 'Khám sức khỏe và tư vấn phương án điều trị' },
        { step: '02', title: 'Kích thích buồng trứng', desc: 'Dùng thuốc tăng số trứng' },
        { step: '03', title: 'Thụ tinh', desc: 'Tạo phôi trong phòng thí nghiệm' },
        { step: '04', title: 'Chuyển phôi', desc: 'Chuyển phôi và theo dõi' }
      ].map((item, i) => (
        <div className="process-step" key={i}>
          <div className="step-circle">{item.step}</div>
          <h4>{item.title}</h4>
          <p>{item.desc}</p>
        </div>
      ))}
    </div>
  </div>
</div>
<div>
    <h2 className="text-center">Thiết kế chuyên biệt cho trường hợp từng thất bại khi chuyển phôi tươi</h2>
    <p className="text-center">
       Gói IVF Công nghệ cao là "phiên bản nâng cấp" của gói IVF Vẹn Tròn, được thiết kế dành riêng cho những cặp đôi mong con đang tìm kiếm quy trình điều trị chuyên sâu, cá thể hóa và toàn diện. Không chỉ tuân thủ quy trình chuẩn quốc tế, gói IVF Công nghệ cao còn tích hợp các kỹ thuật hỗ trợ hiện đại và chế độ chăm sóc đặc biệt sau thủ thuật, chú trọng phục hồi cả thể chất lẫn tinh thần, từ đó nâng cao tỷ lệ thành công.

Thiết kế chuyên biệt cho trường hợp từng thất bại khi chuyển phôi tươi
Gói IVF Công nghệ cao đặc biệt dành cho những người vợ có chỉ số sinh sản chưa được như mong muốn – nhóm dễ gặp khó khăn hoặc từng thất bại khi chuyển phôi tươi. Bao gồm các trường hợp như:
    </p>
    <div className="text-center">
        <img className='img-description' src="https://online.benhvienphuongdong.vn/wp-content/uploads/2025/05/ivf-cnc-1.jpg" alt="IVF tại MIRAVA" />
    </div>
</div>

    </div>
    <Footer />
    </div>
  );
};

export default DetailServices;