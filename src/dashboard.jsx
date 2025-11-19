import React, { useState, useEffect } from "react";
import {
  Eye,
  Download,
  Trash2,
  TrendingUp,
  Users,
  FileText,
  DollarSign,
  Edit,
} from "lucide-react";

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

  async select(table, orderBy = null) {
    let query = `/${table}?select=*`;
    if (orderBy) {
      query += `&order=${orderBy}`;
    }
    return this.fetchJson(query);
  }

  async update(table, id, data) {
    return this.fetchJson(`/${table}?id=eq.${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async delete(table, id) {
    return this.fetchJson(`/${table}?id=eq.${id}`, {
      method: "DELETE",
    });
  }
}

const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_KEY);

const STATUS_COLORS = {
  draft: "#94a3b8",
  pending: "#f59e0b",
  approved: "#10b981",
  rejected: "#ef4444",
};

// Bar Chart Component
function BarChart({ data, height = 300 }) {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.amount));
  const padding = 40;
  const chartWidth = 500;
  const chartHeight = height;
  const barWidth = chartWidth / data.length;

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
    >
      {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
        <line
          key={i}
          x1={padding}
          y1={chartHeight - padding - ratio * (chartHeight - padding * 2)}
          x2={chartWidth - padding}
          y2={chartHeight - padding - ratio * (chartHeight - padding * 2)}
          stroke="#e5e7eb"
          strokeWidth="1"
        />
      ))}

      {data.map((item, i) => {
        const barHeight =
          ((item.amount || 0) / maxValue) * (chartHeight - padding * 2);
        const x = padding + i * barWidth + 10;
        const y = chartHeight - padding - barHeight;

        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barWidth - 20}
              height={barHeight}
              fill="#10b981"
              rx="4"
            />
            <text
              x={x + (barWidth - 20) / 2}
              y={chartHeight - 10}
              textAnchor="middle"
              fontSize="12"
              fill="#666"
            >
              {item.name.substring(0, 8)}
            </text>
          </g>
        );
      })}

      {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
        <text
          key={`label-${i}`}
          x={padding - 10}
          y={chartHeight - padding - ratio * (chartHeight - padding * 2) + 5}
          textAnchor="end"
          fontSize="11"
          fill="#999"
        >
          ₹{Math.round((maxValue * ratio) / 100000)}L
        </text>
      ))}
    </svg>
  );
}

// Line Chart Component
function LineChart({ data, height = 300 }) {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.sales));
  const padding = 40;
  const chartWidth = 600;
  const chartHeight = height;
  const pointSpacing = (chartWidth - padding * 2) / (data.length - 1 || 1);

  const points = data.map((item, i) => ({
    x: padding + i * pointSpacing,
    y:
      chartHeight -
      padding -
      ((item.sales || 0) / maxValue) * (chartHeight - padding * 2),
  }));

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
    >
      {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
        <line
          key={i}
          x1={padding}
          y1={chartHeight - padding - ratio * (chartHeight - padding * 2)}
          x2={chartWidth - padding}
          y2={chartHeight - padding - ratio * (chartHeight - padding * 2)}
          stroke="#e5e7eb"
          strokeWidth="1"
        />
      ))}

      <path d={pathD} stroke="#3b82f6" strokeWidth="2" fill="none" />

      <path
        d={`${pathD} L ${chartWidth - padding} ${
          chartHeight - padding
        } L ${padding} ${chartHeight - padding} Z`}
        fill="rgba(59, 130, 246, 0.1)"
      />

      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="4"
          fill="#3b82f6"
          stroke="#fff"
          strokeWidth="2"
        />
      ))}

      {data.map((item, i) => (
        <text
          key={i}
          x={points[i].x}
          y={chartHeight - 10}
          textAnchor="middle"
          fontSize="11"
          fill="#666"
        >
          {item.month}
        </text>
      ))}

      {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
        <text
          key={`label-${i}`}
          x={padding - 10}
          y={chartHeight - padding - ratio * (chartHeight - padding * 2) + 5}
          textAnchor="end"
          fontSize="11"
          fill="#999"
        >
          ₹{Math.round((maxValue * ratio) / 100000)}L
        </text>
      ))}
    </svg>
  );
}

// Pie Chart Component
function PieChart({ data, height = 300 }) {
  if (!data || data.length === 0) return null;

  const colors = ["#94a3b8", "#f59e0b", "#10b981", "#ef4444"];
  const total = data.reduce((sum, d) => sum + d.value, 0);

  const size = 200;
  const centerX = 150;
  const centerY = size / 2;

  let currentAngle = -Math.PI / 2;

  return (
    <svg width="100%" height={height} viewBox={`0 0 300 ${height}`}>
      {data.map((item, i) => {
        const sliceAngle = (item.value / total) * Math.PI * 2;
        const startAngle = currentAngle;
        const endAngle = currentAngle + sliceAngle;

        const x1 = centerX + size * Math.cos(startAngle);
        const y1 = centerY + size * Math.sin(startAngle);
        const x2 = centerX + size * Math.cos(endAngle);
        const y2 = centerY + size * Math.sin(endAngle);

        const largeArc = sliceAngle > Math.PI ? 1 : 0;

        const pathD = [
          `M ${centerX} ${centerY}`,
          `L ${x1} ${y1}`,
          `A ${size} ${size} 0 ${largeArc} 1 ${x2} ${y2}`,
          "Z",
        ].join(" ");

        const labelAngle = startAngle + sliceAngle / 2;
        const labelX = centerX + size * 0.7 * Math.cos(labelAngle);
        const labelY = centerY + size * 0.7 * Math.sin(labelAngle);

        currentAngle = endAngle;

        return (
          <g key={i}>
            <path d={pathD} fill={colors[i % colors.length]} />
            <text
              x={labelX}
              y={labelY}
              textAnchor="middle"
              dy="0.3em"
              fontSize="12"
              fill="#fff"
              fontWeight="bold"
            >
              {item.value}
            </text>
          </g>
        );
      })}

      {data.map((item, i) => (
        <g key={`legend-${i}`}>
          <rect
            x="260"
            y={20 + i * 25}
            width="15"
            height="15"
            fill={colors[i % colors.length]}
          />
          <text x="280" y={32 + i * 25} fontSize="12" fill="#666">
            {item.name}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function QuotationDashboard() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [monthlyData, setMonthlyData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [topClients, setTopClients] = useState([]);

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const data = await supabase.select("quotations", "created_at.desc");
      setQuotations(data || []);
      processData(data || []);
    } catch (err) {
      setError("Failed to fetch quotations");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const processData = (data) => {
    const monthlyMap = {};
    data.forEach((q) => {
      if (q.date) {
        const month = new Date(q.date).toLocaleDateString("en-US", {
          month: "short",
        });
        if (!monthlyMap[month]) {
          monthlyMap[month] = 0;
        }
        monthlyMap[month] += q.total_amount || 0;
      }
    });

    const monthly = Object.keys(monthlyMap).map((month) => ({
      month,
      sales: monthlyMap[month],
    }));
    setMonthlyData(monthly);

    const statusMap = {};
    data.forEach((q) => {
      const status = q.status || "draft";
      statusMap[status] = (statusMap[status] || 0) + 1;
    });

    const status = Object.keys(statusMap).map((st) => ({
      name: st.charAt(0).toUpperCase() + st.slice(1),
      value: statusMap[st],
    }));
    setStatusData(status);

    const clientMap = {};
    data.forEach((q) => {
      if (q.client_name) {
        if (!clientMap[q.client_name]) {
          clientMap[q.client_name] = 0;
        }
        clientMap[q.client_name] += q.total_amount || 0;
      }
    });

    const clients = Object.keys(clientMap)
      .map((client) => ({
        name: client,
        amount: clientMap[client],
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    setTopClients(clients);
  };

  const handleEdit = (quotation) => {
    setSelectedQuotation(quotation);
    setEditedData({ ...quotation });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!editedData.quote_number?.trim()) {
      setError("Quote number cannot be empty");
      return;
    }

    setLoading(true);
    try {
      // Update ALL editable fields
      await supabase.update("quotations", selectedQuotation.id, editedData);

      const updatedQuotation = { ...selectedQuotation, ...editedData };
      setQuotations(
        quotations.map((q) =>
          q.id === selectedQuotation.id ? updatedQuotation : q
        )
      );
      setSuccess("Quotation updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
      setIsEditing(false);
      setSelectedQuotation(updatedQuotation);
      processData(
        quotations.map((q) =>
          q.id === selectedQuotation.id ? updatedQuotation : q
        )
      );
    } catch (err) {
      setError("Failed to update quotation");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteQuotation = async (id) => {
    if (!window.confirm("Are you sure you want to delete this quotation?"))
      return;

    try {
      await supabase.delete("quotations", id);
      setQuotations(quotations.filter((q) => q.id !== id));
      setSelectedQuotation(null);
    } catch (err) {
      setError("Failed to delete quotation");
      console.error(err);
    }
  };

  const downloadPDF = (quotation) => {
    if (!quotation.html_content) {
      alert("No HTML content available");
      return;
    }

    const element = document.createElement("a");
    const file = new Blob([quotation.html_content], {
      type: "text/html",
    });
    element.href = URL.createObjectURL(file);
    element.download = `Quotation_${quotation.quote_number}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const filteredQuotations =
    filterStatus === "all"
      ? quotations
      : quotations.filter((q) => (q.status || "draft") === filterStatus);

  const totalAmount = filteredQuotations.reduce(
    (sum, q) => sum + (q.total_amount || 0),
    0
  );
  const totalQuotations = filteredQuotations.length;
  const approvedCount = filteredQuotations.filter(
    (q) => q.status === "approved"
  ).length;
  const uniqueClients = new Set(filteredQuotations.map((q) => q.client_email))
    .size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Quotation Dashboard
          </h1>
          <p className="text-gray-600">Manage and track all your quotations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Quotations</p>
                <p className="text-3xl font-bold text-gray-800">
                  {totalQuotations}
                </p>
              </div>
              <FileText size={32} className="text-blue-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Value</p>
                <p className="text-3xl font-bold text-gray-800">
                  ₹{(totalAmount / 100000).toFixed(1)}L
                </p>
              </div>
              <DollarSign size={32} className="text-green-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Approved</p>
                <p className="text-3xl font-bold text-gray-800">
                  {approvedCount}
                </p>
              </div>
              <TrendingUp size={32} className="text-purple-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Unique Clients</p>
                <p className="text-3xl font-bold text-gray-800">
                  {uniqueClients}
                </p>
              </div>
              <Users size={32} className="text-orange-500 opacity-50" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">All Quotations</h2>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex justify-between">
              {error}
              <button onClick={() => setError("")}>×</button>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              {success}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">
                    Quote #
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : filteredQuotations.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No quotations found
                    </td>
                  </tr>
                ) : (
                  filteredQuotations.map((quotation) => (
                    <tr
                      key={quotation.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        {quotation.quote_number}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {quotation.client_name}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {quotation.client_email}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        ₹{(quotation.total_amount || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {quotation.date || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                          style={{
                            backgroundColor:
                              STATUS_COLORS[quotation.status || "draft"],
                          }}
                        >
                          {(quotation.status || "draft").toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedQuotation(quotation)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="View"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleEdit(quotation)}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition"
                            title="Edit Status"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => downloadPDF(quotation)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="Download"
                          >
                            <Download size={18} />
                          </button>
                          <button
                            onClick={() => deleteQuotation(quotation.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedQuotation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold">
                Quotation #{selectedQuotation.quote_number}
              </h3>
              <button
                onClick={() => {
                  setSelectedQuotation(null);
                  setIsEditing(false);
                }}
                className="text-2xl hover:text-gray-200"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {isEditing ? (
                <>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h4 className="font-bold text-yellow-900 mb-4">
                      Edit Quotation
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quote Number
                        </label>
                        <input
                          type="text"
                          value={editedData.quote_number || ""}
                          onChange={(e) =>
                            setEditedData({
                              ...editedData,
                              quote_number: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Client Name
                          </label>
                          <input
                            type="text"
                            value={editedData.client_name || ""}
                            onChange={(e) =>
                              setEditedData({
                                ...editedData,
                                client_name: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                          </label>
                          <select
                            value={editedData.status || "draft"}
                            onChange={(e) =>
                              setEditedData({
                                ...editedData,
                                status: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="draft">Draft</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Client Email
                          </label>
                          <input
                            type="email"
                            value={editedData.client_email || ""}
                            onChange={(e) =>
                              setEditedData({
                                ...editedData,
                                client_email: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Client Phone
                          </label>
                          <input
                            type="tel"
                            value={editedData.client_phone || ""}
                            onChange={(e) =>
                              setEditedData({
                                ...editedData,
                                client_phone: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Client Address
                        </label>
                        <textarea
                          value={editedData.client_address || ""}
                          onChange={(e) =>
                            setEditedData({
                              ...editedData,
                              client_address: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-16 resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date
                          </label>
                          <input
                            type="date"
                            value={editedData.date || ""}
                            onChange={(e) =>
                              setEditedData({
                                ...editedData,
                                date: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Expiry Date
                          </label>
                          <input
                            type="date"
                            value={editedData.expiry_date || ""}
                            onChange={(e) =>
                              setEditedData({
                                ...editedData,
                                expiry_date: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Service Description
                        </label>
                        <textarea
                          value={editedData.service_description || ""}
                          onChange={(e) =>
                            setEditedData({
                              ...editedData,
                              service_description: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity
                          </label>
                          <input
                            type="number"
                            value={editedData.quantity || ""}
                            onChange={(e) =>
                              setEditedData({
                                ...editedData,
                                quantity: parseFloat(e.target.value),
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rate
                          </label>
                          <input
                            type="number"
                            value={editedData.rate || ""}
                            onChange={(e) =>
                              setEditedData({
                                ...editedData,
                                rate: parseFloat(e.target.value),
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Total Amount
                        </label>
                        <input
                          type="number"
                          value={editedData.total_amount || ""}
                          onChange={(e) =>
                            setEditedData({
                              ...editedData,
                              total_amount: parseFloat(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Account Holder Name
                          </label>
                          <input
                            type="text"
                            value={editedData.bank_name || ""}
                            onChange={(e) =>
                              setEditedData({
                                ...editedData,
                                bank_name: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            IFSC Code
                          </label>
                          <input
                            type="text"
                            value={editedData.ifsc_code || ""}
                            onChange={(e) =>
                              setEditedData({
                                ...editedData,
                                ifsc_code: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Account Number
                          </label>
                          <input
                            type="text"
                            value={editedData.account_number || ""}
                            onChange={(e) =>
                              setEditedData({
                                ...editedData,
                                account_number: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bank & Branch
                          </label>
                          <input
                            type="text"
                            value={editedData.bank_branch || ""}
                            onChange={(e) =>
                              setEditedData({
                                ...editedData,
                                bank_branch: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notes
                        </label>
                        <textarea
                          value={editedData.notes || ""}
                          onChange={(e) =>
                            setEditedData({
                              ...editedData,
                              notes: e.target.value,
                            })
                          }
                          placeholder="Add any notes or comments..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                        />
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={handleSaveEdit}
                          disabled={loading}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-bold text-gray-800 mb-3">
                      Client Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Name</p>
                        <p className="font-semibold text-gray-800">
                          {selectedQuotation.client_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Phone</p>
                        <p className="font-semibold text-gray-800">
                          {selectedQuotation.client_phone}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Email</p>
                        <p className="font-semibold text-gray-800">
                          {selectedQuotation.client_email}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Address</p>
                        <p className="font-semibold text-gray-800">
                          {selectedQuotation.client_address}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-bold text-gray-800 mb-3">
                      Quotation Details
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Quote Number</p>
                        <p className="font-semibold text-gray-800">
                          {selectedQuotation.quote_number}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Date</p>
                        <p className="font-semibold text-gray-800">
                          {selectedQuotation.date}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Expiry Date</p>
                        <p className="font-semibold text-gray-800">
                          {selectedQuotation.expiry_date}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Quantity</p>
                        <p className="font-semibold text-gray-800">
                          {selectedQuotation.quantity}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-600">Services</p>
                        <p className="font-semibold text-gray-800">
                          {selectedQuotation.service_description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-bold text-gray-800 mb-3">
                      Financial Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Rate</p>
                        <p className="font-semibold text-gray-800">
                          ₹
                          {(selectedQuotation.rate || 0).toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Amount</p>
                        <p className="font-bold text-blue-600 text-lg">
                          ₹
                          {(selectedQuotation.total_amount || 0).toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-bold text-gray-800 mb-3">
                      Bank Details
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Account Holder</p>
                        <p className="font-semibold text-gray-800">
                          {selectedQuotation.bank_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">IFSC Code</p>
                        <p className="font-semibold text-gray-800">
                          {selectedQuotation.ifsc_code}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Account Number</p>
                        <p className="font-semibold text-gray-800">
                          {selectedQuotation.account_number}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Bank & Branch</p>
                        <p className="font-semibold text-gray-800">
                          {selectedQuotation.bank_branch}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h4 className="font-bold text-gray-800 mb-2">Status</h4>
                    <div className="flex items-center justify-between">
                      <span
                        className="px-4 py-2 rounded-full text-sm font-semibold text-white"
                        style={{
                          backgroundColor:
                            STATUS_COLORS[selectedQuotation.status || "draft"],
                        }}
                      >
                        {(selectedQuotation.status || "draft").toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {selectedQuotation.notes && (
                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                      <h4 className="font-bold text-gray-800 mb-2">Notes</h4>
                      <p className="text-gray-700 text-sm whitespace-pre-wrap">
                        {selectedQuotation.notes}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => handleEdit(selectedQuotation)}
                      className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition flex items-center justify-center gap-2"
                    >
                      <Edit size={18} /> Edit
                    </button>
                    <button
                      onClick={() => downloadPDF(selectedQuotation)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                    >
                      <Download size={18} /> Download
                    </button>
                    <button
                      onClick={() => setSelectedQuotation(null)}
                      className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
