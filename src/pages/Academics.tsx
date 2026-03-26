
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Users, Award, Clock, Calculator, Globe2, Beaker, Palette } from "lucide-react";
import Navigation from "@/components/layout/Navigation";
import { useState } from "react";
import LoginModal from "@/components/auth/LoginModal";

const Academics = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const programs = [
    {
      icon: <BookOpen className="h-8 w-8 text-[rgb(102,42,20)]" />,
      title: "Primary Education",
      titleAr: "التعليم الابتدائي",
      grades: "KG - Grade 5",
      gradesAr: "الروضة - الصف الخامس",
      description: "Foundation building with focus on Islamic values and basic academics."
    },
    {
      icon: <Users className="h-8 w-8 text-[rgb(102,42,20)]" />,
      title: "Middle School",
      titleAr: "المرحلة المتوسطة",
      grades: "Grade 6 - Grade 8",
      gradesAr: "الصف السادس - الصف الثامن",
      description: "Comprehensive curriculum preparing students for advanced studies."
    },
    {
      icon: <Award className="h-8 w-8 text-[rgb(102,42,20)]" />,
      title: "High School",
      titleAr: "المرحلة الثانوية",
      grades: "Grade 9 - Grade 12",
      gradesAr: "الصف التاسع - الصف الثاني عشر",
      description: "Advanced placement courses and university preparation programs."
    }
  ];

  const subjects = [
    { icon: <Calculator className="h-6 w-6" />, name: "Mathematics", nameAr: "الرياضيات" },
    { icon: <Beaker className="h-6 w-6" />, name: "Sciences", nameAr: "العلوم" },
    { icon: <Globe2 className="h-6 w-6" />, name: "Social Studies", nameAr: "الدراسات الاجتماعية" },
    { icon: <BookOpen className="h-6 w-6" />, name: "Languages", nameAr: "اللغات" },
    { icon: <Palette className="h-6 w-6" />, name: "Arts", nameAr: "الفنون" },
    { icon: <Users className="h-6 w-6" />, name: "Islamic Studies", nameAr: "الدراسات الإسلامية" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gold-50">
      <Navigation  />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Academic Programs
            <span className="block text-[rgb(102,42,20)] mt-2" dir="rtl">البرامج الأكاديمية</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our comprehensive curriculum combines international standards with Islamic values, 
            preparing students for success in higher education and beyond.
          </p>
          <p className="text-lg text-gray-500 mt-4 max-w-3xl mx-auto" dir="rtl">
            منهجنا الشامل يجمع بين المعايير الدولية والقيم الإسلامية، 
            إعداد الطلاب للنجاح في التعليم العالي وما بعده
          </p>
        </div>
      </section>

      {/* Academic Programs */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Educational Levels</h2>
            <p className="text-xl text-gray-600" dir="rtl">المستويات التعليمية</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {programs.map((program, index) => (
              <Card key={index} className="p-8 hover:shadow-xl transition-shadow border-0 shadow-lg">
                <CardContent className="p-0 text-center">
                  <div className="mb-6 flex justify-center bg-blue-50 p-4 rounded-full w-fit mx-auto">
                    {program.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{program.title}</h3>
                  <h4 className="text-xl font-semibold text-[rgb(102,42,20)] mb-4" dir="rtl">{program.titleAr}</h4>
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <p className="font-semibold text-gray-700">{program.grades}</p>
                    <p className="text-gray-600" dir="rtl">{program.gradesAr}</p>
                  </div>
                  <p className="text-gray-600">{program.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Core Subjects</h2>
            <p className="text-xl text-gray-600" dir="rtl">المواد الأساسية</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0 flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    {subject.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{subject.name}</h3>
                    <p className="text-gray-600" dir="rtl">{subject.nameAr}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">School Schedule</h2>
            <p className="text-xl text-gray-600" dir="rtl">الجدول المدرسي</p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <Card className="p-8">
              <CardContent className="p-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <Clock className="h-6 w-6 text-[rgb(102,42,20)]" />
                    <div className="text-center">
                      <p className="font-semibold">School Hours</p>
                      <p className="text-gray-600">7:30 AM - 2:30 PM</p>
                    </div>
                    <div className="text-center" dir="rtl">
                      <p className="font-semibold">ساعات المدرسة</p>
                      <p className="text-gray-600">٧:٣٠ ص - ٢:٣٠ م</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Weekend</h4>
                      <p className="text-gray-600">Friday & Saturday</p>
                    </div>
                    <div className="p-4 border rounded-lg" dir="rtl">
                      <h4 className="font-semibold mb-2">عطلة نهاية الأسبوع</h4>
                      <p className="text-gray-600">الجمعة والسبت</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>


    </div>
  );
};

export default Academics;
