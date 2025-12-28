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
- **gas_bill**: Factures gaz naturel (STEG, Engie, etc.) - Cherche: m³, kWh thermiques
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

## Instructions SPÉCIFIQUES pour factures STEG (Tunisie)

TRÈS IMPORTANT - Utilise ces LABELS EXACTS pour extraire les données:

1. **PÉRIODE DE FACTURATION**:
   - Cherche le format: "YYYY-MM-DD إلى : YYYY-MM-DD" (date إلى date)
   - "إلى" signifie "à" en arabe
   - La DATE DE DÉBUT (period_start) est la date à DROITE après "إلى :"
   - La DATE DE FIN (period_end) est la date à GAUCHE avant "إلى"
   - Exemple: "2025-11-12 إلى : 2024-05-15" → period_start=2024-05-15, period_end=2025-11-12
   
2. **CONSOMMATION (quantity)** - RÈGLE CRITIQUE ABSOLUE:
   - Le champ de la consommation électrique s'appelle "الكمية Quantité (1)"
   - Ce champ contient la valeur en kWh (ex: 5022)
   - Dans l'en-tête du tableau: "الكمية" en arabe + "Quantité" en français + "(1)"
   - EXTRAIT LA VALEUR NUMÉRIQUE SOUS CE CHAMP comme quantity
   - NE PAS confondre avec le champ "Consommation" qui est différent
   - EXEMPLE: Si "الكمية Quantité (1)" = 5022 → quantity = 5022
   - L'unité est TOUJOURS "kWh" pour l'électricité STEG

3. **MONTANT À PAYER (amount_ttc)** - CHAMP IMPORTANT:
   - Le champ s'appelle "المبلغ المطلوب(19)" en arabe + "Montant à payer" en français
   - Ce champ est encadré en rouge sur la facture
   - EXTRAIT LA VALEUR NUMÉRIQUE (ex: 302.000)
   - ATTENTION au format tunisien: 302.000 = 302 TND (le point est séparateur de milliers, PAS décimales)
   - Donc 302.000 → amount_ttc = 302
   - Currency: "TND" (Dinars Tunisiens)

4. **Supplier**: Toujours "STEG" pour ces factures tunisiennes d'électricité

## Instructions générales d'extraction

CRITIQUE - Ne confonds PAS:
- La CONSOMMATION (kWh, litres, m³) avec le PRIX (TND, EUR)
- La puissance souscrite avec la consommation réelle
- Les taxes avec les montants HT

## Format de sortie JSON

Tu DOIS retourner un JSON valide avec cette structure:
{
  "document_type": "electricity_bill|gas_bill|fuel_invoice|heating_oil_invoice|lpg_invoice|refrigerant_invoice|district_heating|district_cooling|transport_invoice|business_travel|freight_invoice|purchase_invoice|waste_invoice|water_bill|other",
  "supplier_name": "nom du fournisseur (STEG pour factures tunisiennes)",
  "invoice_number": "numéro de facture",
  "period_start": "YYYY-MM-DD (pour STEG: la date à DROITE sous FACTURE ESTIMEE)",
  "period_end": "YYYY-MM-DD (pour STEG: la date à GAUCHE sous FACTURE ESTIMEE)",
  "quantity": nombre (la valeur de CONSOMMATION en kWh, litres, m³ - PAS le prix!),
  "unit": "kWh|litres|m3|km|tonnes|t.km|kg",
  "amount_ht": nombre ou null,
  "amount_ttc": nombre (MONTANT À PAYER),
  "currency": "TND|EUR|USD",
  "ghg_scope": "scope1|scope2|scope3",
  "ghg_category": "electricite|gaz_naturel|diesel|essence|gpl|fioul|transport_routier|transport_aerien|dechets|achats",
  "confidence_score": nombre de 0 à 1,
  "field_confidences": {
    "supplier_name": 0.0-1.0,
    "quantity": 0.0-1.0,
    "unit": 0.0-1.0,
    "period_start": 0.0-1.0,
    "period_end": 0.0-1.0,
    "amount_ttc": 0.0-1.0,
    "ghg_category": 0.0-1.0
  },
  "extraction_notes": "notes sur difficultés ou incertitudes"
}

## Règles de mapping GHG Protocol
- Électricité achetée → Scope 2, catégorie "electricite"
- Gaz naturel brûlé sur site → Scope 1, catégorie "gaz_naturel"
- Carburant véhicules entreprise → Scope 1, catégorie "diesel/essence/gpl"
- Fioul chauffage → Scope 1, catégorie "fioul"
- Fluides frigorigènes → Scope 1, catégorie "refrigerants"
- Transport marchandises sous-traité → Scope 3, catégorie "transport_routier"
- Déchets → Scope 3, catégorie "dechets"
- Eau → Scope 3, catégorie "eau"

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
    const { document_id, image_base64, file_url } = await req.json();
    
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

    console.log('Processing document:', document_id);

    // Prepare content for AI
    let userContent: any[] = [
      {
        type: "text",
        text: "Analyse cette facture et extrais les informations de consommation d'énergie. IMPORTANT: Extrait la CONSOMMATION (kWh, litres, m³), PAS le montant en devises. Retourne uniquement le JSON structuré."
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
