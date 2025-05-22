"use client";
import { useConfirmDonationReceiptMutation } from "@/store/api/donationApi";
import { Donation } from "@/types/donation";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import Image from "next/image";
import React, { useState } from "react";
import { FiCheckCircle, FiX } from "react-icons/fi";
import { toast } from "react-toastify";

interface DonationConfirmationProps {
  donation: Donation;
  onConfirmed: () => void;
}

const DonationConfirmation: React.FC<DonationConfirmationProps> = ({
  donation,
  onConfirmed,
}) => {
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmReceipt, { isLoading }] = useConfirmDonationReceiptMutation();

  const handleConfirmReceipt = async () => {
    try {
      await confirmReceipt({ donationId: donation._id }).unwrap();
      toast.success("Donation receipt confirmed successfully");
      setShowConfirmationModal(false);
      onConfirmed();
    } catch (error: unknown) {
      const errorMessage =
        error &&
        typeof error === "object" &&
        "data" in error &&
        error.data &&
        typeof error.data === "object" &&
        "message" in error.data
          ? error.data.message
          : error instanceof Error
          ? error.message
          : "Unknown error";
      toast.error("Error confirming donation receipt: " + errorMessage);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirmationModal(true)}
        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-1"
      >
        <FiCheckCircle className="text-lg" />
        Confirm Receipt
      </button>

      {showConfirmationModal && (
        <Dialog
          open={showConfirmationModal}
          onClose={() => setShowConfirmationModal(false)}
          maxWidth="sm"
          fullWidth
          sx={{
            "& .MuiDialog-paper": {
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            },
          }}
        >
          <DialogTitle className="text-2xl font-bold text-gray-900 border-b border-gray-200">
            Confirm Donation Receipt
          </DialogTitle>
          <DialogContent className="p-6 bg-white">
            <div className="space-y-4">
              <p className="text-sm text-gray-700 mb-4">
                Please confirm that you recognize this donation and the photo uploaded by the organization.
              </p>

              {donation.receiptImage && (
                <div className="flex justify-center mb-4">
                  <div className="relative h-64 w-full max-w-md rounded-lg overflow-hidden border border-gray-200">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${donation.receiptImage}`}
                      alt="Donation receipt"
                      fill
                      style={{ objectFit: "contain" }}
                      className="rounded-lg"
                    />
                  </div>
                </div>
              )}

              <div className="mt-4">
                <p className="text-sm text-gray-700">
                  <strong className="font-medium text-gray-900">Organization:</strong>{" "}
                  {donation.organization?.name || "Unknown Organization"}
                </p>
                <p className="text-sm text-gray-700">
                  <strong className="font-medium text-gray-900">Donation Type:</strong>{" "}
                  {donation.type === "MONEY"
                    ? `Money ($${donation.amount?.toFixed(2) || "0.00"})`
                    : `${donation.type} (${donation.quantity} ${donation.unit || ""})`}
                </p>
                <p className="text-sm text-gray-700">
                  <strong className="font-medium text-gray-900">Date Received:</strong>{" "}
                  {new Date(donation.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </DialogContent>
          <DialogActions className="p-6 border-t border-gray-200">
            <Button
              onClick={() => setShowConfirmationModal(false)}
              variant="outlined"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg px-4 py-2 transition-colors"
              startIcon={<FiX />}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmReceipt}
              variant="contained"
              disabled={isLoading}
              className={`bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg px-4 py-2 transition-colors ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              startIcon={<FiCheckCircle />}
            >
              {isLoading ? "Processing..." : "Confirm Receipt"}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default DonationConfirmation;
