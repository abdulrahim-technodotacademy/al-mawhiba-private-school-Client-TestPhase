import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { UserPlus, User, Upload, Save, Trash2, FileText } from "lucide-react";

import FullPageLoader from "./FullPageLoader";

const DOCUMENT_TYPES = [
  { value: "ID", label: "ID Proof | بطاقة الهوية" },
  { value: "BIRTH", label: "Birth Certificate | شهادة الميلاد" },
  { value: "TRANSFER", label: "Transfer Certificate | شهادة النقل" },
  { value: "PHOTO", label: "Photograph | صورة شخصية" },
  { value: "GUARDIAN_ID", label: "Guardian ID Document | وثيقة هوية الوصي" },
  { value: "OTHER", label: "Other | أخرى" },
];

type StudentDocument = {
  document_type: string;
  file: File;
  description: string;
  file_field?: string;
  file_url?: string;
};

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

const NewStudentRegistrationForm = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<
    Array<{
      id: string;
      department_name: string;
    }>
  >([]);

  const [isLoading, setIsLoading] = useState({
    departments: false,
  });

  const emptyGuardian = {
    national_id: "",
    name_en: "",
    name_ar: "",
    phone: "",
    mobile: "",
    email: "",
    work_phone: "",
    workplace: "",
    occupation: "",
    passport_number: "",
    id_document: null as File | null,
    address: "",
    is_directly_responsible: false,
  };

  const [formData, setFormData] = useState({
    // Student Information
    admission_number: "",
    en_first_name: "",
    en_middle_name: "",
    en_last_name: "",
    ar_first_name: "",
    ar_middle_name: "",
    ar_last_name: "",
    en_grandfather_name: "",
    ar_grandfather_name: "",
    photo: null as File | null,
    passport_copy: null as File | null,
    student_email: "",
    date_of_birth: "",
    gender: "",
    religion: "",
    nationality: "",
    student_address: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    governance: "",
    neighborhood: "",
    street_number: "",
    house_number: "",
    previous_education_system: "",
    wanted_education_system: "",
    chronic_disease: "",
    parents_divorced: false,
    staying_with: "",
    home_contact: "",
    emergency_contact: "",
    google_map_location_url: "",
    section: "",
    relationship: "",
    previous_school: "",
    has_special_needs: false,
    special_needs_details: "",
    admission_class: "",

    father: { ...emptyGuardian },
    mother: { ...emptyGuardian },
    relative: { ...emptyGuardian },

    student_documents: [] as StudentDocument[],
  });

  const [currentDocument, setCurrentDocument] = useState({
    type: "",
    file: null as File | null,
    name: "",
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
      setDepartments(data.data || []);
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
    });
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleSubmit = async (e: React.FormEvent, isDraft: boolean = false) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({}); // Clear previous errors

    const newErrors: Record<string, string> = {};

    if (!isDraft) {
      // Validate Required Fields
      if (!formData.en_first_name) newErrors.en_first_name = "First name is required | الاسم الأول مطلوب";
      if (!formData.ar_first_name) newErrors.ar_first_name = "Arabic first name is required | الاسم الأول بالعربي مطلوب";
      if (!formData.date_of_birth) newErrors.date_of_birth = "Date of birth is required | تاريخ الميلاد مطلوب";
      if (!formData.gender) newErrors.gender = "Gender is required | الجنس مطلوب";
      if (!formData.nationality) newErrors.nationality = "Nationality is required | الجنسية مطلوبة";
      if (!formData.student_address) newErrors.student_address = "Address is required | العنوان مطلوب";
      if (!formData.city) newErrors.city = "City is required | المدينة مطلوبة";
      if (!formData.state) newErrors.state = "State is required | المحافظة مطلوبة";
      if (!formData.postal_code) newErrors.postal_code = "Postal code is required | الرمز البريدي مطلوب";
      if (!formData.relationship) newErrors.relationship = "Relationship is required | العلاقة مطلوبة";
      if (!formData.country) newErrors.country = "Country is required | الدولة مطلوبة";
      if (!formData.admission_class) newErrors.admission_class = "Admission Class (Department) is required | المرحلة الدراسية مطلوبة";

      // Validate Father details (always required)
      if (!formData.father.name_en) newErrors.father_name_en = "Father name (EN) is required | اسم الأب مطلوب";
      if (!formData.father.phone) newErrors.father_phone = "Father phone is required | هاتف الأب مطلوب";
      if (!formData.father.national_id) newErrors.father_national_id = "Father ID Number is required | الرقم المدني للأب مطلوب";
      if (!formData.father.id_document) newErrors.father_id_document = "Father ID document is required | وثيقة هوية الأب مطلوبة";

      // Validate Mother details (always required)
      if (!formData.mother.name_en) newErrors.mother_name_en = "Mother name (EN) is required | اسم الأم مطلوب";
      if (!formData.mother.phone) newErrors.mother_phone = "Mother phone is required | هاتف الأم مطلوب";
      if (!formData.mother.national_id) newErrors.mother_national_id = "Mother ID Number is required | الرقم المدني للأم مطلوب";
      if (!formData.mother.id_document) newErrors.mother_id_document = "Mother ID document is required | وثيقة هوية الأم مطلوبة";

      // Validate Relative details (only if relative selected)
      if (formData.relationship === 'relative') {
        if (!formData.relative.name_en) newErrors.relative_name_en = "Relative name (EN) is required | اسم القريب مطلوب";
        if (!formData.relative.phone) newErrors.relative_phone = "Relative phone is required | هاتف القريب مطلوب";
        if (!formData.relative.national_id) newErrors.relative_national_id = "Relative ID Number is required | الرقم المدني للقريب مطلوب";
        if (!formData.relative.id_document) newErrors.relative_id_document = "Relative ID document is required | وثيقة هوية القريب مطلوبة";
      }

      // File validations
      if (!formData.photo) newErrors.photo = "Student photo is required | صورة الطالب مطلوبة";
      if (formData.student_documents.length === 0) newErrors.student_documents = "At least one document is required | يجب تحميل وثيقة واحدة على الأقل";

      // Birthday validation: reject today or future dates
      if (formData.date_of_birth) {
        const dob = new Date(formData.date_of_birth);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (dob >= today) {
          newErrors.date_of_birth = "Date of Birth must be in the past | تاريخ الميلاد يجب أن يكون في الماضي";
        }
      }
    } else {
      // For drafts, we only require the English first name at minimum to identify the record
      if (!formData.en_first_name) newErrors.en_first_name = "English naming is required to save a draft | الاسم بالإنجليزي مطلوب لحفظ المسودة";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);

      // Scroll to the first error
      setTimeout(() => {
        const firstErrorField = Object.keys(newErrors)[0];
        const element = document.getElementById(firstErrorField);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      }, 100);
      return;
    }

    try {
      // Helper to build guardian JSON
      const buildGuardianData = (g: typeof formData.father) => ({
        name_en: g.name_en,
        name_ar: g.name_ar,
        email: g.email,
        phone1: g.phone,
        phone2: g.mobile,
        address: g.address,
        work_phone: g.work_phone,
        occupation: g.occupation,
        workplace: g.workplace,
        is_directly_responsible: g.is_directly_responsible,
        other_datas: {
          national_id: g.national_id,
          passport_number: g.passport_number,
        },
      });

      const fatherPayload = buildGuardianData(formData.father);
      const motherPayload = buildGuardianData(formData.mother);
      const relativePayload = formData.relationship === 'relative' ? buildGuardianData(formData.relative) : {};

      const student = {
        admission_number: formData.admission_number,
        en_first_name: formData.en_first_name,
        en_middle_name: formData.en_middle_name,
        en_last_name: formData.en_last_name,
        ar_first_name: formData.ar_first_name,
        ar_middle_name: formData.ar_middle_name,
        ar_last_name: formData.ar_last_name,
        en_grandfather_name: formData.en_grandfather_name,
        ar_grandfather_name: formData.ar_grandfather_name,
        photo: null, // sent separately
        date_of_birth: formData.date_of_birth,
        age_years: calculateAge(formData.date_of_birth),
        gender: formData.gender,
        religion: formData.religion,
        nationality: formData.nationality,
        governance: formData.governance,
        state: formData.state,
        neighborhood: formData.neighborhood,
        street_number: formData.street_number,
        house_number: formData.house_number,
        previous_education_system: formData.previous_education_system,
        wanted_education_system: formData.wanted_education_system,
        chronic_disease: formData.chronic_disease,
        parents_divorced: formData.parents_divorced,
        staying_with: formData.staying_with,
        home_contact: formData.home_contact,
        previous_school: formData.previous_school,
        has_special_needs: formData.has_special_needs,
        special_needs_details: formData.special_needs_details,
        emergency_contact: formData.emergency_contact,
        google_map_location_url: formData.google_map_location_url,
        is_promoted: true,
        is_active: true,
        is_verified_registration_officer: false,
        is_draft: isDraft,
        other_datas: {
          email: formData.student_email,
          address: formData.student_address,
          city: formData.city,
          postal_code: formData.postal_code,
          country: formData.country,
        },
        admission_class: formData.admission_class,
      };

      // If user selected a document but forgot to click 'Add Document'
      if (currentDocument.type && currentDocument.file) {
        formData.student_documents.push({
          document_type: currentDocument.type,
          file: currentDocument.file,
          description: currentDocument.file.name,
          file_field: `document_file_${formData.student_documents.length}`,
        });
      }
      // Build student_documents metadata
      const documentMetadata = formData.student_documents.map((doc, i) => ({
        document_type: doc.document_type,
        description:
          doc.description ||
          (typeof doc.file !== "string" ? (doc.file as File).name : `doc_${i}`),
        file_field: `document_file_${i}`,
      }));

      const form = new FormData();

      // Attach JSON objects - multi-guardian architecture
      form.append("father", JSON.stringify(fatherPayload));
      form.append("mother", JSON.stringify(motherPayload));
      form.append("relationship", formData.relationship);
      if (formData.relationship === 'relative') {
        form.append("relative", JSON.stringify(relativePayload));
      }
      form.append("student", JSON.stringify(student));
      form.append("student_documents", JSON.stringify(documentMetadata));

      // Attach photo file
      if (formData.photo) {
        form.append("student_photo", formData.photo);
      }

      if (formData.passport_copy) {
        form.append("student_passport", formData.passport_copy);
      }

      // Attach guardian ID documents
      if (formData.father.id_document) {
        form.append("father_id_document", formData.father.id_document);
      }
      if (formData.mother.id_document) {
        form.append("mother_id_document", formData.mother.id_document);
      }
      if (formData.relationship === 'relative' && formData.relative.id_document) {
        form.append("relative_id_document", formData.relative.id_document);
      }

      // Attach document files
      formData.student_documents.forEach((doc, i) => {
        if (typeof doc.file !== "string") {
          form.append(`document_file_${i}`, doc.file);
        }
      });

      // Submit request
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/students/create-student-details/`,
        {
          method: "POST",
          body: form,
        }
      );

      const result = await response.json();

      if (result.statuscode == 400) {
        Swal.fire({
          title: 'Error!',
          text: 'Please check the form and complete all required fields before submitting.',
          icon: 'error',
          timer: 5000,
          timerProgressBar: true,
          confirmButtonText: 'OK'
        });
      }
      if (!response.ok || (result.statuscode && result.statuscode !== 201 && result.statuscode !== 200)) {
        console.error("API Error:", result);

        if (typeof result.errors === "object" && result.errors !== null) {
          // Flatten structured errors from backend to match frontend state
          const flattenedErrors: Record<string, string> = {};

          if (result.errors.student) {
            Object.entries(result.errors.student).forEach(([key, val]) => {
              flattenedErrors[key] = String(val);
            });
          }

          ["father", "mother", "relative"].forEach(guardian => {
            if (result.errors[guardian]) {
              Object.entries(result.errors[guardian]).forEach(([key, val]) => {
                // Map nested keys like father.national_id -> father_national_id
                flattenedErrors[`${guardian}_${key}`] = String(val);
              });
            }
          });

          if (result.errors.documents) {
            flattenedErrors["student_documents"] = String(result.errors.documents);
          }

          setErrors(flattenedErrors);

          // Auto-scroll to first backend error
          setTimeout(() => {
            const firstKey = Object.keys(flattenedErrors)[0];
            const element = document.getElementById(firstKey);
            if (element) {
              element.scrollIntoView({ behavior: "smooth", block: "center" });
              element.focus();
            }
          }, 100);
        } else {
          // Fallback for non-field errors
          Swal.fire({
            title: 'Error!',
            text: result.message || "Failed to submit registration",
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
        throw new Error("Validation failed");
      }
      // 3. Show Success Message
      if (isDraft) {
        await Swal.fire({
          title: 'Draft Saved! | تم حفظ المسودة',
          text: 'Registration draft has been saved successfully | تم حفظ مسودة التسجيل بنجاح',
          icon: 'success',
          timer: 3000,
          timerProgressBar: true,
          confirmButtonText: 'OK'
        });
      } else {
        await Swal.fire({
          title: '<span>Registration Successful! | تم التسجيل بنجاح</span>',
          html: `
            <div style="text-align: left">
              <p style="margin-bottom: 1rem">The student registration has been submitted successfully.</p>
              <div style="background: rgba(102, 42, 20, 0.05); padding: 15px; border-radius: 10px; border: 1px dashed #662a14;">
                <p style="margin-bottom: 0.5rem"><strong>Student Name:</strong> <span style="color: #662a14">${result.data?.student?.en_first_name || ''} ${result.data?.student?.en_last_name || ''}</span></p>
                <p style="margin-bottom: 0px"><strong>Admission Number:</strong> <span style="color: #662a14; font-family: monospace; font-weight: bold;">${result.data?.student?.admission_number || 'N/A'}</span></p>
              </div>
              <p style="font-size: 0.875rem; color: #6b7280; mt-4">Please keep this admission number for future reference.</p>
            </div>
          `,
          icon: "success",
          confirmButtonText: "OK",
          width: "550px",
          customClass: {
            popup: "rounded-lg border-2 border-brown-200",
            title: "text-2xl font-bold",
            htmlContainer: "text-left",
          },
          background: "#fffaf7",
          showClass: {
            popup: "animate__animated animate__fadeInDown",
          },
          hideClass: {
            popup: "animate__animated animate__fadeOutUp",
          },
        });
      }

      const token = localStorage.getItem("accessToken");

      if (token && !isDraft) {
        navigate(`/student/${result.data.student.id}`);
      } else if (token && isDraft) {
        // For draft, maybe refresh or go to dashboard
        window.location.reload();
      }

      // Reset form
      setFormData({
        admission_number: "",
        en_first_name: "",
        en_middle_name: "",
        en_last_name: "",
        ar_first_name: "",
        ar_middle_name: "",
        ar_last_name: "",
        en_grandfather_name: "",
        ar_grandfather_name: "",
        photo: null as File | null,
        student_email: "",
        date_of_birth: "",
        gender: "",
        religion: "",
        nationality: "",
        student_address: "",
        city: "",
        state: "",
        postal_code: "",
        country: "",
        governance: "",
        neighborhood: "",
        street_number: "",
        house_number: "",
        previous_education_system: "",
        wanted_education_system: "",
        chronic_disease: "",
        parents_divorced: false,
        staying_with: "",
        home_contact: "",
        emergency_contact: "",
        google_map_location_url: "",
        section: "",
        previous_school: "",
        has_special_needs: false,
        special_needs_details: "",
        passport_copy: null as File | null,
        relationship: "",
        father: { ...emptyGuardian },
        mother: { ...emptyGuardian },
        relative: { ...emptyGuardian },
        student_documents: [],
        admission_class: "",
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
      description: currentDocument.type === "OTHER" ? currentDocument.name : (currentDocument.file.name || ""),
      document_name: currentDocument.type === "OTHER" ? currentDocument.name : "",
    };

    setFormData((prev) => ({
      ...prev,
      student_documents: [...prev.student_documents, newDocument],
    }));

    setCurrentDocument({
      type: "",
      file: null,
      name: "",
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        photo: e.target.files[0],
      });
      if (errors.photo) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.photo;
          return newErrors;
        });
      }
    }
  };

  const handlePassportUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        passport_copy: e.target.files[0],
      });
      Swal.fire({
        title: 'Success!',
        text: 'Passport copy uploaded',
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

  const fillDummyData = () => {
    setFormData({
      ...formData,
      en_first_name: "John",
      en_middle_name: "Doe",
      en_last_name: "Smith",
      ar_first_name: "جون",
      ar_middle_name: "دو",
      ar_last_name: "سميث",
      en_grandfather_name: "Robert",
      ar_grandfather_name: "روبرت",
      student_email: "student@example.com",
      date_of_birth: "2015-05-15",
      gender: "M",
      religion: "Islam",
      nationality: "Oman",
      student_address: "Muscat, Oman",
      city: "Muscat",
      state: "Muscat",
      postal_code: "100",
      country: "Oman",
      governance: "Muscat",
      neighborhood: "Al Seeb",
      street_number: "123",
      house_number: "45",
      previous_education_system: "Omani Curriculum",
      wanted_education_system: "Omani Curriculum",
      staying_with: "Parents",
      home_contact: "98765432",
      emergency_contact: "91112222",
      google_map_location_url: "https://maps.google.com/?q=23.5859,58.4059",
      admission_number: `AMPS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      previous_school: "International School",
      relationship: "relative",
      father: {
        national_id: "12345678",
        name_en: "John Senior",
        name_ar: "جون سينيور",
        phone: "+96898765432",
        mobile: "+96898887776",
        email: "father@example.com",
        work_phone: "+96824000000",
        workplace: "PDO",
        occupation: "Engineer",
        passport_number: "P1234567",
        id_document: null,
        address: "Muscat, Oman",
        is_directly_responsible: false,
      },
      mother: {
        national_id: "87654321",
        name_en: "Jane Smith",
        name_ar: "جين سميث",
        phone: "+96899887766",
        mobile: "+96899776655",
        email: "mother@example.com",
        work_phone: "+96824111111",
        workplace: "Ministry of Education",
        occupation: "Teacher",
        passport_number: "P7654321",
        id_document: null,
        address: "Muscat, Oman",
        is_directly_responsible: false,
      },
      relative: {
        national_id: "55443322",
        name_en: "Uncle Bob",
        name_ar: "العم بوب",
        phone: "+96895554443",
        mobile: "+96894443332",
        email: "relative@example.com",
        work_phone: "+96824998877",
        workplace: "Private Sector",
        occupation: "Manager",
        passport_number: "P5566778",
        id_document: null,
        address: "Muscat, Oman",
        is_directly_responsible: true,
      },
    });
    Swal.fire({
      title: 'Success!',
      text: 'Dummy data filled | تم تعبئة البيانات الوهمية',
      icon: 'success',
      timer: 5000,
      timerProgressBar: true,
      confirmButtonText: 'OK'
    });
  };

  return (
    <>
      {(isLoading.departments || isSubmitting) && (
        <FullPageLoader />
      )}

      <div className="max-w-6xl mx-auto my-12 px-4 space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl border-0">
          <div className="bg-gradient-to-r from-[#662a14] to-[#4a1e0e] p-8 text-white flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Student Registration | تسجيل طالب</h1>
              <p className="text-[#662a14]/60 font-medium">Please fill in the information below to register | يرجى تعبئة المعلومات أدناه للتسجيل</p>
            </div>
            <Button
              type="button"
              onClick={fillDummyData}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
            >
              Fill Dummy Data
            </Button>
          </div>

          <div className="p-10">
            <form onSubmit={handleSubmit} className="space-y-16">
              {/* Responsible Person Selection Block */}
              <div className="space-y-8 bg-primary/5 p-8 rounded-3xl border border-primary/20 shadow-sm">
                <div className="text-center space-y-6">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-800 flex flex-col gap-2">
                    <span dir="rtl">من المسؤول المباشر عن الطالب ؟</span>
                    <span className="text-primary">Who is directly responsible for the student?</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto py-4">
                    {RELATIONSHIP_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            relationship: option.value,
                            father: { ...formData.father, is_directly_responsible: option.value === 'father' },
                            mother: { ...formData.mother, is_directly_responsible: option.value === 'mother' },
                            relative: { ...formData.relative, is_directly_responsible: option.value === 'relative' }
                          });
                        }}
                        className={`flex flex-col items-center gap-3 group transition-all duration-300 ${formData.relationship === option.value ? 'scale-110' : 'opacity-70 hover:opacity-100'
                          }`}
                      >
                        <div className={`w-20 h-20 md:w-28 md:h-28 rounded-full border-4 flex items-center justify-center transition-all duration-300 shadow-md ${formData.relationship === option.value
                          ? 'border-primary bg-primary text-white elevation-lg'
                          : 'border-white bg-white text-gray-400 group-hover:border-primary/20 shadow-inner'
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
                  {errors.relationship && (
                    <p className="text-red-500 text-sm mt-2 text-center animate-bounce font-bold bg-white p-2 rounded shadow-sm border border-red-100 inline-block mx-auto">
                      {errors.relationship}
                    </p>
                  )}
                </div>

                {/* Bilingual Disclaimer Note */}
                <div className="max-w-4xl mx-auto space-y-3 bg-white p-6 rounded-2xl border-l-4 border-r-4 border-primary/40 shadow-md">
                  <p dir="rtl" className="text-right font-bold text-gray-700 leading-relaxed text-lg">
                    ملاحظة الشخص المسؤول المباشر عن الطالب هو من يتحمل كافة مسؤولية الطالب ماليا وسلوكيا واداريا ودقة البيانات المذكورة؟
                  </p>
                  <p className="text-gray-600 leading-relaxed font-medium italic">
                    <span className="text-red-600 font-black tracking-tight uppercase mr-2 not-italic underline decoration-2 underline-offset-4">Note:</span>
                    The person directly responsible for the student bears full responsibility for the student financially, behaviorally, administratively, and for the accuracy of the data mentioned.
                  </p>
                </div>
              </div>

              {/* Dynamic Parent/Guardian Details Section based on Selection */}
              {formData.relationship && (() => {
                const guardianConfigs = {
                  father: {
                    title: "FATHER DETAILS | بيانات الأب",
                    label: "Father",
                    arLabel: "الأب",
                    key: "father" as const,
                    border: "border-[#662a14]/10",
                    bg: "bg-[#662a14]/5",
                    textColor: "text-[#662a14]",
                    inputBorder: "border-[#662a14]/20",
                    focusBorder: "focus:border-[#662a14]",
                    phoneBorder: "#e5e7eb",
                    icon: <User className="h-6 w-6" />,
                    iconBg: "bg-[#662a14]"
                  },
                  mother: {
                    title: "MOTHER DETAILS | بيانات الأم",
                    label: "Mother",
                    arLabel: "الأم",
                    key: "mother" as const,
                    border: "border-pink-100",
                    bg: "bg-pink-50/20",
                    textColor: "text-pink-900",
                    inputBorder: "border-pink-100",
                    focusBorder: "focus:border-pink-400",
                    phoneBorder: "#e5e7eb",
                    icon: <User className="h-6 w-6" />,
                    iconBg: "bg-pink-600"
                  },
                  relative: {
                    title: "RELATIVE DETAILS | بيانات القريب",
                    label: "Relative",
                    arLabel: "القريب",
                    key: "relative" as const,
                    border: "border-orange-100",
                    bg: "bg-orange-50/20",
                    textColor: "text-orange-900",
                    inputBorder: "border-orange-100",
                    focusBorder: "focus:border-orange-400",
                    phoneBorder: "#e5e7eb",
                    icon: <User className="h-6 w-6" />,
                    iconBg: "bg-orange-600"
                  }
                };

                const updateGuardian = (guardianKey: "father" | "mother" | "relative", field: string, value: any) => {
                  setFormData(prev => ({
                    ...prev,
                    [guardianKey]: {
                      ...prev[guardianKey],
                      [field]: value,
                    }
                  }));
                };

                const renderGuardianForm = (config: typeof guardianConfigs.father, isResponsible: boolean) => (
                  <div key={config.key} className={`border-2 ${config.border} p-8 rounded-2xl ${config.bg} shadow-md space-y-8 animate-in zoom-in-95 duration-300`}>
                    <h4 className={`text-xl font-bold flex items-center gap-3 ${config.textColor} border-b-2 ${config.border} pb-4 uppercase tracking-wider`}>
                      <span className={`${config.iconBg} text-white p-2 rounded-lg shadow-lg`}>
                        {config.icon}
                      </span>
                      {config.title}
                      {isResponsible && (
                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold normal-case tracking-normal">
                          ✓ Directly Responsible | المسؤول المباشر
                        </span>
                      )}
                    </h4>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* National ID */}
                      <div className="space-y-2">
                        <Label htmlFor={`${config.key}_national_id`}>{config.label} ID Number * | الرقم المدني *</Label>
                        <Input
                          id={`${config.key}_national_id`}
                          value={formData[config.key].national_id}
                          onChange={(e) => updateGuardian(config.key, 'national_id', e.target.value)}
                          placeholder={`${config.label} ID Number`}
                          className={`bg-white ${config.inputBorder} ${config.focusBorder} ${errors[`${config.key}_national_id`] ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'}`}
                        />
                        {errors[`${config.key}_national_id`] && <p className="text-red-500 text-xs font-semibold mt-1">{errors[`${config.key}_national_id`]}</p>}
                      </div>

                      {/* English Name */}
                      <div className="space-y-2">
                        <Label htmlFor={`${config.key}_name_en`}>{config.label} Name (English) * | اسم {config.arLabel} (إنجليزي)</Label>
                        <Input
                          id={`${config.key}_name_en`}
                          value={formData[config.key].name_en}
                          onChange={(e) => updateGuardian(config.key, 'name_en', e.target.value)}
                          placeholder={`${config.label} Name in English`}
                          className={`bg-white ${config.inputBorder} ${config.focusBorder} ${errors[`${config.key}_name_en`] ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'}`}
                          required
                        />
                        {errors[`${config.key}_name_en`] && <p className="text-red-500 text-xs font-semibold mt-1">{errors[`${config.key}_name_en`]}</p>}
                      </div>

                      {/* Arabic Name */}
                      <div className="space-y-2">
                        <Label htmlFor={`${config.key}_name_ar`}>{config.label} Name (Arabic) | اسم {config.arLabel} (عربي)</Label>
                        <Input
                          id={`${config.key}_name_ar`}
                          value={formData[config.key].name_ar}
                          onChange={(e) => updateGuardian(config.key, 'name_ar', e.target.value)}
                          placeholder={`اسم ${config.arLabel}`}
                          dir="rtl"
                          className={`bg-white ${config.inputBorder} ${config.focusBorder} ${errors[`${config.key}_name_ar`] ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'}`}
                        />
                        {errors[`${config.key}_name_ar`] && <p className="text-red-500 text-xs font-semibold text-right mt-1">{errors[`${config.key}_name_ar`]}</p>}
                      </div>

                      {/* Phone (Primary) */}
                      <div className="space-y-2">
                        <Label>{config.label} Phone * | الهاتف *</Label>
                        <PhoneInput
                          defaultCountry="om"
                          value={formData[config.key].phone}
                          onChange={(val) => updateGuardian(config.key, 'phone', val)}
                          style={{ height: "40px", width: "100%" }}
                          inputStyle={{ width: "100%", height: "40px", padding: "0.5rem", borderRadius: "0 0.375rem 0.375rem 0", border: `1px solid ${errors[`${config.key}_phone`] ? 'red' : config.phoneBorder}`, boxSizing: "border-box" }}
                          countrySelectorStyleProps={{ buttonStyle: { height: "42px", border: `1px solid ${errors[`${config.key}_phone`] ? 'red' : config.phoneBorder}`, borderRadius: "0.375rem 0 0 0.375rem", borderRight: "none", boxSizing: "border-box" } }}
                        />
                        {errors[`${config.key}_phone`] && <p className="text-red-500 text-xs font-semibold">{errors[`${config.key}_phone`]}</p>}
                      </div>

                      {/* Mobile */}
                      <div className="space-y-2">
                        <Label>{config.label} Mobile | الجوال</Label>
                        <PhoneInput
                          defaultCountry="om"
                          value={formData[config.key].mobile}
                          onChange={(val) => updateGuardian(config.key, 'mobile', val)}
                          style={{ height: "40px", width: "100%" }}
                          inputStyle={{ width: "100%", height: "40px", padding: "0.5rem", borderRadius: "0 0.375rem 0.375rem 0", border: `1px solid ${config.phoneBorder}`, boxSizing: "border-box" }}
                          countrySelectorStyleProps={{ buttonStyle: { height: "40px", border: `1px solid ${config.phoneBorder}`, borderRadius: "0.375rem 0 0 0.375rem", borderRight: "none", boxSizing: "border-box" } }}
                        />
                      </div>

                      {/* Email (Optional) */}
                      <div className="space-y-2">
                        <Label htmlFor={`${config.key}_email`}>{config.label} Email | البريد الإلكتروني</Label>
                        <Input
                          id={`${config.key}_email`}
                          type="email"
                          value={formData[config.key].email}
                          onChange={(e) => updateGuardian(config.key, 'email', e.target.value)}
                          placeholder="email@example.com"
                          className={`bg-white ${config.inputBorder} ${config.focusBorder} border-gray-200`}
                        />
                      </div>

                      {/* Work Phone */}
                      <div className="space-y-2">
                        <Label>{config.label} Work Phone | هاتف العمل</Label>
                        <PhoneInput
                          defaultCountry="om"
                          value={formData[config.key].work_phone}
                          onChange={(val) => updateGuardian(config.key, 'work_phone', val)}
                          style={{ height: "40px", width: "100%" }}
                          inputStyle={{ width: "100%", height: "40px", padding: "0.5rem", borderRadius: "0 0.375rem 0.375rem 0", border: `1px solid ${config.phoneBorder}`, boxSizing: "border-box" }}
                          countrySelectorStyleProps={{ buttonStyle: { height: "40px", border: `1px solid ${config.phoneBorder}`, borderRadius: "0.375rem 0 0 0.375rem", borderRight: "none", boxSizing: "border-box" } }}
                        />
                      </div>

                      {/* Workplace */}
                      <div className="space-y-2">
                        <Label htmlFor={`${config.key}_workplace`}>{config.label} Workplace | جهة العمل</Label>
                        <Input
                          id={`${config.key}_workplace`}
                          value={formData[config.key].workplace}
                          onChange={(e) => updateGuardian(config.key, 'workplace', e.target.value)}
                          placeholder="Workplace"
                          className={`bg-white ${config.inputBorder} ${config.focusBorder} border-gray-200`}
                        />
                      </div>

                      {/* Occupation */}
                      <div className="space-y-2">
                        <Label htmlFor={`${config.key}_occupation`}>{config.label} Occupation | الوظيفة</Label>
                        <Input
                          id={`${config.key}_occupation`}
                          value={formData[config.key].occupation}
                          onChange={(e) => updateGuardian(config.key, 'occupation', e.target.value)}
                          placeholder="Occupation"
                          className={`bg-white ${config.inputBorder} ${config.focusBorder} border-gray-200`}
                        />
                      </div>

                      {/* Passport Number */}
                      <div className="space-y-2">
                        <Label htmlFor={`${config.key}_passport_number`}>{config.label} Passport Number | رقم الجواز</Label>
                        <Input
                          id={`${config.key}_passport_number`}
                          value={formData[config.key].passport_number}
                          onChange={(e) => updateGuardian(config.key, 'passport_number', e.target.value)}
                          placeholder="Passport Number"
                          className={`bg-white ${config.inputBorder} ${config.focusBorder} border-gray-200`}
                        />
                      </div>

                      {/* ID Document */}
                      <div className="space-y-2">
                        <Label htmlFor={`${config.key}_id_document`}>{config.label} ID Document * | وثيقة الهوية *</Label>
                        <Input
                          id={`${config.key}_id_document`}
                          type="file"
                          onChange={(e) => updateGuardian(config.key, 'id_document', e.target.files ? e.target.files[0] : null)}
                          accept=".pdf,.jpg,.jpeg,.png"
                          className={`bg-white ${config.inputBorder} ${errors[`${config.key}_id_document`] ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'}`}
                        />
                        {errors[`${config.key}_id_document`] && <p className="text-red-500 text-xs font-semibold mt-1">{errors[`${config.key}_id_document`]}</p>}
                      </div>

                      {/* Address */}
                      <div className="space-y-2">
                        <Label htmlFor={`${config.key}_address`}>{config.label} Address | العنوان</Label>
                        <Input
                          id={`${config.key}_address`}
                          value={formData[config.key].address}
                          onChange={(e) => updateGuardian(config.key, 'address', e.target.value)}
                          placeholder={`${config.label} Address`}
                          className={`bg-white ${config.inputBorder} ${config.focusBorder}`}
                        />
                      </div>
                    </div>
                  </div>
                );

                // Determine which forms to show based on relationship
                const formsToShow: Array<{ config: typeof guardianConfigs.father; isResponsible: boolean }> = [];

                if (formData.relationship === 'father') {
                  formsToShow.push({ config: guardianConfigs.father, isResponsible: true });
                  formsToShow.push({ config: guardianConfigs.mother, isResponsible: false });
                } else if (formData.relationship === 'mother') {
                  formsToShow.push({ config: guardianConfigs.mother, isResponsible: true });
                  formsToShow.push({ config: guardianConfigs.father, isResponsible: false });
                } else if (formData.relationship === 'relative') {
                  formsToShow.push({ config: guardianConfigs.relative, isResponsible: true });
                  formsToShow.push({ config: guardianConfigs.father, isResponsible: false });
                  formsToShow.push({ config: guardianConfigs.mother, isResponsible: false });
                }

                return (
                  <div className="space-y-8">
                    {formsToShow.map(({ config, isResponsible }) => renderGuardianForm(config, isResponsible))}
                  </div>
                );
              })()}

              {/* Student Information Section */}
              <div className="space-y-10">
                <h3 className="text-2xl font-bold flex items-center gap-3 text-gray-800 border-b-2 border-gray-100 pb-4">
                  <span className="bg-primary/10 text-primary p-2 rounded-xl">
                    <UserPlus className="h-6 w-6" />
                  </span>
                  Student Information | معلومات الطالب
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Admission Class (Department) */}
                  <div className="space-y-2">
                    <Label htmlFor="admission_class" className="font-bold text-brown-700">Admission Class (Department) * | المرحلة الدراسية *</Label>
                    <Select
                      value={formData.admission_class}
                      onValueChange={(value) => setFormData({ ...formData, admission_class: value })}
                    >
                      <SelectTrigger id="admission_class" className={`rounded-xl bg-white shadow-sm font-bold text-brown-700 ${errors.admission_class ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'}`}>
                        <SelectValue placeholder="Select admission class" />
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


                  {/* Student Photo */}
                  <div>
                    <Label htmlFor="photo">Student Photo * | صورة الطالب *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="photo"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className={`bg-white ${errors.photo ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'}`}
                      />
                      {errors.photo && <p className="text-red-500 text-xs font-semibold">{errors.photo}</p>}
                      {formData.photo && (
                        <span className="text-sm">{formData.photo.name}</span>
                      )}
                    </div>
                  </div>

                  {/* Passport Copy */}
                  <div>
                    <Label htmlFor="passport_copy">Passport Copy * | نسخة الجواز *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="passport_copy"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handlePassportUpload}
                        className={`bg-white ${errors.passport_copy ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'}`}
                        required
                      />
                      {errors.passport_copy && <p className="text-red-500 text-xs font-semibold">{errors.passport_copy}</p>}
                      {formData.passport_copy && (
                        <span className="text-sm">{formData.passport_copy.name}</span>
                      )}
                    </div>
                  </div>

                  {/* English Name */}
                  <div className="space-y-2">
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
                      className={`rounded-xl shadow-sm ${errors.en_first_name ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 focus:ring-2 focus:ring-primary/20 transition-all'}`}
                      required
                    />
                    {errors.en_first_name && <p className="text-red-500 text-xs font-semibold mt-1">{errors.en_first_name}</p>}
                  </div>

                  <div className="space-y-2">
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
                      className={`rounded-xl shadow-sm text-right ${errors.ar_first_name ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 focus:ring-2 focus:ring-primary/20 transition-all'}`}
                      required
                    />
                    {errors.ar_first_name && <p className="text-red-500 text-xs font-semibold text-right mt-1">{errors.ar_first_name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="en_middle_name">
                      Second Name / Father Name (English) | اسم الأب (إنجليزي)
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
                      placeholder="Father name in English"
                      className="rounded-xl shadow-sm border-gray-200 focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ar_middle_name">
                      Second Name / Father Name (Arabic) | اسم الأب (عربي)
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
                      placeholder="اسم الأب"
                      dir="rtl"
                      className="rounded-xl shadow-sm text-right border-gray-200 focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  {/* Last Name */}
                  <div className="space-y-2">
                    <Label htmlFor="en_last_name">
                      Last Name (English) * | اسم العائلة (إنجليزي)
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
                      className={`rounded-xl shadow-sm ${errors.en_last_name ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 focus:ring-2 focus:ring-primary/20 transition-all'}`}
                      required
                    />
                    {errors.en_last_name && <p className="text-red-500 text-xs font-semibold mt-1">{errors.en_last_name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ar_last_name">
                      Last Name (Arabic) * | اسم العائلة (عربي)
                    </Label>
                    <Input
                      id="ar_last_name"
                      value={formData.ar_last_name}
                      onChange={(e) =>
                        setFormData({ ...formData, ar_last_name: e.target.value })
                      }
                      placeholder="خان"
                      dir="rtl"
                      className={`rounded-xl shadow-sm text-right ${errors.ar_last_name ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 focus:ring-2 focus:ring-primary/20 transition-all'}`}
                      required
                    />
                    {errors.ar_last_name && <p className="text-red-500 text-xs font-semibold text-right mt-1">{errors.ar_last_name}</p>}
                  </div>


                  <div className="space-y-2">
                    <Label htmlFor="en_grandfather_name">
                      Grandfather Name (English) | اسم الجد (إنجليزي)
                    </Label>
                    <Input
                      id="en_grandfather_name"
                      value={formData.en_grandfather_name}
                      onChange={(e) => setFormData({ ...formData, en_grandfather_name: e.target.value })}
                      placeholder="Grandfather name in English"
                      className="rounded-xl shadow-sm border-gray-200 focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ar_grandfather_name">
                      Grandfather Name (Arabic) | اسم الجد (عربي)
                    </Label>
                    <Input
                      id="ar_grandfather_name"
                      value={formData.ar_grandfather_name}
                      onChange={(e) => setFormData({ ...formData, ar_grandfather_name: e.target.value })}
                      placeholder="اسم الجد"
                      dir="rtl"
                      className="rounded-xl shadow-sm text-right border-gray-200 focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>



                  {/* Contact Information */}
                  <div className="space-y-2">
                    <Label htmlFor="student_email">Email | البريد الإلكتروني</Label>
                    <Input
                      id="student_email"
                      type="email"
                      value={formData.student_email}
                      onChange={(e) =>
                        setFormData({ ...formData, student_email: e.target.value })
                      }
                      placeholder="student@example.com"
                      className={`rounded-xl shadow-sm ${errors.student_email ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 focus:ring-2 focus:ring-primary/20 transition-all'}`}
                    />
                    {errors.student_email && <p className="text-red-500 text-xs font-semibold mt-1">{errors.student_email}</p>}
                  </div>



                  {/* Personal Information */}
                  <div className="space-y-2">
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
                      className={`rounded-xl shadow-sm ${errors.date_of_birth ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 focus:ring-2 focus:ring-primary/20 transition-all'}`}
                      required
                    />
                    {errors.date_of_birth && <p className="text-red-500 text-xs font-semibold mt-1">{errors.date_of_birth}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender * | الجنس</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) =>
                        setFormData({ ...formData, gender: value })
                      }
                    >
                      <SelectTrigger className={`rounded-xl bg-white shadow-sm ${errors.gender ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 focus:ring-2 focus:ring-primary/20 transition-all'}`}>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      {errors.gender && <p className="text-red-500 text-xs font-semibold mt-1">{errors.gender}</p>}
                      <SelectContent>
                        {GENDER_OPTIONS.map((gender) => (
                          <SelectItem key={gender.value} value={gender.value}>
                            {gender.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="religion">Religion * | الديانة</Label>
                    <Select
                      value={RELIGION_OPTIONS.some(opt => opt.value === formData.religion) ? formData.religion : "other"}
                      onValueChange={(value) => {
                        if (value === "other") {
                          setFormData({ ...formData, religion: "Other" });
                        } else {
                          setFormData({ ...formData, religion: value });
                        }
                      }}
                    >
                      <SelectTrigger className={`rounded-xl bg-white shadow-sm ${errors.religion ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 focus:ring-2 focus:ring-primary/20 transition-all'}`}>
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

                    {(!RELIGION_OPTIONS.some(opt => opt.value === formData.religion) || formData.religion === "Other" || formData.religion === "other") && (
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

                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality * | الجنسية</Label>
                    <Select
                      value={formData.nationality}
                      onValueChange={(value) =>
                        setFormData({ ...formData, nationality: value })
                      }
                    >
                      <SelectTrigger className={`rounded-xl bg-white shadow-sm ${errors.nationality ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 focus:ring-2 focus:ring-primary/20 transition-all'}`}>
                        <SelectValue placeholder="Select nationality" />
                      </SelectTrigger>
                      {errors.nationality && <p className="text-red-500 text-xs font-semibold mt-1">{errors.nationality}</p>}
                      <SelectContent>
                        {countryList.map((country) => (
                          <SelectItem key={country.code} value={country.name}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="staying_with">Staying With | السكن مع</Label>
                    <Input
                      id="staying_with"
                      value={formData.staying_with}
                      onChange={(e) => setFormData({ ...formData, staying_with: e.target.value })}
                      placeholder="e.g. Parents"
                      className="rounded-xl shadow-sm border-gray-200 focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="home_contact">Home Contact | هاتف المنزل</Label>
                    <Input
                      id="home_contact"
                      value={formData.home_contact}
                      onChange={(e) => setFormData({ ...formData, home_contact: e.target.value })}
                      placeholder="Home contact number"
                      className="rounded-xl shadow-sm border-gray-200 focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact">Emergency Contact | هاتف الطوارئ</Label>
                    <Input
                      id="emergency_contact"
                      value={formData.emergency_contact}
                      onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                      placeholder="Emergency contact number"
                      className="rounded-xl shadow-sm border-gray-200 focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  {/* Address Information */}
                  <div>
                    <Label htmlFor="student_address">Address * | العنوان *</Label>
                    <Input
                      id="student_address"
                      value={formData.student_address}
                      onChange={(e) =>
                        setFormData({ ...formData, student_address: e.target.value })
                      }
                      placeholder="123 Main St, City, Country"
                      className={`rounded-xl shadow-sm ${errors.student_address ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 focus:ring-2 focus:ring-primary/20 transition-all'}`}
                    />
                    {errors.student_address && <p className="text-red-500 text-xs font-semibold">{errors.student_address}</p>}
                  </div>

                  <div>
                    <Label htmlFor="city">City * | المدينة *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      placeholder="City"
                      className={`rounded-xl shadow-sm ${errors.city ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 focus:ring-2 focus:ring-primary/20 transition-all'}`}
                    />
                    {errors.city && (
                      <p className="text-red-500 text-xs font-semibold">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="state">State * | المحافظة *</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value })
                      }
                      placeholder="State"
                      className={`rounded-xl shadow-sm ${errors.state ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 focus:ring-2 focus:ring-primary/20 transition-all'}`}
                    />
                    {errors.state && (
                      <p className="text-red-500 text-xs font-semibold">{errors.state}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="postal_code">Postal Code * | الرمز البريدي *</Label>
                    <Input
                      id="postal_code"
                      value={formData.postal_code}
                      onChange={(e) =>
                        setFormData({ ...formData, postal_code: e.target.value })
                      }
                      placeholder="Postal code"
                      className={`rounded-xl shadow-sm ${errors.postal_code ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 focus:ring-2 focus:ring-primary/20 transition-all'}`}
                    />
                    {errors.postal_code && (
                      <p className="text-red-500 text-xs font-semibold">{errors.postal_code}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="country">Country * | الدولة *</Label>
                    <Select
                      value={formData.country}
                      onValueChange={(value) =>
                        setFormData({ ...formData, country: value })
                      }
                    >
                      <SelectTrigger
                        id="country"
                        className={`rounded-xl bg-white shadow-sm font-bold text-brown-700 ${errors.country
                          ? 'border-red-500 ring-1 ring-red-500'
                          : 'border-gray-200 focus:ring-2 focus:ring-primary/20 transition-all'
                          }`}
                      >
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                      {errors.country && (
                        <p className="text-red-500 text-xs font-semibold">{errors.country}</p>
                      )}
                      <SelectContent>
                        {countryList.map((country) => (
                          <SelectItem key={country.code} value={country.name}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="governance">Governance | المحافظة</Label>
                    <Input
                      id="governance"
                      value={formData.governance}
                      onChange={(e) => setFormData({ ...formData, governance: e.target.value })}
                      placeholder="Governance"
                      className={`rounded-xl shadow-sm border-gray-200 focus:ring-2 focus:ring-primary/20 transition-all ${errors.governance ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                    />
                    {errors.governance && <p className="text-red-500 text-xs font-semibold mt-1">{errors.governance}</p>}
                  </div>

                  <div>
                    <Label htmlFor="neighborhood">Neighborhood | الحي / المنطقة</Label>
                    <Input
                      id="neighborhood"
                      value={formData.neighborhood}
                      onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                      placeholder="Neighborhood"
                      className={`rounded-xl shadow-sm border-gray-200 focus:ring-2 focus:ring-primary/20 transition-all ${errors.neighborhood ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                    />
                    {errors.neighborhood && <p className="text-red-500 text-xs font-semibold mt-1">{errors.neighborhood}</p>}
                  </div>

                  <div>
                    <Label htmlFor="street_number">Street Number | رقم الشارع</Label>
                    <Input
                      id="street_number"
                      value={formData.street_number}
                      onChange={(e) => setFormData({ ...formData, street_number: e.target.value })}
                      placeholder="Street Number"
                      className="rounded-xl shadow-sm border-gray-200 focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  <div>
                    <Label htmlFor="house_number">House Number | رقم المنزل</Label>
                    <Input
                      id="house_number"
                      value={formData.house_number}
                      onChange={(e) => setFormData({ ...formData, house_number: e.target.value })}
                      placeholder="House Number"
                      className="rounded-xl shadow-sm border-gray-200 focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="google_map_location_url">Google Maps URL | رابط خرائط جوجل</Label>
                    <Input
                      id="google_map_location_url"
                      value={formData.google_map_location_url}
                      onChange={(e) => setFormData({ ...formData, google_map_location_url: e.target.value })}
                      placeholder="https://maps.google.com/..."
                      className="rounded-xl shadow-sm border-gray-200 focus:ring-2 focus:ring-primary/20 transition-all"
                    />
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
                      className="rounded-xl shadow-sm border-gray-200 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Special Needs */}
                  <div className="flex items-center space-x-2 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
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
                      className="h-5 w-5 rounded-md border-gray-300 text-primary focus:ring-primary/20 transition-all cursor-pointer"
                    />
                    <Label htmlFor="has_special_needs" className="cursor-pointer font-semibold text-gray-700">
                      Has Special Needs | لديه احتياجات خاصة
                    </Label>
                  </div>

                  {formData.has_special_needs && (
                    <div className="space-y-2">
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
                        className="rounded-xl shadow-sm border-gray-200 focus:ring-2 focus:ring-primary/20"
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
                {errors.student_documents && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm font-medium animate-pulse">
                    {errors.student_documents}
                  </div>
                )}

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
                        <Label htmlFor="custom_document_name">Document Name | اسم الوثيقة</Label>
                        <Input
                          id="custom_document_name"
                          placeholder="Enter document name | ادخل اسم الوثيقة"
                          value={currentDocument.name}
                          onChange={(e) => setCurrentDocument({ ...currentDocument, name: e.target.value })}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="h-14 text-lg font-bold rounded-xl border-2 border-primary/20 hover:bg-primary/5 transition-all"
                  disabled={isSubmitting}
                  onClick={(e) => handleSubmit(e, true)}
                >
                  {isSubmitting ? (
                    "Saving..."
                  ) : (
                    <>
                      <FileText className="mr-2 h-6 w-6" />
                      Save as Draft | حفظ كمسودة
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 h-14 text-lg font-bold rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.01]"
                  disabled={isSubmitting}
                  onClick={(e) => handleSubmit(e, false)}
                >
                  {isSubmitting ? (
                    "Submitting..."
                  ) : (
                    <>
                      <Save className="mr-2 h-6 w-6" />
                      Register Student | تسجيل الطالب
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewStudentRegistrationForm;
