import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { user_id } = await req.json();

        if (!user_id) {
            return new Response(
                JSON.stringify({ error: "user_id es requerido" }),
                {
                    status: 400,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                },
            );
        }

        // Verificar caller: crear cliente con el token del usuario
        const supabaseUser = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_ANON_KEY") ?? "",
            {
                global: {
                    headers: { Authorization: req.headers.get("Authorization") ?? "" },
                },
            },
        );

        const {
            data: { user: caller },
        } = await supabaseUser.auth.getUser();

        if (!caller) {
            return new Response(
                JSON.stringify({ error: "No autorizado" }),
                {
                    status: 401,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                },
            );
        }

        // Verificar rol del caller desde user_roles
        const supabaseAdmin = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        );

        const { data: callerRole } = await supabaseAdmin
            .from("user_roles")
            .select("role")
            .eq("user_id", caller.id)
            .single();

        if (!callerRole) {
            return new Response(
                JSON.stringify({ error: "No autorizado" }),
                {
                    status: 401,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                },
            );
        }

        // Superadmin puede eliminar a cualquiera
        // Lender solo puede eliminar sus collectors
        if (callerRole.role === "superadmin") {
            // Permitido
        } else if (callerRole.role === "lender") {
            // Verificar que el target sea un collector del lender
            const { data: targetProfile } = await supabaseAdmin
                .from("profiles")
                .select("role, owner_id")
                .eq("id", user_id)
                .single();

            if (
                !targetProfile ||
                targetProfile.role !== "collector" ||
                targetProfile.owner_id !== caller.id
            ) {
                return new Response(
                    JSON.stringify({ error: "No puedes eliminar este usuario" }),
                    {
                        status: 403,
                        headers: { ...corsHeaders, "Content-Type": "application/json" },
                    },
                );
            }
        } else {
            return new Response(
                JSON.stringify({ error: "No autorizado" }),
                {
                    status: 403,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                },
            );
        }

        const { error } = await supabaseAdmin.auth.admin.deleteUser(user_id);

        if (error) {
            return new Response(
                JSON.stringify({ error: error.message }),
                {
                    status: 400,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                },
            );
        }

        return new Response(
            JSON.stringify({ success: true }),
            {
                status: 200,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
        );
    } catch {
        return new Response(
            JSON.stringify({ error: "Error interno del servidor" }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
        );
    }
});
