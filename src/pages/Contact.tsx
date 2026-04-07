
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";
import Navigation from "@/components/layout/Navigation";
import { useState } from "react";
import LoginModal from "@/components/auth/LoginModal";
import { toast } from "sonner";

const Contact = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent successfully! We'll get back to you soon.");
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
  };

  const contactInfo = [
    {
      icon: <Phone className="h-8 w-8 text-[rgb(102,42,20)]" />,
      title: "Phone",
      titleAr: "الهاتف",
      value: "+966 11 XXX XXXX",
      description: "Call us during school hours"
    },
    {
      icon: <Mail className="h-8 w-8 text-[rgb(102,42,20)]" />,
      title: "Email",
      titleAr: "البريد الإلكتروني",
      value: "info@gccschool.edu.sa",
      description: "Send us your inquiries"
    },
    {
      icon: <MapPin className="h-8 w-8 text-[rgb(102,42,20)]" />,
      title: "Address",
      titleAr: "العنوان",
      value: "King Fahd Road, Riyadh",
      description: "Saudi Arabia"
    },
    {
      icon: <Clock className="h-8 w-8 text-[rgb(102,42,20)]" />,
      title: "Office Hours",
      titleAr: "ساعات العمل",
      value: "Sunday - Thursday",
      description: "7:00 AM - 3:00 PM"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gold-50">
      <Navigation  />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Contact Us
            <span className="block text-[rgb(102,42,20)] mt-2" dir="rtl">اتصل بنا</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We're here to help! Get in touch with us for admissions, general inquiries, 
            or any questions about our educational programs.
          </p>
          <p className="text-lg text-gray-500 mt-4 max-w-3xl mx-auto" dir="rtl">
            نحن هنا للمساعدة! تواصل معنا للقبول أو الاستفسارات العامة أو أي أسئلة حول برامجنا التعليمية
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h2>
            <p className="text-xl text-gray-600" dir="rtl">تواصل معنا</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {contactInfo.map((info, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-xl transition-shadow">
                <CardContent className="p-0">
                  <div className="mb-6 flex justify-center bg-blue-50 p-4 rounded-full w-fit mx-auto">
                    {info.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{info.title}</h3>
                  <h4 className="text-lg font-semibold text-[rgb(102,42,20)] mb-4" dir="rtl">{info.titleAr}</h4>
                  <p className="font-semibold text-gray-700 mb-2">{info.value}</p>
                  <p className="text-gray-600 text-sm">{info.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Form */}
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="p-8">
                <CardContent className="p-0">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>
                  <h4 className="text-xl font-bold text-[rgb(102,42,20)] mb-6" dir="rtl">أرسل لنا رسالة</h4>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name | الاسم الكامل</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email | البريد الإلكتروني</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone | رقم الهاتف</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          placeholder="Enter your phone number"
                        />
                      </div>
                      <div>
                        <Label htmlFor="subject">Subject | الموضوع</Label>
                        <Input
                          id="subject"
                          value={formData.subject}
                          onChange={(e) => setFormData({...formData, subject: e.target.value})}
                          placeholder="Message subject"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="message">Message | الرسالة</Label>
                      <Textarea
                        id="message"
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        placeholder="Write your message here..."
                        required
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" style={{backgroundColor:'rgb(102,42,20)'}}> 
                      <Send className="mr-2 h-4 w-4" />
                      Send Message | إرسال الرسالة
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Map placeholder */}
              <Card className="p-8">
                <CardContent className="p-0">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Visit Our Campus</h3>
                  <h4 className="text-xl font-bold text-[rgb(102,42,20)] mb-6" dir="rtl">زر حرمنا الجامعي</h4>
                  
                  <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center mb-6">
                    <MapPin className="h-16 w-16 text-gray-400" />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h5 className="font-semibold text-gray-900">School Address</h5>
                      <p className="text-gray-600 mt-1">King Fahd Road, Al-Olaya District</p>
                      <p className="text-gray-600">Riyadh 12611, Saudi Arabia</p>
                      <p className="text-gray-500 mt-2" dir="rtl">
                        طريق الملك فهد، حي العليا، الرياض ١٢٦١١، المملكة العربية السعودية
                      </p>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h5 className="font-semibold text-gray-900">Directions</h5>
                      <p className="text-gray-600 text-sm mt-1">
                        Located near King Fahd National Library, easily accessible by metro and public transport.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

 
    </div>
  );
};

export default Contact;
