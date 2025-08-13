import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, List, FileSpreadsheet, Filter, Download, Users, TrendingUp, Search, X } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";

const AccountAdminDashboard = () => {
  // State management
  const [activeTab, setActiveTab] = useState<'yearly' | 'billing'>('yearly');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [yearlyData, setYearlyData] = useState<any[]>([]);
  const [studentList, setStudentList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentDetails, setStudentDetails] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Fetch academic years on component mount
  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        const response = await axios.get('https://almawhibatest.febnotech.com/api/v1/students/academic-year/');
        setAcademicYears(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedYear(response.data.data[0].id);
        }
      } catch (error) {
        console.error('Error fetching academic years:', error);
      }
    };
    fetchAcademicYears();
  }, []);

  // Fetch student data when selected year changes
  useEffect(() => {
    if (selectedYear) {
      fetchStudentData(selectedYear);
    }
  }, [selectedYear]);

  const fetchStudentData = async (yearId: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`https://almawhibatest.febnotech.com/api/v1/students/students-academic-details/?academic_year_id=${yearId}`);
      const students = response.data.data;
      
      // Process student data
      const processedStudents = students.map((student: any) => {
        const financialAgreement = student.financial_agreement?.[0] || {};
        const totalPaid = student.payment_history?.reduce((sum: number, payment: any) => {
          return sum + parseFloat(payment.paid_amount || '0');
        }, 0) || 0;

        return {
          id: student.id,
          admissionNumber: student.admission_number,
          name: `${student.en_first_name} ${student.en_last_name}`,
          nameAr: `${student.ar_first_name} ${student.ar_last_name}`,
          grade: student.admission_class?.department_name || 'N/A',
          status: student.is_active ? 'Active' : 'Inactive',
          totalFees: parseFloat(financialAgreement.total_fees_omr || '0'),
          paidAmount: totalPaid,
          paymentHistory: student.payment_history || [],
          academicYearId: yearId
        };
      });

      setStudentList(processedStudents);
      
      // Extract unique classes for filtering
      const classes = [...new Set(processedStudents.map(student => student.grade))] as string[];
      setAvailableClasses(classes);

      // Calculate yearly summary
      const year = academicYears.find(y => y.id === yearId)?.name || yearId;
      const totalStudents = processedStudents.length;
      const totalRevenue = processedStudents.reduce((sum: number, student: any) => sum + student.totalFees, 0);
      const totalPaid = processedStudents.reduce((sum: number, student: any) => sum + student.paidAmount, 0);
      
      setYearlyData([{
        year,
        students: totalStudents,
        revenue: totalRevenue.toFixed(3),
        paid: totalPaid.toFixed(3)
      }]);
      
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter students based on search and class selection
  const filteredStudents = studentList.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         student.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === 'all' || student.grade === selectedClass;
    return matchesSearch && matchesClass;
  });

  const stats = [
    { 
      title: 'Total Revenue', 
      titleAr: 'إجمالي الإيرادات', 
      value: yearlyData[0]?.revenue ? `${yearlyData[0].revenue} OMR` : '0 OMR', 
      icon: () => <span className="font-bold text-green-600">OMR</span>, 
      trend: '+0.0%' 
    },
    { 
      title: 'Active Students', 
      titleAr: 'الطلاب النشطون', 
      value: yearlyData[0]?.students || '0', 
      icon: Users, 
      trend: '+0.0%' 
    },
    { 
      title: 'Collection Rate', 
      titleAr: 'معدل التحصيل', 
      value: yearlyData[0]?.revenue && yearlyData[0]?.paid 
        ? `${((parseFloat(yearlyData[0].paid) / parseFloat(yearlyData[0].revenue) * 100).toFixed(2))}%` 
        : '0%', 
      icon: TrendingUp, 
      trend: '+0.0%' 
    }
  ];

  const showStudentDetails = async (student: any) => {
    setSelectedStudent(student);
    setIsDetailModalOpen(true);
    setDetailLoading(true);
    
    try {
      const response = await axios.get(
        `https://almawhibatest.febnotech.com/api/v1/students/students-academic-details/?academic_year_id=${student.academicYearId}&student_id=${student.id}`
      );
      setStudentDetails(response.data.data);
    } catch (error) {
      console.error('Error fetching student details:', error);
      setStudentDetails(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = () => {
    setIsDetailModalOpen(false);
    setSelectedStudent(null);
    setStudentDetails(null);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Main Action Tabs */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          className={`px-6 py-3 font-medium ${activeTab === 'yearly' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('yearly')}
        >
          <FileSpreadsheet className="inline mr-2 h-4 w-4" />
          Yearly Management | الإدارة السنوية
        </button>
        <button
          className={`px-6 py-3 font-medium ${activeTab === 'billing' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('billing')}
        >
          <FileText className="inline mr-2 h-4 w-4" />
          Student Billing | الفواتير الدراسية
        </button>
      </div>

      {/* Content Area */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : activeTab === 'yearly' ? (
          <div className="space-y-6">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">Yearly Financial Sheets | السجلات المالية السنوية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Academic Year | اختر السنة الدراسية
                  </label>
                  <select
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                  >
                    {academicYears.map((year) => (
                      <option key={year.id} value={year.id}>
                        {year.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Year | السنة
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Students | الطلاب
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Revenue | إجمالي الإيرادات
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Paid | المدفوع
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions | الإجراءات
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {yearlyData.map((year, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {year.year}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {year.students}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {year.revenue} OMR
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {year.paid} OMR
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <Button variant="outline" size="sm" className="mr-2">
                              <Download className="h-4 w-4 mr-1" />
                              Export
                            </Button>
                            <Button variant="outline" size="sm">
                              <List className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">
                Student Billing for {yearlyData[0]?.year} | الفواتير الدراسية لسنة {yearlyData[0]?.year}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search students..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                  >
                    <option value="all">All Classes</option>
                    {availableClasses.map((classItem) => (
                      <option key={classItem} value={classItem}>
                        {classItem}
                      </option>
                    ))}
                  </select>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student ID | الرقم الدراسي
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name | الاسم
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Grade | الصف
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status | الحالة
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Fees | الرسوم الكلية
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Paid | المدفوع
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pending | المتبقي
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions | الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => {
                        const pendingAmount = student.totalFees - student.paidAmount;
                        return (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {student.admissionNumber}
                            </td>
                            <td 
                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 cursor-pointer hover:text-blue-600 hover:underline"
                              onClick={() => showStudentDetails(student)}
                            >
                              {student.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.grade}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                student.status === 'Active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {student.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.totalFees.toFixed(3)} OMR
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                              {student.paidAmount.toFixed(3)} OMR
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                              pendingAmount > 0 ? 'text-red-600' : 'text-gray-500'
                            }`}>
                              {pendingAmount.toFixed(3)} OMR
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <Button variant="outline" size="sm">
                                <FileText className="h-4 w-4 mr-1" />
                                Generate Bill
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                          No students found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Student Details Modal */}
        {isDetailModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  Student Details: {selectedStudent?.name} | تفاصيل الطالب: {selectedStudent?.nameAr}
                </h2>
                <button 
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {detailLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
                </div>
              ) : studentDetails ? (
                <div className="space-y-4">
                  {/* Basic Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Basic Information | المعلومات الأساسية</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p><strong>Admission Number:</strong> {studentDetails.admission_number}</p>
                        <p><strong>Name:</strong> {studentDetails.en_first_name} {studentDetails.en_last_name}</p>
                        <p><strong>الاسم:</strong> {studentDetails.ar_first_name} {studentDetails.ar_last_name}</p>
                        <p><strong>Date of Birth:</strong> {studentDetails.date_of_birth}</p>
                        <p><strong>Gender:</strong> {studentDetails.gender}</p>
                      </div>
                      <div className="space-y-2">
                        <p><strong>Class:</strong> {studentDetails.admission_class?.department_name}</p>
                        <p><strong>Section:</strong> {studentDetails.section?.name}</p>
                        <p><strong>Status:</strong> {studentDetails.is_active ? 'Active' : 'Inactive'}</p>
                        <p><strong>Email:</strong> {studentDetails.email}</p>
                        <p><strong>Phone:</strong> {studentDetails.phone}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Financial Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Financial Information | المعلومات المالية</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {studentDetails.financial_agreement?.length > 0 ? (
                        <>
                          <div className="space-y-2">
                            <p><strong>Contract Number:</strong> {studentDetails.financial_agreement[0].contract_number}</p>
                            <p><strong>Total Fees:</strong> {studentDetails.financial_agreement[0].total_fees_omr} OMR</p>
                            <p><strong>Paid Amount:</strong> {selectedStudent?.paidAmount.toFixed(3)} OMR</p>
                            <p className={selectedStudent?.totalFees - selectedStudent?.paidAmount > 0 ? 'text-red-600' : ''}>
                              <strong>Pending Amount:</strong> {(selectedStudent?.totalFees - selectedStudent?.paidAmount).toFixed(3)} OMR
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p><strong>Payment Plan:</strong> {studentDetails.financial_agreement[0].installment_plan}</p>
                            <p><strong>Registration Fees:</strong> {studentDetails.financial_agreement[0].registration_fees} OMR</p>
                            <p><strong>Books Fees:</strong> {studentDetails.financial_agreement[0].books_fees} OMR</p>
                            <p><strong>Transportation Fees:</strong> {studentDetails.financial_agreement[0].transportation_fees} OMR</p>
                          </div>
                        </>
                      ) : (
                        <p>No financial agreement found</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Payment History */}
                  {/* <Card>
                    <CardHeader>
                      <CardTitle>Payment History | سجل الدفع</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {studentDetails.payment_history?.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {studentDetails.payment_history.map((payment: any) => (
                                <tr key={payment.id}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {payment.date_of_payment}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                                    {payment.paid_amount} OMR
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {payment.payment_status}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p>No payment history found</p>
                      )}
                    </CardContent>
                  </Card> */}

  
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Failed to load student details
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountAdminDashboard;