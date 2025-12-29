import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced OCR system prompt with all document types and field-level confidence
const OCR_SYSTEM_PROMPT = `Tu es un expert en extraction de données de factures pour le calcul d'empreinte carbone GHG Protocol.

## Types de documents supportés

### SCOPE 1 - Émissions directes (combustion sur site)
- **gas_bill**: Factures gaz naturel (STEG, Engie, etc.) - Cherche: thermies, m³, kWh thermiques
- **fuel_invoice**: Factures carburant véhicules entreprise (diesel, essence) - Cherche: litres
- **heating_oil_invoice**: Factures fioul domestique - Cherche: litres
- **lpg_invoice**: Factures GPL/propane - Cherche: kg, litres
- **refrigerant_invoice**: Factures fluides frigorigènes - Cherche: kg de gaz

### SCOPE 2 - Énergie indirecte
- **electricity_bill**: Factures électricité (STEG, EDF, etc.) - Cherche: kWh
- **district_heating**: Factures chaleur réseau - Cherche: kWh, MWh
- **district_cooling**: Factures froid réseau - Cherche: kWh, MWh

### SCOPE 3 - Autres émissions indirectes
- **transport_invoice**: Transport de marchandises - Cherche: km, t.km
- **business_travel**: Déplacements professionnels - Cherche: km, billets
- **freight_invoice**: Fret (aérien, maritime, routier) - Cherche: tonnes, km
- **purchase_invoice**: Achats de biens et services - Cherche: montants
- **waste_invoice**: Traitement des déchets - Cherche: tonnes
- **water_bill**: Factures eau - Cherche: m³

## ========== INSTRUCTIONS SPÉCIFIQUES FACTURES CARBURANT TUNISIE (Multi-Formats) ==========

TRÈS IMPORTANT pour les factures de CARBURANT - Supporte plusieurs formats:

### FORMAT 1: TotalEnergies (tableau vertical "Produits et services consommés")
- Le tableau liste les produits ligne par ligne verticalement
- Colonnes typiques: Produit | PU HT | Quantité | Montant HT | Taux TVA | Montant TVA | Montant TTC
- Extrais chaque ligne de carburant séparément

### FORMAT 2: Agil (tableau horizontal)
- Format tunisien avec colonnes: Libellé Produit | Quantité | Taux Tva | Prix Unitaire HTVA | Montant HTVA | Montant TVA | Montant TTC
- Les données sont sur une ligne horizontale
- Cherche "Gasoil" dans la colonne "Libellé Produit" et la quantité correspondante

### FORMAT 3: OLA Energy Tunisie
- Cherche "Facture n°:" pour le numéro de facture (ex: CCIN120769)
- Cherche "Tunis le:" pour la date de facture (ex: 30/04/2025)
- Section "Consommation Carburant" contient les produits
- Colonnes: Produit | Quant./ Base | PU/ | TVA | Total HT | Montant TVA | Total TTC
- Produit typique: "O'ptimium ECO PLUS Gasoil Sans Soufre"
- La quantité est dans la colonne "Quant./ Base" (ex: 182,177)
- IGNORER: ligne "Prestation", "Conso Carburant et Prestation", "Timbre Fiscal", TVA

### IDENTITÉ DU DOCUMENT (obligatoire):
1. **Numéro de Facture**: Cherche "Facture N°", "N° BLF", "Facture n°:" ou numéros similaires
2. **Date de facture**: Date d'émission au format YYYY-MM-DD (cherche après "Tunis le:" pour OLA)
3. **NE PAS extraire**: Nom du client, dates de début/fin de période

### PRODUITS À EXTRAIRE (carburants UNIQUEMENT):
| Produit | Facteur d'émission | Catégorie |
|---------|-------------------|-----------|
| GASOIL, Gasoil | 2.67 kg CO2e/L | diesel |
| GASOIL SS (Sans Soufre) | 2.64 kg CO2e/L | diesel |
| GO SS, GO SS EXC (Excellium) | 2.64 kg CO2e/L | diesel |
| O'ptimium ECO PLUS Gasoil Sans Soufre | 2.64 kg CO2e/L | diesel |

### PRODUITS À IGNORER (services):
- Prestation, Lavage, Timbre Fiscal, Abonnement Carte
- SERVICES, Achat TAG, Frais de gestion
- TVA, taxes, "Conso Carburant et Prestation" (ligne récap)

### POUR CHAQUE LIGNE DE CARBURANT:
- product_name: nom exact du produit
- quantity: la valeur numérique EXACTE en litres (ex: 182.177, PAS 182 ou 200)
- ghg_category: "diesel" pour tous les gasoils
- emission_factor: 2.67 pour GASOIL standard, 2.64 pour variantes SS/Sans Soufre/Excellium
- co2_kg: quantity × emission_factor

### FORMAT DE SORTIE MULTI-LIGNES:
{
  "document_type": "fuel_invoice",
  "supplier_name": "TotalEnergies|Agil|OLA Energy|Shell|...",
  "invoice_number": "CCIN120769|FA23/288495|8924029525",
  "invoice_date": "2025-04-30",
  "fuel_items": [
    {
      "product_name": "O'ptimium ECO PLUS Gasoil Sans Soufre",
      "quantity": 182.177,
      "unit": "litres",
      "ghg_category": "diesel",
      "emission_factor": 2.64,
      "co2_kg": 480.95
    }
  ],
  "total_quantity": 182.177,
  "total_co2_kg": 480.95,
  "confidence_score": 0.9,
  "extraction_notes": "Format OLA Energy - 1 type de carburant extrait"
}

### Pour autres factures - FORMAT SIMPLE:
{
  "document_type": "electricity_bill|gas_bill|...",
  "supplier_name": "nom du fournisseur",
  "invoice_number": "numéro de facture",
  "invoice_date": "YYYY-MM-DD",
  "quantity": nombre,
  "unit": "thermies|kWh|litres|m3|km|tonnes|t.km|kg",
  "amount_ht": nombre ou null,
  "amount_ttc": nombre ou null,
  "currency": "TND|EUR|USD",
  "ghg_scope": "scope1|scope2|scope3",
  "ghg_category": "electricite|gaz_naturel|diesel|essence|gpl|fioul|transport_routier",
  "confidence_score": nombre de 0 à 1,
  "field_confidences": {
    "supplier_name": 0.0-1.0,
    "quantity": 0.0-1.0,
    "unit": 0.0-1.0,
    "invoice_date": 0.0-1.0,
    "amount_ttc": 0.0-1.0,
    "ghg_category": 0.0-1.0
  },
  "extraction_notes": "notes sur difficultés ou incertitudes"
}

## Règles de mapping GHG Protocol
- Gaz naturel brûlé sur site → Scope 1, catégorie "gaz_naturel", unité "thermies"
- Électricité achetée → Scope 2, catégorie "electricite", unité "kWh"
- Carburant véhicules entreprise → Scope 1, catégorie "diesel/essence/gpl"
- Fioul chauffage → Scope 1, catégorie "fioul"
- Transport marchandises sous-traité → Scope 3, catégorie "transport_routier"

RETOURNE UNIQUEMENT le JSON, sans texte additionnel ni markdown.`;

