import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, List, FileSpreadsheet, Filter, Download, Users, TrendingUp, Search, X, Loader2, Edit, Eye } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { toast } from "sonner";
// Import pdf-lib for PDF manipulation
import { PDFDocument } from 'pdf-lib';
import SignatureCanvas from 'react-signature-canvas';
import Swal from 'sweetalert2';
import { getFullUrl } from '@/utils/fileUtils';
import { numberToWords } from '@/utils/numberUtils';
import * as XLSX from 'xlsx';
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/utils/axiosInterceptor";


const AccountAdminDashboard = () => {
  // State management
  // *** MODIFICATION: Removed 'billing' tab state as it's no longer needed ***
  const [activeTab, setActiveTab] = useState<'yearly'>('yearly');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [summaryYearFilter, setSummaryYearFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [yearlyData, setYearlyData] = useState<any[]>([]);
  const [studentList, setStudentList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [availblesection, setavailblesection] = useState<string[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentDetails, setStudentDetails] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: "",
    paymentSlip: null,
    paymentStatus: "first",
    isVerified: false,
    payment_method: "cash",
    cheque_number: "",
    transaction_number: "",
    bank_name: ""
  });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [availableInstallments, setAvailableInstallments] = useState<any[]>([]);
  const [downloadingReceiptId, setDownloadingReceiptId] = useState<string | null>(null);

  // Export Modal States
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportSelectedYears, setExportSelectedYears] = useState<string[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>('all');


  // === NEW STATES for the signature process ===
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [signingPaymentInfo, setSigningPaymentInfo] = useState<any>(null); // To store info of the payment being signed
  const [isAttachingSignature, setIsAttachingSignature] = useState(false);

  // Refs for the signature pads
  const accountantSigPad = useRef<SignatureCanvas>(null);
  const adminSigPad = useRef<SignatureCanvas>(null);


  // Fetch academic years on component mount
  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/students/academic-year/`);
        setAcademicYears(response.data.data);
        if (response.data.data.length > 0) {
          // No longer setting selectedYear here, as it defaults to 'all'
        }
      } catch (error) {
        console.error('Error fetching academic years:', error);
      }
    };
    fetchAcademicYears();
  }, []);

  // Fetch ALL student data once academic years are loaded
  useEffect(() => {
    if (academicYears.length > 0) {
      fetchStudentData('all'); // Always fetch all data initially for the global summary
    }
  }, [academicYears]);

  useEffect(() => {
    if (selectedStudent) {
      const installments = getAvailablePayments(selectedStudent);
      setAvailableInstallments(installments);

      // Auto-select the first available installment
      if (installments.length > 0) {
        setPaymentData(prev => ({
          ...prev,
          paymentStatus: installments[0].value,
          amount: installments[0].amount,
          payment_method: "cash",
          cheque_number: "",
          transaction_number: "",
          bank_name: ""
        }));
      }
    }
  }, [selectedStudent]);

  const fetchStudentData = async (yearId: string) => {
    setLoading(true);
    try {
      // Always fetch all students for all years to enable global filtering
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/students/students-academic-details/?academic_year_id=all`);
      const students = response.data.data;

      console.log('student details', students);




      // Process student data with enhanced payment information

      const processedStudents: any[] = [];

      students.forEach((student: any) => {
        const ags = Array.isArray(student.financial_agreement) ? student.financial_agreement : [];

        // In "All" view, show one row per academic year for the student
        ags.forEach((ag: any) => {
          const currentYearId = ag.academic_year;
          const yearName = academicYears.find(y => y.id === currentYearId)?.name || currentYearId;

          const paymentHistory = (student.payment_history || []).filter((p: any) => p.academic_year === currentYearId);
          const totalFees = parseFloat(ag.total_fees_omr || "0");
          const totalPaid = parseFloat(paymentHistory.reduce((sum: number, p: any) => sum + parseFloat(p.paid_amount || "0"), 0).toFixed(2));
          const pendingAmount = parseFloat((totalFees - totalPaid).toFixed(2));
          const paymentComplete = pendingAmount <= 0.01;
          const totalInstallments = ag.installment_plan === "one" ? 1 : ag.installment_plan === "two" ? 2 : 4;

          processedStudents.push({
            id: `${student.id}-${currentYearId}`, // Unique ID for table keys
            originalId: student.id,
            admissionNumber: student.admission_number,
            name: `${student.en_first_name} ${student.en_last_name}`,
            nameAr: `${student.ar_first_name} ${student.ar_last_name}`,
            grade: student.admission_class?.department_name || 'N/A',
            section: student.section?.name || '',
            status: student.is_active ? 'Active' : 'Inactive',
            totalFees,
            paidAmount: totalPaid,
            pendingAmount: pendingAmount,
            paymentStatus: paymentComplete ? "Complete" : `${paymentHistory.length} of ${totalInstallments} payments`,
            paymentComplete,
            paymentHistory,
            hasUnverifiedPayments: paymentHistory.some((p: any) => !p.is_verified_by_accountant),
            financialAgreement: {
              ...ag,
              first_installment_paid: paymentHistory.some(p => p.payment_status === "first"),
              second_installment_paid: paymentHistory.some(p => p.payment_status === "second"),
              third_installment_paid: paymentHistory.some(p => p.payment_status === "third"),
              fourth_installment_paid: totalInstallments === 4 ? paymentHistory.some(p => p.payment_status === "fourth") : undefined
            },
            academicYearId: currentYearId,
            academicYear: yearName
          });
        });
      });

      // Sort students: Primary by Admission Number (Asc), Secondary by Year (Desc)
      processedStudents.sort((a, b) => {
        const numCompare = a.admissionNumber.localeCompare(b.admissionNumber);
        if (numCompare !== 0) return numCompare;
        return b.academicYear.localeCompare(a.academicYear);
      });

      setStudentList(processedStudents);

      console.log('processedStudents', processedStudents);



      // Extract unique classes for filtering
      const classes = [...new Set(processedStudents.map(student => student.grade))] as string[];

      setAvailableClasses(classes);

      // Extract unique sections for filtering
      const studentssection = students.map((student: any) => student.section?.name).filter(Boolean);
      console.log('studentssection', studentssection);

      const section = [...new Set(studentssection)] as string[];


      setavailblesection(section);



      // Calculate yearly summary (STAYS AS ALL YEARS)
      const summaries = academicYears.map(yearObj => {
        const yearStudents = processedStudents.filter(s => s.academicYearId === yearObj.id);
        const totalStudents = yearStudents.length;
        const totalRevenue = yearStudents.reduce((sum: number, student: any) => sum + student.totalFees, 0);
        const totalPaid = yearStudents.reduce((sum: number, student: any) => sum + student.paidAmount, 0);
        const collectionRate = totalRevenue > 0 ? (totalPaid / totalRevenue) * 100 : 0;

        return {
          id: yearObj.id,
          year: yearObj.name,
          students: totalStudents,
          revenue: totalRevenue.toFixed(2),
          paid: totalPaid.toFixed(2),
          collectionRate: collectionRate.toFixed(2)
        };
      })
        .filter(summary => summary.students > 0)
        .sort((a, b) => b.year.localeCompare(a.year));

      setYearlyData(summaries);

    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter students based on Year, search and class/section selection
  const filteredStudents = studentList.filter(student => {
    const matchesYear = selectedYear === 'all' || student.academicYearId === selectedYear;
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === 'all' || student.grade === selectedClass;
    const matchesSection = selectedSection === 'all' || student.section === selectedSection;

    return matchesYear && matchesSearch && matchesClass && matchesSection;
  });

  const showStudentDetails = async (student: any) => {
    setSelectedStudent(student);
    setIsDetailModalOpen(true);
    setDetailLoading(true);

    try {
      // NOTE: The API call here might be redundant if `studentList` already has all details.
      // For this implementation, we assume a fresh fetch is desired for the most up-to-date data.
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/students/students-academic-details/?academic_year_id=${student.academicYearId}&student_id=${student.originalId}`
      );
      // The response for a single student might be an object, not an array. Adjust if needed.
      setStudentDetails(response.data.data[0] || response.data.data);
    } catch (error) {
      console.error('Error fetching student details:', error);
      // Fallback to the already available student data if the detailed fetch fails
      setStudentDetails(student);
    } finally {
      setDetailLoading(false);
    }
  };

  const openPaymentModal = (student: any) => {
    setSelectedStudent(student);
    const installments = getAvailablePayments(student);
    setPaymentData({
      amount: installments.length > 0 ? installments[0].amount : "",
      paymentSlip: null,
      paymentStatus: installments.length > 0 ? installments[0].value : "first",
      isVerified: false,
      payment_method: "cash",
      cheque_number: "",
      transaction_number: "",
      bank_name: ""
    });
    setAvailableInstallments(installments);
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
      currentAgreement = agreementData.find(a => a.academic_year === academicYearId);
    } else if (agreementData && typeof agreementData === 'object') {
      // Case 2: The data is a single object.

      // We check if this single object's academic_year matches what we need.
      if (agreementData.academic_year === academicYearId) {
        currentAgreement = agreementData;
      }
    }
    // --- END OF NEW LOGIC ---

    if (!currentAgreement) {
      // This will now only trigger if the data is truly missing or the ID doesn't match
      console.error("No financial agreement found for the current academic year:", academicYearId);

      return;
    }

    // The rest of the function remains the same...

    const payload: any = {};
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
      const paidBeforeThis = parseFloat(selectedStudent.paidAmount.toFixed(2));

      const selectedInstallment = availableInstallments.find(
        (i) => i.value === paymentData.paymentStatus
      );

      if (!selectedInstallment) {
        throw new Error("No installment selected");
      }

      const remainingBeforeThis = parseFloat((totalFees - paidBeforeThis).toFixed(2));
      const isFinalPayment = remainingBeforeThis <= parseFloat(selectedInstallment.amount) + 0.01;
      const amountToPay = isFinalPayment ? remainingBeforeThis : parseFloat(selectedInstallment.amount);
      const remainingAfterThis = parseFloat((totalFees - (paidBeforeThis + amountToPay)).toFixed(2));

      if (amountToPay <= 0) {
        throw new Error("Payment amount must be greater than zero");
      }

      const formData = new FormData();
      formData.append("student", selectedStudent.originalId); // Use originalId for API
      formData.append("academic_year", selectedStudent.academicYearId);
      formData.append("payment_status", paymentData.paymentStatus);
      formData.append("paid_amount", amountToPay.toFixed(2));
      formData.append("paid_amount_in_words", numberToWords(amountToPay));
      formData.append("total_amount", totalFees.toFixed(2));
      formData.append("remaining_amount", remainingAfterThis.toFixed(2));
      formData.append("payment_method", paymentData.payment_method);

      if (paymentData.payment_method === 'cheque') {
        formData.append("cheque_number", paymentData.cheque_number);
        formData.append("bank_name", paymentData.bank_name);
      } else if (paymentData.payment_method === 'visa') {
        formData.append("transaction_number", paymentData.transaction_number);
      }

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
        Swal.fire({
          title: 'Success!',
          text: 'Payment recorded successfully!',
          icon: 'success',
          timer: 5000,
          timerProgressBar: true,
          confirmButtonText: 'OK'
        });

        // *** NEW: Call the function to update payment flags ***
        await updatePaymentFlags(
          selectedStudent,
          selectedStudent.academicYearId, // Pass the specific academic year ID
          paymentData.paymentStatus,
          amountToPay
        );

        // Refresh data and close modal as before
        // Refresh data and update current student details to show the new signature button
        await fetchStudentData('all');
        
        // Re-fetch current student details to update the signature section immediately
        if (selectedStudent) {
          try {
            const detailRes = await axios.get(
              `${import.meta.env.VITE_API_BASE_URL}/students/students-academic-details/?academic_year_id=${selectedStudent.academicYearId}&student_id=${selectedStudent.originalId}`
            );
            const updatedDetails = detailRes.data.data[0] || detailRes.data.data;
            setStudentDetails(updatedDetails);
            setSelectedStudent(updatedDetails); // Update parent state as well
          } catch (detailsError) {
            console.error("Error refreshing student details:", detailsError);
          }
        }
        
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
      a.target = '_blank';
      a.download = `receipt-${paymentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      Swal.fire({
        title: 'Success!',
        text: 'Receipt downloaded successfully!',
        icon: 'success',
        timer: 5000,
        timerProgressBar: true,
        confirmButtonText: 'OK'
      });

    } catch (error) {
      console.error('Error downloading receipt:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to download receipt.',
        icon: 'error',
        timer: 5000,
        timerProgressBar: true,
        confirmButtonText: 'OK'
      });
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

    if (payments.length === 0 && remainingAmount > 0.01) {
      payments.push({
        value: "full",
        label: `Balance Payment (${remainingAmount.toFixed(2)} OMR)`,
        amount: remainingAmount.toFixed(2)
      });
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
      paid_amount: parseFloat(payment.paid_amount || "0"),
      totalFees: selectedStudent?.totalFees,
      pendingAmount: selectedStudent?.pendingAmount
    });
    setIsSignatureModalOpen(true);
  };

  const closeSignatureModal = () => {
    setIsSignatureModalOpen(false);
    setSigningPaymentInfo(null);
    accountantSigPad.current?.clear();
    adminSigPad.current?.clear();
  };

  const handleInitiateSigning = (payment: any) => {
    openSignatureModal(payment);
  };

  const handleViewReceipt = (payment: any) => {
    const url = getFullUrl(payment.payment_slip);
    if (url) {
      window.open(url, '_blank');
    } else {
      Swal.fire({
        title: 'Error!',
        text: 'Receipt file not found.',
        icon: 'error',
        timer: 5000,
        timerProgressBar: true,
        confirmButtonText: 'OK'
      });
    }
  };

  const handleDownloadSignedReceipt = (payment: any) => {
    const url = getFullUrl(payment.payment_slip);
    if (url) {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.download = `receipt-${payment.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      Swal.fire({
        title: 'Error!',
        text: 'Receipt file not found.',
        icon: 'error',
        timer: 5000,
        timerProgressBar: true,
        confirmButtonText: 'OK'
      });
    }
  };

  const dataURLtoBlob = (dataurl: string) => {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) return null;
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  const handleAttachSignatureAndDownload = async () => {
    if (accountantSigPad.current?.isEmpty() || adminSigPad.current?.isEmpty()) {
      Swal.fire({
        title: 'Error!',
        text: 'Both signatures are required.',
        icon: 'error',
        timer: 5000,
        timerProgressBar: true,
        confirmButtonText: 'OK'
      });
      return;
    }

    setIsAttachingSignature(true);

    try {
      // === 0. PATCH MISSING DATA IN DB FIRST (To ensure PDF gets correct values) ===
      await api.patch(
        `/students/payment-history/${signingPaymentInfo.paymentId}/`,
        {
          total_amount: signingPaymentInfo.totalFees.toFixed(2),
          remaining_amount: signingPaymentInfo.pendingAmount.toFixed(2),
          paid_amount_in_words: numberToWords(signingPaymentInfo.paid_amount)
        },
        { headers: { "Content-Type": "application/json" } }
      );

      // === 1. DOWNLOAD THE ORIGINAL, UNSIGNED RECEIPT PDF ===
      // Added a timestamp cache-buster to ensure we get the latest generated PDF
      const pdfResponse = await api.get(
        `/students/students/${signingPaymentInfo.paymentId}/download-payment-receipt/?t=${new Date().getTime()}`,
        {
          responseType: 'arraybuffer',
        }
      );

      // === 2. LOAD THE PDF AND PREPARE SIGNATURE IMAGES ===
      const pdfDoc = await PDFDocument.load(pdfResponse.data);

      const accountantSignatureUrl = accountantSigPad.current.toDataURL('image/png');
      const adminSignatureUrl = adminSigPad.current.toDataURL('image/png');

      const [accountantPngBytes, adminPngBytes] = await Promise.all([
        fetch(accountantSignatureUrl).then((res) => res.arrayBuffer()),
        fetch(adminSignatureUrl).then((res) => res.arrayBuffer()),
      ]);

      const accountantImage = await pdfDoc.embedPng(accountantPngBytes);
      const adminImage = await pdfDoc.embedPng(adminPngBytes);

      // === 3. EMBED THE SIGNATURES ONTO THE PDF ===
      const page = pdfDoc.getPages()[0];
      const { width, height } = page.getSize();

      // Place signatures on top of footer labels (tuned for A5 Landscape: 595x421 pts)
      // Accountant Signature (Center area)
      page.drawImage(accountantImage, {
        x: 245,     // Centered on "Accountant Sig." label
        y: 65,      // Moved up to avoid overlap
        width: 100,
        height: 35,
      });

      // Authorized Signature (Right area)
      page.drawImage(adminImage, {
        x: 445,     // Aligned with "Authorized Signatory" label
        y: 65,      // Moved up to avoid overlap
        width: 100,
        height: 35,
      });

      // === 4. SAVE THE MODIFIED PDF AND PREPARE FOR UPLOAD ===
      const signedPdfBytes = await pdfDoc.save();
      const blob = new Blob([signedPdfBytes], { type: 'application/pdf' });

      const formData = new FormData();
      formData.append("payment_slip", blob, `signed-receipt-${signingPaymentInfo.paymentId}.pdf`);
      formData.append("is_verified_by_accountant", 'true');
      formData.append("total_amount", signingPaymentInfo.totalFees.toFixed(2));
      formData.append("remaining_amount", signingPaymentInfo.pendingAmount.toFixed(2));

      // === 5. UPLOAD THE FINAL, SIGNED PDF AND DATA ===
      await api.patch(
        `/students/payment-history/${signingPaymentInfo.paymentId}/`,
        formData
      );

      Swal.fire({
        title: 'Success!',
        text: 'Receipt signed and updated successfully!',
        icon: 'success',
        timer: 5000,
        timerProgressBar: true,
        confirmButtonText: 'OK'
      });

      // Trigger a direct download for the user's convenience
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = downloadUrl;
      a.target = '_blank';
      a.download = `receipt-signed-${signingPaymentInfo.paymentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      a.remove();

      closeSignatureModal();
      await fetchStudentData('all'); // Refresh the data grid

    } catch (error) {
      console.error("Error during client-side signing process:", error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to sign and update receipt. Please try again.',
        icon: 'error',
        timer: 5000,
        timerProgressBar: true,
        confirmButtonText: 'OK'
      });
    } finally {
      setIsAttachingSignature(false);
    }
  };

  const handleExcelExport = () => {
    if (exportSelectedYears.length === 0) {
      toast.error("Please select at least one academic year to export.");
      return;
    }

    try {
      // Filter yearlyData by selected years
      const dataToExport = yearlyData.filter(y => exportSelectedYears.includes(y.id));

      if (dataToExport.length === 0) {
        toast.error("No data found for the selected academic years.");
        return;
      }

      // Prepare data for Excel (Summary only)
      const excelData = dataToExport.map(item => ({
        'Academic Year': item.year,
        'Students': item.students,
        'Total Revenue (OMR)': item.revenue,
        'Paid Amount (OMR)': item.paid,
        'Collection Rate (%)': `${item.collectionRate}%`
      }));

      // Create Worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Auto-size columns
      const maxLengths = excelData.reduce((acc: any, row: any) => {
        Object.keys(row).forEach((key, i) => {
          const val = row[key] ? row[key].toString() : '';
          acc[i] = Math.max(acc[i] || 0, val.length, key.length);
        });
        return acc;
      }, []);

      if (worksheet['!cols'] === undefined) worksheet['!cols'] = [];
      maxLengths.forEach((w: number, i: number) => {
        worksheet['!cols']![i] = { w: w + 2 };
      });

      // Create Workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Financial Report");

      // Generate Filename
      const filename = `Financial_Report_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Download
      XLSX.writeFile(workbook, filename);

      setIsExportModalOpen(false);
      toast.success("Excel report generated successfully!");
    } catch (error) {
      console.error("Export Error:", error);
      toast.error("Failed to generate Excel report.");
    }
  };


  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Main Action Tabs */}
      {/* *** MODIFICATION: Removed the tab container and the second button *** */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          className={`px-6 py-3 font-medium border-b-2 border-red-600 text-red-600`}
        >
          <FileSpreadsheet className="inline mr-2 h-4 w-4" />
          Yearly Management | الإدارة السنوية
        </button>
      </div>

      {/* Content Area */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : (
          // *** MODIFICATION: This is now the only content view ***
          <div className="space-y-6">
            {/* --- Yearly Financial Summary Section --- */}
            <Card className="border-gray-200 overflow-hidden">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl font-bold">
                  Financial Summary | ملخص مالي
                </CardTitle>
                <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3 w-full sm:w-auto">
                  <div className="w-full sm:w-40 md:w-48">
                    <select
                      className="block w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      value={summaryYearFilter}
                      onChange={(e) => setSummaryYearFilter(e.target.value)}
                    >
                      <option value="all">All Years</option>
                      {academicYears.map((year) => (
                        <option key={year.id} value={year.id}>
                          {year.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center justify-center gap-2 whitespace-nowrap h-9 px-3"
                    onClick={() => {
                      setExportSelectedYears(academicYears.map(y => y.id));
                      setIsExportModalOpen(true);
                    }}
                  >
                    <Download className="h-4 w-4 text-red-600" />
                    <span className="text-xs sm:text-sm">Export | تصدير</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          YEAR | السنة
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          STUDENTS | الطلاب
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          TOTAL REVENUE | إجمالي الإيرادات
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          PAID | المدفوع
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          COLLECTION RATE | معدل التحصيل
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {yearlyData
                        .filter(year => summaryYearFilter === 'all' || year.id === summaryYearFilter)
                        .map((year, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {year.year}
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                              {year.students}
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                              {year.revenue} OMR
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                              {year.paid} OMR
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                              {year.collectionRate}%
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* --- Student List / Billing Section --- */}
            {/* *** MODIFICATION: This entire Card was moved here from the old 'billing' tab *** */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">
                  Student List for {yearlyData[0]?.year} | قائمة الطلاب لسنة {yearlyData[0]?.year}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 mb-6 items-end">
                  <div className="relative w-full">
                    <Label className="text-xs mb-1.5 block text-gray-500 font-medium">Search | بحث</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search..."
                        className="pl-10 h-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="w-full">
                    <Label className="text-xs mb-1.5 block text-gray-500 font-medium font-medium">Year | السنة</Label>
                    <select
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-sm h-10"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                    >
                      <option value="all">All Years</option>
                      {academicYears.map((year) => (
                        <option key={year.id} value={year.id}>{year.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full">
                    <Label className="text-xs mb-1.5 block text-gray-500 font-medium font-medium font-medium">Class | الصف</Label>
                    <select
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-sm h-10"
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                    >
                      <option value="all">All Classes</option>
                      {availableClasses.map((cl) => (
                        <option key={cl} value={cl}>{cl}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full">
                    <Label className="text-xs mb-1.5 block text-gray-500 font-medium font-medium font-medium font-medium">Section | الفصل</Label>
                    <select
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-sm h-10"
                      value={selectedSection}
                      onChange={(e) => setSelectedSection(e.target.value)}
                    >
                      <option value="all">All Sections</option>
                      {availblesection.map((sec) => (
                        <option key={sec} value={sec}>{sec}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full sm:col-span-2 lg:col-span-1">
                    <Button 
                      variant="outline" 
                      className="w-full h-10 text-gray-600 border-gray-200 hover:bg-gray-50"
                      onClick={() => {
                        setSelectedYear("all");
                        setSelectedClass("all");
                        setSelectedSection("all");
                        setSearchQuery("");
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Admission Number | رقم القبول
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name | الاسم
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Class | الصف
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Year | السنة
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
                        filteredStudents.map((student) => (
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.grade} {student.section ? `- ${student.section}` : ''}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.academicYear}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${student.status === 'Active'
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                              {student.pendingAmount.toFixed(2)} OMR
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${student.paymentComplete ?
                                'bg-green-100 text-green-800' :
                                (student.paidAmount > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800')
                                }`}>
                                {student.paymentComplete ? 'Complete' : student.paymentStatus}
                              </span>
                              {student.hasUnverifiedPayments && (
                                <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                  Un-verified
                                </span>
                              )}
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => showStudentDetails(student)}
                                  className="h-8 shadow-sm"
                                >
                                  <List className="h-4 w-4 mr-1" />
                                  Details
                                </Button>
                                {!student.paymentComplete && (
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => openPaymentModal(student)}
                                    className="h-8 shadow-sm bg-red-600 hover:bg-red-700"
                                  >
                                    <FileText className="h-4 w-4 mr-1" />
                                    Record
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
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
          </div>
        )}

        {/* Student Details Modal (Payment History Popup) */}
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
                    <CardHeader className="py-3 sm:py-4">
                      <CardTitle className="text-base sm:text-lg">Basic Information | المعلومات الأساسية</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base">
                      <div className="space-y-2">
                        <p><strong>Admission Number:</strong> {selectedStudent.admissionNumber}</p>
                        <p><strong>Name:</strong> {selectedStudent.name}</p>
                        <p><strong>الاسم:</strong> {selectedStudent.nameAr}</p>
                        <p><strong>Class:</strong> {selectedStudent.grade} {selectedStudent.section ? `- ${selectedStudent.section}` : ''}</p>
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
                          <p><strong>Tuition Fees:</strong> {selectedStudent.financialAgreement.tution_fee} OMR</p>
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
                                    {payment.is_verified_by_accountant ? (
                                      <div className="flex space-x-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-blue-600 hover:text-blue-800"
                                          onClick={() => handleViewReceipt(payment)}
                                        >
                                          <Eye className="h-4 w-4 mr-1" />
                                          View
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="border-blue-200 text-blue-700"
                                          onClick={() => handleDownloadSignedReceipt(payment)}
                                        >
                                          <Download className="h-4 w-4 mr-1" />
                                          Download
                                        </Button>
                                      </div>
                                    ) : (
                                      <div className="flex space-x-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="border-red-200 text-red-700 hover:bg-red-50"
                                          onClick={() => handleInitiateSigning(payment)}
                                          disabled={downloadingReceiptId === payment.id}
                                        >
                                          <Edit className="h-4 w-4 mr-1" />
                                          Sign & Download
                                        </Button>
                                      </div>
                                    )}
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
                        <p className={`text-xl ${selectedStudent.pendingAmount > 0 ? 'text-red-600' : 'text-gray-600'
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
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
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
                    <span>Admission Number:</span>
                    <span className="font-medium">{selectedStudent?.admissionNumber}</span>
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
                      <Label htmlFor="payment_method">Payment Method</Label>
                      <select
                        id="payment_method"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                        value={paymentData.payment_method}
                        onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value })}
                        disabled={availableInstallments.length === 0}
                      >
                        <option value="cash">Cash | نقداً</option>
                        <option value="cheque">Cheque | شيك</option>
                        <option value="visa">Visa/Card | فيزا / بطاقة</option>
                      </select>
                    </div>

                    {paymentData.payment_method === 'cheque' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="cheque_number">Cheque Number</Label>
                          <Input
                            id="cheque_number"
                            value={paymentData.cheque_number}
                            onChange={(e) => setPaymentData({ ...paymentData, cheque_number: e.target.value })}
                            placeholder="Enter cheque number"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bank_name">Bank Name</Label>
                          <Input
                            id="bank_name"
                            value={paymentData.bank_name}
                            onChange={(e) => setPaymentData({ ...paymentData, bank_name: e.target.value })}
                            placeholder="Enter bank name"
                            required
                          />
                        </div>
                      </>
                    )}

                    {paymentData.payment_method === 'visa' && (
                      <div className="space-y-2">
                        <Label htmlFor="transaction_number">Transaction Number</Label>
                        <Input
                          id="transaction_number"
                          value={paymentData.transaction_number}
                          onChange={(e) => setPaymentData({ ...paymentData, transaction_number: e.target.value })}
                          placeholder="Enter transaction number"
                          required
                        />
                      </div>
                    )}

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
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Signatures to Receipt</DialogTitle>
              <DialogDescription>
                Please provide the required signatures
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              {/* Accountant Signature */}
              <div className="space-y-2">
                <Label htmlFor="accountant-sig">Accountant Signature</Label>
                <div className="border rounded-md">
                  <SignatureCanvas
                    ref={accountantSigPad}
                    canvasProps={{ className: 'w-full h-32' }}
                  />
                </div>
                <Button size="sm" variant="ghost" onClick={() => accountantSigPad.current?.clear()}>Clear</Button>
              </div>

              {/* Authorized Signatory */}
              <div className="space-y-2">
                <Label htmlFor="admin-sig">Authorized Signatory</Label>
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

      {/* Excel Export Modal */}
      <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Export Financial Report | تصدير التقرير المالي</DialogTitle>
            <DialogDescription>
              Select the academic years you want to include in the Excel report.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b">
              <span className="text-sm font-medium">Select All Acadmic Years</span>
              <Checkbox
                checked={exportSelectedYears.length === academicYears.length}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setExportSelectedYears(academicYears.map(y => y.id));
                  } else {
                    setExportSelectedYears([]);
                  }
                }}
              />
            </div>
            <div className="max-h-[200px] overflow-y-auto space-y-3 pt-2">
              {academicYears.map((year) => (
                <div key={year.id} className="flex items-center justify-between">
                  <label
                    htmlFor={`year-${year.id}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {year.name}
                  </label>
                  <Checkbox
                    id={`year-${year.id}`}
                    checked={exportSelectedYears.includes(year.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setExportSelectedYears([...exportSelectedYears, year.id]);
                      } else {
                        setExportSelectedYears(exportSelectedYears.filter(id => id !== year.id));
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>Cancel</Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleExcelExport}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Excel | تحميل الملف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountAdminDashboard;