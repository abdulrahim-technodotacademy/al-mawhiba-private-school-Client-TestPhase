import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
    History,
    CheckCircle2,
    GraduationCap,
    ArrowLeft,
    Phone,
    MapPin,
    HeartPulse,
    Navigation,
    Globe,
    Camera,
    EyeIcon,
    Briefcase,
    FileIcon,
    Mail,
    Home,
    Building,
    CreditCard
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import Swal from "sweetalert2";

const RELATIONSHIP_CONFIG = {
    father: {
        title: "FATHER DETAILS | بيانات الأب",
        idPrefix: "Father",
        border: "border-primary/20",
        bg: "bg-primary/5",
        iconBg: "bg-primary",
        textColor: "text-primary",
    },
    mother: {
        title: "MOTHER DETAILS | بيانات الأم",
        idPrefix: "Mother",
        border: "border-pink-200",
        bg: "bg-pink-50/30",
        iconBg: "bg-pink-600",
        textColor: "text-pink-900",
    },
    relative: {
        title: "RELATIVE DETAILS | بيانات القريب",
        idPrefix: "Relative",
        border: "border-orange-200",
        bg: "bg-orange-50/30",
        iconBg: "bg-orange-600",
        textColor: "text-orange-900",
    },
};

const calculateAge = (dateOfBirth: string): number => {
    if (!dateOfBirth) return 0;
    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime())) return 0;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    return age;
};

const DetailField = ({ id, label, value, dir = "ltr", prefix = "", required = false, error = false }: any) => (
    <div className="space-y-1.5 flex flex-col" id={id}>
        <Label className={`text-[11px] font-bold uppercase tracking-tight ml-1 ${error ? "text-red-500" : "text-[#6b7280]"}`}>
            {prefix && <span>{prefix} </span>}{label}{required && " *"}
        </Label>
        <div className={`h-11 bg-white border rounded-lg flex items-center px-4 italic text-sm transition-all ${error ? "border-red-500 bg-red-50/10 shadow-sm" : "border-gray-100 text-gray-500"
            } ${dir === "rtl" ? "justify-end text-right" : ""}`}>
            {value || "-"}
        </div>
    </div>
);

const FormInput = ({ id, label, value, onChange, dir = "ltr", prefix = "", placeholder = "", required = false, error = false }: any) => (
    <div className="space-y-1.5 flex flex-col" id={id}>
        <Label className={`text-[11px] font-bold uppercase tracking-tight ml-1 ${error ? "text-red-500" : "text-gray-600"}`}>
            {prefix && <span>{prefix} </span>}{label}{required && " *"}
        </Label>
        <Input
            value={value || ""}
            onChange={onChange}
            dir={dir}
            placeholder={placeholder}
            className={`h-11 rounded-lg transition-all ${error
                    ? "border-red-500 focus:ring-red-500/10 focus:border-red-500 bg-red-50/5"
                    : "border-gray-200 focus:ring-primary/20 focus:border-primary"
                } ${dir === "rtl" ? "text-right font-arabic" : ""}`}
        />
    </div>
);

const StudentPromotionPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [student, setStudent] = useState<any>(null);
    const [departments, setDepartments] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [filteredSections, setFilteredSections] = useState<any[]>([]);

    // Academic State
    const [targetDepartment, setTargetDepartment] = useState("");
    const [targetSection, setTargetSection] = useState("");

    // Guardians State
    const [guardianState, setGuardianState] = useState<any>({
        father: { mode: "keep", data: {} },
        mother: { mode: "keep", data: {} },
        relative: { mode: "keep", data: {} },
    });

    const [guardianFiles, setGuardianFiles] = useState<Record<string, File | null>>({
        father: null,
        mother: null,
        relative: null,
    });

    // Responsible State
    const [responsibleGuardian, setResponsibleGuardian] = useState("");

    // Validation State
    const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("accessToken");
                const headers = { Authorization: `Bearer ${token}` };

                // Fetch Student Details
                const studentRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/students/student-details-officer/${id}/`, { headers });
                const studentData = await studentRes.json();

                // Fetch Departments
                const deptRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/students/department/`, { headers });
                const deptData = await deptRes.json();

                // Fetch Sections
                const sectRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/students/section/`, { headers });
                const sectData = await sectRes.json();

                if (studentData.statuscode === 200 || studentData.status) {
                    const s = studentData.data;
                    setStudent(s);

                    // Pre-fill current academic values
                    if (s.admission_class?.id) setTargetDepartment(s.admission_class.id);
                    if (s.section?.id) setTargetSection(s.section.id);

                    const rel = s.guardian?.relationship || s.relationship || "father";
                    setResponsibleGuardian(rel);

                    setGuardianState({
                        father: { mode: "keep", data: s.father || (s.guardian?.relationship === 'father' ? s.guardian : {}) },
                        mother: { mode: "keep", data: s.mother || (s.guardian?.relationship === 'mother' ? s.guardian : {}) },
                        relative: { mode: "keep", data: s.relative || (['relative', 'other'].includes(s.guardian?.relationship) ? s.guardian : {}) },
                    });
                }

                setDepartments(deptData.data || []);
                setSections(sectData.data || []);
            } catch (error) {
                console.error("Error fetching promotion data:", error);
                toast({ title: "Error", description: "Workflow load failure", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchInitialData();
    }, [id]);

    useEffect(() => {
        if (targetDepartment) {
            const filtered = sections.filter((s) => s.department === targetDepartment);
            setFilteredSections(filtered);

            // Only reset section if the current targetSection is NOT in the new filtered list
            if (targetSection && !filtered.find(s => s.id === targetSection)) {
                setTargetSection("");
            }
        } else {
            setFilteredSections([]);
        }
    }, [targetDepartment, sections, targetSection]);

    // Force Add mode for Relative if it doesn't exist but is selected
    useEffect(() => {
        if (responsibleGuardian === 'relative' && !student?.relative && !student?.guardian?.relationship?.includes('relative')) {
            if (guardianState.relative.mode !== 'add') {
                handleGuardianModeChange('relative', 'add');
                toast({
                    title: "Relative Record Required",
                    description: "Please provide details for the new relative.",
                });
            }
        }
    }, [responsibleGuardian, student]);

    const handleGuardianModeChange = (type: "father" | "mother" | "relative", mode: "keep" | "add") => {
        setGuardianState((prev: any) => ({
            ...prev,
            [type]: {
                ...prev[type],
                mode: mode,
                data: mode === 'add' ? {} : (student?.[type] || (student?.guardian?.relationship === type ? student.guardian : {}))
            },
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

    const handleFileChange = (type: "father" | "mother" | "relative", file: File | null) => {
        setGuardianFiles((prev) => ({
            ...prev,
            [type]: file,
        }));
    };

    const handleResponsibleChange = async (type: string) => {
        if (type === responsibleGuardian) return;

        const result = await Swal.fire({
            title: 'Change Responsibility?',
            text: `Are you sure you want to change the primary responsible person to ${type.toUpperCase()}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, change it',
            confirmButtonColor: '#662a14',
            cancelButtonColor: '#9ca3af',
        });

        if (result.isConfirmed) {
            setResponsibleGuardian(type);
        }
    }

    const validateForm = () => {
        const errors: Record<string, boolean> = {};

        // 0. Base Validation
        if (!student && !id) {
            return false;
        }

        // 1. Academic Validation
        if (!targetDepartment) errors['academic-class'] = true;
        if (!targetSection) errors['academic-section'] = true;

        if (targetDepartment === student?.admission_class?.id && targetSection === student?.section?.id) {
            errors['academic-class'] = true;
            errors['academic-section'] = true;
            toast({
                variant: "destructive",
                title: "Invalid Promotion",
                description: "Student is currently in the same class and section. Please select a different class or section for promotion.",
            });
        }

        // 2. Guardian Validation (only for 'add' mode)
        const requiredFields = ['national_id', 'name_en', 'phone1', 'occupation', 'passport_number', 'address'];

        ['father', 'mother', 'relative'].forEach((type) => {
            const state = guardianState[type];
            // Only validate if card is visible (relative only if selected)
            if (type === 'relative' && responsibleGuardian !== 'relative') return;

            if (state.mode === 'add') {
                requiredFields.forEach(field => {
                    if (!state.data[field]) {
                        errors[`${type}-${field}`] = true;
                    }
                });
            } else if (type === 'relative' && responsibleGuardian === 'relative' && (!state.data || Object.keys(state.data).length === 0)) {
                // If Responsible is Relative but mode is 'keep' and there's no data
                errors[`relative-national_id`] = true;
                toast({
                    variant: "destructive",
                    title: "Missing Relative Data",
                    description: "Please switch to 'Add / Edit New' to provide relative details.",
                });
            }
        });

        setFormErrors(errors);

        const errorIds = Object.keys(errors);
        if (errorIds.length > 0) {
            // Scroll to first error
            const firstErrorId = errorIds[0];
            const element = document.getElementById(firstErrorId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        // Clear previous errors
        setFormErrors({});

        if (!validateForm()) {
            return;
        }

        const result = await Swal.fire({
            text: `Confirming academic promotion for ${[student?.en_first_name, student?.en_middle_name, student?.en_grandfather_name, student?.en_last_name].filter(Boolean).join(' ')} for the upcoming academic year?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#16a34a',
            confirmButtonText: 'Yes, Promote Now'
        });

        if (!result.isConfirmed) return;

        setProcessing(true);
        try {
            const token = localStorage.getItem("accessToken");

            const payload = {
                admission_class: targetDepartment,
                section: targetSection,
                relationship: responsibleGuardian,
                guardians: {
                    father: {
                        mode: guardianState.father.mode === 'keep' ? 'keep' : 'edit',
                        data: guardianState.father.mode !== 'keep' ? guardianState.father.data : null,
                    },
                    mother: {
                        mode: guardianState.mother.mode === 'keep' ? 'keep' : 'edit',
                        data: guardianState.mother.mode !== 'keep' ? guardianState.mother.data : null,
                    },
                    relative: {
                        mode: guardianState.relative.mode === 'keep' ? 'keep' : 'edit',
                        data: guardianState.relative.mode !== 'keep' ? guardianState.relative.data : null,
                    },
                },
            };

            const formData = new FormData();
            formData.append('admission_class', targetDepartment);
            formData.append('section', targetSection);
            formData.append('relationship', responsibleGuardian);
            formData.append('guardians', JSON.stringify(payload.guardians));

            // Append files
            if (guardianFiles.father) formData.append('father_id_document', guardianFiles.father);
            if (guardianFiles.mother) formData.append('mother_id_document', guardianFiles.mother);
            if (guardianFiles.relative) formData.append('relative_id_document', guardianFiles.relative);

            const baseUrl = (import.meta.env.VITE_API_BASE_URL || "").trim().replace(/\/+$/, '');
            const promoteEndpoint = `${baseUrl}/students/promote-student/${id}/`;

            const response = await fetch(promoteEndpoint, {
                method: "POST",
                headers: {
                    // "Content-Type": "application/json", // Let browser set boundary for FormData
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.errors || errorData.message || "Promotion failed");
            }

            await Swal.fire({
                title: 'Success!',
                text: 'Student has been promoted successfully',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
            navigate("/dashboard/registration?tab=promotion");
        } catch (error: any) {
            console.error("Promotion failed:", error);
            Swal.fire({
                title: 'Submission Failed',
                text: error.message || "Could not reach the server. Please try again.",
                icon: 'error'
            });
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white gap-6">
                <div className="relative">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                </div>
                <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-xs">Processing Workflow...</p>
            </div>
        );
    }


    const renderGuardianSnapshotGrid = (type: "father" | "mother" | "relative") => {
        const config = RELATIONSHIP_CONFIG[type];
        const state = guardianState[type];
        const isKeep = state.mode === "keep";
        const data = state.data;
        const isResponsible = responsibleGuardian === type;

        return (
            <Card key={type} className={`border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden mb-10`}>
                <CardHeader className="py-6 px-10 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className={`${config.iconBg} p-2.5 rounded-xl text-white shadow-lg`}>
                            <User className="h-6 w-6" />
                        </div>
                        <div className="flex items-center gap-3">
                            <CardTitle className="text-lg font-black tracking-tight text-gray-900 group-hover:text-primary transition-colors">
                                {config.title}
                            </CardTitle>
                            {isResponsible && (
                                <Badge className="bg-green-500 hover:bg-green-600 text-[10px] py-1 px-3 rounded-full font-black flex items-center gap-1 leading-none">
                                    <CheckCircle2 className="h-3 w-3" />
                                    DIRECTLY RESPONSIBLE
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 p-1 bg-gray-50 rounded-xl">
                        <button
                            onClick={() => handleGuardianModeChange(type, 'keep')}
                            className={`px-6 py-2.5 rounded-lg text-xs font-black tracking-widest uppercase transition-all ${isKeep ? 'bg-white shadow-sm text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Keep Current
                        </button>
                        <button
                            onClick={() => handleGuardianModeChange(type, 'add')}
                            className={`px-6 py-2.5 rounded-lg text-xs font-black tracking-widest uppercase transition-all ${!isKeep ? 'bg-white shadow-sm text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Add / Edit New
                        </button>
                    </div>
                </CardHeader>

                <CardContent className="p-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
                        {isKeep ? (
                            <>
                                <DetailField id={`${type}-national_id`} prefix={config.idPrefix} label="ID Number | الرقم المدني" value={data?.national_id || data?.other_datas?.national_id} required />
                                <DetailField id={`${type}-name_en`} prefix={config.idPrefix} label="Name (English) | اسم" value={data?.name_en} required />
                                <DetailField id={`${type}-name_ar`} prefix={config.idPrefix} label="Name (Arabic) | الاسم" value={data?.name_ar} dir="rtl" />

                                <DetailField id={`${type}-phone1`} prefix={config.idPrefix} label="Phone | الهاتف" value={data?.phone1} required />
                                <DetailField id={`${type}-phone2`} prefix={config.idPrefix} label="Mobile | الجوال" value={data?.phone2} />
                                <DetailField id={`${type}-email`} prefix={config.idPrefix} label="Email | البريد" value={data?.email} />

                                <DetailField id={`${type}-work_phone`} prefix={config.idPrefix} label="Work Phone | هاتف العمل" value={data?.work_phone} />
                                <DetailField id={`${type}-workplace`} prefix={config.idPrefix} label="Workplace | جهة العمل" value={data?.workplace} />
                                <DetailField id={`${type}-occupation`} prefix={config.idPrefix} label="Occupation | الوظيفة" value={data?.occupation} required />

                                <DetailField id={`${type}-passport_number`} prefix={config.idPrefix} label="Passport Number | رقم الجواز" value={data?.passport_number || data?.other_datas?.passport_number} required />
                                <div className="space-y-1.5 flex flex-col">
                                    <Label className="text-[#6b7280] text-[11px] font-bold uppercase tracking-tight">ID Document | وثيقة *</Label>
                                    <div className="h-11 bg-white border border-gray-100 rounded-lg flex items-center px-4 italic text-blue-500 text-sm">
                                        {data?.id_document ? <a href={data.id_document} target="_blank" rel="noreferrer" className="flex items-center gap-2"><EyeIcon className="h-4 w-4" /> View Document</a> : "No File Attached"}
                                    </div>
                                </div>
                                <div className="md:col-span-2 lg:col-span-1">
                                    <DetailField id={`${type}-address`} prefix={config.idPrefix} label="Address | العنوان" value={data?.address || data?.other_datas?.address} required />
                                </div>
                            </>
                        ) : (
                            <>
                                <FormInput id={`${type}-national_id`} error={formErrors[`${type}-national_id`]} prefix={config.idPrefix} label="ID Number | الرقم المدني" value={data?.national_id} onChange={(e: any) => handleGuardianDataChange(type, "national_id", e.target.value)} required />
                                <FormInput id={`${type}-name_en`} error={formErrors[`${type}-name_en`]} prefix={config.idPrefix} label="Name (English) | اسم" value={data?.name_en} onChange={(e: any) => handleGuardianDataChange(type, "name_en", e.target.value)} required />
                                <FormInput id={`${type}-name_ar`} error={formErrors[`${type}-name_ar`]} prefix={config.idPrefix} label="Name (Arabic) | الاسم" value={data?.name_ar} onChange={(e: any) => handleGuardianDataChange(type, "name_ar", e.target.value)} dir="rtl" />

                                <FormInput id={`${type}-phone1`} error={formErrors[`${type}-phone1`]} prefix={config.idPrefix} label="Phone | الهاتف" value={data?.phone1} onChange={(e: any) => handleGuardianDataChange(type, "phone1", e.target.value)} required />
                                <FormInput id={`${type}-phone2`} error={formErrors[`${type}-phone2`]} prefix={config.idPrefix} label="Mobile | الجوال" value={data?.phone2} onChange={(e: any) => handleGuardianDataChange(type, "phone2", e.target.value)} />
                                <FormInput id={`${type}-email`} error={formErrors[`${type}-email`]} prefix={config.idPrefix} label="Email | البريد" value={data?.email} onChange={(e: any) => handleGuardianDataChange(type, "email", e.target.value)} />

                                <FormInput id={`${type}-work_phone`} error={formErrors[`${type}-work_phone`]} prefix={config.idPrefix} label="Work Phone | هاتف العمل" value={data?.work_phone} onChange={(e: any) => handleGuardianDataChange(type, "work_phone", e.target.value)} />
                                <FormInput id={`${type}-workplace`} error={formErrors[`${type}-workplace`]} prefix={config.idPrefix} label="Workplace | جهة العمل" value={data?.workplace} onChange={(e: any) => handleGuardianDataChange(type, "workplace", e.target.value)} />
                                <FormInput id={`${type}-occupation`} error={formErrors[`${type}-occupation`]} prefix={config.idPrefix} label="Occupation | الوظيفة" value={data?.occupation} onChange={(e: any) => handleGuardianDataChange(type, "occupation", e.target.value)} required />

                                <FormInput id={`${type}-passport_number`} error={formErrors[`${type}-passport_number`]} prefix={config.idPrefix} label="Passport Number | رقم الجواز" value={data?.passport_number} onChange={(e: any) => handleGuardianDataChange(type, "passport_number", e.target.value)} required />
                                <div className="space-y-1.5 flex flex-col">
                                    <Label className="text-gray-600 text-[11px] font-bold uppercase tracking-tight ml-1">ID Document | وثيقة *</Label>
                                    <div className="flex items-center gap-3">
                                        <Input 
                                            type="file" 
                                            onChange={(e: any) => handleFileChange(type, e.target.files?.[0] || null)}
                                            className="h-11 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100" 
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2 lg:col-span-1">
                                    <FormInput id={`${type}-address`} error={formErrors[`${type}-address`]} prefix={config.idPrefix} label="Address | العنوان" value={data?.address} onChange={(e: any) => handleGuardianDataChange(type, "address", e.target.value)} required />
                                </div>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="min-h-screen bg-[#fafafa] pb-32">
            {/* Global Actions */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-6 px-10 z-[100] flex justify-center shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <div className="max-w-7xl w-full flex items-center justify-between">
                    <div className="flex items-center gap-4 text-gray-400">
                        <AlertCircle className="h-5 w-5" />
                        <p className="text-[11px] font-black tracking-widest uppercase mb-0">Confirm All snapshots before synchronizing</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => navigate(-1)} className="font-extrabold text-gray-500 uppercase tracking-widest text-[10px]">Discard Update</Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={processing}
                            className="bg-black hover:bg-gray-800 text-white font-black rounded-2xl px-12 h-14 shadow-2xl flex items-center gap-3 transition-all active:scale-95"
                        >
                            {processing ? <Loader2 className="h-6 w-6 animate-spin" /> : <ShieldCheck className="h-6 w-6" />}
                            <span className="uppercase tracking-[0.2em] text-[11px]">Synchronize Promotion</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Nav Header */}
            <header className="bg-white border-b border-gray-50 px-8 py-6 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-2xl h-12 w-12 hover:bg-gray-50">
                            <ArrowLeft className="h-6 w-6 text-gray-400" />
                        </Button>
                        <div className="flex flex-col">
                            <h2 className="text-2xl font-black text-gray-900 tracking-tighter italic leading-none mb-1">Student Promotion Management</h2>
                            <p className="text-[10px] text-gray-400 font-bold tracking-[0.4em] uppercase">Transition Suite: Upcoming Academic Year</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-primary/5 px-5 py-3 rounded-2xl border border-primary/10">
                        <img src="/assets/logobr.png" className="h-8 opacity-90" alt="logo" />
                        <span className="font-black text-primary text-xs tracking-widest uppercase">AL-MAWHIBA</span>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-8 py-12 space-y-12">

                {/* HERO: Student Verification */}
                <Card className="border-none shadow-[0_8px_40px_rgba(0,0,0,0.04)] rounded-[2.5rem] bg-white overflow-hidden">
                    <CardContent className="p-0">
                        <div className="grid grid-cols-1 lg:grid-cols-4">
                            <div className="bg-gray-900 flex flex-col items-center justify-center p-12 text-center text-white relative">
                                <div className="absolute top-8 left-8">
                                    <Badge className="bg-primary hover:bg-primary text-[10px] font-black rounded-lg py-1 px-4">PROMOTION DRAFT</Badge>
                                </div>
                                <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden border-4 border-white/10 shadow-2xl mb-8 relative">
                                    {student?.photo ? (
                                        <img src={student.photo} className="w-full h-full object-cover" alt="Student" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                            <User className="h-20 w-20 text-gray-700" />
                                        </div>
                                    )}
                                    <div className="absolute bottom-3 right-3 bg-primary p-2 rounded-xl shadow-lg">
                                        <Camera className="h-3 w-3" />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black italic tracking-tighter mb-2">{[student?.en_first_name, student?.en_middle_name, student?.en_grandfather_name, student?.en_last_name].filter(Boolean).join(' ')}</h3>
                                <p className="text-primary text-[11px] font-black uppercase tracking-[0.3em] mb-6" dir="rtl">{[student?.ar_first_name, student?.ar_middle_name, student?.ar_grandfather_name, student?.ar_last_name].filter(Boolean).join(' ')}</p>
                                <div className="flex flex-col gap-2 w-full pt-6 border-t border-white/5">
                                    <Label className="text-gray-500 text-[10px] uppercase font-black tracking-widest">Admission No</Label>
                                    <p className="font-black text-xl tracking-tighter">{student?.admission_number}</p>
                                </div>
                            </div>

                            <div className="lg:col-span-3 p-12 space-y-12">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="h-10 w-1 px-0 bg-primary rounded-full" />
                                    <h4 className="text-xl font-black text-gray-900 tracking-tight">Identity Snapshot</h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-y-10 gap-x-12">
                                    <DetailField label="Omani National ID" value={student?.national_id || "NOT_STORED"} />
                                    <DetailField label="Date of Birth" value={student?.date_of_birth ? `${student.date_of_birth} (${calculateAge(student.date_of_birth)}Y)` : "-"} />
                                    <DetailField label="Gender | الجنس" value={student?.gender === "M" || student?.gender === "Male" ? "Male | ذكر" : "Female | أنثى"} />

                                    <DetailField label="Nationality | الجنسية" value={student?.nationality} />
                                    <DetailField label="Religion | الديانة" value={student?.religion} />
                                    <DetailField label="Contact Number" value={student?.phone} />

                                    <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-y-10 gap-x-12 pt-6 border-t border-gray-50 mt-2">
                                        <DetailField label="Current Class | الصف الحالي" value={student?.admission_class?.department_name} />
                                        <DetailField label="Current Section | القسم الحالي" value={student?.section?.name} />
                                        <div className="hidden md:block" /> {/* Spacer */}
                                    </div>

                                    <div className="md:col-span-3 border-t border-gray-50 pt-8 mt-2" />

                                    <DetailField label="Governorate" value={student?.governance || student?.state} />
                                    <DetailField label="City | المدينة" value={student?.city || student?.other_datas?.city} />
                                    <div className="md:col-span-1">
                                        <DetailField label="Full Address | الشارع" value={student?.address || student?.other_datas?.address} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* STEP 1: Academic Assignment */}
                <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] bg-white overflow-hidden">
                    <CardHeader className="bg-primary/5 py-8 px-10 flex flex-row items-center gap-4">
                        <div className="bg-primary p-3 rounded-2xl shadow-lg text-white">
                            <GraduationCap className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle className="text-primary text-xl font-black uppercase tracking-tighter italic">Step 01: Academic Forecast</CardTitle>
                            <p className="text-[10px] text-primary/50 font-bold uppercase tracking-widest">Define the target class environment</p>
                        </div>
                    </CardHeader>
                    <CardContent className="p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-3" id="academic-class">
                            <Label className={`text-[11px] font-black uppercase tracking-widest mb-1 block ml-1 ${formErrors['academic-class'] ? "text-red-500" : "text-gray-400"}`}>Destination Class Group *</Label>
                            <Select value={targetDepartment} onValueChange={setTargetDepartment}>
                                <SelectTrigger className={`h-16 border-gray-100 rounded-2xl font-black transition-all ${formErrors['academic-class'] ? "border-red-500 bg-red-50/5" : "bg-gray-50 focus:ring-8 focus:ring-primary/5"}`}>
                                    <SelectValue placeholder="Select Destination Class" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-none shadow-2xl">
                                    {departments.map((d) => (
                                        <SelectItem key={d.id} value={d.id} className="font-bold py-4">{d.department_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-3" id="academic-section">
                            <Label className={`text-[11px] font-black uppercase tracking-widest mb-1 block ml-1 ${formErrors['academic-section'] ? "text-red-500" : "text-gray-400"}`}>Specific Section Allocation *</Label>
                            <Select value={targetSection} onValueChange={setTargetSection} disabled={!targetDepartment}>
                                <SelectTrigger className={`h-16 border-gray-100 rounded-2xl font-black transition-all ${formErrors['academic-section'] ? "border-red-500 bg-red-50/5" : "bg-gray-50 focus:ring-8 focus:ring-primary/5"}`}>
                                    <SelectValue placeholder="Assign Section" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-none shadow-2xl">
                                    {filteredSections?.map((s) => (
                                        <SelectItem key={s.id} value={s.id} className="font-bold py-4">{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* STEP 2: Legal Responsibility */}
                <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] bg-white overflow-hidden">
                    <CardContent className="p-12 flex flex-col items-center text-center gap-10">
                        <div className="space-y-2">
                            <h3 className="text-3xl font-black text-gray-900 tracking-tighter italic" dir="rtl">المسؤول المباشر عن الطالب</h3>
                            <p className="text-[11px] font-black text-primary uppercase tracking-[0.4em]">Step 02: Primary Point of Legal Responsibility</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                            {[
                                { id: "father", label: "Father | الأب", color: "primary" },
                                { id: "mother", label: "Mother | الأم", color: "pink-600" },
                                { id: "relative", label: "Relative | قريب", color: "orange-600" },
                            ].map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => handleResponsibleChange(opt.id)}
                                    className={`group flex items-center justify-between p-8 rounded-[2rem] border-2 transition-all duration-500 ${responsibleGuardian === opt.id
                                            ? 'bg-primary border-primary text-white shadow-2xl shadow-primary/30 -translate-y-2'
                                            : 'bg-gray-50 border-gray-50 hover:border-gray-200 text-gray-700'
                                        }`}
                                >
                                    <div className="flex flex-col items-start gap-1">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${responsibleGuardian === opt.id ? 'text-white/60' : 'text-gray-400'}`}>Official Link</span>
                                        <span className="font-black text-sm tracking-tight">{opt.label}</span>
                                    </div>
                                    <div className={`p-3 rounded-2xl transition-all ${responsibleGuardian === opt.id ? 'bg-white/20' : 'bg-white shadow-sm'}`}>
                                        <User className={`h-6 w-6 ${responsibleGuardian === opt.id ? 'text-white' : 'text-primary'}`} />
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="bg-amber-50 rounded-3xl p-8 border border-amber-100 flex items-start gap-4 text-left max-w-3xl shadow-sm">
                            <div className="bg-amber-600 p-2 rounded-xl text-white mt-1">
                                <AlertCircle className="h-5 w-5" />
                            </div>
                            <p className="text-[11px] text-amber-900 font-bold leading-relaxed uppercase tracking-widest">
                                Critical: The directly responsible person manages all financial and administrative interactions for the upcoming academic year. Changing this requires verified authorization.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* GUARDIAN SNAPSHOTS */}
                <div className="space-y-8">
                    <div className="flex items-center gap-4 mb-4 px-4">
                        <Users className="h-8 w-8 text-gray-300" />
                        <h3 className="text-3xl font-black text-gray-900 tracking-tighter italic uppercase">Guardian Repository Snapshots</h3>
                    </div>

                    {renderGuardianSnapshotGrid("father")}
                    {renderGuardianSnapshotGrid("mother")}
                    {responsibleGuardian === 'relative' && renderGuardianSnapshotGrid("relative")}
                </div>

            </main>
        </div>
    );
};

export default StudentPromotionPage;
