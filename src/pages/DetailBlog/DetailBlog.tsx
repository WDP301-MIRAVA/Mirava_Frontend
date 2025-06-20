import React from 'react';
import { ArrowLeft, Calendar, User, Tag, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import './DetailBlog.css';

const DetailBlog: React.FC = () => {
  const relatedPosts = [
    {
      id: 1,
      title: "5 Thói quen tốt cho sức khỏe tim mạch",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop",
      excerpt: "Khám phá những thói quen đơn giản giúp bảo vệ tim mạch của bạn...",
      date: "15 tháng 1, 2024"
    },
    {
      id: 2,
      title: "Dinh dưỡng hợp lý trong thời kỳ phục hồi",
      image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300&h=200&fit=crop",
      excerpt: "Hướng dẫn chi tiết về chế độ dinh dưỡng phù hợp...",
      date: "10 tháng 1, 2024"
    },
    {
      id: 3,
      title: "Tầm quan trọng của giấc ngủ đối với sức khỏe",
      image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05ba1?w=300&h=200&fit=crop",
      excerpt: "Tại sao giấc ngủ chất lượng lại quan trọng đến vậy...",
      date: "5 tháng 1, 2024"
    }
  ];

  return (
    <div className="detail-blog-container">
      {/* Header Navigation */}
      <div className="detail-blog-nav">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="detail-blog-back-link">
            <button className="detail-blog-back-button">
              <ArrowLeft size={20} />
              Quay lại danh sách bài viết
            </button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="detail-blog-main-content">
        {/* Article Header */}
        <header className="detail-blog-header">
          <div className="detail-blog-meta">
            <div className="detail-blog-meta-item">
              <User size={16} />
              <span>Bởi Dr. Nguyễn</span>
            </div>
            <div className="detail-blog-meta-item">
              <Calendar size={16} />
              <span>Ngày 20 tháng 1, 2024</span>
            </div>
            <div className="detail-blog-meta-item">
              <Clock size={16} />
              <span>5 phút đọc</span>
            </div>
          </div>
          
          <h1 className="detail-blog-title">
            Cách chăm sóc sức khỏe trong mùa dịch
          </h1>

          <div className="detail-blog-featured-image">
            <img 
              src="https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&h=400&fit=crop" 
              alt="Chăm sóc sức khỏe trong mùa dịch"
              className="detail-blog-featured-image-element"
            />
          </div>
        </header>

        {/* Article Content */}
        <article>
          <div className="detail-blog-content-wrapper">
            <div className="detail-blog-content">
              <p className="detail-blog-intro">
                Trong bối cảnh dịch bệnh hiện tại, việc chăm sóc sức khỏe trở nên quan trọng hơn bao giờ hết. 
                Dưới đây là những hướng dẫn chi tiết giúp bạn và gia đình duy trì sức khỏe tốt nhất.
              </p>

              <div className="detail-blog-heading">
                <div className="detail-blog-heading-before"></div>
                1. Tăng cường hệ miễn dịch
              </div>
              <p className="detail-blog-paragraph">
                Hệ miễn dịch mạnh mẽ là tuyến phòng thủ đầu tiên chống lại các tác nhân gây bệnh. 
                Để tăng cường hệ miễn dịch, bạn cần chú ý đến các yếu tố sau:
              </p>
              <ul className="detail-blog-list">
                <li className="detail-blog-list-item">Bổ sung đầy đủ vitamin C từ trái cây tươi như cam, chanh, kiwi</li>
                <li className="detail-blog-list-item">Sử dụng thực phẩm giàu kẽm như hạt bí ngô, thịt nạc, đậu</li>
                <li className="detail-blog-list-item">Uống đủ nước mỗi ngày (ít nhất 2 lít)</li>
                <li className="detail-blog-list-item">Ngủ đủ giấc 7-8 tiếng mỗi đêm</li>
              </ul>

              <div className="detail-blog-heading">
                <div className="detail-blog-heading-before"></div>
                2. Vệ sinh cá nhân và môi trường
              </div>
              <p className="detail-blog-paragraph">
                Việc duy trì vệ sinh cá nhân và môi trường sống sạch sẽ là biện pháp phòng ngừa hiệu quả nhất:
              </p>
              <div className="detail-blog-tip">
                <p className="detail-blog-tip-text">
                  💡 Lời khuyên: Rửa tay thường xuyên bằng xà phòng trong ít nhất 20 giây, 
                  đặc biệt trước khi ăn và sau khi tiếp xúc với bề mặt công cộng.
                </p>
              </div>

              <div className="detail-blog-heading">
                <div className="detail-blog-heading-before"></div>
                3. Chế độ dinh dưỡng cân bằng
              </div>
              <p className="detail-blog-paragraph">
                Một chế độ ăn uống lành mạnh không chỉ cung cấp năng lượng mà còn giúp cơ thể 
                chống chọi với bệnh tật hiệu quả:
              </p>
              <div className="detail-blog-nutrition-grid">
                <div className="detail-blog-nutrition-card detail-blog-should-eat">
                  <h4 className="detail-blog-card-title detail-blog-should-eat-title">Nên ăn</h4>
                  <ul className="detail-blog-card-list detail-blog-should-eat-list">
                    <li className="detail-blog-card-list-item">• Rau xanh đậm màu</li>
                    <li className="detail-blog-card-list-item">• Trái cây tươi</li>
                    <li className="detail-blog-card-list-item">• Protein từ cá, thịt nạc</li>
                    <li className="detail-blog-card-list-item">• Ngũ cốc nguyên hạt</li>
                  </ul>
                </div>
                <div className="detail-blog-nutrition-card detail-blog-should-limit">
                  <h4 className="detail-blog-card-title detail-blog-should-limit-title">Hạn chế</h4>
                  <ul className="detail-blog-card-list detail-blog-should-limit-list">
                    <li className="detail-blog-card-list-item">• Thực phẩm chế biến sẵn</li>
                    <li className="detail-blog-card-list-item">• Đồ uống có ga, nhiều đường</li>
                    <li className="detail-blog-card-list-item">• Thức ăn nhanh</li>
                    <li className="detail-blog-card-list-item">• Rượu bia</li>
                  </ul>
                </div>
              </div>

              <div className="detail-blog-heading">
                <div className="detail-blog-heading-before"></div>
                4. Tập thể dục đều đặn
              </div>
              <p className="detail-blog-paragraph">
                Hoạt động thể chất không chỉ giúp duy trì cân nặng lý tưởng mà còn tăng cường 
                sức đề kháng và cải thiện tâm trạng. Ngay cả khi ở nhà, bạn vẫn có thể:
              </p>
              <ul className="detail-blog-list">
                <li className="detail-blog-list-item">Tập yoga hoặc thiền định 15-20 phút mỗi ngày</li>
                <li className="detail-blog-list-item">Thực hiện các bài tập cardio tại nhà</li>
                <li className="detail-blog-list-item">Đi bộ trong khu vực an toàn, thoáng mát</li>
                <li className="detail-blog-list-item">Tham gia các lớp tập online</li>
              </ul>

              <div className="detail-blog-heading">
                <div className="detail-blog-heading-before"></div>
                5. Quản lý stress và sức khỏe tinh thần
              </div>
              <p className="detail-blog-paragraph">
                Stress kéo dài có thể làm suy yếu hệ miễn dịch. Hãy áp dụng các phương pháp 
                giảm stress hiệu quả:
              </p>
              <div className="detail-blog-breathing-technique">
                <h4 className="detail-blog-breathing-title">Kỹ thuật thở sâu 4-7-8</h4>
                <ol className="detail-blog-breathing-list">
                  <li className="detail-blog-list-item">Hít vào qua mũi trong 4 giây</li>
                  <li className="detail-blog-list-item">Nahan thở trong 7 giây</li>
                  <li className="detail-blog-list-item">Thở ra qua miệng trong 8 giây</li>
                  <li className="detail-blog-list-item">Lặp lại 3-4 lần</li>
                </ol>
              </div>

              <div className="detail-blog-warning-box">
                <h3 className="detail-blog-warning-title">
                  ⚠️ Khi nào cần đi khám bác sĩ?
                </h3>
                <p className="detail-blog-warning-text">
                  Nếu bạn có các triệu chứng như sốt cao, khó thở, ho kéo dài, 
                  hoặc mệt mỏi bất thường, hãy liên hệ với cơ sở y tế ngay lập tức.
                </p>
              </div>

              <div className="detail-blog-heading">
                <div className="detail-blog-heading-before"></div>
                Kết luận
              </div>
              <p className="detail-blog-paragraph">
                Chăm sóc sức khỏe trong mùa dịch đòi hỏi sự kiên trì và nhất quán. 
                Bằng cách thực hiện những biện pháp đơn giản nhưng hiệu quả trên, 
                bạn có thể bảo vệ bản thân và người thân một cách tốt nhất. 
                Hãy nhớ rằng, phòng bệnh luôn tốt hơn chữa bệnh.
              </p>
            </div>
          </div>
        </article>

        {/* Tags Section */}
        <div className="detail-blog-tags-section">
          <h3 className="detail-blog-tags-title">
            <Tag size={20} />
            Chủ đề
          </h3>
          <div className="detail-blog-tags-container">
            <span className="detail-blog-tag detail-blog-tag-health">Sức khỏe</span>
            <span className="detail-blog-tag detail-blog-tag-covid">COVID-19</span>
            <span className="detail-blog-tag detail-blog-tag-prevention">Phòng ngừa</span>
            <span className="detail-blog-tag detail-blog-tag-nutrition">Dinh dưỡng</span>
            <span className="detail-blog-tag detail-blog-tag-exercise">Tập thể dục</span>
          </div>
        </div>

        {/* Related Posts Section */}
        <div className="detail-blog-related-section">
          <h3 className="detail-blog-related-title">Bài viết liên quan</h3>
          <div className="detail-blog-related-grid">
            {relatedPosts.map((post) => (
              <div key={post.id} className="detail-blog-related-card">
                <div className="detail-blog-related-image-wrapper">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="detail-blog-related-image"
                  />
                </div>
                <div className="detail-blog-related-content">
                  <h4 className="detail-blog-related-card-title">
                    {post.title}
                  </h4>
                  <p className="detail-blog-related-excerpt">
                    {post.excerpt}
                  </p>
                  <div className="detail-blog-related-footer">
                    <span className="detail-blog-related-date">{post.date}</span>
                    <button className="detail-blog-read-more">
                      Đọc thêm →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="detail-blog-bottom-nav">
          <Link to="/" className="detail-blog-bottom-link">
            <button className="detail-blog-bottom-button">
              Quay lại danh sách bài viết
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DetailBlog;