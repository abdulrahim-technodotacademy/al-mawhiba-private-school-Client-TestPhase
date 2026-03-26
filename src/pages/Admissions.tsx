
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, Users, CheckCircle, Download, Upload } from "lucide-react";
import Navigation from "@/components/layout/Navigation";
import { useState } from "react";
import LoginModal from "@/components/auth/LoginModal";

const Admissions = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const requirements = [
    {
      icon: <FileText className="h-6 w-6 text-[rgb(102,42,20)]" />,
      title: "Birth Certificate",
      titleAr: "شهادة الميلاد",
      description: "Original and copy required"
    },
    {
      icon: <FileText className="h-6 w-6 text-[rgb(102,42,20)]" />,
      title: "Passport Copy",
      titleAr: "صورة جواز السفر",
      description: "Valid passport with visa"
    },
    {
      icon: <FileText className="h-6 w-6 text-[rgb(102,42,20)]" />,
      title: "Previous School Records",
      titleAr: "سجلات المدرسة السابقة",
      description: "Academic transcripts and certificates"
    },
    {
      icon: <FileText className="h-6 w-6 text-[rgb(102,42,20)]" />,
      title: "Medical Records",
      titleAr: "السجلات الطبية",
      description: "Vaccination records and health certificate"
    },
    {
      icon: <FileText className="h-6 w-6 text-[rgb(102,42,20)]" />,
      title: "Guardian Information",
      titleAr: "معلومات ولي الأمر",
      description: "ID copies and contact details"
    }
  ];

  const admissionSteps = [
    {
      step: 1,
      title: "Submit Application",
      titleAr: "تقديم الطلب",
      description: "Complete online application form with required documents"
    },
    {
      step: 2,
      title: "Document Review",
      titleAr: "مراجعة الوثائق",
      description: "Our admission team reviews all submitted documents"
    },
    {
      step: 3,
      title: "Assessment Test",
      titleAr: "اختبار التقييم",
      description: "Student assessment based on grade level requirements"
    },
    {
      step: 4,
      title: "Interview",
      titleAr: "المقابلة",
      description: "Meeting with student and parents/guardians"
    },
    {
      step: 5,
      title: "Admission Decision",
      titleAr: "قرار القبول",
      description: "Notification of admission status within 7 days"
    },
    {
      step: 6,
      title: "Enrollment",
      titleAr: "التسجيل",
      description: "Complete enrollment process and fee payment"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gold-50">
      <Navigation  />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Admissions
            <span className="block text-[rgb(102,42,20)] mt-2" dir="rtl">القبول والتسجيل</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Join our community of learners and begin an educational journey that combines 
            academic excellence with Islamic values.
          </p>
          <p className="text-lg text-gray-500 mt-4 max-w-3xl mx-auto" dir="rtl">
            انضم إلى مجتمعنا من المتعلمين وابدأ رحلة تعليمية تجمع بين التميز الأكاديمي والقيم الإسلامية
          </p>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
            style={{backgroundColor: 'rgb(102,42,20)'}}
              size="lg" 
              className=" text-white px-8 py-4"
              onClick={() => setIsLoginOpen(true)}
            >
              <Upload className="mr-2 h-5 w-5" />
              Apply Online | تقدم عبر الإنترنت
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className=" text-[rgb(102,42,20)] hover:bg-blue-50 px-8 py-4"
            >
              <Download className="mr-2 h-5 w-5" />
              Download Forms | تحميل النماذج
            </Button>
          </div>
        </div>
      </section>

      {/* Admission Process */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Admission Process</h2>
            <p className="text-xl text-gray-600" dir="rtl">عملية القبول</p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {admissionSteps.map((step, index) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex items-start space-x-4">
                      <div style={{backgroundColor:'rgb(102,42,20)'}} className=" text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                        <h4 className="text-lg font-semibold text-[rgb(102,42,20)] mb-3" dir="rtl">{step.titleAr}</h4>
                        <p className="text-gray-600">{step.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Required Documents */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Required Documents</h2>
            <p className="text-xl text-gray-600" dir="rtl">الوثائق المطلوبة</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requirements.map((req, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      {req.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">{req.title}</h3>
                      <h4 className="text-sm font-semibold text-[rgb(102,42,20)] mb-2" dir="rtl">{req.titleAr}</h4>
                      <p className="text-gray-600 text-sm">{req.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Important Dates */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Important Dates</h2>
            <p className="text-xl text-gray-600" dir="rtl">التواريخ المهمة</p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <Card className="p-8">
              <CardContent className="p-0">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <Calendar className="h-6 w-6 text-[rgb(102,42,20)]" />
                    <div className="text-center">
                      <p className="font-semibold">Application Deadline</p>
                      <p className="text-gray-600">March 31, 2024</p>
                    </div>
                    <div className="text-center" dir="rtl">
                      <p className="font-semibold">الموعد النهائي للتقديم</p>
                      <p className="text-gray-600">٣١ مارس ٢٠٢٤</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg text-center">
                      <h4 className="font-semibold mb-2">Academic Year Starts</h4>
                      <p className="text-gray-600">September 1, 2024</p>
                    </div>
                    <div className="p-4 border rounded-lg text-center" dir="rtl">
                      <h4 className="font-semibold mb-2">بداية العام الدراسي</h4>
                      <p className="text-gray-600">١ سبتمبر ٢٠٢٤</p>
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

export default Admissions;
