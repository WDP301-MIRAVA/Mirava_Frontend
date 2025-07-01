import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, ArrowRight } from "lucide-react";

interface Blog {
  id: number;
  title: string;
  author: string;
  publishDate: string;
  excerpt: string;
  tags: string[];
  category: string;
}

interface BlogCardProps {
  blog: Blog;
}

const BlogCard: React.FC<BlogCardProps> = ({ blog }) => {
  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md bg-white">
      <CardHeader className="pb-4">
        <div className="flex flex-wrap gap-2 mb-3">
          {blog.tags.slice(0, 2).map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              {tag}
            </Badge>
          ))}
          {blog.tags.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{blog.tags.length - 2}
            </Badge>
          )}
        </div>
        <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors">
          {blog.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1">
          {blog.excerpt}
        </p>

        <div className="space-y-3 mt-auto">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{blog.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{blog.publishDate}</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full group hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all duration-200"
          >
            Xem thêm
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlogCard;
