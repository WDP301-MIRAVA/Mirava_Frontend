import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import type { TestResult } from "../types/testResult.types";

// Hàm xuất PDF cho kết quả xét nghiệm
export const handleDownloadPDF = async (
  result: TestResult,
  getTestPackageName: (result: TestResult) => string,
  getStatusText: (status: string) => string,
  formatDate: (dateString: string) => string,
  patientName?: string,
  patientCode?: string
) => {
  const element = document.createElement("div");
  element.style.padding = "24px";
  element.innerHTML = `
    <h2>KẾT QUẢ XÉT NGHIỆM</h2>
    ${patientName ? `<p><b>Tên bệnh nhân:</b> ${patientName}</p>` : ""}
    <p><b>Tên gói:</b> ${getTestPackageName(result)}</p>
    <p><b>Ngày xét nghiệm:</b> ${formatDate(result.testDate)}</p>
     ${
       result.performedBy?.user?.userName
         ? `<p><b>Bác sĩ thực hiện:</b> ${result.performedBy.user.userName}</p>`
         : ""
     }
     ${patientCode ? `<p><b>Mã BN:</b> ${patientCode}</p>` : ""}
    <p><b>Tình trạng tổng quát:</b> ${getStatusText(result.overallStatus)}</p>

    <table border="1" cellpadding="8" style="width:100%;margin-top:16px">
      <thead>
        <tr>
          <th>Tên xét nghiệm</th>
          <th>Kết quả</th>
          <th>Đơn vị</th>
          <th>Giá trị bình thường</th>
          <th>Trạng thái</th>
        </tr>
      </thead>
      <tbody>
        ${result.results
          .map(
            (r) =>
              `<tr>
                <td>${r.testName}</td>
                <td>${r.value}</td>
                <td>${r.unit}</td>
                <td>${r.normalRange}</td>
                <td>${getStatusText(r.status)}</td>
              </tr>`
          )
          .join("")}
      </tbody>
    </table>
    ${
      result.doctorNotes
        ? `<p><b>Nhận xét bác sĩ:</b> ${result.doctorNotes}</p>`
        : ""
    }
    ${
      result.recommendations
        ? `<p><b>Khuyến nghị:</b> ${result.recommendations}</p>`
        : ""
    }
  `;
  document.body.appendChild(element);

  const canvas = await html2canvas(element);
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF();
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  pdf.save(`ket-qua-xet-nghiem-${result._id}.pdf`);
  document.body.removeChild(element);
};
