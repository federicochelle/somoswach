const supabaseUrl = "https://hsapmzxdgvseogvnmatd.supabase.co";
const supabaseKey = "sb_publishable_uYcFqUk1SB763xoJLgKzhQ_-ZFFWUHY";

window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

async function testSupabase() {
  const { data, error } = await window.supabaseClient
    .from("projects")
    .select("*");

  console.log("PROJECTS:", data);
  console.log("ERROR:", error);
}

testSupabase();
