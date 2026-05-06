import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, List, FileSpreadsheet, Filter, Download, Users, TrendingUp, Search, X, Loader2, Edit, Eye, Clock, CheckCircle2 } from "lucide-react";
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
    isVerified: false,
    payment_method: "cash",
    cheque_number: "",
    transaction_number: "",
    bank_name: "",
    payment_link: "",
    paid_by: "",
    isOtherPayer: false
  });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [availableInstallments, setAvailableInstallments] = useState<any[]>([]);
  const [downloadingReceiptId, setDownloadingReceiptId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');

  // Export Modal States
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportSelectedYears, setExportSelectedYears] = useState<string[]>([]);


  // === NEW STATES for the signature process ===
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [signingPaymentInfo, setSigningPaymentInfo] = useState<any>(null); // To store info of the payment being signed
  const [isAttachingSignature, setIsAttachingSignature] = useState(false);
  const [hasSignature, setHasSignature] = useState<boolean>(true);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [isSavingSignature, setIsSavingSignature] = useState(false);

  // Refs for the signature pads
  const accountantSigPad = useRef<SignatureCanvas>(null);
  const adminSigPad = useRef<SignatureCanvas>(null);


  // Fetch academic years on component mount
  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        const response = await api.get(`/students/academic-year/`);
        setAcademicYears(response.data.data);
        if (response.data.data.length > 0) {
          // No longer setting selectedYear here, as it defaults to 'all'
        }
      } catch (error) {
        console.error('Error fetching academic years:', error);
      }
    };

    const checkSignature = async () => {
      try {
        const response = await api.get(`/accounts/signature/`);
        setHasSignature(response.data.has_signature);
        setSignatureUrl(response.data.signature_image);
      } catch (error) {
        console.error('Error checking signature:', error);
      }
    };

    fetchAcademicYears();
    checkSignature();

    // Listen for real-time signature updates from the management modal
    const handleSignatureUpdate = (event: any) => {
      const { hasSignature: newHasSignature, signatureUrl: newSignatureUrl } = event.detail;
      setHasSignature(newHasSignature);
      setSignatureUrl(newSignatureUrl);
    };

    window.addEventListener('signatureUpdated', handleSignatureUpdate);

    return () => {
      window.removeEventListener('signatureUpdated', handleSignatureUpdate);
    };
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
          bank_name: "",
          payment_link: "",
          paid_by: "",
          isOtherPayer: false
        }));
      }
    }
  }, [selectedStudent]);

  const fetchStudentData = async (yearId: string) => {
    setLoading(true);
    try {
      // Always fetch all students for all years to enable global filtering
      const response = await api.get(`/students/students-academic-details/?academic_year_id=all`);
      const students = response.data.data;

      console.log('student details', students);




      // Process student data with enhanced payment information

      const studentMap = new Map();
      const processedStudents: any[] = [];

      students.forEach((student: any) => {
        // Log if student is deleted
        if (student.is_deleted) {
          console.warn(`[Dashboard Audit] Student "${student.en_first_name} ${student.en_last_name}" is skipped because they are marked as DELETED.`);
        }

        const ags = Array.isArray(student.financial_agreement) ? student.financial_agreement : [];

        // In "All" view, show one row per academic year for the student
        ags.forEach((ag: any) => {
          const currentYearId = ag.academic_year;
          const yearName = academicYears.find(y => y.id === currentYearId)?.name || currentYearId;
          // Use Financial Agreement ID as unique key to show all agreements (12 records)
          const uniqueKey = ag.id;

          // Skip if we already processed this exact agreement (unlikely with ID but safe)
          if (studentMap.has(uniqueKey)) return;
          studentMap.set(uniqueKey, true);

          const paymentHistory = (student.payment_history || []).filter((p: any) => p.financial_agreement === ag.id);
          const totalFees = parseFloat(ag.total_fees_omr || "0");

          // Use Flag-Driven Calculation for Total Paid (STRICT BOOLEAN CHECK)
          let calculatedTotalPaid = 0;
          if (ag.first_installment_paid === true) calculatedTotalPaid += parseFloat(ag.initial_paid_amount || "0");
          if (ag.second_installment_paid === true) calculatedTotalPaid += parseFloat(ag.installment2_amount || "0");
          if (ag.third_installment_paid === true) calculatedTotalPaid += parseFloat(ag.installment3_amount || "0");
          if (ag.fourth_installment_paid === true) calculatedTotalPaid += parseFloat(ag.installment4_amount || "0");

          // If the final completion flag is true, ensure it represents the absolute total
          if (ag.payment_completed === true) calculatedTotalPaid = totalFees;

          const totalPaid = parseFloat(calculatedTotalPaid.toFixed(3));
          const pendingAmount = parseFloat((totalFees - totalPaid).toFixed(3));
          const paymentComplete = ag.payment_completed || pendingAmount <= 0.01;

          const initialPaidValue = parseFloat(ag.initial_paid_amount || "0");

          const totalInstallments = ag.installment_plan === "one" ? 1 : ag.installment_plan === "two" ? 2 : 4;
          const paidFlags = (ag.first_installment_paid ? 1 : 0) + 
                          (ag.second_installment_paid ? 1 : 0) + 
                          (ag.third_installment_paid ? 1 : 0) + 
                          (ag.fourth_installment_paid ? 1 : 0);

          const getPaidInstallmentsList = () => {
            const list: string[] = [];
            if (ag.first_installment_paid) list.push("1st");
            if (ag.second_installment_paid) list.push("2nd");
            if (ag.third_installment_paid) list.push("3rd");
            if (ag.fourth_installment_paid) list.push("4th");
            return list.length > 0 ? list.join(", ") : "None";
          };

          const installmentTypeText = ag.installment_plan === "one" ? "One-time" : 
                             ag.installment_plan === "two" ? "2 Installments" : 
                             ag.installment_plan === "four" ? "4 Installments" : ag.installment_plan;

          processedStudents.push({
            id: uniqueKey, // Unique ID for table keys
            originalId: student.id,
            admissionNumber: student.admission_number,
            name: `${student.en_first_name || ""} ${student.en_middle_name || ""} ${student.en_grandfather_name || ""} ${student.en_last_name || ""}`.replace(/\s+/g, ' ').trim(),
            nameAr: `${student.ar_first_name || ""} ${student.ar_middle_name || ""} ${student.ar_grandfather_name || ""} ${student.ar_last_name || ""}`.replace(/\s+/g, ' ').trim(),
            grade: student.admission_class?.department_name || 'N/A',
            section: student.section?.name || '',
            status: student.is_active ? 'Active' : 'Inactive',
            totalFees,
            paidAmount: totalPaid,
            // Use model balance_amount if it has a positive value or if payment is actually complete.
            // Otherwise, fallback to calculation for existing/unitialized records.
            pendingAmount: (ag.balance_amount > 0 || (totalPaid >= totalFees - 0.01))
              ? parseFloat(ag.balance_amount.toString())
              : parseFloat((totalFees - totalPaid).toFixed(2)),
            initiallyPaid: initialPaidValue,
            installmentType: installmentTypeText,
            paidInstallments: getPaidInstallmentsList(),
            paymentStatus: paymentComplete ? "Complete | مكتمل" : "Pending | بانتظار الدفع",
            paymentComplete,
            paymentHistory,
            hasUnverifiedPayments: paymentHistory.some((p: any) => !p.is_verified_by_accountant),
            financialAgreement: ag,
            academicYearId: currentYearId,
            academicYear: yearName,
            originalStudentObj: student
          });
        });
      });

      // Sort students: 
      // 1. Pending Recording (incomplete payment)
      // 2. Un-verified Payments (has unverified records)
      // 3. Completed
      processedStudents.sort((a, b) => {
        // Define priority levels
        const getPriority = (s: any) => {
          if (!s.paymentComplete) return 0; // Recording needed (Highest priority)
          if (s.hasUnverifiedPayments) return 1; // Verification needed
          return 2; // Completed (Lowest priority)
        };

        const priorityA = getPriority(a);
        const priorityB = getPriority(b);

        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }

        // Secondary sort: Admission Number (Asc)
        const numCompare = a.admissionNumber.localeCompare(b.admissionNumber);
        if (numCompare !== 0) return numCompare;

        // Tertiary sort: Year (Desc)
        return b.academicYear.localeCompare(a.academicYear);
      });

      setStudentList(processedStudents);

      console.log('processedStudents', processedStudents);



      // Extract unique classes for filtering
      const classes = [...new Set(processedStudents.map(student => student.grade))] as string[];

      setAvailableClasses(classes);

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
    // 1. Check Year
    const matchesYear = selectedYear === 'all' || student.academicYearId === selectedYear;

    // 2. Check Search (Name or Admission Number)
    const searchLow = searchQuery.toLowerCase().trim();
    const matchesSearch = !searchLow ||
      (student.name || "").toLowerCase().includes(searchLow) ||
      (student.nameAr || "").toLowerCase().includes(searchLow) ||
      (student.admissionNumber || "").toLowerCase().includes(searchLow);

    // 3. Check Class
    const matchesClass = selectedClass === 'all' || student.grade === selectedClass;

    // 4. Check Payment Status (Filter Cards)
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'pending' && !student.paymentComplete) ||
      (filterStatus === 'completed' && student.paymentComplete);

    return matchesYear && matchesSearch && matchesClass && matchesStatus;
  });

  // Calculate counts for the filter cards based on Year/Class/Search but NOT the card's own filterStatus
  const baseFilteredStudents = studentList.filter(student => {
    const matchesYear = selectedYear === 'all' || student.academicYearId === selectedYear;
    const searchLow = searchQuery.toLowerCase().trim();
    const matchesSearch = !searchLow ||
      (student.name || "").toLowerCase().includes(searchLow) ||
      (student.nameAr || "").toLowerCase().includes(searchLow) ||
      (student.admissionNumber || "").toLowerCase().includes(searchLow);
    const matchesClass = selectedClass === 'all' || student.grade === selectedClass;
    return matchesYear && matchesSearch && matchesClass;
  });

  const totalStudentsCount = baseFilteredStudents.length;
  const pendingStudentsCount = baseFilteredStudents.filter(s => !s.paymentComplete).length;
  const completedStudentsCount = baseFilteredStudents.filter(s => s.paymentComplete).length;

  const showStudentDetails = async (student: any) => {
    setSelectedStudent(student);
    setIsDetailModalOpen(true);
    setDetailLoading(true);

    try {
      // NOTE: The API call here might be redundant if `studentList` already has all details.
      // For this implementation, we assume a fresh fetch is desired for the most up-to-date data.
      const response = await api.get(
        `/students/students-academic-details/?academic_year_id=${student.academicYearId}&student_id=${student.originalId}`
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
      bank_name: "",
      payment_link: "",
      paid_by: "",
      isOtherPayer: false
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


  // updatePaymentFlags removed: logic migrated to backend models.py for robust automation.


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
      const amountToPay = parseFloat(paymentData.amount);
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
      } else if (paymentData.payment_method === 'visa' || paymentData.payment_method === 'link') {
        formData.append("transaction_number", paymentData.transaction_number);
      } else if (paymentData.payment_method === 'transfer') {
        // Bank name and Transaction number removed for transfer per user request
      }

      if (paymentData.payment_link) {
        formData.append("payment_link", paymentData.payment_link);
      }

      if (paymentData.paid_by) {
        formData.append("paid_by", paymentData.paid_by);
      }

      if (selectedStudent.financialAgreement?.id) {
        formData.append("financial_agreement", selectedStudent.financialAgreement.id);
      }

      if (paymentData.paymentSlip) {
        formData.append("payment_slip", paymentData.paymentSlip);
      }

      const response = await api.post(
        `/students/payment-history/`,
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


        // Logic removed: flags and installment re-balancing are now handled by the backend on save.

        // Refresh data and close modal as before
        // Refresh data and update current student details to show the new signature button
        await fetchStudentData('all');

        // Re-fetch current student details to update the signature section immediately
        if (selectedStudent) {
          try {
            const detailRes = await api.get(
              `/students/students-academic-details/?academic_year_id=${selectedStudent.academicYearId}&student_id=${selectedStudent.originalId}`
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
      const response = await api.get(
        `/students/students/${paymentId}/download-payment-receipt/`,
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

    // Calculate remaining amount based on student.pendingAmount (which is ag.balance_amount)
    const remainingAmount = student.pendingAmount;

    // For one-time payment plan
    if (agreement.installment_plan === "one") {
      return [{
        value: "full",
        label: `Full Payment (${remainingAmount.toFixed(2)} OMR)`,
        amount: remainingAmount.toFixed(2),
        isFixed: true
      }];
    }

    const initialAmount = parseFloat(agreement.installment1_amount || "0");
    const balanceAfterInitial = totalFees - initialAmount;

    // For two-installment plan
    if (agreement.installment_plan === "two") {
      if (!agreement.first_installment_paid) {
        payments.push({
          value: "first",
          label: `Initial Payment (${initialAmount.toFixed(3)} OMR)`,
          amount: initialAmount.toFixed(2),
          isFixed: true
        });
      } else if (!agreement.second_installment_paid) {
        // For 2 installments, the 2nd one is the final balance and is fixed
        payments.push({
          value: "second",
          label: `Second Installment (${remainingAmount.toFixed(3)} OMR)`,
          amount: remainingAmount.toFixed(2),
          isFixed: true 
        });
      }
    }

    // For four-installment plan
    if (agreement.installment_plan === "four") {
      if (!agreement.first_installment_paid) {
        payments.push({
          value: "first",
          label: `Initial Payment (${initialAmount.toFixed(3)} OMR)`,
          amount: initialAmount.toFixed(2),
          isFixed: true
        });
      } else {
        // Pre-fill calculation: (Total - Initial) / 3
        const standardInstallment = balanceAfterInitial / 3;
        
        if (!agreement.second_installment_paid) {
          payments.push({
            value: "second",
            label: `Second Installment (${standardInstallment.toFixed(3)} OMR)`,
            amount: standardInstallment.toFixed(2),
            isFixed: false // Editable
          });
        } else if (!agreement.third_installment_paid) {
          payments.push({
            value: "third",
            label: `Third Installment (${standardInstallment.toFixed(3)} OMR)`,
            amount: standardInstallment.toFixed(2),
            isFixed: false // Editable
          });
        } else if (!agreement.fourth_installment_paid) {
          payments.push({
            value: "fourth",
            label: `Fourth Installment (${remainingAmount.toFixed(3)} OMR)`,
            amount: remainingAmount.toFixed(2),
            isFixed: true // Last one is fixed buffer
          });
        }
      }
    }

    // Always add "Other Payment" option for 2 and 4 installments if balance remains AND initial is paid
    if (agreement.installment_plan !== "one" && agreement.first_installment_paid && remainingAmount > 0.01) {
       payments.push({
          value: "other",
          label: `Other Payment | دفعة أخرى (${remainingAmount.toFixed(3)} OMR)`,
          amount: remainingAmount.toFixed(2),
          isFixed: false
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

  const handleViewReceipt = async (payment: any) => {
    const paymentId = payment.id;
    if (!paymentId) return;

    const newWindow = window.open('about:blank', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>View Receipt | AL-MAWHIBA</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; background-color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; color: #1e293b; }
              .card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); text-align: center; }
              .spinner { width: 32px; height: 32px; border: 3px solid #f1f5f9; border-bottom-color: #fca5a5; border-radius: 50%; display: inline-block; animation: rotation 1s linear infinite; margin-bottom: 1rem; }
              @keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="spinner"></div>
              <div style="font-weight: 600;">Loading Receipt PDF...</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 8px;">Fetching payment record...</div>
            </div>
          </body>
        </html>
      `);
    }

    try {
      const response = await api.get(`/students/students/${paymentId}/download-payment-receipt/`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));

      if (newWindow) {
        newWindow.location.href = url;
      } else {
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error("Failed to view receipt:", error);
      if (newWindow) newWindow.close();
      toast.error("Failed to load receipt. Please try again.");
    }
  };

  const handleDownloadSignedReceipt = async (payment: any) => {
    await handleDownloadReceipt(payment.id);
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
    if (adminSigPad.current?.isEmpty()) {
      Swal.fire({
        title: 'Empty Signature',
        text: 'The Authorized Signatory signature is required.',
        icon: 'warning',
        timer: 3000,
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

      // Capture only the Authorized Signatory pad
      const adminSignatureUrl = adminSigPad.current.toDataURL('image/png');

      const [adminPngBytes] = await Promise.all([
        fetch(adminSignatureUrl).then((res) => res.arrayBuffer()),
      ]);

      const adminImage = await pdfDoc.embedPng(adminPngBytes);

      // === 3. EMBED THE SIGNATURE ONTO THE PDF ===
      // Note: Accountant signature is now dynamically injected by the server inside the base PDF.
      const page = pdfDoc.getPages()[0];
      const { width, height } = page.getSize();

      // Place the manual signature on the RIGHT side footer (Authorized Signatory)
      page.drawImage(adminImage, {
        x: 405,      // Slightly adjusted for better centering
        y: 88,       // Moved UP (from 80) to avoid overlapping the name
        width: 80,   // Reduced from 90
        height: 28,  // Reduced from 35
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
      const patchResponse = await api.patch(
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
      
      // Update the selected student's payment history locally so the UI updates immediately
      if (selectedStudent && patchResponse.data?.data) {
        const updatedPayment = patchResponse.data.data;
        const updatedHistory = selectedStudent.paymentHistory.map((p: any) => 
          p.id === signingPaymentInfo.paymentId ? updatedPayment : p
        );
        setSelectedStudent({
          ...selectedStudent,
          paymentHistory: updatedHistory
        });
      }

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
      {/* Top Warning Banner for Missing Signature */}
      {!hasSignature && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-xl shadow-sm flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-red-100 p-2 rounded-full">
            <X className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-red-800">Signature Required | التوقيع مطلوب</h3>
            <p className="text-xs text-red-700 mt-0.5">
              Your digital signature is not inserted. Please add it to enable document verification. | 
              توقيعك الرقمي غير مدرج. يرجى إضافته لتمكين التحقق من المستندات.
            </p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Financial Accountant Admin | المحاسب المالي
          </h1>
          <p className="text-gray-500 mt-1">
            Manage academic years, fee structures, and student financial records.
          </p>
        </div>
      </div>
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
            {/* Filter Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Total Card */}
              <Card
                className={`cursor-pointer transition-all duration-200 border-2 ${filterStatus === 'all' ? 'border-blue-500 bg-blue-50/50 shadow-md' : 'border-transparent hover:border-blue-200'}`}
                onClick={() => setFilterStatus('all')}
              >
                <CardContent className="p-4 flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${filterStatus === 'all' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600'}`}>
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Total Students | إجمالي الطلاب</p>
                    <p className="text-2xl font-black text-slate-800">{totalStudentsCount}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Pending Card */}
              <Card
                className={`cursor-pointer transition-all duration-200 border-2 ${filterStatus === 'pending' ? 'border-amber-500 bg-amber-50/50 shadow-md' : 'border-transparent hover:border-amber-200'}`}
                onClick={() => setFilterStatus('pending')}
              >
                <CardContent className="p-4 flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${filterStatus === 'pending' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-600'}`}>
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Pending Payments | بانتظار الدفع</p>
                    <p className="text-2xl font-black text-slate-800">{pendingStudentsCount}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Completed Card */}
              <Card
                className={`cursor-pointer transition-all duration-200 border-2 ${filterStatus === 'completed' ? 'border-green-500 bg-green-50/50 shadow-md' : 'border-transparent hover:border-green-200'}`}
                onClick={() => setFilterStatus('completed')}
              >
                <CardContent className="p-4 flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${filterStatus === 'completed' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-600'}`}>
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-green-600 uppercase tracking-wider">Completed | المدفوعات المكتملة</p>
                    <p className="text-2xl font-black text-slate-800">{completedStudentsCount}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* --- Student List / Billing Section --- */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">
                  Student List for {yearlyData[0]?.year} | قائمة الطلاب لسنة {yearlyData[0]?.year}
                </CardTitle>
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
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 mb-6 items-end">
                  <div className="relative w-full">
                    <Label className="text-xs mb-1.5 block text-gray-500 font-medium">Search | بحث</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search Name or Admission Number..."
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
                  {/* Section filter removed */}
                  <div className="w-full sm:col-span-2 lg:col-span-1">
                    <Button
                      variant="outline"
                      className="w-full h-10 text-gray-600 border-gray-200 hover:bg-gray-50"
                      onClick={() => {
                        setSelectedYear("all");
                        setSelectedClass("all");
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
                        <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Class | الصف
                        </th>
                        <th className="hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Year | السنة
                        </th>
                        <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status | الحالة
                        </th>
                        <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Fees | الرسوم الكلية
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Paid | إجمالي المدفوعات
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Remaining Balance | الرصيد المتبقي
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
                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 cursor-pointer hover:text-blue-600"
                              onClick={() => showStudentDetails(student)}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900 truncate max-w-[120px] sm:max-w-xs" title={student.name}>
                                  {student.name || student.nameAr}
                                </span>
                                <span className="lg:hidden text-[10px] text-gray-400 mt-0.5">
                                  {student.grade} {student.section ? `- ${student.section}` : ''} | {student.academicYear}
                                </span>
                              </div>
                            </td>
                            <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.grade} {student.section ? `- ${student.section}` : ''}
                            </td>
                            <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.academicYear}
                            </td>
                            <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${student.status === 'Active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                                }`}>
                                {student.status}
                              </span>
                            </td>
                            <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.totalFees.toFixed(2)} OMR
                            </td>


                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                              {student.paidAmount.toFixed(2)} OMR
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                              {student.pendingAmount.toFixed(2)} OMR
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col space-y-1">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full w-fit ${student.paymentComplete ?
                                  'bg-green-100 text-green-800' :
                                  (student.paidAmount > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800')
                                  }`}>
                                  {student.paymentStatus}
                                </span>
                                <span className="text-[10px] text-gray-400 font-medium ml-1">
                                  {student.installmentType}
                                </span>
                              </div>
                              {student.hasUnverifiedPayments && (
                                <span className="mt-1 block px-2 py-0.5 text-[10px] leading-tight font-bold rounded bg-red-100 text-red-800 w-fit text-center">
                                  Un-verified Payments
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
                              {/* Show Initial Amount as the first entry if it exists */}
                              {selectedStudent.paymentHistory.map((payment: any) => (
                                <tr key={payment.id}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.date_of_payment}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{payment.paid_amount} OMR</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {payment.payment_status === 'first' ? 'initial' : payment.payment_status}
                                  </td>
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
                        <CardTitle className="text-sm font-medium">Initial Amount</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xl text-blue-600">{selectedStudent.initiallyPaid.toFixed(2)} OMR</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Installments Paid</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xl text-green-600">{selectedStudent.paidAmount.toFixed(2)} OMR</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Remaining Balance</CardTitle>
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
                  {selectedStudent?.pendingAmount <= 1
                    ? "Remaining balance payment"
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
                    <span>Total Paid:</span>
                    <span className="font-medium text-green-600">{selectedStudent?.paidAmount.toFixed(2)} OMR</span>
                    <span>Remaining Balance:</span>
                    <span className="font-medium text-red-600">
                      {selectedStudent?.pendingAmount.toFixed(2)} OMR
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
                            amount: selected ? parseFloat(selected.amount).toString() : "0"
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
                        <option value="visa">Visa Card | فيزا / بطاقة</option>
                        <option value="transfer">Account Transfer | تحويل بنكي</option>
                        <option value="link">Link | الرابط</option>
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

                    {paymentData.payment_method === 'link' && (
                      <div className="space-y-2">
                        <Label htmlFor="payment_link">Payment Link URL</Label>
                        <Input
                          id="payment_link"
                          type="url"
                          value={paymentData.payment_link}
                          onChange={(e) => setPaymentData({ ...paymentData, payment_link: e.target.value })}
                          placeholder="https://..."
                          required
                        />
                        <p className="text-xs text-gray-500">Paste the full payment Link URL here</p>
                      </div>
                    )}

                    {/* Bank Name and Transaction Number fields removed for Account Transfer per user request */}

                    <div className="space-y-4 pt-2 border-t border-gray-100">
                      <div className="space-y-2">
                        <Label>Who is paying? | من القائم بالدفع؟</Label>
                        <select
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                          value={paymentData.isOtherPayer ? "other" : paymentData.paid_by}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "other") {
                              setPaymentData({ ...paymentData, isOtherPayer: true, paid_by: "" });
                            } else {
                              setPaymentData({ ...paymentData, isOtherPayer: false, paid_by: val });
                            }
                          }}
                          required
                        >
                          <option value="">Select Payer | اختر القائم بالدفع</option>
                          {selectedStudent.originalStudentObj?.father?.name_en && (
                            <option value={selectedStudent.originalStudentObj.father.name_en}>
                              Father: {selectedStudent.originalStudentObj.father.name_en}
                            </option>
                          )}
                          {selectedStudent.originalStudentObj?.mother?.name_en && (
                            <option value={selectedStudent.originalStudentObj.mother.name_en}>
                              Mother: {selectedStudent.originalStudentObj.mother.name_en}
                            </option>
                          )}
                          {selectedStudent.originalStudentObj?.guardian?.name_en &&
                            selectedStudent.originalStudentObj?.guardian?.id !== selectedStudent.originalStudentObj?.father?.id &&
                            selectedStudent.originalStudentObj?.guardian?.id !== selectedStudent.originalStudentObj?.mother?.id && (
                              <option value={selectedStudent.originalStudentObj.guardian.name_en}>
                                Relative: {selectedStudent.originalStudentObj.guardian.name_en}
                              </option>
                            )}
                          <option value={selectedStudent.name}>
                            Student: {selectedStudent.name}
                          </option>
                          <option value="other">Other | آخـر</option>
                        </select>
                      </div>

                      {paymentData.isOtherPayer && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                          <Label htmlFor="other_payer_name">Other Payer Name | اسم القائم بالدفع</Label>
                          <Input
                            id="other_payer_name"
                            value={paymentData.paid_by}
                            onChange={(e) => setPaymentData({ ...paymentData, paid_by: e.target.value })}
                            placeholder="Enter name..."
                            required
                          />
                        </div>
                      )}
                    </div>

                    {(() => {
                      const type = paymentData.paymentStatus;
                      const selectedInst = availableInstallments.find(i => i.value === type);
                      const isFixed = selectedInst?.isFixed ?? false;

                      return (
                        <div className="space-y-2">
                          <Label htmlFor="amount">Amount (OMR)</Label>
                          <Input
                            id="amount"
                            type="number"
                            min="1"
                            max={selectedStudent?.pendingAmount}
                            value={paymentData.amount}
                            onChange={(e) => {
                              if (isFixed) return;
                              const maxAmount = selectedStudent?.pendingAmount;
                              let val = e.target.value;
                              
                              const numVal = parseFloat(val);
                              if (!isNaN(numVal) && numVal > maxAmount) {
                                val = maxAmount.toFixed(2);
                              }
                              
                              setPaymentData({
                                ...paymentData,
                                amount: val
                              });
                            }}
                            required
                            readOnly={isFixed}
                            className={isFixed ? "bg-gray-100 cursor-not-allowed font-semibold" : ""}
                            disabled={availableInstallments.length === 0}
                          />
                          <p className="text-xs text-gray-500">
                            {isFixed ? "Fixed amount for this installment." : `Minimum: 1 OMR, Maximum: ${selectedStudent?.pendingAmount.toFixed(2)} OMR`}
                          </p>
                        </div>
                      );
                    })()}

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

            <div className="py-4 flex flex-col items-center">
              {/* Authorized Signatory Signature Pad */}
              <div className="space-y-2 w-full max-w-md">
                <div className="flex justify-between items-center">
                  <Label htmlFor="admin-sig">Authorized Signatory Signature | توقيع المستلم</Label>
                  <Button size="sm" variant="ghost" className="text-red-500" onClick={() => adminSigPad.current?.clear()}>Clear</Button>
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <SignatureCanvas
                    ref={adminSigPad}
                    canvasProps={{ className: 'w-full h-40 cursor-crosshair' }}
                  />
                </div>
                <p className="text-xs text-gray-500 text-centeritalic">Please ask the payer to sign in the box above.</p>
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