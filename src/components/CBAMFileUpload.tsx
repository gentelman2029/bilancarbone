import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Upload, 
  FileText, 
  Image, 
  File, 
  X, 
  Eye, 
  Download,
  Trash2,
  CheckCircle,
  AlertCircle,
  Folder
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  category: string;
  uploadDate: string;
  status: 'Validé' | 'En attente' | 'Rejeté';
  description?: string;
}

export const CBAMFileUpload = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([
    {
      id: '1',
      name: 'facture-electricite-janvier-2024.pdf',
      type: 'application/pdf',
      size: 245760,
      category: 'Factures énergétiques',
      uploadDate: '2024-01-15',
      status: 'Validé',
      description: 'Facture électricité site principal'
    },
    {
      id: '2',
      name: 'certificat-analyse-acier.pdf',
      type: 'application/pdf',
      size: 156800,
      category: 'Certificats techniques',
      uploadDate: '2024-01-12',
      status: 'En attente',
      description: 'Certificat d\'analyse chimique acier batch #1234'
    }
  ]);

  const [dragActive, setDragActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [fileDescription, setFileDescription] = useState('');

  const fileCategories = [
    'Factures énergétiques',
    'Certificats techniques', 
    'Fiches de données de sécurité',
    'Rapports d\'analyse',
    'Documents fournisseurs',
    'Preuves de conformité',
    'Autres documents'
  ];

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [selectedCategory, fileDescription]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    if (!selectedCategory) {
      toast({
        title: "Catégorie requise",
        description: "Veuillez sélectionner une catégorie avant d'uploader",
        variant: "destructive"
      });
      return;
    }

    Array.from(files).forEach(file => {
      // Validation des types de fichiers
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.ms-excel', 'text/csv'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Type de fichier non supporté",
          description: "Seuls les PDF, images, Excel et CSV sont acceptés",
          variant: "destructive"
        });
        return;
      }

      // Validation de la taille (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Fichier trop volumineux",
          description: "La taille maximale est de 10MB",
          variant: "destructive"
        });
        return;
      }

      const newFile: UploadedFile = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: file.type,
        size: file.size,
        category: selectedCategory,
        uploadDate: new Date().toISOString().split('T')[0],
        status: 'En attente',
        description: fileDescription || `Document ${selectedCategory.toLowerCase()}`
      };

      setUploadedFiles(prev => [...prev, newFile]);

      toast({
        title: "Fichier uploadé",
        description: `${file.name} a été ajouté avec succès`
      });
    });

    // Reset form
    setFileDescription('');
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="h-8 w-8 text-red-600" />;
    if (type.includes('image')) return <Image className="h-8 w-8 text-blue-600" />;
    return <File className="h-8 w-8 text-gray-600" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Validé': return 'bg-green-100 text-green-800';
      case 'En attente': return 'bg-yellow-100 text-yellow-800';
      case 'Rejeté': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Validé': return <CheckCircle className="h-4 w-4" />;
      case 'En attente': return <AlertCircle className="h-4 w-4" />;
      case 'Rejeté': return <X className="h-4 w-4" />;
      default: return null;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
    toast({
      title: "Fichier supprimé",
      description: "Le fichier a été retiré de la liste"
    });
  };

  const downloadFile = (file: UploadedFile) => {
    // Simulation de téléchargement
    toast({
      title: "Téléchargement lancé",
      description: `Téléchargement de ${file.name}`
    });
  };

  const previewFile = (file: UploadedFile) => {
    toast({
      title: "Aperçu du fichier",
      description: `Ouverture de ${file.name}`
    });
  };

  return (
    <div className="space-y-6">
      {/* Zone d'upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Téléchargement de Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Sélection catégorie */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Catégorie de document*</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie..." />
                  </SelectTrigger>
                  <SelectContent>
                    {fileCategories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description (optionnel)</Label>
                <Input
                  id="description"
                  value={fileDescription}
                  onChange={(e) => setFileDescription(e.target.value)}
                  placeholder="Description du document..."
                />
              </div>
            </div>

            {/* Zone de drag & drop */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">
                Glissez et déposez vos fichiers ici
              </h3>
              <p className="text-muted-foreground mb-4">
                ou cliquez pour parcourir vos fichiers
              </p>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.xls,.xlsx,.csv"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={!selectedCategory}
              />
              <Button variant="outline" disabled={!selectedCategory}>
                Parcourir les fichiers
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                PDF, Images, Excel, CSV - Max 10MB par fichier
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques des fichiers */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {uploadedFiles.length}
              </div>
              <div className="text-sm text-muted-foreground">Total fichiers</div>
            </div>
            <Folder className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {uploadedFiles.filter(f => f.status === 'Validé').length}
              </div>
              <div className="text-sm text-muted-foreground">Validés</div>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {uploadedFiles.filter(f => f.status === 'En attente').length}
              </div>
              <div className="text-sm text-muted-foreground">En attente</div>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(uploadedFiles.reduce((total, file) => total + file.size, 0) / (1024 * 1024))}MB
              </div>
              <div className="text-sm text-muted-foreground">Espace utilisé</div>
            </div>
            <Upload className="h-8 w-8 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Liste des fichiers uploadés */}
      <Card>
        <CardHeader>
          <CardTitle>Documents Téléchargés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {uploadedFiles.map((file) => (
              <Card key={file.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getFileIcon(file.type)}
                    <div className="flex-1">
                      <h4 className="font-semibold">{file.name}</h4>
                      <p className="text-sm text-muted-foreground mb-1">
                        {file.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span>{file.category}</span>
                        <span>•</span>
                        <span>{file.uploadDate}</span>
                      </div>
                      <div className="mt-2">
                        <Badge className={getStatusColor(file.status)}>
                          {getStatusIcon(file.status)}
                          <span className="ml-1">{file.status}</span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => previewFile(file)}
                      title="Aperçu"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => downloadFile(file)}
                      title="Télécharger"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};