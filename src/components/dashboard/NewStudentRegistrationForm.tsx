import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { countries } from 'countries-list';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, Upload, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
  { value: "Father", label: "Father | الأب" },
  { value: "Mother", label: "Mother | الأم" },
  { value: "Other", label: "Guardian | الوصي" },
];

const GENDER_OPTIONS = [
  { value: "M", label: "Male | ذكر" },
  { value: "F", label: "Female | أنثى" },
];

const NewStudentRegistrationForm = () => {
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
    sections: false,
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
    photo: null as File | null,
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    religion: "",
    nationality: "",
    address: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    admission_class: "",
    section: "",
    admission_date: "",
    previous_school: "",
    has_special_needs: false,
    special_needs_details: "",

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
    home_phone: "",
    mobile: "",
    occupation: "",

    // Documents
      student_documents: [] as Array<{
      document_type: string;
      file: File;
      description: string;
    }>
  });

  const [currentDocument, setCurrentDocument] = useState({
    type: "",
    file: null as File | null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [filteredSections, setFilteredSections] = useState<
    Array<{
      id: string;
      name: string;
    }>
  >([]);

  const [allSections, setAllSections] = useState<
    Array<{
      id: string;
      name: string;
      department: string;
    }>
  >([]);

  // Fetch all departments (admission classes)
  const fetchDepartments = async () => {
    setIsLoading((prev) => ({ ...prev, departments: true }));
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/students/department/`,
      );
      const data = await response.json();
      setDepartments(data.data || []);
    } catch (error) {
      console.error("Error fetching departments:", error);
      toast.error("Failed to load admission classes");
    } finally {
      setIsLoading((prev) => ({ ...prev, departments: false }));
    }
  };

  // Fetch all sections
  const fetchSections = async () => {
    setIsLoading((prev) => ({ ...prev, sections: true }));
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/students/section/`,
       
      );
      const data = await response.json();
      setAllSections(data.data || []);
      setFilteredSections([]); // Initially no sections shown until department selected
    } catch (error) {
      console.error("Error fetching sections:", error);
      toast.error("Failed to load sections");
    } finally {
      setIsLoading((prev) => ({ ...prev, sections: false }));
    }
  };

  const handleDepartmentChange = (departmentId: string) => {
    setFormData({
      ...formData,
      admission_class: departmentId,
      section: "", // Reset section when department changes
    });

    // Filter sections based on selected department
    const sectionsForDepartment = allSections.filter(
      (section) => section.department === departmentId
    );
    setFilteredSections(sectionsForDepartment);
  };

  useEffect(() => {
    fetchDepartments();
    fetchSections();
  }, []);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  if (
    !formData.en_first_name ||
    !formData.ar_first_name ||
    !formData.date_of_birth ||
    !formData.name_en ||
    !formData.name_ar ||
    !formData.phone
  ) {
    toast.error("Please fill in all required fields");
    setIsSubmitting(false);
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
      home_phone: formData.home_phone,
      mobile: formData.mobile,
      occupation: formData.occupation
    };

    const student = {
      admission_number: formData.admission_number,
      en_first_name: formData.en_first_name,
      en_middle_name: formData.en_middle_name,
      en_last_name: formData.en_last_name,
      ar_first_name: formData.ar_first_name,
      ar_middle_name: formData.ar_middle_name,
      ar_last_name: formData.ar_last_name,
      photo: null, // sent separately
      email: formData.email,
      phone: formData.phone,
      date_of_birth: formData.date_of_birth,
      age_years: calculateAge(formData.date_of_birth),
      gender: formData.gender,
      religion: formData.religion,
      nationality: formData.nationality,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      postal_code: formData.postal_code,
      country: formData.country,
      admission_class: formData.admission_class,
      section: formData.section,
      admission_date: formData.admission_date,
      previous_school: formData.previous_school,
      has_special_needs: formData.has_special_needs,
      special_needs_details: formData.special_needs_details,
      is_promoted: true,
      is_active: true,
      is_verified_registration_officer: false
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
    // 2. Build student_documents metadata
   const documentMetadata = formData.student_documents.map((doc, i) => ({
      document_type: doc.document_type,
      description: doc.description || (typeof doc.file !== "string" ? (doc.file as File).name : `doc_${i}`),
      file_field: `document_file_${i}`
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

    // 5. Attach document files
    formData.student_documents.forEach((doc, i) => {
      if (typeof doc.file !== "string") {
        form.append(`document_file_${i}`, doc.file); // Must match file_field above
      }
    });

    // 6. Submit request
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/students/create-student-details/`, {
      method: "POST",
      body: form
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("API Error:", result);
       toast.success(result.message);
      throw new Error(result.message || "Failed to submit registration");
         
    }

    toast.success("Registration submitted successfully!");
    // Reset form if needed
//    setFormData({
//    admission_number: "",
//     en_first_name: "",
//     en_middle_name: "",
//     en_last_name: "",
//     ar_first_name: "",
//     ar_middle_name: "",
//     ar_last_name: "",
//     photo: null as File | null,
//     email: "",
//     phone: "",
//     date_of_birth: "",
//     gender: "",
//     religion: "",
//     nationality: "",
//     address: "",
//     city: "",
//     state: "",
//     postal_code: "",
//     country: "",
//     admission_class: "",
//     section: "",
//     admission_date: "",
//     previous_school: "",
//     has_special_needs: false,
//     special_needs_details: "",

//     name_en: "",
//     name_ar: "",
//     phone: "",
//     email: "",
//     address: "",
//     relationship: "",
//     national_id: "",
//     passport_number: "",
//     work_phone: "",
//     home_phone: "",
//     mobile: "",
//     occupation: "",

//   student_documents: [],
// });

  } catch (error) {
    console.error("Registration error:", error);
    toast.error(error instanceof Error ? error.message : "Failed to submit registration");
  } finally {
    setIsSubmitting(false);
  }
};


  const handleFileUpload = () => {
    if (!currentDocument.type || !currentDocument.file) {
      toast.error("Please select document type and upload a file");
      return;
    }

    const newDocument = {
      document_type: currentDocument.type,
      file: currentDocument.file,  // Raw File object
      description: currentDocument.file.name || "",
    };

    setFormData((prev) => ({
      ...prev,
      student_documents: [...prev.student_documents, newDocument],
    }));

    setCurrentDocument({
      type: "",
      file: null,
    });

    toast.success("Document uploaded successfully");
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        photo: e.target.files[0],
      });
      toast.success("Student photo uploaded");
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
    name: country.name
    
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





  return (
    <>
     {(isLoading.departments || isLoading.sections || isSubmitting) && <FullPageLoader />}

     <Card className="max-w-6xl mx-auto mt-20 p-10 bg-white shadow-lg">
           
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              New Student Registration | تسجيل طالب جديد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-14">
              {/* Student Information Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">
                  Student Information | معلومات الطالب
                </h3>
    
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Admission Number */}
                  <div>
                    <Label htmlFor="admission_number">
                      Admission Number | رقم القبول
                    </Label>
                    <Input
                      id="admission_number"
                      value={formData.admission_number}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          admission_number: e.target.value,
                        })
                      }
                      placeholder="ADM123456"
                    />
                  </div>
    
                  {/* Student Photo */}
                  <div>
                    <Label htmlFor="photo">Student Photo | صورة الطالب</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="photo"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                      />
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
        en_first_name: e.target.value
      });
    }}
    placeholder="e.g. Ahmed"
    required
  />
</div>
    
                                          <div>
  <Label htmlFor="ar_first_name">
    First Name (Arabic) * | الاسم الأول (عربي)
  </Label>
  <Input
    id="ar_first_name"
    value={formData.ar_first_name}
    onChange={(e) => setFormData({ ...formData, ar_first_name: e.target.value })}
    placeholder="أحمد"
    dir="rtl"
    required
  />
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
        en_middle_name: e.target.value
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
      setFormData({ ...formData, ar_middle_name: e.target.value })
    }
    placeholder="الاسم الأوسط"
    dir="rtl"
  />
</div>

<div>
  <Label htmlFor="en_last_name">Last Name (English) | اسم العائلة (إنجليزي)</Label>
  <Input
    id="en_last_name"
    value={formData.en_last_name}
    onChange={(e) => {
      setFormData({ 
        ...formData, 
        en_last_name: e.target.value
      });
    }}
    placeholder="e.g. Khan"
  />
</div>
    
                            
    
                           
    
                  {/* Arabic Name */}
          
    
<div>
  <Label htmlFor="ar_last_name">Last Name (Arabic) | اسم العائلة (عربي)</Label>
  <Input
    id="ar_last_name"
    value={formData.ar_last_name}
    onChange={(e) => setFormData({ ...formData, ar_last_name: e.target.value })}
    placeholder="خان"
    dir="rtl"
  />
</div>
    
                  {/* Contact Information */}
                  <div>
                    <Label htmlFor="email">Email | البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="student@example.com"
                    />
                  </div>
    
                <div>
                  <Label htmlFor="phone">Phone | الهاتف</Label>
                  <PhoneInput
                    defaultCountry="om" // Oman as default
                    value={formData.phone}
                    onChange={(phone) => setFormData({...formData, phone})}
                    inputStyle={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #d1d5db'
                    }}
                  />
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
                        setFormData({ ...formData, date_of_birth: e.target.value })
                      }
                      required
                    />
                  </div>
    
                  <div>
                    <Label htmlFor="gender">Gender * | الجنس</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) =>
                        setFormData({ ...formData, gender: value })
                      }
                    >
                      <SelectTrigger>
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
                  </div>
    
                  <div>
                    <Label htmlFor="religion">Religion | الديانة</Label>
                    <Input
                      id="religion"
                      value={formData.religion}
                      onChange={(e) =>
                        setFormData({ ...formData, religion: e.target.value })
                      }
                      placeholder="Religion"
                    />
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
                    />
                  </div>
    
                  {/* Address Information */}
                  <div>
                    <Label htmlFor="address">Address | العنوان</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      placeholder="123 Main St, City, Country"
                    />
                  </div>
    
                  <div>
                    <Label htmlFor="city">City | المدينة</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      placeholder="City"
                    />
                  </div>
    
                  <div>
                    <Label htmlFor="state">State | المحافظة</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value })
                      }
                      placeholder="State"
                    />
                  </div>
    
                  <div>
                    <Label htmlFor="postal_code">Postal Code | الرمز البريدي</Label>
                    <Input
                      id="postal_code"
                      value={formData.postal_code}
                      onChange={(e) =>
                        setFormData({ ...formData, postal_code: e.target.value })
                      }
                      placeholder="Postal code"
                    />
                  </div>
              
     
                          <div>
                <Label htmlFor="country">Country | الدولة</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => setFormData({ ...formData, country: value })}
                >
                  <SelectTrigger id="country" className="form-control">
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countryList.map((country) => (
                      <SelectItem key={country.code} value={country.name}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
    
                  {/* School Information */}
                  <div>
                    <Label htmlFor="admission_class">
                      Admission Class | الصف الدراسي
                    </Label>
                    <Select
                      value={formData.admission_class}
                      onValueChange={handleDepartmentChange}
                      disabled={isLoading.departments}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoading.departments ? "Loading..." : "Select class"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.department_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
    
                  <div>
                    <Label htmlFor="section">Section | القسم</Label>
                    <Select
                      value={formData.section}
                      onValueChange={(value) =>
                        setFormData({ ...formData, section: value })
                      }
                      disabled={isLoading.sections || !formData.admission_class}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            !formData.admission_class
                              ? "Select department first"
                              : isLoading.sections
                              ? "Loading..."
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
                  </div>
    
                  <div>
                    <Label htmlFor="admission_date">
                      Admission Date | تاريخ القبول
                    </Label>
                    <Input
                      id="admission_date"
                      type="date"
                      value={formData.admission_date}
                      onChange={(e) =>
                        setFormData({ ...formData, admission_date: e.target.value })
                      }
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
    
              {/* Guardian Information Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">
                  Guardian Information | معلومات ولي الأمر
                </h3>
    
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Guardian English Name */}
  <div>
  <Label htmlFor="name_en">Name (English) * | الاسم (إنجليزي)</Label>
  <Input
    id="name_en"
    value={formData.name_en}
    onChange={(e) => {
      setFormData({ 
        ...formData, 
        name_en: e.target.value
      });
    }}
    placeholder="Guardian name in English"
    required
  />
</div>
    
                  {/* Guardian Arabic Name */}
<div>
  <Label htmlFor="name_ar">Name (Arabic) * | الاسم (عربي)</Label>
  <Input
    id="name_ar"
    value={formData.name_ar}
    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
    placeholder="اسم ولي الأمر"
    dir="rtl"
    required
  />
</div>
    
                  {/* Contact Information */}
                  <div>
                    <Label htmlFor="phone">Phone * | الهاتف</Label>
                       <PhoneInput
                    defaultCountry="om" // Oman as default
                    value={formData.phone}
                    onChange={(phone) => setFormData({...formData, phone})}
                    inputStyle={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #d1d5db'
                    }}
                  />
                  </div>
    
                  <div>
                    <Label htmlFor="email">Email | البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="guardian@example.com"
                    />
                  </div>
    
                  <div>
                    <Label htmlFor="mobile">Mobile | الجوال</Label>
                     <PhoneInput
                    defaultCountry="om" 
                    id="mobile" 
                    value={formData.mobile}
                    onChange={(mobile) => setFormData({...formData, mobile})}
                    inputStyle={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #d1d5db'
                    }}
                  />
                  </div>
    
                  <div>
                    <Label htmlFor="work_phone">Work Phone | هاتف العمل</Label>
                     <PhoneInput
                    defaultCountry="om" 
                     id="work_phone"
                    value={formData.work_phone}
                    onChange={(work_phone) => setFormData({...formData, work_phone})}
                    inputStyle={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #d1d5db'
                    }}
                  />
                  </div>
    
                  <div>
                    <Label htmlFor="home_phone">Home Phone | الهاتف المنزلي</Label>
                     <PhoneInput
                    defaultCountry="om" 
                     id="home_phone"
                     value={formData.home_phone}
                    onChange={(home_phone) => setFormData({...formData, home_phone})}
                    inputStyle={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #d1d5db'
                    }}
                  />
                  </div>
    
                  {/* Relationship */}
                  <div>
                    <Label htmlFor="relationship">Relationship * | العلاقة</Label>
                    <Select
                      value={formData.relationship}
                      onValueChange={(value) =>
                        setFormData({ ...formData, relationship: value })
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
                  </div>
    
                  <div>
                    <Label htmlFor="occupation">Occupation | المهنة</Label>
                    <Input
                      id="occupation"
                      value={formData.occupation}
                      onChange={(e) =>
                        setFormData({ ...formData, occupation: e.target.value })
                      }
                      placeholder="Occupation"
                    />
                  </div>
    
                  {/* Identification */}
                  <div>
                    <Label htmlFor="national_id">
                      National ID | الهوية الوطنية
                    </Label>
                    <Input
                      id="national_id"
                      value={formData.national_id}
                      onChange={(e) =>
                        setFormData({ ...formData, national_id: e.target.value })
                      }
                      placeholder="A123456789"
                    />
                  </div>
    
                  <div>
                    <Label htmlFor="passport_number">
                      Passport Number | رقم الجواز
                    </Label>
                    <Input
                      id="passport_number"
                      value={formData.passport_number}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          passport_number: e.target.value,
                        })
                      }
                      placeholder="P987654321"
                    />
                  </div>
    
                  {/* Address */}
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Address | العنوان</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      placeholder="123 Main St, City, Country"
                    />
                  </div>
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
              <Button
                type="submit"
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700"
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

export default NewStudentRegistrationForm;
