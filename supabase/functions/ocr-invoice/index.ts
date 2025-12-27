import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Prompt système pour l'extraction OCR des factures
const OCR_SYSTEM_PROMPT = `Tu es un expert en extraction de données de factures pour le calcul d'empreinte carbone.
Tu dois extraire les informations clés des factures d'énergie et de transport.

Types de factures que tu peux traiter:
- Factures STEG (électricité tunisienne): recherche "STEG", "kWh", période de consommation
- Factures de carburant (Total, Shell, stations-service): litres de diesel/essence/GPL
- Factures de gaz naturel: m3 ou kWh
- Factures de transport/logistique: km parcourus, tonnes transportées

IMPORTANT pour les factures STEG tunisiennes:
- Le montant est en Dinars Tunisiens (TND)
- Recherche les champs: "Consommation", "Période du...au...", "kWh"
- Format de date tunisien: JJ/MM/AAAA

Tu DOIS retourner un JSON valide avec cette structure exacte:
{
  "document_type": "electricity_bill" | "fuel_invoice" | "gas_bill" | "transport_invoice" | "other",
  "supplier_name": "nom du fournisseur (ex: STEG, Total, Engie)",
  "invoice_number": "numéro de facture si disponible",
  "period_start": "YYYY-MM-DD",
  "period_end": "YYYY-MM-DD", 
  "quantity": nombre (consommation en kWh, litres, m3, km),
  "unit": "kWh" | "litres" | "m3" | "km" | "tonnes",
  "amount_ht": nombre (montant HT si disponible),
  "amount_ttc": nombre (montant TTC),
  "currency": "TND" | "EUR" | "USD",
  "ghg_scope": "scope1" | "scope2" | "scope3",
  "ghg_category": "electricite" | "gaz_naturel" | "diesel" | "essence" | "gpl" | "transport_routier",
  "confidence_score": nombre de 0 à 100,
  "extraction_notes": "notes sur l'extraction, difficultés rencontrées"
}

Règles de mapping GHG Protocol:
- Électricité achetée → Scope 2, catégorie "electricite"
- Gaz naturel brûlé sur site → Scope 1, catégorie "gaz_naturel"  
- Carburant véhicules entreprise → Scope 1, catégorie "diesel/essence/gpl"
- Transport marchandises sous-traité → Scope 3, catégorie "transport_routier"

Si tu ne peux pas extraire certaines informations, utilise null pour ces champs.
Retourne UNIQUEMENT le JSON, sans texte additionnel.`;

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

    // Mettre à jour le statut du document en "processing"
    await supabase
      .from('data_collection_documents')
      .update({ ocr_status: 'processing' })
      .eq('id', document_id);

    console.log('Processing document:', document_id);

    // Préparer le contenu pour l'IA
    let userContent: any[] = [
      {
        type: "text",
        text: "Analyse cette facture et extrait les informations de consommation d'énergie ou de transport. Retourne uniquement le JSON structuré."
      }
    ];

    // Si on a une image en base64, l'ajouter
    if (image_base64) {
      userContent.push({
        type: "image_url",
        image_url: {
          url: image_base64.startsWith('data:') ? image_base64 : `data:image/jpeg;base64,${image_base64}`
        }
      });
    } else if (file_url) {
      // Télécharger le fichier depuis le storage
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

    // Appeler l'API Lovable AI avec vision
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
        temperature: 0.1,
        max_tokens: 2000
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

      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content || '';
    
    console.log('AI response:', rawContent);

    // Parser le JSON de la réponse
    let extractedData: ExtractedData;
    try {
      // Nettoyer la réponse (enlever les backticks markdown si présents)
      let cleanedContent = rawContent.trim();
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
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      
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

    // Mettre à jour le document avec les données extraites
    const { error: updateError } = await supabase
      .from('data_collection_documents')
      .update({
        ocr_status: 'processed',
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

    console.log('Document processed successfully:', document_id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: extractedData,
        document_id: document_id
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
