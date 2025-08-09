import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusIcon } from "lucide-react";
import {
  DownloadIcon,
  EyeIcon,
  FileIcon,
  PencilIcon,
  PrinterIcon,
  SaveIcon,
  Trash2,
  UserPlus,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { countries } from 'countries-list';

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
  file_url?: string;  // For existing documents
  file?: File;       // For new uploads
  description: string;
};

// Updated to match registration form
const GENDER_OPTIONS = [
  { value: "M", label: "Male | ذكر" },
  { value: "F", label: "Female | أنثى" },
];

// Updated to match registration form
const RELATIONSHIP_OPTIONS = [
  { value: "Father", label: "Father | الأب" },
  { value: "Mother", label: "Mother | الأم" },
  { value: "Other", label: "Guardian | الوصي" },
];

type Student = {
  id: string;
  admission_number: string;
  en_first_name: string;
  en_middle_name: string;
  en_last_name: string;
  ar_first_name: string;
  ar_middle_name: string;
  ar_last_name: string;
  photo_url: string | null;
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
  };
  
  // Documents
  student_documents?: Array<{
    id: string;
    document_type: string;
    file_url: string;
    description: string;
  }>;
  
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

export default function StudentDetailsPage() {
  const { id } = useParams();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [allSections, setAllSections] = useState<Section[]>([]);
  const [filteredSections, setFilteredSections] = useState<Section[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [newDocumentType, setNewDocumentType] = useState("");
  const [newDocumentFile, setNewDocumentFile] = useState<File | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
const [isReplacing, setIsReplacing] = useState<string | null>(null);

  // Countries list for dropdown
      const countryList = Object.entries(countries).map(([code, country]) => ({
        code,
        name: country.name
      }));
      countryList.sort((a, b) => a.name.localeCompare(b.name));

      const fetchDepartments = async () => {
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
          console.error(err);
          toast.error("Failed to load departments");
        }
      };

      const fetchSections = async () => {
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
          console.error(err);
          toast.error("Failed to load sections");
        }
      };

      const fetchStudent = async () => {
        setLoading(true);
        try {
          const token = localStorage.getItem("accessToken");
          const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/students/get-studentdetails-all/`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) throw new Error("Failed to fetch student data");
          const result = await response.json();

          if (!result.status || !Array.isArray(result.data)) {
            throw new Error("Invalid API response format");
          }

          const students = result.data.map((student: any) => {
            const documents = student.student_documents || 
                            student.documents || 
                            (student.student_documents ? student.student_documents : []);

            return {
              id: student.id,
              admission_number: student.admission_number,
              en_first_name: student.en_first_name,
              en_middle_name: student.en_middle_name || "",
              en_last_name: student.en_last_name,
              ar_first_name: student.ar_first_name,
              ar_middle_name: student.ar_middle_name || "",
              ar_last_name: student.ar_last_name,
              photo_url: student.photo || student.photo_url || null,
              email: student.email || "",
              phone: student.phone || "",
              date_of_birth: student.date_of_birth,
              age_years: calculateAge(student.date_of_birth),
              gender: student.gender, // Keep as M/F, don't convert to display value
              religion: student.religion || "",
              nationality: student.nationality || "",
              address: student.address || "",
              city: student.city || "",
              state: student.state || "",
              postal_code: student.postal_code || "",
              country: student.country || "",
              admission_class: student.admission_class || { id: "", department_name: "Unknown" },
              section: student.section || { id: "", name: "Unknown" },
              admission_date: student.admission_date || "",
              previous_school: student.previous_school || "",
              has_special_needs: student.has_special_needs || false,
              special_needs_details: student.special_needs_details || "",
              is_promoted: student.is_promoted || false,
              is_active: student.is_active !== undefined ? student.is_active : true,
              is_verified_registration_officer: student.is_verified_registration_officer || false,
              guardian: {
                ...student.guardian,
                name_en: student.guardian?.name_en || "",
                name_ar: student.guardian?.name_ar || "",
                phone: student.guardian?.phone || "",
                email: student.guardian?.email || "",
                address: student.guardian?.address || "",
                relationship: student.guardian?.relationship || "",
                national_id: student.guardian?.national_id || "",
                passport_number: student.guardian?.passport_number || "",
                work_phone: student.guardian?.work_phone || "",
                home_phone: student.guardian?.home_phone || "",
                mobile: student.guardian?.mobile || "",
                occupation: student.guardian?.occupation || "",
              },
              student_documents: documents.map((doc: any) => ({
                id: doc.id,
                document_type: doc.document_type,
                file_url: doc.file || doc.file_url,
                description: doc.description || (doc.file ? doc.file.split('/').pop() : ""),
              })),
              status: student.is_verified_registration_officer ? "verified" : "pending",
            };
          });

          const foundStudent = students.find((s) => s.id === id);
          if (foundStudent) {
            setStudent(foundStudent);
            // Filter sections for the current department
            if (foundStudent.admission_class.id) {
              const sectionsForDepartment = allSections.filter(
                (section) => section.department === foundStudent.admission_class.id
              );
              setFilteredSections(sectionsForDepartment);
            }
          } else {
            toast.error("Student not found");
          }
        } catch (error) {
          console.error("Error fetching student:", error);
          toast.error("Failed to load student data");
        } finally {
          setLoading(false);
        }
      };

      useEffect(() => {
        fetchDepartments();
        fetchSections();
      }, []);

      useEffect(() => {
        if (departments.length > 0 && allSections.length > 0) {
          fetchStudent();
        }
      }, [id, departments, allSections]);

      // Filter sections when department changes
      useEffect(() => {
        if (student && student.admission_class.id) {
          const sectionsForDepartment = allSections.filter(
            (section) => section.department === student.admission_class.id
          );
          setFilteredSections(sectionsForDepartment);
        }
      }, [student?.admission_class.id, allSections]);

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

      const handleDepartmentChange = (departmentId: string) => {
        if (!student) return;
        setStudent({
          ...student,
          admission_class: {
            id: departmentId,
            department_name: departments.find(d => d.id === departmentId)?.department_name || ""
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
        setStudent({ ...student, [field]: value });
      };

      const handleGuardianChange = (field: keyof Student['guardian'], value: any) => {
        if (!student) return;
        setStudent({
          ...student,
          guardian: {
            ...student.guardian,
            [field]: value
          }
        });
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
              admission_class: student.admission_class.id,
              section: student.section.id,
              admission_date: student.admission_date,
              previous_school: student.previous_school,
              has_special_needs: student.has_special_needs,
              special_needs_details: student.special_needs_details,
              is_promoted: student.is_promoted,
              is_active: student.is_active,
              is_verified_registration_officer: student.is_verified_registration_officer
            },
            guardian: {
              id: student.guardian.id,
              name_en: student.guardian.name_en,
              name_ar: student.guardian.name_ar,
              phone: student.guardian.phone,
              email: student.guardian.email,
              address: student.guardian.address,
              relationship: student.guardian.relationship,
              national_id: student.guardian.national_id,
              passport_number: student.guardian.passport_number,
              work_phone: student.guardian.work_phone,
              home_phone: student.guardian.home_phone,
              mobile: student.guardian.mobile,
              occupation: student.guardian.occupation,
            }
          };

          // Prepare document metadata matching registration form structure
                  const form = new FormData();
            const documentMetadata = [];
            student.student_documents?.forEach((doc, i) => {
              const meta: any = {
                document_type: doc.document_type,
                description: doc.description,
              };
              if (doc.id && /^[0-9a-fA-F-]{36}$/.test(doc.id)) {
                // Only include id if it's a real UUID
                meta.id = doc.id;
              }
              if ('file' in doc && doc.file instanceof File) {
                meta.file_field = `document_file_${i}`;
                form.append(`document_file_${i}`, doc.file);
              }
              documentMetadata.push(meta);
            });


        
          form.append("guardian", JSON.stringify(requestBody.guardian));
          form.append("student", JSON.stringify(requestBody.student));
          form.append("student_documents", JSON.stringify(documentMetadata));

        

          console.log("Sending payload:", {
            student: requestBody.student,
            guardian: requestBody.guardian,
            student_documents: documentMetadata
          });

          const res = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/students/student-with-guardian/edit/${student.id}/`,
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: form
            }
          );

          if (!res.ok) {
            const errorData = await res.json();
            console.error("API Error Response:", errorData);
            throw new Error(errorData.errors || errorData.message || "Failed to save data");
          }

          const result = await res.json();
          setIsEditing(false);
          toast.success("Student updated successfully");
          
          // Refresh data
          fetchStudent();

        } catch (err) {
          console.error("Update error:", err);
          toast.error(err instanceof Error ? err.message : "Update failed");
        }
      };

      const handleAddDocument = () => {
        if (!student || !newDocumentType || !newDocumentFile) {
          toast.error("Please select document type and upload a file");
          return;
        }
        
        setStudent({
          ...student,
          student_documents: [
            ...(student.student_documents || []),
            {
              id: `temp-${Date.now()}`,
              document_type: newDocumentType,
              file: newDocumentFile,
              file_url: URL.createObjectURL(newDocumentFile),
              description: newDocumentFile.name
            }
          ]
        });

        setNewDocumentType("");
        setNewDocumentFile(null);
        toast.success("Document added");
      };

      const handleViewDocument = (fileUrl: string) => {
        const fullUrl = fileUrl.startsWith('http') 
          ? fileUrl 
          : `${import.meta.env.VITE_DOMAIN}${fileUrl}`;
        window.open(fullUrl, "_blank");
      };

      const handlePrintDocument = (fileUrl: string) => {
        const fullUrl = fileUrl.startsWith('http') 
          ? fileUrl 
          : `${import.meta.env.VITE_DOMAIN}${fileUrl}`;
        window.open(fullUrl, '_blank');
      };

      const handleDownloadDocument = (fileUrl: string, fileName: string) => {
        const fullUrl = fileUrl.startsWith('http') 
          ? fileUrl 
          : `${import.meta.env.VITE_DOMAIN}${fileUrl}`;
        window.open(fullUrl, '_blank');
      };

      const handleDownloadApplication = async () => {
        if (!id) return;
        setIsDownloading(true);
        try {
          const token = localStorage.getItem("accessToken");
          const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/students/students/${id}/download-application/`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (!response.ok) throw new Error("Failed to download application");
          
          const contentDisposition = response.headers.get('content-disposition');
          let filename = 'student_application.pdf';
          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
            if (filenameMatch?.[1]) filename = filenameMatch[1];
          }

          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        } catch (error) {
          console.error("Download error:", error);
          toast.error("Failed to download application");
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

      async function replaceDocumentFile(docId: string, newFile: File, description: string, token: string, API_BASE_URL: string) {
      const form = new FormData();
      form.append("file", newFile);
      form.append("description", description);
      const res = await fetch(`${API_BASE_URL}/students/student-document/${docId}/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (!res.ok) throw new Error("Failed to replace document");
      return res.json();
    }

// Delete document
      async function deleteDocument(docId: string, token: string, API_BASE_URL: string) {
        const res = await fetch(`${API_BASE_URL}/students/student-document/${docId}/`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
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
          <Button
            variant="outline"
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
          >
            {isEditing ? (
              <>
                <SaveIcon className="w-4 h-4 mr-2" />
                Save
              </>
            ) : (
              <>
                <PencilIcon className="w-4 h-4 mr-2" />
                Edit
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadApplication}
            disabled={isDownloading}
          >
            <DownloadIcon className="w-4 h-4 mr-2" />
            {isDownloading ? "Downloading..." : "Download Application"}
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            Back
          </Button>
        </div>
      </div>

      {/* Personal Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {/* Admission Info */}
          <div className="space-y-1">
            <Label>Admission Number</Label>
            <p>{student.admission_number}</p>
          </div>

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
                country={'om'}
                value={student.phone}
                onChange={(phone) => handleChange("phone", phone)}
                inputStyle={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                }}
              />
            ) : (
              <p>{student.phone || "-"}</p>
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
              <p>{GENDER_OPTIONS.find(g => g.value === student.gender)?.label.split(" |")[0] || student.gender}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Religion</Label>
            {isEditing ? (
              <Input
                value={student.religion}
                onChange={(e) => handleChange("religion", e.target.value)}
              />
            ) : (
              <p>{student.religion || "-"}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Nationality</Label>
            {isEditing ? (
              <Input
                value={student.nationality}
                onChange={(e) => handleChange("nationality", e.target.value)}
              />
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
                onValueChange={(value) => handleChange("section", { id: value, name: filteredSections.find(s => s.id === value)?.name || "" })}
                disabled={!student.admission_class.id}
              >
                <SelectTrigger>
                  <SelectValue placeholder={!student.admission_class.id ? "Select department first" : "Select section"} />
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
                onChange={(e) => handleChange("previous_school", e.target.value)}
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
                  onChange={(e) => handleChange("has_special_needs", e.target.checked)}
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
                  onChange={(e) => handleChange("special_needs_details", e.target.value)}
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
        </CardContent>
      </Card>

      {/* Guardian Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Guardian Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Name (English)</Label>
            {isEditing ? (
              <Input
                value={student.guardian.name_en}
                onChange={(e) => handleGuardianChange("name_en", e.target.value)}
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
                onChange={(e) => handleGuardianChange("name_ar", e.target.value)}
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
                onValueChange={(value) => handleGuardianChange("relationship", value)}
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
                {RELATIONSHIP_OPTIONS.find(r => r.value === student.guardian.relationship)?.label.split(" |")[0].trim() || student.guardian.relationship || "-"}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Phone</Label>
            {isEditing ? (
              <PhoneInput
                country={'om'}
                value={student.guardian.phone}
                onChange={(phone) => handleGuardianChange("phone", phone)}
                inputStyle={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
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
                country={'om'}
                value={student.guardian.mobile}
                onChange={(mobile) => handleGuardianChange("mobile", mobile)}
                inputStyle={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
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
                country={'om'}
                value={student.guardian.work_phone}
                onChange={(work_phone) => handleGuardianChange("work_phone", work_phone)}
                inputStyle={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
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
                country={'om'}
                value={student.guardian.home_phone}
                onChange={(home_phone) => handleGuardianChange("home_phone", home_phone)}
                inputStyle={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
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
                onChange={(e) => handleGuardianChange("occupation", e.target.value)}
              />
            ) : (
              <p>{student.guardian.occupation || "-"}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>National ID</Label>
            {isEditing ? (
              <Input
                value={student.guardian.national_id}
                onChange={(e) => handleGuardianChange("national_id", e.target.value)}
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
                onChange={(e) => handleGuardianChange("passport_number", e.target.value)}
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
                onChange={(e) => handleGuardianChange("address", e.target.value)}
              />
            ) : (
              <p>{student.guardian.address || "-"}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Documents Card */}
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent>

          {student.student_documents && student.student_documents.length > 0 ? (
            <div className="space-y-4">
              {student.student_documents.map((doc, index) => (
                <div
                  key={doc.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <FileIcon className="h-5 w-5 text-gray-500" />
                    <div>
                      <span className="font-medium">
                        {DOCUMENT_TYPES.find(t => t.value === doc.document_type)?.label.split(" |")[0].trim() || doc.document_type}
                      </span>
                      {doc.description && (
                        <p className="text-sm text-gray-500">
                          {doc.description}
                          {'file' in doc && doc.file instanceof File ? ` (New upload: ${doc.file.name})` : ''}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {/* VIEW Button */}
                    {'file_url' in doc && doc.file_url && !('file' in doc) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDocument(doc.file_url!)}
                        className="flex items-center gap-1"
                      >
                        <EyeIcon className="h-4 w-4" />
                        View
                      </Button>
                    )}

                    {/* PRINT Button */}
                    {'file_url' in doc && doc.file_url && !('file' in doc) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePrintDocument(doc.file_url!)}
                        className="flex items-center gap-1"
                      >
                        <PrinterIcon className="h-4 w-4" />
                        Print
                      </Button>
                    )}

                    {/* DOWNLOAD Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if ('file' in doc && doc.file instanceof File) {
                          const url = URL.createObjectURL(doc.file);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = doc.file.name;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        } else if ('file_url' in doc && doc.file_url) {
                          handleDownloadDocument(doc.file_url, doc.document_type);
                        }
                      }}
                      className="flex items-center gap-1"
                    >
                      <DownloadIcon className="h-4 w-4" />
                      Download
                    </Button>

                    {/* DELETE Button (API call, then refresh) */}
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      // Add confirmation dialog
                      if (!confirm("Are you sure you want to delete this document?")) {
                        return;
                      }

                      console.log("Deleting document:", doc.id);
                      console.log("Document details:", doc);
                      
                      

                      if (!doc.id) {
                        toast.error("Document ID missing");
                        return;
                      }

                      try {
                        // Optimistic UI update
                        setStudent(prev => {
                          if (!prev) return null;
                          return {
                            ...prev,
                            student_documents: prev.student_documents?.filter(d => d.id !== doc.id) || []
                          };
                        });

                        const token = localStorage.getItem("accessToken");
                        if (!token) {
                          throw new Error("Authentication token missing");
                        }

                        const res = await fetch(
                          `${import.meta.env.VITE_API_BASE_URL}/students/student-document/${doc.id}/`,
                          {
                            method: "DELETE",
                            headers: {
                              Authorization: `Bearer ${token}`,
                            },
                          }
                        );

                        console.log("Delete response:", res);
                        
                        if (!res.ok) {
                          // Revert UI if API call fails
                          fetchStudent();
                          const errorData = await res.json().catch(() => ({}));
                          throw new Error(errorData.message || "Failed to delete document");
                        }

                        toast.success("Document deleted successfully");
                      } catch (err) {
                        console.error("Delete error:", err);
                        toast.error(err instanceof Error ? err.message : "Failed to delete document");
                      }
                    }}
                    className="text-red-500 hover:text-red-700"
                    disabled={isDeleting} // Add isDeleting state if needed
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}

                    {/* REPLACE Button (API call, then refresh) */}
                {isEditing && 'file_url' in doc && !('file' in doc) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.pdf,.jpg,.jpeg,.png';
                      input.onchange = async (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (!file) return;

                        // Add file validation
                        const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
                        if (!validTypes.includes(file.type)) {
                          toast.error("Invalid file type. Please upload PDF, JPEG, or PNG");
                          return;
                        }

                        // File size limit (5MB)
                        if (file.size > 5 * 1024 * 1024) {
                          toast.error("File size too large. Max 5MB allowed");
                          return;
                        }

                        try {
                          const form = new FormData();
                          form.append("file", file);
                          form.append("description", file.name);

                          const token = localStorage.getItem("accessToken");
                          if (!token) {
                            throw new Error("Authentication token missing");
                          }

                          // Show loading state (you'll need to add this state)
                            setLoading(true);
                          setIsReplacing(doc.id);

                          const res = await fetch(
                            `${import.meta.env.VITE_API_BASE_URL}/students/student-document/${doc.id}/`,
                            {
                              method: "PATCH",
                              headers: {
                                Authorization: `Bearer ${token}`,
                              },
                              body: form,
                            }
                          );


                          if (!res.ok) {
                            const errorData = await res.json().catch(() => ({}));
                            throw new Error(errorData.message || "Failed to replace document");
                          }
                          setLoading(false);

                          // Optimistic UI update instead of full refresh
                          setStudent(prev => {
                            if (!prev) return null;
                            return {
                              ...prev,
                              student_documents: prev.student_documents?.map(d => 
                                d.id === doc.id 
                                  ? { ...d, file_url: URL.createObjectURL(file) } 
                                  : d
                              ) || []
                            };
                          });

                          toast.success("Document replaced successfully");
                        } catch (err) {
                          console.error("Replace error:", err);
                          toast.error(err instanceof Error ? err.message : "Failed to replace document");
                        } finally {
                          setIsReplacing(null);
                          setLoading(false);
                          // Clean up file input
                          input.value = '';
                        }
                      };
                      input.click();
                    }}
                    className="flex items-center gap-1"
                    disabled={isReplacing === doc.id} // Disable during replacement
                  >
                    {isReplacing === doc.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <PencilIcon className="h-4 w-4" />
                        Replace
                      </>
                    )}
                  </Button>
                )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No documents uploaded</p>
          )}

          {isEditing && (
            <div className="mt-4 p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Add New Document</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <Select 
                  value={newDocumentType} 
                  onValueChange={(value) => setNewDocumentType(value)}
                >
                  <SelectTrigger className="w-full">
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
                
                <Input 
                  type="file" 
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setNewDocumentFile(e.target.files?.[0] || null)} 
                />
                
                <Button 
                  onClick={handleAddDocument}
                  disabled={!newDocumentType || !newDocumentFile}
                  className="flex items-center gap-1"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Document
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}