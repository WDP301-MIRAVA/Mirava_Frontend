import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./CartPage.css";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { DeleteOutlined, ShoppingCartOutlined } from "@ant-design/icons";

// ✅ Khai báo kiểu dữ liệu rõ ràng
type CartItemType = "service" | "test-package";

interface TestPackageInfo {
  duration: string;
  preparation: string;
  packageType: "male" | "female" | "couple";
  testsCount: number;
}
interface UnknownCartItem {
  id?: string;
  name?: string;
  price?: number;
  discountPrice?: number;
  originalPrice?: number;
  image?: string;
  imageUrl?: string;
  discount?: number;
  salePrice?: number;
  type?: CartItemType;
  quantity?: number;
  addedAt?: string;
  testPackageInfo?: TestPackageInfo;
}
interface CartItem {
  id: string;
  name: string;
  price: number;
  discountPrice: number;
  originalPrice: number;
  image: string;
  type: CartItemType;
  quantity: number;
  addedAt: string;
  testPackageInfo?: TestPackageInfo;
}

const CartPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedCart = localStorage.getItem("cart");

    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart) as UnknownCartItem[];

        if (Array.isArray(parsedCart) && parsedCart.length > 0) {
          const normalizedCart: CartItem[] = parsedCart.map((item) => {
            const discountPrice =
              item.discountPrice ??
              ("discount" in item && typeof item.discount === "number"
                ? item.discount
                : undefined) ??
              ("salePrice" in item && typeof item.salePrice === "number"
                ? item.salePrice
                : undefined) ??
              0;

            const image =
              item.image ??
              ("imageUrl" in item && typeof item.imageUrl === "string"
                ? item.imageUrl
                : "/default-image.jpg");

            const normalizedItem: CartItem = {
              id: item.id ?? "",
              name: item.name ?? "Không rõ tên",
              price: item.price ?? item.originalPrice ?? 0,
              discountPrice,
              originalPrice: item.originalPrice ?? item.price ?? 0,
              image,
              type:
                item.type ??
                (item.testPackageInfo ? "test-package" : "service"),
              quantity: item.quantity ?? 1,
              addedAt: item.addedAt ?? new Date().toISOString(),
              testPackageInfo: item.testPackageInfo,
            };

            return normalizedItem;
          });

          setCartItems(normalizedCart);
          localStorage.setItem("cart", JSON.stringify(normalizedCart));
        } else {
          navigate("/cart");
        }
      } catch (error) {
        console.error("Lỗi khi parse dữ liệu giỏ hàng:", error);
        navigate("/cart");
      }
    } else {
      navigate("/cart");
    }
  }, [navigate]);

  const handleRemoveItem = (id: string) => {
    const updatedCart = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    toast.success("Đã xóa dịch vụ khỏi giỏ hàng!");
    window.dispatchEvent(new Event("storage"));
  };

  const handleCheckout = () => {
    navigate("/unified-checkout");
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const itemPrice = item.discountPrice ?? item.price;
      return total + itemPrice;
    }, 0);
  };

  const getTotalOriginalPrice = () => {
    return cartItems.reduce((total, item) => {
      const itemOriginalPrice = item.originalPrice ?? item.price;
      return total + itemOriginalPrice;
    }, 0);
  };

  const getTotalSavings = () => {
    return getTotalOriginalPrice() - getTotalPrice();
  };

  if (cartItems.length === 0) {
    return (
      <div>
        <Header />
        <div className="cart-empty">
          <div className="cart-empty-content">
            <ShoppingCartOutlined className="cart-empty-icon" />
            <h2>Giỏ hàng trống</h2>
            <p>Bạn chưa có dịch vụ nào trong giỏ hàng</p>
            <button
              className="btn-continue-shopping"
              onClick={() => navigate("/test-services")}
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="cart-page">
        <div className="cart-container">
          <motion.div
            className="cart-header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1>Giỏ hàng của bạn</h1>
            <span className="cart-count">({cartItems.length} dịch vụ)</span>
          </motion.div>

          <div className="cart-content">
            <div className="cart-items">
              {cartItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  className="cart-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="cart-item-image">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="cart-item-info">
                    <h3>{item.name}</h3>
                    <div className="cart-item-prices">
                      <span className="original-price">
                        {(item.originalPrice ?? item.price).toLocaleString(
                          "vi-VN"
                        )}{" "}
                        đ
                      </span>
                      <span className="discount-price">
                        {(item.discountPrice ?? item.price).toLocaleString(
                          "vi-VN"
                        )}{" "}
                        đ
                      </span>
                    </div>
                    <div className="cart-item-savings">
                      Tiết kiệm:{" "}
                      {(
                        (item.originalPrice ?? item.price) -
                        (item.discountPrice ?? item.price)
                      ).toLocaleString("vi-VN")}{" "}
                      đ
                    </div>
                  </div>
                  <button
                    className="btn-remove"
                    onClick={() => handleRemoveItem(item.id)}
                    title="Xóa khỏi giỏ hàng"
                  >
                    <DeleteOutlined />
                  </button>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="cart-summary"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="summary-header">
                <h3>Tổng kết đơn hàng</h3>
              </div>
              <div className="summary-content">
                <div className="summary-row">
                  <span>Tạm tính:</span>
                  <span>
                    {getTotalOriginalPrice().toLocaleString("vi-VN")} đ
                  </span>
                </div>
                <div className="summary-row savings">
                  <span>Tiết kiệm:</span>
                  <span>-{getTotalSavings().toLocaleString("vi-VN")} đ</span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-row total">
                  <span>Tổng cộng:</span>
                  <span>{getTotalPrice().toLocaleString("vi-VN")} đ</span>
                </div>
                <button className="btn-checkout" onClick={handleCheckout}>
                  Tiến hành thanh toán
                </button>
                <button
                  className="btn-continue-shopping-alt"
                  onClick={() => navigate("/test-services")}
                >
                  Tiếp tục mua sắm
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CartPage;
