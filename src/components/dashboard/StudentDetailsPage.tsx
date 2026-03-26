import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getFullUrl } from "@/utils/fileUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DownloadIcon,
  EyeIcon,
  FileIcon,
  Loader2,
  PencilIcon,
  PrinterIcon,
  SaveIcon,
  Trash2,
  User,
  UserPlus,
  PlusIcon,
  Camera,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { countries } from "countries-list";
import Swal from "sweetalert2";

// Updated to match registration form
const DOCUMENT_TYPES = [
  { value: "BIRTH", label: "Birth Certificate | شهادة الميلاد" },
  { value: "TRANSFER", label: "Transfer Certificate | شهادة النقل" },
  { value: "PHOTO", label: "Photograph | صورة شخصية" },
  { value: "ID", label: "ID Proof | بطاقة الهوية" },
  { value: "GUARDIAN_ID", label: "Guardian ID Document | وثيقة هوية الوصي" },
  { value: "OTHER", label: "Other | أخرى" },
];

type StudentDocument = {
  id: string;
  document_type: string;
  document_name?: string;
  file_url?: string; // For existing documents
  file?: File; // For new uploads
  description: string;
  isCore?: boolean;
  fieldName?: string;
};

// Updated to match registration form
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

// Updated to match registration form
const RELATIONSHIP_OPTIONS = [
  { value: "father", label: "Father | الأب" },
  { value: "mother", label: "Mother | الأم" },
  { value: "relative", label: "Relative | قريب" },
];

const RELATIONSHIP_CONFIG = {
  father: {
    title: "Father Details | بيانات الأب",
    theme: "blue",
    border: "border-blue-100",
    bg: "bg-blue-50/20",
    textColor: "text-blue-900",
    iconBg: "bg-blue-600",
  },
  mother: {
    title: "Mother Details | بيانات الأم",
    theme: "pink",
    border: "border-pink-100",
    bg: "bg-pink-50/20",
    textColor: "text-pink-900",
    iconBg: "bg-pink-600",
  },
  relative: {
    title: "Relative Details | بيانات القريب",
    theme: "orange",
    border: "border-orange-100",
    bg: "bg-orange-50/20",
    textColor: "text-orange-900",
    iconBg: "bg-orange-600",
  },
};

type Student = {
  id: string;
  admission_number: string;
  en_first_name: string;
  en_middle_name: string;
  en_last_name: string;
  ar_first_name: string;
  ar_middle_name: string;
  ar_last_name: string;
  en_father_name: string;
  ar_father_name: string;
  en_grandfather_name: string;
  ar_grandfather_name: string;
  en_tribe_name: string;
  ar_tribe_name: string;
  photo_url: string | null;
  photo?: File; // New field for photo updates
  passport_copy_url?: string | null;
  passport_copy?: File;
  house_photo_url?: string | null;
  house_photo?: File;
  google_map_location_photo_url?: string | null;
  google_map_location_photo?: File;
  email: string;
  phone: string;
  date_of_birth: string;
  age_years?: number;
  gender: string;
  religion: string;
  nationality: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  governance: string;
  neighborhood: string;
  street_number: string;
  house_number: string;
  staying_with: string;
  home_contact: string;
  emergency_contact: string;
  google_map_location_url: string;
  admission_class: {
    id: string;
    department_name: string;
  };
  section: {
    id: string;
    name: string;
  };
  admission_date: string;
  previous_school: string;
  has_special_needs: boolean;
  special_needs_details: string;
  is_promoted: boolean;
  is_active: boolean;
  is_verified_registration_officer: boolean;
  other_datas?: any;

  // Guardian Information
  guardian: {
    id: string;
    name_en: string;
    name_ar: string;
    phone: string;
    email: string;
    address: string;
    relationship: string;
    national_id: string;
    passport_number: string;
    work_phone: string;
    home_phone: string;
    mobile: string;
    occupation: string;
    workplace: string;
    id_document?: string;
    other_datas?: any;
  };

  // Documents
  student_documents?: StudentDocument[];
  financial_agreement?: any[];
  payment_history?: any[];
  promotion_history?: any[];

  // Status
  status: "pending" | "verified" | "rejected";
};

type Department = {
  id: string;
  department_name: string;
};

type Section = {
  id: string;
  name: string;
  department: string;
};

const calculateAge = (dateOfBirth: string): number => {
  if (!dateOfBirth) return 0;
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};

