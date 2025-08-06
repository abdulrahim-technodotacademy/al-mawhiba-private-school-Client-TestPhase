
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, GraduationCap, BookOpen, Download, Search, Eye } from "lucide-react";
import { useState } from "react";

const StudentListDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  const stats = [
    { title: 'Total Students', titleAr: 'إجمالي الطلاب', value: '1,245', icon: Users },
    { title: 'Classes Active', titleAr: 'الفصول النشطة', value: '24', icon: GraduationCap },
    { title: 'Courses Offered', titleAr: 'المسارات المتاحة', value: '3', icon: BookOpen },
    { title: 'Academic Year', titleAr: 'العام الأكاديمي', value: '2024-25', icon: GraduationCap }
  ];

  const classes = [
    'All Classes', 'KG1', 'KG2', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 
    'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 
    'Grade 10', 'Grade 11', 'Grade 12'
  ];

  const sections = ['All Sections', 'A', 'B', 'C', 'D'];
  const courses = ['All Courses', 'Regular Program', 'Advanced Program', 'International Program'];

  const mockStudents = [
    { 
      id: 1, 
      studentId: 'STU001', 
      name: 'Ahmad Al-Rashid', 
      nameAr: 'أحمد الراشد', 
      class: 'Grade 5', 
      section: 'A', 
      course: 'Regular Program',
      age: 10,
      admissionYear: '2020',
      guardianName: 'Mohammed Al-Rashid',
      guardianPhone: '+965 9876 5432'
    },
    { 
      id: 2, 
      studentId: 'STU002', 
      name: 'Fatima Al-Zahra', 
      nameAr: 'فاطمة الزهراء', 
      class: 'Grade 3', 
      section: 'B', 
      course: 'Regular Program',
      age: 8,
      admissionYear: '2022',
      guardianName: 'Ali Al-Zahra',
      guardianPhone: '+965 1234 5678'
    },
    { 
      id: 3, 
      studentId: 'STU003', 
      name: 'Omar Al-Mansouri', 
      nameAr: 'عمر المنصوري', 
      class: 'Grade 7', 
      section: 'A', 
      course: 'Advanced Program',
      age: 12,
      admissionYear: '2018',
      guardianName: 'Khalid Al-Mansouri',
      guardianPhone: '+965 5555 4444'
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">

     
      </div>



      {/* Search and Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle>Student Search & Filter | بحث وتصفية الطلاب</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label>Search Student | البحث عن طالب</Label>
              <Input
                placeholder="Name or Student ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label>Class | الصف</Label>
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
              <Label>Section | الشعبة</Label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map(section => (
                    <SelectItem key={section} value={section}>{section}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Course | المسار</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem key={course} value={course}>{course}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                <Search className="mr-2 h-4 w-4" />
                Search | بحث
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student List Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student List | قائمة الطلاب</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-300 px-4 py-3 text-left">Student ID | رقم الطالب</th>
                  <th className="border border-gray-300 px-4 py-3 text-left">Student Name | اسم الطالب</th>
                  <th className="border border-gray-300 px-4 py-3 text-left">Class | الصف</th>
                  <th className="border border-gray-300 px-4 py-3 text-left">Section | الشعبة</th>
                  <th className="border border-gray-300 px-4 py-3 text-left">Course | المسار</th>
                  <th className="border border-gray-300 px-4 py-3 text-left">Age | العمر</th>
                  <th className="border border-gray-300 px-4 py-3 text-left">Admission Year | سنة القبول</th>
                  <th className="border border-gray-300 px-4 py-3 text-left">Guardian | ولي الأمر</th>
                  <th className="border border-gray-300 px-4 py-3 text-left">Actions | الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {mockStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-medium">{student.studentId}</td>
                    <td className="border border-gray-300 px-4 py-3">
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-gray-500" dir="rtl">{student.nameAr}</p>
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-3">{student.class}</td>
                    <td className="border border-gray-300 px-4 py-3">{student.section}</td>
                    <td className="border border-gray-300 px-4 py-3">{student.course}</td>
                    <td className="border border-gray-300 px-4 py-3">{student.age}</td>
                    <td className="border border-gray-300 px-4 py-3">{student.admissionYear}</td>
                    <td className="border border-gray-300 px-4 py-3">
                      <div>
                        <p className="font-medium">{student.guardianName}</p>
                        <p className="text-sm text-gray-500">{student.guardianPhone}</p>
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        View | عرض
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex gap-4">
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Download className="mr-2 h-4 w-4" />
              Export to Excel | تصدير إلى Excel
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export to PDF | تصدير إلى PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentListDashboard;
