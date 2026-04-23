import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Trash2,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Signature as SignatureIcon,
  X
} from "lucide-react";
import SignaturePad from "react-signature-canvas";
import Swal from "sweetalert2";
import { api } from "@/utils/axiosInterceptor";

interface SignatureManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SignatureManagementModal = ({ isOpen, onClose }: SignatureManagementModalProps) => {
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [signaturePad, setSignaturePad] = useState<any>(null);
  const [view, setView] = useState<"loading" | "view" | "create">("loading");

  const fetchSignature = useCallback(async () => {
    setIsLoading(true);
    setView("loading");
    try {
      const response = await api.get("/accounts/signature/");
      if (response.data) {
        setSignatureUrl(response.data.signature_image);
        setView(response.data.has_signature ? "view" : "create");
      }
    } catch (error) {
      console.error("Error fetching signature:", error);
      setView("create");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchSignature();
    }
  }, [isOpen, fetchSignature]);

  const handleSave = async () => {
    if (!signaturePad || signaturePad.isEmpty()) {
      Swal.fire({ title: "Empty Pad", text: "Please draw your signature first", icon: "warning" });
      return;
    }

    setIsSaving(true);
    
    try {
      const canvas = signaturePad.getCanvas();
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png", 0.8));
      
      if (!blob) {
        throw new Error("Could not capture signature image");
      }

      const formData = new FormData();
      formData.append("signature_image", blob, `signature_${Date.now()}.png`);

      const response = await api.post("/accounts/signature/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        }
      });

      if (response.data) {
        setSignatureUrl(response.data.signature_image);
        setView("view");
        Swal.fire({ title: "Success!", text: "Signature saved successfully.", icon: "success", timer: 2000, showConfirmButton: false });
      }
    } catch (error: any) {
      console.error("Error saving signature:", error);
      Swal.fire({ 
        title: "Save Failed", 
        text: error.response?.data?.error || "We couldn't save your signature. Please try again.", 
        icon: "error" 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Remove Signature?",
      text: "This will clear your signature from all future receipts.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, Clear It",
    });

    if (result.isConfirmed) {
      setIsLoading(true);
      try {
        await api.delete("/accounts/signature/");
        setSignatureUrl(null);
        setView("create");
        Swal.fire({ title: "Cleared", text: "Signature removed.", icon: "success", timer: 1500 });
      } catch (error) {
        Swal.fire("Error", "Failed to delete signature", "error");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white shadow-2xl border-0 ring-1 ring-slate-200">
        <DialogHeader className="p-6 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <SignatureIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white tracking-tight italic">Official Signature</DialogTitle>
                <DialogDescription className="text-slate-400 capitalize text-xs tracking-wide">
                   Reliable Image-Sync Enabled
                </DialogDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
               <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-8 min-h-[350px] flex flex-col justify-center bg-slate-50/50">
          {view === "loading" ? (
            <div className="flex flex-col items-center gap-3 animate-pulse">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin pb-1" />
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Syncing Profile...</p>
            </div>
          ) : view === "view" ? (
            <div className="w-full animate-in fade-in transition-all">
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Verified Profile Signature</Label>
                <div className="h-44 w-full border border-slate-200 rounded-2xl bg-white flex items-center justify-center p-8 shadow-sm group overflow-hidden transition-all">
                  <img 
                    src={signatureUrl || ""} 
                    alt="Stored signature" 
                    className="max-h-full transition-transform group-hover:scale-110 duration-700" 
                  />
                </div>
              </div>
              <div className="pt-8">
                <Button 
                  variant="outline" 
                  className="w-full font-bold border-red-50 text-red-500 hover:bg-red-50 py-7 rounded-xl shadow-sm transition-all"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-4 h-4 mr-3" />
                  Discard Current Signature
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full space-y-6 animate-in slide-in-from-bottom-5 duration-500">
              <div className="flex items-center justify-between px-1">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Draw Official Signature</Label>
                <button className="text-[10px] uppercase font-bold text-slate-400 hover:text-red-500 transition-colors tracking-tight font-black" onClick={() => signaturePad?.clear()}>
                  Reset Board
                </button>
              </div>
              <div className="h-52 w-full border-2 border-dashed border-slate-300 rounded-2xl relative bg-white shadow-inner focus-within:border-blue-400 transition-all">
                <SignaturePad 
                   canvasProps={{ className: "w-full h-full cursor-crosshair" }} 
                   ref={(ref) => setSignaturePad(ref)} 
                />
              </div>
              <div className="bg-blue-50/80 p-5 rounded-2xl flex items-start gap-4 border border-blue-100/50 shadow-sm">
                 <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                 <p className="text-[11px] text-blue-900 leading-normal font-semibold">
                   Your signature will be converted to a high-quality official file and assigned to your account profile automatically.
                 </p>
              </div>
              <Button 
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-16 shadow-2xl rounded-2xl transition-all active:scale-[0.98] shadow-slate-200"
                onClick={handleSave} 
                disabled={isSaving}
              >
                {isSaving ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="animate-spin h-5 w-5" />
                    <span>Uploading Identity...</span>
                  </div>
                ) : (
                  <><CheckCircle2 className="w-5 h-5 mr-3 text-green-400" />Secure Signature File</>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SignatureManagementModal;
