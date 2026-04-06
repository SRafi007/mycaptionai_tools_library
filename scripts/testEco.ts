import { getEcosystemBySlug } from "../lib/db/ecosystems";

async function test() {
    console.log("Fetching Anthropic ecosystem...");
    const data = await getEcosystemBySlug("anthropic");
    console.log(JSON.stringify(data, null, 2));
}

test();
