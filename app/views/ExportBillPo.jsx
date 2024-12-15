// instal dulu "jspdf": "^2.5.2",
import jsPDF from 'jspdf';
import { formatBasicDate } from "@utils/formatDate.js";
import { formatPrice } from "@utils/formatPrice.js";
const ExportBillPo = ({
  vendorName,
  vendorstreet,
  VendorZip,
  vendorCity,
  vendorState,
  vendorPhone,
  vendorEmail,
  due_date,
  transactionType,
  invReference,
  invDate,
  accountingDate,
  dataArr,
  dataTotal,
  payment_date,
  payment_amount,
  amount_due
}) => {
  const doc = new jsPDF({
    orientation: "P",
    unit: "cm",
    format: "A4"
  });
  const contentHTML = `
<div class="mx-auto max-w-3xl bg-white shadow-lg p-6" id="invoice ">
  <!-- Header -->
        <h1 class="text-2xl font-bold">F&F</h1>
  <div class="flex justify-between items-center mb-4">
    <div>
      <p class="text-sm text-gray-500 mt-1">
        Office 149, 450 South Brand Brooklyn<br />
        San Diego County, CA 91905, USA<br />
        +1 (123) 456 7891, +44 (876) 543 2198
      </p>
    </div>
    <div class="text-sm">
      <p class="text-gray-600 font-semibold">${transactionType}/${invReference}</p>
      <p class="text-sm text-gray-500">Bill Date:${formatBasicDate(invDate)} </p>
      <p class="text-sm text-gray-500">Accounting Date: ${formatBasicDate(accountingDate)}</p>
    </div>
  </div>

  <!-- Vendor and Due Date -->
  <div class="flex justify-between border-t border-b py-4 mb-4 text-sm">
    <div>
      <p class="text-gray-600 font-semibold">Vendor:</p>
      <p class="text-gray-500">${vendorName}</p>
      <p class="text-gray-500">${vendorstreet}</p>
      <p class="text-gray-500">${VendorZip}, ${vendorState}, ${vendorCity}</p>
      <p class="text-gray-500">${vendorPhone ? vendorPhone : "-"}</p>
      <p class="text-gray-500">${vendorEmail}</p>
    </div>
    <div>
      <p class="text-gray-600 font-semibold">Due Date:</p>
      <p class="text-gray-500">${formatBasicDate(due_date)}</p>
    </div>
  </div>

  <!-- Table -->
  <div class="mt-6">
    <table class="w-full border-collapse border-t text-gray-700">
      <thead>
        <tr class="border-b bg-gray-100 text-sm capitalize">
          <th class="p-2 text-left">Description</th>
          <th class="p-2 text-left">Taxes</th>
          <th class="p-2 text-left">Date Req.</th>
          <th class="p-2 text-left">Qty</th>
          <th class="p-2 text-left">Unit Price</th>
          <th class="p-2 text-left">Amount</th>
        </tr>
      </thead>
      <tbody>
       ${dataArr.map(item => `
        <tr class="border-b text-sm">
          <td class="p-2" >${item.description}</td>
          <td class="p-2">${item.tax} %</td>
          <td class="p-2">${invDate}</td>
          <td class="p-2">${item.qty_invoiced}</td>
          <td class="p-2">${item.unit_price}</td>
          <td class="p-2">${formatPrice(item.subtotal)}</td>
        </tr>
      `).join('')}
      </tbody >
    </table >
  </div >

  <div class="flex justify-end text-sm">
    <div class="">
      <div class="flex justify-between">
        <p class="text-gray-600 font-semibold">Total:</p>
        <p class="text-lg font-sm text-gray-700">${formatPrice(dataTotal)}</p>
      </div>
      <div class="flex justify-between">
        <p class="text-gray-500 italic">Paid on ${formatBasicDate(payment_date)}</p>
        <p class="text-gray-500">${formatPrice(payment_amount)}</p>
      </div>
      <div class="flex justify-between mt-2">
        <p class="text-gray-600 font-semibold">Amount Due:</p>
        <p class="text-lg font-semibold text-green-600">${formatPrice(amount_due)}</p>
      </div>
    </div>
    <div style="display: flex; position:absolute; ">
        <span style="
        margin-right:80px;
        margin-top:30px;
            font-weight: bold;
            font-size: 30px;
            color: green;
            opacity: 0.5;
        ">
            PAID
        </span>
    </div>
  </div>
</div >
  `;
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = contentHTML;
  document.body.appendChild(tempDiv);

  const pageWidth = 21; // A4 width dalam cm
  const pageHeight = 29.7; // A4 height dalam cm
  const contentWidth = 20; // Lebar konten
  const contentHeight = 30; // Tinggi konten
  const xPos = (pageWidth - contentWidth) / 2;
  const yPos = (pageHeight - contentHeight) / 2;

  doc.html(tempDiv, {
    callback: (doc) => {
      document.body.removeChild(tempDiv); // Hapus elemen sementara
      doc.setFontSize(10);
      doc.save('exported-bill-po.pdf'); // Simpan PDF
    },
    x: xPos, // Posisi horizontal
    y: yPos, // Posisi vertikal
    width: contentWidth, // Lebar konten
    windowWidth: 675 // Simulasi lebar viewport
  });


}

export default ExportBillPo