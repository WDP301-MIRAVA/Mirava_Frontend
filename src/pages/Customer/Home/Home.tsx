import React from 'react';
import './Home.css';

const Home = () => {
  // Dummy data for the dashboard
  const treatmentPlan = {
    status: "Đang theo dõi",
    progress: 65,
    nextStep: "Siêu âm kiểm tra"
  };

  const upcomingAppointments = [
    {
      id: 1,
      date: "15/06/2025",
      time: "09:30",
      doctor: "BS. Nguyễn Thị Lan",
      type: "Tư vấn điều trị"
    },
    {
      id: 2,
      date: "20/06/2025",
      time: "14:00",
      doctor: "BS. Trần Văn Minh",
      type: "Siêu âm theo dõi"
    }
  ];

  const notifications = [
    {
      id: 1,
      title: "Nhắc nhở uống thuốc",
      message: "Đã đến giờ uống thuốc hỗ trợ sinh sản",
      time: "2 giờ trước",
      unread: true
    },
    {
      id: 2,
      title: "Lịch hẹn sắp tới",
      message: "Bạn có lịch hẹn vào ngày mai lúc 9:30",
      time: "1 ngày trước",
      unread: true
    },
    {
      id: 3,
      title: "Kết quả xét nghiệm",
      message: "Kết quả xét nghiệm hormone đã có",
      time: "3 ngày trước",
      unread: false
    }
  ];

  const newsArticles = [
    {
      id: 1,
      title: "10 Thực phẩm tốt cho khả năng sinh sản",
      excerpt: "Khám phá những thực phẩm giúp cải thiện khả năng sinh sản tự nhiên...",
      image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=250&fit=crop",
      date: "10/06/2025",
      readTime: "5 phút đọc"
    },
    {
      id: 2,
      title: "Yoga và Thiền định cho mẹ bầu",
      excerpt: "Tìm hiểu về lợi ích của yoga trong việc chuẩn bị cho thai kỳ...",
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=250&fit=crop",
      date: "08/06/2025",
      readTime: "7 phút đọc"
    },
    {
      id: 3,
      title: "Chăm sóc sức khỏe tinh thần trong điều trị",
      excerpt: "Vai trò quan trọng của sức khỏe tinh thần trong hành trình điều trị...",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop",
      date: "05/06/2025",
      readTime: "6 phút đọc"
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="home-container">
      {/* Header */}
     

      {/* Main Content */}
      <main className="home-main">
        {/* Overview Cards */}
        <section className="overview-section">
          <h2 className="section-title">Tổng quan</h2>
          <div className="overview-grid">
            {/* Treatment Plan Card */}
            <div className="overview-card">
              <div className="card-header">
                <h3 className="card-title">Kế hoạch điều trị</h3>
                <div className="status-badge">{treatmentPlan.status}</div>
              </div>
              <div className="card-content">
                <div className="progress-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${treatmentPlan.progress}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{treatmentPlan.progress}% hoàn thành</span>
                </div>
                <p className="next-step">Bước tiếp theo: {treatmentPlan.nextStep}</p>
              </div>
            </div>

            {/* Appointments Card */}
            <div className="overview-card">
              <div className="card-header">
                <h3 className="card-title">Lịch điều trị</h3>
                <span className="count-badge">{upcomingAppointments.length}</span>
              </div>
              <div className="card-content">
                {upcomingAppointments.slice(0, 2).map(appointment => (
                  <div key={appointment.id} className="appointment-item">
                    <div className="appointment-date">
                      <span className="date">{appointment.date}</span>
                      <span className="time">{appointment.time}</span>
                    </div>
                    <div className="appointment-details">
                      <p className="appointment-type">{appointment.type}</p>
                      <p className="appointment-doctor">{appointment.doctor}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notifications Card */}
            <div className="overview-card">
              <div className="card-header">
                <h3 className="card-title">Thông báo</h3>
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              </div>
              <div className="card-content">
                {notifications.slice(0, 3).map(notification => (
                  <div key={notification.id} className={`notification-item ${notification.unread ? 'unread' : ''}`}>
                    <div className="notification-content">
                      <h4 className="notification-title">{notification.title}</h4>
                      <p className="notification-message">{notification.message}</p>
                      <span className="notification-time">{notification.time}</span>
                    </div>
                    {notification.unread && <div className="unread-dot"></div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="cta-card">
            <h2 className="cta-title">Cần hỗ trợ tư vấn?</h2>
            <p className="cta-description">
              Đội ngũ chuyên gia của chúng tôi sẵn sàng hỗ trợ bạn 24/7. 
              Đặt lịch tư vấn miễn phí để được tư vấn chuyên sâu về hành trình sinh sản của bạn.
            </p>
            <button className="cta-button">
              Đặt lịch tư vấn miễn phí
            </button>
          </div>
        </section>

        {/* News Section */}
        <section className="news-section">
          <h2 className="section-title">Tin tức & Bài viết</h2>
          <div className="news-grid">
            {newsArticles.map(article => (
              <article key={article.id} className="news-card">
                <div className="news-image">
                  <img src={article.image} alt={article.title} />
                </div>
                <div className="news-content">
                  <h3 className="news-title">{article.title}</h3>
                  <p className="news-excerpt">{article.excerpt}</p>
                  <div className="news-meta">
                    <span className="news-date">{article.date}</span>
                    <span className="news-read-time">{article.readTime}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;