export default function StudentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [allSections, setAllSections] = useState<Section[]>([]);
  const [filteredSections, setFilteredSections] = useState<Section[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [newDocumentType, setNewDocumentType] = useState("");
  const [newDocumentName, setNewDocumentName] = useState("");
  const [newDocumentFile, setNewDocumentFile] = useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isReplacing, setIsReplacing] = useState<string | null>(null);

  // Countries list for dropdown
  const countryList = Object.entries(countries).map(([code, country]) => ({
    code,
    name: country.name,
  }));
  countryList.sort((a, b) => a.name.localeCompare(b.name));

  async function fetchDepartments() {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/students/department/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch departments");
      const data = await res.json();
      setDepartments(data.data || []);
    } catch (err) {
      console.error("Error loading departments:", err);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to load departments',
        icon: 'error',
        timer: 5000,
        timerProgressBar: true,
        confirmButtonText: 'OK'
      });
    }
  }

  async function fetchSections() {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/students/section/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch sections");
      const data = await res.json();
      setAllSections(data.data || []);
    } catch (err) {
      console.error("Error loading sections:", err);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to load sections',
        icon: 'error',
        timer: 5000,
        timerProgressBar: true,
        confirmButtonText: 'OK'
      });
    }
  }

  async function fetchStudent() {
    if (!id) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/students/student-details-officer/${id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch student data");
      const result = await response.json();
      console.log("API Result:", result);

      if (!result.data || (result.status === false) || (result.statuscode && result.statuscode !== 200)) {
        throw new Error(result.message || "Failed to fetch student data");
      }

      const studentData = result.data;
      console.log("Student Data:", studentData);

      const documents =
        studentData.student_documents ||
        studentData.documents || [];

      const mappedStudent: Student = {
        id: studentData.id,
        admission_number: studentData.admission_number,
        en_first_name: studentData.en_first_name,
        en_middle_name: studentData.en_middle_name || "",
        en_last_name: studentData.en_last_name,
        ar_first_name: studentData.ar_first_name,
        ar_middle_name: studentData.ar_middle_name || "",
        ar_last_name: studentData.ar_last_name,
        en_father_name: studentData.en_father_name || "",
        ar_father_name: studentData.ar_father_name || "",
        en_grandfather_name: studentData.en_grandfather_name || "",
        ar_grandfather_name: studentData.ar_grandfather_name || "",
        en_tribe_name: studentData.en_tribe_name || "",
        ar_tribe_name: studentData.ar_tribe_name || "",
        photo_url: studentData.photo || studentData.photo_url || null,
        passport_copy_url: studentData.passport_copy || null,
        house_photo_url: studentData.house_photo || null,
        google_map_location_photo_url: studentData.google_map_location_photo || null,
        email: studentData.email || "",
        phone: studentData.phone || "",
        date_of_birth: studentData.date_of_birth,
        age_years: calculateAge(studentData.date_of_birth),
        gender: studentData.gender,
        religion: studentData.religion || "",
        nationality: studentData.nationality || "",
        address: studentData.address || "",
        city: studentData.city || "",
        state: studentData.state || "",
        postal_code: studentData.postal_code || "",
        country: studentData.country || "",
        governance: studentData.governance || "",
        neighborhood: studentData.neighborhood || "",
        street_number: studentData.street_number || "",
        house_number: studentData.house_number || "",
        staying_with: studentData.staying_with || "",
        home_contact: studentData.home_contact || "",
        emergency_contact: studentData.emergency_contact || "",
        google_map_location_url: studentData.google_map_location_url || "",
        admission_class: studentData.admission_class || {
          id: "",
          department_name: "Unknown",
        },
        section: studentData.section || { id: "", name: "Unknown" },
        admission_date:
          studentData.admission_date || studentData.other_datas?.admission_date || "",
        previous_school: studentData.previous_school || "",
        has_special_needs: studentData.has_special_needs || false,
        special_needs_details: studentData.special_needs_details || "",
        is_promoted: studentData.is_promoted || false,
        is_active: studentData.is_active !== undefined ? studentData.is_active : true,
        is_verified_registration_officer:
          studentData.is_verified_registration_officer || false,
        guardian: {
          ...studentData.guardian,
          name_en: studentData.guardian?.name_en || "",
          name_ar: studentData.guardian?.name_ar || "",
          phone: studentData.guardian?.phone1 || studentData.guardian?.phone || "",
          email: studentData.guardian?.email || "",
          address: studentData.guardian?.address || "",
          relationship: studentData.guardian?.relationship || "father",
          national_id:
            studentData.guardian?.national_id ||
            studentData.guardian?.other_datas?.national_id ||
            "",
          passport_number:
            studentData.guardian?.passport_number ||
            studentData.guardian?.other_datas?.passport_number ||
            "",
          work_phone: studentData.guardian?.work_phone || "",
          home_phone:
            studentData.guardian?.home_phone ||
            studentData.guardian?.other_datas?.home_phone ||
            "",
          mobile:
            studentData.guardian?.phone2 || studentData.guardian?.mobile || "",
          occupation: studentData.guardian?.occupation || "",
          workplace: studentData.guardian?.workplace || "",
          id_document: studentData.guardian?.id_document || "",
        },
        student_documents: documents.map((doc: any) => ({
          id: doc.id,
          document_type: doc.document_type,
          file_url: doc.file || doc.file_url,
          description:
            doc.description || (doc.file ? doc.file.split("/").pop() : ""),
        })),
        status: (studentData.is_verified_registration_officer
          ? "verified"
          : "pending") as "pending" | "verified" | "rejected",
        financial_agreement: studentData.financial_agreement || [],
        payment_history: studentData.payment_history || [],
        promotion_history: studentData.promotion_history || [],
      };

      console.log("Mapped Student:", mappedStudent);
      setStudent(mappedStudent);

      // Filter sections for the current department
      if (mappedStudent.admission_class.id) {
        const sectionsForDepartment = allSections.filter(
          (section) => section.department === mappedStudent.admission_class.id
        );
        setFilteredSections(sectionsForDepartment);
      }
    } catch (error) {
      console.error("Error fetching student:", error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to load student data',
        icon: 'error',
        timer: 5000,
        timerProgressBar: true,
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDepartments();
    fetchSections();
  }, []);

  useEffect(() => {
    if (id) {
      fetchStudent();
    } else {
      setLoading(false);
    }
  }, [id]);

  // Filter sections when department changes
  useEffect(() => {
    if (student && student.admission_class.id) {
      const sectionsForDepartment = allSections.filter(
        (section) => section.department === student.admission_class.id
      );
      setFilteredSections(sectionsForDepartment);
    }
  }, [student?.admission_class.id, allSections]);



  const handleDepartmentChange = (departmentId: string) => {
    if (!student) return;
    setStudent({
      ...student,
      admission_class: {
        id: departmentId,
        department_name:
          departments.find((d) => d.id === departmentId)?.department_name || "",
      },
      section: { id: "", name: "" },
    });

    const sectionsForDepartment = allSections.filter(
      (section) => section.department === departmentId
    );
    setFilteredSections(sectionsForDepartment);
  };

  const handleChange = (field: keyof Student, value: any) => {
    if (!student) return;
    
    // Add validation for image fields
    if ((field === "photo" || field === "house_photo") && value instanceof File) {
      if (!value.type.startsWith('image/')) {
        setFieldErrors(prev => ({ ...prev, [field]: "Please upload a valid image file (JPG, PNG, etc.)" }));
        return;
      }
    }
    
    setFieldErrors(prev => ({ ...prev, [field]: "" }));
    setStudent({ ...student, [field]: value });
  };

  const handleGuardianChange = (
    field: keyof Student["guardian"],
    value: any
  ) => {
    if (!student) return;
    setStudent({
      ...student,
      guardian: {
        ...student.guardian,
        [field]: value,
      },
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && student) {
      // Add validation
      if (!file.type.startsWith('image/')) {
        setFieldErrors(prev => ({ ...prev, photo: "Please upload a valid image file (JPG, PNG, etc.)" }));
        return;
      }
      setFieldErrors(prev => ({ ...prev, photo: "" }));
      // Create local URL for preview
      const previewUrl = URL.createObjectURL(file);
      setStudent({
        ...student,
        photo_url: previewUrl,
        photo: file
      });
    }
  };

  const handleSave = async () => {
    if (!student) return;

    try {
      const token = localStorage.getItem("accessToken");

      // Prepare student data matching registration form structure
      const requestBody = {
        student: {
          admission_number: student.admission_number,
          en_first_name: student.en_first_name,
          en_middle_name: student.en_middle_name,
          en_last_name: student.en_last_name,
          ar_first_name: student.ar_first_name,
          ar_middle_name: student.ar_middle_name,
          ar_last_name: student.ar_last_name,
          en_father_name: student.en_father_name,
          ar_father_name: student.ar_father_name,
          en_grandfather_name: student.en_grandfather_name,
          ar_grandfather_name: student.ar_grandfather_name,
          en_tribe_name: student.en_tribe_name,
          ar_tribe_name: student.ar_tribe_name,
          email: student.email,
          phone: student.phone,
          date_of_birth: student.date_of_birth,
          age_years: calculateAge(student.date_of_birth),
          gender: student.gender, // Keep as M/F
          religion: student.religion,
          nationality: student.nationality,
          address: student.address,
          city: student.city,
          state: student.state,
          postal_code: student.postal_code,
          country: student.country,
          governance: student.governance,
          neighborhood: student.neighborhood,
          street_number: student.street_number,
          house_number: student.house_number,
          staying_with: student.staying_with,
          home_contact: student.home_contact,
          emergency_contact: student.emergency_contact,
          google_map_location_url: student.google_map_location_url,
          admission_class: student.admission_class.id,
          section: student.section.id,
          admission_date: student.admission_date,
          previous_school: student.previous_school,
          has_special_needs: student.has_special_needs,
          special_needs_details: student.special_needs_details,
          is_promoted: student.is_promoted,
          is_active: student.is_active,
          is_verified_registration_officer:
            student.is_verified_registration_officer,
          other_datas: {
            ...(student.other_datas || {}),
            email: student.email,
            phone: student.phone,
            admission_date: student.admission_date,
            address: student.address,
            city: student.city,
            postal_code: student.postal_code,
            country: student.country,
          },
        },
        guardian: {
          id: student.guardian.id,
          name_en: student.guardian.name_en,
          name_ar: student.guardian.name_ar,
          phone1: student.guardian.phone, // Map phone to phone1
          phone2: student.guardian.mobile, // Map mobile to phone2
          email: student.guardian.email,
          address: student.guardian.address,
          relationship: student.guardian.relationship,
          work_phone: student.guardian.work_phone,
          occupation: student.guardian.occupation,
          workplace: student.guardian.workplace,
          other_datas: {
            ...(student.guardian.other_datas || {}),
            national_id: student.guardian.national_id,
            passport_number: student.guardian.passport_number,
            home_phone: student.guardian.home_phone,
          },
        },
      };

      // Prepare document metadata matching registration form structure
      const form = new FormData();
      const documentMetadata = [];
      student.student_documents?.forEach((doc, i) => {
        const meta: any = {
          document_type: doc.document_type,
          document_name: doc.document_name,
          description: doc.description,
        };
        if (doc.id && /^[0-9a-fA-F-]{36}$/.test(doc.id)) {
          // Only include id if it's a real UUID
          meta.id = doc.id;
        }
        if ("file" in doc && doc.file instanceof File) {
          meta.file_field = `document_file_${i}`;
          form.append(`document_file_${i}`, doc.file);
        }
        documentMetadata.push(meta);
      });

      const studentData = requestBody.student;
      const guardianData = requestBody.guardian;

      if (student.photo instanceof File) {
        form.append("student_photo", student.photo);
      } else if (student.photo === null) {
        studentData.photo = null;
      }

      if (student.passport_copy instanceof File) {
        form.append("student_passport", student.passport_copy);
      } else if (student.passport_copy === null) {
        studentData.passport_copy = null;
      }

      if (student.house_photo instanceof File) {
        form.append("student_house_photo", student.house_photo);
      } else if (student.house_photo === null) {
        studentData.house_photo = null;
      }

      if (student.google_map_location_photo instanceof File) {
        form.append("student_google_map_photo", student.google_map_location_photo);
      } else if (student.google_map_location_photo === null) {
        studentData.google_map_location_photo = null;
      }

      if (student.guardian.id_document instanceof File) {
        form.append("guardian_id_document", student.guardian.id_document);
      } else if (student.guardian.id_document === null) {
        guardianData.id_document = null;
      }

      form.append("guardian", JSON.stringify(guardianData));
      form.append("student", JSON.stringify(studentData));
      form.append("student_documents", JSON.stringify(documentMetadata));

      console.log("Sending payload:", {
        student: requestBody.student,
        guardian: requestBody.guardian,
        student_documents: documentMetadata,
      });

      const res = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/students/student-with-guardian/edit/${student.id}/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: form,
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        console.error("API Error Response:", errorData);
        throw new Error(
          errorData.errors || errorData.message || "Failed to save data"
        );
      }

      const result = await res.json();
      setIsEditing(false);
      setFieldErrors({});
      Swal.fire({
        title: 'Success!',
        text: 'Student updated successfully',
        icon: 'success',
        timer: 5000,
        timerProgressBar: true,
        confirmButtonText: 'OK'
      });

      // Refresh data
      fetchStudent();
    } catch (err) {
      console.error("Update error:", err);
      Swal.fire({
        title: 'Error!',
        text: err instanceof Error ? err.message : "Update failed",
        icon: 'error',
        timer: 5000,
        timerProgressBar: true,
        confirmButtonText: 'OK'
      });
    }
  };

  const handleAddDocument = () => {
    if (!student || !newDocumentType || !newDocumentFile) {
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

    // Add validation for photo documents
    if (newDocumentType === "PHOTO" && !newDocumentFile.type.startsWith('image/')) {
      Swal.fire({
        title: 'Error!',
        text: 'Please upload a valid image file for Photograph document type',
        icon: 'error',
        timer: 5000,
        timerProgressBar: true,
        confirmButtonText: 'OK'
      });
      return;
    }

    setStudent({
      ...student,
      student_documents: [
        ...(student.student_documents || []),
        {
          id: `temp-${Date.now()}`,
          document_type: newDocumentType,
          document_name: newDocumentType === "OTHER" ? newDocumentName : "",
          file: newDocumentFile,
          file_url: URL.createObjectURL(newDocumentFile),
          description: newDocumentType === "OTHER" ? newDocumentName : (DOCUMENT_TYPES.find(t => t.value === newDocumentType)?.label.split(" |")[0] || newDocumentFile.name),
        },
      ],
    });

    setNewDocumentType("");
    setNewDocumentName("");
    setNewDocumentFile(null);
    Swal.fire({
      title: 'Success!',
      text: 'Document added',
      icon: 'success',
      timer: 5000,
      timerProgressBar: true,
      confirmButtonText: 'OK'
    });
  };

  // Using the centralized getFullUrl from utils/fileUtils (already imported)
  const getFullUrlLocal = (fileUrl: any) => {
    return getFullUrl(fileUrl);
  };




  const handleViewDocument = (fileUrl: string) => {
    const fullUrl = getFullUrl(fileUrl);
    window.open(fullUrl, "_blank");
  };

  const handlePrintDocument = (fileUrl: string) => {
    const fullUrl = getFullUrl(fileUrl);
    
    // If it's a PDF, browsers handle printing better if opened directly
    if (fullUrl.toLowerCase().endsWith('.pdf') || fullUrl.startsWith('blob:')) {
      const printWindow = window.open(fullUrl, '_blank');
      if (printWindow) {
        printWindow.addEventListener('load', () => {
          printWindow.print();
        });
      }
      return;
    }

    // Fallback for Images (fetch + iframe)
    Swal.fire({
      title: 'Preparing document...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    fetch(fullUrl)
      .then(res => {
        if (!res.ok) throw new Error("CORS or network error");
        return res.blob();
      })
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        iframe.src = url;
        document.body.appendChild(iframe);
        iframe.onload = () => {
          iframe.contentWindow?.print();
          Swal.close();
          // Cleanup
          setTimeout(() => {
            document.body.removeChild(iframe);
            URL.revokeObjectURL(url);
          }, 2000);
        };
      })
      .catch(() => {
        // Final fallback: open in new tab
        window.open(fullUrl, "_blank");
        Swal.close();
        Swal.fire({
          title: 'Info',
          text: 'Browser blocked automated print, opening file directly.',
          icon: 'info',
          timer: 5000,
          timerProgressBar: true,
          confirmButtonText: 'OK'
        });
      });
  };

  const handleDownloadDocument = (fileUrl: string, fileName: string) => {
    const fullUrl = getFullUrl(fileUrl);
    
    if (fullUrl.startsWith('blob:')) {
      const a = document.createElement("a");
      a.href = fullUrl;
      a.download = fileName || "document";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    // Use fetch for server files to ensure download attribute is respected
    fetch(fullUrl)
      .then(res => res.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName || "document";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      })
      .catch(() => {
        window.open(fullUrl, "_blank");
      });
  };

  const handleViewApplication = async () => {
    if (!id) return;
    Swal.fire({
      title: 'Preparing PDF view...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/students/students/${id}/download-application/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch application");

      const blob = await response.blob();
      const pdfUrl = URL.createObjectURL(blob);
      window.open(pdfUrl, "_blank");
      Swal.close();
    } catch (err) {
      console.error("View PDF failed:", err);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to view PDF',
        icon: 'error',
        timer: 5000,
        timerProgressBar: true,
        confirmButtonText: 'OK'
      });
    }
  };

  const handleDownloadApplication = async () => {
    if (!id) return;
    setIsDownloading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/students/students/${id}/download-application/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to download application");

      const contentDisposition = response.headers.get("content-disposition");
      let filename = "student_application.pdf";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch?.[1]) filename = filenameMatch[1];
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to download application',
        icon: 'error',
        timer: 5000,
        timerProgressBar: true,
        confirmButtonText: 'OK'
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const removeDocument = (index: number) => {
    if (!student) return;
    const updatedDocs = [...(student.student_documents || [])];
    updatedDocs.splice(index, 1);
    setStudent({
      ...student,
      student_documents: updatedDocs,
    });
  };

  const handleDeleteFile = async (field: keyof Student | "id_document") => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This file will be removed. You need to save to apply changes.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      if (field === "id_document") {
        setStudent({
          ...student!,
          guardian: {
            ...student!.guardian,
            id_document: null as any,
          },
        });
      } else {
        const urlField = `${String(field)}_url` as keyof Student;
        setStudent({
          ...student!,
          [field]: null,
          [urlField]: null,
        });
      }
      Swal.fire({
        title: 'Success!',
        text: "File marked for deletion. Don't forget to save.",
        icon: 'success',
        timer: 5000,
        timerProgressBar: true,
        confirmButtonText: 'OK'
      });
    }
  };

  async function replaceDocumentFile(
    docId: string,
    newFile: File,
    description: string,
    token: string,
    API_BASE_URL: string
  ) {
    const form = new FormData();
    form.append("file", newFile);
    form.append("description", description);
    const res = await fetch(
      `${API_BASE_URL}/students/student-document/${docId}/`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      }
    );
    if (!res.ok) throw new Error("Failed to replace document");
    return res.json();
  }

  // Delete document
  async function deleteDocument(
    docId: string,
    token: string,
    API_BASE_URL: string
  ) {
    const res = await fetch(
      `${API_BASE_URL}/students/student-document/${docId}/`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!res.ok) throw new Error("Failed to delete document");
    return true;
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  if (!student) {
    return <div className="flex justify-center p-8">Student not found</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Student Details</h1>
        <div className="flex gap-2">
          {isEditing ? (
            <Button
              variant="ghost"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-2"
              onClick={() => {
                setIsEditing(false);
                setFieldErrors({});
                fetchStudent(); // Revert any unsaved changes
              }}
            >
              Cancel | إلغاء
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
            >
              <PencilIcon className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleViewApplication}
            disabled={isDownloading}
            className="gap-2"
          >
            <EyeIcon className="w-4 h-4" />
            View PDF
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadApplication}
            disabled={isDownloading}
          >
            <DownloadIcon className="w-4 h-4 mr-2" />
            {isDownloading ? "Downloading..." : "Download Application"}
          </Button>

          <Button variant="outline" onClick={() => navigate("/dashboard/registration?tab=search")}>
            Back
          </Button>
        </div>
      </div>

      {/* Personal Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6 mb-8 pb-8 border-b border-gray-100">
            {/* Student Photo */}
            <div className="shrink-0">
              <div className="relative group">
                {student.photo_url ? (
                  <div className="relative group/student-photo">
                    <img
                      src={getFullUrl(student.photo_url)}
                      alt="Student"
                      className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-xl border-2 border-primary/10 shadow-md group-hover/student-photo:border-primary/30 transition-all duration-300"
                    />
                    
                    {/* Action Bar Overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center gap-2 rounded-b-xl opacity-0 group-hover/student-photo:opacity-100 transition-opacity duration-300">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 w-8 p-0 bg-white/20 hover:bg-white/40 border-none text-white rounded-full backdrop-blur-md transition-all shadow-sm"
                        onClick={() => handleViewDocument(student.photo_url!)}
                        title="View Full | عرض"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      
                      {isEditing && (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-8 w-8 p-0 bg-white/20 hover:bg-white/40 border-none text-white rounded-full backdrop-blur-md transition-all shadow-sm"
                            onClick={() => {
                              const input = document.getElementById("student-photo-input");
                              input?.click();
                            }}
                            title="Update | تحديث"
                          >
                            <Camera className="h-4 w-4" />
                          </Button>
                          <input
                            id="student-photo-input"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handlePhotoChange}
                          />
                        </>
                      )}
                    </div>

                    {isEditing && (student.photo_url || student.photo) && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover/student-photo:opacity-100 transition-opacity rounded-full shadow-lg border-2 border-white"
                        onClick={() => handleDeleteFile("photo")}
                        title="Delete | حذف"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="w-32 h-32 md:w-40 md:h-40 bg-gray-50 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 group/empty-photo relative">
                    <User className="w-16 h-16 text-gray-300" />
                    <span className="text-[10px] text-gray-400 mt-2">No Photo | لا توجد صورة</span>
                    
                    {isEditing && (
                      <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/5 opacity-0 group-hover/empty-photo:opacity-100 transition-opacity rounded-xl">
                        <Camera className="w-8 h-8 text-primary" />
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handlePhotoChange}
                        />
                      </label>
                    )}
                  </div>
                )}

                {/* Field Errors */}
                {isEditing && fieldErrors.photo && (
                  <div className="absolute -bottom-8 left-0 right-0 bg-red-50 text-red-600 text-[10px] md:text-xs font-semibold py-1 px-2 rounded border border-red-100 z-20">
                    {fieldErrors.photo}
                  </div>
                )}
              </div>
            </div>

            {/* Basic Info Overview (Next to photo) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow content-start">
              <div className="space-y-1">
                <Label>Admission Number</Label>
                <p>
                  <strong style={{ color: "rgb(102 42 20)" }}>
                    {student.admission_number}
                  </strong>
                </p>
              </div>
              {/* English Name */}
              <div className="space-y-1">
                <Label>First Name (English)</Label>
                {isEditing ? (
                  <Input
                    value={student.en_first_name}
                    onChange={(e) => handleChange("en_first_name", e.target.value)}
                  />
                ) : (
                  <p>{student.en_first_name}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Middle Name (English)</Label>
                {isEditing ? (
                  <Input
                    value={student.en_middle_name}
                    onChange={(e) => handleChange("en_middle_name", e.target.value)}
                  />
                ) : (
                  <p>{student.en_middle_name || "-"}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Last Name (English)</Label>
                {isEditing ? (
                  <Input
                    value={student.en_last_name}
                    onChange={(e) => handleChange("en_last_name", e.target.value)}
                  />
                ) : (
                  <p>{student.en_last_name}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Father Name (English)</Label>
                {isEditing ? (
                  <Input
                    value={student.en_father_name}
                    onChange={(e) => handleChange("en_father_name", e.target.value)}
                  />
                ) : (
                  <p>{student.en_father_name || "-"}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Grandfather Name (English)</Label>
                {isEditing ? (
                  <Input
                    value={student.en_grandfather_name}
                    onChange={(e) => handleChange("en_grandfather_name", e.target.value)}
                  />
                ) : (
                  <p>{student.en_grandfather_name || "-"}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Tribe Name (English)</Label>
                {isEditing ? (
                  <Input
                    value={student.en_tribe_name}
                    onChange={(e) => handleChange("en_tribe_name", e.target.value)}
                  />
                ) : (
                  <p>{student.en_tribe_name || "-"}</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Arabic Name */}
          <div className="space-y-1">
            <Label>First Name (Arabic)</Label>
            {isEditing ? (
              <Input
                value={student.ar_first_name}
                onChange={(e) => handleChange("ar_first_name", e.target.value)}
                dir="rtl"
              />
            ) : (
              <p dir="rtl">{student.ar_first_name}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Middle Name (Arabic)</Label>
            {isEditing ? (
              <Input
                value={student.ar_middle_name}
                onChange={(e) => handleChange("ar_middle_name", e.target.value)}
                dir="rtl"
              />
            ) : (
              <p dir="rtl">{student.ar_middle_name || "-"}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Last Name (Arabic)</Label>
            {isEditing ? (
              <Input
                value={student.ar_last_name}
                onChange={(e) => handleChange("ar_last_name", e.target.value)}
                dir="rtl"
              />
            ) : (
              <p dir="rtl">{student.ar_last_name}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Father Name (Arabic)</Label>
            {isEditing ? (
              <Input
                value={student.ar_father_name}
                onChange={(e) => handleChange("ar_father_name", e.target.value)}
                dir="rtl"
              />
            ) : (
              <p dir="rtl">{student.ar_father_name || "-"}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Grandfather Name (Arabic)</Label>
            {isEditing ? (
              <Input
                value={student.ar_grandfather_name}
                onChange={(e) => handleChange("ar_grandfather_name", e.target.value)}
                dir="rtl"
              />
            ) : (
              <p dir="rtl">{student.ar_grandfather_name || "-"}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Tribe Name (Arabic)</Label>
            {isEditing ? (
              <Input
                value={student.ar_tribe_name}
                onChange={(e) => handleChange("ar_tribe_name", e.target.value)}
                dir="rtl"
              />
            ) : (
              <p dir="rtl">{student.ar_tribe_name || "-"}</p>
            )}
          </div>

          {/* Admission Info */}

          <div className="space-y-1">
            <Label>Admission Date</Label>
            {isEditing ? (
              <Input
                type="date"
                value={student.admission_date}
                onChange={(e) => handleChange("admission_date", e.target.value)}
              />
            ) : (
              <p>{student.admission_date || "-"}</p>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-1">
            <Label>Email</Label>
            {isEditing ? (
              <Input
                type="email"
                value={student.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            ) : (
              <p>{student.email || "-"}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Phone</Label>
            {isEditing ? (
              <PhoneInput
                defaultCountry={"om"}
                value={student.phone}
                onChange={(phone) => handleChange("phone", phone)}
                inputStyle={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: "0.375rem",
                }}
              />
            ) : (
              <p>{student.phone || "-"}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Staying With</Label>
            {isEditing ? (
              <Input
                value={student.staying_with}
                onChange={(e) => handleChange("staying_with", e.target.value)}
              />
            ) : (
              <p>{student.staying_with || "-"}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Home Contact</Label>
            {isEditing ? (
              <Input
                value={student.home_contact}
                onChange={(e) => handleChange("home_contact", e.target.value)}
              />
            ) : (
              <p>{student.home_contact || "-"}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Emergency Contact</Label>
            {isEditing ? (
              <Input
                value={student.emergency_contact}
                onChange={(e) => handleChange("emergency_contact", e.target.value)}
              />
            ) : (
              <p>{student.emergency_contact || "-"}</p>
            )}
          </div>

          {/* Personal Details */}
          <div className="space-y-1">
            <Label>Date of Birth</Label>
            {isEditing ? (
              <Input
                type="date"
                value={student.date_of_birth}
                onChange={(e) => handleChange("date_of_birth", e.target.value)}
              />
            ) : (
              <p>{student.date_of_birth}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Age</Label>
            <p>{calculateAge(student.date_of_birth)} years</p>
          </div>

          <div className="space-y-1">
            <Label>Gender</Label>
            {isEditing ? (
              <Select
                value={student.gender}
                onValueChange={(value) => handleChange("gender", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {GENDER_OPTIONS.map((gender) => (
                    <SelectItem key={gender.value} value={gender.value}>
                      {gender.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p>
                {GENDER_OPTIONS.find(
                  (g) => g.value === student.gender
                )?.label.split(" |")[0] || student.gender}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Religion</Label>
            {isEditing ? (
              <div className="space-y-2">
                <Select
                  value={RELIGION_OPTIONS.some(opt => opt.value === student.religion) ? student.religion : "other"}
                  onValueChange={(value) => {
                    if (value === "other") {
                      handleChange("religion", "Other");
                    } else {
                      handleChange("religion", value);
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select religion" />
                  </SelectTrigger>
                  <SelectContent>
                    {RELIGION_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(!RELIGION_OPTIONS.some(opt => opt.value === student.religion) || student.religion === "Other" || student.religion === "other") && (
                  <Input
                    placeholder="Enter custom religion"
                    value={student.religion === "other" || student.religion === "Other" ? "" : student.religion}
                    onChange={(e) => handleChange("religion", e.target.value)}
                    className="mt-2 animate-in fade-in slide-in-from-top-1 duration-200"
                  />
                )}
              </div>
            ) : (
              <p>{student.religion || "-"}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Nationality</Label>
            {isEditing ? (
              <Select
                value={student.nationality}
                onValueChange={(value) => handleChange("nationality", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select nationality" />
                </SelectTrigger>
                <SelectContent>
                  {countryList.map((country) => (
                    <SelectItem key={country.code} value={country.name}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p>{student.nationality || "-"}</p>
            )}
          </div>

          {/* Address Info */}
          <div className="space-y-1">
            <Label>Address</Label>
            {isEditing ? (
              <Input
                value={student.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            ) : (
              <p>{student.address || "-"}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>City</Label>
            {isEditing ? (
              <Input
                value={student.city}
                onChange={(e) => handleChange("city", e.target.value)}
              />
            ) : (
              <p>{student.city || "-"}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>State</Label>
            {isEditing ? (
              <Input
                value={student.state}
                onChange={(e) => handleChange("state", e.target.value)}
              />
            ) : (
              <p>{student.state || "-"}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Postal Code</Label>
            {isEditing ? (
              <Input
                value={student.postal_code}
                onChange={(e) => handleChange("postal_code", e.target.value)}
              />
            ) : (
              <p>{student.postal_code || "-"}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Country</Label>
            {isEditing ? (
              <Select
                value={student.country}
                onValueChange={(value) => handleChange("country", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countryList.map((country) => (
                    <SelectItem key={country.code} value={country.name}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p>{student.country || "-"}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Governance</Label>
            {isEditing ? (
              <Input
                value={student.governance}
                onChange={(e) => handleChange("governance", e.target.value)}
              />
            ) : (
              <p>{student.governance || "-"}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Neighborhood</Label>
            {isEditing ? (
              <Input
                value={student.neighborhood}
                onChange={(e) => handleChange("neighborhood", e.target.value)}
              />
            ) : (
              <p>{student.neighborhood || "-"}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Street Number</Label>
            {isEditing ? (
              <Input
                value={student.street_number}
                onChange={(e) => handleChange("street_number", e.target.value)}
              />
            ) : (
              <p>{student.street_number || "-"}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>House Number</Label>
            {isEditing ? (
              <Input
                value={student.house_number}
                onChange={(e) => handleChange("house_number", e.target.value)}
              />
            ) : (
              <p>{student.house_number || "-"}</p>
            )}
          </div>

          <div className="md:col-span-2 space-y-1">
            <Label>Google Maps URL</Label>
            {isEditing ? (
              <Input
                value={student.google_map_location_url}
                onChange={(e) => handleChange("google_map_location_url", e.target.value)}
                placeholder="https://maps.google.com/..."
              />
            ) : (
              <p className="truncate">
                {student.google_map_location_url ? (
                  <a href={student.google_map_location_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {student.google_map_location_url}
                  </a>
                ) : "-"}
              </p>
            )}
          </div>

          {/* New Document Fields for Student */}
          <div className="space-y-1">
            <Label>Passport Copy | نسخة الجواز</Label>
            <div className="flex items-center gap-2">
              {(student.passport_copy_url || student.passport_copy) ? (
                <div className="flex items-center gap-1 group/actions">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-blue-600 p-0 px-2 hover:bg-blue-50"
                    onClick={() => handleViewDocument(student.passport_copy ? URL.createObjectURL(student.passport_copy) : student.passport_copy_url!)}
                    title="View"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-gray-600 p-0 px-2 hover:bg-gray-50"
                    onClick={() => handlePrintDocument(student.passport_copy ? URL.createObjectURL(student.passport_copy) : student.passport_copy_url!)}
                    title="Print"
                  >
                    <PrinterIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-gray-600 p-0 px-2 hover:bg-gray-50"
                    onClick={() => handleDownloadDocument(student.passport_copy ? URL.createObjectURL(student.passport_copy) : student.passport_copy_url!, "Passport_Copy")}
                    title="Download"
                  >
                    <DownloadIcon className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <p className="text-gray-400">Not uploaded</p>
              )}
              {isEditing && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-amber-600"
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = ".pdf,image/*";
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) handleChange("passport_copy", file);
                      };
                      input.click();
                    }}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  {(student.passport_copy_url || student.passport_copy) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteFile("passport_copy")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1 relative">
            <Label>House Photo | صورة المنزل</Label>
            {fieldErrors.house_photo && (
              <p className="text-xs text-red-600 font-semibold animate-in fade-in slide-in-from-top-1 duration-200 py-1">
                Required: Image Only | مطلوب: صورة فقط
              </p>
            )}
            <div className="flex items-center gap-2">
              {(student.house_photo_url || student.house_photo) ? (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-blue-600 p-0 px-2 hover:bg-blue-50"
                    onClick={() => handleViewDocument(student.house_photo ? URL.createObjectURL(student.house_photo) : student.house_photo_url!)}
                    title="View"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-gray-600 p-0 px-2 hover:bg-gray-50"
                    onClick={() => handlePrintDocument(student.house_photo ? URL.createObjectURL(student.house_photo) : student.house_photo_url!)}
                    title="Print"
                  >
                    <PrinterIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-gray-600 p-0 px-2 hover:bg-gray-50"
                    onClick={() => handleDownloadDocument(student.house_photo ? URL.createObjectURL(student.house_photo) : student.house_photo_url!, "House_Photo")}
                    title="Download"
                  >
                    <DownloadIcon className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <p className="text-gray-400">Not uploaded</p>
              )}
              {isEditing && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-amber-600"
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) handleChange("house_photo", file);
                      };
                      input.click();
                    }}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  {(student.house_photo_url || student.house_photo) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteFile("house_photo")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label>Location Map Photo | خريطة الموقع</Label>
            <div className="flex items-center gap-2">
              {(student.google_map_location_photo_url || student.google_map_location_photo) ? (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-blue-600 p-0 px-2 hover:bg-blue-50"
                    onClick={() => handleViewDocument(student.google_map_location_photo ? URL.createObjectURL(student.google_map_location_photo) : student.google_map_location_photo_url!)}
                    title="View"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-gray-600 p-0 px-2 hover:bg-gray-50"
                    onClick={() => handlePrintDocument(student.google_map_location_photo ? URL.createObjectURL(student.google_map_location_photo) : student.google_map_location_photo_url!)}
                    title="Print"
                  >
                    <PrinterIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-gray-600 p-0 px-2 hover:bg-gray-50"
                    onClick={() => handleDownloadDocument(student.google_map_location_photo ? URL.createObjectURL(student.google_map_location_photo) : student.google_map_location_photo_url!, "Location_Map")}
                    title="Download"
                  >
                    <DownloadIcon className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <p className="text-gray-400">Not uploaded</p>
              )}
              {isEditing && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-amber-600"
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = ".pdf,image/*";
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) handleChange("google_map_location_photo", file);
                      };
                      input.click();
                    }}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  {(student.google_map_location_photo_url || student.google_map_location_photo) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteFile("google_map_location_photo")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* School Info */}
          <div className="space-y-1">
            <Label>Current Class</Label>
            {isEditing ? (
              <Select
                value={student.admission_class.id}
                onValueChange={handleDepartmentChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.department_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p>{student.admission_class.department_name}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Section</Label>
            {isEditing ? (
              <Select
                value={student.section.id}
                onValueChange={(value) =>
                  handleChange("section", {
                    id: value,
                    name:
                      filteredSections.find((s) => s.id === value)?.name || "",
                  })
                }
                disabled={!student.admission_class.id}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !student.admission_class.id
                        ? "Select department first"
                        : "Select section"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredSections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p>{student.section.name}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Previous School</Label>
            {isEditing ? (
              <Input
                value={student.previous_school}
                onChange={(e) =>
                  handleChange("previous_school", e.target.value)
                }
              />
            ) : (
              <p>{student.previous_school || "-"}</p>
            )}
          </div>

          {/* Special Needs */}
          <div className="space-y-1">
            <Label>Has Special Needs</Label>
            {isEditing ? (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="has_special_needs"
                  checked={student.has_special_needs}
                  onChange={(e) =>
                    handleChange("has_special_needs", e.target.checked)
                  }
                />
                <Label htmlFor="has_special_needs">Yes</Label>
              </div>
            ) : (
              <p>{student.has_special_needs ? "Yes" : "No"}</p>
            )}
          </div>

          {student.has_special_needs && (
            <div className="space-y-1">
              <Label>Special Needs Details</Label>
              {isEditing ? (
                <Input
                  value={student.special_needs_details}
                  onChange={(e) =>
                    handleChange("special_needs_details", e.target.value)
                  }
                />
              ) : (
                <p>{student.special_needs_details || "-"}</p>
              )}
            </div>
          )}

          {/* Status */}
          <div className="space-y-1">
            <Label>Registration Status</Label>
            <p className="capitalize">{student.status}</p>
          </div>

          <div className="space-y-1">
            <Label>Is Active</Label>
            <p>{student.is_active ? "Yes" : "No"}</p>
          </div>

          <div className="space-y-1">
            <Label>Is Verified</Label>
            <p>{student.is_verified_registration_officer ? "Yes" : "No"}</p>
          </div>
        </div>
      </CardContent>
    </Card>

      {/* Guardian Information Card */}
      {(() => {
        const rel = student.guardian.relationship?.toLowerCase() as keyof typeof RELATIONSHIP_CONFIG;
        const config = RELATIONSHIP_CONFIG[rel] || RELATIONSHIP_CONFIG.relative;
        
        return (
          <Card className={`border-2 ${config.border} shadow-md overflow-hidden transition-all duration-300`}>
            <CardHeader className={`${config.bg} border-b ${config.border} py-4`}>
              <CardTitle className={`flex items-center gap-3 ${config.textColor} text-xl font-bold`}>
                <div className={`${config.iconBg} p-2 rounded-lg shadow-lg text-white`}>
                  <User className="h-5 w-5" />
                </div>
                {config.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          <div className="space-y-1">
            <Label>Name (English)</Label>
            {isEditing ? (
              <Input
                value={student.guardian.name_en}
                onChange={(e) =>
                  handleGuardianChange("name_en", e.target.value)
                }
              />
            ) : (
              <p>{student.guardian.name_en || "-"}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Name (Arabic)</Label>
            {isEditing ? (
              <Input
                value={student.guardian.name_ar}
                onChange={(e) =>
                  handleGuardianChange("name_ar", e.target.value)
                }
                dir="rtl"
              />
            ) : (
              <p dir="rtl">{student.guardian.name_ar || "-"}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Relationship</Label>
            {isEditing ? (
              <Select
                value={student.guardian.relationship}
                onValueChange={(value) =>
                  handleGuardianChange("relationship", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIP_OPTIONS.map((relation) => (
                    <SelectItem key={relation.value} value={relation.value}>
                      {relation.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p>
                {RELATIONSHIP_OPTIONS.find(
                  (r) => r.value === student.guardian.relationship
                )
                  ?.label.split(" |")[0]
                  .trim() ||
                  student.guardian.relationship ||
                  "-"}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Phone</Label>
            {isEditing ? (
              <PhoneInput
                defaultCountry={"om"}
                value={student.guardian.phone}
                onChange={(phone) => handleGuardianChange("phone", phone)}
                inputStyle={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: "0.375rem",
                }}
              />
            ) : (
              <p>{student.guardian.phone || "-"}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Email</Label>
            {isEditing ? (
              <Input
                type="email"
                value={student.guardian.email}
                onChange={(e) => handleGuardianChange("email", e.target.value)}
              />
            ) : (
              <p>{student.guardian.email || "-"}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Mobile</Label>
            {isEditing ? (
              <PhoneInput
                defaultCountry={"om"}
                value={student.guardian.mobile}
                onChange={(mobile) => handleGuardianChange("mobile", mobile)}
                inputStyle={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: "0.375rem",
                }}
              />
            ) : (
              <p>{student.guardian.mobile || "-"}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Work Phone</Label>
            {isEditing ? (
              <PhoneInput
                defaultCountry={"om"}
                value={student.guardian.work_phone}
                onChange={(work_phone) =>
                  handleGuardianChange("work_phone", work_phone)
                }
                inputStyle={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: "0.375rem",
                }}
              />
            ) : (
              <p>{student.guardian.work_phone || "-"}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Home Phone</Label>
            {isEditing ? (
              <PhoneInput
                defaultCountry={"om"}
                value={student.guardian.home_phone}
                onChange={(home_phone) =>
                  handleGuardianChange("home_phone", home_phone)
                }
                inputStyle={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: "0.375rem",
                }}
              />
            ) : (
              <p>{student.guardian.home_phone || "-"}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Occupation</Label>
            {isEditing ? (
              <Input
                value={student.guardian.occupation}
                onChange={(e) =>
                  handleGuardianChange("occupation", e.target.value)
                }
              />
            ) : (
              <p>{student.guardian.occupation || "-"}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Workplace</Label>
            {isEditing ? (
              <Input
                value={student.guardian.workplace}
                onChange={(e) =>
                  handleGuardianChange("workplace", e.target.value)
                }
              />
            ) : (
              <p>{student.guardian.workplace || "-"}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>National ID</Label>
            {isEditing ? (
              <Input
                value={student.guardian.national_id}
                onChange={(e) =>
                  handleGuardianChange("national_id", e.target.value)
                }
              />
            ) : (
              <p>{student.guardian.national_id || "-"}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Passport Number</Label>
            {isEditing ? (
              <Input
                value={student.guardian.passport_number}
                onChange={(e) =>
                  handleGuardianChange("passport_number", e.target.value)
                }
              />
            ) : (
              <p>{student.guardian.passport_number || "-"}</p>
            )}
          </div>

          <div className="md:col-span-2 space-y-1">
            <Label>Address</Label>
            {isEditing ? (
              <Input
                value={student.guardian.address}
                onChange={(e) =>
                  handleGuardianChange("address", e.target.value)
                }
              />
            ) : (
              <p>{student.guardian.address || "-"}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>ID Document | وثيقة الهوية</Label>
            <div className="flex items-center gap-1">
              {student.guardian.id_document ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-blue-600 p-0 px-2 hover:bg-blue-50"
                    onClick={() => handleViewDocument(student.guardian.id_document instanceof File ? URL.createObjectURL(student.guardian.id_document) : student.guardian.id_document)}
                    title="View"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-gray-600 p-0 px-2 hover:bg-gray-50"
                    onClick={() => handlePrintDocument(student.guardian.id_document instanceof File ? URL.createObjectURL(student.guardian.id_document) : student.guardian.id_document)}
                    title="Print"
                  >
                    <PrinterIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-gray-600 p-0 px-2 hover:bg-gray-50"
                    onClick={() => handleDownloadDocument(student.guardian.id_document instanceof File ? URL.createObjectURL(student.guardian.id_document) : student.guardian.id_document, "Guardian_ID")}
                    title="Download"
                  >
                    <DownloadIcon className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <p className="text-gray-400">Not uploaded</p>
              )}
              {isEditing && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-amber-600"
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = ".pdf,image/*";
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) handleGuardianChange("id_document" as any, file);
                      };
                      input.click();
                    }}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  {student.guardian.id_document && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteFile("id_document")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      );
      })()}

      {/* Documents Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <FileIcon className="h-5 w-5 text-primary" />
            Documents Management | إدارة الوثائق
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(() => {
              const allDocs: any[] = [];
              
              // 1. Other Uploaded Documents
              if (student.student_documents && student.student_documents.length > 0) {
                allDocs.push(...student.student_documents.map(d => ({ ...d, isCore: false })));
              }

              if (allDocs.length === 0 && !isEditing) {
                return <p className="text-center py-8 text-gray-500 italic">No documents available | لا توجد وثائق متاحة</p>;
              }

              return allDocs.map((doc, index) => (
                <div
                  key={doc.id || `doc-${index}`}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-xl transition-all duration-200 ${doc.isCore ? 'bg-primary/5 border-primary/20' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${doc.isCore ? 'bg-primary text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}>
                      {doc.document_type === "PHOTO" ? <User className="h-6 w-6" /> : <FileIcon className="h-6 w-6" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">
                        {DOCUMENT_TYPES.find(t => t.value === doc.document_type)?.label.split(" |")[0] || doc.document_type}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {doc.description || "No description provided"}
                      </p>
                      {doc.isCore && (
                        <span className="inline-block mt-2 px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase tracking-wider">
                          Core Identity Document
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* View Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 px-4 gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
                      onClick={() => handleViewDocument(doc.file_url)}
                    >
                      <EyeIcon className="h-4 w-4" />
                      <span>View</span>
                    </Button>

                    {/* Print Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 px-4 gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
                      onClick={() => handlePrintDocument(doc.file_url)}
                    >
                      <PrinterIcon className="h-4 w-4" />
                      <span>Print</span>
                    </Button>

                    {/* Download Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 px-4 gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
                      onClick={() => {
                        const fileName = (doc.description || doc.document_type).replace(/\s+/g, '_');
                        handleDownloadDocument(doc.file_url, fileName);
                      }}
                    >
                      <DownloadIcon className="h-4 w-4" />
                      <span>Download</span>
                    </Button>
                    
                    {/* Core Actions (Edit Core Documents) */}
                    {isEditing && doc.isCore && (
                       <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 p-0 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                          onClick={() => {
                            const input = document.createElement("input");
                            input.type = "file";
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file && student) {
                                if (doc.fieldName === "guardian_id_document") {
                                  handleGuardianChange("id_document" as any, file);
                                } else {
                                  handleChange(doc.fieldName as any, file);
                                }
                                Swal.fire({
                                  title: 'Success!',
                                  text: `${doc.description.split(" |")[0]} updated locally`,
                                  icon: 'success',
                                  timer: 5000,
                                  timerProgressBar: true,
                                  confirmButtonText: 'OK'
                                });
                              }
                            };
                            input.click();
                          }}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                       </div>
                    )}

                    {/* Non-core Actions (Delete/Replace) */}
                    {isEditing && !doc.isCore && (
                      <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
                        {/* Replace */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 p-0 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                          onClick={() => {
                            const input = document.createElement("input");
                            input.type = "file";
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) {
                                // Trigger replacement logic here if needed
                              }
                            };
                            input.click();
                          }}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>

                        {/* Delete */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 p-0 text-destructive hover:bg-destructive/10"
                          onClick={async () => {
                            const result = await Swal.fire({
                              title: "Are you sure?",
                              text: "You won't be able to revert this!",
                              icon: "warning",
                              showCancelButton: true,
                              confirmButtonColor: "#d33",
                              cancelButtonColor: "#3085d6",
                              confirmButtonText: "Yes, delete it!",
                            });
                            if (result.isConfirmed) {
                              removeDocument(index);
                              Swal.fire({
                                title: 'Success!',
                                text: "Document removed. Don't forget to save.",
                                icon: 'success',
                                timer: 5000,
                                timerProgressBar: true,
                                confirmButtonText: 'OK'
                              });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ));
            })()}

            {isEditing && (
              <div className="mt-8 p-6 bg-gray-50/50 border border-dashed border-gray-300 rounded-2xl">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <PlusIcon className="h-5 w-5 text-primary" />
                  Add New Document | إضافة وثيقة جديدة
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select
                    value={newDocumentType}
                    onValueChange={setNewDocumentType}
                  >
                    <SelectTrigger className="bg-white">
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

                  {newDocumentType === "OTHER" && (
                    <div className="md:col-span-3">
                      <Input
                        placeholder="Enter Document Name | أدخل اسم الوثيقة"
                        value={newDocumentName}
                        onChange={(e) => setNewDocumentName(e.target.value)}
                        className="bg-white"
                      />
                    </div>
                  )}

                  <div className="relative group">
                    <Input
                      type="file"
                      accept={newDocumentType === "PHOTO" ? "image/*" : ".pdf,image/*"}
                      className="bg-white cursor-pointer pr-10"
                      onChange={(e) =>
                        setNewDocumentFile(e.target.files?.[0] || null)
                      }
                    />
                  </div>

                  <Button
                    onClick={handleAddDocument}
                    disabled={!newDocumentType || !newDocumentFile}
                    className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all duration-300"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Document
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {isEditing && (
        <div className="flex justify-center mt-8 mb-12 px-4 shadow-sm">
          <Button
            onClick={handleSave}
            className="w-full bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 h-14 text-xl font-bold transition-all duration-300 transform hover:scale-[1.01] rounded-2xl"
          >
            <SaveIcon className="h-6 w-6 mr-3" />
            Save All Changes | حفظ جميع التغييرات
          </Button>
        </div>
      )}
    </div>
  );
}
