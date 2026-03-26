import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { countries } from "countries-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Swal from "sweetalert2";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, User, Upload, Save, Trash2 } from "lucide-react";
import FullPageLoader from "./FullPageLoader";

const DOCUMENT_TYPES = [
  { value: "BIRTH", label: "Birth Certificate | شهادة الميلاد" },
  { value: "TRANSFER", label: "Transfer Certificate | شهادة النقل" },
  { value: "PHOTO", label: "Photograph | صورة شخصية" },
  { value: "ID", label: "ID Proof | بطاقة الهوية" },
  { value: "GUARDIAN_ID", label: "Guardian ID Document | وثيقة هوية الوصي" },
  { value: "OTHER", label: "Other | أخرى" },
];

const RELATIONSHIP_OPTIONS = [
  { value: "father", label: "الأب / father" },
  { value: "mother", label: "الأم / mother" },
  { value: "relative", label: "أحد الأقارب / relative" },
];

const GENDER_OPTIONS = [
  { value: "M", label: "Male | ذكر" },
  { value: "F", label: "Female | أنثى" },
];

const RELIGION_OPTIONS = [
  { value: "Islam", label: "Islam | الإسلام" },
  { value: "Christianity", label: "Christianity | المسيحية" },
  { value: "Hinduism", label: "Hinduism | الهندوسية" },
  { value: "other", label: "Other | أخرى" },
];

