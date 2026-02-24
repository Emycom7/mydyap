import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { presentationId, message, conversationHistory } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabase = createClient(supabaseUrl, Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Non authentifié" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get current presentation
    const { data: presentation, error: fetchError } = await supabase
      .from("presentations")
      .select("*")
      .eq("id", presentationId)
      .single();

    if (fetchError || !presentation) {
      return new Response(JSON.stringify({ error: "Présentation non trouvée" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `Tu es un assistant expert en modification de présentations professionnelles.
Tu as accès à la structure JSON d'une présentation existante. L'utilisateur te demande de la modifier.

Présentation actuelle (JSON):
${JSON.stringify(presentation.slide_data, null, 2)}

Titre: ${presentation.title}

INSTRUCTIONS:
- Quand l'utilisateur demande une modification, applique-la à la structure JSON
- Retourne TOUJOURS ta réponse dans ce format exact:

Si tu modifies la présentation:
{"action": "update", "message": "Description de ce que tu as fait", "slides": [... slides modifiées ...]}

Si tu réponds à une question sans modifier:
{"action": "reply", "message": "Ta réponse"}

Pour les slides, utilise les mêmes types que l'original: cover, summary, chart, kpi, insights, recommendations, conclusion.
Pour les charts, les types valides sont: bar, line, pie, radar, scatter, area.
Assure-toi que les données des graphiques sont cohérentes avec le contexte de la présentation.`;

    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...(conversationHistory || []).map((m: any) => ({ role: m.role, content: m.content })),
      { role: "user" as const, content: message },
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requêtes atteinte." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits IA insuffisants." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("Erreur du service IA");
    }

    const aiResult = await response.json();
    const rawContent = aiResult.choices?.[0]?.message?.content || "";

    let result;
    try {
      const jsonMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : rawContent.trim();
      result = JSON.parse(jsonStr);
    } catch {
      result = { action: "reply", message: rawContent };
    }

    // If update, save to DB
    if (result.action === "update" && result.slides) {
      const serviceClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      const { error: updateError } = await serviceClient
        .from("presentations")
        .update({
          slide_data: result.slides,
          version: presentation.version + 1,
        })
        .eq("id", presentationId)
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Update error:", updateError);
        throw new Error("Erreur de sauvegarde");
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("update-presentation error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
