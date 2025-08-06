
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Calendar, MapPin, Users, Edit, FileText } from "lucide-react";

interface StudentDetailsViewProps {
  student: any;
  onEdit: () => void;
  onPromote?: () => void;
}

const StudentDetailsView = ({ student, onEdit, onPromote }: StudentDetailsViewProps) => {
  if (!student) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Student Details | تفاصيل الطالب
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit | تعديل
            </Button>
            {onPromote && (
              <Button variant="outline" size="sm" onClick={onPromote}>
                <FileText className="mr-2 h-4 w-4" />
                Promote | ترقية
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Personal Information | المعلومات الشخصية</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Student ID | رقم الطالب</label>
                <p className="font-medium">{student.studentId}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Name (English) | الاسم (إنجليزي)</label>
                <p className="font-medium">{student.name}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Name (Arabic) | الاسم (عربي)</label>
                <p className="font-medium" dir="rtl">{student.nameAr}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Date of Birth | تاريخ الميلاد</label>
                <p className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {student.dateOfBirth}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Nationality | الجنسية</label>
                <p className="font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {student.nationality}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Status | الحالة</label>
                <Badge variant={student.status === 'Active' ? 'default' : 'secondary'}>
                  {student.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Academic Information | المعلومات الأكاديمية</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Academic Year | العام الدراسي</label>
                <p className="font-medium">{student.academicYear}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Current Class | الصف الحالي</label>
                <p className="font-medium">{student.class}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Section | القسم</label>
                <p className="font-medium">{student.section}</p>
              </div>
            </div>

            <h3 className="font-semibold text-lg border-b pb-2 mt-6">Guardian Information | معلومات ولي الأمر</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Guardian Name | اسم ولي الأمر</label>
                <p className="font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {student.guardianName}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Guardian Phone | هاتف ولي الأمر</label>
                <p className="font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {student.guardianPhone}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentDetailsView;