interface ExtractedData {
  document_type: string;
  supplier_name: string | null;
  invoice_number: string | null;
  period_start: string | null;
  period_end: string | null;
  quantity: number | null;
  unit: string | null;
  amount_ht: number | null;
  amount_ttc: number | null;
  currency: string;
  ghg_scope: string;
  ghg_category: string;
  confidence_score: number;
  field_confidences: Record<string, number>;
  extraction_notes: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { document_id, image_base64, file_url, document_type } = await req.json();
    
    if (!document_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'document_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update document status to processing
    await supabase
      .from('data_collection_documents')
      .update({ ocr_status: 'processing' })
      .eq('id', document_id);

    console.log('Processing document:', document_id, 'Type:', document_type);

    // Build extraction instruction based on document type
    let extractionInstruction = "Analyse cette facture et extrais les informations de consommation d'énergie.";
    
    if (document_type === 'fuel_invoice') {
      extractionInstruction = `IMPORTANT: FACTURE DE CARBURANT - TotalEnergies, Agil, OLA Energy, Shell.

=== RÈGLE CRITIQUE N°1 - QUANTITÉ EXACTE ===
Tu DOIS extraire la VALEUR EXACTE de la colonne "Quantité" ou "Quant./ Base" du tableau.
NE PAS arrondir. NE PAS estimer. NE PAS inventer.

EXEMPLES:
- Facture Agil: Gasoil | 304,811 → quantity = 304.811
- Facture OLA Energy: 182,177 → quantity = 182.177
- Facture TotalEnergies: 80 553,22 → quantity = 80553.22

CONVERSIONS:
- Virgule française → Point décimal: "182,177" → 182.177
- Espaces milliers supprimés: "80 553,22" → 80553.22

=== RÈGLE N°2 - DÉTECTION FORMAT ===
FORMAT OLA ENERGY: 
- N° Facture: Cherche "Facture n°:" (ex: CCIN120769)
- Date: Cherche "Tunis le:" (ex: 30/04/2025 → 2025-04-30)
- Section "Consommation Carburant" avec colonnes Produit | Quant./ Base
- Produit typique: "O'ptimium ECO PLUS Gasoil Sans Soufre"
- IGNORER: "Prestation", "Conso Carburant et Prestation", "Timbre Fiscal"

FORMAT AGIL: 
- Colonnes "Libellé Produit" et "Quantité"
- Exemple ligne: Gasoil | 304,811 | 13,00 | ...

FORMAT TOTALENERGIES: 
- Tableau "Produits et services consommés"
- Colonnes: Produit | Quantité | Montant

=== RÈGLE N°3 - IDENTITÉ (obligatoire) ===
- invoice_number: Cherche "Facture n°:", "N° BLF" ou "Facture N°"
- invoice_date: Date au format YYYY-MM-DD (30/04/2025 → 2025-04-30)
- supplier_name: OLA Energy, Agil, TotalEnergies, Shell...
- NE PAS extraire: client_name, period_start, period_end

=== RÈGLE N°4 - CALCUL CO2 ===
Pour CHAQUE produit carburant:
- GASOIL/Gasoil standard → emission_factor: 2.67
- GASOIL SS/Sans Soufre/O'ptimium ECO PLUS → emission_factor: 2.64
- co2_kg = quantity × emission_factor (ex: 182.177 × 2.64 = 480.95)

IGNORER: Prestation, Lavage, Timbre, Abonnement, TAG, TVA, services

=== FORMAT JSON OBLIGATOIRE ===
{
  "document_type": "fuel_invoice",
  "invoice_number": "CCIN120769",
  "invoice_date": "2025-04-30",
  "supplier_name": "OLA Energy",
  "fuel_items": [
    {"product_name": "O'ptimium ECO PLUS Gasoil Sans Soufre", "quantity": 182.177, "emission_factor": 2.64, "co2_kg": 480.95}
  ],
  "total_quantity": 182.177,
  "total_co2_kg": 480.95
}`;
    } else if (document_type === 'gas_bill') {
      extractionInstruction = `IMPORTANT: Ce document est une FACTURE DE GAZ (gas_bill).
Extrais UNIQUEMENT les données de la section "Total Gaz" / "إجمالي الغاز":
- La quantité de gaz consommée en thermies (cherche la valeur dans la colonne Quantité de la section Gaz)
- NE PAS extraire les données électricité
- NE PAS extraire le montant à payer (amount_ttc doit être null)
- ghg_scope doit être "scope1"
- ghg_category doit être "gaz_naturel"
- unit doit être "thermies"
Retourne uniquement le JSON structuré.`;
    } else if (document_type === 'electricity_bill') {
      extractionInstruction = `IMPORTANT: Ce document est une FACTURE D'ÉLECTRICITÉ (electricity_bill).
Extrais UNIQUEMENT les données de la section "Total Électricité" / "إجمالي الكهرباء":
- La quantité d'électricité consommée en kWh
- Le montant à payer en TND
- NE PAS extraire les données gaz
- ghg_scope doit être "scope2"
- ghg_category doit être "electricite"
- unit doit être "kWh"
Retourne uniquement le JSON structuré.`;
    } else {
      extractionInstruction = "Analyse cette facture et extrais les informations de consommation d'énergie. IMPORTANT: Extrait la CONSOMMATION (kWh, thermies, litres, m³), PAS le montant en devises. Retourne uniquement le JSON structuré.";
    }

    // Prepare content for AI
    let userContent: any[] = [
      {
        type: "text",
        text: extractionInstruction
      }
    ];

    // Add image content
    if (image_base64) {
      userContent.push({
        type: "image_url",
        image_url: {
          url: image_base64.startsWith('data:') ? image_base64 : `data:image/jpeg;base64,${image_base64}`
        }
      });
    } else if (file_url) {
      // Download file from storage
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('data-collection-documents')
        .download(file_url);
      
      if (downloadError) {
        throw new Error(`Failed to download file: ${downloadError.message}`);
      }

      const arrayBuffer = await fileData.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      userContent.push({
        type: "image_url",
        image_url: {
          url: `data:${fileData.type};base64,${base64}`
        }
      });
    }

    // Call Lovable AI with vision
    console.log('Calling Lovable AI Vision...');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: OCR_SYSTEM_PROMPT },
          { role: 'user', content: userContent }
        ],
        max_tokens: 3000
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        await supabase
          .from('data_collection_documents')
          .update({ 
            ocr_status: 'failed',
            ocr_error_message: 'Rate limit exceeded, please try again later'
          })
          .eq('id', document_id);
        
        return new Response(
          JSON.stringify({ success: false, error: 'Rate limit exceeded' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (aiResponse.status === 402) {
        await supabase
          .from('data_collection_documents')
          .update({ 
            ocr_status: 'failed',
            ocr_error_message: 'AI credits exhausted'
          })
          .eq('id', document_id);
        
        return new Response(
          JSON.stringify({ success: false, error: 'AI credits exhausted' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content || '';
    
    console.log('AI response received, length:', rawContent.length);

    // Parse JSON response
    let extractedData: ExtractedData;
    try {
      let cleanedContent = rawContent.trim();
      // Remove markdown code blocks if present
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.slice(7);
      }
      if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.slice(3);
      }
      if (cleanedContent.endsWith('```')) {
        cleanedContent = cleanedContent.slice(0, -3);
      }
      extractedData = JSON.parse(cleanedContent.trim());
      
      // Ensure field_confidences exists
      if (!extractedData.field_confidences) {
        extractedData.field_confidences = {
          supplier_name: extractedData.confidence_score || 0.7,
          quantity: extractedData.confidence_score || 0.7,
          unit: extractedData.confidence_score || 0.7,
          period_start: (extractedData.confidence_score || 0.7) * 0.9,
          period_end: (extractedData.confidence_score || 0.7) * 0.9,
          amount_ttc: (extractedData.confidence_score || 0.7) * 0.85,
          ghg_category: (extractedData.confidence_score || 0.7) * 0.9
        };
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw content:', rawContent);
      
      await supabase
        .from('data_collection_documents')
        .update({ 
          ocr_status: 'manual_required',
          ocr_raw_result: { raw_response: rawContent },
          ocr_error_message: 'Failed to parse extracted data - manual review required'
        })
        .eq('id', document_id);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to parse extracted data',
          raw_response: rawContent
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine OCR status based on confidence
    const ocrStatus = extractedData.confidence_score >= 0.5 ? 'processed' : 'manual_required';

    // Update document with extracted data
    const { error: updateError } = await supabase
      .from('data_collection_documents')
      .update({
        ocr_status: ocrStatus,
        ocr_processed_at: new Date().toISOString(),
        ocr_raw_result: { 
          ai_response: aiData,
          extracted: extractedData 
        },
        ocr_confidence_score: extractedData.confidence_score,
        extracted_data: extractedData,
        document_type: extractedData.document_type,
        supplier_name: extractedData.supplier_name
      })
      .eq('id', document_id);

    if (updateError) {
      console.error('Failed to update document:', updateError);
      throw updateError;
    }

    console.log('Document processed successfully:', document_id, 'Status:', ocrStatus);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: extractedData,
        document_id: document_id,
        status: ocrStatus
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('OCR processing error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
