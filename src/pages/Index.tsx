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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gold-50 overflow-x-hidden">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-48 md:pb-32 px-4 w-full">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1]">
              Excellence in <span className="text-[rgb(102,42,20)]">Education</span>
              <span className="block mt-4 text-3xl md:text-5xl opacity-90 font-bold" dir="rtl">
                التميز في التعليم
              </span>
            </h1>
            
            <div className="space-y-4 max-w-3xl mx-auto">
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed font-medium">
                Nurturing minds, building character, and preparing students for a
                successful future in accordance with Islamic values and modern
                educational practices.
              </p>
              <p className="text-base md:text-lg text-gray-500 font-medium" dir="rtl">
                تنمية العقول، وبناء الشخصية، وإعداد الطلاب لمستقبل ناجح وفقاً
                للقيم الإسلامية والممارسات التعليمية الحديثة
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                style={{ backgroundColor: "rgb(102,42,20)" }}
                className="text-white px-10 py-7 text-lg font-bold rounded-xl shadow-xl shadow-[rgb(102,42,20)]/20 hover:scale-105 transition-transform w-full sm:w-auto"
                onClick={() => (window.location.href = "/admin/login")}
              >
                <GraduationCap className="mr-2 h-6 w-6" />
                Access ERP Portal | دخول النظام
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-[rgb(102,42,20)] text-[rgb(102,42,20)] hover:bg-[rgb(102,42,20)]/5 px-10 py-7 text-lg font-bold rounded-xl w-full sm:w-auto transition-all"
                onClick={() => (window.location.href = "/student/newregisterforpublic")}
              >
                <Globe className="mr-2 h-6 w-6" />
                New Admission | تسجيل جديد
              </Button>
            </div>
          </div>
        </div>

        {/* Geometric Pattern Overlay */}
        <div className="absolute top-0 right-0 w-96 h-96 opacity-[0.03] pointer-events-none -z-10 overflow-hidden">
          <div className="w-full h-full bg-[rgb(102,42,20)] transform rotate-45 translate-x-1/2 -translate-y-1/2 rounded-[4rem]"></div>
        </div>
      </section>
    </div>
  );
};

export default Index;
