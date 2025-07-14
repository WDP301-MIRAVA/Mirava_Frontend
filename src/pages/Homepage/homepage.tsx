import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Fade,
  Chip,
  Avatar,
  Stack,
  Paper,
  Divider,
  Rating,
} from "@mui/material";
import {
  PlayCircleOutline,
  MedicalServices,
  People,
  CheckCircle,
  Schedule,
  Phone,
  Star,
  ArrowForward,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { DoctorService } from "../../services/doctor.service";
import { BlogService } from "../../services/blog.services";
import { BASE_URL } from "../../services/config";

import hero1 from "../../assets/HeroSection/1.png";
import hero2 from "../../assets/HeroSection/2.png";
import hero3 from "../../assets/HeroSection/3.png";

import ConsultModal from "@/components/Modal/ConsultModal";
const bgImages = [hero1, hero2, hero3];

// Interface types
interface Doctor {
  _id: string;
  user: {
    userName: string;
  };
  specialty: string;
  imageUrl: string;
  experience?: number;
  rating?: number;
}

interface Blog {
  _id: string;
  title: string;
  excerpt: string;
  featuredImage: string;
  publishedAt?: string;
  readTime?: number;
}

interface Service {
  _id: string;
  name: string;
  shortDescription: string;
  successRate: number;
  price: number;
  imageUrl: string;
  duration?: string;
  category?: string;
}

interface StatItem {
  label: string;
  value: string;
  icon: React.ReactNode;
}

interface TestimonialItem {
  name: string;
  content: string;
  rating: number;
  location: string;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [bgIndex, setBgIndex] = useState(0);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);
  const [consultModalOpen, setConsultModalOpen] = useState(false);

  // Dữ liệu thống kê
  const stats: StatItem[] = [
    { label: "Bệnh nhân đã điều trị", value: "5,000+", icon: <People /> },
    { label: "Tỷ lệ thành công", value: "85%", icon: <CheckCircle /> },
    { label: "Năm kinh nghiệm", value: "10+", icon: <Star /> },
    { label: "Bác sĩ chuyên khoa", value: "20+", icon: <MedicalServices /> },
  ];

  // Dữ liệu testimonial
  const testimonials: TestimonialItem[] = [
    {
      name: "Chị Nguyễn Thị A",
      content:
        "Sau 3 năm hiếm muộn, tôi đã thành công có con nhờ phương pháp IVF tại đây. Đội ngũ bác sĩ rất chuyên nghiệp và tận tâm.",
      rating: 5,
      location: "Hà Nội",
    },
    {
      name: "Anh Trần Văn B",
      content:
        "Quy trình điều trị rõ ràng, minh bạch. Bác sĩ luôn theo dõi sát sao và tư vấn chi tiết từng bước.",
      rating: 5,
      location: "TP.HCM",
    },
    {
      name: "Chị Lê Thị C",
      content:
        "Cơ sở vật chất hiện đại, dịch vụ tốt. Cảm ơn đội ngũ đã giúp gia đình tôi có được thiên thần nhỏ.",
      rating: 5,
      location: "Đà Nẵng",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % bgImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load doctors
        const doctorRes = await DoctorService.getDoctors();
        setDoctors(doctorRes.data.slice(0, 3));
        setLoadingDoctors(false);

        // Load blogs
        const blogRes = await BlogService.getFeaturedBlogs();
        // Đảm bảo featuredImage luôn là string
        const safeBlogs = blogRes.slice(0, 3).map((blog: any) => ({
          ...blog,
          featuredImage: blog.featuredImage ?? "",
        }));
        setBlogs(safeBlogs);
        setLoadingBlogs(false);

        // Load services
        const serviceRes = await fetch(`${BASE_URL}/api/service`);
        const serviceData = await serviceRes.json();
        setServices(serviceData.slice(0, 6));
        setLoadingServices(false);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        setLoadingDoctors(false);
        setLoadingBlogs(false);
        setLoadingServices(false);
      }
    };

    loadData();
  }, []);

  const handleNavigateToServices = () => {
    navigate("/iui-ivf-services");
  };

  const handleNavigateToAppointment = () => {
    setConsultModalOpen(true);
  };

  const handleNavigateToBlogs = () => {
    navigate("/blogs");
  };

  return (
    <Box>
      <Header />

      {/* Hero Section - Cải tiến */}
      <Box
        sx={{
          position: "relative",
          height: { xs: "70vh", md: "100vh" },
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
        }}
      >
        {bgImages.map((image, index) => (
          <Box
            key={index}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundImage: `url(${image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              opacity: index === bgIndex ? 1 : 0,
              transition: "opacity 1.5s ease-in-out",
            }}
          />
        ))}

        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 100%)",
            zIndex: 1,
          }}
        />

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
          <Fade in timeout={1000}>
            <Box
              sx={{
                color: "white",
                maxWidth: { xs: "100%", md: "60%" },
                textAlign: { xs: "center", md: "left" },
              }}
            >
              <Typography
                variant="h1"
                component="h1"
                sx={{
                  fontSize: { xs: "2rem", md: "3.5rem", lg: "4rem" },
                  fontWeight: 700,
                  mb: 2,
                  textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
                  lineHeight: 1.2,
                }}
              >
                Hành trình chạm tới{" "}
                <Box component="span" sx={{ color: "#00B9C6" }}>
                  thiên chức làm cha mẹ
                </Box>{" "}
                bắt đầu từ đây
              </Typography>

              <Typography
                variant="h5"
                component="p"
                sx={{
                  fontSize: { xs: "1.1rem", md: "1.3rem" },
                  mb: 4,
                  textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                  fontWeight: 400,
                  lineHeight: 1.6,
                }}
              >
                Giải pháp điều trị hiếm muộn <strong>IUI / IVF</strong> toàn
                diện, an toàn với công nghệ hiện đại và đội ngũ chuyên gia hàng
                đầu.
              </Typography>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{ mb: 4 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PlayCircleOutline />}
                  onClick={handleNavigateToAppointment}
                  sx={{
                    backgroundColor: "#00B9C6",
                    color: "white",
                    py: 1.5,
                    px: 4,
                    fontSize: "1.1rem",
                    borderRadius: "50px",
                    textTransform: "none",
                    fontWeight: 600,
                    boxShadow: "0 4px 15px rgba(0,185,198,0.4)",
                    "&:hover": {
                      backgroundColor: "#00A5B5",
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 20px rgba(0,185,198,0.6)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Đặt ký tư vấn miễn phí
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Phone />}
                  sx={{
                    color: "white",
                    borderColor: "white",
                    py: 1.5,
                    px: 4,
                    fontSize: "1.1rem",
                    borderRadius: "50px",
                    textTransform: "none",
                    fontWeight: 600,
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.1)",
                      borderColor: "white",
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Hotline: 1900 1234
                </Button>
              </Stack>

              {/* Indicators */}
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  justifyContent: { xs: "center", md: "flex-start" },
                }}
              >
                {bgImages.map((_, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: 100,
                      height: 4,
                      backgroundColor:
                        index === bgIndex ? "#00B9C6" : "rgba(255,255,255,0.3)",
                      borderRadius: 2,
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                    onClick={() => setBgIndex(index)}
                  />
                ))}
              </Box>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 6, backgroundColor: "#f8fafc" }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    textAlign: "center",
                    borderRadius: 3,
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    transition: "transform 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-5px)",
                    },
                  }}
                >
                  <Box sx={{ color: "#00B9C6", mb: 1 }}>
                    {React.cloneElement(stat.icon as React.ReactElement, {
                      fontSize: "large",
                    })}
                  </Box>
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    color="#00B9C6"
                    mb={1}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Service List */}
      {/* Service List - Cải tiến layout như Doctors Section */}
      <Box sx={{ backgroundColor: "#f8fafc", py: 8 }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <Typography variant="h3" component="h2" fontWeight={700} mb={2}>
              Gói dịch vụ và xét nghiệm
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              maxWidth="600px"
              mx="auto"
            >
              Các gói dịch vụ được thiết kế phù hợp với nhu cầu của từng cặp đôi
            </Typography>
          </Box>

          {loadingServices ? (
            <Box display="flex" justifyContent="center" py={8}>
              <CircularProgress size={60} sx={{ color: "#00B9C6" }} />
            </Box>
          ) : (
            <Grid container spacing={4}>
              {services.map((service) => (
                <Grid item xs={12} sm={6} md={4} key={service._id}>
                  <Card
                    sx={{
                      width: 500,
                      borderRadius: 3,
                      overflow: "hidden",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
                      },
                      cursor: "pointer",
                    }}
                  >
                    {/* Ảnh được thu nhỏ và hiển thị đầy đủ */}
                    <Box
                      sx={{
                        height: 500,
                        backgroundColor: "#f5f5f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        p: 2,
                      }}
                    >
                      <Box
                        component="img"
                        src={service.imageUrl}
                        alt={service.name}
                        sx={{
                          maxWidth: "100%",
                          maxHeight: "100%",
                          objectFit: "contain",
                          borderRadius: 1,
                          transition: "transform 0.3s ease",
                          "&:hover": {
                            transform: "scale(1.05)",
                          },
                        }}
                      />
                    </Box>

                    <CardContent sx={{ p: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 2,
                        }}
                      >
                        <Typography
                          variant="h6"
                          fontWeight={700}
                          sx={{ flex: 1 }}
                        >
                          {service.name}
                        </Typography>
                        <Chip
                          label={`${service.successRate}%`}
                          color="success"
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Box>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        mb={3}
                        sx={{
                          lineHeight: 1.6,
                          minHeight: "48px", // Đảm bảo chiều cao đồng nhất
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {service.shortDescription}
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <Box>
                          <Typography
                            variant="h5"
                            color="primary"
                            fontWeight={700}
                          >
                            {service.price.toLocaleString()}đ
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            / lần điều trị
                          </Typography>
                        </Box>
                        {service.duration && (
                          <Typography variant="body2" color="text.secondary">
                            Thời gian: {service.duration}
                          </Typography>
                        )}
                      </Box>

                      <Button
                        variant="contained"
                        fullWidth
                        endIcon={<ArrowForward />}
                        sx={{
                          backgroundColor: "#00B9C6",
                          borderRadius: "25px",
                          py: 1,
                          textTransform: "none",
                          fontWeight: 600,
                          "&:hover": {
                            backgroundColor: "#00A5B5",
                          },
                        }}
                      >
                        Xem chi tiết
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          <Box textAlign="center" mt={6}>
            <Button
              variant="outlined"
              size="large"
              onClick={handleNavigateToServices}
              sx={{
                borderColor: "#00B9C6",
                color: "#00B9C6",
                py: 1.5,
                px: 4,
                borderRadius: "50px",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  backgroundColor: "#00B9C6",
                  color: "white",
                },
              }}
            >
              Xem tất cả dịch vụ
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Doctors Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box textAlign="center" mb={6}>
          <Typography variant="h3" component="h2" fontWeight={700} mb={2}>
            Đội ngũ bác sĩ chuyên khoa
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            maxWidth="600px"
            mx="auto"
          >
            Đội ngũ bác sĩ giàu kinh nghiệm, chuyên môn cao và tận tâm với nghề
          </Typography>
        </Box>

        {loadingDoctors ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress size={60} sx={{ color: "#00B9C6" }} />
          </Box>
        ) : (
          <Grid container spacing={4}>
            {doctors.map((doctor) => (
              <Grid item xs={12} md={4} key={doctor._id}>
                <Card
                  sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
                    },
                    cursor: "pointer",
                  }}
                >
                  <CardMedia
                    component="div"
                    sx={{
                      height: 280,
                      backgroundImage: `url(${doctor.imageUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      position: "relative",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background:
                          "linear-gradient(transparent, rgba(0,0,0,0.7))",
                        color: "white",
                        p: 2,
                      }}
                    >
                      <Typography variant="h6" fontWeight={700}>
                        {doctor.user.userName}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {doctor.specialty}
                      </Typography>
                    </Box>
                  </CardMedia>

                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Kinh nghiệm: {doctor.experience || "10+"} năm
                        </Typography>
                      </Box>
                      <Rating
                        value={doctor.rating || 5}
                        readOnly
                        size="small"
                      />
                    </Box>

                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handleNavigateToAppointment}
                      sx={{
                        backgroundColor: "#00B9C6",
                        borderRadius: "25px",
                        py: 1,
                        textTransform: "none",
                        fontWeight: 600,
                        "&:hover": {
                          backgroundColor: "#00A5B5",
                        },
                      }}
                    >
                      Đặt lịch khám
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Testimonials Section */}
      <Box sx={{ backgroundColor: "#f8fafc", py: 8 }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <Typography variant="h3" component="h2" fontWeight={700} mb={2}>
              Câu chuyện thành công
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              maxWidth="600px"
              mx="auto"
            >
              Những chia sẻ chân thành từ các cặp đôi đã thành công có con
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    height: "100%",
                    borderRadius: 3,
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    transition: "transform 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-5px)",
                    },
                  }}
                >
                  <Box sx={{ mb: 3 }}>
                    <Rating
                      value={testimonial.rating}
                      readOnly
                      sx={{ mb: 2 }}
                    />
                    <Typography
                      variant="body1"
                      sx={{ fontStyle: "italic", lineHeight: 1.6 }}
                    >
                      "{testimonial.content}"
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ bgcolor: "#00B9C6" }}>
                      {testimonial.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {testimonial.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {testimonial.location}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Blog Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box textAlign="center" mb={6}>
          <Typography variant="h3" component="h2" fontWeight={700} mb={2}>
            Blog & Tin tức
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            maxWidth="600px"
            mx="auto"
          >
            Cập nhật những thông tin mới nhất về điều trị hiếm muộn
          </Typography>
        </Box>

        {loadingBlogs ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress size={60} sx={{ color: "#00B9C6" }} />
          </Box>
        ) : (
          <Grid container spacing={4}>
            {blogs.map((blog) => (
              <Grid item xs={12} md={4} key={blog._id}>
                <Card
                  sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
                    },
                    cursor: "pointer",
                  }}
                >
                  <CardMedia
                    component="div"
                    sx={{
                      height: 200,
                      backgroundImage: `url(${blog.featuredImage})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      mb={2}
                      sx={{ lineHeight: 1.4 }}
                    >
                      {blog.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      mb={3}
                      sx={{ lineHeight: 1.6 }}
                    >
                      {blog.excerpt}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {blog.readTime || "5"} phút đọc
                      </Typography>
                      <Button
                        size="small"
                        endIcon={<ArrowForward />}
                        sx={{
                          color: "#00B9C6",
                          textTransform: "none",
                          fontWeight: 600,
                        }}
                      >
                        Đọc thêm
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Box textAlign="center" mt={6}>
          <Button
            variant="outlined"
            size="large"
            onClick={handleNavigateToBlogs}
            sx={{
              borderColor: "#00B9C6",
              color: "#00B9C6",
              py: 1.5,
              px: 4,
              borderRadius: "50px",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": {
                backgroundColor: "#00B9C6",
                color: "white",
              },
            }}
          >
            Xem tất cả bài viết
          </Button>
        </Box>
      </Container>

      {/* Contact CTA */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #00B9C6 0%, #00A5B5 100%)",
          color: "white",
          py: 8,
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" component="h2" fontWeight={700} mb={2}>
            Sẵn sàng bắt đầu hành trình của bạn?
          </Typography>
          <Typography variant="h6" mb={4} sx={{ opacity: 0.9 }}>
            Đừng để thời gian trôi qua, hãy liên hệ với chúng tôi ngay hôm nay
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="center"
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<Schedule />}
              onClick={handleNavigateToAppointment}
              sx={{
                backgroundColor: "white",
                color: "#00B9C6",
                py: 1.5,
                px: 4,
                fontSize: "1.1rem",
                borderRadius: "50px",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Đặt lịch tư vấn
            </Button>

            <Button
              variant="outlined"
              size="large"
              startIcon={<Phone />}
              sx={{
                borderColor: "white",
                color: "white",
                py: 1.5,
                px: 4,
                fontSize: "1.1rem",
                borderRadius: "50px",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.1)",
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Hotline: 1900 1234
            </Button>
          </Stack>
        </Container>
      </Box>

      <Footer />
      <ConsultModal
        open={consultModalOpen}
        onClose={() => setConsultModalOpen(false)}
      />
    </Box>
  );
};

export default HomePage;
