import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Calendar, User, Tag } from "lucide-react";
import './BlogList.css'; // Import regular CSS with prefixed classes
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Sample blog data
const blogPosts = [
  {
    id: 1,
    title: "Công nghệ AI trong chẩn đoán y tế",
    author: "BS. Nguyễn Văn An",
    publishDate: "20 tháng 1, 2024",
    excerpt: "Khám phá cách trí tuệ nhân tạo đang cách mạng hóa việc chẩn đoán bệnh và cải thiện chất lượng chăm sóc sức khỏe.",
    tags: ["Công nghệ", "AI", "Chẩn đoán"],
    category: "Công nghệ"
  },
  {
    id: 2,
    title: "Phòng ngừa bệnh tim mạch",
    author: "TS.BS Trần Thị Hoa",
    publishDate: "18 tháng 1, 2024",
    excerpt: "Hướng dẫn chi tiết về cách phòng ngừa các bệnh tim mạch thông qua chế độ ăn uống và lối sống lành mạnh.",
    tags: ["Tim mạch", "Phòng ngừa", "Sức khỏe"],
    category: "Sức khỏe"
  },
  {
    id: 3,
    title: "Nghiên cứu mới về điều trị ung thư",
    author: "GS.TS Lê Minh Đức",
    publishDate: "15 tháng 1, 2024",
    excerpt: "Những tiến bộ mới nhất trong nghiên cứu điều trị ung thư và triển vọng ứng dụng trong thực tiễn lâm sàng.",
    tags: ["Nghiên cứu", "Ung thư", "Điều trị"],
    category: "Nghiên cứu"
  },
  {
    id: 4,
    title: "Chăm sóc sức khỏe tâm thần",
    author: "BS. Phạm Thị Mai",
    publishDate: "12 tháng 1, 2024",
    excerpt: "Tầm quan trọng của việc chăm sóc sức khỏe tâm thần và các phương pháp điều trị hiệu quả.",
    tags: ["Tâm thần", "Chăm sóc", "Điều trị"],
    category: "Sức khỏe"
  },
  {
    id: 5,
    title: "Dinh dưỡng cho người cao tuổi",
    author: "BS. Hoàng Văn Bình",
    publishDate: "10 tháng 1, 2024",
    excerpt: "Những nguyên tắc dinh dưỡng quan trọng giúp người cao tuổi duy trì sức khỏe và chất lượng cuộc sống.",
    tags: ["Dinh dưỡng", "Cao tuổi", "Sức khỏe"],
    category: "Dinh dưỡng"
  },
  {
    id: 6,
    title: "Vaccine và miễn dịch cộng đồng",
    author: "PGS.TS Đỗ Thị Lan",
    publishDate: "8 tháng 1, 2024",
    excerpt: "Vai trò của vaccine trong việc xây dựng miễn dịch cộng đồng và bảo vệ sức khỏe cộng đồng.",
    tags: ["Vaccine", "Miễn dịch", "Y tế công cộng"],
    category: "Y tế công cộng"
  },

  {
    id: 6,
    title: "Vaccine và miễn dịch cộng đồng",
    author: "PGS.TS Đỗ Thị Lan",
    publishDate: "8 tháng 1, 2024",
    excerpt: "Vai trò của vaccine trong việc xây dựng miễn dịch cộng đồng và bảo vệ sức khỏe cộng đồng.",
    tags: ["Vaccine", "Miễn dịch", "Y tế công cộng"],
    category: "Y tế công cộng"
  }
];

const BlogList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(blogPosts.map(post => post.category)))];

  // Filter posts based on search and category
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const currentPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage);

  const handleReadMore = (postId: number) => {
    console.log(`Reading post with ID: ${postId}`);
    // Here you would typically navigate to the full blog post
  };

  return (
   <>
   <Header/>
     <div className="blogList-container">
      <div className="blogList-header">
        <h1 className="blogList-title">Danh sách bài viết</h1>
        <p className="blogList-subtitle">Khám phá những thông tin y tế mới nhất và hữu ích</p>
      </div>

      <div className="blogList-filters">
        <div className="blogList-searchContainer">
          <div className="blogList-searchInputWrapper">
            <Search className="blogList-searchIcon" />
            <Input
              placeholder="Tìm kiếm bài viết..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="blogList-searchInput"
            />
          </div>
        </div>

        <div className="blogList-categoryFilter">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="blogList-categorySelect">
              <SelectValue placeholder="Lọc theo chủ đề" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả chủ đề</SelectItem>
              {categories.filter(cat => cat !== 'all').map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="blogList-grid">
        {currentPosts.map((post) => (
          <Card key={post.id} className="blogList-card">
            <CardHeader className="blogList-cardHeader">
              <div className="blogList-cardMeta">
                <div className="blogList-authorInfo">
                  <User className="blogList-metaIcon" />
                  <span className="blogList-authorName">{post.author}</span>
                </div>
                <div className="blogList-dateInfo">
                  <Calendar className="blogList-metaIcon" />
                  <span className="blogList-publishDate">{post.publishDate}</span>
                </div>
              </div>
              <CardTitle className="blogList-cardTitle">{post.title}</CardTitle>
            </CardHeader>
            
            <CardContent className="blogList-cardContent">
              <CardDescription className="blogList-cardExcerpt">
                {post.excerpt}
              </CardDescription>
              
              <div className="blogList-tagsContainer">
                <Tag className="blogList-tagsIcon" />
                <div className="blogList-tagsList">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="blogList-tagBadge">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="blogList-cardFooter">
              <Button 
                onClick={() => handleReadMore(post.id)}
                className="blogList-readMoreBtn"
                variant="default"
              >
                Đọc thêm
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="blogList-noResults">
          <p>Không tìm thấy bài viết nào phù hợp với tiêu chí tìm kiếm.</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="blogList-pagination">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="blogList-paginationBtn"
          >
            Trang trước
          </Button>
          
          <div className="blogList-pageInfo">
            <span>Trang {currentPage} / {totalPages}</span>
          </div>
          
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="blogList-paginationBtn"
          >
            Trang sau
          </Button>
        </div>
      )}
    </div>
   <Footer/>
   </>
  );
};

export default BlogList;