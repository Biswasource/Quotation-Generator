import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  FileText,
  Settings,
  Download,
  Upload,
  CheckCircle,
} from "lucide-react";
import html2pdf from "html2pdf.js";
import { Link } from "react-router";

const SUPABASE_URL = "https://bwpbffyiggkomneomtch.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3cGJmZnlpZ2drb21uZW9tdGNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MzQ3NjIsImV4cCI6MjA3OTAxMDc2Mn0.KrKtx23tflFy8ehIC_7jKh-Y4NDUNOvgQ9AoMlAu-I0";

class SupabaseClient {
  constructor(url, key) {
    this.url = url;
    this.key = key;
  }

  async fetchJson(path, options = {}) {
    const response = await fetch(`${this.url}/rest/v1${path}`, {
      ...options,
      headers: {
        apikey: this.key,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      try {
        const error = JSON.parse(text);
        throw new Error(error.message || "Request failed");
      } catch (e) {
        throw new Error(text || "Request failed");
      }
    }

    const text = await response.text();
    if (!text) return null;
    return JSON.parse(text);
  }

  async select(table) {
    return this.fetchJson(`/${table}?select=*`);
  }

  async insert(table, data) {
    const result = await this.fetchJson(`/${table}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return Array.isArray(result) ? result : [result];
  }

  async delete(table, id) {
    return this.fetchJson(`/${table}?id=eq.${id}`, {
      method: "DELETE",
    });
  }
}

const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_KEY);

function numberToWords(num) {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  if (num === 0) return "Zero";

  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const hundred = Math.floor(num / 100);
  num %= 100;

  let result = "";

  if (crore > 0) result += convertTwoDigit(crore) + " Crore ";
  if (lakh > 0) result += convertTwoDigit(lakh) + " Lakh ";
  if (thousand > 0) result += convertTwoDigit(thousand) + " Thousand ";
  if (hundred > 0) result += ones[hundred] + " Hundred ";
  if (num > 0) result += convertTwoDigit(num);

  return result.trim() + " Rupees";

  function convertTwoDigit(n) {
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    return tens[Math.floor(n / 10)] + (n % 10 > 0 ? " " + ones[n % 10] : "");
  }
}

export default function QuotationGenerator() {
  const [screen, setScreen] = useState("home");
  const [services, setServices] = useState([]);
  const [clients, setClients] = useState([]);
  const [newService, setNewService] = useState({ name: "", price: "" });
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
  });
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [logoImage, setLogoImage] = useState(null);
  const [signatureImage, setSignatureImage] = useState(null);
  const [billDetails, setBillDetails] = useState({
    invoiceNo: "",
    date: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    notes: "",
    documentTitle: "QUOTATION",
    companyName: "Hyperdigitech Pvt Ltd",
    companyAddress:
      "Plot no-43, TRIFED, Meghdoot Streets, Saheednagar, 751007 Bhubaneswar, Khorda, Odisha, 751007",
    companyEmail: "info@hyperdigitech.com",
    companyPhone: "9337384388",
    companyWebsite: "www.hyperdigitech.com",
    bankName: "Rasmiranjan Mohanty",
    ifscCode: "UBIN0810045",
    accountNo: "100410100084984",
    bankBranch: "Union Bank of India, JATNI INDIA",
    termsAndConditions: `Payment Terms:
Project work will commence only after a minimum of 30% advance payment is received.

The remaining payment milestones will follow as per proposal.

After every event, and approval, Rest amount must be paid Final delivery and Approval.

All payments are non-refundable once work has commenced.

Scope & Revisions:
Work will follow the approved SRS or documentation.<br/> Additional features or major changes will be<br/> charged separately.

Thanks for doing business with us!`,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchServices();
    fetchClients();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await supabase.select("services");
      setServices(data || []);
    } catch (err) {
      setError("Failed to fetch services");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addService = async () => {
    if (!newService.name || !newService.price) {
      setError("Please fill in all service fields");
      return;
    }

    setLoading(true);
    try {
      await supabase.insert("services", {
        name: newService.name,
        price: parseFloat(newService.price),
      });

      setNewService({ name: "", price: "" });
      setError("");
      await fetchServices();
    } catch (err) {
      setError("Failed to add service");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteService = async (id) => {
    setLoading(true);
    try {
      await supabase.delete("services", id);
      setServices(services.filter((s) => s.id !== id));
    } catch (err) {
      setError("Failed to delete service");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    setLoading(true);
    try {
      const data = await supabase.select("clients");
      setClients(data || []);
    } catch (err) {
      setError("Failed to fetch clients");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addClient = async () => {
    if (!newClient.name || !newClient.email) {
      setError("Please fill in name and email");
      return;
    }

    setLoading(true);
    try {
      await supabase.insert("clients", {
        name: newClient.name,
        email: newClient.email,
        phone: newClient.phone,
        company: newClient.company,
        address: newClient.address,
      });

      setNewClient({
        name: "",
        email: "",
        phone: "",
        company: "",
        address: "",
      });
      setError("");
      await fetchClients();
    } catch (err) {
      setError("Failed to add client");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteClient = async (id) => {
    setLoading(true);
    try {
      await supabase.delete("clients", id);
      setClients(clients.filter((c) => c.id !== id));
    } catch (err) {
      setError("Failed to delete client");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleService = (id) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSignatureImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const IMAGEKIT_PUBLIC_KEY = "your_imagekit_public_key";
  const IMAGEKIT_URL_ENDPOINT = "https://ik.imagekit.io/your_account_id";
  const IMAGEKIT_PRIVATE_KEY = "your_imagekit_private_key"; // Store this securely in backend

  const total = selectedServices.reduce((sum, id) => {
    const service = services.find((s) => s.id === id);
    return sum + (service?.price || 0);
  }, 0);

  const uploadPdfToImageKit = async (pdfBlob, fileName) => {
    try {
      const file = new File([pdfBlob], fileName, { type: "application/pdf" });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", fileName);
      formData.append("folder", "/quotations");

      const response = await fetch(`${IMAGEKIT_URL_ENDPOINT}/upload`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(IMAGEKIT_PUBLIC_KEY + ":")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload PDF to ImageKit");
      }

      const data = await response.json();
      return data.url; // Returns the public URL of uploaded PDF
    } catch (err) {
      console.error("ImageKit upload error:", err);
      throw err;
    }
  };

  const generatePdfFromHtml = async (htmlContent, fileName) => {
    return new Promise((resolve, reject) => {
      const element = document.createElement("div");
      element.innerHTML = htmlContent;

      const options = {
        margin: 5,
        filename: fileName,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
      };

      html2pdf()
        .set(options)
        .from(element)
        .toPdf()
        .output("blob")
        .then((blob) => {
          resolve(blob);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };

  // Add this import at the top of your file:
  // import html2pdf from 'html2pdf.js';

  const saveQuotationToSupabase = async (htmlContent) => {
    if (!selectedClient || !selectedClient.id) {
      setError("Please select a client");
      return false;
    }

    if (selectedServices.length === 0) {
      setError("Please select at least one service");
      return false;
    }

    if (!billDetails.invoiceNo || billDetails.invoiceNo.trim() === "") {
      setError("Please enter a quotation number");
      return false;
    }

    try {
      const quotationData = {
        quote_number: billDetails.invoiceNo.trim(),
        client_name: selectedClient.name,
        client_email: selectedClient.email,
        client_phone: selectedClient.phone,
        client_address: selectedClient.address,
        service_description: selectedServices
          .map((id) => services.find((s) => s.id === id)?.name)
          .join(", "),
        quantity: selectedServices.length,
        rate: total / selectedServices.length,
        total_amount: total,
        date: billDetails.date,
        expiry_date: billDetails.dueDate,
        notes: billDetails.notes,
        company_name: billDetails.companyName,
        company_address: billDetails.companyAddress,
        company_email: billDetails.companyEmail,
        company_phone: billDetails.companyPhone,
        company_website: billDetails.companyWebsite,
        bank_name: billDetails.bankName,
        ifsc_code: billDetails.ifscCode,
        account_number: billDetails.accountNo,
        bank_branch: billDetails.bankBranch,
        terms_and_conditions: billDetails.termsAndConditions,
        html_content: htmlContent,
        status: "draft",
      };

      await supabase.insert("quotations", quotationData);

      setSuccess(`Quotation ${billDetails.invoiceNo} saved successfully!`);
      setTimeout(() => setSuccess(""), 5000);
      return true;
    } catch (err) {
      setError(`Failed to save quotation: ${err.message}`);
      console.error(err);
      return false;
    }
  };

  const generatePDF = async () => {
    if (!selectedClient) {
      setError("Please select a client");
      return;
    }

    if (selectedServices.length === 0) {
      setError("Please select at least one service");
      return;
    }

    if (!logoImage) {
      setError("Please upload a company logo");
      return;
    }

    if (!billDetails.invoiceNo) {
      setError("Please enter a quotation number");
      return;
    }

    const totalInWords = numberToWords(Math.floor(total));
    const quotationNumber = billDetails.invoiceNo || "DRAFT";
    const fileName = `Quotation_${quotationNumber}_${selectedClient.name.replace(
      /\s+/g,
      "_"
    )}.html`;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; background: white; }
        
        .page { 
          width: 210mm; 
          height: 297mm; 
          margin: 0 auto; 
          padding: 10mm; 
          background: white;
        }
        
        .header-container { 
          display: flex; 
          justify-content: space-between; 
          align-items: flex-start; 
          border: 2px solid #000;
          padding: 8px;
          margin-bottom: 0;
        }
        
        .logo-box { 
          width: 80px; 
          height: 80px; 
          background: #000;
          display: flex; 
          align-items: center; 
          justify-content: center;
          flex-shrink: 0;
        }
        
        .logo-box img { 
          max-width: 100%; 
          max-height: 100%; 
          object-fit: contain; 
        }
        
        .company-info { 
          flex: 1; 
          padding: 0 15px;
          font-size: 9px;
          line-height: 1.4;
        }
        
        .company-info h1 { 
          font-size: 16px; 
          font-weight: bold; 
          margin-bottom: 2px;
        }
        
        .company-info p { 
          margin: 1px 0;
        }
        
        .quotation-meta { 
          text-align: right;
          font-size: 9px;
          line-height: 1.6;
          min-width: 150px;
        }
        
        .quotation-meta strong { 
          display: inline-block;
          width: 90px;
          text-align: left;
        }
        
        .quotation-title-bar {
          background: #000;
          color: white;
          text-align: center;
          padding: 6px;
          font-size: 14px;
          font-weight: bold;
          letter-spacing: 2px;
          margin-bottom: 0;
        }
        
        .bill-to-section {
          border: 2px solid #000;
          border-top: none;
          padding: 8px;
          margin-bottom: 8px;
          font-size: 9px;
          line-height: 1.5;
        }
        
        .bill-to-section strong {
          display: block;
          margin-bottom: 3px;
          font-size: 10px;
        }
        
        table { 
          width: 100%; 
          border-collapse: collapse; 
          font-size: 9px;
          margin-bottom: 0;
        }
        
        thead { 
          background-color: #000; 
          color: white; 
        }
        
        th { 
          padding: 8px 5px; 
          text-align: center; 
          font-weight: bold; 
          border: 1px solid #000;
          font-size: 9px;
        }
        
        td { 
          padding: 8px 5px; 
          border: 1px solid #000;
          text-align: center;
        }
        
        .service-col { text-align: left; }
        .amount-col { text-align: right; }
        
        tbody tr {
          height: 100px;
          vertical-align: top;
        }
        
        .total-row td {
          height: auto;
          padding: 6px 5px;
          font-weight: bold;
        }
        
        .tax-section {
          border: 2px solid #000;
          border-top: none;
          margin-bottom: 8px;
        }
        
        .tax-row {
          display: flex;
          border-bottom: 1px solid #000;
          font-size: 9px;
        }
        
        .tax-row:last-child {
          border-bottom: none;
        }
        
        .tax-cell {
          padding: 6px 8px;
          border-right: 1px solid #000;
          text-align: center;
        }
        
        .tax-cell:last-child {
          border-right: none;
        }
        
        .tax-header {
          background: #000;
          color: white;
          font-weight: bold;
        }
        
        .tax-label {
          width: 15%;
          text-align: left;
        }
        
        .tax-value {
          width: 17%;
        }
        
        .tax-rate {
          width: 10%;
        }
        
        .tax-amount {
          width: 15%;
          text-align: right;
        }
        
        .total-amount {
          width: 18%;
          text-align: right;
        }
        
        .amount-in-words {
          border: 2px solid #000;
          border-top: none;
          padding: 6px 8px;
          margin-bottom: 8px;
          font-size: 9px;
        }
        
        .amount-in-words strong {
          display: block;
          margin-bottom: 2px;
        }
        
        .bottom-section {
          display: flex;
          gap: 8px;
          font-size: 9px;
        }
        
        .bank-details, .terms-conditions {
          flex: 1;
          border: 2px solid #000;
          padding: 8px;
        }
        
        .bank-details h3, .terms-conditions h3 {
          font-size: 10px;
          margin-bottom: 6px;
          text-decoration: underline;
        }
        
        .bank-details p, .terms-conditions p {
          margin: 3px 0;
          line-height: 1.4;
        }
        
        .terms-conditions {
          position: relative;
        }
        
        .signature-box {
          position: absolute;
          right: 8px;
          margin-top:200px;
          bottom: 20px;
          text-align: center;
          font-size: 8px;
        }
        
        .signature-box img {
          max-width: 100px;
          max-height: 50px;
          margin-bottom: 3px;
        }
        
        .signature-line {
          border-top: 1px solid #000;
          padding-top: 3px;
          margin-top: 5px;
          font-weight: bold;
        }
        
        @media print {
          body { 
            margin: 0; 
            padding: 0; 
            background: white;
          }
          .page { 
            margin: 0;
            page-break-after: always;
          }
        }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="header-container">
          <div class="logo-box">
            <img src="${logoImage}" alt="Logo">
          </div>
          
          <div class="company-info">
            <h1>${billDetails.companyName}</h1>
            <p>${billDetails.companyAddress}</p>
            <p>Mobile: ${billDetails.companyPhone}</p>
            <p>Email: ${billDetails.companyEmail}</p>
            <p>Website: ${billDetails.companyWebsite}</p>
          </div>
          
          <div class="quotation-meta">
            <p><strong>Quotation No.</strong> ${
              billDetails.invoiceNo || "DRAFT"
            }</p>
            <p><strong>Quotation Date</strong> ${billDetails.date}</p>
            <p><strong>Expiry Date</strong> ${billDetails.dueDate}</p>
          </div>
        </div>
        
        <div class="quotation-title-bar">${billDetails.documentTitle}</div>
        
        <div class="bill-to-section">
          <strong>BILL TO</strong>
          <p>${selectedClient.name}</p>
          <p>Mobile: ${selectedClient.phone}</p>
          <p>email: ${selectedClient.email}</p>
          <p>Address: ${selectedClient.address}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th style="width: 8%;">S.NO.</th>
              <th style="width: 52%;">SERVICES</th>
              <th style="width: 10%;">QTY</th>
              <th style="width: 15%;">RATE</th>
              <th style="width: 15%;">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            ${selectedServices
              .map((id, index) => {
                const service = services.find((s) => s.id === id);
                return `
            <tr>
              <td>${index + 1}</td>
              <td class="service-col">${service.name}</td>
              <td>1 PCS</td>
              <td>${service.price.toLocaleString("en-IN")}</td>
              <td class="amount-col">${service.price.toLocaleString(
                "en-IN"
              )}</td>
            </tr>`;
              })
              .join("")}
            <tr class="total-row">
              <td colspan="3"></td>
              <td><strong>TOTAL</strong></td>
              <td class="amount-col"><strong>₹ ${total.toLocaleString(
                "en-IN"
              )}</strong></td>
            </tr>
          </tbody>
        </table>
        
        <div class="tax-section">
          <div class="tax-row tax-header">
            <div class="tax-cell tax-label">HSN/SAC</div>
            <div class="tax-cell tax-value">Taxable Value</div>
            <div class="tax-cell tax-rate">Rate</div>
            <div class="tax-cell tax-amount" style="width: 12%;">CGST<br>Amount</div>
            <div class="tax-cell tax-rate">Rate</div>
            <div class="tax-cell tax-amount" style="width: 12%;">SGST<br>Amount</div>
            <div class="tax-cell total-amount">Total Tax Amount</div>
          </div>
          <div class="tax-row">
            <div class="tax-cell tax-label"></div>
            <div class="tax-cell tax-value">${total.toLocaleString(
              "en-IN"
            )}</div>
            <div class="tax-cell tax-rate">0%</div>
            <div class="tax-cell tax-amount" style="width: 12%;">0</div>
            <div class="tax-cell tax-rate">0%</div>
            <div class="tax-cell tax-amount" style="width: 12%;">0</div>
            <div class="tax-cell total-amount">₹ 0</div>
          </div>
          <div class="tax-row">
            <div class="tax-cell tax-label"><strong>Total</strong></div>
            <div class="tax-cell tax-value"><strong>${total.toLocaleString(
              "en-IN"
            )}</strong></div>
            <div class="tax-cell tax-rate"></div>
            <div class="tax-cell tax-amount" style="width: 12%;"><strong>0</strong></div>
            <div class="tax-cell tax-rate"></div>
            <div class="tax-cell tax-amount" style="width: 12%;"><strong>0</strong></div>
            <div class="tax-cell total-amount"><strong>₹ 0</strong></div>
          </div>
        </div>
        
        <div class="amount-in-words">
          <strong>Total Amount (in words)</strong>
          <p>${totalInWords}</p>
        </div>
        
        <div class="bottom-section">
          <div class="bank-details">
            <h3>Bank Details</h3>
            <p><strong>Name:</strong> ${billDetails.bankName}</p>
            <p><strong>IFSC Code:</strong> ${billDetails.ifscCode}</p>
            <p><strong>Account No:</strong> ${billDetails.accountNo}</p>
            <p><strong>Bank:</strong> ${billDetails.bankBranch}</p>
          </div>
          
          <div class="terms-conditions">
            <h3>Terms and Conditions</h3>
            <p style="white-space: pre-line;">${
              billDetails.termsAndConditions
            }</p>
            
            <div class="signature-box">
              ${
                signatureImage
                  ? `<img src="${signatureImage}" alt="Signature">`
                  : '<div style="height: 50px;"></div>'
              }
              <div class="signature-line">Authorised Signatory For<br>${
                billDetails.companyName
              }</div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

    setLoading(true);
    try {
      // Save to Supabase
      const saved = await saveQuotationToSupabase(htmlContent);

      if (saved) {
        // Convert HTML to PDF and download
        const element = document.createElement("div");
        element.innerHTML = htmlContent;

        const options = {
          margin: 5,
          filename: fileName.replace(".html", ".pdf"),
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
        };

        html2pdf().set(options).from(element).save();
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">
            Quotation Generator
          </h1>
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => setScreen("home")}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                screen === "home"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setScreen("services")}
              className={`px-6 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
                screen === "services"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Settings size={18} /> Services
            </button>
            <button
              onClick={() => setScreen("clients")}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                screen === "clients"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Clients
            </button>
            <button
              onClick={() => setScreen("generate")}
              className={`px-6 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
                screen === "generate"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <FileText size={18} /> Generate
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex justify-between items-center">
            {error}
            <button
              onClick={() => setError("")}
              className="text-red-900 font-bold text-xl hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2">
            <CheckCircle size={20} />
            {success}
          </div>
        )}

        {screen === "home" && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome</h2>
            <p className="text-gray-600 mb-6">
              Create professional quotations with your company logo. Start by
              adding services, then manage clients, and finally generate PDF
              quotations. All quotations are automatically saved to the
              database.
            </p>

            <Link to="/dashboard">
              <button className="bg-blue-700 px-4 py-2 text-white rounded-2xl">
                Dashboard
              </button>
            </Link>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Services: {services.length}
                </h3>
                <p className="text-sm text-gray-700">
                  Add your tech services with pricing
                </p>
              </div>
              <div className="bg-indigo-50 p-6 rounded-lg">
                <h3 className="font-semibold text-indigo-900 mb-2">
                  Clients: {clients.length}
                </h3>
                <p className="text-sm text-gray-700">
                  Store client details for quick access
                </p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2">Generate</h3>
                <p className="text-sm text-gray-700">
                  Create professional PDFs with logo
                </p>
              </div>
            </div>
          </div>
        )}

        {screen === "services" && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Manage Services
            </h2>

            <div className="mb-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-4">
                Add New Service
              </h3>
              <div className="flex gap-4 flex-wrap">
                <input
                  type="text"
                  placeholder="Service name"
                  value={newService.name}
                  onChange={(e) =>
                    setNewService({ ...newService, name: e.target.value })
                  }
                  className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={newService.price}
                  onChange={(e) =>
                    setNewService({ ...newService, price: e.target.value })
                  }
                  className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addService}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Plus size={18} /> Add
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {services.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No services added yet
                </p>
              ) : (
                services.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between bg-gray-50 p-4 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">
                        {service.name}
                      </p>
                      <p className="text-gray-600">
                        ₹{service.price.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteService(service.id)}
                      disabled={loading}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {screen === "clients" && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Manage Clients
            </h2>

            <div className="mb-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-4">
                Add New Client
              </h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Client name"
                  value={newClient.name}
                  onChange={(e) =>
                    setNewClient({ ...newClient, name: e.target.value })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newClient.email}
                  onChange={(e) =>
                    setNewClient({ ...newClient, email: e.target.value })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={newClient.phone}
                  onChange={(e) =>
                    setNewClient({ ...newClient, phone: e.target.value })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Company"
                  value={newClient.company}
                  onChange={(e) =>
                    setNewClient({ ...newClient, company: e.target.value })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Address"
                  value={newClient.address}
                  onChange={(e) =>
                    setNewClient({ ...newClient, address: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={addClient}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                <Plus size={18} /> Add Client
              </button>
            </div>

            <div className="space-y-3">
              {clients.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No clients added yet
                </p>
              ) : (
                clients.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between bg-gray-50 p-4 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">
                        {client.name}
                      </p>
                      <p className="text-sm text-gray-600">{client.company}</p>
                      <p className="text-sm text-gray-600">
                        {client.email} | {client.phone}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteClient(client.id)}
                      disabled={loading}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {screen === "generate" && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Generate Quotation
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-lg text-gray-800 mb-4">
                  Company Logo
                </h3>
                <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                  {logoImage ? (
                    <div className="text-center">
                      <img
                        src={logoImage}
                        alt="Logo Preview"
                        className="w-full h-40 object-contain mb-4"
                      />
                      <button
                        onClick={() => setLogoImage(null)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                      >
                        Remove Logo
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center cursor-pointer py-6">
                      <Upload size={32} className="text-gray-400 mb-2" />
                      <p className="text-gray-600 text-sm text-center">
                        Click to upload logo
                        <br />
                        (PNG, JPG, SVG)
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <h3 className="font-semibold text-lg text-gray-800 mb-4">
                  Signature Image
                </h3>
                <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                  {signatureImage ? (
                    <div className="text-center">
                      <img
                        src={signatureImage}
                        alt="Signature Preview"
                        className="w-full h-24 object-contain mb-4"
                      />
                      <button
                        onClick={() => setSignatureImage(null)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                      >
                        Remove Signature
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center cursor-pointer py-4">
                      <Upload size={24} className="text-gray-400 mb-2" />
                      <p className="text-gray-600 text-sm text-center">
                        Click to upload signature
                        <br />
                        (PNG, JPG)
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSignatureUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <h3 className="font-semibold text-lg text-gray-800 mb-4">
                  Company Details
                </h3>
                <div className="space-y-3 mb-6">
                  <input
                    type="text"
                    placeholder="Company Name"
                    value={billDetails.companyName}
                    onChange={(e) =>
                      setBillDetails({
                        ...billDetails,
                        companyName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    placeholder="Company Address"
                    value={billDetails.companyAddress}
                    onChange={(e) =>
                      setBillDetails({
                        ...billDetails,
                        companyAddress: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                  />
                  <input
                    type="email"
                    placeholder="Company Email"
                    value={billDetails.companyEmail}
                    onChange={(e) =>
                      setBillDetails({
                        ...billDetails,
                        companyEmail: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="tel"
                    placeholder="Company Phone"
                    value={billDetails.companyPhone}
                    onChange={(e) =>
                      setBillDetails({
                        ...billDetails,
                        companyPhone: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <h3 className="font-semibold text-lg text-gray-800 mb-4">
                  Bank Details
                </h3>
                <div className="space-y-3 mb-6">
                  <input
                    type="text"
                    placeholder="Account Holder Name"
                    value={billDetails.bankName}
                    onChange={(e) =>
                      setBillDetails({
                        ...billDetails,
                        bankName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="IFSC Code"
                    value={billDetails.ifscCode}
                    onChange={(e) =>
                      setBillDetails({
                        ...billDetails,
                        ifscCode: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Account Number"
                    value={billDetails.accountNo}
                    onChange={(e) =>
                      setBillDetails({
                        ...billDetails,
                        accountNo: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Bank & Branch"
                    value={billDetails.bankBranch}
                    onChange={(e) =>
                      setBillDetails({
                        ...billDetails,
                        bankBranch: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <h3 className="font-semibold text-lg text-gray-800 mb-4">
                  Quotation Details
                </h3>
                <div className="space-y-3 mb-6">
                  <input
                    type="text"
                    placeholder="Quotation Number"
                    value={billDetails.invoiceNo}
                    onChange={(e) =>
                      setBillDetails({
                        ...billDetails,
                        invoiceNo: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Quotation Date
                      </label>
                      <input
                        type="date"
                        value={billDetails.date}
                        onChange={(e) =>
                          setBillDetails({
                            ...billDetails,
                            date: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="date"
                        value={billDetails.dueDate}
                        onChange={(e) =>
                          setBillDetails({
                            ...billDetails,
                            dueDate: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-gray-800 mb-4">
                  Select Client
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 mb-6">
                  {clients.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      No clients available
                    </p>
                  ) : (
                    clients.map((client) => (
                      <label
                        key={client.id}
                        className="flex items-center p-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 transition"
                      >
                        <input
                          type="radio"
                          name="client"
                          checked={selectedClient?.id === client.id}
                          onChange={() => setSelectedClient(client)}
                          className="mr-3"
                        />
                        <div className="text-sm">
                          <p className="font-semibold text-gray-800">
                            {client.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {client.phone}
                          </p>
                        </div>
                      </label>
                    ))
                  )}
                </div>
                <h3 className="font-semibold text-lg text-gray-800 mb-4">
                  Document Settings
                </h3>
                <div className="space-y-3 mb-6">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Document Title (Header)
                    </label>
                    <input
                      type="text"
                      placeholder="QUOTATION"
                      value={billDetails.documentTitle}
                      onChange={(e) =>
                        setBillDetails({
                          ...billDetails,
                          documentTitle: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Terms and Conditions
                    </label>
                    <textarea
                      placeholder="Enter terms and conditions..."
                      value={billDetails.termsAndConditions}
                      onChange={(e) =>
                        setBillDetails({
                          ...billDetails,
                          termsAndConditions: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                    />
                  </div>
                </div>
                <h3 className="font-semibold text-lg text-gray-800 mb-4">
                  Select Services
                </h3>
                <div className="space-y-2 mb-6 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {services.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      No services available
                    </p>
                  ) : (
                    services.map((service) => (
                      <label
                        key={service.id}
                        className="flex items-center p-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 transition"
                      >
                        <input
                          type="checkbox"
                          checked={selectedServices.includes(service.id)}
                          onChange={() => toggleService(service.id)}
                          className="mr-3"
                        />
                        <div className="flex-1 text-sm">
                          <p className="font-semibold text-gray-800">
                            {service.name}
                          </p>
                        </div>
                        <p className="text-blue-600 font-semibold text-sm">
                          ₹{service.price.toLocaleString("en-IN")}
                        </p>
                      </label>
                    ))
                  )}
                </div>

                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <div className="flex justify-between mb-2 text-sm">
                    <span className="text-gray-700">Subtotal:</span>
                    <span className="font-semibold">
                      ₹{total.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2 pb-2 border-b border-blue-200 text-sm">
                    <span className="text-gray-700">Tax (0%):</span>
                    <span className="font-semibold">₹0</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="font-bold text-gray-800">Total:</span>
                    <span className="font-bold text-blue-600">
                      ₹{total.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <button
                  onClick={generatePDF}
                  className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  disabled={loading}
                >
                  <Download size={20} />{" "}
                  {loading
                    ? "Saving & Downloading..."
                    : "Download HTML Quotation"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
