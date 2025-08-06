import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FileText, DollarSign, PenTool, Clock, CheckCircle, XCircle, Send, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import SignaturePad from "react-signature-canvas";
import { PDFDocument } from 'pdf-lib';

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
  books_fees: string;
  stationery_fees: string;
  transportation_fees: string;
  administrative_fees: string;
  total_fees_omr: string;
  total_fees_in_words: string;
  installment_plan: 'one' | 'two' | 'four';
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
  gender: 'M' | 'F' | 'O';
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
}

interface FeeStructure {
  tuitionFee: number;
  registrationFee: number;
  booksFee: number;
  uniformFee: number;
  transportFee: number;
  examFee: number;
  extraActivities: number;
  total: number;
  paymentPlan?: string;
  discount?: number;
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

interface FinancialAgreementRequest {
  student: string;
  contract_number: string;
  admission_class: string;
  contract_type: string;
  registration_fees: string;
  books_fees: string;
  stationery_fees: string;
  transportation_fees: string;
  administrative_fees: string;
  total_fees_omr: string;
  total_fees_in_words: string;
    installment_plan: 'one' | 'two' | 'four';
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
  | 'not-created'       // When financial_agreement is empty array []
  | 'pending-signature' // When agreement exists but is_verified_agreement_pdf is false
  | 'completed';        // When is_verified_agreement_pdf is true
  const FinancialAgreementDashboard = () => {
    const [activeTab, setActiveTab] = useState<'pending' | 'agreements' | 'esign'>('pending');
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [pendingStudents, setPendingStudents] = useState<Student[]>([]);
    const [agreements, setAgreements] = useState<Agreement[]>([]);
    const [feeStructure, setFeeStructure] = useState<FeeStructure>({
      tuitionFee: 0,
      registrationFee: 0,
      booksFee: 0,
      uniformFee: 0,
      transportFee: 0,
      examFee: 0,
      extraActivities: 0,
      total: 0
    });
  const [agreementDetails, setAgreementDetails] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [signaturePad, setSignaturePad] = useState<SignaturePad | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [currentSigningAgreement, setCurrentSigningAgreement] = useState<Agreement | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [motherMobile, setMotherMobile] = useState('');
  const [fatherMobile, setFatherMobile] = useState('');
  const [workPhone, setWorkPhone] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [residenceAddress, setResidenceAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [guardianSignaturePad, setGuardianSignaturePad] = useState(null);
  const [employerSignaturePad, setEmployerSignaturePad] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);


    // Load initial data
  // Update your useEffect hook for fetching data:
    useEffect(() => {
      const loadData = async () => {
        try {
          const accessToken = localStorage.getItem("accessToken");
          
          if (!accessToken) {
            console.error("No access token found");
            return;
          }

          const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/students/studentslist-financial-agreement/`,
            { 
              headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
              }
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
          } 
          else if (data.data && Array.isArray(data.data)) {
            studentsArray = data.data;
          }
          else if (data.id) {
            studentsArray = [data];
          } else {
            throw new Error("Unexpected API response format");
          }

          // Transform the data with updated status logic
        const formattedStudents: Student[] = studentsArray.map((student: any) => {
      let status: 'not-created' | 'pending' | 'signed';
      let statusAr: string;
      
      // Handle cases where financial_agreement is null, undefined, or empty array
      if (!student.financial_agreement || 
          (Array.isArray(student.financial_agreement) && student.financial_agreement.length === 0)) {
          status = 'not-created';
          statusAr = 'لم يتم الإنشاء';
      } else if (Array.isArray(student.financial_agreement)) {
          // Handle case where financial_agreement is an array
          const agreement = student.financial_agreement[0]; // Take the first agreement if array
          if (!agreement.is_verified_agreement_pdf) {
              status = 'pending';
              statusAr = 'بانتظار التحقق';
          } else {
              status = 'signed';
              statusAr = 'تم التوقيع';
          }
      } else if (!student.financial_agreement.is_verified_agreement_pdf) {
          // Handle case where financial_agreement is a single object
          status = 'pending';
          statusAr = 'بانتظار التحقق';
      } else {
          status = 'signed';
          statusAr = 'تم التوقيع';
      }

      return {
          id: student.id?.toString() || "unknown-id",
          name: `${student.en_first_name || ''} ${student.en_last_name || ''}`.trim(),
          nameAr: `${student.ar_first_name || ''} ${student.ar_last_name || ''}`.trim(),
          grade: student.admission_class?.department_name || "N/A",
          type: student.section?.name || "N/A",
          registrationDate: student.admission_date,
          financial_agreement: Array.isArray(student.financial_agreement) 
              ? student.financial_agreement[0] || null 
              : student.financial_agreement,
          status,
          statusAr,
          guardianEmail: student.email || "",
          rawData: student
      };
  });
          
          setPendingStudents(formattedStudents);

        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      

      loadData();
    }, []);

    const calculateTotal = () => {
      const subtotal = Object.entries(feeStructure)
        .filter(([key]) => !['total', 'paymentPlan', 'discount'].includes(key))
        .reduce((sum, [_, value]) => sum + (typeof value === 'number' ? value : 0), 0);
      
      // Apply 5% discount only for 'one' installment plan (full payment)
      const discount = feeStructure.paymentPlan === 'one' ? 5 : 0;
      const total = subtotal * (1 - discount/100);
      
      setFeeStructure(prev => ({
        ...prev,
        total,
        discount
      }));
    };
    const handleCreateAgreement = (student: Student) => {
      setSelectedStudent(student);
      
      // Pre-populate fees
      setFeeStructure({
        tuitionFee: 1000,
        registrationFee: 200,
        booksFee: 150,
        uniformFee: 100,
        transportFee: 300,
        examFee: 50,
        extraActivities: 75,
        total: 1875,
        paymentPlan: 'one'
      });
      
      setActiveTab('agreements');
    };


    const handleSendForESignature = (agreement: Agreement) => {
      // In a real app, this would send an email to the guardian
      const updatedAgreement = {
        ...agreement,
        sentDate: new Date().toISOString().split('T')[0],
        status: 'sent-for-signature'
      };
      
      setAgreements(agreements.map(a => 
        a.id === agreement.id ? updatedAgreement : a
      ));
      alert(`Sent agreement to ${getStudent(agreement.studentId)?.guardianEmail}`);
    };

    const resetAgreementForm = () => {
      setSelectedStudent(null);
      setFeeStructure({
        tuitionFee: 0,
        registrationFee: 0,
        booksFee: 0,
        uniformFee: 0,
        transportFee: 0,
        examFee: 0,
        extraActivities: 0,
        total: 0
      });
      setAgreementDetails('');
    };

    const getStudent = (studentId: string) => {
      return [...pendingStudents].find(s => s.id === studentId);
    };

    const filteredStudents = pendingStudents.filter(student => 
      statusFilter === 'all' || student.status === statusFilter
    );

    const filteredAgreements = agreements.filter(agreement => {
      if (activeTab === 'esign') return true;
      return agreement.status === 'agreement-created';
    });

    const handleSubmitAgreement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    console.log("Submitting agreement for student:", selectedStudent);
    

    if (!selectedStudent) {
      setSubmitError('Please select a student');
      setIsSubmitting(false);
      return;
    }

    const now = new Date();
  const contractNumber = `FA-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`;

    // Prepare the request payload
    const payload: FinancialAgreementRequest = {
      student: selectedStudent.id,
      contract_number: contractNumber,
      admission_class : selectedStudent.rawData.admission_class.id,
      contract_type: "new",
      registration_fees: feeStructure.registrationFee.toFixed(3),
      books_fees: feeStructure.booksFee.toFixed(3),
      stationery_fees: "20.000", // Default value or make editable
      transportation_fees: feeStructure.transportFee.toFixed(3),
      administrative_fees: "10.000", // Default value or make editable
      total_fees_omr: feeStructure.total.toFixed(3),
      total_fees_in_words: convertToWords(feeStructure.total),
      installment_plan: getInstallmentPlan(feeStructure.paymentPlan),
      mobile_mother: motherMobile,
      mobile_father: fatherMobile,
      work_phone: workPhone,
      house_number: houseNumber,
      residence_address: residenceAddress,
      agreement_date: now.toISOString().split('T')[0],
    };

    // Add installment dates if not full payment
  // In your handleSubmitAgreement function, replace the installment date calculation with:
  if (feeStructure.paymentPlan !== 'one') {
    const firstInstallmentDate = new Date(now);
    firstInstallmentDate.setMonth(firstInstallmentDate.getMonth() + 1);
    payload.installment1_date = firstInstallmentDate.toISOString().split('T')[0];
    
    const installments = feeStructure.paymentPlan === 'two' ? 2 : 4;
    payload.installment1_amount = (feeStructure.total / installments).toFixed(3);

    if (feeStructure.paymentPlan === 'two' || feeStructure.paymentPlan === 'four') {
      const secondInstallmentDate = new Date(firstInstallmentDate);
      secondInstallmentDate.setMonth(secondInstallmentDate.getMonth() + 1);
      payload.installment2_date = secondInstallmentDate.toISOString().split('T')[0];
      payload.installment2_amount = payload.installment1_amount;
    }

    if (feeStructure.paymentPlan === 'four') {
      const thirdInstallmentDate = new Date(firstInstallmentDate);
      thirdInstallmentDate.setMonth(thirdInstallmentDate.getMonth() + 2);
      payload.installment3_date = thirdInstallmentDate.toISOString().split('T')[0];
      payload.installment3_amount = payload.installment1_amount;

      const fourthInstallmentDate = new Date(firstInstallmentDate);
      fourthInstallmentDate.setMonth(fourthInstallmentDate.getMonth() + 3);
      payload.installment4_date = fourthInstallmentDate.toISOString().split('T')[0];
      payload.installment4_amount = payload.installment1_amount;
    }
  }

    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) throw new Error("Authentication required");

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/students/financial-agreement-create/`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
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


      setPendingStudents(pendingStudents.filter(s => s.id !== selectedStudent.id));
      resetForm();
      alert('Agreement submitted successfully!');
      window.location.reload(); 
      setActiveTab('pending');
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInstallmentPlan = (plan: string | undefined): 'one' | 'two' | 'four' => {
    switch (plan) {
      case 'one': return 'one';
      case 'two': return 'two';
      case 'four': return 'four';
      default: return 'one'; // Default to one installment
    }
  };

  const resetForm = () => {
    setSelectedStudent(null);

    setAgreementDetails('');
    setMotherMobile('');
    setFatherMobile('');
    setWorkPhone('');
    setHouseNumber('');
    setResidenceAddress('');
  };

  const convertToWords = (num: number): string => {
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', 'Ten', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    if (num === 0) return 'Zero Omani Riyals';
    
    let words = '';
    const wholeNumber = Math.floor(num);
    const decimal = Math.round((num - wholeNumber) * 1000);
    
    if (wholeNumber > 0) {
      if (wholeNumber >= 100) {
        words += units[Math.floor(wholeNumber / 100)] + ' Hundred ';
      }
      
      const remainder = wholeNumber % 100;
      if (remainder > 0) {
        if (remainder < 10) {
          words += units[remainder] + ' ';
        } else if (remainder < 20) {
          words += teens[remainder - 10] + ' ';
        } else {
          words += tens[Math.floor(remainder / 10)] + ' ';
          if (remainder % 10 > 0) {
            words += units[remainder % 10] + ' ';
          }
        }
      }
    }
    
    words += 'Omani Riyals';
    
    if (decimal > 0) {
      words += ' and ' + decimal.toString().padStart(3, '0') + ' Baisa';
    }
    
    return words;
  };

  

    return (
      <div className="p-6 space-y-6">

        {isProcessing && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
      <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
      <p className="text-lg font-medium">Processing Agreement...</p>
      <p className="text-sm text-gray-500">Please wait while we save your signatures</p>
    </div>
  </div>
)}
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financial Agreement Officer</h1>
            <p className="text-gray-600" dir="rtl">موظف العقود المالية</p>
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
            className={`px-6 py-3 font-medium ${activeTab === 'pending' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('pending')}
          >
            <Clock className="inline mr-2 h-4 w-4" />
            Pending Students | الطلاب المعلقة
          </button>
          <button
            className={`px-6 py-3 font-medium ${activeTab === 'agreements' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('agreements')}
          >
            <FileText className="inline mr-2 h-4 w-4" />
            Agreements | الاتفاقيات
          </button>
          <button
            className={`px-6 py-3 font-medium ${activeTab === 'esign' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('esign')}
          >
            <PenTool className="inline mr-2 h-4 w-4" />
            E-Signature | التوقيع الإلكتروني
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'pending' && (
            <Card>
              <CardHeader>
                <CardTitle>Pending Students | الطلاب المعلقة</CardTitle>
                <div className="mt-4">
                  <Label>Filter by Status | تصفية حسب الحالة</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All | الكل</SelectItem>
                      <SelectItem value="pending">Pending | معلق</SelectItem>
                      <SelectItem value="not-created">Not-created | غير مخلوق</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grad</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admission Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.map((student) => (
    <tr key={student.id}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="font-medium">{student.name}</div>
        <div className="text-gray-500" dir="rtl">{student.nameAr}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.grade}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div>{student.type}</div>
        <div className="text-gray-500" dir="rtl">{student.typeAr}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.registrationDate}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div>{student.status}</div>
        <div className="text-gray-500" dir="rtl">{student.statusAr}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {student.status === 'not-created' && (
          <Button 
            onClick={() => handleCreateAgreement(student)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <FileText className="mr-2 h-4 w-4" />
            Create Agreement
          </Button>
        )}
        {student.status === 'pending' && (
          <span className="text-yellow-600">Pending Verification</span>
        )}
        {student.status === 'signed' && (
          <span className="text-green-600">Agreement Signed</span>
        )}
      </td>
    </tr>
  ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'agreements' && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedStudent ? 'Create Financial Agreement' : 'Agreement Management'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedStudent ? (
                  <div className="space-y-6">
                    {/* Student Details */}
                
  <form onSubmit={handleSubmitAgreement}>
    {/* Student Info Section */}
    <div className="border-b pb-4 mb-6">
      <h3 className="text-lg font-semibold mb-4">Student Information</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Name (English)</Label>
          <Input value={selectedStudent?.name || ''} readOnly />
        </div>
        <div>
          <Label>Name (Arabic)</Label>
          <Input value={selectedStudent?.nameAr || ''} readOnly dir="rtl" />
        </div>
        <div>
          <Label>Grade</Label>
          <Input value={selectedStudent?.grade || ''} readOnly />
        </div>
        <div>
          <Label>Guardian Email</Label>
          <Input value={selectedStudent?.guardianEmail || 'N/A'} readOnly />
        </div>
      </div>
    </div>

    {/* Fee Structure Section */}
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4">Fee Structure</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Registration Fees (OMR)</Label>
          <Input
            type="number"
            step="0.001"
            value={feeStructure.registrationFee}
            onChange={(e) => {
              const value = parseFloat(e.target.value) || 0;
              setFeeStructure(prev => ({ ...prev, registrationFee: value }));
              calculateTotal();
            }}
          />
        </div>
        <div>
          <Label>Books Fees (OMR)</Label>
          <Input
            type="number"
            step="0.001"
            value={feeStructure.booksFee}
            onChange={(e) => {
              const value = parseFloat(e.target.value) || 0;
              setFeeStructure(prev => ({ ...prev, booksFee: value }));
              calculateTotal();
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
              setFeeStructure(prev => ({ ...prev, transportFee: value }));
              calculateTotal();
            }}
          />
        </div>
        <div>
          <Label>Payment Plan</Label>
  <Select
    value={feeStructure.paymentPlan || 'one'}
    onValueChange={(value) => {
      setFeeStructure(prev => ({ ...prev, paymentPlan: value }));
      calculateTotal();
    }}
  >
    <SelectTrigger>
      <SelectValue placeholder="Select payment plan" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="one">One Installment(5% Discount)</SelectItem>
      <SelectItem value="two">Two Installments</SelectItem>
      <SelectItem value="four">Four Installments</SelectItem>
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
            {convertToWords(feeStructure.total)}
          </p>
        </div>
      </div>
    </div>

    {/* Contact Information Section */}
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
      <div className="grid grid-cols-2 gap-4">
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
            onChange={(e) => setResidenceAddress(e.target.value)}
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
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
                    {agreements.filter(a => a.status === 'agreement-created').length > 0 ? (
                      <div className="space-y-2">
                        {agreements.filter(a => a.status === 'agreement-created').map(agreement => {
                          const student = getStudent(agreement.studentId);
                          return (
                            <Card key={agreement.id}>
                              <CardContent className="p-4 flex justify-between items-center">
                                <div>
                                  <h4 className="font-medium">{student?.name}</h4>
                                  <p className="text-sm text-gray-600">
                                    {student?.grade} • Total: ${agreement.fees.total.toFixed(2)}
                                  </p>
                                  <p className="text-sm mt-1 text-gray-500">
                                    Created: {agreement.createdDate}
                                  </p>
                                </div>
                                <Button 
                                  onClick={() => handleSendForESignature(agreement)}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  <Send className="mr-2 h-4 w-4" />
                                  Send for E-Signature
                                </Button>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900">No agreements created</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Select a student from the Pending Students tab to create an agreement
                        </p>
                        <Button 
                          className="mt-4"
                          onClick={() => setActiveTab('pending')}
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

  {activeTab === 'esign' && (
    <Card>
      <CardHeader>
        <CardTitle>E-Signature Management</CardTitle>
      </CardHeader>
      <CardContent>
        {isSigning ? (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">
              Sign Agreement for {getStudent(currentSigningAgreement?.studentId || '')?.name}
            </h3>
            
            {/* Download PDF Button */}

            <div>
              <Button
                onClick={async () => {
                  if (!currentSigningAgreement?.rawData?.financial_agreement?.id) return;
                  
                  try {
                    const accessToken = localStorage.getItem("accessToken");
                    const agreementId = currentSigningAgreement.rawData.financial_agreement.id;
                    const response = await fetch(
                      `${import.meta.env.VITE_API_BASE_URL}/students/financial-agreement-pdf-download/${agreementId}/`,
                      {
                        headers: {
                          "Authorization": `Bearer ${accessToken}`,
                        }
                      }
                    );

                    if (!response.ok) throw new Error('Failed to download PDF');
                    
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `agreement_${agreementId}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    a.remove();
                  } catch (error) {
                    console.error('Download failed:', error);
                    alert('Failed to download agreement PDF');
                  }
                }}
                className="mb-4"
              >
                <FileText className="mr-2 h-4 w-4" />
                Download Agreement PDF
              </Button>
            </div>

          {/* Guardian Signature Pad */}
  <div className="border rounded-lg p-4 mb-6">
    <Label>Guardian Signature</Label>
    <div className="border-2 border-dashed rounded-lg h-48 w-full">
      <SignaturePad 
        canvasProps={{ className: 'w-full h-full' }}
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
        canvasProps={{ className: 'w-full h-full' }}
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
      if (!guardianSignaturePad || !employerSignaturePad || 
          !currentSigningAgreement?.rawData?.financial_agreement[0]?.id) {
        return;
      }

      // Check if both signatures are empty
      if (guardianSignaturePad.isEmpty() || employerSignaturePad.isEmpty()) {
        alert('Please provide both guardian and employer signatures');
        return;
      }
       setIsProcessing(true); 

      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) throw new Error('Authentication required');
        
        const agreementId = currentSigningAgreement.rawData.financial_agreement[0].id;

        console.log(`Signing agreement with ID: ${agreementId}`);
        

        // 1. Download original PDF
        const pdfResponse = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/students/financial-agreement-pdf-download/${agreementId}/`,
          { headers: { "Authorization": `Bearer ${accessToken}` } }
        );
        if (!pdfResponse.ok) throw new Error('Failed to download PDF');

        // 2. Convert signatures to images with white background
        const convertSignature = (signaturePad) => {
          const signatureCanvas = signaturePad.getCanvas();
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = signatureCanvas.width;
          tempCanvas.height = signatureCanvas.height;
          
          const ctx = tempCanvas.getContext('2d');
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
          ctx.drawImage(signatureCanvas, 0, 0);
          
          return tempCanvas.toDataURL('image/png');
        };

        const guardianSignatureUrl = convertSignature(guardianSignaturePad);
        const employerSignatureUrl = convertSignature(employerSignaturePad);

        const [guardianPngBytes, employerPngBytes] = await Promise.all([
          fetch(guardianSignatureUrl).then(res => res.arrayBuffer()),
          fetch(employerSignatureUrl).then(res => res.arrayBuffer())
        ]);

        // 3. Load PDF and add both signatures
  // 3. Load PDF and add both signatures with proper positioning
        const pdfDoc = await PDFDocument.load(await pdfResponse.arrayBuffer());
        const guardianImage = await pdfDoc.embedPng(guardianPngBytes);
        const employerImage = await pdfDoc.embedPng(employerPngBytes);

        const pages = pdfDoc.getPages();
        const page = pages[1]; // Second page for signatures
        const { width, height } = page.getSize();
              
        page.drawImage(guardianImage, {
          x: 50,           // Left position (reduced from 100)
          y: 180,          // Vertical position (same as before)
          width: 120,      // Signature width
          height: 50,      // Signature height
        });

        // Employer signature position (right side)
        page.drawImage(employerImage, {
          x: width - 170,  // Right position (page width - signature width - margin)
          y: 180,          // Vertical position aligned with guardian
          width: 120,      // Signature width
          height: 50,      // Signature height
        });

        // 4. Save and verify before upload
        const signedPdfBytes = await pdfDoc.save();
        const blob = new Blob([signedPdfBytes], { type: 'application/pdf' });
        
        // DEBUG: Force download for verification
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'signed_agreement_preview.pdf';
        a.click();

        // 5. Upload after manual verification
        const pdfname = `FA-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`;
        const formData = new FormData();
           formData.append('agreement_pdf', blob, `signed_agreement_${pdfname.replace(/\//g, '-')}.pdf`);
          formData.append('is_verified_agreement_pdf', 'true'); // Set to false here

          const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/students/financial-agreement/${agreementId}/`,
            {
              method: "PATCH",
              headers: { "Authorization": `Bearer ${accessToken}` },
              body: formData,
            }
          );

          if (!response.ok) throw new Error('Upload failed');
          
          // Update UI state
          const updatedStudents = pendingStudents.map(student => 
            student.financial_agreement?.id === agreementId ? {
              ...student,
              financial_agreement: { 
                ...student.financial_agreement, 
                is_verified_agreement_pdf: true // Also set to false in UI state
              },
              status: 'signed',
              statusAr: 'تم التوقيع'
            } : student
          );
          
          setPendingStudents(updatedStudents);
          setIsSigning(false);
          setCurrentSigningAgreement(null);
          guardianSignaturePad.clear();
          employerSignaturePad.clear();
          
          alert('PDF successfully submitted!');
        
      
      } catch (error) {
        console.error('Error:', error);
        alert(`Error: ${error.message}`);
      }finally{
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
  {isProcessing ? 'Processing...' : 'Sign & Submit'}
  </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pending Signatures Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Pending Signatures</h3>
              {pendingStudents.filter(student => 
                student.financial_agreement && 
                !student.financial_agreement.is_verified_agreement_pdf
              ).length > 0 ? (
                <div className="space-y-2">
                  {pendingStudents.filter(student => 
                    student.financial_agreement && 
                    !student.financial_agreement.is_verified_agreement_pdf
                  ).map((student) => (
                    <Card key={student.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{student.name}</h4>
                            <p className="text-sm text-gray-600">
                              {student.grade} • Contract: {student.financial_agreement?.contract_number}
                            </p>
                            <p className="text-sm mt-1 text-gray-500">
                              Created: {student.financial_agreement?.agreement_date}
                            </p>
                          </div>
                    <Button 
                      onClick={() => {
                        setCurrentSigningAgreement({
                          id: student.id,
                          studentId: student.id,
                          rawData: student.rawData,
                          status: 'pending',
                          createdDate: student.financial_agreement?.agreement_date || ''
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
                  <p className="mt-2 text-gray-600">No agreements pending signature</p>
                </div>
              )}
            </div>

            {/* Signed Agreements Section */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Completed Signatures</h3>
              {pendingStudents.filter(student => 
                student.financial_agreement && 
                student.financial_agreement.is_verified_agreement_pdf
              ).length > 0 ? (
                <div className="space-y-2">
                  {pendingStudents.filter(student => 
                    student.financial_agreement && 
                    student.financial_agreement.is_verified_agreement_pdf
                  ).map((student) => (
                    <Card key={student.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{student.name}</h4>
                            <p className="text-sm text-gray-600">
                              {student.grade} • Contract: {student.financial_agreement?.contract_number}
                            </p>
                            <p className="text-sm mt-1 text-gray-500">
                              Signed on: {student.financial_agreement?.agreement_date}
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
      const pdfUrl = `https://almawhibatest.febnotech.com${student.financial_agreement.agreement_pdf}`;
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
    }}
  >
    View PDF &  Download
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
                  <p className="mt-2 text-gray-600">No completed signatures yet</p>
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