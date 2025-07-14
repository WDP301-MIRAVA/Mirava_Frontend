import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button as MuiButton,
} from "@mui/material";
import toast from "react-hot-toast";

interface ConsultModalProps {
  open: boolean;
  onClose: () => void;
}

const ConsultModal: React.FC<ConsultModalProps> = ({ open, onClose }) => {
  const [phoneNumber, setPhoneNumber] = React.useState("");

  const handleSubmit = () => {
    if (/^\d{10,11}$/.test(phoneNumber)) {
      toast.success("Đăng ký thành công với số: " + phoneNumber);
      setPhoneNumber("");
      onClose();
    } else {
      toast.error("Vui lòng nhập số điện thoại hợp lệ");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: 2,
          width: 400,
          maxWidth: "90%",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          fontSize: "1.5rem",
          textAlign: "center",
          pb: 0,
        }}
      >
        📞 Đăng ký tư vấn
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <TextField
          autoFocus
          margin="dense"
          label="Số điện thoại của bạn"
          placeholder="Nhập số điện thoại (10-11 số)"
          type="tel"
          fullWidth
          variant="outlined"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          sx={{
            borderRadius: 2,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
        />
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 2,
          justifyContent: "space-between",
        }}
      >
        <MuiButton
          onClick={onClose}
          variant="outlined"
          color="inherit"
          sx={{
            borderRadius: "20px",
            textTransform: "none",
            px: 3,
          }}
        >
          Hủy
        </MuiButton>
        <MuiButton
          variant="contained"
          onClick={handleSubmit}
          sx={{
            borderRadius: "20px",
            textTransform: "none",
            backgroundColor: "#00B9C6",
            "&:hover": {
              backgroundColor: "#00A5B5",
            },
            px: 4,
          }}
        >
          Gửi
        </MuiButton>
      </DialogActions>
    </Dialog>
  );
};

export default ConsultModal;
