import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Box,
  CircularProgress,
} from "@mui/material";
import { MedicalServices, Save, Cancel } from "@mui/icons-material";
import type {
  MedicalHistoryData,
  MedicalHistoryFormData,
} from "./MedicalHistory";

interface MedicalHistoryModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: MedicalHistoryFormData) => Promise<void>;
  medicalHistory: MedicalHistoryData | null;
  loading: boolean;
}

const MedicalHistoryModal: React.FC<MedicalHistoryModalProps> = ({
  open,
  onClose,
  onSubmit,
  medicalHistory,
  loading,
}) => {
  const [formData, setFormData] = useState<MedicalHistoryFormData>({
    diseases: "",
    allergies: "",
    note: "",
  });

  // Cập nhật form data khi modal mở hoặc dữ liệu thay đổi
  useEffect(() => {
    if (open) {
      if (medicalHistory) {
        setFormData({
          diseases: medicalHistory.diseases.join(", "),
          allergies: medicalHistory.allergies.join(", "),
          note: medicalHistory.note,
        });
      } else {
        setFormData({
          diseases: "",
          allergies: "",
          note: "",
        });
      }
    }
  }, [open, medicalHistory]);

  // Xử lý thay đổi form
  const handleInputChange =
    (field: keyof MedicalHistoryFormData) =>
    (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ): void => {
      setFormData({
        ...formData,
        [field]: event.target.value,
      });
    };

  // Xử lý submit
  const handleSubmit = async (): Promise<void> => {
    await onSubmit(formData);
  };

  // Xử lý hủy
  const handleCancel = (): void => {
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <MedicalServices sx={{ mr: 1 }} />
          {medicalHistory ? "Cập nhật tiền sử y tế" : "Tạo mới tiền sử y tế"}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Tiền sử bệnh lý *"
            value={formData.diseases}
            onChange={handleInputChange("diseases")}
            placeholder="Nhập các bệnh lý đã từng mắc, cách nhau bởi dấu phẩy (VD: Bệnh tim, Bệnh sinh sản)"
            multiline
            rows={2}
            inputProps={{ maxLength: 500 }}
            helperText={`${formData.diseases.length}/500 ký tự`}
          />
          <TextField
            fullWidth
            label="Dị ứng"
            value={formData.allergies}
            onChange={handleInputChange("allergies")}
            placeholder="Nhập các loại dị ứng, cách nhau bởi dấu phẩy (VD: Dị ứng hải sản, Dị ứng thuốc)"
            multiline
            rows={2}
            inputProps={{ maxLength: 300 }}
            helperText={`${formData.allergies.length}/300 ký tự`}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleCancel} startIcon={<Cancel />}>
          Hủy bỏ
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.diseases.trim()}
          startIcon={loading ? <CircularProgress size={16} /> : <Save />}
        >
          {medicalHistory ? "Cập nhật" : "Tạo mới"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MedicalHistoryModal;
