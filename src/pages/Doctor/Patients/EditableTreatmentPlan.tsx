import React, { useEffect, useState } from "react";
import TreatmentPlan from "@/pages/Customer/TreatmentPlan/TreatmentPlan";
import EditTreatmentPlanForm from "./EditTreatmentPlanForm";
import axios from "axios";
import "./EditableTreatmentPlan.css";
const EditableTreatmentPlan: React.FC = () => {
  const isDoctor = true;
  const [showEditForm, setShowEditForm] = useState(false);
  const [planId, setPlanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlanId = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const patientId = localStorage.getItem("patientId");

        if (!token || !patientId) {
          console.warn("Thiếu token hoặc patientId");
          setLoading(false);
          return;
        }

        const res = await axios.get(
          "https://mirava-f0rz.onrender.com/api/treatment-plan",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const plan = res.data?.data?.find((item: any) => {
          const itemPatientId =
            typeof item.patient === "string" ? item.patient : item.patient?._id;
          return itemPatientId === patientId;
        });

        if (plan) {
          setPlanId(plan._id);
        } else {
          console.warn(
            "❌ Không tìm thấy kế hoạch điều trị cho bệnh nhân",
            patientId
          );
        }
      } catch (err) {
        console.error("Lỗi lấy kế hoạch:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlanId();
  }, []);

  const handleEditClick = () => {
    setShowEditForm(true);
  };

  if (loading) return <p>⏳ Đang tải dữ liệu...</p>;

  return (
    <div className="editable-treatment-plan-wrapper">
      {isDoctor && (
        <div className="treatment-edit-toolbar">
          {!showEditForm && (
            <button className="edit-plan-button" onClick={handleEditClick}>
              ✏️ Sửa kế hoạch điều trị
            </button>
          )}
        </div>
      )}

      {!showEditForm && <TreatmentPlan />}

      {/* ✅ Hiển thị form khi đã có planId */}
      {showEditForm && planId && (
        <EditTreatmentPlanForm
          planId={planId}
          onCancel={() => {
            setShowEditForm(false);
          }}
        />
      )}

      {/* ⚠️ Nếu không tìm thấy kế hoạch */}
      {showEditForm && !planId && (
        <p style={{ color: "red" }}>
          ❌ Không tìm thấy kế hoạch điều trị cho bệnh nhân này.
        </p>
      )}
    </div>
  );
};

export default EditableTreatmentPlan;
