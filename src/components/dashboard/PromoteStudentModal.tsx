import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  UserCheck, 
  ShieldCheck, 
  Loader2,
  AlertCircle,
  User,
  UserPlus,
  History,
  CheckCircle2,
  AlertTriangle,
  GraduationCap
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

interface PromoteStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
  departments: any[];
  sections: any[];
  onPromote: (payload: any) => Promise<void>;
}

const RELATIONSHIP_CONFIG = {
  father: {
    title: "Father Details | بيانات الأب",
    theme: "blue",
    border: "border-blue-100",
    bg: "bg-blue-50/30",
    headerBg: "bg-blue-600",
    textColor: "text-blue-900",
    iconBg: "bg-blue-600",
  },
  mother: {
    title: "Mother Details | بيانات الأم",
    theme: "pink",
    border: "border-pink-100",
    bg: "bg-pink-50/30",
    headerBg: "bg-pink-600",
    textColor: "text-pink-900",
    iconBg: "bg-pink-600",
  },
  relative: {
    title: "Relative Details | بيانات القريب",
    theme: "orange",
    border: "border-orange-100",
    bg: "bg-orange-50/30",
    headerBg: "bg-orange-600",
    textColor: "text-orange-900",
    iconBg: "bg-orange-600",
  },
};

const PromoteStudentModal = ({
  isOpen,
  onClose,
  student,
  departments,
  sections,
  onPromote,
}: PromoteStudentModalProps) => {
  const [loading, setLoading] = useState(false);

  // Academic State
  const [targetDepartment, setTargetDepartment] = useState("");
  const [targetSection, setTargetSection] = useState("");
  const [filteredSections, setFilteredSections] = useState<any[]>([]);

  // Guardians State
  const [guardianState, setGuardianState] = useState<any>({
    father: { mode: "keep", data: {} },
    mother: { mode: "keep", data: {} },
    relative: { mode: "keep", data: {} },
  });

  // Responsible State
  const [responsibleGuardian, setResponsibleGuardian] = useState("");

  useEffect(() => {
    if (student && isOpen) {
      setGuardianState({
        father: { mode: "keep", data: JSON.parse(JSON.stringify(student.father || {})) },
        mother: { mode: "keep", data: JSON.parse(JSON.stringify(student.mother || {})) },
        relative: { mode: "keep", data: JSON.parse(JSON.stringify(student.relative || {})) },
      });
      setResponsibleGuardian(student.relationship || "father");
      setTargetDepartment("");
      setTargetSection("");
    }
  }, [student, isOpen]);

  useEffect(() => {
    if (targetDepartment) {
      setFilteredSections(sections.filter((s) => s.department === targetDepartment));
      setTargetSection("");
    } else {
      setFilteredSections([]);
    }
  }, [targetDepartment, sections]);

  const handleGuardianModeChange = (type: "father" | "mother" | "relative", keep: boolean) => {
    setGuardianState((prev: any) => ({
      ...prev,
      [type]: { ...prev[type], mode: keep ? "keep" : "edit" },
    }));
  };

  const handleGuardianDataChange = (type: "father" | "mother" | "relative", field: string, value: string) => {
    setGuardianState((prev: any) => ({
      ...prev,
      [type]: {
        ...prev[type],
        data: { ...prev[type].data, [field]: value },
      },
    }));
  };

  const handleSubmit = async () => {
    if (!targetDepartment || !targetSection) {
      toast({
        title: "Required Fields",
        description: "Please select target class and section",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        admission_class: targetDepartment,
        section: targetSection,
        responsible_guardian: responsibleGuardian,
        guardians: {
          father: {
            mode: guardianState.father.mode,
            data: guardianState.father.mode === "edit" ? guardianState.father.data : null,
          },
          mother: {
            mode: guardianState.mother.mode,
            data: guardianState.mother.mode === "edit" ? guardianState.mother.data : null,
          },
          relative: {
            mode: guardianState.relative.mode,
            data: guardianState.relative.mode === "edit" ? guardianState.relative.data : null,
          },
        },
      };

      await onPromote(payload);
      onClose();
    } catch (error) {
      console.error("Promotion failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderGuardianCard = (type: "father" | "mother" | "relative") => {
    const config = RELATIONSHIP_CONFIG[type];
    const state = guardianState[type];
    const isKeep = state.mode === "keep";
    const data = state.data;

    return (
      <div key={type} className={`rounded-2xl border-2 ${config.border} overflow-hidden shadow-sm transition-all duration-300 ${!isKeep ? 'ring-2 ring-primary/20' : ''}`}>
        {/* Card Header */}
        <div className={`${config.headerBg} p-4 flex flex-col md:flex-row md:items-center justify-between gap-3`}>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm text-white">
              <User className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-white text-lg">{config.title}</h4>
          </div>

          <div className="flex items-center gap-3 bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/20">
            <Label className="text-white text-xs font-bold whitespace-nowrap">
              {isKeep ? 'Keep Existing | استخدام الحالي' : 'Update Details | تحديث البيانات'}
            </Label>
            <Switch 
              checked={!isKeep} 
              onCheckedChange={(checked) => handleGuardianModeChange(type, !checked)}
              className="data-[state=checked]:bg-white data-[state=unchecked]:bg-white/40"
            />
          </div>
        </div>

        {/* Card Content */}
        <div className={`p-6 ${config.bg}`}>
          {isKeep ? (
            /* Read-only Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Name (English)</p>
                <p className="text-sm font-semibold text-gray-900 border-b border-gray-100 py-1">{data?.name_en || "-"}</p>
              </div>
              <div className="space-y-1 text-right" dir="rtl">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">الاسم (بالعربي)</p>
                <p className="text-sm font-bold text-gray-900 border-b border-gray-100 py-1">{data?.name_ar || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">National ID</p>
                <p className="text-sm font-semibold text-gray-900 border-b border-gray-100 py-1">{data?.national_id || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Phone</p>
                <p className="text-sm font-semibold text-gray-900 border-b border-gray-100 py-1">{data?.phone1 || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Occupation</p>
                <p className="text-sm font-semibold text-gray-900 border-b border-gray-100 py-1">{data?.occupation || "-"}</p>
              </div>
              <div className="space-y-1 text-right" dir="rtl">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">العنوان</p>
                <p className="text-sm font-semibold text-gray-900 border-b border-gray-100 py-1">{data?.address || "-"}</p>
              </div>
            </div>
          ) : (
            /* Editable Form */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-700">Name (English)</Label>
                <Input 
                  value={data?.name_en || ""} 
                  onChange={(e) => handleGuardianDataChange(type, "name_en", e.target.value)}
                  className="h-10 bg-white rounded-xl border-gray-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-1.5 text-right" dir="rtl">
                <Label className="text-xs font-bold text-gray-700">الاسم (بالعربي)</Label>
                <Input 
                  value={data?.name_ar || ""} 
                  onChange={(e) => handleGuardianDataChange(type, "name_ar", e.target.value)}
                  className="h-10 text-right bg-white rounded-xl border-gray-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-700">National ID</Label>
                <Input 
                  value={data?.national_id || ""} 
                  onChange={(e) => handleGuardianDataChange(type, "national_id", e.target.value)}
                  className="h-10 bg-white rounded-xl border-gray-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-700">Phone</Label>
                <Input 
                  value={data?.phone1 || ""} 
                  onChange={(e) => handleGuardianDataChange(type, "phone1", e.target.value)}
                  className="h-10 bg-white rounded-xl border-gray-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-700">Occupation</Label>
                <Input 
                  value={data?.occupation || ""} 
                  onChange={(e) => handleGuardianDataChange(type, "occupation", e.target.value)}
                  className="h-10 bg-white rounded-xl border-gray-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-1.5 text-right" dir="rtl">
                <Label className="text-xs font-bold text-gray-700">العنوان</Label>
                <Input 
                  value={data?.address || ""} 
                  onChange={(e) => handleGuardianDataChange(type, "address", e.target.value)}
                  className="h-10 text-right bg-white rounded-xl border-gray-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl sm:rounded-3xl gap-0 p-0 overflow-hidden outline-none shadow-2xl border-none">
        {/* Hero Header */}
        <DialogHeader className="p-8 bg-blue-600 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-24 -mb-24 blur-2xl" />
          
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md shadow-inner border border-white/30">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl md:text-3xl font-black tracking-tight mb-1">
                  Student Promotion Workflow
                </DialogTitle>
                <div className="flex items-center gap-2 text-blue-100 opacity-90">
                  <Badge className="bg-blue-500/50 hover:bg-blue-500/50 border-blue-400/30 text-white px-2 py-0">2026 Academic Season</Badge>
                  <span className="text-sm font-medium">| Snapshoting record for {student?.name_en}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10 flex flex-col items-end">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-1">Current Placement</span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black">{student?.currentClass}</span>
                <div className="h-4 w-[1px] bg-white/30" />
                <span className="text-xl font-bold text-blue-200">{student?.currentSection}</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 max-h-[70vh] overflow-y-auto bg-gray-50/50 custom-scrollbar">
          <div className="max-w-3xl mx-auto space-y-10">
            
            {/* 1. Academic Selection Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
                <div className="bg-blue-100 p-1.5 rounded-lg text-blue-600">
                  <History className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">1. Academic Target | الهدف الأكاديمي</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-sm">
                <div className="space-y-2">
                  <Label className="text-sm font-black text-gray-600 ml-1">Target Class | الصف التالي</Label>
                  <Select value={targetDepartment} onValueChange={setTargetDepartment}>
                    <SelectTrigger className="h-12 bg-gray-50/50 border-gray-200 rounded-2xl font-bold text-gray-800 px-6">
                      <SelectValue placeholder="Select Target Class" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-gray-200 shadow-xl">
                      {departments.map((d) => (
                        <SelectItem key={d.id} value={d.id} className="rounded-xl font-medium">{d.department_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-black text-gray-600 ml-1">Target Section | القسم التالي</Label>
                  <Select value={targetSection} onValueChange={setTargetSection} disabled={!targetDepartment}>
                    <SelectTrigger className="h-12 bg-gray-50/50 border-gray-200 rounded-2xl font-bold text-gray-800 px-6">
                      <SelectValue placeholder="Select Target Section" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-gray-200 shadow-xl">
                      {filteredSections.map((s) => (
                        <SelectItem key={s.id} value={s.id} className="rounded-xl font-medium">{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* 2. Responsibility Selection Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
                <div className="bg-green-100 p-1.5 rounded-lg text-green-600">
                  <UserCheck className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">2. Directly Responsible | المسؤول المباشر</h3>
              </div>

              <div className="text-center space-y-4 bg-white p-8 rounded-3xl border-2 border-gray-100 shadow-sm">
                <p className="text-sm font-bold text-gray-500 max-w-md mx-auto leading-relaxed">
                  Who will be the primary point of contact for this academic year?
                  <br />
                  <span dir="rtl" className="text-primary font-arabic">من سيكون المسؤول المباشر عن الطالب؟</span>
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                  {[
                    { id: "father", label: "Father | الأب", icon: User },
                    { id: "mother", label: "Mother | الأم", icon: User },
                    { id: "relative", label: "Relative | قريب", icon: User },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setResponsibleGuardian(option.id)}
                      className={`group relative flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all duration-500 overflow-hidden ${
                        responsibleGuardian === option.id 
                          ? 'bg-primary border-primary scale-105 shadow-xl shadow-primary/20' 
                          : 'bg-gray-50/50 border-gray-100 hover:border-primary/30 hover:bg-white'
                      }`}
                    >
                      {responsibleGuardian === option.id && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 className="h-5 w-5 text-white" />
                        </div>
                      )}
                      <div className={`p-4 rounded-2xl mb-3 transition-all duration-500 ${
                        responsibleGuardian === option.id ? 'bg-white/20 text-white' : 'bg-white text-gray-400 group-hover:text-primary shadow-sm'
                      }`}>
                        <option.icon className="h-6 w-6" />
                      </div>
                      <span className={`text-xs font-black tracking-tight ${
                        responsibleGuardian === option.id ? 'text-white' : 'text-gray-600'
                      }`}>
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* 3. Guardian Details Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
                <div className="bg-amber-100 p-1.5 rounded-lg text-amber-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">3. Guardian History Verification</h3>
              </div>

              <div className="bg-amber-50/50 border-2 border-dashed border-amber-200 p-5 rounded-2xl flex items-start gap-4 mb-8">
                <div className="bg-amber-100 p-2 rounded-xl text-amber-600 shrink-0">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-amber-900 mb-1">Important Record Note | ملاحظة هامة</h4>
                  <p className="text-xs text-amber-800 font-medium leading-relaxed">
                    By default, the system keeps previous records. To update information for the new year, toggle 
                    "Update Details". This will create a fresh historical record for 2026.
                  </p>
                </div>
              </div>

              <div className="space-y-8">
                {renderGuardianCard("relative")}
                {renderGuardianCard("father")}
                {renderGuardianCard("mother")}
              </div>
            </section>

          </div>
        </div>

        <DialogFooter className="p-8 bg-white border-t border-gray-100 flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            className="rounded-2xl h-12 px-8 text-gray-400 font-black hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel Workflow
          </Button>
          
          <div className="flex gap-4">
            <Button 
              onClick={handleSubmit} 
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white rounded-2xl h-14 px-12 font-black shadow-xl shadow-green-200 hover:scale-[1.02] transition-all active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Finalizing Promotion...
                </>
              ) : (
                <>
                  Confirm Academic Promotion
                  <UserPlus className="ml-3 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PromoteStudentModal;
