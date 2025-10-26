import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Upload, File, FileText, Image, Download, Trash2, Eye, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Document {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  category: string;
  description: string | null;
  upload_date: string;
}

const DOCUMENT_CATEGORIES = [
  { value: "electricity_bill", label: "Facture d'électricité" },
  { value: "gas_bill", label: "Facture de gaz" },
  { value: "fuel_invoice", label: "Facture de carburant" },
  { value: "transport_invoice", label: "Facture de transport" },
  { value: "certificate", label: "Certificat/Attestation" },
  { value: "other", label: "Autre" }
];

export function CarbonDocumentsUpload() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [description, setDescription] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("carbon_documents")
        .select("*")
        .eq("user_id", user.id)
        .order("upload_date", { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error("Error loading documents:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les documents",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!selectedCategory) {
      toast({
        title: "Catégorie requise",
        description: "Veuillez sélectionner une catégorie avant d'uploader",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      for (const file of Array.from(files)) {
        // Validate file size (20MB max)
        if (file.size > 20 * 1024 * 1024) {
          toast({
            title: "Fichier trop volumineux",
            description: `${file.name} dépasse la limite de 20MB`,
            variant: "destructive"
          });
          continue;
        }

        // Upload to storage
        const filePath = `${user.id}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("carbon-documents")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Save metadata to database
        const { error: dbError } = await supabase
          .from("carbon_documents")
          .insert({
            user_id: user.id,
            file_name: file.name,
            file_path: filePath,
            file_size: file.size,
            mime_type: file.type,
            category: selectedCategory,
            description: description || null
          });

        if (dbError) throw dbError;
      }

      toast({
        title: "Succès",
        description: "Documents uploadés avec succès"
      });

      setSelectedCategory("");
      setDescription("");
      loadDocuments();
    } catch (error) {
      console.error("Error uploading:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'uploader le fichier",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from("carbon-documents")
        .download(doc.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.file_name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading:", error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le fichier",
        variant: "destructive"
      });
    }
  };

  const handlePreview = async (doc: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from("carbon-documents")
        .download(doc.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      setPreviewUrl(url);
      setPreviewDocument(doc);
      setShowPreview(true);
    } catch (error) {
      console.error("Error previewing:", error);
      toast({
        title: "Erreur",
        description: "Impossible de prévisualiser le fichier",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (doc: Document) => {
    if (!confirm(`Supprimer ${doc.file_name} ?`)) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("carbon-documents")
        .remove([doc.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("carbon_documents")
        .delete()
        .eq("id", doc.id);

      if (dbError) throw dbError;

      toast({
        title: "Succès",
        description: "Document supprimé"
      });

      loadDocuments();
    } catch (error) {
      console.error("Error deleting:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le fichier",
        variant: "destructive"
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <Image className="h-5 w-5" />;
    if (mimeType === "application/pdf") return <FileText className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Uploader des documents justificatifs</CardTitle>
          <CardDescription>
            Ajoutez vos factures et documents liés à votre bilan carbone (max 20MB par fichier)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div>
              <Label>Catégorie du document</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Description (optionnel)</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ajoutez une description pour ce document"
                rows={2}
              />
            </div>

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging ? "border-primary bg-primary/5" : "border-border"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFileUpload(e.dataTransfer.files);
              }}
            >
              <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Glissez-déposez vos fichiers ici ou
              </p>
              <Input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.csv"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
                id="file-upload"
              />
              <Label htmlFor="file-upload">
                <Button variant="outline" disabled={isUploading || !selectedCategory} asChild>
                  <span>{isUploading ? "Upload en cours..." : "Sélectionner des fichiers"}</span>
                </Button>
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mes documents ({documents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {documents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Aucun document uploadé
                </p>
              ) : (
                documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getFileIcon(doc.mime_type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{doc.file_name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {DOCUMENT_CATEGORIES.find(c => c.value === doc.category)?.label || doc.category}
                          </Badge>
                          <span>{formatFileSize(doc.file_size)}</span>
                          <span>•</span>
                          <span>{new Date(doc.upload_date).toLocaleDateString()}</span>
                        </div>
                        {doc.description && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {doc.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePreview(doc)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(doc)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(doc)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{previewDocument?.file_name}</DialogTitle>
            <DialogDescription>
              Prévisualisation du document
            </DialogDescription>
          </DialogHeader>
          <div className="relative h-[60vh]">
            {previewUrl && previewDocument?.mime_type.startsWith("image/") ? (
              <img src={previewUrl} alt={previewDocument.file_name} className="w-full h-full object-contain" />
            ) : previewUrl && previewDocument?.mime_type === "application/pdf" ? (
              <iframe src={previewUrl} className="w-full h-full" />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Prévisualisation non disponible pour ce type de fichier</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
