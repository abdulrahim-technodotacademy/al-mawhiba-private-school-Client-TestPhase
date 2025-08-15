import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, List, FileSpreadsheet, Filter, Download, Users, TrendingUp, Search, X, Loader2, Edit } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Label } from "recharts";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { toast } from "sonner";
// Import pdf-lib for PDF manipulation
import { PDFDocument } from 'pdf-lib';
import SignatureCanvas from 'react-signature-canvas';


const AccountAdminDashboard = () => {
  // State management
  const [activeTab, setActiveTab] = useState<'yearly' | 'billing'>('yearly');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [yearlyData, setYearlyData] = useState<any[]>([]);
  const [studentList, setStudentList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentDetails, setStudentDetails] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: "",
    paymentSlip: null,
    paymentStatus: "first",
    isVerified: false
  });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [availableInstallments, setAvailableInstallments] = useState<any[]>([]);
  const [downloadingReceiptId, setDownloadingReceiptId] = useState<string | null>(null);


    // === NEW STATES for the signature process ===
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [signingPaymentInfo, setSigningPaymentInfo] = useState<any>(null); // To store info of the payment being signed
  const [isAttachingSignature, setIsAttachingSignature] = useState(false);
  
  // Refs for the signature pads
  const guardianSigPad = useRef<SignatureCanvas>(null);
  const adminSigPad = useRef<SignatureCanvas>(null);


  // Fetch academic years on component mount
      useEffect(() => {
        const fetchAcademicYears = async () => {
          try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/students/academic-year/`);
            setAcademicYears(response.data.data);
            if (response.data.data.length > 0) {
              setSelectedYear(response.data.data[0].id);
            }
          } catch (error) {
            console.error('Error fetching academic years:', error);
          }
        };
        fetchAcademicYears();
      }, []);

      // Fetch student data when selected year changes
      useEffect(() => {
        if (selectedYear) {
          fetchStudentData(selectedYear);
        }
      }, [selectedYear]);

      useEffect(() => {
      if (selectedStudent) {
        const installments = getAvailablePayments(selectedStudent);
        setAvailableInstallments(installments);
        
        // Auto-select the first available installment
        if (installments.length > 0) {
          setPaymentData(prev => ({
            ...prev,
            paymentStatus: installments[0].value,
            amount: installments[0].amount
          }));
        }
      }
    }, [selectedStudent]);

      const fetchStudentData = async (yearId: string) => {
        setLoading(true);
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/students/students-academic-details/?academic_year_id=${yearId}`);
          const students = response.data.data;
          
          // Process student data with enhanced payment information

    const processedStudents = students.map((student: any) => {
      const financialAgreement = Array.isArray(student.financial_agreement)
      ? student.financial_agreement.find(agreement => agreement.academic_year === yearId) || {}
      : {};
      const totalFees = parseFloat(financialAgreement.total_fees_omr || "0");
      const paymentHistory = student.payment_history || [];
      
      // Calculate total paid with 2 decimal precision
      const totalPaid = parseFloat(paymentHistory.reduce((sum: number, payment: any) => {
        return sum + parseFloat(payment.paid_amount || "0");
      }, 0).toFixed(2));

      // Calculate pending amount with rounding consideration
      const pendingAmount = parseFloat((totalFees - totalPaid).toFixed(2));

      // Determine payment completion (accounting for rounding)
      const paymentComplete = pendingAmount <= 0.01;
      const totalInstallments = financialAgreement.installment_plan === "one" ? 1 :
                              financialAgreement.installment_plan === "two" ? 2 : 4;

      return {
        id: student.id,
        admissionNumber: student.admission_number,
        name: `${student.en_first_name} ${student.en_last_name}`,
        nameAr: `${student.ar_first_name} ${student.ar_last_name}`,
        grade: student.admission_class?.department_name || 'N/A',
        status: student.is_active ? 'Active' : 'Inactive',
        totalFees,
        paidAmount: paymentComplete ? totalFees : totalPaid,
        pendingAmount: paymentComplete ? 0 : pendingAmount,
        paymentStatus: paymentComplete ? "Complete" : 
                      `${paymentHistory.length} of ${totalInstallments} payments`,
        paymentComplete,
        paymentHistory,
        financialAgreement: {
          ...financialAgreement,
          first_installment_paid: paymentHistory.some(p => p.payment_status === "first"),
          second_installment_paid: paymentHistory.some(p => p.payment_status === "second"),
          third_installment_paid: paymentHistory.some(p => p.payment_status === "third"),
          fourth_installment_paid: totalInstallments === 4 ? 
                                  paymentHistory.some(p => p.payment_status === "fourth") : undefined
        },
        academicYearId: yearId
      };
    });
          setStudentList(processedStudents);
          
          // Extract unique classes for filtering
          const classes = [...new Set(processedStudents.map(student => student.grade))] as string[];
          setAvailableClasses(classes);

          // Calculate yearly summary
          const year = academicYears.find(y => y.id === yearId)?.name || yearId;
          const totalStudents = processedStudents.length;
          const totalRevenue = processedStudents.reduce((sum: number, student: any) => sum + student.totalFees, 0);
          const totalPaid = processedStudents.reduce((sum: number, student: any) => sum + student.paidAmount, 0);
          const collectionRate = totalRevenue > 0 ? (totalPaid / totalRevenue) * 100 : 0;
          
          setYearlyData([{
            year,
            students: totalStudents,
            revenue: totalRevenue.toFixed(2),
            paid: totalPaid.toFixed(2),
            collectionRate: collectionRate.toFixed(2)
          }]);
          
        } catch (error) {
          console.error('Error fetching student data:', error);
        } finally {
          setLoading(false);
        }
      };

  // Filter students based on search and class selection
        const filteredStudents = studentList.filter(student => {
          const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              student.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesClass = selectedClass === 'all' || student.grade === selectedClass;
          return matchesSearch && matchesClass;
        });

        const showStudentDetails = async (student: any) => {
          setSelectedStudent(student);
          setIsDetailModalOpen(true);
          setDetailLoading(true);
          
          try {
            const response = await axios.get(
              `${import.meta.env.VITE_API_BASE_URL}/students/students-academic-details/?academic_year_id=${student.academicYearId}&student_id=${student.id}`
            );
            setStudentDetails(response.data.data);
          } catch (error) {
            console.error('Error fetching student details:', error);
            setStudentDetails(null);
          } finally {
            setDetailLoading(false);
          }
        };

        const openPaymentModal = (student: any) => {
          setSelectedStudent(student);
          setPaymentData({
            amount: "",
            paymentSlip: null,
            paymentStatus: "first",
            isVerified: false
          });
          setIsPaymentModalOpen(true);
        };

        const closeModal = () => {
          setIsDetailModalOpen(false);
          setIsPaymentModalOpen(false);
          setSelectedStudent(null);
          setStudentDetails(null);
          setPaymentError("");
        };

      const updatePaymentFlags = async (student, academicYearId, paymentStatus, paidAmount) => {
        if (!student) {
          console.error("Cannot update payment flags: Student data missing.");
          return;
        }

        // --- NEW ROBUST LOGIC TO FIND THE AGREEMENT ---
        let currentAgreement = null;
        const agreementData = student.financialAgreement;

        if (Array.isArray(agreementData)) {
          // Case 1: The data is an array, as originally expected.
          console.log("Agreement data is an ARRAY. Searching within it.");
          currentAgreement = agreementData.find(a => a.academic_year === academicYearId);
        } else if (agreementData && typeof agreementData === 'object') {
          // Case 2: The data is a single object.
          console.log("Agreement data is an OBJECT. Checking it directly.");
          // We check if this single object's academic_year matches what we need.
          if (agreementData.academic_year === academicYearId) {
            currentAgreement = agreementData;
          }
        }
        // --- END OF NEW LOGIC ---

        if (!currentAgreement) {
          // This will now only trigger if the data is truly missing or the ID doesn't match
          console.error("No financial agreement found for the current academic year:", academicYearId);
          console.log("This was the data we searched in:", agreementData); // Extra log for help
          return;
        }

        // The rest of the function remains the same...

        const payload = {};
        const statusToFieldMap = {
          first: "first_installment_paid",
          second: "second_installment_paid",
          third: "third_installment_paid",
          fourth: "fourth_installment_paid",
          full: "payment_completed"
        };
        const fieldToUpdate = statusToFieldMap[paymentStatus];
        if (fieldToUpdate) {
          payload[fieldToUpdate] = true;
        }

        const remainingAmount = parseFloat(student.pendingAmount.toFixed(2));
        const amountBeingPaid = parseFloat(paidAmount.toFixed(2));
        const isCompleted = amountBeingPaid >= remainingAmount - 0.01;

        if (isCompleted) {
          payload.payment_completed = true;
        }

        if (Object.keys(payload).length === 0) {
          console.log("No payment flags to update.");
          return;
        }

        try {
          const response = await axios.patch(
            `${import.meta.env.VITE_API_BASE_URL}/students/update-payment-flag/${currentAgreement.id}/`,
            payload,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          if (response.data) {
            console.log("Payment flags updated successfully with payload:", payload);
          }
        } catch (err) {
          console.error("Failed to update payment flags:", err.response?.data || err.message);
        }
      };

      const handlePaymentSubmit = async (e) => {
        e.preventDefault();

        setPaymentLoading(true);
        setPaymentError("");

        try {
          if (!selectedStudent) {
            throw new Error("No student selected");
          }

          const totalFees = parseFloat(selectedStudent.totalFees.toFixed(2));
          const paidAmount = parseFloat(selectedStudent.paidAmount.toFixed(2));
          const remainingAmount = parseFloat((totalFees - paidAmount).toFixed(2));

          const selectedInstallment = availableInstallments.find(
            (i) => i.value === paymentData.paymentStatus
          );

          if (!selectedInstallment) {
            throw new Error("No installment selected");
          }

          const isFinalPayment = remainingAmount <= parseFloat(selectedInstallment.amount) + 0.01;
          const amountToPay = isFinalPayment ? remainingAmount : parseFloat(selectedInstallment.amount);

          if (amountToPay <= 0) {
            throw new Error("Payment amount must be greater than zero");
          }

          const formData = new FormData();
          formData.append("student", selectedStudent.id);
          formData.append("academic_year", selectedStudent.academicYearId);
          formData.append("payment_status", paymentData.paymentStatus);
          formData.append("paid_amount", amountToPay.toFixed(2));

          if (paymentData.paymentSlip) {
            formData.append("payment_slip", paymentData.paymentSlip);
          }

          const response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/students/payment-history/`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          if (response.data) {
            toast.success("Payment recorded successfully!", {
              autoClose: 2000,
            });

            // *** NEW: Call the function to update payment flags ***
          await updatePaymentFlags(
              selectedStudent, 
              selectedYear, 
              paymentData.paymentStatus, 
              amountToPay
            );

            // Refresh data and close modal as before
            await fetchStudentData(selectedYear);
            closeModal();
          } else {
            throw new Error(response.data.message || "Payment failed");
          }
        } catch (err) {
          console.error("Payment error:", err);
          setPaymentError(
            err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            "Failed to process payment"
          );
        } finally {
          setPaymentLoading(false);
        }
      };

      const handleDownloadReceipt = async (paymentId: string) => {
          setDownloadingReceiptId(paymentId);
          try {
            const response = await axios.get(
              `${import.meta.env.VITE_API_BASE_URL}/students/students/${paymentId}/download-payment-receipt/`,
              {
                responseType: 'arraybuffer', // Important to handle binary data
              }
            );

            let pdfBytes = response.data;

            // --- Optional: Signature Logic ---
            // This part assumes you have signature images (e.g., from a signature pad)
            // available in the browser as base64 data URLs. If not, you can remove this block.
            /*
            const pdfDoc = await PDFDocument.load(pdfBytes);
            
            // Example signature data (replace with your actual signature data URLs)
            const guardianSignatureUrl = 'data:image/png;base64,...'; 
            const employerSignatureUrl = 'data:image/png;base64,...';

            const [guardianPngBytes, employerPngBytes] = await Promise.all([
              fetch(guardianSignatureUrl).then((res) => res.arrayBuffer()),
              fetch(employerSignatureUrl).then((res) => res.arrayBuffer()),
            ]);

            const guardianImage = await pdfDoc.embedPng(guardianPngBytes);
            const employerImage = await pdfDoc.embedPng(employerPngBytes);

            const page = pdfDoc.getPages()[1]; // Or whichever page is correct

            page.drawImage(guardianImage, { x: 50, y: 180, width: 120, height: 50 });
            page.drawImage(employerImage, { x: 200, y: 180, width: 120, height: 50 });

            pdfBytes = await pdfDoc.save();
            */
            // --- End of Optional Signature Logic ---

            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `receipt-${paymentId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();

            toast.success("Receipt downloaded successfully!");

          } catch (error) {
            console.error('Error downloading receipt:', error);
            toast.error("Failed to download receipt.");
          } finally {
            setDownloadingReceiptId(null);
          }
        };


      const getAvailablePayments = (student: any) => {
            if (!student?.financialAgreement) return [];
            
            const agreement = student.financialAgreement;
            const totalFees = parseFloat(agreement.total_fees_omr);
            const payments = [];
            
            // Calculate remaining amount to prevent overpayment
            const remainingAmount = totalFees - student.paidAmount;

            // For one-time payment plan
            if (agreement.installment_plan === "one") {
              return [{
                value: "full",
                label: `Full Payment (${totalFees.toFixed(2)} OMR)`,
                amount: Math.min(remainingAmount, totalFees).toFixed(2)
              }];
            }
            
            // For two-installment plan
            if (agreement.installment_plan === "two") {
              const installmentAmount = (totalFees / 2).toFixed(2);
              
              if (!agreement.first_installment_paid) {
                payments.push({ 
                  value: "first", 
                  label: `First Installment (50% - ${installmentAmount} OMR)`,
                  amount: Math.min(remainingAmount, parseFloat(installmentAmount)).toFixed(2)
                });
              }
              
              if (agreement.first_installment_paid && !agreement.second_installment_paid) {
                payments.push({ 
                  value: "second", 
                  label: `Second Installment (50% - ${installmentAmount} OMR)`,
                  amount: Math.min(remainingAmount, parseFloat(installmentAmount)).toFixed(2)
                });
              }
              
              return payments;
            }
            
            // For four-installment plan
            if (agreement.installment_plan === "four") {
              const installmentAmount = (totalFees / 4).toFixed(2);
              
              if (!agreement.first_installment_paid) {
                payments.push({ 
                  value: "first", 
                  label: `First Installment (25% - ${installmentAmount} OMR)`,
                  amount: Math.min(remainingAmount, parseFloat(installmentAmount)).toFixed(2)
                });
              }
              
              if (agreement.first_installment_paid && !agreement.second_installment_paid) {
                payments.push({ 
                  value: "second", 
                  label: `Second Installment (25% - ${installmentAmount} OMR)`,
                  amount: Math.min(remainingAmount, parseFloat(installmentAmount)).toFixed(2)
                });
              }
              
              if (agreement.second_installment_paid && !agreement.third_installment_paid) {
                payments.push({ 
                  value: "third", 
                  label: `Third Installment (25% - ${installmentAmount} OMR)`,
                  amount: Math.min(remainingAmount, parseFloat(installmentAmount)).toFixed(2)
                });
              }
              
              if (agreement.third_installment_paid && !agreement.fourth_installment_paid) {
                payments.push({ 
                  value: "fourth", 
                  label: `Fourth Installment (25% - ${installmentAmount} OMR)`,
                  amount: Math.min(remainingAmount, parseFloat(installmentAmount)).toFixed(2)
                });
              }
              
              return payments;
            }
            
            return payments;
          };

        const stats = [
          { 
            title: 'Total Revenue', 
            titleAr: 'إجمالي الإيرادات', 
            value: yearlyData[0]?.revenue ? `${yearlyData[0].revenue} OMR` : '0 OMR', 
            icon: () => <span className="font-bold text-green-600">OMR</span>, 
            trend: '+0.0%' 
          },
          { 
            title: 'Active Students', 
            titleAr: 'الطلاب النشطون', 
            value: yearlyData[0]?.students || '0', 
            icon: Users, 
            trend: '+0.0%' 
          },
          { 
            title: 'Collection Rate', 
            titleAr: 'معدل التحصيل', 
            value: yearlyData[0]?.collectionRate ? `${yearlyData[0].collectionRate}%` : '0%', 
            icon: TrendingUp, 
            trend: '+0.0%' 
          }
        ];

    const openSignatureModal = (payment: any) => {
    // We pass the entire payment object to have access to amounts
    setSigningPaymentInfo({
        paymentId: payment.id,
        // We also ne ed the student's total fees for the PATCH request
        totalFees: selectedStudent?.totalFees, 
        pendingAmount: selectedStudent?.pendingAmount
    });
    setIsSignatureModalOpen(true);
  };

    const closeSignatureModal = () => {
    setIsSignatureModalOpen(false);
    setSigningPaymentInfo(null);
    guardianSigPad.current?.clear();
    adminSigPad.current?.clear();
  };

    const handleInitiateSigning = (payment: any) => {
     openSignatureModal(payment);
  };

    const dataURLtoBlob = (dataurl: string) => {
      const arr = dataurl.split(',');
      const mimeMatch = arr[0].match(/:(.*?);/);
      if (!mimeMatch) return null;
      const mime = mimeMatch[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while(n--){
          u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], {type:mime});
  }

  const handleAttachSignatureAndDownload = async () => {
    if (guardianSigPad.current?.isEmpty() || adminSigPad.current?.isEmpty()) {
      toast.error("Both signatures are required.");
      return;
    }

    setIsAttachingSignature(true);
    
    try {
      // === 1. DOWNLOAD THE ORIGINAL, UNSIGNED RECEIPT PDF ===
      const pdfResponse = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/students/students/${signingPaymentInfo.paymentId}/download-payment-receipt/`,
        {
          responseType: 'arraybuffer', // We need the raw data of the PDF
        }
      );

      // === 2. LOAD THE PDF AND PREPARE SIGNATURE IMAGES ===
      const pdfDoc = await PDFDocument.load(pdfResponse.data);
      
      const guardianSignatureUrl = guardianSigPad.current.toDataURL('image/png');
      const adminSignatureUrl = adminSigPad.current.toDataURL('image/png');

      const [guardianPngBytes, adminPngBytes] = await Promise.all([
        fetch(guardianSignatureUrl).then((res) => res.arrayBuffer()),
        fetch(adminSignatureUrl).then((res) => res.arrayBuffer()),
      ]);

      const guardianImage = await pdfDoc.embedPng(guardianPngBytes);
      const adminImage = await pdfDoc.embedPng(adminPngBytes);

      // === 3. EMBED THE SIGNATURES ONTO THE PDF ===
      const page = pdfDoc.getPages()[0]; 
      const { width } = page.getSize();

      // Adjust X/Y coordinates as needed for your template
      page.drawImage(guardianImage, {
        x: 50,
        y: 150,
        width: 100,
        height: 50,
      });

      page.drawImage(adminImage, {
        x: width - 170,
        y: 150,
        width: 130,
        height: 100,
      });

      // === 4. SAVE THE MODIFIED PDF AND PREPARE FOR UPLOAD ===
      const signedPdfBytes = await pdfDoc.save();
      const blob = new Blob([signedPdfBytes], { type: 'application/pdf' });

      const formData = new FormData();
      
      // Append the signed PDF file
      formData.append("payment_slip", blob, `signed-receipt-${signingPaymentInfo.paymentId}.pdf`);
      
      // Append the verification status
      formData.append("is_verified_by_accountant", 'true');
      
      // --- CORRECTLY PASSING TOTAL AND REMAINING AMOUNTS ---
      // These values are read from the `signingPaymentInfo` state.
      formData.append("total_amount", signingPaymentInfo.totalFees.toFixed(2));
      formData.append("remaining_amount", signingPaymentInfo.pendingAmount.toFixed(2));
      // --------------------------------------------------------

      // === 5. UPLOAD THE FINAL, SIGNED PDF AND DATA TO THE SERVER ===
      // This is the API call that sends the data
      await axios.patch(
          `${import.meta.env.VITE_API_BASE_URL}/students/payment-history/${signingPaymentInfo.paymentId}/`,
          formData,
          {
            headers: {
              // The browser will set the correct Content-Type for multipart/form-data
              // so you don't need to set it manually here.
            }
          }
      );

      toast.success("Receipt signed and updated successfully!");
      
      // Trigger a direct download for the user's convenience
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = downloadUrl;
      a.download = `receipt-signed-${signingPaymentInfo.paymentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      a.remove();
      
      closeSignatureModal();
      await fetchStudentData(selectedYear); // Refresh the data grid

    } catch (error) {
        console.error("Error during client-side signing process:", error);
        toast.error("Failed to sign and update receipt. Please try again.");
    } finally {
        setIsAttachingSignature(false);
    }
  };


  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Main Action Tabs */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          className={`px-6 py-3 font-medium ${activeTab === 'yearly' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('yearly')}
        >
          <FileSpreadsheet className="inline mr-2 h-4 w-4" />
          Yearly Management | الإدارة السنوية
        </button>
        <button
          className={`px-6 py-3 font-medium ${activeTab === 'billing' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('billing')}
        >
          <FileText className="inline mr-2 h-4 w-4" />
          Student Billing | الفواتير الدراسية
        </button>
      </div>

      {/* Content Area */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : activeTab === 'yearly' ? (
          <div className="space-y-6">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">Yearly Financial Sheets | السجلات المالية السنوية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Academic Year | اختر السنة الدراسية
                  </label>
                  <select
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                  >
                    {academicYears.map((year) => (
                      <option key={year.id} value={year.id}>
                        {year.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Year | السنة
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Students | الطلاب
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Revenue | إجمالي الإيرادات
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Paid | المدفوع
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Collection Rate | معدل التحصيل
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions | الإجراءات
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {yearlyData.map((year, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {year.year}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {year.students}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {year.revenue} OMR
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {year.paid} OMR
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {year.collectionRate}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <Button variant="outline" size="sm" className="mr-2">
                              <Download className="h-4 w-4 mr-1" />
                              Export
                            </Button>
                            <Button variant="outline" size="sm">
                              <List className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">
                Student Billing for {yearlyData[0]?.year} | الفواتير الدراسية لسنة {yearlyData[0]?.year}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search students..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                  >
                    <option value="all">All Classes</option>
                    {availableClasses.map((classItem) => (
                      <option key={classItem} value={classItem}>
                        {classItem}
                      </option>
                    ))}
                  </select>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student ID | الرقم الدراسي
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name | الاسم
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status | الحالة
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Fees | الرسوم الكلية
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Paid | المدفوع
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pending | المتبقي
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Status | حالة الدفع
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions | الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => {
                        const paymentStatusColor = student.paymentComplete ? 
                          'bg-green-100 text-green-800' : 
                          (student.paidAmount > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800');
                        
                        return (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {student.admissionNumber}
                            </td>
                            <td 
                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 cursor-pointer hover:text-blue-600 hover:underline"
                              onClick={() => showStudentDetails(student)}
                            >
                              {student.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                student.status === 'Active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {student.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.totalFees.toFixed(2)} OMR
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                              {student.paidAmount.toFixed(2)} OMR
                            </td>
                             
<td className="px-6 py-4 whitespace-nowrap">
  {student.paymentComplete ? (
    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
      Complete
    </span>
  ) : (
    <div className="flex flex-col">
      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
        {student.paymentStatus}
      </span>
      {student.pendingAmount > 0 && (
        <span className="text-xs text-red-500 mt-1">
          Remaining: {student.pendingAmount.toFixed(2)} OMR
        </span>
      )}
    </div>
  )}
</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          student.paymentComplete ? 
                            'bg-green-100 text-green-800' : 
                            (student.paidAmount > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800')
                        }`}>
                          {student.paymentComplete ? 'Complete' : student.paymentStatus}
                        </span>
                      </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {!student.paymentComplete && (
  <Button 
    variant="outline" 
    size="sm"
    onClick={() => openPaymentModal(student)}
  >
    <FileText className="h-4 w-4 mr-1" />
    Record Payment
  </Button>
)}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                          No students found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Student Details Modal */}
        {isDetailModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  Student Details: {selectedStudent?.name} | تفاصيل الطالب: {selectedStudent?.nameAr}
                </h2>
                <button 
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {detailLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
                </div>
              ) : selectedStudent ? (
                <div className="space-y-4">
                  {/* Basic Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Basic Information | المعلومات الأساسية</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p><strong>Admission Number:</strong> {selectedStudent.admissionNumber}</p>
                        <p><strong>Name:</strong> {selectedStudent.name}</p>
                        <p><strong>الاسم:</strong> {selectedStudent.nameAr}</p>
                        <p><strong>Class:</strong> {selectedStudent.grade}</p>
                        <p><strong>Status:</strong> {selectedStudent.status}</p>
                      </div>
                      <div className="space-y-2">
                        <p><strong>Academic Year:</strong> {yearlyData[0]?.year}</p>
                        <p><strong>Total Fees:</strong> {selectedStudent.totalFees.toFixed(2)} OMR</p>
                        <p><strong>Paid Amount:</strong> {selectedStudent.paidAmount.toFixed(2)} OMR</p>
                        <p className={selectedStudent.pendingAmount > 0 ? 'text-red-600' : ''}>
                          <strong>Pending Amount:</strong> {selectedStudent.pendingAmount.toFixed(2)} OMR
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Financial Agreement */}
                  {selectedStudent.financialAgreement && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Financial Agreement | الاتفاقية المالية</CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p><strong>Contract Number:</strong> {selectedStudent.financialAgreement.contract_number}</p>
                          <p><strong>Installment Plan:</strong> {selectedStudent.financialAgreement.installment_plan}</p>
                          <p><strong>Registration Fees:</strong> {selectedStudent.financialAgreement.registration_fees} OMR</p>
                          <p><strong>Books Fees:</strong> {selectedStudent.financialAgreement.books_fees} OMR</p>
                        </div>
                        <div className="space-y-2">
                          <p><strong>Transportation Fees:</strong> {selectedStudent.financialAgreement.transportation_fees} OMR</p>
                          <p><strong>Administrative Fees:</strong> {selectedStudent.financialAgreement.administrative_fees} OMR</p>
                          <p><strong>Agreement Date:</strong> {selectedStudent.financialAgreement.agreement_date}</p>
                          <p><strong>Payment Completed:</strong> {selectedStudent.financialAgreement.payment_completed ? 'Yes' : 'No'}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Payment History */}
                   <Card>
                    <CardHeader>
                      <CardTitle>Payment History | سجل الدفع</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedStudent.paymentHistory.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {selectedStudent.paymentHistory.map((payment: any) => (
                                <tr key={payment.id}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.date_of_payment}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{payment.paid_amount} OMR</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.payment_status}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {/* THIS BUTTON NOW OPENS THE SIGNATURE MODAL */}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleInitiateSigning(payment)}
                                      disabled={downloadingReceiptId === payment.id}
                                    >
                                       <Edit className="h-4 w-4 mr-1" />
                                       Sign & Download
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">No payments recorded yet</div>
                      )}
                    </CardContent>
                </Card>

                  {/* Payment Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xl">{selectedStudent.totalFees.toFixed(2)} OMR</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Amount Paid</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xl text-green-600">{selectedStudent.paidAmount.toFixed(2)} OMR</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className={`text-xl ${
                          selectedStudent.pendingAmount > 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {selectedStudent.pendingAmount.toFixed(2)} OMR
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Failed to load student details
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Modal */}
       {isPaymentModalOpen && selectedStudent && (
        <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
       <DialogContent className="sm:max-w-md">
  <DialogHeader>
    <DialogTitle>
      Record Payment for {selectedStudent?.name}
    </DialogTitle>
    <DialogDescription>
      {selectedStudent?.financialAgreement.installment_plan === "one" 
        ? "Full payment required" 
        : `${selectedStudent?.financialAgreement.installment_plan}-installment plan`}
    </DialogDescription>
  </DialogHeader>
  
  <div className="space-y-4">
    <div className="p-4 bg-gray-50 rounded-md">
      <h4 className="font-medium mb-2">Payment Summary</h4>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <span>Total Fees:</span>
        <span className="font-medium">{selectedStudent?.totalFees.toFixed(2)} OMR</span>
        <span>Paid Amount:</span>
        <span className="font-medium text-green-600">{selectedStudent?.paidAmount.toFixed(2)} OMR</span>
        <span>Pending Amount:</span>
        <span className="font-medium text-red-600">
          {(selectedStudent?.totalFees - selectedStudent?.paidAmount).toFixed(2)} OMR
        </span>
      </div>
    </div>

    <form onSubmit={handlePaymentSubmit}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="paymentStatus">Installment Type</Label>
          <select
            id="paymentStatus"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
            value={paymentData.paymentStatus}
            onChange={(e) => {
              const selected = availableInstallments.find(i => i.value === e.target.value);
              setPaymentData({
                ...paymentData,
                paymentStatus: e.target.value,
                amount: selected?.amount || "0.00"
              });
            }}
            disabled={availableInstallments.length === 0}
          >
            {availableInstallments.length > 0 ? (
              availableInstallments.map((payment) => (
                <option key={payment.value} value={payment.value}>
                  {payment.label.split('(')[0]} ({parseFloat(payment.amount).toFixed(2)} OMR)
                </option>
              ))
            ) : (
              <option value="">No payments available</option>
            )}
          </select>
          {availableInstallments.length === 0 && (
            <p className="text-xs text-red-500">All installments have been paid</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount (OMR)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            max={(selectedStudent?.totalFees - selectedStudent?.paidAmount).toFixed(2)}
            value={paymentData.amount}
            onChange={(e) => {
              const maxAmount = selectedStudent?.totalFees - selectedStudent?.paidAmount;
              let enteredAmount = parseFloat(e.target.value) || 0;
              // Ensure exactly 2 decimal places
              enteredAmount = parseFloat(enteredAmount.toFixed(2));
              setPaymentData({
                ...paymentData,
                amount: Math.min(enteredAmount, maxAmount).toFixed(2)
              });
            }}
            required
            disabled={availableInstallments.length === 0}
          />
          <p className="text-xs text-gray-500">
            Maximum allowed: {(selectedStudent?.totalFees - selectedStudent?.paidAmount).toFixed(2)} OMR
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentSlip">Payment Slip (Optional)</Label>
          <Input
            id="paymentSlip"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setPaymentData({
              ...paymentData,
              paymentSlip: e.target.files?.[0] || null
            })}
            disabled={availableInstallments.length === 0}
          />
          <p className="text-xs text-gray-500">
            Upload proof of payment (PDF, JPG, PNG)
          </p>
        </div>

        {paymentError && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
            {paymentError}
          </div>
        )}

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={closeModal}
            disabled={paymentLoading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={paymentLoading || availableInstallments.length === 0}
          >
            {paymentLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Record Payment"
            )}
          </Button>
        </DialogFooter>
      </div>
    </form>
  </div>
</DialogContent>
        </Dialog>
        )}
      </div>

   {/* === NEW: Signature Modal === */}
      {isSignatureModalOpen && (
        <Dialog open={isSignatureModalOpen} onOpenChange={setIsSignatureModalOpen}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add Signatures to Receipt</DialogTitle>
                    <DialogDescription>
                        Please provide the required signatures
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                    {/* Guardian Signature */}
                    <div className="space-y-2">
                        <Label htmlFor="guardian-sig">Guardian Signature</Label>
                        <div className="border rounded-md">
                            <SignatureCanvas 
                                ref={guardianSigPad}
                                canvasProps={{ className: 'w-full h-32' }} 
                            />
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => guardianSigPad.current?.clear()}>Clear</Button>
                    </div>

                    {/* Admin/Employer Signature */}
                    <div className="space-y-2">
                        <Label htmlFor="admin-sig">Admin Signature</Label>
                        <div className="border rounded-md">
                            <SignatureCanvas 
                                ref={adminSigPad}
                                canvasProps={{ className: 'w-full h-32' }} 
                            />
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => adminSigPad.current?.clear()}>Clear</Button>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={closeSignatureModal} disabled={isAttachingSignature}>Cancel</Button>
                    <Button onClick={handleAttachSignatureAndDownload} disabled={isAttachingSignature}>
                        {isAttachingSignature ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : "Attach & Download"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}


    </div>
  );
};

export default AccountAdminDashboard;