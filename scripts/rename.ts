// Usage: npx ts-node scripts/rename.ts "BusinessName" "domain.com.au"
// Updates SITE_NAME and SITE_DOMAIN in src/data/site.ts
// The entire website updates because all components import from site.ts
import { readFileSync, writeFileSync } from "fs";

const [, , name, domain] = process.argv;
if (!name || !domain) {
  console.error('Usage: npx ts-node scripts/rename.ts "Name" "domain.com.au"');
  process.exit(1);
}

const path = "src/data/site.ts";
let content = readFileSync(path, "utf-8");
content = content.replace(/SITE_NAME\s*=\s*"[^"]*"/, `SITE_NAME        = "${name}"`);
content = content.replace(/SITE_DOMAIN\s*=\s*"[^"]*"/, `SITE_DOMAIN      = "https://${domain}"`);
content = content.replace(/SITE_EMAIL\s*=\s*"[^"]*"/, `SITE_EMAIL       = "info@${domain}"`);
writeFileSync(path, content);
console.log(`✅ Business renamed to "${name}" with domain "${domain}"`);
console.log(`   Now run: git add . && git commit -m "Rename to ${name}" && git push`);
