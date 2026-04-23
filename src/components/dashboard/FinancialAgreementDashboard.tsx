import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  DollarSign,
  PenTool,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Loader2,
  Eye,
  Search,
  CheckCircle2,
  FilterX,
  UserCheck,
  FilePlus2,
  ArrowLeft,
  Settings2,
  FileDown,
  Check,
} from "lucide-react";
import React, { useEffect, useState } from "react";

import { PDFDocument } from "pdf-lib";
import SignaturePad from "react-signature-canvas";
import Swal from "sweetalert2";
import { getFullUrl } from "@/utils/fileUtils";

interface Department {
  id: string;
  auto_id: number;
  is_deleted: boolean;
  custom_order: number | null;
  alt_txt: string | null;
  department_name: string;
}

interface GuardianDetail {
  id: string;
  name_en: string;
  name_ar: string;
  phone1: string;
  phone2: string;
  email: string;
  work_phone: string;
  workplace: string;
  occupation: string;
  address: string;
  relationship: string;
  national_id?: string;
  passport_number?: string;
}

interface Section {
  id: string;
  auto_id: number;
  is_deleted: boolean;
  custom_order: number | null;
  alt_txt: string | null;
  name: string;
  department: string;
}

interface FinancialAgreement {
  id: string;
  admission_class: string;
  admission_class_name?: string;
  contract_number: string;
  contract_type: string;
  registration_fees: string;
  tution_fee: string;
  stationery_fees: string;
  transportation_fees: string;
  administrative_fees: string;
  total_fees_omr: string;
  total_fees_in_words: string;
  installment_plan: "one" | "two" | "four";
  installment1_date: string | null;
  installment1_amount: string | null;
  installment2_date: string | null;
  installment2_amount: string | null;
  installment3_date: string | null;
  installment3_amount: string | null;
  installment4_date: string | null;
  installment4_amount: string | null;
  mobile_mother: string | null;
  mobile_father: string | null;
  work_phone: string | null;
  house_number: string | null;
  residence_address: string;
  agreement_date: string;
  agreement_pdf: string | null;
  is_verified_agreement_pdf: boolean;
  language: "arabic" | "english";
}

interface Student {
  id: string;
  auto_id: number;
  is_deleted: boolean;
  custom_order: number | null;
  alt_txt: string | null;
  admission_number: string;
  en_first_name: string;
  en_middle_name: string | null;
  en_last_name: string;
  ar_first_name: string;
  ar_middle_name: string | null;
  ar_last_name: string;
  photo: string | null;
  email: string;
  phone: string;
  date_of_birth: string;
  age_years: number | null;
  gender: "M" | "F" | "O";
  religion: string | null;
  nationality: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  admission_class: Department;
  section: Section;
  admission_date: string;
  previous_school: string | null;
  guardian: GuardianDetail | string;
  father?: GuardianDetail;
  mother?: GuardianDetail;
  has_special_needs: boolean;
  special_needs_details: string;
  is_promoted: boolean;
  is_active: boolean;
  is_verified_registration_officer: boolean;
  financial_agreement: FinancialAgreement | null;
  allAgreements: FinancialAgreement[];
  status: "not-created" | "pending" | "signed" | "Student-promoted";
  name: string;
  nameAr: string;
  grade: string;
  type: string;
  guardianEmail: string;
  rawData: any;
}

interface FeeStructure {
  registrationFee: number;
  tutionFee: number;
  stationeryFee: number;
  transportFee: number;
  adminFee: number;
  total: number;
  initialPaidAmount: number;
  balanceAmount: number;
  paymentPlan?: string;
  discount?: number;
  subtotal?: number;
  discountedAmount?: number;
}

interface Agreement {
  id: string;
  studentId: string;
  terms?: string;
  fees?: FeeStructure;
  createdDate: string;
  sentDate?: string;
  signedDate?: string;
  signatureData?: string;
  rejectionReason?: string;
  status: string;
  agreementId?: string;
  rawData?: any;
}

interface AcademicYear {
  id: string;
  auto_id: number;
  is_deleted: boolean;
  custom_order: number | null;
  alt_txt: string | null;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
}

interface FinancialAgreementRequest {
  student: string;
  contract_number?: string;
  academic_year: string;
  admission_class: string;
  contract_type: string;
  registration_fees: string;
  tution_fee: string;
  stationery_fees: string;
  transportation_fees: string;
  administrative_fees: string;
  total_fees_omr: string;
  total_fees_in_words: string;
  initial_paid_amount: string;
  balance_amount: string;
  installment_plan: "one" | "two" | "four";
  installment1_date?: string;
  installment1_amount?: string;
  installment2_date?: string;
  installment2_amount?: string;
  house_number: string;
  residence_address: string;
  agreement_date: string;
  installment3_date?: string;
  installment3_amount?: string;
  installment4_date?: string;
  installment4_amount?: string;
}
type AgreementStatus =
  | "not-created" // When financial_agreement is empty array []
  | "pending-signature" // When agreement exists but is_verified_agreement_pdf is false
  | "completed"; // When is_verified_agreement_pdf is true
