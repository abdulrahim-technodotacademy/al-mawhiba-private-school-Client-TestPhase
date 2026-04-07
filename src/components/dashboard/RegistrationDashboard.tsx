import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Users,
  UserPlus,
  FileText,
  Upload,
  Search,
  ChevronUp,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FilterX,
  Clock,
} from "lucide-react";
import { useState, useEffect } from "react";
import NewStudentRegistrationForm from "./NewStudentRegistrationForm";
import { toast } from "@/hooks/use-toast";

type Student = {
  id: string;
  name_en: string;
  name_ar: string;
  admission_number: string;
  date_of_birth: string;
  gender: string;
  nationality: string;
  place_of_birth: string;
  religion: string;
  currentClass: string;
  selectedDepartment: string;
  selectedSection: string;
  currentSection: string;
  filteredSections: any;
  nextClass: string;
  nextSection: string;
  status: "pending" | "verified" | "rejected" | "draft";
  isDraft?: boolean;
  registrationDate: string;
  isNewRegistration?: boolean;
  guardian?: {
    name_en: string;
    name_ar: string;
    phone: string;
    relationship: string;
    national_id: string;
  };
  searchablePhones?: string;
  admission_class?: {
    id: string,
    department_name?: "10"
};
  documents?: Array<{
    type: string;
    file: string;
  }>;
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



const RegistrationDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialTab = params.get('tab');
  const initialStatus = params.get('status');

  const [activeTab, setActiveTab] = useState<"search" | "new" | "promotion">(
    (initialTab === 'search' || initialTab === 'new' || initialTab === 'promotion') 
      ? initialTab as any 
      : "new"
  );

  const [verificationStatus, setVerificationStatus] = useState<
    "all" | "pending" | "verified" | "draft"
  >(
    (initialStatus === 'all' || initialStatus === 'pending' || initialStatus === 'verified' || initialStatus === 'draft')
      ? initialStatus as any
      : "all"
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    const status = params.get('status') as "all" | "pending" | "verified" | "draft";
    
    if (tab === 'search' || tab === 'new' || tab === 'promotion') {
      setActiveTab(tab as any);
      if (tab === 'search' && status) {
        setVerificationStatus(status);
      }
    }
  }, [location.search]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sections, setSections] = useState([]);
  const [classList, setClassList] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
    // State for promotion tab filters

  const [selectedFilterSection, setSelectedFilterSection] = useState<string>('');
  const [filterableSections, setFilterableSections] = useState<Section[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('');
const [academicYears, setAcademicYears] = useState<string[]>([])
  const [filteredSections, setFilteredSections] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [promotingStudentId, setPromotingStudentId] = useState<string | null>(null);
    const [selectedStudents, setSelectedStudents] = useState<
      Record<string, boolean>
    >({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - replace with API calls




const loadStudents = async () => {
 

  try {
    const token = localStorage.getItem("accessToken");
     setLoading(true);
    const response = await fetch(
    //   `${import.meta.env.VITE_API_BASE_URL}/students/student/`,
      `${import.meta.env.VITE_API_BASE_URL}/students/get-studentdetails-all/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch students from API");
    }

      const result = await response.json();

      
      console.log(result.data);
      
      const studentsData: Student[] = result.data.map((student: any, index: number) => ({
      id: student.id,
      admission_number: student.admission_number,
      name_en: `${student.en_first_name} ${student.en_middle_name ?? ""} ${student.en_last_name}`.trim(),
      name_ar: `${student.ar_first_name} ${student.ar_middle_name ?? ""} ${student.ar_last_name}`.trim(),
      date_of_birth: student.date_of_birth,
      gender: student.gender === "M" ? "Male" : "Female",
      nationality: student.nationality,
      place_of_birth: student.city, // or use student.address if preferred
      religion: student.religion,
      currentClass: student.admission_class?.department_name || "Unknown",
      currentSection: student.section?.name || "Unknown",
      nextClass: "", // Optional: Update this if logic is available
      nextSection: "",
      status: student.is_draft ? "draft" : (student.is_verified_registration_officer ? "verified" : "pending"),
      isDraft: student.is_draft,
      registrationDate: student.admission_date || student.created_at || (student.other_datas?.admission_date) || "N/A",
      isNewRegistration: true,
      guardian: student.guardian,
      searchablePhones: [
        student.guardian?.phone1,
        student.guardian?.phone2,
        student.guardian?.work_phone,
        student.father?.phone1,
        student.father?.phone2,
        student.father?.work_phone,
        student.mother?.phone1,
        student.mother?.phone2,
        student.mother?.work_phone,
      ].filter(Boolean).join(" "),
      documents: [], // Populate this if available
    }));

    

 

    

    // const studentsData = result.data;
    setStudents(studentsData); // React will update state asynchronously
    // console.log("Students loaded:", studentsData); // Use this

   const uniqueClasses = Array.from(
      new Set(studentsData.map((student) => student.currentClass))
      
    ).sort((a, b) => {
      return isNaN(Number(a)) || isNaN(Number(b))
        ? a.localeCompare(b)
        : Number(a) - Number(b);
    });
     const uniqueYears = Array.from(
    new Set(studentsData.map(student => new Date(student.registrationDate).getFullYear().toString()))
  ).sort((a, b) => Number(b) - Number(a)); // Sort years in descending order

    setClassList(uniqueClasses);
    setStudents(studentsData);
  setAcademicYears(uniqueYears); // Store the extracted years in state


  } catch (error) {
    console.error("Error loading students:", error);
  } finally {
    setLoading(false);
  }
};



 const fetchDepartments = async () => {
    setLoading(true);
    const token = localStorage.getItem("accessToken");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/students/department/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch departments");
      }

      const data = await res.json();
      console.log(data.data);
      
      setDepartments(data.data);
    } catch (err: any) {
      console.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };


  const fetchSections = async () => {
  setLoading(true);
  const token = localStorage.getItem("accessToken");

  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/students/section/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch sections");
    }

    const result = await response.json();
    console.log("Sections:", result.data);
    setSections(result.data); // assuming you have: const [sections, setSections] = useState([])
  } catch (error: any) {
    console.error(error.message || "Something went wrong while fetching sections");
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchDepartments();
    fetchSections();
    loadStudents();
  }, []);

const handleClassChange = (classValue: string) => {
setSelectedClass(classValue);
  setSelectedFilterSection(''); // Reset section filter when class changes

  // Find the department object corresponding to the selected class name
  const department = departments.find(d => d.department_name === classValue);

  if (department) {
    // Filter the main sections list to get sections for this department
    const relevantSections = sections.filter(s => s.department === department.id);
    setFilterableSections(relevantSections);
  } else {
    // If no class is selected or found, clear the sections list
    setFilterableSections([]);
  }

  setSelectedStudents({});
}



const verifyStudent = async (studentId: string) => {
  setLoading(true);

  try {
    const token = localStorage.getItem("accessToken");

    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/students/student/${studentId}/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          is_verified_registration_officer: true,
          is_draft: false,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to verify student");
    }

   
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId
          ? { 
              ...student, 
              status: "verified" as const, 
              is_verified_registration_officer: true, 
              isDraft: false,
              admission_date: new Date().toISOString().split('T')[0]
            }
          : student
      )
    );
  } catch (error) {
    console.error("Error verifying student:", error);
  } finally {
    setLoading(false);
  }
};
const rejectStudent = async (studentId: string) => {
  setLoading(true);

  try {
    const token = localStorage.getItem("accessToken");

    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/students/student/${studentId}/`,
      {
        method: "PATCH", // or "PUT" if your backend expects full replacement
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          is_deleted: true,
          is_active: true,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to verify student");
    }

    // Optional: update UI immediately
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId
          ? { ...student, status: "rejected" }
          : student
      )
    );
  } catch (error) {
    console.error("Error verifying student:", error);
  } finally {
    setLoading(false);
  }
};





const promoteStudent = async (studentId: string, newClass: string, newSection: string) => {
  const token = localStorage.getItem("accessToken");
  
  // Validate selections
  if (!newClass || !newSection) {
    toast({
      title: "Error",
      description: "Please select both class and section",
      variant: "destructive",
    });
    return;
  }

  setPromotingStudentId(studentId); // Set promoting student ID

  try {
    const promoteRes = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/students/students/promote/${studentId}/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          admission_class: newClass,
          section: newSection,
        }),
      }
    );

    if (!promoteRes.ok) throw new Error("Failed to promote");

    toast({
      title: "Success! 🎉",
      description: "Student has been promoted successfully. Refreshing data...",
      variant: "default",
      className: "bg-green-600 text-white border-none font-bold",
    });

    // Provide immediate feedback by refreshing the lists
    await loadStudents();

  } catch (err) {
    console.error(err);
    toast({
      title: "Error",
      description: "Failed to complete promotion process",
      variant: "destructive",
    });
  } finally {
    setPromotingStudentId(null); // Reset promoting student ID
  }
};
const handleYearChange = (yearValue: string) => {
  setSelectedYear(yearValue);
  // Reset dependent filters for a better user experience
  setSelectedClass('');
  setSelectedFilterSection('');
  setFilterableSections([]);
};

