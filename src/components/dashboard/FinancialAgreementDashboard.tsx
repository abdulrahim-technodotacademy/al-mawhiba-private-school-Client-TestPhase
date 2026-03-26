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
} from "lucide-react";
import React, { useEffect, useState } from "react";
import SignaturePad from "react-signature-canvas";
import { PDFDocument } from "pdf-lib";
import Swal from "sweetalert2";

interface Department {
  id: string;
  auto_id: number;
  is_deleted: boolean;
  custom_order: number | null;
  alt_txt: string | null;
  department_name: string;
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
  auto_id: number;
  is_deleted: boolean;
  custom_order: number | null;
  alt_txt: string | null;
  student: string;
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
  guardian: string;
  has_special_needs: boolean;
  special_needs_details: string;
  is_promoted: boolean;
  is_active: boolean;
  is_verified_registration_officer: boolean;
  financial_agreement: FinancialAgreement | null;
  status: "not-created" | "pending" | "signed" | "Student-promoted";
}

interface FeeStructure {
  registrationFee: number;
  tutionFee: number;
  stationeryFee: number;
  transportFee: number;
  adminFee: number;
  total: number;
  paymentPlan?: string;
  discount?: number;
  subtotal?: number;
  discountedAmount?: number;
}

interface Agreement {
  id: string;
  studentId: string;
  terms: string;
  fees: FeeStructure;
  createdDate: string;
  sentDate?: string;
  signedDate?: string;
  signatureData?: string;
  rejectionReason?: string;
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
  installment_plan: "one" | "two" | "four";
  installment1_date?: string;
  installment1_amount?: string;
  installment2_date?: string;
  installment2_amount?: string;
  mobile_mother: string;
  mobile_father: string;
  work_phone: string;
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
    "pending" | "agreements" | "esign"
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
    paymentPlan: "",
  });
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [agreementDetails, setAgreementDetails] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [signaturePad, setSignaturePad] = useState<SignaturePad | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [currentSigningAgreement, setCurrentSigningAgreement] = useState<Agreement | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [motherMobile, setMotherMobile] = useState("");
  const [fatherMobile, setFatherMobile] = useState("");
  const [workPhone, setWorkPhone] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [residenceAddress, setResidenceAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [guardianSignaturePad, setGuardianSignaturePad] = useState(null);
  const [employerSignaturePad, setEmployerSignaturePad] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string>("");

  // ... inside the RegistrationDashboard component

  // Load initial data
  // Update your useEffect hook for fetching data:
  // In your student data mapping (inside the first useEffect)
  const loadData = React.useCallback(async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        console.error("No access token found");
        return;
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL
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

       const agreements = (
         Array.isArray(student.financial_agreement) ? student.financial_agreement : []
       ).sort((a, b) => b.auto_id - a.auto_id);

       const unverifiedAgreement = agreements.find(
         (a) => a && a.is_verified_agreement_pdf === false
       );

       const latestAgreement = agreements.length > 0 ? agreements[0] : null;

       if (unverifiedAgreement) {
         status = "pending";
         statusAr = "بانتظار التحقق";
         showCreateButton = false;
         primaryAgreement = unverifiedAgreement;
       } else if (agreements.length === 0) {
         status = "not-created";
         statusAr = "لم يتم الإنشاء";
         showCreateButton = true;
         primaryAgreement = null;
       } else {
         if (
           latestAgreement &&
           student.admission_class &&
           latestAgreement.admission_class !== student.admission_class.id
         ) {
           status = "Student-promoted";
           statusAr = "عدم تطابق الصف";
           showCreateButton = true;
         } else {
           status = "signed";
           statusAr = "تم التوقيع";
           showCreateButton = false;
         }
         primaryAgreement = latestAgreement;
       }

       return {
         id: student.id?.toString() || "unknown-id",
         name: `${student.en_first_name || ""} ${student.en_last_name || ""}`.trim(),
         nameAr: `${student.ar_first_name || ""} ${student.ar_last_name || ""}`.trim(),
         grade: student.admission_class?.department_name || "N/A",
         type: student.section?.name || "N/A",
         registrationDate: student.admission_date,
         financial_agreement: primaryAgreement,
         status,
         statusAr,
         showCreateButton,
         guardianEmail: student.email || "",
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

useEffect(() => {
  const fetchAcademicYears = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/students/academic-year/`,

      );

      if (!response.ok) {
        throw new Error("Failed to fetch academic years");
      }

      const responseData = await response.json();
      
      // Access the data array from the response
      if (responseData.data && Array.isArray(responseData.data)) {
        setAcademicYears(responseData.data);
        
        // Set default to current academic year if available
        const currentYear = responseData.data.find((year: AcademicYear) => year.is_current);
        if (currentYear) {
          setSelectedAcademicYearId(currentYear.id);
        }
      }
    } catch (error) {
      console.error("Error fetching academic years:", error);
    }
  };

  fetchAcademicYears();
}, []);


const calculateTotal = () => {
  // 1. Sum up the base fees to get a subtotal.
  // Using explicit properties is clearer and safer than iterating over keys.
  const subtotal =
    (feeStructure.registrationFee || 0) +
    (feeStructure.tutionFee || 0) +
    (feeStructure.stationeryFee || 0) +
    (feeStructure.adminFee || 0) +
    (feeStructure.transportFee || 0);

  // 2. Determine the discount percentage based on the payment plan.
  // This is the key logic: 5% for 'one' installment, 0% for all others.
  const discountPercentage = 0;

  // 3. Calculate the actual monetary value of the discount.
  const discountAmount = subtotal * (discountPercentage / 100);

  // 4. Calculate the final total by subtracting the discount from the subtotal.
  const finalTotal = subtotal - discountAmount;

  // 5. Update the state with all the new, calculated values.
  setFeeStructure((prev) => ({
    ...prev,
    subtotal: subtotal,           // Good to store for reference
    discount: discountPercentage, // Store the applied discount percentage
    discountedAmount: discountAmount, // Good to store for reference
    total: finalTotal,            // The final, correct total
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
    setMotherMobile(guardian.phone2 || rawData.emergency_contact || "");
    setFatherMobile(guardian.phone1 || rawData.home_contact || "");
    setWorkPhone(guardian.work_phone || "");
    setResidenceAddress(guardian.address || rawData.address || "");
    setHouseNumber(rawData.house_number || "");
  } else {
    // Fallback directly to student fields if guardian object is missing
    setMotherMobile(rawData.emergency_contact || "");
    setFatherMobile(rawData.home_contact || "");
    setResidenceAddress(rawData.address || "");
    setHouseNumber(rawData.house_number || "");
  }

  setFeeStructure({
    registrationFee: 200,
    tutionFee: 150,
    stationeryFee: 20,
    transportFee: 300,
    adminFee: 10,
    paymentPlan: "one",
    total: 0,
    discount: 0,
    subtotal: 0,
    discountedAmount: 0
  });

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

  const filteredStudents = pendingStudents.filter((student) => {
    const matchesStatus = statusFilter === "all" || student.status === statusFilter;
    const matchesClass = classFilter === "all" || student.grade === classFilter;
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rawData.admission_number?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesClass && matchesSearch;
  });

  const filteredAgreements = agreements.filter((agreement) => {
    if (activeTab === "esign") return true;
    return agreement.status === "agreement-created";
  });

  const handleSubmitAgreement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");
    console.log("Submitting agreement for student:", selectedStudent);

    if (!selectedStudent) {
      setSubmitError("Please select a student");
      setIsSubmitting(false);
      return;
    }

    if (!selectedAcademicYearId) {
      setSubmitError("Please select an academic year");
      setIsSubmitting(false);
      return;
    }

    if (!feeStructure.paymentPlan) {
      setSubmitError("Please select a payment plan");
      setIsSubmitting(false);
      return;
    }

    const now = new Date();

    // Prepare the request payload
    const payload: FinancialAgreementRequest = {
      student: selectedStudent.id,
      academic_year: selectedAcademicYearId,
      admission_class: selectedStudent.rawData.admission_class.id,
      contract_type: "new",
      registration_fees: feeStructure.registrationFee.toFixed(3),
      tution_fee: feeStructure.tutionFee.toFixed(3),
      stationery_fees: feeStructure.stationeryFee.toFixed(3),
      transportation_fees: feeStructure.transportFee.toFixed(3),
      administrative_fees: feeStructure.adminFee.toFixed(3),
      total_fees_omr: feeStructure.total.toFixed(3),
      total_fees_in_words: convertToArabicWords(feeStructure.total),
      installment_plan: getInstallmentPlan(feeStructure.paymentPlan),
      mobile_mother: motherMobile,
      mobile_father: fatherMobile,
      work_phone: workPhone,
      house_number: houseNumber,
      residence_address: residenceAddress,
      agreement_date: now.toISOString().split("T")[0],
    };

    // Add installment dates and amounts
    if (feeStructure.paymentPlan === "one") {
      payload.installment1_date = now.toISOString().split("T")[0];
      payload.installment1_amount = feeStructure.total.toFixed(3);
    } else {
      const firstInstallmentDate = new Date(now);
      firstInstallmentDate.setMonth(firstInstallmentDate.getMonth() + 1);
      payload.installment1_date = firstInstallmentDate
        .toISOString()
        .split("T")[0];

      const installmentsCount = feeStructure.paymentPlan === "two" ? 2 : 4;
      payload.installment1_amount = (feeStructure.total / installmentsCount).toFixed(
        3
      );

      if (
        feeStructure.paymentPlan === "two" ||
        feeStructure.paymentPlan === "four"
      ) {
        const secondInstallmentDate = new Date(firstInstallmentDate);
        secondInstallmentDate.setMonth(secondInstallmentDate.getMonth() + 1);
        payload.installment2_date = secondInstallmentDate
          .toISOString()
          .split("T")[0];
        payload.installment2_amount = payload.installment1_amount;
      }

      if (feeStructure.paymentPlan === "four") {
        const thirdInstallmentDate = new Date(firstInstallmentDate);
        thirdInstallmentDate.setMonth(thirdInstallmentDate.getMonth() + 2);
        payload.installment3_date = thirdInstallmentDate
          .toISOString()
          .split("T")[0];
        payload.installment3_amount = payload.installment1_amount;

        const fourthInstallmentDate = new Date(firstInstallmentDate);
        fourthInstallmentDate.setMonth(fourthInstallmentDate.getMonth() + 3);
        payload.installment4_date = fourthInstallmentDate
          .toISOString()
          .split("T")[0];
        payload.installment4_amount = payload.installment1_amount;
      }
    }

    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) throw new Error("Authentication required");

      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/students/financial-agreement-create/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit agreement");
      }

      const responseData = await response.json();
      console.log("Agreement submitted:", responseData);

      // Refresh data to update E-Signature tab and metrics
      await loadData();
      resetForm();
      await Swal.fire({
        title: 'Success',
        text: 'Agreement submitted successfully!',
        icon: 'success',
        timer: 5000,
        timerProgressBar: true
      });
      setActiveTab("pending");
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
    setMotherMobile("");
    setFatherMobile("");
    setWorkPhone("");
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
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === "pending"
              ? "border-b-2 border-green-600 text-green-600 bg-green-50/50"
              : "text-gray-600 hover:text-green-600 hover:bg-gray-50"
          }`}
          onClick={() => setActiveTab("pending")}
        >
          <Clock className="inline mr-2 h-4 w-4" />
          Pending Students | الطلاب المعلقة
        </button>
        <button
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === "esign"
              ? "border-b-2 border-green-600 text-green-600 bg-green-50/50"
              : "text-gray-600 hover:text-green-600 hover:bg-gray-50"
          }`}
          onClick={() => setActiveTab("esign")}
        >
          <PenTool className="inline mr-2 h-4 w-4" />
          E-Signature | التوقيع الإلكتروني
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-yellow-50 to-white border-yellow-100 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-yellow-600">Pending Verification</p>
              <h2 className="text-2xl font-bold text-gray-900">
                {pendingStudents.filter(s => s.status === 'pending').length}
              </h2>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Missing Agreements</p>
              <h2 className="text-2xl font-bold text-gray-900">
                {pendingStudents.filter(s => s.status === 'not-created').length}
              </h2>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-green-100 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-green-100 p-2 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-green-600">Completed (Signed)</p>
              <h2 className="text-2xl font-bold text-gray-900">
                {pendingStudents.filter(s => s.status === 'signed').length}
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
                  Pending Students | الطلاب المعلقة
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
                      <SelectTrigger className="w-[140px] h-9 text-sm bg-white border-gray-200">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="not-created">Not-created</SelectItem>
                        <SelectItem value="signed">Signed</SelectItem>
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
                    {filteredStudents.length > 0 ? (
                      (() => {
                        let lastStatus = "";
                        return filteredStudents.map((student) => {
                          const showSeparator = statusFilter === "all" && student.status !== lastStatus;
                          lastStatus = student.status;
                          
                          const rows = [];
                          
                          if (showSeparator) {
                            rows.push(
                              <tr key={`sep-${student.id}`} className="bg-gray-50/50">
                                <td colSpan={5} className="px-6 py-2">
                                  <div className="flex items-center">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                      {student.status === "pending" ? "Pending Verification | بانتظار التحقق" :
                                       student.status === "not-created" ? "To be Created | بانتظار الإنشاء" :
                                       student.status === "Student-promoted" ? "Class Mismatch | عدم تطابق الصف" :
                                       "Signed / Completed | تم التوقيع / مكتمل"}
                                    </span>
                                    <div className="flex-1 ml-4 h-[1px] bg-gray-200"></div>
                                  </div>
                                </td>
                              </tr>
                            );
                          }
                          
                          rows.push(
                            <tr key={student.id} className="hover:bg-gray-50 transition-colors group">
                              <td className="sticky left-0 bg-white group-hover:bg-gray-50 px-4 sm:px-6 py-4 whitespace-nowrap z-10 shadow-[2px_0_5px_rgba(0,0,0,0.05)] md:shadow-none">
                                <div className="font-medium text-gray-900">{student.name}</div>
                                <div className="text-gray-500 text-xs" dir="rtl">
                                  {student.nameAr}
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                                {student.grade}
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
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  student.status === "signed" ? "bg-green-100 text-green-700" :
                                  student.status === "pending" ? "bg-yellow-100 text-yellow-700 border border-yellow-200" :
                                  student.status === "not-created" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                                  "bg-gray-100 text-gray-700 font-normal normal-case"
                                }`}>
                                  {student.status === "not-created" ? "Ready" : student.status}
                                </span>
                                <div className="text-gray-400 text-[10px] mt-0.5" dir="rtl">
                                  {student.statusAr}
                                </div>
                              </td>
                              <td className="sticky right-0 bg-white group-hover:bg-gray-50 px-4 sm:px-6 py-4 whitespace-nowrap z-10 shadow-[-2px_0_5px_rgba(0,0,0,0.05)] md:shadow-none">
                                {student.showCreateButton ? (
                                  <Button
                                    size="sm"
                                    onClick={() => handleCreateAgreement(student)}
                                    className="bg-green-600 hover:bg-green-700 text-white shadow-sm h-8 px-4"
                                  >
                                    <FileText className="mr-1.5 h-3.5 w-3.5" />
                                    {student.status === "Student-promoted" 
                                      ? "Recreate" 
                                      : "Create"}
                                  </Button>
                                ) : student.status === "pending" ? (
                                  <div className="flex items-center text-yellow-600 text-xs font-bold uppercase tracking-wider">
                                    <Clock className="h-3.5 w-3.5 mr-1.5" />
                                    Pending
                                  </div>
                                ) : student.status === "signed" ? (
                                  <div className="flex items-center text-green-600 text-xs font-bold uppercase tracking-wider">
                                    <CheckCircle2 className="h-4 w-4 mr-1.5" />
                                    Signed
                                  </div>
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
            <CardHeader>
              <CardTitle>
                {selectedStudent
                  ? "Create Financial Agreement"
                  : "Agreement Management"}
              </CardTitle>
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
                          <Input value={selectedStudent?.name || ""} readOnly />
                        </div>
                        <div>
                          <Label>Name (Arabic)</Label>
                          <Input
                            value={selectedStudent?.nameAr || ""}
                            readOnly
                            dir="rtl"
                          />
                        </div>
                        <div>
                          <Label>Grade</Label>
                          <Input
                            value={selectedStudent?.grade || ""}
                            readOnly
                          />
                        </div>
                        <div>
                          <Label>Guardian Email</Label>
                          <Input
                            value={selectedStudent?.guardianEmail || "N/A"}
                            readOnly
                          />
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
                         <Input
                        type="number"
                        step="0.001"
                        value={feeStructure.registrationFee}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          // Update the fee and then immediately recalculate
                          setFeeStructure((prev) => ({
                            ...prev,
                            registrationFee: value,
                          }));
                          // We will use a useEffect hook to handle the recalculation automatically
                        }}
                      />
                        </div>
                        <div>
                          <Label>Tuition Fees (OMR)</Label>
                          <Input
                            type="number"
                            step="0.001"
                            value={feeStructure.tutionFee}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value) || 0;
                              setFeeStructure((prev) => ({
                                ...prev,
                                tutionFee: value,
                              }));
                            }}
                          />
                        </div>
                        <div>
                          <Label>Stationery Fees (OMR)</Label>
                          <Input
                            type="number"
                            step="0.001"
                            value={feeStructure.stationeryFee}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value) || 0;
                              setFeeStructure((prev) => ({
                                ...prev,
                                stationeryFee: value,
                              }));
                            }}
                          />
                        </div>
                        <div>
                          <Label>Administrative Fees (OMR)</Label>
                          <Input
                            type="number"
                            step="0.001"
                            value={feeStructure.adminFee}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value) || 0;
                              setFeeStructure((prev) => ({
                                ...prev,
                                adminFee: value,
                              }));
                            }}
                          />
                        </div>
                        <div>
                          <Label>Transportation Fees (OMR)</Label>
                          <Input
                            type="number"
                            step="0.001"
                            value={feeStructure.transportFee}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value) || 0;
                              setFeeStructure((prev) => ({
                                ...prev,
                                transportFee: value,
                              }));
                            }}
                          />
                        </div>
                        <div>
                          <Label className="flex items-center gap-1">
                            Payment Plan <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={feeStructure.paymentPlan}
                            onValueChange={(value) => {
                              setFeeStructure((prev) => ({
                                ...prev,
                                paymentPlan: value,
                              }));
                              calculateTotal();
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment plan" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="one">
                                One Installment
                              </SelectItem>
                              <SelectItem value="two">
                                Two Installments
                              </SelectItem>
                              <SelectItem value="four">
                                Four Installments
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2">
                          <Label>Total Amount (OMR)</Label>
                          <Input
                            value={feeStructure.total.toFixed(3)}
                            readOnly
                            className="font-semibold text-lg"
                          />
                          <p className="text-sm text-gray-600 mt-1">
                            {convertToArabicWords(feeStructure.total)}
                          </p>
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
                        <Select
                          value={selectedAcademicYearId}
                          onValueChange={setSelectedAcademicYearId}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select academic year" />
                          </SelectTrigger>
                          <SelectContent>
                            {academicYears.map((year) => (
                              <SelectItem key={year.id} value={year.id}>
                                {year.name} ({year.start_date} to {year.end_date})
                                {year.is_current && " (Current)"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                        <div>
                          <Label>Mother's Mobile</Label>
                          <Input
                            value={motherMobile}
                            onChange={(e) => setMotherMobile(e.target.value)}
                            placeholder="e.g. 91234567"
                            required
                          />
                        </div>
                        <div>
                          <Label>Father's Mobile</Label>
                          <Input
                            value={fatherMobile}
                            onChange={(e) => setFatherMobile(e.target.value)}
                            placeholder="e.g. 92345678"
                            required
                          />
                        </div>
                        <div>
                          <Label>Work Phone</Label>
                          <Input
                            value={workPhone}
                            onChange={(e) => setWorkPhone(e.target.value)}
                            placeholder="e.g. 24888888"
                          />
                        </div>
                        <div>
                          <Label>House Number</Label>
                          <Input
                            value={houseNumber}
                            onChange={(e) => setHouseNumber(e.target.value)}
                            placeholder="e.g. B-102"
                            required
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Residence Address</Label>
                          <Input
                            value={residenceAddress}
                            onChange={(e) =>
                              setResidenceAddress(e.target.value)
                            }
                            placeholder="e.g. Al-Khuwair, Muscat, Oman"
                            required
                          />
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
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center">
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Submitting...
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <FileText className="mr-2 h-4 w-4" />
                            Submit Agreement
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
                        Select a student from the Pending Students tab to create
                        an agreement
                      </p>
                      <Button
                        className="mt-4"
                        onClick={() => setActiveTab("pending")}
                      >
                        View Pending Students
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
              {isSigning ? (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">
                    Sign Agreement for{" "}
                    {getStudent(currentSigningAgreement?.studentId || "")?.name}
                  </h3>

                  {/* View and Download PDF Buttons */}
<div className="flex gap-2 mb-4">
  <Button
    variant="outline"
    onClick={async () => {
      setIsPdfLoading(true);
      try {
        if (!currentSigningAgreement?.rawData?.financial_agreement) {
          throw new Error("No financial agreement data found for this student.");
        }
        const agreementToShow = currentSigningAgreement.rawData.financial_agreement.find(
          (a) => a.is_verified_agreement_pdf === false
        );
        if (!agreementToShow) {
          throw new Error("Could not find an agreement pending signature to show.");
        }
        const agreementId = agreementToShow.id;
        const accessToken = localStorage.getItem("accessToken");
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/students/financial-agreement-pdf-download/${agreementId}/`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!response.ok) throw new Error("Failed to fetch PDF");
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      } catch (error) {
        console.error("Failed to view PDF:", error);
        Swal.fire({ title: 'Error', text: error.message, icon: 'error' });
      } finally {
        setIsPdfLoading(false);
      }
    }}
    disabled={isPdfLoading}
  >
    <Eye className="mr-2 h-4 w-4" />
    View Agreement PDF
  </Button>

  <Button
    onClick={async () => {
      setIsPdfLoading(true);

      try {
        // --- (Previous validation logic remains the same) ---
        if (!currentSigningAgreement?.rawData?.financial_agreement) {
          throw new Error("No financial agreement data found for this student.");
        }
        
        const agreementToShow = currentSigningAgreement.rawData.financial_agreement.find(
          (a) => a.is_verified_agreement_pdf === false
        );

        if (!agreementToShow) {
          throw new Error("Could not find an agreement pending signature to show.");
        }

        const agreementId = agreementToShow.id;
        const accessToken = localStorage.getItem("accessToken");
        
        // 1. Fetch the PDF from the server
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/students/financial-agreement-pdf-download/${agreementId}/`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch PDF. Server responded with: ${response.status} ${errorText}`);
        }

        // 2. Get the PDF data as a Blob
        const blob = await response.blob();
        
        // --- THIS IS THE NEW DOWNLOAD LOGIC ---

        // 3. Create a temporary URL for the Blob
        const url = window.URL.createObjectURL(blob);
        
        // 4. Create a temporary anchor (link) element
        const a = document.createElement('a');
        a.style.display = 'none'; // Keep it hidden
        a.href = url;
        
        // 5. Set the download filename
        const studentName = currentSigningAgreement.rawData.en_first_name || 'student';
        a.download = `Financial_Agreement_${studentName}.pdf`;
        
        // 6. Add the anchor to the page, click it to trigger the download, and then remove it
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url); // Clean up the URL object
        document.body.removeChild(a); // Clean up the anchor element

      } catch (error) {
        console.error("Failed to download PDF:", error);
        Swal.fire({
          title: 'Error',
          text: error.message || "Failed to download the agreement PDF.",
          icon: 'error',
          timer: 5000,
          timerProgressBar: true
        });
      } finally {
        setIsPdfLoading(false);
      }
    }}
    className="mb-4"
    disabled={isPdfLoading}
  >
    {isPdfLoading ? (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Downloading...
      </>
    ) : (
      <>
        <FileText className="mr-2 h-4 w-4" />
        Download Agreement PDF
      </>
    )}
  </Button>
</div>

                  {/* Guardian Signature Pad */}
                  <div className="border rounded-lg p-4 mb-6">
                    <Label>Guardian Signature</Label>
                    <div className="border-2 border-dashed rounded-lg h-48 w-full">
                      <SignaturePad
                        canvasProps={{ className: "w-full h-full" }}
                        ref={(ref) => setGuardianSignaturePad(ref)}
                      />
                    </div>
                    <div className="flex justify-end mt-2">
                      <Button
                        variant="outline"
                        onClick={() => guardianSignaturePad?.clear()}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>

                  {/* Employer Signature Pad */}
                  <div className="border rounded-lg p-4">
                    <Label>Employer Signature</Label>
                    <div className="border-2 border-dashed rounded-lg h-48 w-full">
                      <SignaturePad
                        canvasProps={{ className: "w-full h-full" }}
                        ref={(ref) => setEmployerSignaturePad(ref)}
                      />
                    </div>
                    <div className="flex justify-end mt-2">
                      <Button
                        variant="outline"
                        onClick={() => employerSignaturePad?.clear()}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>

                  {/* Submit Signature Button */}
                  <div className="flex justify-end gap-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsSigning(false);
                        setCurrentSigningAgreement(null);
                      }}
                    >
                      Cancel
                    </Button>

                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={async () => {
                        if (
                          !guardianSignaturePad ||
                          !employerSignaturePad ||
                          !currentSigningAgreement?.rawData
                            ?.financial_agreement[0]?.id
                        ) {
                          return;
                        }

                        if (
                          guardianSignaturePad.isEmpty() ||
                          employerSignaturePad.isEmpty()
                        ) {
                          Swal.fire({
                            title: 'Warning',
                            text: "Please provide both guardian and employer signatures",
                            icon: 'warning',
                            timer: 5000,
                            timerProgressBar: true
                          });
                          return;
                        }

                        setProcessingStep("Downloading original contract...");
                        setIsProcessing(true);

                        try {
                          const accessToken =
                            localStorage.getItem("accessToken");
                          if (!accessToken)
                            throw new Error("Authentication required");

                           const agreementToSign = currentSigningAgreement.rawData.financial_agreement.find(
                                  (a: any) => a.is_verified_agreement_pdf === false
                                );

                                 if (!agreementToSign) {
                                          throw new Error("Could not find an unverified agreement to sign.");
                                        }

                             const agreementId = agreementToSign.id;

                          // 1. Download original PDF
                          const pdfResponse = await fetch(
                            `${
                              import.meta.env.VITE_API_BASE_URL
                            }/students/financial-agreement-pdf-download/${agreementId}/`,
                            {
                              headers: {
                                Authorization: `Bearer ${accessToken}`,
                              },
                            }
                          );
                          if (!pdfResponse.ok)
                            throw new Error("Failed to download PDF");

                          setProcessingStep("Preparing signature images...");
                          // 2. Convert signatures to transparent PNG images
                          // Utility function to convert DataURL to ArrayBuffer without fetch
                          const dataUrlToArrayBuffer = (dataUrl: string) => {
                            const base64 = dataUrl.split(',')[1];
                            const binaryString = window.atob(base64);
                            const bytes = new Uint8Array(binaryString.length);
                            for (let i = 0; i < binaryString.length; i++) {
                              bytes[i] = binaryString.charCodeAt(i);
                            }
                            return bytes.buffer;
                          };

                          const convertSignature = (signaturePad) => {
                            const signatureCanvas = signaturePad.getCanvas();
                            const tempCanvas = document.createElement("canvas");
                            
                            // Scale down if too large to optimize PDF size
                            const maxDim = 800;
                            let width = signatureCanvas.width;
                            let height = signatureCanvas.height;
                            if (width > maxDim || height > maxDim) {
                              if (width > height) {
                                height = (height / width) * maxDim;
                                width = maxDim;
                              } else {
                                width = (width / height) * maxDim;
                                height = maxDim;
                              }
                            }
                            
                            tempCanvas.width = width;
                            tempCanvas.height = height;

                            const ctx = tempCanvas.getContext("2d");
                            ctx.clearRect(0, 0, width, height);
                            ctx.drawImage(signatureCanvas, 0, 0, width, height);

                            return tempCanvas.toDataURL("image/png", 0.8);
                          };

                          const guardianSignatureUrl = convertSignature(guardianSignaturePad);
                          const employerSignatureUrl = convertSignature(employerSignaturePad);

                          const guardianPngBytes = dataUrlToArrayBuffer(guardianSignatureUrl);
                          const employerPngBytes = dataUrlToArrayBuffer(employerSignatureUrl);

                          setProcessingStep("Attaching signatures to document...");
                          // 3. Load PDF and add transparent signatures
                          const pdfDoc = await PDFDocument.load(
                            await pdfResponse.arrayBuffer()
                          );
                          const guardianImage = await pdfDoc.embedPng(
                            guardianPngBytes
                          );
                          const employerImage = await pdfDoc.embedPng(
                            employerPngBytes
                          );

                          const pages = pdfDoc.getPages();
                          const page = pages[0]; // First (and only) page for signatures
                          const { width, height } = page.getSize();

                          // Guardian (Second Party) on the LEFT side - on توقيع الطرف الثاني/ dotted line
                          page.drawImage(guardianImage, {
                            x: 5,
                            y: 92,
                            width: 180,
                            height: 55,
                            opacity: 1,
                          });

                          // Employer (First Party) on the RIGHT side - on توقيع الطرف الأول/ dotted line
                          page.drawImage(employerImage, {
                            x: width - 238,
                            y: 92,
                            width: 180,
                            height: 55,
                            opacity: 1,
                          });

                          // 4. Save and verify before upload
                          setProcessingStep("Finalizing PDF...");
                          const signedPdfBytes = await pdfDoc.save();
                          const blob = new Blob([signedPdfBytes], {
                            type: "application/pdf",
                          });

                          // Removed auto-download of preview to speed up workflow

                          // 5. Upload signed PDF
                          setProcessingStep("Uploading signed agreement...");                          const pdfname = `FA-${new Date().getFullYear()}-${Math.floor(
                            Math.random() * 9000 + 1000
                          )}`;
                          const formData = new FormData();
                          formData.append(
                            "agreement_pdf",
                            blob,
                            `signed_agreement_${pdfname.replace(
                              /\//g,
                              "-"
                            )}.pdf`
                          );
                          formData.append("is_verified_agreement_pdf", "true");

                          const response = await fetch(
                            `${
                              import.meta.env.VITE_API_BASE_URL
                            }/students/financial-agreement/${agreementId}/`,
                            {
                              method: "PATCH",
                              headers: {
                                Authorization: `Bearer ${accessToken}`,
                              },
                              body: formData,
                            }
                          );

                          if (!response.ok) throw new Error("Upload failed");

                          // Update UI state
                          const updatedStudents = pendingStudents.map(
                            (student) =>
                              student.financial_agreement?.id === agreementId
                                ? {
                                    ...student,
                                    financial_agreement: {
                                      ...student.financial_agreement,
                                      is_verified_agreement_pdf: true,
                                    },
                                    status: "signed",
                                    statusAr: "تم التوقيع",
                                  }
                                : student
                          );

                          // Refresh data to update Signed Agreements list and metrics
                          await loadData();
                          setIsSigning(false);
                          setCurrentSigningAgreement(null);
                          guardianSignaturePad.clear();
                          employerSignaturePad.clear();

                          Swal.fire({
                            title: 'Success',
                            text: 'PDF successfully submitted!',
                            icon: 'success',
                            timer: 5000,
                            timerProgressBar: true
                          });
                        } catch (error) {
                          console.error("Error:", error);
                          Swal.fire({
                            title: 'Error',
                            text: error.message,
                            icon: 'error',
                            timer: 5000,
                            timerProgressBar: true
                          });
                        } finally {
                          setIsProcessing(false);
                        }
                      }}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="mr-2 h-4 w-4" />
                      )}
                      {isProcessing ? "Processing..." : "Sign & Submit"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Pending Signatures Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Pending Signatures
                    </h3>
                    {pendingStudents.filter(
                      (student) =>
                        student.financial_agreement &&
                        !student.financial_agreement.is_verified_agreement_pdf
                    ).length > 0 ? (
                      <div className="space-y-2">
                        {pendingStudents
                          .filter(
                            (student) =>
                              student.financial_agreement &&
                              !student.financial_agreement
                                .is_verified_agreement_pdf
                          )
                          .map((student) => (
                            <Card key={student.id}>
                              <CardContent className="p-4">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <h4 className="font-medium">
                                      {student.name}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                      {student.grade} • Contract:{" "}
                                      {
                                        student.financial_agreement
                                          ?.contract_number
                                      }
                                    </p>
                                    <p className="text-sm mt-1 text-gray-500">
                                      Created:{" "}
                                      {
                                        student.financial_agreement
                                          ?.agreement_date
                                      }
                                    </p>
                                  </div>
                                  <Button
                                    onClick={() => {
                                      setCurrentSigningAgreement({
                                        id: student.id,
                                        studentId: student.id,
                                        rawData: student.rawData,
                                        status: "pending",
                                        createdDate:
                                          student.financial_agreement
                                            ?.agreement_date || "",
                                      });
                                      setIsSigning(true);
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700"
                                  >
                                    <PenTool className="mr-2 h-4 w-4" />
                                    Sign Now
                                  </Button>
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

                  {/* Signed Agreements Section */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">
                      Completed Signatures
                    </h3>
                    {pendingStudents.filter(
                      (student) =>
                        student.financial_agreement &&
                        student.financial_agreement.is_verified_agreement_pdf
                    ).length > 0 ? (
                      <div className="space-y-2">
                        {pendingStudents
                          .filter(
                            (student) =>
                              student.financial_agreement &&
                              student.financial_agreement
                                .is_verified_agreement_pdf
                          )
                          .map((student) => (
                            <Card key={student.id}>
                              <CardContent className="p-4">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <h4 className="font-medium">
                                      {student.name}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                      {student.grade} • Contract:{" "}
                                      {
                                        student.financial_agreement
                                          ?.contract_number
                                      }
                                    </p>
                                    <p className="text-sm mt-1 text-gray-500">
                                      Signed on:{" "}
                                      {
                                        student.financial_agreement
                                          ?.agreement_date
                                      }
                                    </p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <div className="text-green-600 flex items-center">
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      <span>Signed</span>
                                    </div>
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        const pdfUrl = `${import.meta.env.VITE_DOMAIN}${student.financial_agreement.agreement_pdf}`;
                                        window.open(
                                          pdfUrl,
                                          "_blank",
                                          "noopener,noreferrer"
                                        );
                                      }}
                                    >
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
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FinancialAgreementDashboard;
