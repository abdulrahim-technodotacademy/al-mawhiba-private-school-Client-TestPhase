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
    AlertCircle,
    FileCheck,
    CheckCircle2,
    Navigation,
    Upload,
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
import PromoteStudentModal from "./PromoteStudentModal";

// Updated to match registration form
const DOCUMENT_TYPES = [
    { value: "ID", label: "ID Proof | بطاقة الهوية" },
    { value: "BIRTH", label: "Birth Certificate | شهادة الميلاد" },
    { value: "TRANSFER", label: "Transfer Certificate | شهادة النقل" },
    { value: "PHOTO", label: "Photograph | صورة شخصية" },
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
        theme: "brown",
        border: "border-[#662a14]/10",
        bg: "bg-[#662a14]/5",
        textColor: "text-[#662a14]",
        iconBg: "bg-[#662a14]",
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
    chronic_disease: string;
    parents_divorced: boolean;
    staying_with: string;
    previous_education_system: string;
    wanted_education_system: string;
    home_contact: string;
    emergency_contact: string;
    is_promoted: boolean;
    is_active: boolean;
    is_verified_registration_officer: boolean;
    is_draft: boolean;
    status: "pending" | "verified" | "rejected" | "draft";
    isDraft?: boolean;
    other_datas?: any;

    // Guardian Information
    guardian: {
        id: string;
        name_en: string;
        name_ar: string;
        phone1: string;
        phone2: string;
        email: string;
        address: string;
        relationship: string;
        national_id: string;
        work_phone: string;
        occupation: string;
        workplace: string;
        id_document?: string;
        guardian_id_document?: string;
        other_datas?: any;
    };

    // Documents
    student_documents?: StudentDocument[];
    financial_agreement?: any[];
    payment_history?: any[];
    promotion_history?: any[];

    // Separate parent objects matching registration form
    father?: any;
    mother?: any;
    relative?: any;
    relationship?: string;
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

function StudentDetailsPage() {
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
    const [newDocumentFiles, setNewDocumentFiles] = useState<File[]>([]);
    const [fileInputKey, setFileInputKey] = useState(0);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isReplacing, setIsReplacing] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);

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
                en_grandfather_name: studentData.en_grandfather_name || "",
                ar_grandfather_name: studentData.ar_grandfather_name || "",
                // Tribe names are deprecated in UI/Payload, keeping them empty in state
                en_tribe_name: "",
                ar_tribe_name: "",
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
                address: studentData.address || studentData.other_datas?.address || "",
                city: studentData.city || studentData.other_datas?.city || "",
                state: studentData.state || studentData.other_datas?.state || "",
                postal_code: studentData.postal_code || studentData.other_datas?.postal_code || "",
                country: studentData.country || studentData.other_datas?.country || "",
                governance: studentData.governance || studentData.other_datas?.governance || "",
                neighborhood: studentData.neighborhood || studentData.other_datas?.neighborhood || "",
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
                admission_date: studentData.admission_date || "",
                previous_school: studentData.previous_school || "",
                has_special_needs: studentData.has_special_needs || false,
                special_needs_details: studentData.special_needs_details || "",
                chronic_disease: studentData.chronic_disease || "",
                parents_divorced: studentData.parents_divorced || false,
                previous_education_system: studentData.previous_education_system || "",
                wanted_education_system: studentData.wanted_education_system || "",
                is_promoted: studentData.is_promoted || false,
                is_active: studentData.is_active !== undefined ? studentData.is_active : true,
                is_verified_registration_officer:
                    studentData.is_verified_registration_officer || false,
                guardian: {
                    ...studentData.guardian,
                    name_en: studentData.guardian?.name_en || "",
                    name_ar: studentData.guardian?.name_ar || "",
                    phone1: studentData.guardian?.phone1 || studentData.guardian?.phone || "",
                    phone2: studentData.guardian?.phone2 || studentData.guardian?.phone || "",
                    email: studentData.guardian?.email || "",
                    address: studentData.guardian?.address || studentData.guardian?.other_datas?.address || "",
                    relationship: studentData.guardian?.relationship || "father",
                    national_id:
                        studentData.guardian?.national_id ||
                        studentData.guardian?.other_datas?.national_id ||
                        "",
                    work_phone: studentData.guardian?.work_phone || "",
                    occupation: studentData.guardian?.occupation || "",
                    workplace: studentData.guardian?.workplace || "",
                    id_document: studentData.guardian?.id_document || "",
                    guardian_id_document: studentData.guardian?.id_document || "",
                },
                student_documents: documents.map((doc: any) => ({
                    id: doc.id,
                    document_type: doc.document_type,
                    file_url: doc.file || doc.file_url,
                    description:
                        doc.description || (doc.file ? doc.file.split("/").pop() : ""),
                })),
                status: studentData.is_draft ? "draft" : (studentData.is_verified_registration_officer
                    ? "verified"
                    : "pending") as "pending" | "verified" | "rejected" | "draft",
                isDraft: studentData.is_draft,
                father: (studentData.father || (studentData.guardian?.relationship === "father" ? studentData.guardian : null)) ? {
                    ...(studentData.father || studentData.guardian),
                    phone1: (studentData.father || studentData.guardian).phone1 || (studentData.father || studentData.guardian).phone || "",
                    phone2: (studentData.father || studentData.guardian).phone2 || "",
                    address: (studentData.father || studentData.guardian).address || (studentData.father || studentData.guardian).other_datas?.address || "",
                    work_phone: (studentData.father || studentData.guardian).work_phone || "",
                    occupation: (studentData.father || studentData.guardian).occupation || "",
                    workplace: (studentData.father || studentData.guardian).workplace || "",
                    national_id: (studentData.father || studentData.guardian).national_id || (studentData.father || studentData.guardian).other_datas?.national_id || "",
                    id_document: (studentData.father || studentData.guardian).id_document || null,
                    guardian_id_document: (studentData.father || studentData.guardian).id_document || null,
                } : null,
                mother: (studentData.mother || (studentData.guardian?.relationship === "mother" ? studentData.guardian : null)) ? {
                    ...(studentData.mother || studentData.guardian),
                    phone1: (studentData.mother || studentData.guardian).phone1 || (studentData.mother || studentData.guardian).phone || "",
                    phone2: (studentData.mother || studentData.guardian).phone2 || "",
                    address: (studentData.mother || studentData.guardian).address || (studentData.mother || studentData.guardian).other_datas?.address || "",
                    work_phone: (studentData.mother || studentData.guardian).work_phone || "",
                    occupation: (studentData.mother || studentData.guardian).occupation || "",
                    workplace: (studentData.mother || studentData.guardian).workplace || "",
                    national_id: (studentData.mother || studentData.guardian).national_id || (studentData.mother || studentData.guardian).other_datas?.national_id || "",
                    id_document: (studentData.mother || studentData.guardian).id_document || null,
                    guardian_id_document: (studentData.mother || studentData.guardian).id_document || null,
                } : null,
                relative: (studentData.relative || (studentData.guardian?.relationship === "relative" || studentData.guardian?.relationship === "other" ? studentData.guardian : null)) ? {
                    ...(studentData.relative || studentData.guardian),
                    phone1: (studentData.relative || studentData.guardian).phone1 || (studentData.relative || studentData.guardian).phone || "",
                    phone2: (studentData.relative || studentData.guardian).phone2 || "",
                    address: (studentData.relative || studentData.guardian).address || (studentData.relative || studentData.guardian).other_datas?.address || "",
                    work_phone: (studentData.relative || studentData.guardian).work_phone || "",
                    occupation: (studentData.relative || studentData.guardian).occupation || "",
                    workplace: (studentData.relative || studentData.guardian).workplace || "",
                    national_id: (studentData.relative || studentData.guardian).national_id || (studentData.relative || studentData.guardian).other_datas?.national_id || "",
                    id_document: (studentData.relative || studentData.guardian).id_document || null,
                    guardian_id_document: (studentData.relative || studentData.guardian).id_document || null,
                } : null,
                relationship: studentData.guardian?.relationship || (studentData.father ? "father" : (studentData.mother ? "mother" : "relative")),
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

            // Auto-edit mode if query param exists
            const params = new URLSearchParams(window.location.search);
            if (params.get('edit') === 'true') {
                setIsEditing(true);
            }
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
        field: string,
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

    const handleFatherChange = (field: string, value: any) => {
        if (!student) return;
        setStudent({
            ...student,
            father: {
                ...(student.father || {}),
                [field]: value,
            },
        });
    };

    const handleMotherChange = (field: string, value: any) => {
        if (!student) return;
        setStudent({
            ...student,
            mother: {
                ...(student.mother || {}),
                [field]: value,
            },
        });
    };

    const handleRelativeChange = (field: string, value: any) => {
        if (!student) return;
        setStudent({
            ...student,
            relative: {
                ...(student.relative || {}),
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

    const handleSave = async (finalize: boolean = false) => {
        if (!student) return;
        setIsSaving(true);
        setFieldErrors({});

        try {
            // 1. Client-side Validation (only if finalizing or not saving as draft)
            // For Registration Officer, every "Save" should ideally be valid, 
            // but we especially enforce it for finalization.
            const newErrors: Record<string, string> = {};

            // Guardian / Responsible Parent Validation
            const rel = student.relationship || student.guardian.relationship || "father";

            // If it's a draft and not finalizing, we only require the English first name
            const isActuallyDraft = student.status === "draft" || student.isDraft;
            
            if (!finalize && isActuallyDraft) {
                if (!student.en_first_name) newErrors.en_first_name = "Required | مطلوب";
            } else {
                // strict validation for finalized or non-draft records
                if (!student.en_first_name) newErrors.en_first_name = "Required";
                if (!student.ar_first_name) newErrors.ar_first_name = "Required";
                if (!student.date_of_birth) newErrors.date_of_birth = "Required";
                if (!student.gender) newErrors.gender = "Required";
                if (!student.nationality) newErrors.nationality = "Required";

                // Profile Photo and Passport Copy are now required
                if (!student.photo && !student.photo_url) newErrors.photo = "Required | مطلوب";
                if (!student.passport_copy && !student.passport_copy_url) newErrors.passport_copy = "Required | مطلوب";

                // Student ID Proof is now required in the documents list
                const hasIDProof = student.student_documents?.some(doc => doc.document_type === "ID");
                if (!hasIDProof) newErrors.student_id_proof = "Student ID Proof is required | بطاقة الهوية مطلوبة";

                // 1. Father Validation (Always required)
                if (!student.father?.name_en) newErrors.father_name_en = "Required | مطلوب";
                if (!student.father?.phone1) newErrors.father_phone1 = "Required | مطلوب";
                if (!student.father?.national_id && !student.father?.other_datas?.national_id) newErrors.father_national_id = "Required | مطلوب";
                if (!student.father?.id_document && !student.father?.guardian_id_document) newErrors.father_id_document = "Required | مطلوب";
                if (!student.father?.occupation) newErrors.father_occupation = "Required | مطلوب";

                // 2. Mother Validation (Always required)
                if (!student.mother?.name_en) newErrors.mother_name_en = "Required | مطلوب";
                if (!student.mother?.phone1) newErrors.mother_phone1 = "Required | مطلوب";
                if (!student.mother?.national_id && !student.mother?.other_datas?.national_id) newErrors.mother_national_id = "Required | مطلوب";
                if (!student.mother?.id_document && !student.mother?.guardian_id_document) newErrors.mother_id_document = "Required | مطلوب";
                if (!student.mother?.occupation) newErrors.mother_occupation = "Required | مطلوب";

                if (rel === "relative") {
                    if (student.relative) {
                        if (!student.relative.name_en) newErrors.relative_name_en = "Required | مطلوب";
                        if (!student.relative.phone1) newErrors.relative_phone1 = "Required | مطلوب";
                        if (!student.relative.national_id) newErrors.relative_national_id = "Required | مطلوب";
                        if (!student.relative.id_document && !student.guardian?.id_document) newErrors.relative_id_document = "Required | مطلوب";
                        if (!student.relative.occupation) newErrors.relative_occupation = "Required | مطلوب";
                    } else {
                        newErrors.relative_section = "Relative details are required when selected as responsible.";
                    }
                }

                if (!student.admission_class.id) newErrors.admission_class = "Required";

                // Address / Location Validation
                if (!student.address) newErrors.address = "Required | مطلوب";
                if (!student.city) newErrors.city = "Required | مطلوب";
                if (!student.state) newErrors.state = "Required | مطلوب";
                if (!student.country) newErrors.country = "Required | مطلوب";
                if (!student.postal_code) newErrors.postal_code = "Required | مطلوب";
                if (!student.governance) newErrors.governance = "Required | مطلوب";
                if (!student.neighborhood) newErrors.neighborhood = "Required | مطلوب";
            }

            if (Object.keys(newErrors).length > 0) {
                setFieldErrors(newErrors);
                setIsSaving(false);

                // Auto-scroll to the first error field
                setTimeout(() => {
                    const firstErrorField = document.querySelector(".border-red-500");
                    if (firstErrorField) {
                        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
                        // If it's an input, focus it
                        (firstErrorField as HTMLElement).focus?.();
                    }
                }, 100);
                return;
            }

            const token = localStorage.getItem("accessToken");

            // Prepare student data
            const studentData: any = {
                admission_number: student.admission_number,
                en_first_name: student.en_first_name,
                en_middle_name: student.en_middle_name,
                en_last_name: student.en_last_name,
                ar_first_name: student.ar_first_name,
                ar_middle_name: student.ar_middle_name,
                ar_last_name: student.ar_last_name,
                en_grandfather_name: student.en_grandfather_name,
                ar_grandfather_name: student.ar_grandfather_name,
                date_of_birth: student.date_of_birth,
                age_years: calculateAge(student.date_of_birth),
                gender: student.gender,
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
                admission_date: student.admission_date || null,
                previous_school: student.previous_school,
                previous_education_system: student.previous_education_system,
                wanted_education_system: student.wanted_education_system,
                chronic_disease: student.chronic_disease,
                parents_divorced: student.parents_divorced,
                has_special_needs: student.has_special_needs,
                special_needs_details: student.special_needs_details,
                is_promoted: student.is_promoted,
                is_active: student.is_active,
                is_verified_registration_officer: finalize ? false : student.is_verified_registration_officer,
                is_draft: finalize ? false : student.is_draft,
                other_datas: (() => {
                    const { admission_date, ...others } = student.other_datas || {};
                    return {
                        ...others,
                        email: student.email,
                        address: student.address,
                        city: student.city,
                        postal_code: student.postal_code,
                        country: student.country,
                    };
                })(),
            };

            // Prepare multi-parent data
            const fatherPayload = student.father ? {
                ...student.father,
                relationship: "father",
                phone1: student.father.phone1,
                phone2: student.father.phone2,
            } : null;

            const motherPayload = student.mother ? {
                ...student.mother,
                relationship: "mother",
                phone1: student.mother.phone1,
                phone2: student.mother.phone2,
            } : null;

            const relativePayload = student.relative ? {
                ...student.relative,
                relationship: "relative",
                phone1: student.relative.phone1,
                phone2: student.relative.phone2,
            } : null;

            // Set main guardian based on relationship
            const mainGuardianPayload = rel === "father" ? fatherPayload : (rel === "mother" ? motherPayload : relativePayload);

            const form = new FormData();

            // Add parent data to form
            if (fatherPayload) form.append("father", JSON.stringify(fatherPayload));
            if (motherPayload) form.append("mother", JSON.stringify(motherPayload));
            if (relativePayload) form.append("relative", JSON.stringify(relativePayload));
            form.append("guardian", JSON.stringify(mainGuardianPayload));
            form.append("relationship", rel);

            // Document Metadata
            const documentMetadata: any[] = [];
            student.student_documents?.forEach((doc, i) => {
                const meta: any = {
                    document_type: doc.document_type,
                    description: doc.description,
                };
                if (doc.id && !doc.id.startsWith('temp-')) meta.id = doc.id;
                if (doc.file instanceof File) {
                    meta.file_field = `document_file_${i}`;
                    form.append(`document_file_${i}`, doc.file);
                }
                documentMetadata.push(meta);
            });

            // Files
            if (student.photo instanceof File) form.append("student_photo", student.photo);
            if (student.passport_copy instanceof File) form.append("student_passport", student.passport_copy);
            if (student.house_photo instanceof File) form.append("student_house_photo", student.house_photo);
            if (student.google_map_location_photo instanceof File) form.append("student_google_map_photo", student.google_map_location_photo);

            // Guardian ID Documents
            if (student.father?.id_document instanceof File) form.append("father_id_document", student.father.id_document);
            if (student.mother?.id_document instanceof File) form.append("mother_id_document", student.mother.id_document);
            if (student.relative?.id_document instanceof File) form.append("relative_id_document", student.relative.id_document);

            form.append("student", JSON.stringify(studentData));
            form.append("student_documents", JSON.stringify(documentMetadata));

            const res = await fetch(
                `${import.meta.env.VITE_API_BASE_URL
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
                throw new Error(
                    errorData.errors || errorData.message || "Failed to save data"
                );
            }

            setIsEditing(false);
            setFieldErrors({});
            await Swal.fire({
                title: finalize ? 'Success!' : 'Saved!',
                text: finalize ? 'Student finalized and verified successfully' : 'Draft saved successfully',
                icon: 'success',
                timer: 3000,
                timerProgressBar: true,
                confirmButtonText: 'OK'
            });

            // Navigate back to the dashboard with the appropriate filters
            const params = new URLSearchParams(window.location.search);
            const fromStatus = params.get('status') || params.get('fromStatus') || (finalize ? 'pending' : 'draft');
            navigate(`/dashboard/registration?tab=search&status=${fromStatus}`);
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
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddDocumentsAuto = (files: File[]) => {
        if (!student || !newDocumentType || files.length === 0) {
            if (!newDocumentType) {
                Swal.fire({
                    title: 'Select Type First',
                    text: 'Please select a document type before picking files | يرجى اختيار نوع الوثيقة أولاً',
                    icon: 'warning',
                    timer: 3000
                });
            }
            return;
        }

        // Add validation for photo documents
        if (newDocumentType === "PHOTO") {
            const invalidFile = files.find(f => !f.type.startsWith('image/'));
            if (invalidFile) {
                Swal.fire({
                    title: 'Error!',
                    text: `File "${invalidFile.name}" is not a valid image. Please only upload images for Photographs.`,
                    icon: 'error',
                    timer: 5000,
                    timerProgressBar: true,
                    confirmButtonText: 'OK'
                });
                return;
            }
        }

        const newDocs = files.map((file, i) => ({
            id: `temp-${Date.now()}-${i}`,
            document_type: newDocumentType,
            document_name: newDocumentType === "OTHER" ? newDocumentName : "",
            file: file,
            file_url: URL.createObjectURL(file),
            description: newDocumentType === "OTHER" ? (newDocumentName || file.name) : (DOCUMENT_TYPES.find(t => t.value === newDocumentType)?.label.split(" |")[0] || file.name),
        }));

        setStudent({
            ...student,
            student_documents: [
                ...(student.student_documents || []),
                ...newDocs,
            ],
        });

        // Reset for next addition
        setNewDocumentType("");
        setNewDocumentName("");
        setNewDocumentFiles([]);
        setFileInputKey(prev => prev + 1);

        Swal.fire({
            title: 'Added!',
            text: files.length > 1 ? `${files.length} documents added` : 'Document added',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            position: 'bottom-end',
            toast: true
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
                `${import.meta.env.VITE_API_BASE_URL
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

    const handlePromoteSubmit = async (payload: any) => {
        if (!student) return;
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/students/students/promote/${student.id}/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to promote");
            }

            await Swal.fire({
                title: 'Success! 🎉',
                text: 'Student has been promoted successfully with yearly record.',
                icon: 'success',
                timer: 3000,
                confirmButtonText: 'OK'
            });

            // Reload student data to reflect changes
            await fetchStudent();
            setIsPromoteModalOpen(false);
        } catch (err) {
            console.error("Promotion failed:", err);
            Swal.fire({
                title: 'Error!',
                text: err instanceof Error ? err.message : "Promotion failed",
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

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
                    {!isEditing && student.status !== 'draft' && (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => navigate(`/student/promote/${id}`)}
                                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                            >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Promote | ترقية
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setIsEditing(true)}
                            >
                                <PencilIcon className="w-4 h-4 mr-2" />
                                Edit
                            </Button>
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
                        </>
                    )}

                    <Button
                        variant="outline"
                        onClick={() => {
                            const params = new URLSearchParams(window.location.search);
                            const fromTab = params.get('tab') || 'search';
                            const fromStatus = params.get('fromStatus') || 'all';

                            if (fromTab === 'search') {
                                navigate(`/dashboard/registration?tab=search&status=${fromStatus}`);
                            } else {
                                navigate(`/dashboard/registration?tab=${fromTab}`);
                            }
                        }}
                    >
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
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Student Image & Primary Photo Uploads */}
                        <div className="shrink-0 flex flex-col gap-6">
                            <div className="relative group mx-auto">
                                {(student.photo_url || student.photo) ? (
                                    <div className="relative group/student-photo">
                                        <img
                                            src={student.photo instanceof File ? URL.createObjectURL(student.photo) : getFullUrl(student.photo_url)}
                                            alt="Student"
                                            className="w-32 h-32 md:w-48 md:h-48 object-cover rounded-2xl border-4 border-white shadow-xl group-hover/student-photo:ring-4 ring-primary/20 transition-all duration-300"
                                        />

                                        {/* Action Bar Overlay */}
                                        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center gap-2 rounded-b-2xl opacity-0 group-hover/student-photo:opacity-100 transition-opacity duration-300">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="h-9 w-9 p-0 bg-white/20 hover:bg-white/40 border-none text-white rounded-full backdrop-blur-md transition-all shadow-sm"
                                                onClick={() => handleViewDocument(student.photo instanceof File ? URL.createObjectURL(student.photo) : student.photo_url!)}
                                                title="View Full | عرض"
                                            >
                                                <EyeIcon className="h-5 w-5" />
                                            </Button>

                                            {isEditing && (
                                                <label className="h-9 w-9 p-0 bg-white/20 hover:bg-white/40 border-none text-white rounded-full backdrop-blur-md transition-all shadow-sm flex items-center justify-center cursor-pointer">
                                                    <Camera className="h-5 w-5" />
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={handlePhotoChange}
                                                    />
                                                </label>
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
                                    <div className={`w-32 h-32 md:w-48 md:h-48 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed group/empty-photo relative transition-all duration-300 ${fieldErrors.photo
                                            ? "bg-red-50 border-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.1)]"
                                            : "bg-gray-50 border-gray-200"
                                        }`}>
                                        <User className={`w-16 h-16 ${fieldErrors.photo ? 'text-red-400' : 'text-gray-300'}`} />
                                        <span className={`text-[10px] mt-2 font-medium ${fieldErrors.photo ? 'text-red-600 font-bold animate-pulse' : 'text-gray-400'}`}>
                                            {fieldErrors.photo ? 'Photo Required | مطلوب' : 'No Photo | لا توجد صورة'}
                                        </span>

                                        {isEditing && (
                                            <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/5 opacity-0 group-hover/empty-photo:opacity-100 transition-opacity rounded-2xl">
                                                <Camera className="w-10 h-10 text-primary" />
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
                                {isEditing && fieldErrors.photo && (
                                    <p className="text-[10px] text-red-500 font-bold mt-1 text-center">{fieldErrors.photo}</p>
                                )}
                            </div>

                            <div className="pt-2 border-t border-gray-100">
                                <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <FileIcon className="h-3 w-3" /> Required Documents | الوثائق المطلوبة
                                </h4>
                            </div>

                            {/* Passport Copy & House Photo below student photo in column */}
                            <div className="grid grid-grid-cols-1 gap-4">
                                <div className={`p-2 rounded-xl border-2 transition-all duration-300 ${fieldErrors.passport_copy
                                        ? "bg-red-50 border-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.1)]"
                                        : "bg-gray-50/50 border-gray-100"
                                    }`}>
                                    <Label className={`text-[9px] uppercase tracking-wider mb-1 block ${fieldErrors.passport_copy ? 'text-red-700 font-bold' : 'text-gray-500'}`}>
                                        Passport Copy | الجواز {isEditing && <span className="text-red-500">*</span>}
                                    </Label>
                                    <div className="flex items-center justify-between">
                                        {(student.passport_copy_url || student.passport_copy) ? (
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-blue-600" onClick={() => handleViewDocument(student.passport_copy ? URL.createObjectURL(student.passport_copy) : student.passport_copy_url!)}><EyeIcon className="h-3 w-3" /></Button>
                                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-600" onClick={() => handleDownloadDocument(student.passport_copy ? URL.createObjectURL(student.passport_copy) : student.passport_copy_url!, "Passport")}><DownloadIcon className="h-3 w-3" /></Button>
                                            </div>
                                        ) : <span className={`text-[9px] italic ${fieldErrors.passport_copy ? 'text-red-600 font-bold animate-pulse' : 'text-gray-400'}`}>
                                            {fieldErrors.passport_copy ? 'Missing | مفقود' : 'Missing'}
                                        </span>}
                                        {isEditing && (
                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-primary" onClick={() => {
                                                const input = document.createElement("input"); input.type = "file"; input.accept = ".pdf,image/*";
                                                input.onchange = (e) => { const file = (e.target as HTMLInputElement).files?.[0]; if (file) handleChange("passport_copy", file); };
                                                input.click();
                                            }}><PencilIcon className="h-3 w-3" /></Button>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-gray-50/50 p-2 rounded-xl border border-gray-100">
                                    <Label className="text-[9px] uppercase tracking-wider text-gray-500 mb-1 block">House Photo | المنزل</Label>
                                    <div className="flex items-center justify-between">
                                        {(student.house_photo_url || student.house_photo) ? (
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-blue-600" onClick={() => handleViewDocument(student.house_photo ? URL.createObjectURL(student.house_photo) : student.house_photo_url!)}><EyeIcon className="h-3 w-3" /></Button>
                                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-600" onClick={() => handleDownloadDocument(student.house_photo ? URL.createObjectURL(student.house_photo) : student.house_photo_url!, "House")}><DownloadIcon className="h-3 w-3" /></Button>
                                            </div>
                                        ) : <span className="text-[9px] text-gray-400 italic">Missing</span>}
                                        {isEditing && (
                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-primary" onClick={() => {
                                                const input = document.createElement("input"); input.type = "file"; input.accept = "image/*";
                                                input.onchange = (e) => { const file = (e.target as HTMLInputElement).files?.[0]; if (file) handleChange("house_photo", file); };
                                                input.click();
                                            }}><PencilIcon className="h-3 w-3" /></Button>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-gray-50/50 p-2 rounded-xl border border-gray-100">
                                    <Label className="text-[9px] uppercase tracking-wider text-gray-500 mb-1 block">Location Photo Map | الخارطة</Label>
                                    <div className="flex items-center justify-between">
                                        {(student.google_map_location_photo_url || student.google_map_location_photo) ? (
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-blue-600" onClick={() => handleViewDocument(student.google_map_location_photo ? URL.createObjectURL(student.google_map_location_photo) : student.google_map_location_photo_url!)}><EyeIcon className="h-3 w-3" /></Button>
                                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-600" onClick={() => handleDownloadDocument(student.google_map_location_photo ? URL.createObjectURL(student.google_map_location_photo) : student.google_map_location_photo_url!, "LocationMap")}><DownloadIcon className="h-3 w-3" /></Button>
                                            </div>
                                        ) : <span className="text-[9px] text-gray-400 italic">Missing</span>}
                                        {isEditing && (
                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-primary" onClick={() => {
                                                const input = document.createElement("input"); input.type = "file"; input.accept = "image/*";
                                                input.onchange = (e) => { const file = (e.target as HTMLInputElement).files?.[0]; if (file) handleChange("google_map_location_photo", file); };
                                                input.click();
                                            }}><PencilIcon className="h-3 w-3" /></Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Fields Grid */}
                        <div className="flex-grow">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">

                            <div className="md:col-span-2 pt-4 border-t border-gray-100 mb-6">
                                <h4 className="text-xl font-bold flex items-center gap-3 text-[#662a14] border-b-2 border-[#662a14]/10 pb-4 uppercase tracking-wider">
                                    <span className="bg-[#662a14] text-white p-2 rounded-lg shadow-lg">
                                        <UserPlus className="h-6 w-6" />
                                    </span>
                                    Student Basic Info | بيانات الطالب الأساسية
                                </h4>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-gray-500 text-xs font-semibold">Admission Number</Label>
                                <p className="text-lg font-bold text-primary">{student.admission_number}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="flex items-center gap-1 font-semibold text-xs">
                                    Admission Class {isEditing && <span className="text-red-500">*</span>}
                                </Label>
                                {isEditing ? (
                                    <>
                                        <Select
                                            value={student.admission_class?.id}
                                            onValueChange={(value) => {
                                                const dept = departments.find(d => d.id === value);
                                                handleChange("admission_class", { id: value, department_name: dept?.department_name || "" });
                                            }}
                                        >
                                            <SelectTrigger className={`h-10 rounded-lg bg-white ${fieldErrors.admission_class ? "border-red-500 ring-red-500" : "border-gray-200"}`}>
                                                <SelectValue placeholder="Select class" />
                                            </SelectTrigger>
                                            <SelectContent>{departments.map(d => <SelectItem key={d.id} value={d.id}>{d.department_name}</SelectItem>)}</SelectContent>
                                        </Select>
                                        {fieldErrors.admission_class && <p className="text-[9px] text-red-600 font-bold mt-1 flex items-center gap-1"><AlertCircle className="h-2.5 w-2.5" /> Required</p>}
                                    </>
                                ) : <p className="text-gray-900 font-medium py-1">{student.admission_class?.department_name || "-"}</p>}
                            </div>

                            <div className="md:col-span-2 pt-2 border-t border-gray-50"></div>

                                {/* Name Row 1: First Name */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-1 text-xs font-semibold">STUDENT NAME (English) {isEditing && <span className="text-red-500">*</span>}</Label>
                                    {isEditing ? (
                                        <>
                                            <Input
                                                value={student.en_first_name}
                                                onChange={(e) => handleChange("en_first_name", e.target.value)}
                                                className={`h-11 rounded-xl bg-white shadow-sm ${fieldErrors.en_first_name ? "border-red-500 ring-1 ring-red-500" : "border-gray-200"}`}
                                            />
                                            {fieldErrors.en_first_name && <p className="text-[10px] text-red-600 font-bold mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Required</p>}
                                        </>
                                    ) : <p className="text-gray-900 font-medium py-1">{student.en_first_name || "-"}</p>}
                                </div>

                                <div className="space-y-2 text-right" dir="rtl">
                                    <Label className="flex items-center gap-1 justify-end text-xs font-semibold">STUDENT NAME | الاسم الأول (عربي) {isEditing && <span className="text-red-500">*</span>}</Label>
                                    {isEditing ? (
                                        <>
                                            <Input
                                                value={student.ar_first_name}
                                                onChange={(e) => handleChange("ar_first_name", e.target.value)}
                                                className={`h-11 rounded-xl bg-white shadow-sm text-right ${fieldErrors.ar_first_name ? "border-red-500 ring-1 ring-red-500" : "border-gray-200"}`}
                                            />
                                            {fieldErrors.ar_first_name && <p className="text-[10px] text-red-600 font-bold mt-1 flex items-center gap-1 justify-end"><AlertCircle className="h-3 w-3" /> Required</p>}
                                        </>
                                    ) : <p className="text-gray-900 font-medium py-1">{student.ar_first_name || "-"}</p>}
                                </div>

                                {/* Name Row 2: Middle Name / Father Name */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold">FATHER NAME (English)</Label>
                                    {isEditing ? (
                                        <Input value={student.en_middle_name} onChange={(e) => handleChange("en_middle_name", e.target.value)} className="h-11 rounded-xl bg-white shadow-sm border-gray-200" />
                                    ) : <p className="text-gray-900 font-medium py-1">{student.en_middle_name || "-"}</p>}
                                </div>

                                <div className="space-y-2 text-right" dir="rtl">
                                    <Label className="flex justify-end text-xs text-right font-semibold">FATHER NAME | اسم الأب (عربي)</Label>
                                    {isEditing ? (
                                        <Input value={student.ar_middle_name} onChange={(e) => handleChange("ar_middle_name", e.target.value)} className="h-11 rounded-xl bg-white shadow-sm text-right border-gray-200" />
                                    ) : <p className="text-gray-900 font-medium py-1">{student.ar_middle_name || "-"}</p>}
                                </div>

                                {/* Name Row 3: Grandfather Name */}
                                <div className="space-y-1">
                                    <Label className="text-xs">GRANDFATHER NAME (English)</Label>
                                    {isEditing ? (
                                        <Input value={student.en_grandfather_name} onChange={(e) => handleChange("en_grandfather_name", e.target.value)} className="h-10 rounded-lg border-gray-200" />
                                    ) : <p className="text-gray-900 font-medium py-1">{student.en_grandfather_name || "-"}</p>}
                                </div>

                                <div className="space-y-1 text-right" dir="rtl">
                                    <Label className="flex justify-end text-xs">GRANDFATHER NAME | اسم الجد (عربي)</Label>
                                    {isEditing ? (
                                        <Input value={student.ar_grandfather_name} onChange={(e) => handleChange("ar_grandfather_name", e.target.value)} className="h-10 rounded-lg text-right border-gray-200" />
                                    ) : <p className="text-gray-900 font-medium py-1">{student.ar_grandfather_name || "-"}</p>}
                                </div>

                                {/* Name Row 4: Last Name (Family) */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-1 text-xs font-semibold">LAST NAME / FAMILY NAME (English) {isEditing && <span className="text-red-500">*</span>}</Label>
                                    {isEditing ? (
                                        <>
                                            <Input
                                                value={student.en_last_name}
                                                onChange={(e) => handleChange("en_last_name", e.target.value)}
                                                className={`h-11 rounded-xl bg-white shadow-sm ${fieldErrors.en_last_name ? "border-red-500 ring-1 ring-red-500" : "border-gray-200"}`}
                                            />
                                            {fieldErrors.en_last_name && <p className="text-[10px] text-red-600 font-bold mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Required</p>}
                                        </>
                                    ) : <p className="text-gray-900 font-medium py-1">{student.en_last_name || "-"}</p>}
                                </div>

                                <div className="space-y-2 text-right" dir="rtl">
                                    <Label className="flex items-center gap-1 justify-end text-xs font-semibold">LAST NAME / FAMILY NAME | اسم العائلة (عربي) {isEditing && <span className="text-red-500">*</span>}</Label>
                                    {isEditing ? (
                                        <>
                                            <Input
                                                value={student.ar_last_name}
                                                onChange={(e) => handleChange("ar_last_name", e.target.value)}
                                                className={`h-11 rounded-xl bg-white shadow-sm text-right ${fieldErrors.ar_last_name ? "border-red-500 ring-1 ring-red-500" : "border-gray-200"}`}
                                            />
                                            {fieldErrors.ar_last_name && <p className="text-[10px] text-red-600 font-bold mt-1 flex items-center gap-1 justify-end"><AlertCircle className="h-3 w-3" /> Required</p>}
                                        </>
                                    ) : <p className="text-gray-900 font-medium py-1">{student.ar_last_name || "-"}</p>}
                                </div>

                                <div className="md:col-span-2 pt-2 border-t border-gray-50"></div>

                                {/* General Personal Details */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-1 font-semibold text-xs">Date of Birth | تاريخ الميلاد <span className="text-red-500">*</span></Label>
                                    {isEditing ? (
                                        <div className="space-y-1">
                                            <Input
                                                type="date"
                                                value={student.date_of_birth}
                                                onChange={(e) => handleChange("date_of_birth", e.target.value)}
                                                className={`h-11 rounded-xl bg-white shadow-sm ${fieldErrors.date_of_birth ? "border-red-500 border-2" : "border-gray-200"}`}
                                            />
                                            {fieldErrors.date_of_birth && <p className="text-[10px] text-red-600 font-bold mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Date of birth is required | تاريخ الميلاد مطلوب</p>}
                                        </div>
                                    ) : <p className="text-gray-900 font-medium py-1">{student.date_of_birth ? `${student.date_of_birth} (${calculateAge(student.date_of_birth)} years)` : "-"}</p>}
                                </div>

                                <div className="space-y-2">
                                   <Label className="flex items-center gap-1 font-semibold text-xs">Gender | الجنس <span className="text-red-500">*</span></Label>
                                   {isEditing ? (
                                       <div className="space-y-1">
                                           <Select value={student.gender} onValueChange={(value) => handleChange("gender", value)}>
                                               <SelectTrigger className={`h-11 rounded-xl bg-white shadow-sm ${fieldErrors.gender ? "border-red-500 border-2 shadow-[0_0_0_1px_rgba(239,68,68,0.1)]" : "border-gray-200"}`}>
                                                   <SelectValue placeholder="Select gender" />
                                               </SelectTrigger>
                                               <SelectContent>
                                                   <SelectItem value="Male">Male | ذكر</SelectItem>
                                                   <SelectItem value="Female">Female | أنثى</SelectItem>
                                               </SelectContent>
                                           </Select>
                                           {fieldErrors.gender && <p className="text-[10px] text-red-600 font-bold mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Gender is required | الجنس مطلوب</p>}
                                       </div>
                                   ) : <p className="text-gray-900 font-medium py-1">{student.gender === "Male" ? "Male | ذكر" : (student.gender === "Female" ? "Female | أنثى" : (student.gender || "-"))}</p>}
                               </div>

                                <div className="space-y-1">
                                    <Label className="flex items-center gap-1 font-semibold text-xs">Religion {isEditing && <span className="text-red-500">*</span>}</Label>
                                    {isEditing ? (
                                        <div className="space-y-2">
                                            <Select
                                                value={RELIGION_OPTIONS.some(opt => opt.value === student.religion) ? student.religion : "other"}
                                                onValueChange={(value) => { if (value === "other") handleChange("religion", "Other"); else handleChange("religion", value); }}
                                            >
                                                <SelectTrigger className="h-10 rounded-lg bg-white border-gray-200"><SelectValue placeholder="Select religion" /></SelectTrigger>
                                                <SelectContent>{RELIGION_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                                            </Select>
                                            {(!RELIGION_OPTIONS.some(opt => opt.value === student.religion) || student.religion === "Other" || student.religion === "other") && (
                                                <Input value={student.religion === "other" || student.religion === "Other" ? "" : student.religion} onChange={(e) => handleChange("religion", e.target.value)} className="h-10 rounded-lg border-gray-200 mt-2" placeholder="Custom Religion" />
                                            )}
                                        </div>
                                    ) : <p className="text-gray-900 font-medium py-1">{student.religion || "-"}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-1 font-semibold text-xs">Nationality | الجنسية {isEditing && <span className="text-red-500">*</span>}</Label>
                                    {isEditing ? (
                                        <>
                                            <Select value={student.nationality} onValueChange={(value) => handleChange("nationality", value)}>
                                                <SelectTrigger className={`h-11 rounded-xl bg-white shadow-sm border-gray-200 ${fieldErrors.nationality ? "border-red-500 border-2" : ""}`}><SelectValue placeholder="Select nationality" /></SelectTrigger>
                                                <SelectContent>{countryList.map(c => <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                                            </Select>
                                            {fieldErrors.nationality && <p className="text-[10px] text-red-600 font-bold mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Required | مطلوب</p>}
                                        </>
                                    ) : <p className="text-gray-900 font-medium py-1">{student.nationality || "-"}</p>}
                                </div>

                                {/* Additional Contact Fields */}
                                <div className="space-y-1">
                                    <Label className="text-xs">Staying With</Label>
                                    {isEditing ? (
                                        <Input value={student.staying_with} onChange={(e) => handleChange("staying_with", e.target.value)} className="h-10 rounded-lg border-gray-200" />
                                    ) : <p className="text-gray-900 font-medium py-1">{student.staying_with || "-"}</p>}
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs">Home Contact</Label>
                                    {isEditing ? (
                                        <Input value={student.home_contact} onChange={(e) => handleChange("home_contact", e.target.value)} className="h-10 rounded-lg border-gray-200" />
                                    ) : <p className="text-gray-900 font-medium py-1">{student.home_contact || "-"}</p>}
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs">Emergency Contact</Label>
                                    {isEditing ? (
                                        <Input value={student.emergency_contact} onChange={(e) => handleChange("emergency_contact", e.target.value)} className="h-10 rounded-lg border-gray-200" />
                                    ) : <p className="text-gray-900 font-medium py-1">{student.emergency_contact || "-"}</p>}
                                </div>

                                {/* Address Section */}
                                <div className="md:col-span-2 pt-8 border-t border-gray-100 mt-6 mb-4">
                                    <h4 className="text-xl font-bold flex items-center gap-3 text-[#662a14] border-b-2 border-[#662a14]/10 pb-4 uppercase tracking-wider">
                                        <span className="bg-[#662a14] text-white p-2 rounded-lg shadow-lg">
                                            <Navigation className="h-6 w-6" />
                                        </span>
                                        Address Information | بيانات السكن والعنوان
                                    </h4>
                                </div>

                                <div className="md:col-span-2 space-y-1">
                                    <Label className="flex items-center gap-1 font-semibold text-xs text-gray-700">Street / Address | الشارع <span className="text-red-500">*</span></Label>
                                    {isEditing ? (
                                        <div className="space-y-1">
                                            <Input 
                                                value={student.address} 
                                                onChange={(e) => handleChange("address", e.target.value)} 
                                                className={`h-10 rounded-lg ${fieldErrors.address ? "border-red-500 border-2" : "border-gray-200"}`} 
                                            />
                                            {fieldErrors.address && <p className="text-[10px] text-red-600 font-bold mt-1 flex items-center gap-1"><AlertCircle className="h-2.5 w-2.5" /> Required | مطلوب</p>}
                                        </div>
                                    ) : <p className="text-gray-900 font-medium py-1">{student.address || "-"}</p>}
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:col-span-2">
                                    <div className="space-y-1">
                                        <Label className="text-[10px]">City <span className="text-red-500">*</span></Label>
                                        {isEditing ? (
                                            <div className="space-y-1">
                                                <Input value={student.city} onChange={(e) => handleChange("city", e.target.value)} className={`h-9 rounded-lg ${fieldErrors.city ? "border-red-500 border-2" : "border-gray-200"}`} />
                                                {fieldErrors.city && <p className="text-[9px] text-red-600 font-bold mt-0.5">Required</p>}
                                            </div>
                                        ) : <p className="py-1">{student.city || "-"}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px]">State <span className="text-red-500">*</span></Label>
                                        {isEditing ? (
                                            <div className="space-y-1">
                                                <Input value={student.state} onChange={(e) => handleChange("state", e.target.value)} className={`h-9 rounded-lg ${fieldErrors.state ? "border-red-500 border-2" : "border-gray-200"}`} />
                                                {fieldErrors.state && <p className="text-[9px] text-red-600 font-bold mt-0.5">Required</p>}
                                            </div>
                                        ) : <p className="py-1">{student.state || "-"}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px]">Governance <span className="text-red-500">*</span></Label>
                                        {isEditing ? (
                                            <div className="space-y-1">
                                                <Input value={student.governance} onChange={(e) => handleChange("governance", e.target.value)} className={`h-9 rounded-lg ${fieldErrors.governance ? "border-red-500 border-2" : "border-gray-200"}`} />
                                                {fieldErrors.governance && <p className="text-[9px] text-red-600 font-bold mt-0.5">Required</p>}
                                            </div>
                                        ) : <p className="py-1">{student.governance || "-"}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px]">Postal Code <span className="text-red-500">*</span></Label>
                                        {isEditing ? (
                                            <div className="space-y-1">
                                                <Input value={student.postal_code} onChange={(e) => handleChange("postal_code", e.target.value)} className={`h-9 rounded-lg ${fieldErrors.postal_code ? "border-red-500 border-2" : "border-gray-200"}`} />
                                                {fieldErrors.postal_code && <p className="text-[9px] text-red-600 font-bold mt-0.5">Required</p>}
                                            </div>
                                        ) : <p className="py-1">{student.postal_code || "-"}</p>}
                                    </div>
                                </div>

                                <div className="md:col-span-2 space-y-1">
                                    <Label className="flex items-center gap-1 font-semibold text-xs">Country | الدولة <span className="text-red-500">*</span></Label>
                                    {isEditing ? (
                                        <div className="space-y-1">
                                            <Select value={student.country} onValueChange={(value) => handleChange("country", value)}>
                                                <SelectTrigger className={`h-10 rounded-lg bg-white ${fieldErrors.country ? "border-red-500 border-2" : "border-gray-200"}`}><SelectValue placeholder="Select country" /></SelectTrigger>
                                                <SelectContent>{countryList.map(c => <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                                            </Select>
                                            {fieldErrors.country && <p className="text-[10px] text-red-600 font-bold mt-1 flex items-center gap-1"><AlertCircle className="h-2.5 w-2.5" /> Required | مطلوب</p>}
                                        </div>
                                    ) : <p className="text-gray-900 font-medium py-1">{student.country || "-"}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4 md:col-span-2">
                                    <div className="space-y-1">
                                        <Label className="text-[10px]">Neighborhood <span className="text-red-500">*</span></Label>
                                        {isEditing ? (
                                            <div className="space-y-1">
                                                <Input value={student.neighborhood} onChange={(e) => handleChange("neighborhood", e.target.value)} className={`h-9 rounded-lg ${fieldErrors.neighborhood ? "border-red-500 border-2" : "border-gray-200"}`} />
                                                {fieldErrors.neighborhood && <p className="text-[9px] text-red-600 font-bold mt-0.5">Required</p>}
                                            </div>
                                        ) : <p className="py-1">{student.neighborhood || "-"}</p>}
                                    </div>
                                    <div className="space-y-1 flex gap-2">
                                        <div className="flex-grow">
                                            <Label className="text-[10px]">Street #</Label>
                                            {isEditing ? <Input value={student.street_number} onChange={(e) => handleChange("street_number", e.target.value)} className="h-9 rounded-lg" /> : <p className="py-1">{student.street_number || "-"}</p>}
                                        </div>
                                        <div className="flex-grow">
                                            <Label className="text-[10px]">House #</Label>
                                            {isEditing ? <Input value={student.house_number} onChange={(e) => handleChange("house_number", e.target.value)} className="h-9 rounded-lg" /> : <p className="py-1">{student.house_number || "-"}</p>}
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-2 space-y-1">
                                    <Label className="text-[10px]">Google Maps URL</Label>
                                    {isEditing ? (
                                        <Input value={student.google_map_location_url} onChange={(e) => handleChange("google_map_location_url", e.target.value)} placeholder="Maps Link" className="h-9 rounded-lg" />
                                    ) : (
                                        <p className="truncate py-1 text-blue-600">
                                            {student.google_map_location_url ? (
                                                <a href={student.google_map_location_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                    {student.google_map_location_url}
                                                </a>
                                            ) : "-"}
                                        </p>
                                    )}
                                </div>

                                {/* Academic & Special Needs */}
                                <div className="md:col-span-2 pt-8 border-t border-gray-100 mt-6 mb-4">
                                    <h4 className="text-xl font-bold flex items-center gap-3 text-[#662a14] border-b-2 border-[#662a14]/10 pb-4 uppercase tracking-wider">
                                        <span className="bg-[#662a14] text-white p-2 rounded-lg shadow-lg">
                                            <FileCheck className="h-6 w-6" />
                                        </span>
                                        Academic Information | البيانات الأكاديمية
                                    </h4>
                                </div>

                                {/* Admission Date (Automatic) */}
                                {(!isEditing || !student.isDraft) && (
                                    <div className="space-y-1">
                                        <Label className="text-[10px]">Admission Date | تاريخ القبول</Label>
                                        <p className="py-1 font-medium text-gray-900">{student.admission_date || "-"}</p>
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <Label className="text-[10px]">Previous School</Label>
                                    {isEditing ? <Input value={student.previous_school} onChange={(e) => handleChange("previous_school", e.target.value)} className="h-9 rounded-lg" /> : <p className="py-1">{student.previous_school || "-"}</p>}
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-[10px]">Previous Education System</Label>
                                    {isEditing ? <Input value={student.previous_education_system} onChange={(e) => handleChange("previous_education_system", e.target.value)} className="h-9 rounded-lg" /> : <p className="py-1">{student.previous_education_system || "-"}</p>}
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-[10px]">Wanted Education System</Label>
                                    {isEditing ? <Input value={student.wanted_education_system} onChange={(e) => handleChange("wanted_education_system", e.target.value)} className="h-9 rounded-lg" /> : <p className="py-1">{student.wanted_education_system || "-"}</p>}
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-[10px]">Special Needs / Verified</Label>
                                    <div className="flex gap-4 py-1 items-center">
                                        {isEditing ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    id="has_special_needs_edit"
                                                    checked={student.has_special_needs}
                                                    onChange={(e) => handleChange("has_special_needs", e.target.checked)}
                                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20"
                                                />
                                                <Label htmlFor="has_special_needs_edit" className="text-[10px] cursor-pointer">Has Special Needs</Label>
                                            </div>
                                        ) : (
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${student.has_special_needs ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {student.has_special_needs ? 'Special Needs' : 'Regular'}
                                            </span>
                                        )}
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${student.is_verified_registration_officer ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {student.is_verified_registration_officer ? 'Verified' : 'Pending Verification'}
                                        </span>
                                    </div>
                                </div>

                                {student.has_special_needs && (
                                    <div className="md:col-span-2 space-y-1">
                                        <Label className="text-[10px]">Special Needs Details</Label>
                                        {isEditing ? <Input value={student.special_needs_details} onChange={(e) => handleChange("special_needs_details", e.target.value)} className="h-9 rounded-lg" /> : <p className="py-1">{student.special_needs_details || "-"}</p>}
                                    </div>
                                )}

                                <div className="md:col-span-2 pt-4 border-t border-gray-50">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Health & Family Information</h4>
                                </div>

                                <div className="space-y-1 md:col-span-2">
                                    <Label className="text-[10px]">Chronic Disease | الأمراض المزمنة</Label>
                                    {isEditing ? <Input value={student.chronic_disease} onChange={(e) => handleChange("chronic_disease", e.target.value)} className="h-9 rounded-lg" placeholder="Describe any chronic diseases" /> : <p className="py-1">{student.chronic_disease || "-"}</p>}
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-[10px]">Parents Divorced | الوالدان مطلقان</Label>
                                    <div className="py-1">
                                        {isEditing ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    id="parents_divorced_edit"
                                                    checked={student.parents_divorced}
                                                    onChange={(e) => handleChange("parents_divorced", e.target.checked)}
                                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20"
                                                />
                                                <Label htmlFor="parents_divorced_edit" className="text-[10px] cursor-pointer">Yes</Label>
                                            </div>
                                        ) : <p className="text-gray-900 font-medium">{student.parents_divorced ? "Yes" : "No"}</p>}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-[10px]">Staying With | يقيم مع</Label>
                                    {isEditing ? <Input value={student.staying_with} onChange={(e) => handleChange("staying_with", e.target.value)} className="h-9 rounded-lg" placeholder="Father, Mother, etc." /> : <p className="py-1">{student.staying_with || "-"}</p>}
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-[10px]">Home Contact | هاتف المنزل</Label>
                                    {isEditing ? <Input value={student.home_contact} onChange={(e) => handleChange("home_contact", e.target.value)} className="h-9 rounded-lg" /> : <p className="py-1">{student.home_contact || "-"}</p>}
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-[10px]">Emergency Contact | هاتف الطوارئ</Label>
                                    {isEditing ? <Input value={student.emergency_contact} onChange={(e) => handleChange("emergency_contact", e.target.value)} className="h-9 rounded-lg" /> : <p className="py-1">{student.emergency_contact || "-"}</p>}
                                </div>

                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Responsible Guardian Selection (Edit Mode Only) */}
            {isEditing && (
                <Card className="mb-8 border-2 border-primary/20 shadow-lg bg-white overflow-hidden">
                    <CardContent className="p-6">
                        <div className="text-center space-y-6">
                            <h3 className="text-xl md:text-2xl font-bold text-gray-800 flex flex-col gap-2">
                                <span dir="rtl">من المسؤول المباشر عن الطالب ؟</span>
                                <span className="text-primary">Who is directly responsible for the student?</span>
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto py-2">
                                {[
                                    { value: 'father', label: 'Father | الأب' },
                                    { value: 'mother', label: 'Mother | الأم' },
                                    { value: 'relative', label: 'Relative | قريب' }
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => {
                                            if (student.relationship === option.value) return;

                                            Swal.fire({
                                                title: 'Are you sure?',
                                                html: `
                        <div class="text-center space-y-3">
                          <div class="p-3 bg-amber-50 rounded-lg border border-amber-200">
                             <p class="font-arabic font-black text-xl text-amber-900" dir="rtl text-right">هل أنت متأكد من تغيير المسؤول المباشر؟</p>
                             <p class="text-sm font-bold text-amber-800">Are you sure you want to change the directly responsible guardian?</p>
                          </div>
                          ${option.value !== 'relative' && (student.relationship === 'relative' || (student.guardian && student.guardian.relationship === 'relative')) ? `
                            <div class="p-3 bg-red-50 rounded-lg border border-red-200 animate-pulse">
                              <p class="font-arabic font-bold text-red-900" dir="rtl text-right italic">ملاحظة سيتم حذف بيانات القريب عند الحفظ</p>
                              <p class="text-[11px] text-red-700 font-black uppercase tracking-wider">Warning: The current relative record will be permanently removed upon saving.</p>
                            </div>
                          ` : ''}
                        </div>
                      `,
                                                icon: 'warning',
                                                showCancelButton: true,
                                                confirmButtonColor: '#662a14',
                                                cancelButtonColor: '#d33',
                                                confirmButtonText: 'Yes, change it!',
                                                cancelButtonText: 'Cancel'
                                            }).then((result) => {
                                                if (result.isConfirmed) {
                                                    setStudent(prev => prev ? {
                                                        ...prev,
                                                        relationship: option.value,
                                                        father: prev.father ? { ...prev.father, is_directly_responsible: option.value === 'father' } : null,
                                                        mother: prev.mother ? { ...prev.mother, is_directly_responsible: option.value === 'mother' } : null,
                                                        relative: prev.relative ? { ...prev.relative, is_directly_responsible: option.value === 'relative' } : null
                                                    } : null);
                                                }
                                            });
                                        }}
                                        className={`flex flex-col items-center gap-2 group transition-all duration-300 ${student.relationship === option.value ? 'scale-105' : 'opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full border-4 flex items-center justify-center transition-all duration-300 shadow-md ${student.relationship === option.value
                                                ? 'border-primary bg-primary text-white'
                                                : 'border-white bg-gray-50 text-gray-400 group-hover:border-primary/20'
                                            }`}>
                                            <User className={`h-8 w-8 md:h-10 md:w-10 ${student.relationship === option.value ? 'animate-pulse' : ''}`} />
                                        </div>
                                        <span className={`font-bold text-sm transition-colors ${student.relationship === option.value ? 'text-primary' : 'text-gray-500'
                                            }`}>
                                            {option.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <p className="text-[10px] text-gray-500 italic">
                                Note: Changing this will set the main point of contact for the school.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Guardian / Parent Information Card */}
            {(() => {
                const renderGuardianSection = (data: any, type: 'father' | 'mother' | 'relative') => {
                    if (!data && !isEditing) return null;
                    if (type === 'relative' && !data && !isEditing) return null;

                    const isResponsible = student.guardian?.id === data?.id || (student.relationship === type);
                    const config = RELATIONSHIP_CONFIG[type] || RELATIONSHIP_CONFIG.relative;
                    const handler = type === 'father' ? handleFatherChange : (type === 'mother' ? handleMotherChange : handleRelativeChange);

                    return (
                        <Card key={type} className={`border-2 ${config.border} shadow-md overflow-hidden transition-all duration-300 ${isResponsible ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                            <CardHeader className={`${config.bg} border-b ${config.border} py-4`}>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`${config.iconBg} p-2 rounded-lg shadow-lg text-white`}>
                                            <User className="h-5 w-5" />
                                        </div>
                                        <CardTitle className={`${config.textColor} text-xl font-bold flex items-center gap-3`}>
                                            {config.title}
                                        </CardTitle>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {isResponsible && (
                                            <span className="bg-primary/10 text-primary text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest border border-primary/20 shadow-sm whitespace-nowrap">
                                                Directly Responsible | المسؤول المباشر
                                            </span>
                                        )}

                                        {isEditing && isResponsible && (
                                            <div className="flex items-center gap-3 bg-white/50 p-1.5 rounded-lg border border-white/50">
                                                <span className="text-[10px] font-black text-amber-800 uppercase tracking-tighter bg-amber-100/50 px-2 py-0.5 rounded border border-amber-200/50">Active Responsible | المسؤول النشط</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                                {(() => {
                                    const safeData = data || {};

                                    if (!data && isEditing && type === 'relative') {
                                        return (
                                            <div className="md:col-span-2 flex flex-col items-center justify-center p-8 bg-gray-50/50 border border-dashed rounded-xl border-gray-200">
                                                <p className="text-gray-500 text-sm font-medium">No details found for {type} | لا توجد بيانات {type}</p>
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    onClick={() => handler("name_en", "Pending Data")}
                                                    className="mt-2 text-primary hover:text-primary/80"
                                                >
                                                    Click to start filling | اضغط لبدء التعبئة
                                                </Button>
                                            </div>
                                        );
                                    }

                                    if (data || (isEditing && (type === 'father' || type === 'mother'))) {
                                        return (
                                            <>
                                                {/* Parent Name English */}
                                                <div className="space-y-1">
                                                    <Label className="flex items-center gap-1 font-semibold text-xs text-gray-700">Name (English) | الإسم (بالإنجليزي) {(type === 'father' || type === 'mother' || isResponsible) && <span className="text-red-500">*</span>}</Label>
                                                    {isEditing ? (
                                                        <div className="space-y-1">
                                                            <Input
                                                                value={safeData.name_en || ""}
                                                                onChange={(e) => handler("name_en", e.target.value)}
                                                                className={`h-10 rounded-lg ${fieldErrors[`${type}_name_en`] ? "border-red-500 border-2" : "border-gray-200"}`}
                                                                placeholder="Example: Mohammed"
                                                            />
                                                            {fieldErrors[`${type}_name_en`] && <p className="text-[10px] text-red-600 font-bold mt-1 flex items-center gap-1"><AlertCircle className="h-2.5 w-2.5" /> Name is required | الاسم مطلوب</p>}
                                                        </div>
                                                    ) : (
                                                        <p className="text-gray-900 font-medium py-1">{safeData.name_en || "-"}</p>
                                                    )}
                                                </div>

                                                {/* Parent Name Arabic */}
                                                <div className="space-y-1 text-right" dir="rtl">
                                                    <Label className="flex items-center gap-1 justify-end font-semibold text-xs text-gray-700">الإسم (بالعربي) | Name (Arabic)</Label>
                                                    {isEditing ? (
                                                        <div className="space-y-1">
                                                            <Input
                                                                value={safeData.name_ar || ""}
                                                                onChange={(e) => handler("name_ar", e.target.value)}
                                                                dir="rtl"
                                                                className={`h-10 rounded-lg text-right font-arabic ${fieldErrors[`${type}_name_ar`] ? "border-red-500 border-2" : "border-gray-200"}`}
                                                                placeholder="مثال: محمد"
                                                            />
                                                            {fieldErrors[`${type}_name_ar`] && <p className="text-[10px] text-red-600 font-bold mt-1 flex items-center justify-end gap-1"><AlertCircle className="h-2.5 w-2.5" /> Name is required | الاسم مطلوب</p>}
                                                        </div>
                                                    ) : (
                                                        <p className="text-gray-900 font-medium py-1 text-right font-arabic" dir="rtl">{safeData.name_ar || "-"}</p>
                                                    )}
                                                </div>

                                                {/* National ID */}
                                                <div className="space-y-1">
                                                    <Label className="flex items-center gap-1 font-semibold text-xs text-gray-700">National ID | الرقم المدني {(isEditing && (type === 'father' || type === 'mother' || isResponsible)) && <span className="text-red-500">*</span>}</Label>
                                                    {isEditing ? (
                                                        <div className="space-y-1">
                                                            <Input
                                                                value={safeData.national_id || safeData.other_datas?.national_id || ""}
                                                                onChange={(e) => handler("national_id", e.target.value)}
                                                                className={`h-10 rounded-lg ${fieldErrors[`${type}_national_id`] ? "border-red-500 border-2 shadow-[0_0_0_1px_rgba(239,68,68,0.1)]" : "border-gray-200"}`}
                                                                placeholder="12 digit ID"
                                                            />
                                                            {fieldErrors[`${type}_national_id`] && <p className="text-[10px] text-red-600 font-bold mt-1 flex items-center gap-1"><AlertCircle className="h-2.5 w-2.5" /> Required | مطلوب</p>}
                                                        </div>
                                                    ) : (
                                                        <p className="text-gray-900 font-medium py-1">{safeData.national_id || safeData.other_datas?.national_id || "-"}</p>
                                                    )}
                                                </div>

                                                {/* Passport Number */}
                                                <div className="space-y-1">
                                                    <Label className="flex items-center gap-1 font-semibold text-xs text-gray-700">Passport Number | رقم الجواز</Label>
                                                    {isEditing ? (
                                                        <Input
                                                            value={safeData.passport_number || safeData.other_datas?.passport_number || ""}
                                                            onChange={(e) => handler("passport_number", e.target.value)}
                                                            className="h-10 rounded-lg border-gray-200"
                                                            placeholder="Passport No."
                                                        />
                                                    ) : (
                                                        <p className="text-gray-900 font-medium py-1">{safeData.passport_number || safeData.other_datas?.passport_number || "-"}</p>
                                                    )}
                                                </div>

                                                {/* Phone 1 */}
                                                <div className="space-y-1">
                                                    <Label className="flex items-center gap-1 font-semibold text-xs text-gray-700">Phone 1 | الهاتف ١ {(type === 'father' || type === 'mother' || isResponsible) && <span className="text-red-500">*</span>}</Label>
                                                    {isEditing ? (
                                                        <div className="space-y-1">
                                                            <PhoneInput
                                                                defaultCountry={"om"}
                                                                value={safeData.phone1 || ""}
                                                                onChange={(phone) => handler("phone1", phone)}
                                                                inputStyle={{ width: "100%", height: "40px", border: `1px solid ${fieldErrors[`${type}_phone1`] ? "red" : "#e5e7eb"}`, borderRadius: "0.5rem" }}
                                                                className={fieldErrors[`${type}_phone1`] ? "border-red-500 rounded-md shadow-[0_0_0_1px_rgba(239,68,68,0.1)]" : ""}
                                                            />
                                                            {fieldErrors[`${type}_phone1`] && <p className="text-[10px] text-red-600 font-bold mt-1 flex items-center gap-1"><AlertCircle className="h-2.5 w-2.5" /> Phone number is required | رقم الهاتف مطلوب</p>}
                                                        </div>
                                                    ) : (
                                                        <p className="text-gray-900 font-medium py-1">{safeData.phone1 || "-"}</p>
                                                    )}
                                                </div>

                                                {/* Mobile */}
                                                <div className="space-y-1">
                                                    <Label className="font-semibold text-xs text-gray-700">Mobile | الجوال</Label>
                                                    {isEditing ? (
                                                        <PhoneInput
                                                            defaultCountry={"om"}
                                                            value={safeData.phone2 || ""}
                                                            onChange={(phone) => handler("phone2", phone)}
                                                            inputStyle={{ width: "100%", height: "40px", border: "1px solid #e5e7eb", borderRadius: "0.5rem" }}
                                                            className=""
                                                        />
                                                    ) : (
                                                        <p className="text-gray-900 font-medium py-1">{safeData.phone2 || "-"}</p>
                                                    )}
                                                </div>

                                                {/* Email */}
                                                <div className="space-y-1">
                                                    <Label className="font-semibold text-xs text-gray-700">Email | البريد الإلكتروني</Label>
                                                    {isEditing ? (
                                                        <Input
                                                            type="email"
                                                            value={safeData.email || ""}
                                                            onChange={(e) => handler("email", e.target.value)}
                                                            className="h-10 rounded-lg border-gray-200"
                                                        />
                                                    ) : (
                                                        <p className="text-gray-900 font-medium py-1 truncate">{safeData.email || "-"}</p>
                                                    )}
                                                </div>

                                                {/* Work Phone */}
                                                <div className="space-y-1">
                                                    <Label className="font-semibold text-xs text-gray-700">Work Phone | هاتف العمل</Label>
                                                    {isEditing ? (
                                                        <Input
                                                            value={safeData.work_phone || ""}
                                                            onChange={(e) => handler("work_phone", e.target.value)}
                                                            className="h-10 rounded-lg border-gray-200"
                                                        />
                                                    ) : (
                                                        <p className="text-gray-900 font-medium py-1">{safeData.work_phone || "-"}</p>
                                                    )}
                                                </div>

                                                {/* Occupation */}
                                                <div className="space-y-1">
                                                    <Label className="flex items-center gap-1 font-semibold text-xs text-gray-700">Occupation | المهنة {(type === 'father' || type === 'mother' || isResponsible) && <span className="text-red-500">*</span>}</Label>
                                                    {isEditing ? (
                                                        <div className="space-y-1">
                                                            <Input
                                                                value={safeData.occupation || ""}
                                                                onChange={(e) => handler("occupation", e.target.value)}
                                                                className={`h-10 rounded-lg ${fieldErrors[`${type}_occupation`] ? "border-red-500 border-2" : "border-gray-200"}`}
                                                            />
                                                            {fieldErrors[`${type}_occupation`] && <p className="text-[10px] text-red-600 font-bold mt-1 flex items-center gap-1"><AlertCircle className="h-2.5 w-2.5" /> Required | مطلوب</p>}
                                                        </div>
                                                    ) : (
                                                        <p className="text-gray-900 font-medium py-1">{safeData.occupation || "-"}</p>
                                                    )}
                                                </div>

                                                {/* Workplace */}
                                                <div className="space-y-1">
                                                    <Label className="font-semibold text-xs text-gray-700">Workplace | مكان العمل</Label>
                                                    {isEditing ? (
                                                        <Input
                                                            value={safeData.workplace || ""}
                                                            onChange={(e) => handler("workplace", e.target.value)}
                                                            className="h-10 rounded-lg border-gray-200"
                                                        />
                                                    ) : (
                                                        <p className="text-gray-900 font-medium py-1">{safeData.workplace || "-"}</p>
                                                    )}
                                                </div>

                                                {/* Address */}
                                                <div className="md:col-span-2 space-y-1">
                                                    <Label className="font-semibold text-xs text-gray-700">Address | العنوان</Label>
                                                    {isEditing ? (
                                                        <Input
                                                            value={safeData.address || ""}
                                                            onChange={(e) => handler("address", e.target.value)}
                                                            className="h-10 rounded-lg border-gray-200"
                                                        />
                                                    ) : (
                                                        <p className="text-gray-900 font-medium py-1">{safeData.address || "-"}</p>
                                                    )}
                                                </div>

                                                {/* Guardian ID Document */}
                                                <div className="md:col-span-2 space-y-2 pt-4 border-t border-gray-100">
                                                    <Label className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-gray-500">
                                                        ID Document | وثيقة الهوية {(isEditing && (type === 'father' || type === 'mother' || isResponsible)) && <span className="text-red-500">*</span>}
                                                    </Label>
                                                    <div className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all duration-300 ${fieldErrors[`${type}_id_document`]
                                                            ? "bg-red-50 border-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.1)]"
                                                            : "bg-gray-50/50 border-gray-100"
                                                        }`}>
                                                        <div className="flex items-center gap-3">
                                                            {(safeData.id_document || safeData.guardian_id_document) ? (
                                                                <div className="flex items-center gap-2">
                                                                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                                                        <FileIcon className="h-4 w-4" />
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[11px] font-bold text-gray-700">Document Uploaded</span>
                                                                        <span className="text-[9px] text-gray-400 capitalize">{type} ID Verified</span>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className={`flex items-center gap-2 ${fieldErrors[`${type}_id_document`] ? 'text-red-700 font-bold animate-pulse' : 'text-gray-400'}`}>
                                                                    <AlertCircle className={`h-4 w-4 ${fieldErrors[`${type}_id_document`] ? 'text-red-600' : ''}`} />
                                                                    <span className="text-[11px] italic">Missing ID Document | ملف مفقود</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            {(safeData.id_document || safeData.guardian_id_document) && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50"
                                                                    onClick={() => handleViewDocument(safeData.id_document instanceof File ? URL.createObjectURL(safeData.id_document) : (safeData.id_document || safeData.guardian_id_document))}
                                                                    title="View | عرض"
                                                                >
                                                                    <EyeIcon className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                            {isEditing && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-9 px-3 gap-2 bg-white border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 transition-all shadow-sm"
                                                                    onClick={() => {
                                                                        const input = document.createElement("input");
                                                                        input.type = "file";
                                                                        input.accept = ".pdf,image/*";
                                                                        input.onchange = (e) => {
                                                                            const file = (e.target as HTMLInputElement).files?.[0];
                                                                            if (file) handler("id_document", file);
                                                                        };
                                                                        input.click();
                                                                    }}
                                                                >
                                                                    <Camera className="h-4 w-4" />
                                                                    <span className="text-[10px] font-bold">Upload ID Copy | تحميل الهوية</span>
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    }

                                    return (
                                        <div className="md:col-span-2 text-center py-4 bg-gray-50 italic text-gray-400 text-sm rounded-lg border border-dashed border-gray-200">
                                            No data available for this guardian | لا تتوفر بيانات لهذا الوصي
                                        </div>
                                    );
                                })()}
                            </CardContent>
                        </Card>
                    );
                };

                return (
                    <div className="space-y-8">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                                <UserPlus className="h-7 w-7 text-primary" />
                                Guardians Details | بيانات أولياء الأمور والوصي
                            </h2>
                            {!isEditing && (
                                <div className="flex gap-2">
                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-full border border-blue-100 uppercase tracking-wider">
                                        Multiple Holders | حاملي بيانات متعددة
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-8">
                            {/* Sort guardians so the responsible one is first */}
                            {(() => {
                                const sections = [
                                    { data: student.father, type: 'father' as const },
                                    { data: student.mother, type: 'mother' as const },
                                    { data: student.relative || (student.relationship === 'relative' ? student.guardian : null), type: 'relative' as const }
                                ];

                                // Only show Father and Mother always. 
                                // Show Relative ONLY if it's the responsible relationship while editing, 
                                // or if it has existing data while viewing.
                                return sections
                                    .filter(s => {
                                        if (s.type === 'father' || s.type === 'mother') return true;
                                        if (s.type === 'relative') {
                                            if (isEditing) return student.relationship === 'relative';
                                            return !!s.data && Object.keys(s.data).length > 0;
                                        }
                                        return false;
                                    })
                                    .sort((a, b) => {
                                        const isAResponsible = student.relationship === a.type;
                                        const isBResponsible = student.relationship === b.type;
                                        if (isAResponsible) return -1;
                                        if (isBResponsible) return 1;
                                        return 0;
                                    })
                                    .map(s => renderGuardianSection(s.data, s.type));
                            })()}
                        </div>
                    </div>
                );
            })()}


            {/* Documents Card */}
            <Card className={fieldErrors.student_id_proof ? "border-red-500 border-2 shadow-[0_0_0_4px_rgba(239,68,68,0.1)] transition-all duration-300" : ""}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <FileIcon className="h-5 w-5 text-primary" />
                        Documents Management | إدارة الوثائق {isEditing && <span className="text-red-500">*</span>}
                    </CardTitle>
                    {fieldErrors.student_id_proof && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 text-[10px] font-bold rounded-full border border-red-200 animate-pulse">
                            <AlertCircle className="h-3 w-3" />
                            <span>ID PROOF REQUIRED | بطاقة الهوية مطلوبة</span>
                        </div>
                    )}
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
                                                                const updatedDocs = [...(student.student_documents || [])];
                                                                updatedDocs[index] = {
                                                                    ...updatedDocs[index],
                                                                    file: file,
                                                                    file_url: URL.createObjectURL(file),
                                                                    description: updatedDocs[index].document_type === "OTHER" ? updatedDocs[index].description : (DOCUMENT_TYPES.find(t => t.value === updatedDocs[index].document_type)?.label.split(" |")[0] || file.name)
                                                                };
                                                                setStudent({ ...student, student_documents: updatedDocs });
                                                                Swal.fire({
                                                                    title: 'Updated!',
                                                                    text: "Document file replaced locally. Don't forget to save.",
                                                                    icon: 'success',
                                                                    timer: 3000
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
                                                                const updatedDocs = [...(student!.student_documents || [])];
                                                                updatedDocs[index] = {
                                                                    ...updatedDocs[index],
                                                                    file: file,
                                                                    file_url: URL.createObjectURL(file),
                                                                    description: updatedDocs[index].document_type === "OTHER" ? updatedDocs[index].description : (DOCUMENT_TYPES.find(t => t.value === updatedDocs[index].document_type)?.label.split(" |")[0] || file.name)
                                                                };
                                                                setStudent({ ...student!, student_documents: updatedDocs });
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
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                                    <div className="col-span-1">
                                        <Label className="text-[10px] uppercase font-bold text-gray-400 mb-2 block px-1 tracking-wider">
                                            Document Type | نوع الوثيقة
                                        </Label>
                                        <Select
                                            value={newDocumentType}
                                            onValueChange={setNewDocumentType}
                                        >
                                            <SelectTrigger className="bg-white h-12 shadow-sm border-gray-200">
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

                                    <div className="relative group col-span-1 md:col-span-2">
                                        <Label className="text-[10px] uppercase font-bold text-gray-400 mb-2 block px-1 tracking-wider">
                                            {newDocumentType ? `Upload ${DOCUMENT_TYPES.find(t => t.value === newDocumentType)?.label.split(" |")[0] || "File"} | تحميل` : "Pick File | تحميل"}
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                key={fileInputKey}
                                                type="file"
                                                multiple
                                                accept={newDocumentType === "PHOTO" ? "image/*" : ".pdf,image/*"}
                                                className={`bg-white cursor-pointer h-12 shadow-sm border-gray-200 transition-all duration-300 ${!newDocumentType ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:border-primary/50'}`}
                                                disabled={!newDocumentType}
                                                onChange={(e) => {
                                                    const files = Array.from(e.target.files || []);
                                                    if (files.length > 0) {
                                                        handleAddDocumentsAuto(files);
                                                    }
                                                }}
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300">
                                                <Upload className="h-4 w-4" />
                                            </div>
                                        </div>
                                    </div>

                                    {newDocumentType === "OTHER" && (
                                        <div className="md:col-span-3 mt-2">
                                            <Label className="text-[10px] uppercase font-bold text-gray-400 mb-2 block px-1 tracking-wider">
                                                Document Name | اسم الوثيقة
                                            </Label>
                                            <Input
                                                placeholder="Enter Document Name | أدخل اسم الوثيقة"
                                                value={newDocumentName}
                                                onChange={(e) => setNewDocumentName(e.target.value)}
                                                className="bg-white h-12 shadow-sm border-gray-200"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {isEditing && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 mb-12 px-4 transition-all duration-500">
                    <Button
                        onClick={() => {
                            setIsEditing(false);
                            setFieldErrors({});
                            fetchStudent();
                        }}
                        disabled={isSaving}
                        variant="outline"
                        className="w-full border-gray-300 text-gray-500 hover:bg-gray-50 h-14 text-lg font-bold rounded-2xl"
                    >
                        Cancel | إلغاء
                    </Button>
                    <Button
                        onClick={() => handleSave(true)}
                        disabled={isSaving}
                        className="w-full bg-[#662a14] hover:bg-[#662a14]/90 text-white shadow-xl shadow-brown-900/20 h-14 text-lg font-bold transition-all duration-300 transform hover:scale-[1.01] rounded-2xl uppercase tracking-wider"
                    >
                        {isSaving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <CheckCircle2 className="h-5 w-5 mr-3" />}
                        {student.isDraft ? "FINALIZE & SUBMIT | إكمال وإرسال" : "UPDATE STUDENT RECORD | تحديث سجل الطالب"}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default StudentDetailsPage;
