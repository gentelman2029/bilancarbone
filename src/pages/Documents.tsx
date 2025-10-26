import { CarbonDocumentsUpload } from "@/components/CarbonDocumentsUpload";

export default function Documents() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Documents justificatifs</h1>
        <p className="text-muted-foreground">
          Centralisez tous vos documents liés à votre bilan carbone
        </p>
      </div>
      
      <CarbonDocumentsUpload />
    </div>
  );
}
