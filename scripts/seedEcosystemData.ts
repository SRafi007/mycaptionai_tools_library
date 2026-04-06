import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Seeding Anthropic Ecosystem with tools and a playbook...");

    // 1. Get Anthropic Ecosystem
    const { data: anthropicEco, error: ecoError } = await supabase
        .from('ecosystems')
        .select('*')
        .eq('slug', 'anthropic')
        .single();
        
    if (ecoError || !anthropicEco) {
        console.error("Anthropic ecosystem not found. Please run the ecosystem seed first.");
        return;
    }

    // 2. Get some top tools
    const { data: tools } = await supabase
        .from('tools')
        .select('id, name')
        .eq('status', 'active')
        .order('rating_score', { ascending: false })
        .limit(10);

    if (!tools || tools.length === 0) {
        console.error("No active tools found in your DB to link!");
        return;
    }
    
    console.log(`Found ${tools.length} available tools. Inserting to the Anthropic Hub...`);

    // 3. Link Tools to Ecosystem
    const ecoTools = tools.slice(0, 5).map(tool => ({
        ecosystem_id: anthropicEco.id,
        tool_id: tool.id,
        role_category: "Developer Extension" // Fallback
    }));
    ecoTools[0].role_category = "Official UI Wrapper";
    ecoTools[1].role_category = "Agent Framework";

    for (const et of ecoTools) {
        // Try insert, ignore if it already exists (Unique constraint violation)
        const { error } = await supabase.from('ecosystem_tools').insert(et);
        if (error && error.code !== '23505') { // 23505 is PostgreSQL unique violation code
            console.error(`Error inserting tool ${et.tool_id}:`, error.message);
        }
    }

    // 4. Create a Playbook
    let playbookId;
    const { data: existingPlaybook } = await supabase
        .from('playbooks')
        .select('*')
        .eq('slug', 'claude-coding-stack')
        .single();

    if (existingPlaybook) {
        console.log("Playbook 'claude-coding-stack' already exists, using its ID.");
        playbookId = existingPlaybook.id;
    } else {
        const { data: newPlaybook, error: pError } = await supabase
            .from('playbooks')
            .insert({
                title: 'The Ultimate Claude Coding Stack',
                slug: 'claude-coding-stack',
                description: 'Leverage Anthropic’s powerful Sonnet 5 model alongside the best autonomous agent frameworks and IDE integrations to ship code 10x faster.',
                ecosystem_id: anthropicEco.id,
                is_published: true
            })
            .select('*')
            .single();

        if (pError || !newPlaybook) {
            console.error("Error creating Playbook:", pError);
            return;
        }
        playbookId = newPlaybook.id;
        console.log("Playbook created successfully.");
    }

    // 5. Add Tools to Playbook Workflow
    // Wipe existing first to avoid duplicate step issues for this test script
    await supabase.from('playbook_tools').delete().eq('playbook_id', playbookId);

    const playbookTools = tools.slice(0, 3).map((tool, index) => ({
        playbook_id: playbookId,
        tool_id: tool.id,
        step_order: index + 1,
        step_description: `Step ${index + 1}: Utilize ${tool.name} for handling the ${index === 0 ? 'orchestration' : index === 1 ? 'generation' : 'refactoring'} phase of the workflow.`
    }));

    const { error: ptError } = await supabase.from('playbook_tools').insert(playbookTools);
    if (ptError) {
        console.error("Error inserting playbook tools:", ptError);
    } else {
        console.log("Successfully seeded Anthropic tools and the Playbook workflow!");
    }
}

run();
