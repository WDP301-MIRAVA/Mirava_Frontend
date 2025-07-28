import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import type { TestResult } from "../types/testResult.types";

// Hàm xuất PDF cho kết quả xét nghiệm, có ảnh file đính kèm và font to
export const handleDownloadPDF = async (
  result: TestResult,
  getTestPackageName: (result: TestResult) => string,
  getStatusText: (status: string) => string,
  formatDate: (dateString: string) => string,
  patientName?: string,
  patientCode?: string
) => {
  const element = document.createElement("div");
  element.style.padding = "32px";
  element.style.fontSize = "18px";
  element.style.lineHeight = "1.7";
  element.style.maxWidth = "900px";
  element.style.background = "#fff";
  element.innerHTML = `
    <h2 style="font-size:28px;text-align:center;margin-bottom:24px">KẾT QUẢ XÉT NGHIỆM</h2>
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
    <table border="1" cellpadding="12" style="width:100%;margin-top:24px;font-size:17px">
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
        ? `<p style="margin-top:18px"><b>Nhận xét bác sĩ:</b> ${result.doctorNotes}</p>`
        : ""
    }
    ${
      result.recommendations
        ? `<p><b>Khuyến nghị:</b> ${result.recommendations}</p>`
        : ""
    }
    ${
      result.attachments && result.attachments.length > 0
        ? `<div style="margin-top:24px">
            <b>File đính kèm:</b>
            <div style="display:flex;flex-wrap:wrap;gap:16px;margin-top:12px">
              ${result.attachments
                .map((url) =>
                  /\.(jpg|jpeg|png|gif)$/i.test(url)
                    ? `<img src="${url}" style="max-width:320px;max-height:320px;border:1px solid #ccc;padding:4px;background:#fafafa" />`
                    : `<a href="${url}" target="_blank" style="font-size:16px;color:#007bff">Tải file khác</a>`
                )
                .join("")}
            </div>
          </div>`
        : ""
    }
  `;
  document.body.appendChild(element);

  // Đợi ảnh load xong để html2canvas chụp đầy đủ
  const images = Array.from(element.querySelectorAll("img"));
  await Promise.all(
    images.map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete) resolve(true);
          else img.onload = img.onerror = () => resolve(true);
        })
    )
  );

  const canvas = await html2canvas(element, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "p",
    unit: "pt",
    format: "a4",
  });
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  pdf.save(`ket-qua-xet-nghiem-${result._id}.pdf`);
  document.body.removeChild(element);
};
