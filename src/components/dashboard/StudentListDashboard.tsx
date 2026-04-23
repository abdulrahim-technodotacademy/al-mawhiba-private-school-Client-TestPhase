import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, Search, Eye, Loader2, User, Calendar, 
  Globe, ShieldAlert, Phone, Briefcase, MapPin, 
  ExternalLink, HeartPulse, Info, Home, BookOpen,
  Mail, FileText, Layout, Landmark, GraduationCap,
  ChevronRight, ArrowRight, RotateCcw
} from "lucide-react";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api } from "@/utils/axiosInterceptor";
import { getFullUrl } from "@/utils/fileUtils";
import { toast } from "sonner";

const StudentListDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [students, setStudents] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [studentsRes, deptRes, yearRes, secRes] = await Promise.all([
        api.get('/students/students-academic-details/?academic_year_id=all'),
        api.get('/students/department/'),
        api.get('/students/academic-year/'),
        api.get('/students/section/')
      ]);
      setStudents(Array.isArray(studentsRes.data?.data) ? studentsRes.data.data : []);
      setDepartments(Array.isArray(deptRes.data?.data) ? deptRes.data.data : []);
      setSections(Array.isArray(secRes.data?.data) ? secRes.data.data : []);
      
      const yearsData = Array.isArray(yearRes.data?.data) ? yearRes.data.data : [];
      const sortedYears = [...yearsData].sort((a: any, b: any) => {
        const nameA = a.name || '';
        const nameB = b.name || '';
        return nameB.localeCompare(nameA);
      });
      setAcademicYears(sortedYears);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load student list");
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const fullNameEn = `${student.en_first_name || ''} ${student.en_middle_name || ''} ${student.en_grandfather_name || ''} ${student.en_last_name || ''}`.toLowerCase();
    const fullNameAr = `${student.ar_first_name || ''} ${student.ar_middle_name || ''} ${student.ar_grandfather_name || ''} ${student.ar_last_name || ''}`.toLowerCase();
    const admissionNo = (student.admission_number || '').toLowerCase();
    
    const matchesSearch = searchTerm === '' || 
      fullNameEn.includes(searchTerm.toLowerCase()) || 
      fullNameAr.includes(searchTerm.toLowerCase()) ||
      admissionNo.includes(searchTerm.toLowerCase());
      
    const matchesGrade = selectedClass === 'all' || student.admission_class?.id === selectedClass;
    const matchesSection = selectedSection === 'all' || student.section?.id === selectedSection;
    const matchesYear = selectedYear === 'all' || student.financial_agreement?.some((ag: any) => ag.academic_year === selectedYear);
    
    return matchesSearch && matchesGrade && matchesSection && matchesYear;
  });

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedClass('all');
    setSelectedSection('all');
    setSelectedYear('all');
  };

  const sortedStudents = [...filteredStudents].sort((a: any, b: any) => {
    const getYear = (student: any) => {
      const ags = student.financial_agreement;
      if (Array.isArray(ags) && ags.length > 0) {
        return ags[ags.length - 1].academic_year_name || '';
      }
      return '';
    };
    const yearA = getYear(a);
    const yearB = getYear(b);
    return yearB.localeCompare(yearA);
  });

  const getStudentDisplayNames = (student: any) => {
    if (!student) return { en: 'N/A', ar: 'N/A' };
    const en = [student.en_first_name, student.en_middle_name, student.en_grandfather_name, student.en_last_name].filter(Boolean).join(' ');
    const ar = [student.ar_first_name, student.ar_middle_name, student.ar_grandfather_name, student.ar_last_name].filter(Boolean).join(' ');
    return { en, ar };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Student Information Portal</h1>
          <p className="text-gray-500 font-medium" dir="rtl">قوائم الطلاب الشاملة - كافة التفاصيل والبيانات</p>
        </div>
      </div>

      {/* Filter Section */}
      <Card className="border-none shadow-sm bg-white/60 backdrop-blur-md">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.1em]">Quick Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-300" />
                <Input 
                  placeholder="Seach by Name or Admission No..." 
                  className="pl-10 h-10 border-gray-100 focus:border-red-200 transition-all bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.1em]">Department / Level</Label>
              <Select 
                value={selectedClass} 
                onValueChange={(val) => {
                  setSelectedClass(val);
                  setSelectedSection('all'); // Reset section when department changes
                }}
              >
                <SelectTrigger className="h-10 border-gray-100 bg-white">
                  <SelectValue placeholder="All Grades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.department_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.1em]">Section</Label>
              <Select value={selectedSection} onValueChange={setSelectedSection} disabled={selectedClass === 'all'}>
                <SelectTrigger className="h-10 border-gray-100 bg-white">
                  <SelectValue placeholder={selectedClass === 'all' ? "Select Department First" : "All Sections"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  {sections
                    .filter(sec => sec.department === selectedClass)
                    .map(sec => (
                      <SelectItem key={sec.id} value={sec.id}>{sec.name}</SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.1em]">Academic Year</Label>
              <div className="flex gap-2">
                <div className="flex-grow">
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="h-10 border-gray-100 bg-white">
                      <SelectValue placeholder="All Years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Academic Years</SelectItem>
                      {academicYears.map(year => (
                        <SelectItem key={year.id} value={year.id}>{year.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  variant="outline" 
                  className="h-10 border-gray-100 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all flex items-center gap-2 px-3"
                  onClick={handleClearFilters}
                  title="Clear All Filters"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Clear</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card className="border-none shadow-xl overflow-hidden rounded-2xl bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#fcfcfc] border-b border-gray-50">
                <tr>
                  <th className="px-6 py-5 text-left font-black text-[10px] text-gray-400 uppercase tracking-[0.15em]">Student Information</th>
                  <th className="px-6 py-5 text-center font-black text-[10px] text-gray-400 uppercase tracking-[0.15em]">Department</th>
                  <th className="px-6 py-5 text-center font-black text-[10px] text-gray-400 uppercase tracking-[0.15em]">Section</th>
                  <th className="px-6 py-5 text-center font-black text-[10px] text-gray-400 uppercase tracking-[0.15em]">Academic Year</th>
                  <th className="px-6 py-5 text-right font-black text-[10px] text-gray-400 uppercase tracking-[0.15em]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sortedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="bg-gray-50 p-4 rounded-full text-gray-200"><Users className="h-10 w-10" /></div>
                        <p className="text-gray-400 font-medium italic">No matches found in the registry.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedStudents.map((student) => {
                    const names = getStudentDisplayNames(student);
                    const isSigned = student.has_current_agreement;

                    return (
                      <tr 
                        key={student.id} 
                        className="hover:bg-gray-50/50 transition-all group cursor-pointer"
                        onClick={() => {
                          setSelectedStudent(student);
                          setIsDetailModalOpen(true);
                        }}
                      >
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-gray-100 overflow-hidden border border-gray-100 flex-shrink-0 group-hover:scale-105 transition-transform">
                              {student.photo ? (
                                <img src={getFullUrl(student.photo)} className="h-full w-full object-cover" />
                              ) : (
                                <User className="h-full w-full p-2.5 text-gray-300" />
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 group-hover:text-red-700 transition-colors leading-tight">
                                {names.en}
                              </div>
                              <div className="text-[12px] text-gray-400 mt-1.5 font-medium" dir="rtl">
                                {names.ar}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6 text-center">
                          <span className="font-bold text-gray-600 text-sm">
                            {student.admission_class?.department_name || '---'}
                          </span>
                        </td>
                        <td className="px-6 py-6 text-center">
                          <span className="font-bold text-gray-600 text-sm">
                            {student.section?.name || '---'}
                          </span>
                        </td>
                        <td className="px-6 py-6 text-center">
                          <span className="text-xs font-bold text-gray-500">
                            {student.financial_agreement?.length > 0 
                              ? student.financial_agreement[student.financial_agreement.length - 1].academic_year_name 
                              : 'Pending Enrollment'}
                          </span>
                        </td>
                        <td className="px-6 py-6 text-right">
                          <Badge className={`${isSigned ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-100 text-amber-700 border-amber-200'} font-black text-[10px] uppercase tracking-wider px-3 py-1 shadow-sm`}>
                            {isSigned ? 'SIGNED' : 'PENDING'}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Registration Form Style: Student Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto p-0 border-none shadow-2xl rounded-lg bg-white font-sans text-gray-900">
          <div className="p-10 space-y-10">
            {/* Form Header */}
            <div className="flex justify-between items-start border-b-4 border-red-700 pb-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-gray-900">STUDENT REGISTRATION RECORD</h2>
                <div className="flex gap-4 text-sm font-bold text-gray-500 uppercase tracking-widest">
                  <span>REF: {selectedStudent?.admission_number}</span>
                  <span>|</span>
                  <span>ACADEMIC YEAR: {selectedStudent?.financial_agreement?.[0]?.academic_year_name || 'N/A'}</span>
                </div>
              </div>
              <div className="h-28 w-24 border-2 border-gray-100 rounded bg-gray-50 overflow-hidden">
                {selectedStudent?.photo ? (
                  <img src={getFullUrl(selectedStudent.photo)} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-200"><User className="h-12 w-12" /></div>
                )}
              </div>
            </div>

            {/* Section 1: Student Identity */}
            <div className="space-y-6">
              <h3 className="bg-gray-100 px-4 py-2 font-black text-sm uppercase tracking-widest border-l-4 border-red-700">I. STUDENT IDENTITY</h3>
              <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                <div>
                  <Label className="text-[10px] font-bold text-gray-400 uppercase">English Full Name</Label>
                  <p className="border-b border-gray-200 py-1 font-bold text-lg">{getStudentDisplayNames(selectedStudent).en}</p>
                </div>
                <div dir="rtl">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase">الاسم الكامل باللغة العربية</Label>
                  <p className="border-b border-gray-200 py-1 font-bold text-lg">{getStudentDisplayNames(selectedStudent).ar}</p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-[10px] font-bold text-gray-400 uppercase">Gender</Label>
                    <p className="border-b border-gray-100 py-1 font-medium">{selectedStudent?.gender === 'M' ? 'Male' : 'Female'}</p>
                  </div>
                  <div>
                    <Label className="text-[10px] font-bold text-gray-400 uppercase">Date of Birth</Label>
                    <p className="border-b border-gray-100 py-1 font-medium">{selectedStudent?.date_of_birth}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-[10px] font-bold text-gray-400 uppercase">Nationality</Label>
                    <p className="border-b border-gray-100 py-1 font-medium">{selectedStudent?.nationality}</p>
                  </div>
                  <div>
                    <Label className="text-[10px] font-bold text-gray-400 uppercase">Religion</Label>
                    <p className="border-b border-gray-100 py-1 font-medium">{selectedStudent?.religion}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Academic Details */}
            <div className="space-y-6">
              <h3 className="bg-gray-100 px-4 py-2 font-black text-sm uppercase tracking-widest border-l-4 border-red-700">II. ACADEMIC ENROLLMENT</h3>
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <Label className="text-[10px] font-bold text-gray-400 uppercase">Assigned Department</Label>
                  <p className="border-b border-gray-100 py-1 font-bold">{selectedStudent?.admission_class?.department_name}</p>
                </div>
                <div>
                  <Label className="text-[10px] font-bold text-gray-400 uppercase">Section</Label>
                  <p className="border-b border-gray-100 py-1 font-bold">Section {selectedStudent?.section?.name}</p>
                </div>
                <div>
                  <Label className="text-[10px] font-bold text-gray-400 uppercase">Admission Date</Label>
                  <p className="border-b border-gray-100 py-1 font-bold">{selectedStudent?.admission_date}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase">Previous School / Institution</Label>
                  <p className="border-b border-gray-100 py-1 font-medium">{selectedStudent?.previous_school || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-[10px] font-bold text-gray-400 uppercase">Target Curriculum</Label>
                  <p className="border-b border-gray-100 py-1 font-medium text-red-700">{selectedStudent?.wanted_education_system || 'Bilingual'}</p>
                </div>
              </div>
            </div>

            {/* Section 3: Contact & Medical */}
            <div className="space-y-6">
              <h3 className="bg-gray-100 px-4 py-2 font-black text-sm uppercase tracking-widest border-l-4 border-red-700">III. CONTACT & MEDICAL PROFILE</h3>
              <div className="grid grid-cols-2 gap-12">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[10px] font-bold text-gray-400 uppercase">Home Contact</Label>
                      <p className="border-b border-gray-100 py-1 font-medium">{selectedStudent?.home_contact || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-[10px] font-bold text-gray-400 uppercase">Emergency Protocol</Label>
                      <p className="border-b border-gray-100 py-1 font-bold text-red-600">{selectedStudent?.emergency_contact || 'N/A'}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-[10px] font-bold text-gray-400 uppercase">Address / Residence</Label>
                    <p className="border-b border-gray-100 py-1 font-medium">
                      {selectedStudent?.governance}, {selectedStudent?.state}, {selectedStudent?.neighborhood}
                      {selectedStudent?.street_number ? `, St. ${selectedStudent.street_number}` : ''}
                      {selectedStudent?.house_number ? `, House ${selectedStudent.house_number}` : ''}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-[10px] font-bold text-gray-400 uppercase">Special Needs Details</Label>
                    <p className="border border-gray-100 p-2 rounded min-h-[40px] text-sm italic text-gray-600 bg-gray-50/30">
                      {selectedStudent?.has_special_needs ? selectedStudent.special_needs_details : 'No special needs recorded.'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-[10px] font-bold text-gray-400 uppercase">Chronic Diseases</Label>
                    <p className="border border-gray-100 p-2 rounded min-h-[40px] text-sm italic text-gray-600 bg-gray-50/30">
                      {selectedStudent?.chronic_disease || 'Clear medical history.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Guardians */}
            <div className="space-y-6">
              <h3 className="bg-gray-100 px-4 py-2 font-black text-sm uppercase tracking-widest border-l-4 border-red-700">IV. GUARDIANSHIP INFORMATION</h3>
              <div className="space-y-8">
                {[
                  { title: "FATHER", data: selectedStudent?.father },
                  { title: "MOTHER", data: selectedStudent?.mother },
                  { title: "LEGAL GUARDIAN", data: selectedStudent?.guardian }
                ]
                .filter(g => g.data?.name_en)
                .sort((a, b) => {
                  const aResp = a.data?.is_directly_responsible ? 1 : 0;
                  const bResp = b.data?.is_directly_responsible ? 1 : 0;
                  return bResp - aResp;
                })
                .map((g, idx) => (
                  <div key={idx} className="border border-gray-100 rounded-lg p-6 bg-gray-50/20 relative">
                    {g.data.is_directly_responsible && (
                      <Badge className="absolute right-6 top-6 bg-red-700 text-white font-black text-[9px]">DIRECT RESPONSIBLE</Badge>
                    )}
                    <h4 className="text-red-700 font-black text-xs mb-4 tracking-tighter decoration-double">{g.title} DETAILS</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="col-span-2">
                        <Label className="text-[9px] font-bold text-gray-400 uppercase">Full Name</Label>
                        <p className="font-bold text-gray-900 leading-tight">{g.data.name_en}</p>
                        <p className="text-[11px] text-gray-400 font-medium italic mt-1">{g.data.name_ar}</p>
                      </div>
                      <div>
                        <Label className="text-[9px] font-bold text-gray-400 uppercase">Phone Number</Label>
                        <p className="font-bold text-gray-900">{g.data.phone1}</p>
                      </div>
                      <div>
                        <Label className="text-[9px] font-bold text-gray-400 uppercase">National ID</Label>
                        <p className="font-bold text-gray-900">{g.data.national_id || '---'}</p>
                      </div>
                      <div>
                        <Label className="text-[9px] font-bold text-gray-400 uppercase">Occupation</Label>
                        <p className="font-bold text-gray-900">{g.data.occupation || '---'}</p>
                      </div>
                      <div>
                        <Label className="text-[9px] font-bold text-gray-400 uppercase">Workplace</Label>
                        <p className="font-bold text-gray-900">{g.data.workplace || '---'}</p>
                      </div>
                      <div className="col-span-2">
                        <Label className="text-[9px] font-bold text-gray-400 uppercase">Email Address</Label>
                        <p className="font-bold text-gray-900">{g.data.email || 'No email registered'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Official Stamps / Verification Footer */}
            <div className="grid grid-cols-2 gap-12 pt-10 border-t-2 border-gray-100">
              <div className="space-y-4">
                <div className="h-20 w-40 border border-dashed border-gray-200 rounded flex items-center justify-center text-[10px] text-gray-300 font-bold uppercase">
                  School Official Stamp
                </div>
                <p className="text-[10px] text-gray-400 italic">This document is electronically generated and verified by the school administration system.</p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Verification Status</p>
                <div className="text-green-600 font-black flex items-center justify-end gap-2 text-sm">
                  <ShieldAlert className="h-4 w-4" /> VERIFIED BY REGISTRATION OFFICE
                </div>
                <p className="text-[10px] text-gray-400">Generated on: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentListDashboard;
