import React, { useState } from 'react';
import './IUIIVFServices.css';
import { useNavigate } from 'react-router-dom';
import { Baby } from 'lucide-react';
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

const IUIIVFServices: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'iui' | 'ivf'>('all');
  const navigate = useNavigate();
   const handleBookConsultation = (serviceId: string) => {
    navigate(`/detail-services/${serviceId}`);
  };

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
    {
      id: 'ivf-complete',
      name: 'Gói IVF Vẹn Tròn (*)',
      originalPrice: 70110000,
      discountPrice: 52583500,
      discount: 25,
      image: '/api/placeholder/300/200',
      description: 'Chăm sóc mẹ & bé toàn diện 100% từ khi mê mang thai đến khi sinh con',
      features: ['Chăm sóc toàn diện', 'Theo dõi thai kỳ', 'Sinh con an toàn', 'Chăm sóc sau sinh']
    },
    {
      id: 'iui-basic',
      name: 'Gói IUI Cơ bản',
      originalPrice: 25000000,
      discountPrice: 20000000,
      discount: 20,
      image: '/api/placeholder/300/200',
      description: 'Gói thụ tinh nhân tạo cơ bản với quy trình chuẩn',
      features: ['Thụ tinh nhân tạo', 'Theo dõi rụng trứng', 'Tư vấn dinh dưỡng', 'Khám định kỳ']
    },
    {
      id: 'iui-advanced',
      name: 'Gói IUI Nâng cao',
      originalPrice: 35000000,
      discountPrice: 28000000,
      discount: 20,
      image: '/api/placeholder/300/200',
      description: 'Gói IUI với công nghệ tiên tiến và chăm sóc đặc biệt',
      features: ['IUI công nghệ cao', 'Kích thích rụng trứng', 'Theo dõi chuyên sâu', 'Tư vấn tâm lý']
    }
  ];

  const filteredServices = servicePackages.filter(service => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'iui') return service.name.toLowerCase().includes('iui');
    if (selectedCategory === 'ivf') return service.name.toLowerCase().includes('ivf');
    return true;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  return (
    <div>
    <Header/>
    <div className="min-h-screen">


      <section className="services">
        <div className="text-center">
          <h2>Dịch vụ IUI / IVF chuyên nghiệp</h2>
          <p>
            Trung tâm Hiếm muộn MIRAVA tự hào là đơn vị tiên phong xây dựng và ứng dụng thành công mô hình điều trị DFT 1:1 nâng tỷ lệ đậu thai thành công tối 86%.
          </p>
        </div>

        <div className="filter-buttons">
          <button
            onClick={() => setSelectedCategory('all')}
            className={selectedCategory === 'all' ? 'active' : ''}
          >Tất cả</button>
          <button
            onClick={() => setSelectedCategory('iui')}
            className={selectedCategory === 'iui' ? 'active' : ''}
          >Dịch vụ IUI</button>
          <button
            onClick={() => setSelectedCategory('ivf')}
            className={selectedCategory === 'ivf' ? 'active' : ''}
          >Dịch vụ IVF</button>
        </div>

        <div className="card-grid">
          {filteredServices.map((service) => (
            <div key={service.id} className="service-card">
              <div className="card-image">
                <div className="badge">-{service.discount}%</div>
                <div className="icon-container">
                  <Baby className="icon" />
                  <p>{service.name}</p>
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
                  <p className="original-price">{formatPrice(service.originalPrice)}</p>
                  <p className="price">{formatPrice(service.discountPrice)}</p>
                </div>
                <button onClick={() => handleBookConsultation(service.id)}>Đặt lịch tư vấn</button>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
    <Footer/>
    </div>
  );
};

export default IUIIVFServices;
