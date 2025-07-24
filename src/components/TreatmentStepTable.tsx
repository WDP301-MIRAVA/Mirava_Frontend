import React from "react";
import { Calendar, User, Edit3, Eye } from "lucide-react";
import type { TreatmentStep } from "@/types/treatment.types";
import {
  getStatusIcon,
  getCategoryClass,
  getCategoryIcon,
} from "../utils/ivfHelpers";

interface TreatmentStepTableProps {
  steps: TreatmentStep[];
  drafts: { [key: string]: any };
  updating: boolean;
  onToggleStatus: (stepId: string) => void;
  onOpenForm: (stepId: string) => void;
  onOpenMedicalRecord: (step: TreatmentStep) => void;
}

const TreatmentStepTable: React.FC<TreatmentStepTableProps> = ({
  steps,
  drafts,
  updating,
  onToggleStatus,
  onOpenForm,
  onOpenMedicalRecord,
}) => {
  return (
    <div className="ivf-table-wrapper">
      <table className="ivf-table">
        <thead>
          <tr>
            <th>Trạng thái</th>
            <th>Bước điều trị</th>
            <th>Giai đoạn</th>
            <th>Ngày thực hiện</th>
            <th>Người thực hiện</th>
            <th>Ghi chú</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {steps.map((step) => (
            <tr key={step.id} className={`ivf-table-row ${step.status}`}>
              <td>
                <button
                  className="ivf-status-btn"
                  onClick={() => onToggleStatus(step.id)}
                  title="Đổi trạng thái"
                  disabled={updating}
                >
                  {getStatusIcon(step.status)}
                </button>
              </td>
              <td>
                <div className="ivf-step-info">
                  <div className="ivf-step-name">{step.name}</div>
                  <div
                    className={`ivf-category-badge ${getCategoryClass(
                      step.category
                    )}`}
                  >
                    {getCategoryIcon(step.category)}
                    <span>{step.category}</span>
                  </div>
                  {drafts[step.id] && (
                    <span className="ivf-draft-badge">Draft</span>
                  )}
                </div>
              </td>
              <td>
                {step.stage && (
                  <span className="ivf-stage-badge">{step.stage}</span>
                )}
              </td>
              <td>
                {step.executionDate ? (
                  <div className="ivf-date-info">
                    <Calendar size={16} />
                    <span>{step.executionDate}</span>
                  </div>
                ) : (
                  <span className="ivf-no-data-text">Chưa thực hiện</span>
                )}
              </td>
              <td>
                {step.performedBy ? (
                  <div className="ivf-user-info">
                    <User size={16} />
                    <span>{step.performedBy}</span>
                  </div>
                ) : (
                  <span className="ivf-no-data-text">-</span>
                )}
              </td>
              <td>
                <div className="ivf-notes">
                  {step.description ? (
                    <span className="ivf-notes-text">{step.description}</span>
                  ) : (
                    <span className="ivf-no-data-text">Chưa có ghi chú</span>
                  )}
                </div>
              </td>
              <td>
                <div className="ivf-action-buttons">
                  <button
                    onClick={() => onOpenMedicalRecord(step)}
                    className="ivf-action-btn ivf-edit-btn"
                    title="Chỉnh sửa"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => onOpenForm(step.id)}
                    className="ivf-action-btn ivf-record-btn"
                    title="Xem"
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TreatmentStepTable;
