
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Users, Award, Globe, BookOpen, Heart } from "lucide-react";
import Navigation from "@/components/layout/Navigation";
import { useState } from "react";
import LoginModal from "@/components/auth/LoginModal";

const About = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const values = [
    {
      icon: <BookOpen className="h-12 w-12 text-[rgb(102,42,20)]" />,
      title: "Academic Excellence",
      titleAr: "التميز الأكاديمي",
      description: "We maintain the highest standards of education following GCC curriculum guidelines.",
      descriptionAr: "نحافظ على أعلى معايير التعليم وفقاً لإرشادات مناهج دول مجلس التعاون الخليجي"
    },
    {
      icon: <Heart className="h-12 w-12 text-[rgb(102,42,20)]" />,
      title: "Islamic Values",
      titleAr: "القيم الإسلامية",
      description: "Character building through Islamic principles and moral education.",
      descriptionAr: "بناء الشخصية من خلال المبادئ الإسلامية والتربية الأخلاقية"
    },
    {
      icon: <Users className="h-12 w-12 text-[rgb(102,42,20)]" />,
      title: "Community Focus",
      titleAr: "التركيز على المجتمع",
      description: "Building strong relationships within our diverse learning community.",
      descriptionAr: "بناء علاقات قوية داخل مجتمعنا التعليمي المتنوع"
    },
    {
      icon: <Globe className="h-12 w-12 text-[rgb(102,42,20)]" />,
      title: "Global Perspective",
      titleAr: "المنظور العالمي",
      description: "Preparing students for success in a globalized world.",
      descriptionAr: "إعداد الطلاب للنجاح في عالم معولم"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gold-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            About Our School
            <span className="block text-[rgb(102,42,20)] mt-2" dir="rtl">عن مدرستنا</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            AL-MAWHIBA School has been a beacon of educational excellence for over two decades, 
            committed to nurturing young minds through a blend of modern pedagogy and traditional values.
          </p>
          <p className="text-lg text-gray-500 mt-4 max-w-3xl mx-auto" dir="rtl">
            كانت مدرسة دول مجلس التعاون منارة للتميز التعليمي لأكثر من عقدين، 
            ملتزمة بتنمية العقول الشابة من خلال مزيج من التعليم الحديث والقيم التقليدية
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <Card className="p-8 border-0 shadow-lg">
              <CardContent className="p-0">
                <h2 className="text-3xl font-bold text-[rgb(102,42,20)] mb-4">Our Mission</h2>
                <h3 className="text-2xl font-bold text-gray-800 mb-6" dir="rtl">مهمتنا</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  To provide a comprehensive Islamic education that develops students intellectually, 
                  spiritually, and socially, preparing them to be responsible global citizens.
                </p>
                <p className="text-gray-500" dir="rtl">
                  تقديم تعليم إسلامي شامل ينمي الطلاب فكرياً وروحياً واجتماعياً، 
                  وإعدادهم ليكونوا مواطنين عالميين مسؤولين
                </p>
              </CardContent>
            </Card>

            <Card className="p-8 border-0 shadow-lg">
              <CardContent className="p-0">
                <h2 className="text-3xl font-bold text-[rgb(102,42,20)] mb-4">Our Vision</h2>
                <h3 className="text-2xl font-bold text-gray-800 mb-6" dir="rtl">رؤيتنا</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  To be the leading educational institution in the GCC region, 
                  recognized for academic excellence and character development.
                </p>
                <p className="text-gray-500" dir="rtl">
                  أن نكون المؤسسة التعليمية الرائدة في منطقة دول مجلس التعاون الخليجي، 
                  معترف بها للتميز الأكاديمي وتنمية الشخصية
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600" dir="rtl">قيمنا الأساسية</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-xl transition-shadow">
                <CardContent className="p-0">
                  <div className="mb-6 flex justify-center">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                  <h4 className="text-lg font-semibold text-[rgb(102,42,20)] mb-4" dir="rtl">{value.titleAr}</h4>
                  <p className="text-gray-600 mb-3">{value.description}</p>
                  <p className="text-gray-500 text-sm" dir="rtl">{value.descriptionAr}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

   
    </div>
  );
};

export default About;
