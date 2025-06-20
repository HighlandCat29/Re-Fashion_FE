import React, { useEffect, useState } from "react";
import {
  getAllFeaturedPayments,
  FeaturedPayment,
  confirmFeaturedPayment,
  deleteFeaturedPayment,
} from "../../../api/Feature";
import { useAppSelector } from "../../../hooks";
import { formatPrice } from "../../../utils/formatPrice";
import { formatDate } from "../../../utils/formatDate";
import ConfirmationModal from "../../../components/ConfirmationModal";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  PAID: "bg-blue-100 text-blue-800",
};

const FeatureManagement = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [featuredPayments, setFeaturedPayments] = useState<FeaturedPayment[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [paymentToDelete, setPaymentToDelete] =
    useState<FeaturedPayment | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    getAllFeaturedPayments(user.id).then((data) => {
      if (data) setFeaturedPayments(data);
      setLoading(false);
    });
  }, [user]);

  const handleConfirm = async (paymentId: string) => {
    if (!user?.id) return;
    const confirmedPayment = await confirmFeaturedPayment(
      paymentId,
      user.id,
      true
    );
    if (confirmedPayment) {
      setFeaturedPayments((prevPayments) =>
        prevPayments.map((p) => (p.id === paymentId ? confirmedPayment : p))
      );
    }
  };

  const handleDelete = async (paymentId: string) => {
    if (!user?.id) return;
    const success = await deleteFeaturedPayment(paymentId, user.id);
    if (success) {
      setFeaturedPayments((prevPayments) =>
        prevPayments.filter((p) => p.id !== paymentId)
      );
    }
    setPaymentToDelete(null); // Close modal
  };

  const filteredPayments = featuredPayments
    .filter((payment) => {
      const matchesStatus =
        statusFilter === "ALL" || payment.status === statusFilter;
      const matchesSearch =
        payment.sellerId.toLowerCase().includes(search.toLowerCase()) ||
        payment.productId.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    })
    // Sort by latest paymentDate
    .sort(
      (a, b) =>
        new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
    );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        Featured Payments Management
      </h2>
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="PAID">Paid</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search by Seller/Product
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Enter seller or product ID"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          />
        </div>
      </div>
      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No featured payments found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seller ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proof
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {payment.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {payment.productId}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {payment.sellerId}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {formatPrice(payment.amount)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {payment.durationDays} days
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        statusColors[payment.status] ||
                        "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {formatDate(payment.paymentDate)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {payment.transferProofImageUrl ? (
                      <a
                        href={payment.transferProofImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={payment.transferProofImageUrl}
                          alt="Proof"
                          className="w-12 h-12 object-cover rounded border hover:scale-110 transition-transform"
                        />
                      </a>
                    ) : (
                      <span className="text-gray-400">No Image</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    {payment.status === "PENDING" && (
                      <button
                        onClick={() => handleConfirm(payment.id)}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                      >
                        Confirm
                      </button>
                    )}
                    <button
                      onClick={() => setPaymentToDelete(payment)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!paymentToDelete}
        onClose={() => setPaymentToDelete(null)}
        onConfirm={() => handleDelete(paymentToDelete!.id)}
        title="Confirm Deletion"
        message={`Are you sure you want to delete the featured payment for product ID: ${paymentToDelete?.productId}? This action cannot be undone.`}
      />
    </div>
  );
};

export default FeatureManagement;
