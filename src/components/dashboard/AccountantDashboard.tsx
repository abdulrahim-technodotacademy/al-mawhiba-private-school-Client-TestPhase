import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Receipt, DollarSign, Search, Printer, Download, Eye, 
  Trash2, Plus, PlusCircle, User, FileText, Settings, 
  ChevronRight, ArrowLeft, Loader2, List, Edit,
  Users, Phone, Briefcase, Calendar, Globe, ShieldAlert,
  HeartPulse, MapPin, ExternalLink, CreditCard
} from "lucide-react";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { api } from "@/utils/axiosInterceptor";
import { getFullUrl } from "@/utils/fileUtils";
import Swal from "sweetalert2";
import { toast } from "sonner";

const AccountantDashboard = () => {
  const [activeTab, setActiveTab] = useState("students");
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [students, setStudents] = useState<any[]>([]);
  const [agreements, setAgreements] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedAgreement, setSelectedAgreement] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAgreementModalOpen, setIsAgreementModalOpen] = useState(false);

  // Management State
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [newItemName, setNewItemName] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState("");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [studentsRes, agreementRes, deptRes, secRes, yearRes] = await Promise.all([
        api.get('/students/students-academic-details/?academic_year_id=all'),
        api.get('/students/financial-agreement/'),
        api.get('/students/department/'),
        api.get('/students/section/'),
        api.get('/students/academic-year/')
      ]);
      setStudents(studentsRes.data.data);
      setAgreements(agreementRes.data.data);
      setDepartments(deptRes.data.data);
      setSections(secRes.data.data);
      setAcademicYears(yearRes.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId: string, name: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Deleting student "${name}" will also remove all their financial agreements and payment history.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete everything!'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/students/students/${studentId}/`);
        toast.success("Student and related data deleted successfully");
        fetchInitialData();
      } catch (error) {
        toast.error("Failed to delete student");
      }
    }
  };

  const handleDeleteContract = async (agId: string) => {
    const result = await Swal.fire({
      title: 'Delete Contract?',
      text: "This will remove the agreement and all its associated payments. This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete contract'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/students/financial-agreement/${agId}/`);
        toast.success("Contract and related payments deleted successfully");
        setIsAgreementModalOpen(false);
        setIsDetailModalOpen(false);
        fetchInitialData();
      } catch (error) {
        toast.error("Failed to delete contract");
      }
    }
  };

  const handleManageDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/students/department/${editingItem.id}/`, { department_name: newItemName });
        toast.success("Grade updated");
      } else {
        await api.post('/students/department/', { department_name: newItemName });
        toast.success("Grade added");
      }
      setIsDeptModalOpen(false);
      setNewItemName("");
      setEditingItem(null);
      fetchInitialData();
    } catch (error) {
      toast.error("Failed to manage grade");
    }
  };

  const handleDeleteDept = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: `Delete Grade "${name}"?`,
      text: "This will not affect students already assigned to this grade.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
    });
    if (result.isConfirmed) {
      try {
        await api.delete(`/students/department/${id}/`);
        toast.success("Grade deleted");
        fetchInitialData();
      } catch (error) {
        toast.error("Failed to delete grade");
      }
    }
  };

  const handleManageSection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { name: newItemName, department: selectedDeptId };
      if (editingItem) {
        await api.put(`/students/section/${editingItem.id}/`, payload);
        toast.success("Section updated");
      } else {
        await api.post('/students/section/', payload);
        toast.success("Section added");
      }
      setIsSectionModalOpen(false);
      setNewItemName("");
      setSelectedDeptId("");
      setEditingItem(null);
      fetchInitialData();
    } catch (error) {
      toast.error("Failed to manage section");
    }
  };

  const handleDeleteSection = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: `Delete Section "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
    });
    if (result.isConfirmed) {
      try {
        await api.delete(`/students/section/${id}/`);
        toast.success("Section deleted");
        fetchInitialData();
      } catch (error) {
        toast.error("Failed to delete section");
      }
    }
  };

  const filteredStudents = students.filter(student => {
    const fullName = `${student.en_first_name} ${student.en_middle_name || ''} ${student.en_grandfather_name || ''} ${student.en_last_name}`.toLowerCase();
    const admissionNo = student.admission_number.toLowerCase();
    const matchesSearch = searchTerm === '' || 
      fullName.includes(searchTerm.toLowerCase()) || 
      admissionNo.includes(searchTerm.toLowerCase());
    const matchesGrade = selectedClass === 'all' || student.admission_class?.id === selectedClass;
    const matchesYear = selectedYear === 'all' || student.financial_agreement?.some((ag: any) => ag.academic_year === selectedYear);
    
    return matchesSearch && matchesGrade && matchesYear;
  });

  const getStatusColor = (agreement: any) => {
    if (!agreement) return 'bg-gray-100 text-gray-800';
    if (agreement.payment_completed) return 'bg-green-100 text-green-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const filteredAgreements = agreements.filter(ag => {
    const student = ag.student_details;
    const enName = student ? `${student.en_first_name} ${student.en_middle_name || ''} ${student.en_grandfather_name || ''} ${student.en_last_name}`.toLowerCase() : '';
    const arName = student ? `${student.ar_first_name} ${student.ar_middle_name || ''} ${student.ar_grandfather_name || ''} ${student.ar_last_name}`.toLowerCase() : '';
    const admissionNo = student?.admission_number.toLowerCase() || '';
    const contractNo = ag.contract_number?.toLowerCase() || '';

    const matchesSearch = searchTerm === '' || 
      enName.includes(searchTerm.toLowerCase()) || 
      arName.includes(searchTerm.toLowerCase()) ||
      admissionNo.includes(searchTerm.toLowerCase()) ||
      contractNo.includes(searchTerm.toLowerCase());
      
    const matchesGrade = selectedClass === 'all' || ag.admission_class === selectedClass;
    const matchesYear = selectedYear === 'all' || ag.academic_year === selectedYear;
    
    return matchesSearch && matchesGrade && matchesYear;
  });

  const getStudentName = (student: any) => {
    if (!student) return 'N/A';
    const en = [student.en_first_name, student.en_middle_name, student.en_grandfather_name, student.en_last_name].filter(Boolean).join(' ');
    const ar = [student.ar_first_name, student.ar_middle_name, student.ar_grandfather_name, student.ar_last_name].filter(Boolean).join(' ');
    return { en, ar };
  };

  const handleViewPDF = async (agreementId: string) => {
    if (!agreementId) return;

    // Open a new window immediately to avoid the pop-up blocker
    const newWindow = window.open('about:blank', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>View Agreement | AL-MAWHIBA</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; background-color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; color: #1e293b; }
              .card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); text-align: center; }
              .spinner { width: 32px; height: 32px; border: 3px solid #f1f5f9; border-bottom-color: #8b4513; border-radius: 50%; display: inline-block; animation: rotation 1s linear infinite; margin-bottom: 1rem; }
              @keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="spinner"></div>
              <div style="font-weight: 600;">Loading Agreement PDF...</div>
              <div style="font-size: 12px; color: #64748b; mt-2;">Generating official document...</div>
            </div>
          </body>
        </html>
      `);
    }

    try {
      const response = await api.get(`/students/financial-agreement-pdf-download/${agreementId}/`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));

      if (newWindow) {
        newWindow.location.href = url;
      } else {
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error("Failed to view PDF:", error);
      if (newWindow) newWindow.close();
      toast.error("Failed to load PDF. Please try again.");
    }
  };

  const handleDownloadReceipt = async (paymentId: string) => {
    try {
      const response = await api.get(`/students/students/${paymentId}/download-payment-receipt/`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Receipt-${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Failed to download receipt:", error);
      toast.error("Failed to download receipt.");
    }
  };

  const handleViewReceipt = async (paymentId: string) => {
    if (!paymentId) return;

    const newWindow = window.open('about:blank', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>View Receipt | AL-MAWHIBA</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; background-color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; color: #1e293b; }
              .card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); text-align: center; }
              .spinner { width: 32px; height: 32px; border: 3px solid #f1f5f9; border-bottom-color: #fca5a5; border-radius: 50%; display: inline-block; animation: rotation 1s linear infinite; margin-bottom: 1rem; }
              @keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="spinner"></div>
              <div style="font-weight: 600;">Loading Receipt PDF...</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 8px;">Fetching payment record...</div>
            </div>
          </body>
        </html>
      `);
    }

    try {
      const response = await api.get(`/students/students/${paymentId}/download-payment-receipt/`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));

      if (newWindow) {
        newWindow.location.href = url;
      } else {
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error("Failed to view receipt:", error);
      if (newWindow) newWindow.close();
      toast.error("Failed to load receipt. Please try again.");
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Accountant Controller</h1>
          <p className="text-gray-600" dir="rtl">مراقب الحسابات - لوحة التحكم الشاملة</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white border p-1 h-auto flex-wrap justify-start gap-2">
          <TabsTrigger value="students" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-700">
            <User className="h-4 w-4 mr-2" />
            Students Management
          </TabsTrigger>
          <TabsTrigger value="agreements" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-700">
            <FileText className="h-4 w-4 mr-2" />
            Financial Management
          </TabsTrigger>
          <TabsTrigger value="departments" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-700">
            <List className="h-4 w-4 mr-2" />
            Grades (Departments)
          </TabsTrigger>
          <TabsTrigger value="sections" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-700">
            <Settings className="h-4 w-4 mr-2" />
            Sections Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4 py-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Search className="h-4 w-4 mr-2" />
                Find Students & Guardians
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Search</Label>
                  <Input 
                    placeholder="Name or Admission No..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Academic Year</Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger>
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
                <div className="space-y-2">
                  <Label>Grade Filter</Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger>
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
              </div>
            </CardContent>
          </Card>

          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Adm No</th>
                  <th className="px-4 py-3 text-left font-semibold">Student Name</th>
                  <th className="hidden md:table-cell px-4 py-3 text-left font-semibold">Grade/Section</th>
                  <th className="hidden lg:table-cell px-4 py-3 text-left font-semibold">Academic Year</th>
                  <th className="px-4 py-3 text-center font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500 italic">
                      No students found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => {
                    const agreements = student.financial_agreement || [];
                    const latestAg = agreements.length > 0 ? agreements[agreements.length - 1] : null;

                    // Concatenate 4-part names
                    const enFullName = [
                      student.en_first_name,
                      student.en_middle_name,
                      student.en_grandfather_name,
                      student.en_last_name
                    ].filter(Boolean).join(' ');

                    const arFullName = [
                      student.ar_first_name,
                      student.ar_middle_name,
                      student.ar_grandfather_name,
                      student.ar_last_name
                    ].filter(Boolean).join(' ');

                    return (
                      <tr key={student.id} className="hover:bg-gray-50 transition-colors text-xs">
                        <td className="px-4 py-3 font-mono">{student.admission_number}</td>
                        <td className="px-4 py-3">
                          <button 
                            onClick={() => {
                              setSelectedStudent(student);
                              setIsDetailModalOpen(true);
                            }}
                            className="text-left hover:text-red-700 transition-colors group"
                          >
                            <div className="font-medium text-blue-600 group-hover:underline">{enFullName}</div>
                            <div className="md:hidden text-[10px] text-gray-500 mt-1">
                              {student.admission_class?.department_name} {student.section?.name ? `(${student.section.name})` : ''}
                            </div>
                            <div className="text-[10px] text-gray-400 mt-0.5" dir="rtl">{arFullName}</div>
                          </button>
                        </td>
                        <td className="hidden md:table-cell px-4 py-3 text-gray-600">
                          {student.admission_class?.department_name} 
                          {student.section?.name && <Badge variant="outline" className="ml-2 py-0 h-5 text-[10px]">{student.section.name}</Badge>}
                        </td>
                        <td className="hidden lg:table-cell px-4 py-3 text-gray-600">
                          {latestAg?.academic_year_name || academicYears.find(y => y.id === latestAg?.academic_year)?.name || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge className={`${getStatusColor(latestAg)} py-0 h-5 text-[10px]`}>
                            {latestAg?.payment_completed ? 'Cleared' : 'Pending'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-600 border-red-100 hover:bg-red-50 h-8"
                              onClick={() => handleDeleteStudent(student.id, enFullName)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="agreements" className="space-y-4 py-4">
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Adm No</th>
                  <th className="px-4 py-3 text-left font-semibold">Student Name</th>
                  <th className="hidden md:table-cell px-4 py-3 text-left font-semibold">Contract No</th>
                  <th className="px-4 py-3 text-right font-semibold">Total</th>
                  <th className="px-4 py-3 text-right font-semibold">Paid</th>
                  <th className="px-4 py-3 text-right font-semibold">Balance</th>
                  <th className="px-4 py-3 text-center font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredAgreements.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500 italic">
                      No matching financial agreements found.
                    </td>
                  </tr>
                ) : (
                  filteredAgreements.map((ag) => {
                    const student = ag.student_details;
                    const names = getStudentName(student);
                    return (
                      <tr key={ag.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-mono">{student?.admission_number || 'N/A'}</td>
                        <td className="px-4 py-3">
                          <button 
                            onClick={() => {
                              setSelectedAgreement(ag);
                              setIsAgreementModalOpen(true);
                            }}
                            className="text-left group"
                          >
                            <div className="font-medium text-blue-600 group-hover:underline">{names.en}</div>
                            <div className="md:hidden text-[10px] text-gray-500 mt-1">
                              Contract: {ag.contract_number}
                            </div>
                            <div className="text-[10px] text-gray-400" dir="rtl">{names.ar}</div>
                          </button>
                        </td>
                        <td className="hidden md:table-cell px-4 py-3 font-medium text-gray-700">{ag.contract_number}</td>
                        <td className="px-4 py-3 text-right font-semibold">{ag.total_fees_omr}</td>
                        <td className="px-4 py-3 text-right text-green-600 font-semibold">{ag.initial_paid_amount || 0}</td>
                        <td className="px-4 py-3 text-right text-red-600 font-semibold">{ag.balance_amount || 0}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge className={`${getStatusColor(ag)} py-0 h-5 text-[10px]`}>
                            {ag.payment_completed ? 'Cleared' : 'Pending'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => {
                              setSelectedAgreement(ag);
                              setIsAgreementModalOpen(true);
                            }}>
                              <Eye className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500" onClick={() => handleDeleteContract(ag.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4 py-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Grades (Departments)</h3>
            <Button onClick={() => { setEditingItem(null); setNewItemName(""); setIsDeptModalOpen(true); }}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Grade
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.length === 0 ? (
              <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
                No grades/departments found. Click "Add Grade" to create one.
              </div>
            ) : (
              departments.map((dept) => (
                <Card key={dept.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div className="font-semibold text-lg">{dept.department_name}</div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setEditingItem(dept); setNewItemName(dept.department_name); setIsDeptModalOpen(true); }}>
                        <Edit className="h-4 w-4 text-gray-500" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteDept(dept.id, dept.department_name)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="sections" className="space-y-4 py-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Sections</h3>
            <Button onClick={() => { setEditingItem(null); setNewItemName(""); setSelectedDeptId(""); setIsSectionModalOpen(true); }}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Section
            </Button>
          </div>
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">Section Name</th>
                  <th className="px-4 py-3 text-left">Grade / Department</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sections.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-gray-500 italic">
                      No sections found. Click "Add Section" to create one.
                    </td>
                  </tr>
                ) : (
                  [...sections]
                    .sort((a, b) => {
                      const deptA = departments.find(d => d.id === a.department)?.department_name || '';
                      const deptB = departments.find(d => d.id === b.department)?.department_name || '';
                      return deptA.localeCompare(deptB, undefined, { numeric: true });
                    })
                    .map((sec) => (
                      <tr key={sec.id}>
                        <td className="px-4 py-3 font-semibold">{sec.name}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {departments.find(d => d.id === sec.department)?.department_name || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => { setEditingItem(sec); setNewItemName(sec.name); setSelectedDeptId(sec.department); setIsSectionModalOpen(true); }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteSection(sec.id, sec.name)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Student Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center text-red-700 overflow-hidden border-2 border-red-50 shadow-sm">
                  {selectedStudent?.photo ? (
                    <img 
                      src={getFullUrl(selectedStudent.photo)} 
                      alt={selectedStudent.en_first_name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8" />
                  )}
                </div>
                <div>
                  <span>Student Profile: {selectedStudent?.en_first_name} {selectedStudent?.en_last_name}</span>
                  <div className="text-sm font-normal text-gray-500 mt-1">
                    Admission #: {selectedStudent?.admission_number} | {selectedStudent?.admission_class?.department_name} - {selectedStudent?.section?.name}
                  </div>
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-8 mt-6">
            {/* Quick Stats / Personal Info */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: "Gender", value: selectedStudent?.gender === 'M' ? 'Male' : 'Female', icon: <User className="h-4 w-4" /> },
                { label: "Date of Birth", value: selectedStudent?.date_of_birth, icon: <Calendar className="h-4 w-4" /> },
                { label: "Nationality", value: selectedStudent?.nationality, icon: <Globe className="h-4 w-4" /> },
                { label: "Religion", value: selectedStudent?.religion || 'N/A', icon: <ShieldAlert className="h-4 w-4" /> },
              ].map((stat, i) => (
                <Card key={i} className="bg-gray-50 border-none">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="p-2 bg-white rounded-md text-gray-400">{stat.icon}</div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider font-mono">{stat.label}</div>
                      <div className="text-sm font-bold">{stat.value}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Guardians */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4 border-b pb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" /> Guardians & Contact
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { title: "Father", data: selectedStudent?.father },
                      { title: "Mother", data: selectedStudent?.mother },
                      { title: "Legal Guardian", data: selectedStudent?.guardian }
                    ]
                    .filter(g => g.data?.name_en)
                    .sort((a, b) => {
                      const aResp = a.data?.is_directly_responsible ? 1 : 0;
                      const bResp = b.data?.is_directly_responsible ? 1 : 0;
                      return bResp - aResp;
                    })
                    .map((g, i) => (
                      <Card key={i} className={`relative overflow-hidden ${g.data.is_directly_responsible ? 'border-red-200 bg-red-50/30' : 'border-gray-100'}`}>
                        {g.data.is_directly_responsible && (
                          <div className="absolute top-0 right-0">
                            <Badge className="rounded-none rounded-bl-lg bg-red-600 text-white border-none text-[10px] px-2 py-1">
                              Responsible Guardian
                            </Badge>
                          </div>
                        )}
                        <CardContent className="p-4">
                          <div className="font-bold text-gray-700 text-xs uppercase tracking-tighter mb-2 opacity-60">{g.title}</div>
                          <div className="font-bold text-base text-gray-900 mb-3">{g.data.name_en}</div>
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3" /> {g.data.phone1} {g.data.phone2 ? `/ ${g.data.phone2}` : ''}
                            </div>
                            <div className="flex items-center gap-2">
                              <Briefcase className="h-3 w-3" /> {g.data.occupation || 'N/A'} @ {g.data.workplace || 'N/A'}
                            </div>
                            {g.data.email && (
                              <div className="flex items-center gap-2 italic">
                                <FileText className="h-3 w-3" /> {g.data.email}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Health & Welfare */}
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4 border-b pb-2 flex items-center gap-2">
                    <HeartPulse className="h-4 w-4" /> Health & Special Needs
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className={selectedStudent?.has_special_needs ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-none'}>
                      <CardContent className="p-4">
                        <div className="font-bold text-xs uppercase mb-1 flex items-center gap-2">
                          Special Needs {selectedStudent?.has_special_needs && <Badge variant="destructive" className="h-4 text-[8px]">Action Req</Badge>}
                        </div>
                        <p className="text-sm text-gray-600">{selectedStudent?.has_special_needs ? selectedStudent.special_needs_details : 'No special needs reported.'}</p>
                      </CardContent>
                    </Card>
                    <Card className={selectedStudent?.chronic_disease ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-none'}>
                      <CardContent className="p-4">
                        <div className="font-bold text-xs uppercase mb-1">Chronic Disease</div>
                        <p className="text-sm text-gray-600 font-medium">{selectedStudent?.chronic_disease || 'No chronic diseases reported.'}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              {/* Right Column: Address & Others */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4 border-b pb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Address & Location
                  </h4>
                  <Card className="border-gray-100">
                    <CardContent className="p-4 space-y-4">
                      <div className="space-y-1">
                        <div className="text-[10px] uppercase font-bold text-gray-400">Governance / State</div>
                        <div className="text-sm font-medium">{selectedStudent?.governance}, {selectedStudent?.state}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] uppercase font-bold text-gray-400">Neighborhood / Street</div>
                        <div className="text-sm font-medium">{selectedStudent?.neighborhood} / {selectedStudent?.street_number || 'N/A'}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] uppercase font-bold text-gray-400">House Number</div>
                        <div className="text-sm font-medium">{selectedStudent?.house_number || 'N/A'}</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4 border-b pb-2">Social Context</h4>
                  <Card className="bg-slate-50 border-none">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Staying With:</span>
                        <span className="font-bold">{selectedStudent?.staying_with || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Parents Divorced:</span>
                        <span className="font-bold">{selectedStudent?.parents_divorced ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="pt-2 border-t border-gray-200">
                        <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">Emergency contact</div>
                        <div className="text-sm font-bold text-red-600">{selectedStudent?.emergency_contact || 'N/A'}</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Financial Agreements Section */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4 border-b pb-2 flex justify-between items-center">
                <span className="flex items-center gap-2"><CreditCard className="h-4 w-4" /> Financial Contracts</span>
                <span className="text-xs normal-case font-normal text-gray-400">Active agreements for current years</span>
              </h4>
              <div className="space-y-4">
                {selectedStudent?.financial_agreement?.length > 0 ? (
                  selectedStudent.financial_agreement.map((ag: any) => (
                    <Card key={ag.id} className="border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-lg text-gray-800">{ag.contract_number}</span>
                              <Badge className={ag.payment_completed ? 'bg-green-100 text-green-800' : 'bg-red-50 text-red-600'}>
                                {ag.payment_completed ? 'Fully Settled' : 'Payment Outstanding'}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 flex items-center gap-4">
                              <span><strong className="text-gray-900">Plan:</strong> {ag.installment_plan} installments</span>
                              <span><strong className="text-gray-900">Total:</strong> {ag.total_fees_omr} OMR</span>
                            </div>
                            <p className="text-sm font-medium">Balance Due: <span className="text-red-600 font-bold">{ag.balance_amount || "0.000"} OMR</span></p>
                          </div>
                          <div className="flex items-center gap-2 pt-2 md:pt-0">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-blue-600 border-blue-100 hover:bg-blue-50 h-8 font-bold"
                              onClick={() => handleViewPDF(ag.id)}
                            >
                              <FileText className="h-4 w-4 mr-2" /> View PDF
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-100 border-red-100 bg-red-600 text-white hover:bg-red-700 h-8" onClick={() => handleDeleteContract(ag.id)}>
                              <Trash2 className="h-4 w-4 mr-2" /> Delete Contract
                            </Button>
                          </div>
                        </div>

                        {/* Agreement Payment History Sub-table */}
                        <div className="mt-5 border rounded-lg overflow-hidden bg-gray-50/50">
                          <div className="px-3 py-2 bg-gray-100/80 text-[10px] font-bold uppercase text-gray-500 border-b">Verified Payments History</div>
                          <table className="w-full text-xs">
                            <thead className="bg-white/50">
                              <tr>
                                <th className="px-3 py-2 text-left font-semibold text-gray-700">Date</th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-700">Ref #</th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-700">Status</th>
                                <th className="px-3 py-2 text-right font-semibold text-gray-700">Amount</th>
                                <th className="px-3 py-2 text-right font-semibold text-gray-700">Receipt</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {selectedStudent.payment_history?.filter((p: any) => p.financial_agreement === ag.id).map((p: any) => (
                                <tr key={p.id} className="hover:bg-white/40">
                                  <td className="px-3 py-2 text-gray-600">{p.date_of_payment}</td>
                                  <td className="px-3 py-2 font-mono">{p.receipt_number || 'N/A'}</td>
                                  <td className="px-3 py-2">
                                    <Badge variant="outline" className="text-[9px] uppercase tracking-wider py-0 px-2 h-4">{p.payment_status}</Badge>
                                  </td>
                                  <td className="px-3 py-2 text-right font-bold text-green-700">{p.paid_amount} OMR</td>
                                  <td className="px-3 py-2 text-right">
                                    <div className="flex justify-end gap-1">
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-6 w-6 p-0 text-gray-400 hover:text-blue-600"
                                        onClick={() => handleViewReceipt(p.id)}
                                        title="View Receipt"
                                      >
                                        <Eye className="h-3 w-3" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-6 w-6 p-0 text-gray-400 hover:text-green-600"
                                        onClick={() => handleDownloadReceipt(p.id)}
                                        title="Download Receipt"
                                      >
                                        <Download className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-500 italic">No active financial contracts found for this student profile</div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Agreement Detail Modal */}
      <Dialog open={isAgreementModalOpen} onOpenChange={setIsAgreementModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center justify-between">
              <span>Contract Details: {selectedAgreement?.contract_number}</span>
              <Badge className={selectedAgreement?.payment_completed ? 'bg-green-100 text-green-800' : 'bg-red-50 text-red-600'}>
                {selectedAgreement?.payment_completed ? 'Fully Settled' : 'Outstanding Balance'}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          {selectedAgreement && (
            <div className="space-y-6 mt-4">
              {/* Student Header */}
              <div className="p-4 bg-gray-50 rounded-lg flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Student Information</div>
                  <div className="text-lg font-bold text-blue-700">
                    {getStudentName(selectedAgreement.student_details).en}
                  </div>
                  <div className="text-sm text-gray-600">
                    Adm #: {selectedAgreement.student_details?.admission_number} | {selectedAgreement.admission_class_name}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Academic Year</div>
                  <Badge variant="outline" className="text-sm px-3">{selectedAgreement.academic_year_name}</Badge>
                </div>
              </div>

              {/* Fee Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-slate-50 border-none shadow-none">
                  <CardContent className="p-3">
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Total Fees</div>
                    <div className="text-xl font-bold">{selectedAgreement.total_fees_omr} <span className="text-[10px]">OMR</span></div>
                  </CardContent>
                </Card>
                <Card className="bg-green-50 border-none shadow-none">
                  <CardContent className="p-3">
                    <div className="text-[10px] text-green-700 uppercase font-bold">Paid to Date</div>
                    <div className="text-xl font-bold text-green-700">{selectedAgreement.initial_paid_amount || 0} <span className="text-[10px]">OMR</span></div>
                  </CardContent>
                </Card>
                <Card className="bg-red-50 border-none shadow-none">
                  <CardContent className="p-3">
                    <div className="text-[10px] text-red-700 uppercase font-bold">Balance Due</div>
                    <div className="text-xl font-bold text-red-700">{selectedAgreement.balance_amount || 0} <span className="text-[10px]">OMR</span></div>
                  </CardContent>
                </Card>
                <Card className="bg-blue-50 border-none shadow-none">
                  <CardContent className="p-3">
                    <div className="text-[10px] text-blue-700 uppercase font-bold">Plan</div>
                    <div className="text-medium font-bold uppercase">{selectedAgreement.installment_plan} Inst.</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Specific Fee Breakdown */}
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3 border-b pb-1">Itemized Fees</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Registration:</span> <span className="font-mono">{selectedAgreement.registration_fees} OMR</span></div>
                    <div className="flex justify-between"><span>Tuition:</span> <span className="font-mono">{selectedAgreement.tution_fee} OMR</span></div>
                    <div className="flex justify-between"><span>Stationery:</span> <span className="font-mono">{selectedAgreement.stationery_fees} OMR</span></div>
                    <div className="flex justify-between"><span>Transportation:</span> <span className="font-mono">{selectedAgreement.transportation_fees} OMR</span></div>
                    <div className="flex justify-between"><span>Administrative:</span> <span className="font-mono">{selectedAgreement.administrative_fees} OMR</span></div>
                  </div>
                </div>

                {/* Installment Plan Details */}
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3 border-b pb-1">Installment Schedule</h4>
                  <div className="space-y-2 text-xs">
                    {[1, 2, 3, 4].map(num => {
                      const amount = selectedAgreement[`installment${num}_amount`];
                      const date = selectedAgreement[`installment${num}_date`];
                      if (!amount || amount === "0.000") return null;
                      return (
                        <div key={num} className="flex justify-between p-2 bg-gray-50 rounded border border-gray-100">
                          <span className="font-medium">#{num} - Due: {date || 'N/A'}</span>
                          <span className="font-bold">{amount} OMR</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Contact & Address Details */}
              <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-3 border-b border-amber-200 pb-1">Contact & Address Info</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-[10px] text-amber-600 font-bold uppercase">Mother's Mobile</div>
                    <div>{selectedAgreement.mobile_mother || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-amber-600 font-bold uppercase">Father's Mobile</div>
                    <div>{selectedAgreement.mobile_father || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-amber-600 font-bold uppercase">Residence Address</div>
                    <div className="line-clamp-2">{selectedAgreement.residence_address || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Payment History */}
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3 border-b pb-1">Payment History</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left">Date</th>
                        <th className="px-3 py-2 text-left">Receipt No</th>
                        <th className="px-3 py-2 text-left">Method</th>
                        <th className="px-3 py-2 text-left">Status</th>
                        <th className="px-3 py-2 text-right">Amount</th>
                        <th className="px-3 py-2 text-right">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {selectedAgreement.payment_history?.length > 0 ? (
                        selectedAgreement.payment_history.map((p: any) => (
                          <tr key={p.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-gray-600">{p.date_of_payment}</td>
                            <td className="px-3 py-2 font-medium">{p.receipt_number || 'N/A'}</td>
                            <td className="px-3 py-2 uppercase">{p.payment_method}</td>
                            <td className="px-3 py-2">
                              <Badge variant="outline" className="text-[10px] px-1 h-4">{p.payment_status}</Badge>
                            </td>
                            <td className="px-3 py-2 text-right font-bold text-green-600">{p.paid_amount} OMR</td>
                            <td className="px-3 py-2 text-right">
                              <div className="flex justify-end gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 w-6 p-0 text-gray-400 hover:text-blue-600"
                                  onClick={() => handleViewReceipt(p.id)}
                                  title="View Receipt"
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 w-6 p-0 text-gray-400 hover:text-green-600"
                                  onClick={() => handleDownloadReceipt(p.id)}
                                  title="Download Receipt"
                                >
                                  <Download className="h-3 w-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-gray-400 italic">No payments recorded for this contract</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="mt-6 flex-wrap gap-2">
            <Button 
              variant="outline" 
              className="text-blue-600 border-blue-100 hover:bg-blue-50"
              onClick={() => handleViewPDF(selectedAgreement.id)}
            >
              <Printer className="h-4 w-4 mr-2" /> View/Print Agreement PDF
            </Button>
            <div className="flex-1" />
            <Button variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-100" onClick={() => handleDeleteContract(selectedAgreement.id)}>
              <Trash2 className="h-4 w-4 mr-2" /> Delete Agreement
            </Button>
            <Button onClick={() => setIsAgreementModalOpen(false)}>Close Overview</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grade Modal */}
      <Dialog open={isDeptModalOpen} onOpenChange={setIsDeptModalOpen}>
        <DialogContent>
          <form onSubmit={handleManageDept}>
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Grade' : 'Add New Grade'}</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label>Grade Name (e.g., Grade 1, KG2)</Label>
                <Input value={newItemName} onChange={(e) => setNewItemName(e.target.value)} required />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Section Modal */}
      <Dialog open={isSectionModalOpen} onOpenChange={setIsSectionModalOpen}>
        <DialogContent>
          <form onSubmit={handleManageSection}>
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Section' : 'Add New Section'}</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label>Grade / Department</Label>
                <Select value={selectedDeptId} onValueChange={setSelectedDeptId}>
                  <SelectTrigger><SelectValue placeholder="Link to Grade" /></SelectTrigger>
                  <SelectContent>
                    {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.department_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Section Label (e.g., A, B, Boys, Girls)</Label>
                <Input value={newItemName} onChange={(e) => setNewItemName(e.target.value)} required />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountantDashboard;