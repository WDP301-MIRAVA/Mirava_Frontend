import {
  Stethoscope,
  TestTube,
  Syringe,
  Activity,
  Clipboard,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import type { JSX } from "react";

export const mapStatusToDisplayStatus = (
  status: string
): "pending" | "completed" | "in-progress" => {
  switch (status) {
    case "completed":
      return "completed";
    case "in_progress":
      return "in-progress";
    case "planned":
    default:
      return "pending";
  }
};

export const mapTypeToCategory = (type: string): string => {
  switch (type) {
    case "Khám":
      return "Tư vấn";
    case "Xét nghiệm":
      return "Lab";
    case "Thủ thuật":
      return "Thủ thuật";
    case "Siêu âm":
      return "Kiểm tra";
    default:
      return "Tư vấn";
  }
};

export const getStatusIcon = (status: string): JSX.Element => {
  switch (status) {
    case "completed":
      return <CheckCircle className="status-icon completed" size={20} />;
    case "in-progress":
      return <Clock className="status-icon in-progress" size={20} />;
    default:
      return <AlertCircle className="status-icon pending" size={20} />;
  }
};

export const getCategoryIcon = (category: string): JSX.Element => {
  switch (category) {
    case "Tư vấn":
      return <Stethoscope size={16} />;
    case "Lab":
      return <TestTube size={16} />;
    case "Thủ thuật":
      return <Syringe size={16} />;
    case "Kiểm tra":
      return <Activity size={16} />;
    default:
      return <Clipboard size={16} />;
  }
};

export const getCategoryClass = (category: string): string => {
  switch (category) {
    case "Tư vấn":
      return "category-consultation";
    case "Kiểm tra":
      return "category-check";
    case "Thủ thuật":
      return "category-procedure";
    case "Lab":
      return "category-lab";
    default:
      return "category-consultation";
  }
};

export const getMetricFields = (stepName: string): string[] => {
  switch (stepName) {
    case "Khám tư vấn ban đầu":
      return ["Lần khám", "Phác đồ", "Cân nặng (kg)", "Huyết áp"];
    case "Khám theo dõi ngày 1 chu kỳ":
      return ["Ngày chu kỳ", "Nang cơ bản", "Liều thuốc", "E2 (pg/ml)"];
    case "Khám theo dõi ngày 5 chu kỳ":
      return ["Ngày chu kỳ", "Nang lớn nhất", "Điều chỉnh liều", "E2 (pg/ml)"];
    case "Khám theo dõi ngày 8 chu kỳ":
      return ["Ngày chu kỳ", "Nang lớn nhất", "Số nang >12mm", "E2 (pg/ml)"];
    case "Khám theo dõi ngày 10 chu kỳ":
      return ["Ngày chu kỳ", "Nang lớn nhất", "HCG", "Lịch chọc hút"];
    case "Siêu âm noãn":
      return ["Nang trái (mm)", "Nang phải (mm)", "Nội mạc tử cung (mm)"];
    case "Chọc hút noãn":
      return ["Số noãn thu được", "Chất lượng"];
    case "Thụ tinh IVF":
      return ["Tinh trùng sau lọc", "Tỷ lệ thụ tinh (%)"];
    case "Nuôi cấy phôi":
      return ["Số phôi ngày 3", "Số phôi ngày 5", "Chất lượng phôi"];
    case "Chuyển phôi":
      return ["Số phôi chuyển", "Vị trí chuyển", "Độ dày nội mạc (mm)"];
    default:
      return [];
  }
};