const FinancialAgreementDashboard = () => {
  const [activeTab, setActiveTab] = useState<
    "pending" | "agreements" | "esign" | "settings"
  >("pending");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [pendingStudents, setPendingStudents] = useState<Student[]>([]);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [feeStructure, setFeeStructure] = useState<FeeStructure>({
    registrationFee: 0,
    tutionFee: 0,
    stationeryFee: 0,
    transportFee: 0,
    adminFee: 0,
    total: 0,
    initialPaidAmount: 0,
    balanceAmount: 0,
    paymentPlan: "",
  });
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [agreementDetails, setAgreementDetails] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");

  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [currentSigningAgreement, setCurrentSigningAgreement] = useState<Agreement | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [residenceAddress, setResidenceAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [documentLanguage, setDocumentLanguage] = useState<"arabic" | "english">("arabic");
  const [isEditMode, setIsEditMode] = useState(true);
  const [guardianSignaturePad, setGuardianSignaturePad] = useState(null);
  const [savedOfficerSignature, setSavedOfficerSignature] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string>("");
  const [isCreatingNewAgreement, setIsCreatingNewAgreement] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Helper for static display fields
  const renderStaticDisplay = (value: string | number | null | undefined, extraProps = {}) => (
    <div
      className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium min-h-[42px] flex items-center shadow-sm"
      {...extraProps}
    >
      {value || <span className="text-slate-400 italic font-normal">N/A</span>}
    </div>
  );

  // Load initial data
  const loadData = React.useCallback(async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        console.error("No access token found");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL
        }/students/studentslist-financial-agreement/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      let studentsArray = [];

      if (Array.isArray(data)) {
        studentsArray = data;
      } else if (data.data && Array.isArray(data.data)) {
        studentsArray = data.data;
      } else if (data.id) {
        studentsArray = [data];
      } else {
        throw new Error("Unexpected API response format");
      }

      const formattedStudents: Student[] = studentsArray.map((student: any) => {
        let status: "not-created" | "pending" | "signed" | "Student-promoted";
        let statusAr: string;
        let showCreateButton = false;
        let primaryAgreement = null;

        // Ensure we have an array of agreements
        const agreements = (
          Array.isArray(student.financial_agreement) ? student.financial_agreement : []
        ).sort((a: any, b: any) => (b.auto_id || 0) - (a.auto_id || 0));

        // 1. Check for an agreement that matches the current admission class
        const currentClassAgreement = agreements.find(
          (a) => a && (
            String(a.admission_class) === String(student.admission_class?.id) ||
            (a.admission_class?.id && String(a.admission_class.id) === String(student.admission_class?.id))
          )
        );

        if (currentClassAgreement) {
          // If agreement for current class exists, check its verification status
          if (currentClassAgreement.is_verified_agreement_pdf === false) {
            status = "pending";
            statusAr = "بانتظار التحقق";
            showCreateButton = false;
          } else {
            status = "signed";
            statusAr = "تم التوقيع";
            showCreateButton = false;
          }
          primaryAgreement = currentClassAgreement;
        } else {
          // 2. If NO agreement for current class, determine if it's a new creation or a recreation (promoted)
          primaryAgreement = agreements.length > 0 ? agreements[0] : null;
          
          if (student.is_promoted) {
            status = "Student-promoted";
            statusAr = "عدم تطابق الصف";
            showCreateButton = true;
          } else {
            status = "not-created";
            statusAr = "لم يتم الإنشاء";
            showCreateButton = true;
          }
        }

        return {
          id: student.id?.toString() || "unknown-id",
          name: `${student.en_first_name || ""} ${student.en_middle_name || ""} ${student.en_grandfather_name || ""} ${student.en_last_name || ""}`.replace(/\s+/g, ' ').trim(),
          nameAr: `${student.ar_first_name || ""} ${student.ar_middle_name || ""} ${student.ar_grandfather_name || ""} ${student.ar_last_name || ""}`.replace(/\s+/g, ' ').trim(),
          grade: student.admission_class?.department_name || "N/A",
          type: student.section?.name || "N/A",
          registrationDate: student.admission_date,
          financial_agreement: primaryAgreement,
          allAgreements: agreements,
          status,
          statusAr,
          showCreateButton,
          guardianEmail: student.email || "",
          is_promoted: student.is_promoted,
          rawData: student,
        };
      });

      // --- NEW SORTING LOGIC ---
      const statusOrder = {
        "pending": 1,
        "not-created": 2,
        "Student-promoted": 3,
        "signed": 4,
      };

      const sortedStudents = formattedStudents.sort((a, b) => {
        const orderA = statusOrder[a.status] || 99;
        const orderB = statusOrder[b.status] || 99;
        return orderA - orderB;
      });
      // --- END OF NEW SORTING LOGIC ---

      setPendingStudents(sortedStudents);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, []);



  useEffect(() => {
    loadData();

  }, [loadData]);

  const fetchAcademicYears = React.useCallback(async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/students/academic-year/`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch academic years");
      }

      const responseData = await response.json();

      if (responseData.data && Array.isArray(responseData.data)) {
        setAcademicYears(responseData.data);
        const currentYear = responseData.data.find((year: AcademicYear) => year.is_current);
        if (currentYear) {
          setSelectedAcademicYearId(currentYear.id);
        }
      }
    } catch (error) {
      console.error("Error fetching academic years:", error);
    }
  }, []);

  useEffect(() => {
    const fetchOfficerSignature = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/accounts/signature/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.signature_image) {
            setSavedOfficerSignature(data.signature_image);
          }
        }
      } catch (err) {
        console.error("Error fetching officer signature:", err);
      }
    };
    fetchOfficerSignature();
  }, []);


  useEffect(() => {
    fetchAcademicYears();
  }, [fetchAcademicYears]);


  const calculateTotal = () => {
    // 1. Sum up the base fees to get a subtotal.
    const subtotal =
      (feeStructure.registrationFee || 0) +
      (feeStructure.tutionFee || 0) +
      (feeStructure.stationeryFee || 0) +
      (feeStructure.adminFee || 0) +
      (feeStructure.transportFee || 0);

    // 2. Determine the discount percentage based on the payment plan.
    const discountPercentage = 0;

    // 3. Calculate the actual monetary value of the discount.
    const discountAmount = subtotal * (discountPercentage / 100);

    // 4. Calculate the final total by subtracting the discount from the subtotal.
    const finalTotal = subtotal - discountAmount;

    // 5. Calculate the balance after initial payment.
    const initialPaid = feeStructure.initialPaidAmount || 0;
    const balance = finalTotal - initialPaid;

    // 6. Update the state with all the new, calculated values.
    setFeeStructure((prev) => ({
      ...prev,
      subtotal: subtotal,
      discount: discountPercentage,
      discountedAmount: discountAmount,
      total: finalTotal,
      balanceAmount: balance,
    }));
  };

  // Update the payment plan selection handler
  const handlePaymentPlanChange = (value: "one" | "two" | "four") => {
    setFeeStructure((prev) => ({
      ...prev,
      paymentPlan: value,
    }));
  };

  useEffect(() => {
    calculateTotal();
  }, [
    feeStructure.registrationFee,
    feeStructure.tutionFee,
    feeStructure.stationeryFee,
    feeStructure.adminFee,
    feeStructure.transportFee,
    feeStructure.paymentPlan,
    feeStructure.initialPaidAmount,
  ]);
  const handleCreateAgreement = (student: Student) => {
    const hasClassMismatch =
      student.financial_agreement &&
      student.financial_agreement.admission_class !==
      student.rawData.admission_class?.id;

    if (hasClassMismatch) {
      console.log(
        `Recreating agreement due to class change for student ${student.id}`
      );
    }
    setSelectedStudent(student);

    // Auto-populate guardian and contact information from student registration data
    const guardian = student.rawData.guardian;
    const rawData = student.rawData;

    if (guardian) {
      // Map contacts from guardian or student fallbacks
      setResidenceAddress(guardian.address || rawData.address || "");
      setHouseNumber(rawData.house_number || "");
    } else {
      // Fallback directly to student fields if guardian object is missing
      setResidenceAddress(rawData.address || "");
      setHouseNumber(rawData.house_number || "");
    }

    const initialSubtotal = 200 + 150 + 20 + 300 + 10;
    
    setFeeStructure({
      registrationFee: 200,
      tutionFee: 150,
      stationeryFee: 20,
      transportFee: 300,
      adminFee: 10,
      paymentPlan: "one",
      total: initialSubtotal,
      initialPaidAmount: initialSubtotal, // Default to full payment for "one" plan
      balanceAmount: 0,
      discount: 0,
      subtotal: initialSubtotal,
      discountedAmount: 0
    });

    setIsEditMode(true);
    setIsCreatingNewAgreement(true);
    setActiveTab("agreements");
  };

  const handleViewAgreement = (student: Student) => {
    setSelectedStudent(student);
    setIsEditMode(false);
    setIsCreatingNewAgreement(false);

    const agreement = student.financial_agreement;
    if (agreement) {
      setFeeStructure({
        registrationFee: parseFloat(agreement.registration_fees),
        tutionFee: parseFloat(agreement.tution_fee),
        stationeryFee: parseFloat(agreement.stationery_fees),
        transportFee: parseFloat(agreement.transportation_fees),
        adminFee: parseFloat(agreement.administrative_fees),
        total: parseFloat(agreement.total_fees_omr),
        initialPaidAmount: parseFloat(agreement.initial_paid_amount || "0"),
        balanceAmount: parseFloat(agreement.balance_amount),
        paymentPlan: agreement.installment_plan,
        subtotal: parseFloat(agreement.total_fees_omr), // Simplified
      });
      setHouseNumber(agreement.house_number || "");
      setResidenceAddress(agreement.residence_address || "");
      setSelectedAcademicYearId(agreement.academic_year || "");
      setDocumentLanguage(agreement.language || "arabic");
    }

    setActiveTab("agreements");
  };

  const handleSendForESignature = (agreement: Agreement) => {
    // In a real app, this would send an email to the guardian
    const updatedAgreement = {
      ...agreement,
      sentDate: new Date().toISOString().split("T")[0],
      status: "sent-for-signature",
    };

    setAgreements(
      agreements.map((a) => (a.id === agreement.id ? updatedAgreement : a))
    );
    Swal.fire({
      title: 'Success',
      text: `Sent agreement to ${getStudent(agreement.studentId)?.guardianEmail}`,
      icon: 'success',
      timer: 5000,
      timerProgressBar: true
    });
  };



  const getStudent = (studentId: string) => {
    return [...pendingStudents].find((s) => s.id === studentId);
  };

  const allRecords = pendingStudents.flatMap((student) => {
    const records: any[] = [];

    // 1. Creation Record (if student has no agreement for current class)
    if (student.status === "not-created" || student.status === "Student-promoted") {
      records.push({
        id: `${student.id}-creation`,
        student,
        type: "creation",
        status: student.status,
        statusAr: student.statusAr,
        group: 1,
        isCreation: true
      });
    }

    // 2. Agreement Records
    (student.allAgreements || []).forEach((agreement) => {
      const isSigned = agreement.is_verified_agreement_pdf;
      records.push({
        id: agreement.id,
        student,
        agreement,
        type: isSigned ? "signed" : "pending",
        status: isSigned ? "signed" : "pending",
        statusAr: isSigned ? "تم التوقيع" : "بانتظار التحقق",
        group: isSigned ? 3 : 2,
        isCreation: false
      });
    });

    return records;
  });

  const filteredRecords = allRecords.filter((record) => {
    const { student, status } = record;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "not-created" && (status === "not-created" || status === "Student-promoted")) ||
      status === statusFilter ||
      (statusFilter === "pending_all" &&
        (status === "pending" ||
          status === "not-created" ||
          status === "Student-promoted"));
    const matchesClass = classFilter === "all" || student.grade === classFilter;
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rawData.admission_number
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchesStatus && matchesClass && matchesSearch;
  }).sort((a, b) => a.group - b.group);

  const handleViewPDF = async (agreementId: string) => {
    if (!agreementId) return;

    // Open a new window immediately to avoid the pop-up blocker
    const newWindow = window.open('about:blank', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>View Agreement | AL-MAWHIBA</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; background-color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; color: #1e293b; }
              .card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); text-align: center; }
              .spinner { width: 32px; height: 32px; border: 3px solid #f1f5f9; border-bottom-color: #8b4513; border-radius: 50%; display: inline-block; animation: rotation 1s linear infinite; margin-bottom: 1rem; }
              @keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="spinner"></div>
              <div style="font-weight: 600;">Loading Agreement...</div>
            </div>
          </body>
        </html>
      `);
    }

    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/students/financial-agreement-pdf-download/${agreementId}/`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!response.ok) throw new Error("Failed to fetch PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      if (newWindow) {
        newWindow.location.href = url;
      } else {
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error("Failed to view PDF:", error);
      if (newWindow) newWindow.close();
      Swal.fire({
        title: 'Error',
        text: 'Failed to load PDF. Please try again.',
        icon: 'error'
      });
    }
  };

  const filteredAgreements = agreements.filter((agreement) => {
    if (activeTab === "esign") return true;
    return agreement.status === "agreement-created";
  });

  const scrollToError = (errorObj: Record<string, string>) => {
    const firstError = Object.keys(errorObj)[0];
    if (firstError) {
      const element = document.getElementById(firstError);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handleSubmitAgreement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");
    setErrors({});

    const newErrors: Record<string, string> = {};

    if (!selectedStudent) {
      newErrors.student = "Please select a student";
    }

    if (!selectedAcademicYearId) {
      newErrors.academic_year = "Please select an academic year";
    }

    if (!feeStructure.paymentPlan) {
      newErrors.paymentPlan = "Please select a payment plan";
    }

    // "One Installment" Plan Validation
    if (feeStructure.paymentPlan === "one") {
      if (Math.abs(feeStructure.initialPaidAmount - feeStructure.total) > 0.001) {
        newErrors.initial_paid_amount = `Full payment of ${feeStructure.total.toFixed(3)} OMR is required for "One Installment" plan.`;
        setSubmitError(`Full payment is required for "One Installment" plan.`);
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      scrollToError(newErrors);
      setIsSubmitting(false);
      return;
    }

    console.log("Submitting agreement for student:", selectedStudent);

    const now = new Date();

    // Prepare the request payload
    const payload: FinancialAgreementRequest = {
      student: selectedStudent.id,
      academic_year: selectedAcademicYearId,
      admission_class: selectedStudent.rawData.admission_class.id,
      contract_type: selectedStudent.is_promoted ? "re_registration" : "new",
      registration_fees: feeStructure.registrationFee.toFixed(3),
      tution_fee: feeStructure.tutionFee.toFixed(3),
      stationery_fees: feeStructure.stationeryFee.toFixed(3),
      transportation_fees: feeStructure.transportFee.toFixed(3),
      administrative_fees: feeStructure.adminFee.toFixed(3),
      total_fees_omr: feeStructure.total.toFixed(3),
      total_fees_in_words: convertToArabicWords(feeStructure.total),
      initial_paid_amount: feeStructure.initialPaidAmount.toFixed(3),
      balance_amount: feeStructure.balanceAmount.toFixed(3),
      installment_plan: getInstallmentPlan(feeStructure.paymentPlan),
      house_number: houseNumber,
      residence_address: residenceAddress,
      agreement_date: now.toISOString().split("T")[0],
      language: documentLanguage,
    };

    const initialPaid = feeStructure.initialPaidAmount;
    const balance = feeStructure.balanceAmount;

    // Add installment dates and amounts
    if (feeStructure.paymentPlan === "one") {
      payload.installment1_date = now.toISOString().split("T")[0];
      payload.installment1_amount = initialPaid.toFixed(3);
    } else {
      // Installment 1 is always the Initial Paid Amount (paid today)
      payload.installment1_date = now.toISOString().split("T")[0];
      payload.installment1_amount = initialPaid.toFixed(3);

      const nextInstallmentDate = new Date(now);
      nextInstallmentDate.setMonth(nextInstallmentDate.getMonth() + 1);

      if (feeStructure.paymentPlan === "two") {
        // Balance amount goes to the second installment
        payload.installment2_date = nextInstallmentDate.toISOString().split("T")[0];
        payload.installment2_amount = balance.toFixed(3);
      }

      if (feeStructure.paymentPlan === "four") {
        // Split balance into 3 remaining installments (2, 3, 4) with rounding handling
        // Example: 334 balance -> 112, 111, 111
        const inst2Value = Math.ceil(balance / 3);
        const inst3Value = Math.ceil((balance - inst2Value) / 2);
        const inst4Value = balance - inst2Value - inst3Value;

        payload.installment2_amount = inst2Value.toFixed(3);
        payload.installment3_amount = inst3Value.toFixed(3);
        payload.installment4_amount = inst4Value.toFixed(3);

        payload.installment2_date = nextInstallmentDate.toISOString().split("T")[0];
        
        const thirdDate = new Date(nextInstallmentDate);
        thirdDate.setMonth(thirdDate.getMonth() + 1);
        payload.installment3_date = thirdDate.toISOString().split("T")[0];

        const fourthDate = new Date(thirdDate);
        fourthDate.setMonth(fourthDate.getMonth() + 1);
        payload.installment4_date = fourthDate.toISOString().split("T")[0];
      }
    }

    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) throw new Error("Authentication required");

      const isEditing = !isCreatingNewAgreement;
      const agreementId = selectedStudent.financial_agreement?.id;

      const url = isCreatingNewAgreement
        ? `${import.meta.env.VITE_API_BASE_URL}/students/financial-agreement-create/`
        : `${import.meta.env.VITE_API_BASE_URL}/students/update-payment-flag/${agreementId}/`;

      const response = await fetch(url, {
        method: isCreatingNewAgreement ? "POST" : "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit agreement");
      }

      const responseData = await response.json();
      console.log("Agreement submitted:", responseData);

      // Refresh data to update E-Signature tab and metrics
      await loadData();

      if (isEditing) {
        setIsEditMode(false);
        setActiveTab("esign");
      } else {
        resetForm();
        setActiveTab("pending");
      }

      await Swal.fire({
        title: 'Success',
        text: isEditing ? 'Agreement updated successfully!' : 'Agreement submitted successfully!',
        icon: 'success',
        timer: 5000,
        timerProgressBar: true
      });
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInstallmentPlan = (
    plan: string | undefined
  ): "one" | "two" | "four" => {
    switch (plan) {
      case "one":
        return "one";
      case "two":
        return "two";
      case "four":
        return "four";
      default:
        return "one"; // Default to one installment
    }
  };

  const resetForm = () => {
    setSelectedStudent(null);

    setAgreementDetails("");
    setHouseNumber("");
    setResidenceAddress("");
  };

  const convertToArabicWords = (num: number): string => {
    const units = [
      "",
      "واحد",
      "اثنان",
      "ثلاثة",
      "أربعة",
      "خمسة",
      "ستة",
      "سبعة",
      "ثمانية",
      "تسعة",
    ];
    const unitsFeminine = [
      "",
      "واحدة",
      "اثنتان",
      "ثلاث",
      "أربع",
      "خمس",
      "ست",
      "سبع",
      "ثمان",
      "تسع",
    ];
    const teens = [
      "عشرة",
      "أحد عشر",
      "اثنا عشر",
      "ثلاثة عشر",
      "أربعة عشر",
      "خمسة عشر",
      "ستة عشر",
      "سبعة عشر",
      "ثمانية عشر",
      "تسعة عشر",
    ];
    const tens = [
      "",
      "عشرة",
      "عشرون",
      "ثلاثون",
      "أربعون",
      "خمسون",
      "ستون",
      "سبعون",
      "ثمانون",
      "تسعون",
    ];
    const hundreds = [
      "",
      "مائة",
      "مئتان",
      "ثلاثمائة",
      "أربعمائة",
      "خمسمائة",
      "ستمائة",
      "سبعمائة",
      "ثمانمائة",
      "تسعمائة",
    ];
    const thousands = ["", "ألف", "ألفان", "آلاف"];

    if (num === 0) return "صفر ريال عماني";

    let words = "";
    const wholeNumber = Math.floor(num);
    const decimal = Math.round((num - wholeNumber) * 1000);

    // Handle millions
    if (wholeNumber >= 1000000) {
      const millions = Math.floor(wholeNumber / 1000000);
      const millionsRemainder = wholeNumber % 1000000;

      if (millions === 1) {
        words += "مليون";
      } else if (millions === 2) {
        words += "مليونان";
      } else if (millions >= 3 && millions <= 10) {
        words += units[millions] + " ملايين";
      } else {
        words += convertToArabicWords(millions) + " مليون";
      }

      if (millionsRemainder > 0) {
        words += " و";
      }
    }

    // Handle thousands (remaining part after millions)
    const thousandsPart = wholeNumber % 1000000;
    if (thousandsPart > 0) {
      if (thousandsPart >= 1000) {
        const thousands = Math.floor(thousandsPart / 1000);
        const thousandsRemainder = thousandsPart % 1000;

        if (thousands === 1) {
          words += "ألف";
        } else if (thousands === 2) {
          words += "ألفان";
        } else if (thousands >= 3 && thousands <= 10) {
          words += units[thousands] + " آلاف";
        } else {
          words += convertToArabicWords(thousands) + " ألف";
        }

        if (thousandsRemainder > 0) {
          words += " و";
        }
      }

      // Handle hundreds (remaining part after thousands)
      const remainder = thousandsPart % 1000;
      if (remainder > 0) {
        if (remainder >= 100) {
          const hundredsPart = Math.floor(remainder / 100);
          words += hundreds[hundredsPart];

          const tensPart = remainder % 100;
          if (tensPart > 0) {
            words += " و";
          }
        }

        // Handle tens and units
        const tensRemainder = remainder % 100;
        if (tensRemainder > 0) {
          if (tensRemainder < 10) {
            words += units[tensRemainder];
          } else if (tensRemainder < 20) {
            words += teens[tensRemainder - 10];
          } else {
            const unit = tensRemainder % 10;
            const ten = Math.floor(tensRemainder / 10);
            if (unit > 0) {
              words += units[unit] + " و" + tens[ten];
            } else {
              words += tens[ten];
            }
          }
        }
      }
    }

    words += " ريال عماني";

    if (decimal > 0) {
      // Convert baisa part to words
      let baisaWords = "";
      const baisaHundreds = Math.floor(decimal / 100);
      const baisaTens = Math.floor((decimal % 100) / 10);
      const baisaUnits = decimal % 10;

      if (baisaHundreds > 0) {
        baisaWords += hundreds[baisaHundreds];
        if (baisaTens > 0 || baisaUnits > 0) {
          baisaWords += " و";
        }
      }

      if (baisaTens > 0) {
        if (baisaTens === 1 && baisaUnits > 0) {
          baisaWords += teens[baisaUnits];
        } else {
          if (baisaUnits > 0) {
            baisaWords += unitsFeminine[baisaUnits] + " و" + tens[baisaTens];
          } else {
            baisaWords += tens[baisaTens];
          }
        }
      } else if (baisaUnits > 0) {
        baisaWords += unitsFeminine[baisaUnits];
      }

      words += " و" + baisaWords + " بيسة";
    }

    return words;
  };

  const trimCanvas = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;
    const width = canvas.width;
    const height = canvas.height;
    const pixels = ctx.getImageData(0, 0, width, height);
    const l = pixels.data.length;
    let bound: { top: number | null, left: number | null, right: number | null, bottom: number | null } = { 
      top: null, left: null, right: null, bottom: null 
    };
    let x, y;

    for (let i = 0; i < l; i += 4) {
      if (pixels.data[i + 3] !== 0) {
        x = (i / 4) % width;
        y = Math.floor((i / 4) / width);

        if (bound.top === null) bound.top = y;
        if (bound.left === null) bound.left = x;
        else if (x < bound.left) bound.left = x;
        if (bound.right === null) bound.right = x;
        else if (x > bound.right) bound.right = x;
        if (bound.bottom === null) bound.bottom = y;
        else if (y > bound.bottom) bound.bottom = y;
      }
    }

    if (bound.top === null) return canvas;

    const trimHeight = bound.bottom! - bound.top! + 1;
    const trimWidth = bound.right! - bound.left! + 1;
    const trimmed = ctx.getImageData(bound.left!, bound.top!, trimWidth, trimHeight);

    const copy = document.createElement('canvas');
    copy.width = trimWidth;
    copy.height = trimHeight;
    const copyCtx = copy.getContext('2d');
    if (copyCtx) copyCtx.putImageData(trimmed, 0, 0);

    return copy;
  };

  return (
    <div className="p-6 space-y-6">
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
            <p className="text-lg font-medium">
              {processingStep || "Processing Agreement..."}
            </p>
            <p className="text-sm text-gray-500">
              Please wait...
            </p>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Financial Agreement Officer
          </h1>
          <p className="text-gray-600" dir="rtl">
            موظف العقود المالية
          </p>
        </div>
        {/* <Button 
            className="bg-green-600 hover:bg-green-700" 
            onClick={() => setActiveTab('agreements')}
          >
            <FileText className="mr-2 h-4 w-4" />
            New Agreement | اتفاقية جديدة
          </Button> */}
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b">
        <button
          className={`px-6 py-3 font-medium transition-colors ${activeTab === "pending"
            ? "border-b-2 border-green-600 text-green-600 bg-green-50/50"
            : "text-gray-600 hover:text-green-600 hover:bg-gray-50"
            }`}
          onClick={() => setActiveTab("pending")}
        >
          <Clock className="inline mr-2 h-4 w-4" />
          Agreements | الاتفاقيات
        </button>
        <button
          className={`px-6 py-3 font-medium transition-colors ${activeTab === "esign"
            ? "border-b-2 border-green-600 text-green-600 bg-green-50/50"
            : "text-gray-600 hover:text-green-600 hover:bg-gray-50"
            }`}
          onClick={() => {
            setActiveTab("esign");
            setIsSigning(false);
          }}
        >
          <PenTool className="inline mr-2 h-4 w-4" />
          E-Signature | التوقيع الإلكتروني
        </button>

      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Card */}
        <Card
          className={`cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] border-blue-200 shadow-sm ${statusFilter === 'all' ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-gradient-to-br from-blue-50/50 to-white'}`}
          onClick={() => {
            setStatusFilter("all")
            setActiveTab("pending")
          }}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Total Agreements | إجمالي الاتفاقيات</p>
              <h2 className="text-2xl font-black text-gray-900">
                {pendingStudents.reduce((acc, s) => acc + s.allAgreements.length, 0)}
              </h2>
            </div>
          </CardContent>
        </Card>

        {/* Pending Creation Card */}
        <Card
          className={`cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] border-amber-200 shadow-sm ${statusFilter === 'not-created' ? 'ring-2 ring-amber-500 bg-amber-50' : 'bg-gradient-to-br from-amber-50/50 to-white'}`}
          onClick={() => {
            setStatusFilter("not-created")
            setActiveTab("pending")
          }}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-amber-100 p-2 rounded-lg">
              <FilePlus2 className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Pending Creation | بانتظار الإنشاء</p>
              <h2 className="text-2xl font-black text-gray-900">
                {pendingStudents.filter(s => s.status === 'not-created' || s.status === 'Student-promoted').length}
              </h2>
            </div>
          </CardContent>
        </Card>

        {/* Pending Signature Card */}
        <Card
          className={`cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] border-orange-200 shadow-sm ${statusFilter === 'pending' ? 'ring-2 ring-orange-500 bg-orange-50' : 'bg-gradient-to-br from-orange-50/50 to-white'}`}
          onClick={() => {
            setStatusFilter("pending")
            setActiveTab("esign")
          }}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-orange-100 p-2 rounded-lg">
              <PenTool className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-orange-600">Pending E-Signed | بانتظار التوقيع</p>
              <h2 className="text-2xl font-black text-gray-900">
                {pendingStudents.reduce((acc, s) => acc + s.allAgreements.filter(a => !a.is_verified_agreement_pdf).length, 0)}
              </h2>
            </div>
          </CardContent>
        </Card>

        {/* Completed Card */}
        <Card
          className={`cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] border-green-200 shadow-sm ${statusFilter === 'signed' ? 'ring-2 ring-green-500 bg-green-50' : 'bg-gradient-to-br from-green-50/50 to-white'}`}
          onClick={() => {
            setStatusFilter("signed")
            setActiveTab("esign")
          }}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-green-100 p-2 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-green-600">Completed (Signed) | اتفاقيات مكتملة</p>
              <h2 className="text-2xl font-black text-gray-900">
                {pendingStudents.reduce((acc, s) => acc + s.allAgreements.filter(a => a.is_verified_agreement_pdf).length, 0)}
              </h2>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === "pending" && (
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <CardTitle className="text-xl font-bold whitespace-nowrap">
                  Agreements | الاتفاقيات
                </CardTitle>

                <div className="flex flex-wrap items-center gap-4 bg-gray-50/50 p-2 rounded-lg border border-gray-100">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <Input
                      placeholder="Search name or ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9 text-sm bg-white border-gray-200 focus:ring-green-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Label className="whitespace-nowrap text-[10px] font-bold uppercase tracking-widest text-gray-400">Class</Label>
                    <Select value={classFilter} onValueChange={setClassFilter}>
                      <SelectTrigger className="w-[120px] h-9 text-sm bg-white border-gray-200">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Classes</SelectItem>
                        {Array.from(new Set(pendingStudents.map(s => s.grade))).sort().map(grade => (
                          <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2 border-l pl-4 border-gray-200">
                    <Label className="whitespace-nowrap text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="min-w-[160px] h-9 text-sm bg-white border-gray-200">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status | جميع الحالات</SelectItem>
                        <SelectItem value="pending_all">Pending All | بانتظار الإجراء</SelectItem>
                        <SelectItem value="pending">Pending Verification | بانتظار التحقق</SelectItem>
                        <SelectItem value="not-created">Ready to Create | بانتظار الإنشاء</SelectItem>
                        <SelectItem value="signed">Signed / Completed | مكتمل التوقيع</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              <div className="overflow-x-auto border rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="sticky left-0 bg-gray-50 px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider z-10">
                        Student
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Class
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Grade
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="sticky right-0 bg-gray-50 px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider z-10 shadow-[-2px_0_5px_rgba(0,0,0,0.05)]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRecords.length > 0 ? (
                      (() => {
                        let lastGroup = 0;
                        return filteredRecords.map((record) => {
                          const { student, agreement, group: currentGroup, status, statusAr, isCreation } = record;
                          const showSeparator = statusFilter === "all" && currentGroup !== lastGroup;
                          lastGroup = currentGroup;

                          const rows = [];

                          if (showSeparator) {
                            rows.push(
                              <tr key={`sep-${record.id}`} className="bg-gray-50/50">
                                <td colSpan={5} className="px-6 py-2">
                                  <div className="flex items-center">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                      {currentGroup === 1 ? "Creation Financial Agreements | إنشاء العقود المالية" :
                                        currentGroup === 2 ? "Pending for E-Signature | بانتظار التوقيع الإلكتروني" :
                                          "Completed Verified Data | بيانات مكتملة ومحققة"}
                                    </span>
                                    <div className="flex-1 ml-4 h-[1px] bg-gray-200"></div>
                                  </div>
                                </td>
                              </tr>
                            );
                          }

                          rows.push(
                            <tr key={record.id} className="hover:bg-gray-50 transition-colors group">
                              <td className="sticky left-0 bg-white group-hover:bg-gray-50 px-4 sm:px-6 py-4 whitespace-nowrap z-10 shadow-[2px_0_5px_rgba(0,0,0,0.05)] md:shadow-none">
                                <div className="font-medium text-gray-900">{student.name || student.nameAr}</div>
                                <div className="text-gray-500 text-xs" dir="rtl">
                                  {student.nameAr}
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                                {agreement?.admission_class_name || student.grade}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                                <div>{student.type}</div>
                                {student.typeAr && (
                                  <div className="text-gray-400 text-xs" dir="rtl">
                                    {student.typeAr}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${status === "signed" ? "bg-green-100 text-green-700" :
                                  status === "pending" ? "bg-yellow-100 text-yellow-700 border border-yellow-200" :
                                    status === "not-created" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                                      "bg-gray-100 text-gray-700 font-normal normal-case"
                                  }`}>
                                  {status === "not-created" ? "Ready" : status}
                                </span>
                                <div className="text-gray-400 text-[10px] mt-0.5" dir="rtl">
                                  {statusAr}
                                </div>
                              </td>
                              <td className="sticky right-0 bg-white group-hover:bg-gray-50 px-4 sm:px-6 py-4 whitespace-nowrap z-10 shadow-[-2px_0_5px_rgba(0,0,0,0.05)] md:shadow-none">
                                {isCreation ? (
                                  <Button
                                    size="sm"
                                    onClick={() => handleCreateAgreement(student)}
                                    className="bg-green-600 hover:bg-green-700 text-white shadow-sm h-8 px-4"
                                  >
                                    <FileText className="mr-1.5 h-3.5 w-3.5" />
                                    {status === "Student-promoted"
                                      ? "Recreate"
                                      : "Create"}
                                  </Button>
                                ) : status === "pending" ? (
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => agreement && handleViewAgreement({ ...student, financial_agreement: agreement })}
                                      className="border-blue-200 text-blue-700 hover:bg-blue-50 h-8 px-3"
                                    >
                                      <Eye className="mr-1.5 h-3.5 w-3.5" />
                                      View
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        const agreementData = {
                                          id: student.financial_agreement?.id,
                                          studentId: student.id,
                                          agreementId: student.financial_agreement?.id,
                                          rawData: student.rawData
                                        };
                                        console.log("Setting currentSigningAgreement (Agreements Tab):", agreementData);
                                        setCurrentSigningAgreement(agreementData as any);
                                        setIsSignatureModalOpen(true);
                                      }}
                                      className="h-8 text-xs bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100"
                                    >
                                      <PenTool className="h-4 w-4 mr-1" />
                                      Sign Now
                                    </Button>
                                  </div>
                                ) : status === "signed" ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => agreement?.id && handleViewPDF(agreement.id)}
                                    className="border-green-200 text-green-700 hover:bg-green-50 shadow-sm h-8 px-3"
                                  >
                                    <FileDown className="mr-1.5 h-3.5 w-3.5" />
                                    View PDF
                                  </Button>
                                ) : null}
                              </td>
                            </tr>
                          );

                          return rows;
                        });
                      })()
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-16 text-center text-gray-400">
                          <div className="flex flex-col items-center max-w-xs mx-auto">
                            <div className="bg-gray-50 p-4 rounded-full mb-4">
                              <FilterX className="h-10 w-10 text-gray-300" />
                            </div>
                            <h3 className="text-gray-900 font-semibold mb-1">No matching students</h3>
                            <p className="text-sm mb-6">We couldn't find any student matching your current search or filters.</p>
                            {(searchQuery || classFilter !== 'all' || statusFilter !== 'all') && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSearchQuery("");
                                  setClassFilter("all");
                                  setStatusFilter("all");
                                }}
                                className="border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                              >
                                Clear all filters
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "agreements" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>
                {selectedStudent
                  ? isEditMode
                    ? selectedStudent.financial_agreement
                      ? "Edit Financial Agreement"
                      : "Create Financial Agreement"
                    : "Agreement Details"
                  : "Agreement Management"}
              </CardTitle>
              {selectedStudent && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (selectedStudent.financial_agreement && !isEditMode) {
                        setActiveTab("esign");
                      } else if (isEditMode && selectedStudent.financial_agreement) {
                        setIsEditMode(false);
                      } else {
                        setSelectedStudent(null);
                        setActiveTab("pending");
                      }
                    }}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>

                  {selectedStudent.financial_agreement && !isEditMode && (
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-orange-600 hover:bg-orange-700"
                      onClick={() => setIsEditMode(true)}
                    >
                      <PenTool className="mr-2 h-4 w-4" />
                      Edit Agreement
                    </Button>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent>
              {selectedStudent ? (
                <div className="space-y-6">
                  {/* Student Details */}

                  <form onSubmit={handleSubmitAgreement}>
                    {/* Student Info Section */}
                    <div className="border-b pb-4 mb-6">
                      <h3 className="text-lg font-semibold mb-4">
                        Student Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Name (English)</Label>
                          {renderStaticDisplay(selectedStudent?.name)}
                        </div>
                        <div>
                          <Label>Name (Arabic)</Label>
                          {renderStaticDisplay(selectedStudent?.nameAr, { dir: "rtl" })}
                        </div>
                        <div>
                          <Label>Grade</Label>
                          {renderStaticDisplay(selectedStudent?.grade)}
                        </div>
                        <div>
                          <Label>Guardian Email</Label>
                          {renderStaticDisplay(selectedStudent?.guardianEmail)}
                        </div>
                      </div>
                    </div>

                    {/* Parents Verification Section */}
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
                      <div className="flex items-center gap-2 mb-4">
                        <UserCheck className="h-5 w-5 text-slate-600" />
                        <h3 className="text-lg font-semibold">
                          Parents Details (Verification) | بيانات الوالدين (للتحقق)
                        </h3>
                        <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          Read Only | للعرض فقط
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Father's Info */}
                        <div className="space-y-3">
                          <h4 className="font-bold text-sm text-blue-800 border-b border-blue-100 pb-1 flex items-center gap-2">
                            Father's Details | بيانات الأب
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-[10px] text-gray-500 uppercase">Name (English)</Label>
                              <div className="text-sm font-medium">{selectedStudent?.rawData?.father?.name_en || "N/A"}</div>
                            </div>
                            <div>
                              <Label className="text-[10px] text-gray-500 uppercase">Name (Arabic)</Label>
                              <div className="text-sm font-medium" dir="rtl">{selectedStudent?.rawData?.father?.name_ar || "N/A"}</div>
                            </div>
                            <div>
                              <Label className="text-[10px] text-gray-500 uppercase">Phone</Label>
                              <div className="text-sm font-medium">{selectedStudent?.rawData?.father?.phone1 || "N/A"}</div>
                            </div>
                            <div>
                              <Label className="text-[10px] text-gray-500 uppercase">Occupation</Label>
                              <div className="text-sm font-medium">{selectedStudent?.rawData?.father?.occupation || "N/A"}</div>
                            </div>
                            <div className="col-span-2">
                              <Label className="text-[10px] text-gray-500 uppercase">National ID / ID Number</Label>
                              <div className="text-sm font-medium">{selectedStudent?.rawData?.father?.national_id || selectedStudent?.rawData?.father?.other_datas?.national_id || "N/A"}</div>
                            </div>
                          </div>
                        </div>

                        {/* Mother's Info */}
                        <div className="space-y-3">
                          <h4 className="font-bold text-sm text-pink-800 border-b border-pink-100 pb-1 flex items-center gap-2">
                            Mother's Details | بيانات الأم
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-[10px] text-gray-500 uppercase">Name (English)</Label>
                              <div className="text-sm font-medium">{selectedStudent?.rawData?.mother?.name_en || "N/A"}</div>
                            </div>
                            <div>
                              <Label className="text-[10px] text-gray-500 uppercase">Name (Arabic)</Label>
                              <div className="text-sm font-medium" dir="rtl">{selectedStudent?.rawData?.mother?.name_ar || "N/A"}</div>
                            </div>
                            <div>
                              <Label className="text-[10px] text-gray-500 uppercase">Phone</Label>
                              <div className="text-sm font-medium">{selectedStudent?.rawData?.mother?.phone1 || "N/A"}</div>
                            </div>
                            <div>
                              <Label className="text-[10px] text-gray-500 uppercase">Occupation</Label>
                              <div className="text-sm font-medium">{selectedStudent?.rawData?.mother?.occupation || "N/A"}</div>
                            </div>
                            <div className="col-span-2">
                              <Label className="text-[10px] text-gray-500 uppercase">National ID / ID Number</Label>
                              <div className="text-sm font-medium">{selectedStudent?.rawData?.mother?.national_id || selectedStudent?.rawData?.mother?.other_datas?.national_id || "N/A"}</div>
                            </div>
                          </div>
                        </div>
                        <div className="md:col-span-1">
                          <Label>Document Language | لغة المستند</Label>
                          {isEditMode ? (
                            <Select
                              value={documentLanguage}
                              onValueChange={(value: "arabic" | "english") => setDocumentLanguage(value)}
                            >
                              <SelectTrigger id="documentLanguage" className={`border-blue-300 focus:border-blue-500 bg-white ${errors.documentLanguage ? 'border-red-500 ring-1 ring-red-500' : ''}`}>
                                <SelectValue placeholder="Select Language" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="arabic">Arabic | العربية</SelectItem>
                                <SelectItem value="english">English | الإنجليزية</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            renderStaticDisplay(documentLanguage === "arabic" ? "Arabic | العربية" : "English | الإنجليزية")
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Fee Structure Section */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-4">
                        Fee Structure
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Registration Fees (OMR)</Label>
                          {isEditMode ? (
                            <Input
                              type="number"
                              step="0.001"
                              value={feeStructure.registrationFee || ""}
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value) || 0;
                                setFeeStructure((prev) => ({
                                  ...prev,
                                  registrationFee: value,
                                }));
                              }}
                            />
                          ) : (
                            renderStaticDisplay(feeStructure.registrationFee.toFixed(3))
                          )}
                        </div>
                        <div>
                          <Label>Tuition Fees (OMR)</Label>
                          {isEditMode ? (
                            <Input
                              type="number"
                              step="0.001"
                              value={feeStructure.tutionFee || ""}
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value) || 0;
                                setFeeStructure((prev) => ({
                                  ...prev,
                                  tutionFee: value,
                                }));
                              }}
                            />
                          ) : (
                            renderStaticDisplay(feeStructure.tutionFee.toFixed(3))
                          )}
                        </div>
                        <div>
                          <Label>Stationery Fees (OMR)</Label>
                          {isEditMode ? (
                            <Input
                              type="number"
                              step="0.001"
                              value={feeStructure.stationeryFee || ""}
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value) || 0;
                                setFeeStructure((prev) => ({
                                  ...prev,
                                  stationeryFee: value,
                                }));
                              }}
                            />
                          ) : (
                            renderStaticDisplay(feeStructure.stationeryFee.toFixed(3))
                          )}
                        </div>
                        <div>
                          <Label>Administrative Fees (OMR)</Label>
                          {isEditMode ? (
                            <Input
                              type="number"
                              step="0.001"
                              value={feeStructure.adminFee || ""}
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value) || 0;
                                setFeeStructure((prev) => ({
                                  ...prev,
                                  adminFee: value,
                                }));
                              }}
                            />
                          ) : (
                            renderStaticDisplay(feeStructure.adminFee.toFixed(3))
                          )}
                        </div>
                        <div>
                          <Label>Transportation Fees (OMR)</Label>
                          {isEditMode ? (
                            <Input
                              type="number"
                              step="0.001"
                              value={feeStructure.transportFee || ""}
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value) || 0;
                                setFeeStructure((prev) => ({
                                  ...prev,
                                  transportFee: value,
                                }));
                              }}
                            />
                          ) : (
                            renderStaticDisplay(feeStructure.transportFee.toFixed(3))
                          )}
                        </div>
                        <div>
                          <Label className="flex items-center gap-1">
                            Payment Plan <span className="text-red-500">*</span>
                          </Label>
                          {isEditMode ? (
                            <Select
                              value={feeStructure.paymentPlan}
                              onValueChange={(value: "one" | "two" | "four") => {
                                setFeeStructure((prev) => {
                                  const subtotal =
                                    (prev.registrationFee || 0) +
                                    (prev.tutionFee || 0) +
                                    (prev.stationeryFee || 0) +
                                    (prev.adminFee || 0) +
                                    (prev.transportFee || 0);
                                  
                                  let newInitialPaid = prev.initialPaidAmount;
                                  if (value === "one") newInitialPaid = subtotal;
                                  else if (value === "two") newInitialPaid = subtotal / 2;
                                  else if (value === "four") newInitialPaid = subtotal / 4;

                                  return {
                                    ...prev,
                                    paymentPlan: value,
                                    initialPaidAmount: Number(newInitialPaid.toFixed(3)),
                                  };
                                });
                              }}
                            >
                              <SelectTrigger id="paymentPlan" className={`border-blue-300 focus:border-blue-500 bg-white ${errors.paymentPlan ? 'border-red-500 ring-1 ring-red-500' : ''}`}>
                                <SelectValue placeholder="Select payment plan" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="one">One Installment</SelectItem>
                                <SelectItem value="two">Two Installments</SelectItem>
                                <SelectItem value="four">Four Installments</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            renderStaticDisplay(
                              feeStructure.paymentPlan === "one"
                                ? "One Installment"
                                : feeStructure.paymentPlan === "two"
                                  ? "Two Installments"
                                  : "Four Installments"
                            )
                          )}
                        </div>
                        <div className="col-span-2 space-y-4">
                          <div>
                            <Label>Total Amount (OMR)</Label>
                            {renderStaticDisplay(feeStructure.total?.toFixed(3) || "0.000", { className: "font-semibold text-lg bg-blue-50 border-blue-200" })}
                            <p className="text-sm text-gray-600 mt-1">
                              {convertToArabicWords(feeStructure.total)}
                            </p>
                          </div>

                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-blue-700 font-bold">Initial Paid Amount (OMR)</Label>
                                {isEditMode ? (
                                  <>
                                    <Input
                                      id="initial_paid_amount"
                                      type="number"
                                      step="0.001"
                                      value={feeStructure.initialPaidAmount || ""}
                                      onFocus={(e) => e.target.select()}
                                      onChange={(e) => {
                                        const value = parseFloat(e.target.value) || 0;
                                        setFeeStructure((prev) => ({
                                          ...prev,
                                          initialPaidAmount: value,
                                        }));
                                      }}
                                      className={`border-blue-300 focus:border-blue-500 ${errors.initial_paid_amount ? 'border-red-500 ring-1 ring-red-500 text-red-600' : ''}`}
                                    />
                                    {errors.initial_paid_amount && (
                                      <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.initial_paid_amount}</p>
                                    )}
                                  </>
                                ) : (
                                  renderStaticDisplay(feeStructure.initialPaidAmount.toFixed(3), { className: "border-blue-200" })
                                )}
                              </div>
                              <div>
                                <Label className="text-green-700 font-bold">Balance Amount (OMR)</Label>
                                {renderStaticDisplay(feeStructure.balanceAmount?.toFixed(3) || "0.000", { className: "font-bold text-lg bg-green-50 text-green-700 border-green-200" })}
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 italic">
                              * The balance amount will be divided into the installments defined in the payment plan.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information Section */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-4">
                        Contact Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="flex items-center gap-1">
                            Academic Year <span className="text-red-500">*</span>
                          </Label>
                          {isEditMode ? (
                            <Select
                              value={selectedAcademicYearId}
                              onValueChange={setSelectedAcademicYearId}
                              required
                            >
                              <SelectTrigger id="academic_year" className={`${errors.academic_year ? 'border-red-500 ring-1 ring-red-500' : ''}`}>
                                <SelectValue placeholder="Select academic year" />
                              </SelectTrigger>
                              <SelectContent>
                                {academicYears.map((year) => (
                                  <SelectItem key={year.id} value={year.id}>
                                    {year.name} ({year.start_date} to {year.end_date})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            renderStaticDisplay(
                              academicYears.find(y => y.id === selectedAcademicYearId)?.name || "Not selected"
                            )
                          )}
                        </div>
                        <div>
                          <Label>House Number</Label>
                          {isEditMode ? (
                            <Input
                              value={houseNumber}
                              onChange={(e) => setHouseNumber(e.target.value)}
                              placeholder="e.g. B-102"
                              required
                            />
                          ) : (
                            renderStaticDisplay(houseNumber)
                          )}
                        </div>
                        <div className="col-span-2">
                          <Label>Residence Address</Label>
                          {isEditMode ? (
                            <Input
                              value={residenceAddress}
                              onChange={(e) => setResidenceAddress(e.target.value)}
                              placeholder="e.g. Al-Khuwair, Muscat, Oman"
                              required
                            />
                          ) : (
                            renderStaticDisplay(residenceAddress)
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Agreement Terms Section */}

                    {/* Submission Section */}
                    {submitError && (
                      <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
                        {submitError}
                      </div>
                    )}
                    <div className="flex justify-end gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetForm}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700"
                        disabled={isSubmitting || !isEditMode}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {selectedStudent?.financial_agreement ? "Updating..." : "Submitting..."}
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <FileText className="mr-2 h-4 w-4" />
                            {selectedStudent?.financial_agreement ? "Update Agreement" : "Submit Agreement"}
                          </span>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Created Agreements</h3>
                  {agreements.filter((a) => a.status === "agreement-created")
                    .length > 0 ? (
                    <div className="space-y-2">
                      {agreements
                        .filter((a) => a.status === "agreement-created")
                        .map((agreement) => {
                          const student = getStudent(agreement.studentId);
                          return (
                            <Card key={agreement.id}>
                              <CardContent className="p-4 flex justify-between items-center">
                                <div>
                                  <h4 className="font-medium">
                                    {student?.name}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {student?.grade} • Total: $
                                    {agreement.fees.total.toFixed(2)}
                                  </p>
                                  <p className="text-sm mt-1 text-gray-500">
                                    Created: {agreement.createdDate}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={async () => {
                                      const accessToken = localStorage.getItem("accessToken");
                                      const response = await fetch(
                                        `${import.meta.env.VITE_API_BASE_URL}/students/financial-agreement-pdf-download/${agreement.id}/`,
                                        { headers: { Authorization: `Bearer ${accessToken}` } }
                                      );
                                      if (response.ok) {
                                        const blob = await response.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        window.open(url, '_blank');
                                      }
                                    }}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View PDF
                                  </Button>
                                  <Button
                                    onClick={() =>
                                      handleSendForESignature(agreement)
                                    }
                                    className="bg-blue-600 hover:bg-blue-700"
                                  >
                                    <Send className="mr-2 h-4 w-4" />
                                    Send for E-Signature
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-lg font-medium text-gray-900">
                        No agreements created
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Select a student from the Agreements tab to create
                        an agreement
                      </p>
                      <Button
                        className="mt-4"
                        onClick={() => setActiveTab("pending")}
                      >
                        View Agreements
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "esign" && (
          <Card>
            <CardHeader>
              <CardTitle>E-Signature Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-4">
                  {/* Pending Signatures Section */}
                  {(statusFilter === "all" || statusFilter === "pending") && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Pending Signatures
                      </h3>
                      {pendingStudents.flatMap(student => 
                        student.allAgreements
                          .filter(a => !a.is_verified_agreement_pdf)
                          .map(agreement => ({ student, agreement }))
                      ).length > 0 ? (
                        <div className="space-y-2">
                          {pendingStudents.flatMap(student => 
                              student.allAgreements
                                .filter(a => !a.is_verified_agreement_pdf)
                                .map(agreement => ({ student, agreement }))
                            )
                            .sort((a, b) => new Date(b.agreement.agreement_date || '').getTime() - new Date(a.agreement.agreement_date || '').getTime())
                            .map(({ student, agreement }) => (
                              <Card key={agreement.id}>
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <h4 className="font-medium">
                                        {student.name || student.nameAr}
                                      </h4>
                                      <p className="text-sm text-gray-600">
                                        {agreement.admission_class_name || student.grade} • Contract:{" "}
                                        {agreement.contract_number}
                                      </p>
                                      <p className="text-sm mt-1 text-gray-500">
                                        Created: {agreement.agreement_date}
                                      </p>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        variant="outline"
                                        onClick={() => handleViewAgreement({ ...student, financial_agreement: agreement })}
                                        className="border-blue-200 text-blue-700 hover:bg-blue-50"
                                      >
                                        <Eye className="mr-2 h-4 w-4" />
                                        View
                                      </Button>
                                      <Button
                                        onClick={() => {
                                          const agreementData = {
                                            id: student.id,
                                            studentId: student.id,
                                            rawData: student.rawData,
                                            status: "pending",
                                            agreementId: agreement.id,
                                            createdDate: agreement.agreement_date || "",
                                          };
                                          console.log("Setting currentSigningAgreement (E-Signature Tab):", agreementData);
                                          setCurrentSigningAgreement(agreementData as any);
                                          setIsSignatureModalOpen(true);
                                        }}
                                        className="bg-blue-600 hover:bg-blue-700"
                                      >
                                        <PenTool className="mr-2 h-4 w-4" />
                                        Sign Now
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <CheckCircle className="mx-auto h-10 w-10 text-gray-400" />
                          <p className="mt-2 text-gray-600">
                            No agreements pending signature
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Signed Agreements Section */}
                  {(statusFilter === "all" || statusFilter === "signed") && (
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-4">
                        Completed Signatures
                      </h3>
                      {pendingStudents.flatMap(student => 
                        student.allAgreements
                          .filter(a => a.is_verified_agreement_pdf)
                          .map(agreement => ({ student, agreement }))
                      ).length > 0 ? (
                        <div className="space-y-2">
                          {pendingStudents
                            .flatMap(student => 
                              student.allAgreements
                                .filter(a => a.is_verified_agreement_pdf)
                                .map(agreement => ({ student, agreement }))
                            )
                            .sort((a, b) => new Date(b.agreement.agreement_date || '').getTime() - new Date(a.agreement.agreement_date || '').getTime())
                            .map(({ student, agreement }) => (
                              <Card key={agreement.id}>
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <h4 className="font-medium">
                                        {student.name || student.nameAr}
                                      </h4>
                                      <p className="text-sm text-gray-600">
                                        {agreement.admission_class_name || student.grade} • Contract: {agreement.contract_number}
                                      </p>
                                      <p className="text-sm mt-1 text-gray-500">
                                        Signed on: {agreement.agreement_date}
                                      </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <div className="text-green-600 flex items-center">
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        <span>Signed</span>
                                      </div>
                                      <Button
                                        variant="outline"
                                        onClick={() => handleViewPDF(agreement.id)}
                                        className="border-blue-200 text-blue-700 hover:bg-blue-50"
                                      >
                                        <Eye className="mr-2 h-4 w-4" />
                                        View PDF & Download
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="mx-auto h-10 w-10 text-gray-400" />
                          <p className="mt-2 text-gray-600">
                            No completed signatures yet
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Signature Popup Modal */}
        <Dialog open={isSignatureModalOpen} onOpenChange={setIsSignatureModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <PenTool className="h-6 w-6 text-green-600" />
                Sign Agreement for {currentSigningAgreement?.rawData?.en_first_name} {currentSigningAgreement?.rawData?.en_last_name}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 pt-4">
              <div className="flex flex-col md:flex-row justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Review Document</p>
                    <p className="text-xs text-slate-500">Contract No: {currentSigningAgreement?.rawData?.financial_agreement[0]?.contract_number}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleViewPDF(currentSigningAgreement?.agreementId || currentSigningAgreement?.rawData?.financial_agreement[0]?.id, true)}
                    className="border-slate-200 hover:bg-slate-100"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View PDF
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      const agreementId = currentSigningAgreement?.agreementId || currentSigningAgreement?.rawData?.financial_agreement[0]?.id;
                      if (!agreementId) return;
                      setIsPdfLoading(true);
                      try {
                        const accessToken = localStorage.getItem("accessToken");
                        const response = await fetch(
                          `${import.meta.env.VITE_API_BASE_URL}/students/financial-agreement-pdf-download/${agreementId}/`,
                          { headers: { Authorization: `Bearer ${accessToken}` } }
                        );
                        if (!response.ok) throw new Error("Failed to fetch PDF");
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.style.display = 'none';
                        a.href = url;
                        const studentName = currentSigningAgreement?.rawData?.en_first_name || 'student';
                        a.download = `Financial_Agreement_${studentName}.pdf`;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                      } catch (error: any) {
                        console.error("Download error:", error);
                        Swal.fire({ title: 'Error', text: error.message, icon: 'error' });
                      } finally {
                        setIsPdfLoading(false);
                      }
                    }}
                    disabled={isPdfLoading}
                  >
                    {isPdfLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                    Download PDF
                  </Button>
                </div>
              </div>

              {/* Signature Pad Section */}
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-base font-bold text-slate-900">Guardian Signature | توقيع ولي الأمر</Label>
                  <p className="text-sm text-slate-500">Please sign in the box below | يرجى التوقيع في المربع أدناه</p>
                </div>
                
                <div className="border-2 border-dashed border-slate-200 rounded-2xl bg-white overflow-hidden shadow-inner">
                  <SignaturePad
                    canvasProps={{ 
                      className: "w-full h-64 cursor-crosshair",
                      style: { touchAction: 'none' } 
                    }}
                    ref={(ref) => setGuardianSignaturePad(ref)}
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Officer signature automated</span>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => guardianSignaturePad?.clear()}
                    className="text-slate-500 hover:text-red-600 transition-colors"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Clear Pad
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsSignatureModalOpen(false)}
                  className="px-6 py-6 rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    if (!guardianSignaturePad || !currentSigningAgreement?.rawData) return;
                    if (guardianSignaturePad.isEmpty()) {
                      Swal.fire({ title: 'Warning', text: "Please provide the guardian signature", icon: 'warning' });
                      return;
                    }
                    if (!savedOfficerSignature) {
                      Swal.fire({ title: 'Error', text: "Officer signature not found in profile.", icon: 'error' });
                      return;
                    }

                    setIsProcessing(true);
                    setProcessingStep("Fetching Document Template...");
                    
                    try {
                      const accessToken = localStorage.getItem("accessToken");
                      const agreementToSign = currentSigningAgreement.rawData.financial_agreement.find((a: any) => 
                        a.id === currentSigningAgreement.agreementId || String(a.auto_id) === String(currentSigningAgreement.agreementId)
                      ) || currentSigningAgreement.rawData.financial_agreement[0];
                      
                      const agreementId = agreementToSign.id;
                      console.log("Agreement being signed:", agreementToSign);
                      console.log("Using UUID for endpoints:", agreementId);

                      const pdfUrl = `${import.meta.env.VITE_API_BASE_URL}/students/financial-agreement-pdf-download/${agreementId}/`;
                      console.log("PDF download URL:", pdfUrl);

                      const pdfResponse = await fetch(pdfUrl, {
                        headers: { Authorization: `Bearer ${accessToken}` }
                      });
                      
                      if (!pdfResponse.ok) {
                        const errorMsg = `Failed to fetch PDF (${pdfResponse.status})`;
                        console.error(errorMsg);
                        throw new Error(errorMsg);
                      }

                      setProcessingStep("Injecting Signatures...");
                      const arrayBuffer = await pdfResponse.arrayBuffer();
                      const pdfDoc = await PDFDocument.load(arrayBuffer);
                      
                      const convertSignature = (pad: any) => trimCanvas(pad.getCanvas()).toDataURL('image/png');
                      const dataUrlToArrayBuffer = (url: string) => {
                        const base64 = url.split(',')[1];
                        const binary = window.atob(base64);
                        const len = binary.length;
                        const buffer = new Uint8Array(len);
                        for (let i = 0; i < len; i++) {
                          buffer[i] = binary.charCodeAt(i);
                        }
                        return buffer.buffer;
                      };

                      const guardianSignatureUrl = convertSignature(guardianSignaturePad);
                      const guardianPngBytes = dataUrlToArrayBuffer(guardianSignatureUrl);
                      const guardianImage = await pdfDoc.embedPng(guardianPngBytes);

                      const page = pdfDoc.getPages()[0];
                      const currentAgreement = currentSigningAgreement.rawData.financial_agreement[0];
                      const isEnglish = currentAgreement.language === "english";
                      const sigY = isEnglish ? 80 : 175;
                      const guardianX = isEnglish ? 125 : 110;

                      page.drawImage(guardianImage, {
                        x: guardianX,
                        y: sigY,
                        width: 120,
                        height: 40,
                        opacity: 1,
                      });

                      setProcessingStep("Finalizing PDF Document...");
                      const signedPdfBytes = await pdfDoc.save();
                      const blob = new Blob([signedPdfBytes], { type: 'application/pdf' });
                      const formData = new FormData();
                      formData.append("agreement_pdf", blob, `signed-agreement-${agreementId}.pdf`);
                      formData.append("is_verified_agreement_pdf", 'true');

                      setProcessingStep("Uploading Signed Agreement...");
                      const patchUrl = `${import.meta.env.VITE_API_BASE_URL}/students/update-payment-flag/${agreementId}/`;
                      console.log("PATCH upload URL:", patchUrl);

                      const response = await fetch(patchUrl, {
                        method: 'PATCH',
                        headers: { Authorization: `Bearer ${accessToken}` },
                        body: formData,
                      });

                      if (!response.ok) {
                        const errorMsg = `Upload failed (${response.status})`;
                        console.error(errorMsg);
                        throw new Error(errorMsg);
                      }

                      await loadData();
                      setIsSignatureModalOpen(false);
                      setCurrentSigningAgreement(null);
                      guardianSignaturePad.clear();

                      Swal.fire({ title: 'Success', text: 'Agreement signed successfully!', icon: 'success', timer: 5000 });
                    } catch (error: any) {
                      console.error("Signing error:", error);
                      Swal.fire({ title: 'Error', text: error.message, icon: 'error' });
                    } finally {
                      setIsProcessing(false);
                    }
                  }}
                  className="px-10 py-6 rounded-xl bg-green-600 hover:bg-green-700 text-white font-black shadow-lg shadow-green-200 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {processingStep || "Processing..."}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Sign & Submit Agreement
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default FinancialAgreementDashboard;
