import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  Avatar,
  Chip,
  Button,
  Box,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  InputLabel,
  FormControl,
} from "@mui/material";
import { Search, Person, Tag } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  BlogService,
  type Blog,
  type BlogResponse,
} from "@/services/blog.services";

const BlogList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  const postsPerPage = 10;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryList = await BlogService.getCategories();
        setCategories(categoryList);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const response: BlogResponse = await BlogService.getBlogList(
          currentPage,
          postsPerPage,
          selectedCategory === "all" ? undefined : selectedCategory
        );

        if (response.success) {
          setBlogs(response.data.blogs);
          setTotalPages(response.data.totalPages);
          setTotalCount(response.data.count);
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [currentPage, selectedCategory]);

  const filteredBlogs = blogs.filter((blog) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      blog.title.toLowerCase().includes(searchLower) ||
      blog.excerpt.toLowerCase().includes(searchLower) ||
      (blog.category && blog.category.toLowerCase().includes(searchLower))
    );
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <>
      <Header />
      <Box sx={{ maxWidth: "1200px", margin: "0 auto", padding: 4 }}>
        <Typography variant="h4" fontWeight={700} textAlign="center" mb={3}>
          Danh sách bài viết
        </Typography>
        <Typography
          variant="body1"
          textAlign="center"
          mb={4}
          color="text.secondary"
        >
          Khám phá những thông tin y tế mới nhất và hữu ích
        </Typography>

        <Box display="flex" flexWrap="wrap" gap={2} mb={4}>
          <TextField
            variant="outlined"
            placeholder="Tìm kiếm bài viết..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <Search sx={{ mr: 1 }} /> }}
            sx={{ flexGrow: 1, minWidth: 240 }}
          />

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="category-select-label">Chủ đề</InputLabel>
            <Select
              labelId="category-select-label"
              value={selectedCategory}
              label="Chủ đề"
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
            >
              <MenuItem value="all">Tất cả chủ đề</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : (
          <Box
            display="grid"
            gridTemplateColumns={{
              xs: "1fr",
              sm: "1fr 1fr",
              md: "1fr 1fr 1fr",
            }}
            gap={3}
          >
            {filteredBlogs.map((blog) => (
              <Card
                key={blog._id}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardHeader
                  avatar={
                    <Avatar>
                      <Person />
                    </Avatar>
                  }
                  title={blog.author?.userName || "Mirava"}
                  subheader={formatDate(blog.createdAt)}
                />

                {blog.featuredImage && (
                  <Box
                    component="img"
                    src={blog.featuredImage}
                    alt={blog.title}
                    sx={{ height: 180, width: "100%", objectFit: "cover" }}
                  />
                )}

                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {blog.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {blog.excerpt}
                  </Typography>

                  <Box mt={2} display="flex" flexWrap="wrap" gap={1}>
                    {blog.category && (
                      <Chip label={blog.category} icon={<Tag />} size="small" />
                    )}
                    {blog.viewCount !== undefined && (
                      <Chip
                        label={`${blog.viewCount} lượt xem`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 2 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate(`/blog/${blog._id}`)}
                  >
                    Đọc thêm
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>
        )}
        <Box textAlign="center" mt={4}>
          <Typography variant="body2" color="text.secondary">
            Tổng cộng {totalCount} bài viết - {totalPages} trang
          </Typography>
        </Box>
      </Box>
      <Footer />
    </>
  );
};

export default BlogList;
