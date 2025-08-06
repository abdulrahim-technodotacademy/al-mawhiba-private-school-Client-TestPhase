import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  GraduationCap,
  Users,
  BookOpen,
  Award,
  Globe,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import Navigation from "@/components/layout/Navigation";

const Index = () => {
  const features = [
    {
      icon: <GraduationCap className="h-12 w-12 text-[rgb(102,42,20)]" />,
      title: "Academic Excellence",
      titleAr: "التميز الأكاديمي",
      description:
        "Comprehensive curriculum aligned with GCC educational standards",
      descriptionAr:
        "منهج شامل متوافق مع معايير التعليم في دول مجلس التعاون الخليجي",
    },
    {
      icon: <Users className="h-12 w-12 text-[rgb(102,42,20)]" />,
      title: "Expert Faculty",
      titleAr: "هيئة تدريس متخصصة",
      description: "Qualified educators dedicated to student success",
      descriptionAr: "مربون مؤهلون مكرسون لنجاح الطلاب",
    },
    {
      icon: <BookOpen className="h-12 w-12 text-[rgb(102,42,20)]" />,
      title: "Modern Facilities",
      titleAr: "مرافق حديثة",
      description: "State-of-the-art classrooms and learning environments",
      descriptionAr: "فصول دراسية وبيئات تعلم حديثة",
    },
    {
      icon: <Award className="h-12 w-12 text-[rgb(102,42,20)]" />,
      title: "Character Development",
      titleAr: "تنمية الشخصية",
      description: "Building strong moral values and leadership skills",
      descriptionAr: "بناء القيم الأخلاقية القوية ومهارات القيادة",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gold-50 overflow-x-hidden">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 w-full">
        <div className="container mx-auto text-center max-w-[100vw]">
          <div className="max-w-4xl mx-auto w-full">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Excellence in Education
              <span className="block text-[rgb(102,42,20)] mt-2">
                التميز في التعليم
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Nurturing minds, building character, and preparing students for a
              successful future in accordance with Islamic values and modern
              educational practices.
            </p>
            <p
              className="text-base md:text-lg text-gray-500 mb-10 max-w-2xl mx-auto"
              dir="rtl"
            >
              تنمية العقول، وبناء الشخصية، وإعداد الطلاب لمستقبل ناجح وفقاً
              للقيم الإسلامية والممارسات التعليمية الحديثة
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
              <Button
                size="lg"
                style={{ backgroundColor: "rgb(102,42,20)" }}
                className="text-white px-6 sm:px-8 py-4 text-lg w-full sm:w-auto"
                onClick={() => (window.location.href = "/admin/login")}
              >
                <GraduationCap className="mr-2 h-5 w-5" />
                Access ERP Portal | دخول النظام
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-blue-600 text-[rgb(102,42,20)] hover:bg-blue-50 px-6 sm:px-8 py-4 text-lg w-full sm:w-auto"
                 onClick={() => (window.location.href = "/student/newregisterforpublic")}
              >
                <Globe className="mr-2 h-5 w-5" />
                New Admission | اعرف المزيد
              </Button>
            </div>
          </div>
        </div>

        {/* Geometric Pattern Overlay */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10 overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-blue-600 to-gold-500 transform rotate-45 rounded-3xl"></div>
        </div>
      </section>
    </div>
  );
};

export default Index;
