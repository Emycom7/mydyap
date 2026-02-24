import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { csvData, fileName, analysisLevel, tone, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Get auth user
    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse JWT to get user_id
    const token = authHeader?.replace("Bearer ", "");
    const { data: { user }, error: authError } = await createClient(supabaseUrl, Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    }).auth.getUser();
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Non authentifié" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const toneMap: Record<string, string> = {
      corporate: "professionnel et corporate, avec un ton formel",
      analyste: "analytique et technique, orienté données",
      startup: "dynamique et moderne, orienté startup",
    };

    const levelMap: Record<string, string> = {
      standard: "Fais une analyse standard avec les principaux KPIs.",
      advanced: "Fais une analyse avancée avec corrélations, tendances et segmentation.",
      expert: "Fais une analyse experte complète : corrélations, anomalies, tendances, segmentation, distributions, recommandations stratégiques détaillées.",
    };

    const systemPrompt = `Tu es un expert en analyse de données et création de présentations professionnelles. 
Tu dois analyser les données CSV fournies et générer une structure de diaporama complète.

Ton : ${toneMap[tone] || toneMap.corporate}
Niveau : ${levelMap[analysisLevel] || levelMap.standard}
Langue : ${language || "fr"}

IMPORTANT: Tu dois répondre UNIQUEMENT avec un JSON valide, sans texte autour. Le JSON doit suivre cette structure exacte:

{
  "title": "Titre de la présentation",
  "description": "Description courte",
  "slides": [
    {
      "type": "cover",
      "title": "Titre principal",
      "subtitle": "Sous-titre"
    },
    {
      "type": "summary",
      "title": "Résumé Exécutif",
      "content": "Texte du résumé",
      "keyPoints": ["point 1", "point 2", "point 3"]
    },
    {
      "type": "chart",
      "title": "Titre du graphique",
      "chartType": "bar|line|pie|radar|scatter|area",
      "interpretation": "Analyse détaillée et interprétation stratégique du graphique",
      "impact": "Impact business",
      "recommendation": "Recommandation stratégique",
      "data": [{"name": "Cat1", "value": 100}, {"name": "Cat2", "value": 200}],
      "dataKeys": ["value"],
      "xKey": "name"
    },
    {
      "type": "kpi",
      "title": "KPIs Clés",
      "kpis": [{"label": "Nom KPI", "value": "123", "change": "+12%", "interpretation": "Explication"}]
    },
    {
      "type": "insights",
      "title": "Insights Stratégiques",
      "insights": [{"title": "Insight 1", "description": "Description détaillée", "impact": "high|medium|low"}]
    },
    {
      "type": "recommendations",
      "title": "Recommandations",
      "recommendations": [{"title": "Reco 1", "description": "Description", "priority": "high|medium|low"}]
    },
    {
      "type": "conclusion",
      "title": "Conclusion",
      "content": "Texte de conclusion",
      "nextSteps": ["étape 1", "étape 2"]
    }
  ]
}

Génère entre 8 et 15 slides avec des données réelles extraites du CSV. Pour les graphiques, utilise les vraies valeurs du dataset. Choisis les types de graphiques les plus pertinents. Chaque interprétation doit être factuelle, stratégique et exploitable.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Voici les données CSV à analyser:\n\n${csvData}` },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requêtes atteinte, réessayez dans quelques instants." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits IA insuffisants." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI error:", response.status, text);
      throw new Error("Erreur du service IA");
    }

    const aiResult = await response.json();
    const rawContent = aiResult.choices?.[0]?.message?.content || "";
    
    // Parse JSON from AI response (may have markdown fences)
    let slideData;
    try {
      const jsonMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : rawContent.trim();
      slideData = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr, "Raw:", rawContent.substring(0, 500));
      throw new Error("L'IA n'a pas retourné un format valide. Réessayez.");
    }

    // Save to database
    const { data: presentation, error: dbError } = await supabase
      .from("presentations")
      .insert({
        user_id: user.id,
        title: slideData.title || `Présentation ${fileName}`,
        description: slideData.description || "",
        slide_data: slideData.slides || [],
        source_file_name: fileName,
        status: "completed",
      })
      .select()
      .single();

    if (dbError) {
      console.error("DB error:", dbError);
      throw new Error("Erreur de sauvegarde");
    }

    return new Response(JSON.stringify({ presentation, slideData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-data error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
