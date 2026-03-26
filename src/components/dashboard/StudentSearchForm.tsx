
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, User, Eye } from "lucide-react";
import Swal from 'sweetalert2';

interface StudentSearchFormProps {
  onStudentFound: (student: any) => void;
}

const StudentSearchForm = ({ onStudentFound }: StudentSearchFormProps) => {
  const [searchCriteria, setSearchCriteria] = useState({
    searchType: '',
    searchValue: '',
    academicYear: '',
    class: '',
    section: ''
  });

  // Mock student data - in real app, this would come from API
  const mockStudents = [
    {
      id: 1,
      studentId: "GCC2024001",
      name: "Ahmed Mohammed Al-Rashid",
      nameAr: "أحمد محمد الراشد",
      class: "Grade 10",
      section: "A",
      academicYear: "2023-2024",
      nationality: "Saudi Arabian",
      dateOfBirth: "2008-05-15",
      guardianName: "Mohammed Al-Rashid",
      guardianPhone: "+966501234567",
      status: "Active"
    },
    {
      id: 2,
      studentId: "GCC2024002", 
      name: "Fatima Ali Al-Zahra",
      nameAr: "فاطمة علي الزهراء",
      class: "Grade 9",
      section: "B",
      academicYear: "2023-2024",
      nationality: "Kuwaiti",
      dateOfBirth: "2009-08-22",
      guardianName: "Ali Al-Zahra",
      guardianPhone: "+965123456789",
      status: "Active"
    }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchCriteria.searchType || !searchCriteria.searchValue) {
      Swal.fire({
        title: 'Error!',
        text: 'Please select search type and enter search value',
        icon: 'error',
        timer: 5000,
        timerProgressBar: true,
        confirmButtonText: 'OK'
      });
      return;
    }

    // Mock search logic
    const foundStudent = mockStudents.find(student => {
      switch (searchCriteria.searchType) {
        case 'studentId':
          return student.studentId.toLowerCase().includes(searchCriteria.searchValue.toLowerCase());
        case 'name':
          return student.name.toLowerCase().includes(searchCriteria.searchValue.toLowerCase()) ||
                 student.nameAr.includes(searchCriteria.searchValue);
        case 'guardian':
          return student.guardianName.toLowerCase().includes(searchCriteria.searchValue.toLowerCase());
        default:
          return false;
      }
    });

    if (foundStudent) {
      Swal.fire({
        title: 'Success!',
        text: 'Student found successfully!',
        icon: 'success',
        timer: 5000,
        timerProgressBar: true,
        confirmButtonText: 'OK'
      });
      onStudentFound(foundStudent);
    } else {
      Swal.fire({
        title: 'Error!',
        text: 'No student found with the given criteria',
        icon: 'error',
        timer: 5000,
        timerProgressBar: true,
        confirmButtonText: 'OK'
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Search Student | البحث عن طالب
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="searchType">Search By | البحث بواسطة</Label>
              <Select 
                value={searchCriteria.searchType} 
                onValueChange={(value) => setSearchCriteria({...searchCriteria, searchType: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select search type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="studentId">Admission Number | رقم القبول</SelectItem>
                  <SelectItem value="name">Student Name | اسم الطالب</SelectItem>
                  <SelectItem value="guardian">Guardian Name | اسم ولي الأمر</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="searchValue">Search Value | قيمة البحث</Label>
              <Input
                id="searchValue"
                value={searchCriteria.searchValue}
                onChange={(e) => setSearchCriteria({...searchCriteria, searchValue: e.target.value})}
                placeholder="Enter search value..."
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="academicYear">Academic Year | العام الدراسي</Label>
              <Select 
                value={searchCriteria.academicYear} 
                onValueChange={(value) => setSearchCriteria({...searchCriteria, academicYear: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2023-2024">2023-2024</SelectItem>
                  <SelectItem value="2022-2023">2022-2023</SelectItem>
                  <SelectItem value="2021-2022">2021-2022</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="class">Class | الصف</Label>
              <Select 
                value={searchCriteria.class} 
                onValueChange={(value) => setSearchCriteria({...searchCriteria, class: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Grade 9">Grade 9</SelectItem>
                  <SelectItem value="Grade 10">Grade 10</SelectItem>
                  <SelectItem value="Grade 11">Grade 11</SelectItem>
                  <SelectItem value="Grade 12">Grade 12</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="section">Section | القسم</Label>
              <Select 
                value={searchCriteria.section} 
                onValueChange={(value) => setSearchCriteria({...searchCriteria, section: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Sections" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Section A</SelectItem>
                  <SelectItem value="B">Section B</SelectItem>
                  <SelectItem value="C">Section C</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
            <Search className="mr-2 h-4 w-4" />
            Search Student | البحث عن الطالب
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default StudentSearchForm;
