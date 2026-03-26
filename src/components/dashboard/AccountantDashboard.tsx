import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Receipt, DollarSign, Search, Printer, Download } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

const AccountantDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);

  const classes = [
    'All Classes', 'KG1', 'KG2', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 
    'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 
    'Grade 10', 'Grade 11', 'Grade 12'
  ];

  const paymentStatuses = [
    { value: 'all', label: 'All Status' },
    { value: 'paid', label: 'Fully Paid' },
    { value: 'partial', label: 'Partially Paid' },
    { value: 'pending', label: 'Pending' },
    { value: 'overdue', label: 'Overdue' }
  ];

  const mockStudents = [
    { 
      id: 1, 
      studentName: 'Ahmad Al-Rashid', 
      studentNameAr: 'أحمد الراشد', 
      class: 'Grade 5', 
      section: 'A', 
      totalFee: 2500, 
      paid: 2500, 
      status: 'paid', 
      course: 'Regular Program',
      paymentHistory: [
        { date: '2023-05-15', amount: 1000, receiptNo: 'RCT-001', method: 'Bank Transfer' },
        { date: '2023-06-20', amount: 1500, receiptNo: 'RCT-005', method: 'Cash' }
      ]
    },
    { 
      id: 2, 
      studentName: 'Fatima Al-Zahra', 
      studentNameAr: 'فاطمة الزهراء', 
      class: 'Grade 3', 
      section: 'B', 
      totalFee: 2200, 
      paid: 1100, 
      status: 'partial', 
      course: 'Regular Program',
      paymentHistory: [
        { date: '2023-05-10', amount: 1100, receiptNo: 'RCT-002', method: 'Credit Card' }
      ]
    },
    { 
      id: 3, 
      studentName: 'Omar Al-Mansouri', 
      studentNameAr: 'عمر المنصوري', 
      class: 'Grade 7', 
      section: 'A', 
      totalFee: 2800, 
      paid: 0, 
      status: 'pending', 
      course: 'Advanced Program',
      paymentHistory: []
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-red-100 text-red-800';
      case 'overdue': return 'bg-red-200 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Fully Paid';
      case 'partial': return 'Partially Paid';
      case 'pending': return 'Pending';
      case 'overdue': return 'Overdue';
      default: return status;
    }
  };

  const filteredStudents = mockStudents.filter(student => {
    const matchesSearch = searchTerm === '' || 
      student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      student.studentNameAr.includes(searchTerm);
    const matchesClass = selectedClass === '' || student.class === selectedClass || selectedClass === 'All Classes';
    const matchesStatus = paymentStatus === '' || student.status === paymentStatus || paymentStatus === 'all';
    
    return matchesSearch && matchesClass && matchesStatus;
  });

  const viewPaymentHistory = (studentId: number) => {
    setSelectedStudent(studentId);
  };

  const backToList = () => {
    setSelectedStudent(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Accountant Controller</h1>
          <p className="text-gray-600" dir="rtl">ممراقب الحسابات</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {selectedStudent === null ? (
        <Card>
          <CardHeader>
            <CardTitle>Student Payment Records</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Search Student</Label>
                <Input
                  placeholder="Enter student name or ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <Label>Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(cls => (
                      <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Payment Status</Label>
                <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentStatuses.map(status => (
                      <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button className="w-full">
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-200 px-4 py-3 text-left">Student Name</th>
                    <th className="border border-gray-200 px-4 py-3 text-left">Class</th>
                    <th className="border border-gray-200 px-4 py-3 text-left">Total Fee</th>
                    <th className="border border-gray-200 px-4 py-3 text-left">Paid</th>
                    <th className="border border-gray-200 px-4 py-3 text-left">Status</th>
                    <th className="border border-gray-200 px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-3">
                        <div>
                          <p className="font-medium">{student.studentName}</p>
                          <p className="text-sm text-gray-500" dir="rtl">{student.studentNameAr}</p>
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3">{student.class} - {student.section}</td>
                      <td className="border border-gray-200 px-4 py-3">{student.totalFee} OMR</td>
                      <td className="border border-gray-200 px-4 py-3">{student.paid} OMR</td>
                      <td className="border border-gray-200 px-4 py-3">
                        <Badge className={`${getStatusColor(student.status)}`}>
                          {getStatusText(student.status)}
                        </Badge>
                      </td>
                      <td className="border border-gray-200 px-4 py-3">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => viewPaymentHistory(student.id)}
                        >
                          <Receipt className="h-3 w-3 mr-2" />
                          View History
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                Payment History for {mockStudents.find(s => s.id === selectedStudent)?.studentName}
              </CardTitle>
              <Button variant="outline" onClick={backToList}>
                Back to List
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span>Total Fees: {mockStudents.find(s => s.id === selectedStudent)?.totalFee} OMR</span>
                <span>Paid: {mockStudents.find(s => s.id === selectedStudent)?.paid} OMR</span>
                <span>Balance: {mockStudents.find(s => s.id === selectedStudent)!.totalFee - mockStudents.find(s => s.id === selectedStudent)!.paid} OMR</span>
              </div>
              <Badge className={`${getStatusColor(mockStudents.find(s => s.id === selectedStudent)?.status || '')} mb-4`}>
                Status: {getStatusText(mockStudents.find(s => s.id === selectedStudent)?.status || '')}
              </Badge>
            </div>

            {mockStudents.find(s => s.id === selectedStudent)?.paymentHistory.length ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border border-gray-200 px-4 py-3 text-left">Date</th>
                      <th className="border border-gray-200 px-4 py-3 text-left">Amount</th>
                      <th className="border border-gray-200 px-4 py-3 text-left">Receipt No</th>
                      <th className="border border-gray-200 px-4 py-3 text-left">Payment Method</th>
                      <th className="border border-gray-200 px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockStudents.find(s => s.id === selectedStudent)?.paymentHistory.map((payment, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-200 px-4 py-3">{payment.date}</td>
                        <td className="border border-gray-200 px-4 py-3">{payment.amount} OMR</td>
                        <td className="border border-gray-200 px-4 py-3">{payment.receiptNo}</td>
                        <td className="border border-gray-200 px-4 py-3">{payment.method}</td>
                        <td className="border border-gray-200 px-4 py-3">
                          <Button size="sm" variant="outline">
                            <Printer className="h-3 w-3 mr-2" />
                            Print Receipt
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No payment history found for this student
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AccountantDashboard;