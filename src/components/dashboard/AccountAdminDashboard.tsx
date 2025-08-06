
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, List, FileSpreadsheet, Filter, Download, Users, TrendingUp, AlertTriangle } from "lucide-react";
import { useState } from "react";

const AccountAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'yearly' | 'reports'>('reports');
  const [reportSubTab, setReportSubTab] = useState<'generateInvoice' | 'billingHistory'>('generateInvoice');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const stats = [
    { title: 'Total Revenue', titleAr: 'إجمالي الإيرادات', value: '2,450,000 OMR', icon: () => <span className="font-bold text-green-600">OMR</span>, trend: '+12.5%' },
    { title: 'Active Students', titleAr: 'الطلاب النشطون', value: '1,245', icon: Users, trend: '+3.2%' },
    { title: 'Collection Rate', titleAr: 'معدل التحصيل', value: '89.5%', icon: TrendingUp, trend: '+5.1%' },
    { title: 'Outstanding Dues', titleAr: 'المستحقات المتبقية', value: '285,000 OMR', icon: AlertTriangle, trend: '-8.3%' }
  ];

  const yearlyData = [
    { year: '2023', students: 980, revenue: '1,850,000', paid: '1,650,000', outstanding: '200,000' },
    { year: '2022', students: 875, revenue: '1,620,000', paid: '1,450,000', outstanding: '170,000' },
    { year: '2021', students: 790, revenue: '1,450,000', paid: '1,300,000', outstanding: '150,000' },
  ];

  const studentList = [
    { id: 'S1001', name: 'Ahmed Al-Mansoori', grade: '10', status: 'Active', balance: '1,200 OMR', year: '2023' },
    { id: 'S1002', name: 'Fatima Al-Hashmi', grade: '9', status: 'Active', balance: '800 OMR', year: '2023' },
    { id: 'S1003', name: 'Yousef Al-Balushi', grade: '11', status: 'Active', balance: '1,500 OMR', year: '2022' },
    { id: 'S1004', name: 'Mariam Al-Siyabi', grade: '12', status: 'Graduated', balance: '0 OMR', year: '2022' },
    { id: 'S1005', name: 'Khalid Al-Rashidi', grade: '10', status: 'Active', balance: '2,000 OMR', year: '2021' },
  ];

  const billingHistory = [
    { invoiceId: 'INV001', studentId: 'S1001', studentName: 'Ahmed Al-Mansoori', amount: '1,200 OMR', status: 'Paid', date: '2023-10-15', year: '2023' },
    { invoiceId: 'INV002', studentId: 'S1002', studentName: 'Fatima Al-Hashmi', amount: '800 OMR', status: 'Pending', date: '2023-11-01', year: '2023' },
    { invoiceId: 'INV003', studentId: 'S1003', studentName: 'Yousef Al-Balushi', amount: '1,500 OMR', status: 'Paid', date: '2022-09-20', year: '2022' },
    { invoiceId: 'INV004', studentId: 'S1004', studentName: 'Mariam Al-Siyabi', amount: '0 OMR', status: 'Paid', date: '2022-08-10', year: '2022' },
    { invoiceId: 'INV005', studentId: 'S1005', studentName: 'Khalid Al-Rashidi', amount: '2,000 OMR', status: 'Pending', date: '2021-12-05', year: '2021' },
  ];

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId) 
        : [...prev, studentId]
    );
  };

  const generateBillsForSelected = () => {
    alert(`Generating bills for ${selectedStudents.length} selected students for year ${selectedYear}`);
  };

  const filteredStudentList = studentList.filter(student => student.year === selectedYear);
  const filteredBillingHistory = billingHistory.filter(bill => bill.year === selectedYear);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Accountant</h1>
          <p className="text-gray-600" dir="rtl">محاسب</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-gray-300">
            <Calendar className="mr-2 h-4 w-4" />
            Generate Report | إنشاء تقرير
          </Button>
          <Button className="bg-red-600 hover:bg-red-700">
            <TrendingUp className="mr-2 h-4 w-4" />
            Financial Summary | الملخص المالي
          </Button>
        </div>
      </div>

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
          className={`px-6 py-3 font-medium ${activeTab === 'reports' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('reports')}
        >
          <FileText className="inline mr-2 h-4 w-4" />
          Reports | التقارير
        </button>
      </div>

      {/* Content Area */}
      <div className="space-y-6">
        {activeTab === 'yearly' && (
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
                    <option value="2023">2023-2024</option>
                    <option value="2022">2022-2023</option>
                    <option value="2021">2021-2022</option>
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
                          Outstanding | المستحقات المتبقية
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions | الإجراءات
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {yearlyData
                        .filter(data => data.year === selectedYear)
                        .map((year, index) => (
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                              {year.outstanding} OMR
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

            <Card className="border-gray-200">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">
                    Student Billing for {selectedYear} | الفواتير الدراسية لسنة {selectedYear}
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-1" />
                      Filter
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-red-600 hover:bg-red-700"
                      disabled={selectedStudents.length === 0}
                      onClick={generateBillsForSelected}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Generate Bills ({selectedStudents.length})
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Select
                        </th>
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
                          Balance | الرصيد
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredStudentList.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedStudents.includes(student.id)}
                              onChange={() => toggleStudentSelection(student.id)}
                              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {student.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <span className={student.balance === '0 OMR' ? 'text-green-600' : 'text-red-600'}>
                              {student.balance}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'reports' && (
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">Reports | التقارير</CardTitle>
              <div className="flex space-x-4 border-b border-gray-200">
                <button
                  className={`px-6 py-3 font-medium ${reportSubTab === 'generateInvoice' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-600'}`}
                  onClick={() => setReportSubTab('generateInvoice')}
                >
                  <FileText className="inline mr-2 h-4 w-4" />
                  Generate Invoice | إنشاء فاتورة
                </button>
                <button
                  className={`px-6 py-3 font-medium ${reportSubTab === 'billingHistory' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-600'}`}
                  onClick={() => setReportSubTab('billingHistory')}
                >
                  <List className="inline mr-2 h-4 w-4" />
                  Billing History | سجل الفواتير
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {reportSubTab === 'generateInvoice' && (
                <div className="space-y-6">
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Academic Year | اختر السنة الدراسية
                    </label>
                    <select
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                    >
                      <option value="2023">2023-2024</option>
                      <option value="2022">2022-2023</option>
                      <option value="2021">2021-2022</option>
                    </select>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Generate Invoice for {selectedYear} | إنشاء فاتورة لسنة {selectedYear}</h3>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-1" />
                        Filter
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-red-600 hover:bg-red-700"
                        disabled={selectedStudents.length === 0}
                        onClick={generateBillsForSelected}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Generate Bills ({selectedStudents.length})
                      </Button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Select
                          </th>
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
                            Balance | الرصيد
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredStudentList.map((student) => (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={selectedStudents.includes(student.id)}
                                onChange={() => toggleStudentSelection(student.id)}
                                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {student.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.name}
                            </td>
                            <td className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <span className={student.balance === '0 OMR' ? 'text-green-600' : 'text-red-600'}>
                                {student.balance}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {reportSubTab === 'billingHistory' && (
                <div className="space-y-6">
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Academic Year | اختر السنة الدراسية
                    </label>
                    <select
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                    >
                      <option value="2023">2023-2024</option>
                      <option value="2022">2022-2023</option>
                      <option value="2021">2021-2022</option>
                    </select>
                  </div>
                  <h3 className="text-lg font-semibold">Billing History for {selectedYear} | سجل الفواتير لسنة {selectedYear}</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Invoice ID | رقم الفاتورة
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student ID | الرقم الدراسي
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student Name | اسم الطالب
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount | المبلغ
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status | الحالة
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date | التاريخ
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions | الإجراءات
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredBillingHistory.map((bill) => (
                          <tr key={bill.invoiceId} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {bill.invoiceId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {bill.studentId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {bill.studentName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {bill.amount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                bill.status === 'Paid' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {bill.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {bill.date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AccountAdminDashboard;