function NewRegistrationForPublic() {
  const [departments, setDepartments] = useState<
    Array<{
      id: string;
      department_name: string;
    }>
  >([]);

  const [sections, setSections] = useState<
    Array<{
      id: string;
      name: string;
    }>
  >([]);

  const [isLoading, setIsLoading] = useState({
    departments: false,
  });

  const [formData, setFormData] = useState({
    // Student Information
    admission_number: "",
    en_first_name: "",
    en_middle_name: "",
    en_last_name: "",
    ar_first_name: "",
    ar_middle_name: "",
    ar_last_name: "",

    // Family Names
    en_father_name: "",
    ar_father_name: "",
    en_grandfather_name: "",
    ar_grandfather_name: "",
    en_tribe_name: "",
    ar_tribe_name: "",

    photo: null as File | null,
    passport_copy: null as File | null,
    house_photo: null as File | null,
    google_map_location_photo: null as File | null,
    google_map_location_url: "",

    student_email: "",
    student_phone: "",
    student_address: "",
    date_of_birth: "",
    gender: "",
    religion: "",
    nationality: "",
    governance: "",
    city: "",
    state: "",
    neighborhood: "",
    street_number: "",
    house_number: "",
    postal_code: "",
    country: "",

    section: "",
    previous_school: "",

    // Education System
    previous_education_system: "",
    wanted_education_system: "",

    has_special_needs: false,
    special_needs_details: "",
    chronic_disease: "",
    parents_divorced: false,
    staying_with: "",
    home_contact: "",
    emergency_contact: "",

    // Guardian Information
    name_en: "",
    name_ar: "",
    phone: "",
    email: "",
    address: "",
    relationship: "",
    national_id: "",
    passport_number: "",
    work_phone: "",
    mobile: "",
    occupation: "",
    workplace: "",
    guardian_id_document: null as File | null,

    // Documents
    student_documents: [] as Array<{
      document_type: string;
      file: File;
      description: string;
    }>,
  });

  const [currentDocument, setCurrentDocument] = useState({
    type: "",
    file: null as File | null,
    document_name: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});


  // Fetch all departments (admission classes)
  const fetchDepartments = async () => {
    setIsLoading((prev) => ({ ...prev, departments: true }));
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/students/department/`
      );
      const data = await response.json();
      const fetchedDepartments = data.data || [];
      setDepartments(fetchedDepartments);
    } catch (error) {
      console.error("Error fetching departments:", error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to load admission classes',
        icon: 'error',
        timer: 5000,
        timerProgressBar: true,
        confirmButtonText: 'OK'
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, departments: false }));
    }
  };

  const handleDepartmentChange = (departmentId: string) => {
    setFormData({
      ...formData,
      admission_class: departmentId,
      section: "", // Reset section
    });
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({}); // Clear previous errors

    // Build documents list including any pending one
    let finalDocuments = [...formData.student_documents];
    if (currentDocument.type && currentDocument.file) {
      finalDocuments.push({
        document_type: currentDocument.type,
        file: currentDocument.file,
        description: currentDocument.type === "OTHER" ? currentDocument.document_name : currentDocument.file.name,
      });
    }

    const newErrors: Record<string, string> = {};

    // Validate Required Fields
    if (!formData.en_first_name) newErrors.en_first_name = "First name is required | الاسم الأول مطلوب";
    if (!formData.ar_first_name) newErrors.ar_first_name = "Arabic first name is required | الاسم الأول بالعربي مطلوب";
    if (!formData.date_of_birth) newErrors.date_of_birth = "Date of birth is required | تاريخ الميلاد مطلوب";
    if (!formData.student_phone) newErrors.student_phone = "Phone is required | الهاتف مطلوب";
    if (!formData.gender) newErrors.gender = "Gender is required | الجنس مطلوب";
    if (!formData.nationality) newErrors.nationality = "Nationality is required | الجنسية مطلوبة";
    if (!formData.student_address) newErrors.student_address = "Address is required | العنوان مطلوب";
    if (!formData.city) newErrors.city = "City is required | المدينة مطلوبة";
    if (!formData.state) newErrors.state = "State is required | المحافظة مطلوبة";
    if (!formData.postal_code) newErrors.postal_code = "Postal code is required | الرمز البريدي مطلوب";
    if (!formData.governance) newErrors.governance = "Governance is required | المحافظة مطلوبة";
    if (!formData.neighborhood) newErrors.neighborhood = "Neighborhood is required | الحي مطلوب";
    if (!formData.national_id) newErrors.national_id = "Guardian ID Number is required | الرقم المدني مطلوب";
    if (!formData.name_en) newErrors.name_en = "Guardian name (EN) is required | اسم الجارديان (EN) مطلوب";
    if (!formData.phone) newErrors.phone = "Guardian phone is required | هاتف الجارديان مطلوب";
    if (!formData.email) newErrors.email = "Guardian email is required | بريد الجارديان مطلوب";
    if (!formData.relationship) newErrors.relationship = "Relationship is required | العلاقة مطلوبة";
    if (!formData.passport_number) newErrors.passport_number = "Passport number is required | رقم الجواز مطلوب";
    if (!formData.guardian_id_document) newErrors.guardian_id_document = "ID Document is required | وثيقة الهوية مطلوبة";
    if (!formData.work_phone) newErrors.work_phone = "Work phone is required | هاتف العمل مطلوب";
    if (!formData.workplace) newErrors.workplace = "Workplace is required | جهة العمل مطلوبة";
    if (!formData.occupation) newErrors.occupation = "Occupation is required | الوظيفة مطلوبة";
    if (!formData.address) newErrors.address = "Guardian address is required | عنوان الجارديان مطلوب";
    if (!formData.country) newErrors.country = "Country is required | الدولة مطلوبة";
    if (!formData.admission_class) newErrors.admission_class = "Admission class is required | الصف الدراسي مطلوب";

    // File validations
    if (!formData.photo) newErrors.photo = "Student photo is required | صورة الطالب مطلوبة";
    if (!formData.passport_copy) newErrors.passport_copy = "Passport copy is required | نسخة الجواز مطلوبة";
    const hasIDProof = finalDocuments.some(doc => doc.document_type === "ID");
    if (!hasIDProof) newErrors.id_proof = "Student ID Proof is required in documents | بطاقة هوية الطالب مطلوبة في المرفقات";
    if (finalDocuments.length === 0) newErrors.student_documents = "At least one document is required | يجب تحميل وثيقة واحدة على الأقل";

    // Birthday validation: reject today or future dates
    if (formData.date_of_birth) {
      const dob = new Date(formData.date_of_birth);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dob >= today) {
        newErrors.date_of_birth = "Date of Birth must be in the past | تاريخ الميلاد يجب أن يكون في الماضي";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstErrorField = Object.keys(newErrors)[0];
      const fieldLabels: Record<string, string> = {
        en_first_name: "First Name",
        ar_first_name: "Arabic First Name",
        date_of_birth: "Date of Birth",
        student_phone: "Phone",
        gender: "Gender",
        nationality: "Nationality",
        student_address: "Address",
        city: "City",
        state: "State",
        postal_code: "Postal Code",
        governance: "Governance",
        neighborhood: "Neighborhood",
        national_id: "Guardian ID Number",
        name_en: "Guardian Name (EN)",
        phone: "Guardian Phone",
        email: "Guardian Email",
        relationship: "Relationship",
        passport_number: "Passport Number",
        guardian_id_document: "ID Document",
        work_phone: "Work Phone",
        workplace: "Workplace",
        occupation: "Occupation",
        address: "Guardian Address",
        country: "Country",
        admission_class: "Admission Class",
        photo: "Student Photo",
        passport_copy: "Passport Copy",
        id_proof: "Student ID Proof",
        student_documents: "Documents"
      };

      const missingFields = Object.keys(newErrors)
        .map(key => fieldLabels[key] || key)
        .join(", ");

      setIsSubmitting(false);

      // Scroll to the first error
      const firstErrorElement = document.getElementById(firstErrorField);
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstErrorElement.focus();
      }
      return;
    }

    try {
      // 1. Build JSON objects
      const guardian = {
        name_en: formData.name_en,
        name_ar: formData.name_ar,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        relationship: formData.relationship,
        national_id: formData.national_id,
        passport_number: formData.passport_number,
        work_phone: formData.work_phone,
        mobile: formData.mobile,
        occupation: formData.occupation,
        workplace: formData.workplace,
      };

      const student = {
        admission_number: formData.admission_number,
        en_first_name: formData.en_first_name,
        en_middle_name: formData.en_middle_name,
        en_last_name: formData.en_last_name,
        ar_first_name: formData.ar_first_name,
        ar_middle_name: formData.ar_middle_name,
        ar_last_name: formData.ar_last_name,

        en_father_name: formData.en_father_name,
        ar_father_name: formData.ar_father_name,
        en_grandfather_name: formData.en_grandfather_name,
        ar_grandfather_name: formData.ar_grandfather_name,
        en_tribe_name: formData.en_tribe_name,
        ar_tribe_name: formData.ar_tribe_name,

        photo: null, // sent separately
        email: formData.student_email,
        phone: formData.student_phone,
        date_of_birth: formData.date_of_birth,
        age_years: calculateAge(formData.date_of_birth),
        gender: formData.gender,
        religion: formData.religion,
        nationality: formData.nationality,

        address: formData.student_address,
        governance: formData.governance,
        city: formData.city,
        state: formData.state,
        neighborhood: formData.neighborhood,
        street_number: formData.street_number,
        house_number: formData.house_number,

        postal_code: formData.postal_code,
        country: formData.country,
        admission_class: formData.admission_class,
        section: formData.section,
        previous_school: formData.previous_school,

        previous_education_system: formData.previous_education_system,
        wanted_education_system: formData.wanted_education_system,

        has_special_needs: formData.has_special_needs,
        special_needs_details: formData.special_needs_details,
        chronic_disease: formData.chronic_disease,
        parents_divorced: formData.parents_divorced,
        staying_with: formData.staying_with,
        home_contact: formData.home_contact,
        emergency_contact: formData.emergency_contact,
        google_map_location_url: formData.google_map_location_url,

        is_promoted: true,
        is_active: true,
        is_verified_registration_officer: false,
        other_datas: {},
      };

      // finalDocuments is already built above

      // 2. Build student_documents metadata
      const documentMetadata = finalDocuments.map((doc, i) => ({
        document_type: doc.document_type,
        description:
          doc.description ||
          (doc.file instanceof File ? doc.file.name : `doc_${i}`),
        file_field: `document_file_${i}`,
      }));

      const form = new FormData();

      // 3. Attach JSON objects
      form.append("guardian", JSON.stringify(guardian));
      form.append("student", JSON.stringify(student));
      form.append("student_documents", JSON.stringify(documentMetadata));

      // 4. Attach photo file
      if (formData.photo) {
        form.append("student_photo", formData.photo);
      }

      if (formData.passport_copy) {
        form.append("student_passport", formData.passport_copy);
      }
      if (formData.house_photo) {
        form.append("student_house_photo", formData.house_photo);
      }
      if (formData.google_map_location_photo) {
        form.append("student_google_map_photo", formData.google_map_location_photo);
      }
      if (formData.guardian_id_document) {
        form.append("guardian_id_document", formData.guardian_id_document);
      }

      // 5. Attach document files
      finalDocuments.forEach((doc, i) => {
        if (doc.file instanceof File) {
          form.append(`document_file_${i}`, doc.file); // Must match file_field above
        }
      });

      // 6. Submit request
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/students/create-student-details/`,
        {
          method: "POST",
          body: form,
        }
      );

      const result = await response.json();

      console.log("Registration result:", result);

      if (!response.ok || (result.statuscode && result.statuscode !== 201 && result.statuscode !== 200)) {
        console.error("API Error:", result);
        Swal.fire({
          title: 'Error!',
          text: result.errors || result.message || "Failed to submit registration",
          icon: 'error',
          confirmButtonText: 'OK'
        });
        throw new Error(result.errors || result.message || "Failed to submit registration");
      }
      const token = localStorage.getItem("accessToken");

      // Show success message with student details
      await Swal.fire({
        title:
          '<span >Registration Successful!</span>',
        html: `
                      <div style="text-align: left">
                          <p style="margin-bottom: 1rem">Your registration has been submitted successfully.</p>
                                  <p style="margin-bottom: 0.5rem">Admission Number:<strong style="color: #662a14">${result.data?.student?.admission_number || 'N/A'}</strong></p>
                                  <p style="margin-bottom: 0.5rem">Student Name:<strong style="color: #662a14"> ${result.data?.student?.en_first_name || ''} ${result.data?.student?.en_last_name || ''} </strong></p>
                          <p style="font-size: 0.875rem; color: #6b7280">Please keep this number for future reference.</p>
                      </div>
                  `,
        icon: "success",
        confirmButtonText: "OK",
        width: "500px",
        customClass: {
          popup: "rounded-lg border-2 border-brown-200",
          title: "text-2xl font-bold",
          htmlContainer: "text-left",
        },
        background: "#fffaf7", // Light warm background
        showClass: {
          popup: "animate__animated animate__fadeInDown",
        },
        hideClass: {
          popup: "animate__animated animate__fadeOutUp",
        },
      });

      // Reset form if needed
      setFormData({
        admission_number: "",
        en_first_name: "",
        en_middle_name: "",
        en_last_name: "",
        ar_first_name: "",
        ar_middle_name: "",
        ar_last_name: "",
        en_father_name: "",
        ar_father_name: "",
        en_grandfather_name: "",
        ar_grandfather_name: "",
        en_tribe_name: "",
        ar_tribe_name: "",
        photo: null,
        passport_copy: null,
        house_photo: null,
        google_map_location_photo: null,
        google_map_location_url: "",
        student_email: "",
        student_phone: "",
        student_address: "",
        date_of_birth: "",
        gender: "",
        religion: "",
        nationality: "",
        governance: "",
        city: "",
        state: "",
        neighborhood: "",
        street_number: "",
        house_number: "",
        postal_code: "",
        country: "",
        admission_class: "",
        section: "",
        previous_school: "",
        previous_education_system: "",
        wanted_education_system: "",
        has_special_needs: false,
        special_needs_details: "",
        chronic_disease: "",
        parents_divorced: false,
        staying_with: "",
        home_contact: "",
        emergency_contact: "",
        name_en: "",
        name_ar: "",
        phone: "",
        email: "",
        address: "",
        relationship: "",
        national_id: "",
        passport_number: "",
        work_phone: "",
        mobile: "",
        occupation: "",
        workplace: "",
        guardian_id_document: null,

        student_documents: [],
      });
    } catch (error) {
      console.error("Registration error:", error);
      Swal.fire({
        title: 'Error!',
        text: error instanceof Error ? error.message : "Failed to submit registration",
        icon: 'error',
        timer: 5000,
        timerProgressBar: true,
        confirmButtonText: 'OK'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = () => {
    if (!currentDocument.type || !currentDocument.file) {
      Swal.fire({
        title: 'Error!',
        text: 'Please select document type and upload a file',
        icon: 'error',
        timer: 5000,
        timerProgressBar: true,
        confirmButtonText: 'OK'
      });
      return;
    }

    const newDocument = {
      document_type: currentDocument.type,
      file: currentDocument.file, // Raw File object
      description: currentDocument.type === "OTHER" ? currentDocument.document_name : (currentDocument.file.name || ""),
    };

    setFormData((prev) => ({
      ...prev,
      student_documents: [...prev.student_documents, newDocument],
    }));

    setCurrentDocument({
      type: "",
      file: null,
      document_name: "",
    });

    Swal.fire({
      title: 'Success!',
      text: 'Document uploaded successfully',
      icon: 'success',
      timer: 5000,
      timerProgressBar: true,
      confirmButtonText: 'OK'
    });
  };

  const handleFillDummyData = () => {
    const dummyData = {
      ...formData,
      en_first_name: "Naveen",
      en_middle_name: "p",
      en_last_name: "anil",
      ar_first_name: "جون",
      ar_middle_name: "آدم",
      ar_last_name: "دو",
      en_father_name: "Adam Doe",
      ar_father_name: "آدم دو",
      en_grandfather_name: "Robert Doe",
      ar_grandfather_name: "روبرت دو",
      en_tribe_name: "Tribe",
      ar_tribe_name: "قبيلة",
      student_email: "john.doe@example.com",
      student_phone: "+96812345678",
      student_address: "123 School Lane",
      date_of_birth: "2015-05-20",
      gender: "M",
      religion: "Islam",
      nationality: "Omani",
      city: "Muscat",
      state: "Muscat",
      postal_code: "123",
      country: "Oman",
      relationship: "father",
      national_id: "123456789",
      name_en: "Adam Doe",
      name_ar: "آدم دو",
      phone: "+96887654321",
      email: "adam.doe@example.com",
      address: "123 School Lane",
      passport_number: "P1234567",
      work_phone: "+96811223344",
      workplace: "Tech Corp",
      occupation: "Engineer",
      admission_class: departments.length > 0 ? departments[0].id : "",
    };
    setFormData(dummyData);

    Swal.fire({
      title: 'Success!',
      text: 'Form filled with dummy data (Father selected)',
      icon: 'success',
      timer: 2000,
      timerProgressBar: true,
      confirmButtonText: 'OK'
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        photo: e.target.files[0],
      });
      Swal.fire({
        title: 'Success!',
        text: 'Student photo uploaded',
        icon: 'success',
        timer: 5000,
        timerProgressBar: true,
        confirmButtonText: 'OK'
      });
    }
  };

  const calculateAge = (dateOfBirth: string): number => {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const countryList = Object.entries(countries).map(([code, country]) => ({
    code,
    name: country.name,
  }));

  // Sort countries alphabetically
  countryList.sort((a, b) => a.name.localeCompare(b.name));

  const removeDocument = (index: number) => {
    const updatedDocs = [...formData.student_documents];
    updatedDocs.splice(index, 1);
    setFormData({
      ...formData,
      student_documents: updatedDocs,
    });
  };

  // Birthday validation: reject today or future dates
  useEffect(() => {
    if (formData.date_of_birth) {
      const dob = new Date(formData.date_of_birth);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dob >= today) {
        setErrors(prev => ({ ...prev, date_of_birth: "Date of Birth must be in the past | تاريخ الميلاد يجب أن يكون في الماضي" }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.date_of_birth;
          return newErrors;
        });
      }
    }
  }, [formData.date_of_birth]);


  return (
    <>
      {(isLoading.departments || isLoading.sections || isSubmitting) && (
        <FullPageLoader />
      )}

      <Card className="max-w-6xl mx-auto mt-20 p-10 bg-white shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            New Student Registration | تسجيل طالب جديد
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-14">
            {/* Responsible Person Selection Block */}
            <div className="space-y-8 bg-primary/5 p-6 rounded-2xl border border-primary/20 shadow-sm">
              <div className="text-center space-y-6">
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 flex flex-col gap-2">
                  <span dir="rtl">من المسؤول المباشر عن الطالب ؟</span>
                  <span className="text-primary">Who is directly responsible for the student?</span>
                </h3>

                <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-3xl mx-auto py-4">
                  {RELATIONSHIP_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      id="relationship"
                      onClick={() => setFormData({ ...formData, relationship: option.value })}
                      className={`flex flex-col items-center gap-3 group transition-all duration-300 ${formData.relationship === option.value ? 'scale-110' : 'opacity-70 hover:opacity-100'
                        }`}
                    >
                      <div className={`w-20 h-20 md:w-28 md:h-28 rounded-full border-4 flex items-center justify-center transition-all duration-300 shadow-md ${formData.relationship === option.value
                          ? 'border-primary bg-primary text-white elevation-lg'
                          : 'border-white bg-white text-gray-400 group-hover:border-blue-200'
                        }`}>
                        <User className={`h-10 w-10 md:h-14 md:w-14 ${formData.relationship === option.value ? 'animate-pulse' : ''}`} />
                      </div>
                      <span className={`font-bold text-base md:text-lg transition-colors ${formData.relationship === option.value ? 'text-primary/80' : 'text-gray-500'
                        }`}>
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
                {errors.relationship && <p className="text-red-500 text-sm mt-2 text-center animate-bounce font-bold bg-white p-2 rounded shadow-sm border border-red-100 inline-block mx-auto">{errors.relationship}</p>}
              </div>

              {/* Bilingual Disclaimer Note */}
              <div className="max-w-4xl mx-auto space-y-3 bg-white p-5 rounded-xl border-l-4 border-r-4 border-primary shadow-sm">
                <p dir="rtl" className="text-right font-bold text-gray-700 leading-relaxed">
                  ملاحظة الشخص المسؤول المباشر عن الطالب هو من يتحمل كافة مسؤولية الطالب ماليا وسلوكيا واداريا ودقة البيانات المذكورة؟
                </p>
                <p className="text-gray-600 leading-relaxed">
                  <span className="text-red-600 font-extrabold tracking-tight uppercase mr-1">Note:</span>
                  The person directly responsible for the student bears full responsibility for the student financially, behaviorally, administratively, and for the accuracy of the data mentioned.
                </p>
              </div>

              {/* Relative Note */}
              {formData.relationship === "relative" && (
                <div className="max-w-4xl mx-auto py-2">
                  <h4 className="text-center font-bold italic text-gray-600 flex flex-col gap-1">
                    <span dir="rtl">في حال كان المسؤول المباشر عن الطالب هو أحد الأقارب يرجى تعبئة استمارة المسؤول المباشر</span>
                    <span>[If the student's direct responsible is a relative, please fill out below form.]</span>
                  </h4>
                </div>
              )}
            </div>

            {/* Dynamic Parent/Guardian Details Section based on Selection */}
            {formData.relationship && (() => {
              const config = {
                father: {
                  title: "Father Details | بيانات الأب",
                  label: "Father",
                  arLabel: "الأب",
                  theme: "brown",
                  border: "border-primary/20",
                  bg: "bg-primary/5",
                  textColor: "text-primary",
                  inputBorder: "border-primary/20",
                  focusBorder: "focus:border-primary/40",
                  phoneBorder: "#662a14",
                  icon: <User className="h-6 w-6" />,
                  iconBg: "bg-primary"
                },
                mother: {
                  title: "Mother Details | بيانات الأم",
                  label: "Mother",
                  arLabel: "الأم",
                  theme: "pink",
                  border: "border-pink-100",
                  bg: "bg-pink-50/20",
                  textColor: "text-pink-900",
                  inputBorder: "border-pink-100",
                  focusBorder: "focus:border-pink-400",
                  phoneBorder: "#fbcfe8",
                  icon: <User className="h-6 w-6" />,
                  iconBg: "bg-pink-600"
                },
                relative: {
                  title: "Relative Details | بيانات القريب",
                  label: "Relative",
                  arLabel: "القريب",
                  theme: "orange",
                  border: "border-orange-100",
                  bg: "bg-orange-50/20",
                  textColor: "text-orange-900",
                  inputBorder: "border-orange-100",
                  focusBorder: "focus:border-orange-400",
                  phoneBorder: "#fed7aa",
                  icon: <User className="h-6 w-6" />,
                  iconBg: "bg-orange-600"
                }
              }[formData.relationship as "father" | "mother" | "relative"];

              if (!config) return null;

              return (
                <div className={`border-2 ${config.border} p-8 rounded-2xl ${config.bg} shadow-md`}>
                  <h4 className={`text-xl font-bold mb-8 flex items-center gap-3 ${config.textColor} border-b-2 ${config.border} pb-4 uppercase tracking-wider`}>
                    <span className={`${config.iconBg} text-white p-2 rounded-lg`}>
                      {config.icon}
                    </span>
                    {config.title}
                  </h4>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* National ID / ID Number */}
                    <div className="space-y-2">
                      <Label htmlFor="national_id">{config.label} ID Number * | الرقم المدني *</Label>
                      <Input
                        id="national_id"
                        value={formData.national_id}
                        onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
                        placeholder={`${config.label} ID Number`}
                        className={`bg-white ${config.inputBorder} ${config.focusBorder} ${errors.national_id ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                      />
                      {errors.national_id && <p className="text-red-500 text-xs font-semibold">{errors.national_id}</p>}
                    </div>

                    {/* English Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name_en">{config.label} Name (English) * | اسم {config.arLabel} (إنجليزي) *</Label>
                      <Input
                        id="name_en"
                        value={formData.name_en}
                        onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                        placeholder={`${config.label} Name in English`}
                        className={`bg-white ${config.inputBorder} ${config.focusBorder} ${errors.name_en ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                        required
                      />
                      {errors.name_en && <p className="text-red-500 text-xs font-semibold">{errors.name_en}</p>}
                    </div>

                    {/* Arabic Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name_ar">{config.label} Name (Arabic) | اسم {config.arLabel} (عربي)</Label>
                      <Input
                        id="name_ar"
                        value={formData.name_ar}
                        onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                        placeholder={`اسم ${config.arLabel}`}
                        dir="rtl"
                        className={`bg-white ${config.inputBorder} ${config.focusBorder} ${errors.name_ar ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                      />
                      {errors.name_ar && <p className="text-red-500 text-xs font-semibold text-right">{errors.name_ar}</p>}
                    </div>

                    {/* Phone (Primary) */}
                    <div className="space-y-2">
                      <Label>{config.label} Phone * | الهاتف *</Label>
                      <PhoneInput
                        defaultCountry="om"
                        value={formData.phone}
                        onChange={(val) => setFormData({ ...formData, phone: val })}
                        inputStyle={{ width: "100%", padding: "0.5rem", borderRadius: "0.375rem", border: `1px solid ${errors.phone ? 'red' : config.phoneBorder}` }}
                      />
                      {errors.phone && <p className="text-red-500 text-xs font-semibold">{errors.phone}</p>}
                    </div>

                    {/* Mobile */}
                    <div className="space-y-2">
                      <Label>{config.label} Mobile | الجوال</Label>
                      <PhoneInput
                        defaultCountry="om"
                        value={formData.mobile}
                        onChange={(val) => setFormData({ ...formData, mobile: val })}
                        inputStyle={{ width: "100%", padding: "0.5rem", borderRadius: "0.375rem", border: `1px solid ${errors.mobile ? 'red' : config.phoneBorder}` }}
                      />
                      {errors.mobile && <p className="text-red-500 text-xs font-semibold">{errors.mobile}</p>}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email">{config.label} Email * | البريد الإلكتروني *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@example.com"
                        className={`bg-white ${config.inputBorder} ${config.focusBorder} ${errors.email ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                      />
                      {errors.email && <p className="text-red-500 text-xs font-semibold">{errors.email}</p>}
                    </div>

                    {/* Work Phone */}
                    <div className="space-y-2">
                      <Label>{config.label} Work Phone * | هاتف العمل *</Label>
                      <PhoneInput
                        defaultCountry="om"
                        value={formData.work_phone}
                        onChange={(val) => setFormData({ ...formData, work_phone: val })}
                        inputStyle={{ width: "100%", padding: "0.5rem", borderRadius: "0.375rem", border: `1px solid ${errors.work_phone ? 'red' : config.phoneBorder}` }}
                      />
                      {errors.work_phone && <p className="text-red-500 text-xs font-semibold">{errors.work_phone}</p>}
                    </div>

                    {/* Workplace */}
                    <div className="space-y-2">
                      <Label htmlFor="workplace">{config.label} Workplace * | جهة العمل *</Label>
                      <Input
                        id="workplace"
                        value={formData.workplace}
                        onChange={(e) => setFormData({ ...formData, workplace: e.target.value })}
                        placeholder="Workplace"
                        className={`bg-white ${config.inputBorder} ${config.focusBorder} ${errors.workplace ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                      />
                      {errors.workplace && <p className="text-red-500 text-xs font-semibold">{errors.workplace}</p>}
                    </div>

                    {/* Occupation */}
                    <div className="space-y-2">
                      <Label htmlFor="occupation">{config.label} Occupation * | الوظيفة *</Label>
                      <Input
                        id="occupation"
                        value={formData.occupation}
                        onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                        placeholder="Occupation"
                        className={`bg-white ${config.inputBorder} ${config.focusBorder} ${errors.occupation ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                      />
                      {errors.occupation && <p className="text-red-500 text-xs font-semibold">{errors.occupation}</p>}
                    </div>

                    {/* Passport Number */}
                    <div className="space-y-2">
                      <Label htmlFor="passport_number">{config.label} Passport Number * | رقم الجواز *</Label>
                      <Input
                        id="passport_number"
                        value={formData.passport_number}
                        onChange={(e) => setFormData({ ...formData, passport_number: e.target.value })}
                        placeholder="Passport Number"
                        className={`bg-white ${config.inputBorder} ${config.focusBorder} ${errors.passport_number ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                      />
                      {errors.passport_number && <p className="text-red-500 text-xs font-semibold">{errors.passport_number}</p>}
                    </div>

                    {/* ID Document */}
                    <div className="space-y-2">
                      <Label htmlFor="guardian_id_document">{config.label} ID Document * | وثيقة الهوية *</Label>
                      <Input
                        id="guardian_id_document"
                        type="file"
                        onChange={(e) => setFormData({ ...formData, guardian_id_document: e.target.files ? e.target.files[0] : null })}
                        accept=".pdf,.jpg,.jpeg,.png"
                        className={`bg-white ${config.inputBorder} ${errors.guardian_id_document ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                      />
                      {errors.guardian_id_document && <p className="text-red-500 text-xs font-semibold">{errors.guardian_id_document}</p>}
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2 lg:col-span-3 space-y-2">
                      <Label htmlFor="address">{config.label} Address * | العنوان *</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Full Address"
                        className={`bg-white ${config.inputBorder} ${config.focusBorder} ${errors.address ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                      />
                      {errors.address && <p className="text-red-500 text-xs font-semibold">{errors.address}</p>}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Student Information Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 border-b pb-2">
                Student Information | معلومات الطالب
              </h3>


              <div className="grid md:grid-cols-2 gap-6">
                {/* Admission Number */}
                <div>
                  <Label
                    htmlFor="admission_number"
                    className="font-bold text-brown-700"
                  >
                    Admission Number | رقم القبول
                  </Label>
                  <Input
                    id="admission_number"
                    value={formData.admission_number}
                    readOnly
                    className="font-bold text-brown-700 bg-brown-50 cursor-not-allowed"
                    placeholder="AMPS-YYYY-XXXX"
                  />
                  <p className="text-xs text-brown-500 mt-1">
                    It will auto-generate with the pattern: AMPS-YYYY-XXXX
                  </p>
                </div>

                {/* Student Photo */}
                <div>
                  <Label htmlFor="photo">Student Photo * | صورة الطالب</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className={errors.photo ? 'border-red-500 ring-1 ring-red-500' : ''}
                    />
                    {errors.photo && <p className="text-red-500 text-xs font-semibold">{errors.photo}</p>}
                    {formData.photo && (
                      <span className="text-sm">{formData.photo.name}</span>
                    )}
                  </div>
                </div>

                {/* English Name */}
                <div>
                  <Label htmlFor="en_first_name">
                    First Name (English) * | الاسم الأول (إنجليزي)
                  </Label>
                  <Input
                    id="en_first_name"
                    value={formData.en_first_name}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        en_first_name: e.target.value,
                      });
                    }}
                    placeholder="e.g. Ahmed"
                    className={errors.en_first_name ? 'border-red-500 ring-1 ring-red-500' : ''}
                    required
                  />
                  {errors.en_first_name && <p className="text-red-500 text-xs font-semibold">{errors.en_first_name}</p>}
                </div>

                <div>
                  <Label htmlFor="ar_first_name">
                    First Name (Arabic) * | الاسم الأول (عربي)
                  </Label>
                  <Input
                    id="ar_first_name"
                    value={formData.ar_first_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ar_first_name: e.target.value,
                      })
                    }
                    placeholder="أحمد"
                    dir="rtl"
                    className={errors.ar_first_name ? 'border-red-500 ring-1 ring-red-500' : ''}
                    required
                  />
                  {errors.ar_first_name && <p className="text-red-500 text-xs font-semibold text-right">{errors.ar_first_name}</p>}
                </div>

                <div>
                  <Label htmlFor="en_middle_name">
                    Middle Name (English) | الاسم الأوسط (إنجليزي)
                  </Label>
                  <Input
                    id="en_middle_name"
                    value={formData.en_middle_name}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        en_middle_name: e.target.value,
                      });
                    }}
                    placeholder="Middle name in English"
                  />
                </div>

                <div>
                  <Label htmlFor="ar_middle_name">
                    Middle Name (Arabic) | الاسم الأوسط (عربي)
                  </Label>
                  <Input
                    id="ar_middle_name"
                    value={formData.ar_middle_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ar_middle_name: e.target.value,
                      })
                    }
                    placeholder="الاسم الأوسط"
                    dir="rtl"
                  />
                </div>

                <div>
                  <Label htmlFor="en_last_name">
                    Last Name (English) | اسم العائلة (إنجليزي)
                  </Label>
                  <Input
                    id="en_last_name"
                    value={formData.en_last_name}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        en_last_name: e.target.value,
                      });
                    }}
                    placeholder="e.g. Khan"
                  />
                </div>

                {/* Arabic Name */}

                <div>
                  <Label htmlFor="ar_last_name">
                    Last Name (Arabic) | اسم العائلة (عربي)
                  </Label>
                  <Input
                    id="ar_last_name"
                    value={formData.ar_last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, ar_last_name: e.target.value })
                    }
                    placeholder="خان"
                    dir="rtl"
                  />
                </div>

                {/* New Family Names */}
                <div>
                  <Label htmlFor="en_father_name">
                    Father Name (English) | اسم الأب (إنجليزي)
                  </Label>
                  <Input
                    id="en_father_name"
                    value={formData.en_father_name}
                    onChange={(e) => setFormData({ ...formData, en_father_name: e.target.value })}
                    placeholder="Father name in English"
                  />
                </div>

                <div>
                  <Label htmlFor="ar_father_name">
                    Father Name (Arabic) | اسم الأب (عربي)
                  </Label>
                  <Input
                    id="ar_father_name"
                    value={formData.ar_father_name}
                    onChange={(e) => setFormData({ ...formData, ar_father_name: e.target.value })}
                    placeholder="اسم الأب"
                    dir="rtl"
                  />
                </div>

                <div>
                  <Label htmlFor="en_grandfather_name">
                    Grandfather Name (English) | اسم الجد (إنجليزي)
                  </Label>
                  <Input
                    id="en_grandfather_name"
                    value={formData.en_grandfather_name}
                    onChange={(e) => setFormData({ ...formData, en_grandfather_name: e.target.value })}
                    placeholder="Grandfather name in English"
                  />
                </div>

                <div>
                  <Label htmlFor="ar_grandfather_name">
                    Grandfather Name (Arabic) | اسم الجد (عربي)
                  </Label>
                  <Input
                    id="ar_grandfather_name"
                    value={formData.ar_grandfather_name}
                    onChange={(e) => setFormData({ ...formData, ar_grandfather_name: e.target.value })}
                    placeholder="اسم الجد"
                    dir="rtl"
                  />
                </div>

                <div>
                  <Label htmlFor="en_tribe_name">
                    Tribe Name (English) | اسم القبيلة (إنجليزي)
                  </Label>
                  <Input
                    id="en_tribe_name"
                    value={formData.en_tribe_name}
                    onChange={(e) => setFormData({ ...formData, en_tribe_name: e.target.value })}
                    placeholder="Tribe name in English"
                  />
                </div>

                <div>
                  <Label htmlFor="ar_tribe_name">
                    Tribe Name (Arabic) | اسم القبيلة (عربي)
                  </Label>
                  <Input
                    id="ar_tribe_name"
                    value={formData.ar_tribe_name}
                    onChange={(e) => setFormData({ ...formData, ar_tribe_name: e.target.value })}
                    placeholder="اسم القبيلة"
                    dir="rtl"
                  />
                </div>

                {/* Contact Information */}
                <div>
                  <Label htmlFor="student_email">Email | البريد الإلكتروني</Label>
                  <Input
                    id="student_email"
                    type="email"
                    value={formData.student_email}
                    onChange={(e) =>
                      setFormData({ ...formData, student_email: e.target.value })
                    }
                    placeholder="student@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="student_phone">Phone | الهاتف</Label>
                  <PhoneInput
                    defaultCountry="om" // Oman as default
                    value={formData.student_phone}
                    onChange={(student_phone) => setFormData({ ...formData, student_phone })}
                    inputStyle={{
                      width: "100%",
                      padding: "0.5rem",
                      borderRadius: "0.375rem",
                      border: `1px solid ${errors.student_phone ? 'red' : '#d1d5db'}`,
                    }}
                  />
                  {errors.student_phone && <p className="text-red-500 text-xs font-semibold">{errors.student_phone}</p>}
                </div>

                {/* Personal Information */}
                <div>
                  <Label htmlFor="date_of_birth">
                    Date of Birth * | تاريخ الميلاد
                  </Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        date_of_birth: e.target.value,
                      })
                    }
                    className={errors.date_of_birth ? 'border-red-500 ring-1 ring-red-500' : ''}
                    required
                  />
                  {errors.date_of_birth && <p className="text-red-500 text-xs font-semibold">{errors.date_of_birth}</p>}
                </div>

                <div>
                  <Label htmlFor="gender">Gender * | الجنس</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) =>
                      setFormData({ ...formData, gender: value })
                    }
                  >
                    <SelectTrigger className={errors.gender ? 'border-red-500 ring-1 ring-red-500' : ''}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    {errors.gender && <p className="text-red-500 text-xs font-semibold">{errors.gender}</p>}
                    <SelectContent>
                      {GENDER_OPTIONS.map((gender) => (
                        <SelectItem key={gender.value} value={gender.value}>
                          {gender.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="religion">Religion | الديانة</Label>
                  <Select
                    value={RELIGION_OPTIONS.some(opt => opt.value === formData.religion) ? formData.religion : (formData.religion ? "other" : "")}
                    onValueChange={(value) => {
                      if (value === "other") {
                        setFormData({ ...formData, religion: "Other" });
                      } else {
                        setFormData({ ...formData, religion: value });
                      }
                    }}
                  >
                    <SelectTrigger className={`bg-white ${errors.religion ? 'border-red-500 ring-1 ring-red-500' : ''}`}>
                      <SelectValue placeholder="Select religion" />
                    </SelectTrigger>
                    {errors.religion && <p className="text-red-500 text-xs font-semibold mt-1">{errors.religion}</p>}
                    <SelectContent>
                      {RELIGION_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {(!RELIGION_OPTIONS.some(opt => opt.value === formData.religion) || formData.religion === "Other" || formData.religion === "other") && formData.religion !== "" && (
                    <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                      <Input
                        placeholder="Enter custom religion"
                        value={formData.religion === "other" || formData.religion === "Other" ? "" : formData.religion}
                        onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                        className="rounded-xl shadow-sm border-gray-200 focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="nationality">Nationality | الجنسية</Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) =>
                      setFormData({ ...formData, nationality: e.target.value })
                    }
                    placeholder="Nationality"
                    className={errors.nationality ? 'border-red-500 ring-1 ring-red-500' : ''}
                  />
                  {errors.nationality && <p className="text-red-500 text-xs font-semibold">{errors.nationality}</p>}
                </div>

                {/* Address Information */}
                <div>
                  <Label htmlFor="student_address">Address | العنوان</Label>
                  <Input
                    id="student_address"
                    value={formData.student_address}
                    onChange={(e) =>
                      setFormData({ ...formData, student_address: e.target.value })
                    }
                    placeholder="123 Main St, City, Country"
                    className={errors.student_address ? 'border-red-500 ring-1 ring-red-500' : ''}
                  />
                  {errors.student_address && <p className="text-red-500 text-xs font-semibold">{errors.student_address}</p>}
                </div>

                <div>
                  <Label htmlFor="city">City * | المدينة</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    placeholder="City"
                    className={errors.city ? 'border-red-500 ring-1 ring-red-500' : ''}
                  />
                  {errors.city && <p className="text-red-500 text-xs font-semibold">{errors.city}</p>}
                </div>

                <div>
                  <Label htmlFor="state">State * | المحافظة</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    placeholder="State"
                    className={errors.state ? 'border-red-500 ring-1 ring-red-500' : ''}
                  />
                  {errors.state && <p className="text-red-500 text-xs font-semibold">{errors.state}</p>}
                </div>

                <div>
                  <Label htmlFor="postal_code">
                    Postal Code * | الرمز البريدي
                  </Label>
                  <Input
                    id="postal_code"
                    value={formData.postal_code}
                    onChange={(e) =>
                      setFormData({ ...formData, postal_code: e.target.value })
                    }
                    placeholder="Postal code"
                    className={errors.postal_code ? 'border-red-500 ring-1 ring-red-500' : ''}
                  />
                  {errors.postal_code && <p className="text-red-500 text-xs font-semibold">{errors.postal_code}</p>}
                </div>

                <div>
                  <Label htmlFor="governance">Governance * | المحافظة</Label>
                  <Input
                    id="governance"
                    value={formData.governance}
                    onChange={(e) =>
                      setFormData({ ...formData, governance: e.target.value })
                    }
                    placeholder="Governance"
                    className={errors.governance ? 'border-red-500 ring-1 ring-red-500' : ''}
                  />
                  {errors.governance && <p className="text-red-500 text-xs font-semibold">{errors.governance}</p>}
                </div>

                <div>
                  <Label htmlFor="neighborhood">Neighborhood * | الحي</Label>
                  <Input
                    id="neighborhood"
                    value={formData.neighborhood}
                    onChange={(e) =>
                      setFormData({ ...formData, neighborhood: e.target.value })
                    }
                    placeholder="Neighborhood"
                    className={errors.neighborhood ? 'border-red-500 ring-1 ring-red-500' : ''}
                  />
                  {errors.neighborhood && <p className="text-red-500 text-xs font-semibold">{errors.neighborhood}</p>}
                </div>

                <div>
                  <Label htmlFor="street_number">Street Number | رقم الشارع</Label>
                  <Input
                    id="street_number"
                    value={formData.street_number}
                    onChange={(e) =>
                      setFormData({ ...formData, street_number: e.target.value })
                    }
                    placeholder="Street Number"
                  />
                </div>

                <div>
                  <Label htmlFor="house_number">House Number | رقم المنزل</Label>
                  <Input
                    id="house_number"
                    value={formData.house_number}
                    onChange={(e) =>
                      setFormData({ ...formData, house_number: e.target.value })
                    }
                    placeholder="House Number"
                  />
                </div>

                <div>
                  <Label htmlFor="country">Country | الدولة</Label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) =>
                      setFormData({ ...formData, country: value })
                    }
                  >
                    <SelectTrigger id="country" className={`form-control ${errors.country ? 'border-red-500 ring-1 ring-red-500' : ''}`}>
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                    {errors.country && <p className="text-red-500 text-xs font-semibold">{errors.country}</p>}
                    <SelectContent>
                      {countryList.map((country) => (
                        <SelectItem key={country.code} value={country.name}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Educational Information Section */}
                <div className="md:col-span-2">
                  <h4 className="text-md font-semibold mt-4 mb-2 border-b">
                    Educational History | السجل التعليمي
                  </h4>
                </div>

                <div>
                  <Label htmlFor="previous_education_system">
                    Previous Education System | نظام التعليم السابق
                  </Label>
                  <Input
                    id="previous_education_system"
                    value={formData.previous_education_system}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        previous_education_system: e.target.value,
                      })
                    }
                    placeholder="e.g. Bilingual, Monolingual"
                  />
                </div>

                <div>
                  <Label htmlFor="wanted_education_system">
                    Wanted Education System | نظام التعليم المطلوب
                  </Label>
                  <Input
                    id="wanted_education_system"
                    value={formData.wanted_education_system}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        wanted_education_system: e.target.value,
                      })
                    }
                    placeholder="e.g. Bilingual, Monolingual"
                  />
                </div>

                {/* Health and Family Section */}
                <div className="md:col-span-2">
                  <h4 className="text-md font-semibold mt-4 mb-2 border-b">
                    Health and Family | الصحة والأسرة
                  </h4>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="chronic_disease">
                    Chronic Disease | الأمراض المزمنة
                  </Label>
                  <Input
                    id="chronic_disease"
                    value={formData.chronic_disease}
                    onChange={(e) =>
                      setFormData({ ...formData, chronic_disease: e.target.value })
                    }
                    placeholder="Describe any chronic diseases if any"
                  />
                </div>

                <div className="flex items-center space-x-2 mt-4">
                  <input
                    type="checkbox"
                    id="parents_divorced"
                    checked={formData.parents_divorced}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        parents_divorced: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <Label htmlFor="parents_divorced">
                    Parents Divorced | الوالدان مطلقان
                  </Label>
                </div>

                <div>
                  <Label htmlFor="staying_with">Staying With | يقيم مع</Label>
                  <Input
                    id="staying_with"
                    value={formData.staying_with}
                    onChange={(e) =>
                      setFormData({ ...formData, staying_with: e.target.value })
                    }
                    placeholder="e.g. Father, Mother, Relative"
                  />
                </div>

                <div>
                  <Label htmlFor="home_contact">Home Contact | هاتف المنزل</Label>
                  <Input
                    id="home_contact"
                    value={formData.home_contact}
                    onChange={(e) =>
                      setFormData({ ...formData, home_contact: e.target.value })
                    }
                    placeholder="Home phone number"
                  />
                </div>

                <div>
                  <Label htmlFor="emergency_contact">
                    Emergency Contact | هاتف الطوارئ
                  </Label>
                  <Input
                    id="emergency_contact"
                    value={formData.emergency_contact}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emergency_contact: e.target.value,
                      })
                    }
                    placeholder="Emergency contact number"
                  />
                </div>

                {/* Media and Location Section */}
                <div className="md:col-span-2">
                  <h4 className="text-md font-semibold mt-4 mb-2 border-b">
                    Media and Location | الوسائط والموقع
                  </h4>
                </div>

                <div>
                  <Label htmlFor="passport_copy">
                    Passport Copy * | نسخة من جواز السفر
                  </Label>
                  <Input
                    id="passport_copy"
                    type="file"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        passport_copy: e.target.files ? e.target.files[0] : null,
                      })
                    }
                    accept=".pdf,.jpg,.jpeg,.png"
                    className={errors.passport_copy ? 'border-red-500 ring-1 ring-red-500' : ''}
                  />
                  {errors.passport_copy && <p className="text-red-500 text-xs font-semibold">{errors.passport_copy}</p>}
                </div>

                <div>
                  <Label htmlFor="house_photo">
                    House Photo | صورة المنزل
                  </Label>
                  <Input
                    id="house_photo"
                    type="file"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        house_photo: e.target.files ? e.target.files[0] : null,
                      })
                    }
                    accept="image/*"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="google_map_location_url">
                    Google Map Location URL | رابط موقع خرائط جوجل
                  </Label>
                  <Input
                    id="google_map_location_url"
                    value={formData.google_map_location_url}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        google_map_location_url: e.target.value,
                      })
                    }
                    placeholder="https://maps.google.com/..."
                  />
                </div>

                <div>
                  <Label htmlFor="google_map_location_photo">
                    Google Map Location Photo | صورة موقع خرائط جوجل
                  </Label>
                  <Input
                    id="google_map_location_photo"
                    type="file"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        google_map_location_photo: e.target.files ? e.target.files[0] : null,
                      })
                    }
                    accept="image/*"
                  />
                </div>

                {/* Admission Class Selection */}
                <div className="grid grid-cols-1 gap-6 p-6 bg-gray-50/50 rounded-xl border border-gray-100">
                  <div>
                    <Label htmlFor="admission_class" className="text-gray-700 font-semibold mb-2 block">
                      Admission Class | الصف الدراسي <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.admission_class}
                      onValueChange={handleDepartmentChange}
                    >
                      <SelectTrigger id="admission_class" className={`bg-white border-gray-200 ${errors.admission_class ? 'border-red-500 ring-1 ring-red-500' : ''}`}>
                        <SelectValue
                          placeholder="Select class"
                        />
                      </SelectTrigger>
                      {errors.admission_class && <p className="text-red-500 text-xs font-semibold mt-1">{errors.admission_class}</p>}
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.department_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="previous_school">
                    Previous School | المدرسة السابقة
                  </Label>
                  <Input
                    id="previous_school"
                    value={formData.previous_school}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        previous_school: e.target.value,
                      })
                    }
                    placeholder="Previous school name"
                  />
                </div>

                {/* Special Needs */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="has_special_needs"
                    checked={formData.has_special_needs}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        has_special_needs: e.target.checked,
                      })
                    }
                  />
                  <Label htmlFor="has_special_needs">
                    Has Special Needs | لديه احتياجات خاصة
                  </Label>
                </div>

                {formData.has_special_needs && (
                  <div>
                    <Label htmlFor="special_needs_details">
                      Special Needs Details | تفاصيل الاحتياجات الخاصة
                    </Label>
                    <Input
                      id="special_needs_details"
                      value={formData.special_needs_details}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          special_needs_details: e.target.value,
                        })
                      }
                      placeholder="Details about special needs"
                    />
                  </div>
                )}
              </div>
            </div>



            {/* Documents Upload Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 border-b pb-2">
                Required Documents | الوثائق المطلوبة
              </h3>

              {/* Uploaded Documents List */}
              {formData.student_documents.length > 0 && (
                <div className="mb-4 space-y-2">
                  <h4 className="font-medium">
                    Uploaded Documents | الوثائق المرفوعة
                  </h4>
                  {formData.student_documents.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div className="flex flex-col">
                        <span>
                          {DOCUMENT_TYPES.find(
                            (t) => t.value === doc.document_type
                          )
                            ?.label.split("|")[0]
                            .trim()}
                        </span>
                        {doc.description && (
                          <span className="text-xs text-gray-500">
                            {doc.description}
                          </span>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDocument(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Document Upload Form */}
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Document Type */}
                  <div>
                    <Label htmlFor="document_type">
                      Document Type | نوع الوثيقة
                    </Label>
                    <Select
                      value={currentDocument.type}
                      onValueChange={(value) =>
                        setCurrentDocument({ ...currentDocument, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent>
                        {DOCUMENT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {currentDocument.type === "OTHER" && (
                    <div className="md:col-span-2">
                      <Label htmlFor="document_name">
                        Document Name | اسم الوثيقة
                      </Label>
                      <Input
                        id="document_name"
                        value={currentDocument.document_name}
                        onChange={(e) =>
                          setCurrentDocument({
                            ...currentDocument,
                            document_name: e.target.value,
                          })
                        }
                        placeholder="Enter document name | ادخل اسم الوثيقة"
                        className="rounded-xl shadow-sm border-gray-200"
                      />
                    </div>
                  )}

                  {/* File Upload */}
                  <div>
                    <Label htmlFor="document_file">File | الملف</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="document_file"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) =>
                          setCurrentDocument({
                            ...currentDocument,
                            file: e.target.files?.[0] || null,
                          })
                        }
                      />
                      <Upload className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleFileUpload}
                  variant="outline"
                  className="w-full"
                  disabled={!currentDocument.type || !currentDocument.file}
                >
                  Add Document | إضافة وثيقة
                </Button>
              </div>
            </div>

            {/* Submit Button */}
            <div id="student_documents" className="mt-4">
              {errors.student_documents && <p className="text-red-500 text-sm font-bold bg-red-50 p-2 rounded border border-red-200 mb-2 animate-pulse">{errors.student_documents}</p>}
              {errors.id_proof && <p className="text-red-500 text-sm font-bold bg-red-50 p-2 rounded border border-red-200 mb-2 animate-pulse">{errors.id_proof}</p>}
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full bg-green-600 hover:bg-green-700 mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  Register Student | تسجيل الطالب
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};
export default NewRegistrationForPublic