const resetFilters = () => {
  setSelectedYear('');
  setSelectedClass('');
  setSelectedFilterSection('');
  setFilterableSections([]);
  setVerificationStatus('all');
  setSearchTerm('');
};

const filteredStudents = students.filter((student) => {
  // Common search logic for all tabs
  const searchLower = searchTerm.toLowerCase();
  const nameEn = student.name_en?.toLowerCase() || '';
  const nameAr = student.name_ar?.toLowerCase() || '';
  const admissionNumber = student.admission_number?.toLowerCase() || '';
  
  const matchesSearch = 
    !searchTerm ||
    admissionNumber.includes(searchLower) ||
    nameEn.includes(searchLower) ||
    nameAr.includes(searchLower) ||
    (student.searchablePhones && student.searchablePhones.includes(searchLower));

  if (!matchesSearch) {
    return false;
  }

  // Tab-specific filtering logic
  if (activeTab === 'search') {
    const matchesStatus = verificationStatus === "all" || student.status === verificationStatus;
    const matchesClass = !selectedClass || student.currentClass === selectedClass;
    const matchesSection = !selectedFilterSection || student.currentSection === selectedFilterSection;
    
    return matchesStatus && matchesClass && matchesSection;
  }

  if (activeTab === 'promotion') {
    const matchesClass = !selectedClass || student.currentClass === selectedClass;
    const matchesSection = !selectedFilterSection || student.currentSection === selectedFilterSection;

     return matchesClass && matchesSection;
  }
  
  return true; // Should not be reached if a tab is active
})
.sort((a, b) => {
  // Sort only on the "Search & Verify" tab
  if (activeTab === 'search') {
    const statusOrder = {
      draft: 1,
      pending: 2,
      rejected: 3,
      verified: 4,
    };
    return (statusOrder[a.status] || 5) - (statusOrder[b.status] || 5);
  }
  return 0; // No sorting on other tabs
});
  return (
<div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto">
  {/* Header Section */}
  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-gray-100">
    <div className="flex items-center gap-4">
      <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-200">
        <Users className="h-6 w-6 text-white" />
      </div>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
          Registration Officer
        </h1>
        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5" dir="rtl">
          موظف تسجيل
        </p>
      </div>
    </div>
    <div className="flex items-center gap-3 w-full lg:w-auto">
      <Button
        className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all h-11 px-8 rounded-full font-semibold text-sm group"
        onClick={() => setActiveTab("new")}
      >
        <UserPlus className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
        <span>New Registration | تسجيل جديد</span>
      </Button>
    </div>
  </div>

  {/* Summary Metrics */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <Card 
      className="bg-gradient-to-br from-blue-50 to-white border-blue-100 shadow-sm transition-all hover:shadow-md cursor-pointer hover:scale-[1.02]"
      onClick={() => navigate("/dashboard/registration?tab=search&status=all")}
    >
      <CardContent className="p-4 flex items-center gap-4">
        <div className="bg-blue-100 p-2.5 rounded-xl">
          <Users className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-0.5">Total Students</p>
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">
            {students.length}
          </h2>
        </div>
      </CardContent>
    </Card>

    <Card 
      className="bg-gradient-to-br from-yellow-50 to-white border-yellow-100 shadow-sm transition-all hover:shadow-md cursor-pointer hover:scale-[1.02]"
      onClick={() => navigate("/dashboard/registration?tab=search&status=pending")}
    >
      <CardContent className="p-4 flex items-center gap-4">
        <div className="bg-yellow-100 p-2.5 rounded-xl">
          <Clock className="h-5 w-5 text-yellow-600" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-yellow-600 mb-0.5">Pending Verification</p>
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">
            {students.filter(s => s.status === 'pending').length}
          </h2>
        </div>
      </CardContent>
    </Card>

    <Card 
      className="bg-gradient-to-br from-purple-50 to-white border-purple-100 shadow-sm transition-all hover:shadow-md cursor-pointer hover:scale-[1.02]"
      onClick={() => navigate("/dashboard/registration?tab=search&status=draft")}
    >
      <CardContent className="p-4 flex items-center gap-4">
        <div className="bg-purple-100 p-2.5 rounded-xl">
          <FileText className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-purple-600 mb-0.5">Draft Records</p>
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">
            {students.filter(s => s.status === 'draft').length}
          </h2>
        </div>
      </CardContent>
    </Card>
  </div>

  {/* Tabs */}
  <div className="flex overflow-x-auto pb-2 md:pb-0">
    <div className="flex space-x-1 md:space-x-4 border-b min-w-max">
      <button
        className={`px-3 py-2 md:px-6 md:py-3 text-sm md:text-base font-medium ${
          activeTab === "new"
            ? "border-b-2 border-blue-600 text-blue-600"
            : "text-gray-600"
        }`}
        onClick={() => navigate("/dashboard/registration?tab=new")}
      >
        <UserPlus className="inline mr-2 h-4 w-4" />
        <span className="hidden md:inline">New Registration | تسجيل جديد</span>
        <span className="md:hidden">New</span>
      </button>
      <button
        className={`px-3 py-2 md:px-6 md:py-3 text-sm md:text-base font-medium ${
          activeTab === "search"
            ? "border-b-2 border-blue-600 text-blue-600"
            : "text-gray-600"
        }`}
        onClick={() => {
          navigate("/dashboard/registration?tab=search&status=all");
        }}
      >
        <Search className="inline mr-2 h-4 w-4" />
        <span className="hidden md:inline">Search & Verify | البحث والتحقق</span>
        <span className="md:hidden">Search</span>
      </button>
      <button
        className={`px-3 py-2 md:px-6 md:py-3 text-sm md:text-base font-medium ${
          activeTab === "promotion"
            ? "border-b-2 border-blue-600 text-blue-600"
            : "text-gray-600"
        }`}
        onClick={() => {
          navigate("/dashboard/registration?tab=promotion");
        }}
      >
        <Users className="inline mr-2 h-4 w-4" />
        <span className="hidden md:inline">Student Promotion | ترقية الطلاب</span>
        <span className="md:hidden">Promotion</span>
      </button>
    </div>
  </div>

  {/* Content */}
  <div className="space-y-4 md:space-y-6">
    <div className={activeTab === "search" ? "block" : "hidden"}>
      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-gray-50/30 pb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">
                Student Verification
              </CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">التحقق من الطلاب</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={resetFilters}
                className="h-9 px-4 text-gray-500 hover:text-red-600 transition-colors border-gray-200"
                title="Reset all filters"
              >
                <FilterX className="h-4 w-4 mr-2" />
                Reset
              </Button>

              <div className="h-6 w-[1px] bg-gray-200 hidden sm:block mx-1" />
              
              <div className="flex items-center gap-2">
                <Select onValueChange={handleClassChange} value={selectedClass}>
                  <SelectTrigger className="w-[130px] h-9 bg-white border-gray-200 text-xs font-semibold">
                    <SelectValue placeholder="Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classList.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  onValueChange={(value) => setSelectedFilterSection(value)}
                  value={selectedFilterSection}
                  disabled={!selectedClass || filterableSections.length === 0}
                >
                  <SelectTrigger className="w-[130px] h-9 bg-white border-gray-200 text-xs font-semibold">
                    <SelectValue placeholder="Section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sections</SelectItem>
                    {filterableSections.map((sec) => (
                      <SelectItem key={sec.id} value={sec.name}>
                        {sec.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={verificationStatus}
                  onValueChange={(value: any) => setVerificationStatus(value)}
                >
                  <SelectTrigger className="w-[130px] h-9 bg-white border-gray-200 text-xs font-semibold">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="draft">Drafts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, phone, or Admission ID..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
             <div className="overflow-x-auto border rounded-xl overflow-hidden">
               <Table className="min-w-[1000px] border-collapse">
                 <TableHeader className="bg-gray-50/50">
                   <TableRow>
                    <TableHead className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b">Admission ID</TableHead>
                    <TableHead className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b">Student Name</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b">Class/Section</TableHead>
                    <TableHead className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider border-b">Actions</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {filteredStudents.map((student) => (
                     <TableRow key={student.id} className="hover:bg-gray-50/80 transition-colors group">
                       <TableCell className="px-6 py-5 whitespace-nowrap font-mono text-xs text-blue-600 font-semibold border-b border-gray-100">
                         {student.admission_number || "N/A"}
                       </TableCell>
                      <TableCell
                        className="px-6 py-5 cursor-pointer hover:underline hover:text-blue-600 whitespace-nowrap border-b border-gray-100"
                        onClick={() => navigate(`/student/${student.id}?tab=${activeTab}&status=${verificationStatus}`)}
                      >
                        <div className="font-semibold text-gray-900">{student.name_en}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                            student.status === "verified" ? "bg-green-50 text-green-700 border-green-100" :
                            student.status === "pending" ? "bg-yellow-50 text-yellow-700 border-yellow-100" :
                            student.status === "draft" ? "bg-purple-50 text-purple-700 border-purple-100" :
                            "bg-red-50 text-red-700 border-red-100"
                          }`}>
                            {student.status}
                          </span>
                          {student.isNewRegistration && !student.isDraft && (
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[9px] font-bold uppercase rounded-full border border-blue-100">
                              New registration
                            </span>
                          )}
                          {student.isDraft && (
                            <span className="px-2 py-0.5 bg-orange-50 text-orange-700 text-[9px] font-bold uppercase rounded-full border border-orange-100">
                              Incomplete Draft
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-5 whitespace-nowrap text-sm border-b border-gray-100">
                        <span className="font-bold text-gray-700">{student.currentClass}</span>
                        <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-lg border border-gray-200 uppercase">{student.currentSection}</span>
                      </TableCell>
                      <TableCell className="px-6 py-5 text-right whitespace-nowrap border-b border-gray-100">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/student/${student.id}?tab=${activeTab}&status=${verificationStatus}`)}
                          className="h-8 text-blue-600 hover:bg-blue-50 font-bold"
                        >
                          View Details
                        </Button>
                        {student.status === "pending" && (
                          <div className="inline-flex gap-2 ml-2">
                            <Button
                              size="sm"
                              onClick={() => verifyStudent(student.id)}
                              disabled={loading}
                              className="h-8 bg-green-600 hover:bg-green-700 text-white shadow-sm font-bold"
                            >
                              Verify
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-red-600 border-red-100 hover:bg-red-50 hover:text-red-700 font-bold"
                              onClick={() => rejectStudent(student.id)}
                              disabled={loading}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                        {student.status === "draft" && (
                          <Button
                            size="sm"
                            className="h-8 bg-orange-600 hover:bg-orange-700 text-white shadow-sm ml-2 font-bold"
                            onClick={() => navigate(`/student/${student.id}?edit=true&tab=${activeTab}&status=${verificationStatus}`)}
                          >
                            Update
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {filteredStudents.length === 0 && !loading && (
            <div className="text-center py-16 bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-100">
              <div className="bg-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <FilterX className="h-8 w-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No matching students</h3>
              <p className="text-sm text-gray-500 max-w-xs mx-auto mt-1">
                We couldn't find any students matching your current filters. Try adjusting your search or filters.
              </p>
              <Button 
                variant="outline" 
                onClick={resetFilters}
                className="mt-6 h-10 px-6 rounded-full border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                Clear all filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>

  <div className={activeTab === "promotion" ? "block" : "hidden"}>
      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-gray-50/30 pb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">
                Student Promotion
              </CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">ترقية الطلاب</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={resetFilters}
                className="h-9 px-4 text-gray-500 hover:text-red-600 transition-colors border-gray-200"
                title="Reset all filters"
              >
                <FilterX className="h-4 w-4 mr-2" />
                Reset
              </Button>

              <div className="h-6 w-[1px] bg-gray-200 hidden sm:block mx-1" />
              
              <div className="flex items-center gap-2">
                <Select onValueChange={handleClassChange} value={selectedClass}>
                  <SelectTrigger className="w-[150px] h-9 bg-white border-gray-200 text-xs font-semibold">
                    <SelectValue placeholder="Current Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classList.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  onValueChange={(value) => setSelectedFilterSection(value)}
                  value={selectedFilterSection}
                  disabled={!selectedClass || filterableSections.length === 0}
                >
                  <SelectTrigger className="w-[150px] h-9 bg-white border-gray-200 text-xs font-semibold">
                    <SelectValue placeholder="Current Section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sections</SelectItem>
                    {filterableSections.map((sec) => (
                      <SelectItem key={sec.id} value={sec.name}>
                        {sec.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search students to promote..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
      <CardContent className="space-y-4 p-0">
        <div className="overflow-x-auto border-t border-gray-100">
          {filteredStudents.length > 0 ? (
            <Table className="min-w-[1200px] border-collapse">
              <TableHeader className="bg-gray-50/50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <TableRow>
                  <TableHead className="px-6 py-4 border-b">Admission ID</TableHead>
                  <TableHead className="px-6 py-4 border-b">Student Name</TableHead>
                  <TableHead className="px-6 py-4 border-b">Current Class</TableHead>
                  <TableHead className="px-6 py-4 border-b">Next Class</TableHead>
                  <TableHead className="px-6 py-4 border-b">Next Section</TableHead>
                  <TableHead className="px-6 py-4 text-right border-b">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id} className="hover:bg-gray-50/80 transition-colors group">
                    <TableCell className="px-6 py-5 whitespace-nowrap font-mono text-xs text-blue-600 font-semibold border-b border-gray-100">
                      {student.admission_number || "N/A"}
                    </TableCell>
                    <TableCell 
                      className="px-6 py-5 cursor-pointer hover:underline hover:text-blue-600 whitespace-nowrap border-b border-gray-100"
                      onClick={() => navigate(`/student/${student.id}?tab=${activeTab}&status=${verificationStatus}`)}
                    >
                      <div className="font-semibold text-gray-900">{student.name_en}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                          student.status === "verified" ? "bg-green-50 text-green-700 border-green-100" :
                          student.status === "pending" ? "bg-yellow-50 text-yellow-700 border-yellow-100" :
                          "bg-red-50 text-red-700 border-red-100"
                        }`}>
                          {student.status}
                        </span>
                        {student.isNewRegistration && (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[9px] font-bold uppercase rounded-full border border-blue-100">
                            New
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-600 border-b border-gray-100">
                      {student.currentClass} <span className="text-gray-400 font-normal">{student.currentSection}</span>
                    </TableCell>
                    <TableCell className="px-6 py-5 border-b border-gray-100">
                      <Select
                        value={student.selectedDepartment || ""}
                        onValueChange={(value) => {
                          const updatedStudents = students.map((s) =>
                            s.id === student.id
                              ? {
                                  ...s,
                                  selectedDepartment: value,
                                  filteredSections: sections.filter(
                                    (sec) => sec.department === value
                                  ),
                                  selectedSection: "", // reset section
                                }
                              : s
                          );
                          setStudents(updatedStudents);
                        }}
                      >
                        <SelectTrigger className="w-[140px] h-9 text-[11px] font-semibold bg-white border-gray-200 focus:ring-blue-500/10">
                          <SelectValue placeholder="To Class" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id} className="text-xs">
                              {dept.department_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="px-6 py-5 border-b border-gray-100">
                      <Select
                        value={student.selectedSection || ""}
                        onValueChange={(value) => {
                          const updatedStudents = students.map((s) =>
                            s.id === student.id
                              ? { ...s, selectedSection: value }
                              : s
                          );
                          setStudents(updatedStudents);
                        }}
                      >
                        <SelectTrigger className="w-[120px] h-9 text-[11px] font-semibold bg-white border-gray-200 focus:ring-blue-500/10">
                          <SelectValue placeholder="To Section" />
                        </SelectTrigger>
                        <SelectContent>
                          {(student.filteredSections || []).map((sec) => (
                            <SelectItem key={sec.id} value={sec.id} className="text-xs">
                              {sec.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="px-6 py-5 text-right whitespace-nowrap border-b border-gray-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/student/${student.id}?tab=${activeTab}&status=${verificationStatus}`)}
                        className="h-8 text-blue-600 hover:bg-blue-50 font-semibold"
                      >
                        Details
                      </Button>
                      <Button
                        size="sm"
                        onClick={async () => {
                          await promoteStudent(
                            student.id,
                            student.selectedDepartment,
                            student.selectedSection
                          );
                        }}
                        disabled={
                          promotingStudentId !== null ||
                          student.status !== "verified" ||
                          !student.selectedDepartment ||
                          !student.selectedSection
                        }
                        className="h-8 bg-blue-600 hover:bg-blue-700 text-white ml-2 shadow-sm font-semibold"
                      >
                        {promotingStudentId === student.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Promote"
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-20 bg-gray-50/50 rounded-xl m-6 border-2 border-dashed border-gray-100">
              <div className="bg-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Users className="h-8 w-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No students found</h3>
              <p className="text-sm text-gray-500 max-w-xs mx-auto mt-1">
                We couldn't find any students matching your criteria for promotion.
              </p>
              <Button 
                variant="outline" 
                onClick={resetFilters}
                className="mt-6 h-10 px-6 rounded-full border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  </div>

<div className={activeTab === "new" ? "block" : "hidden"}>
  <NewStudentRegistrationForm onSuccess={() => loadStudents()} />
</div>
  </div>
</div>
  );
};

export default RegistrationDashboard;