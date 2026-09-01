import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "../src/lib/prisma";
import { parseAdjustmentXml } from "../src/lib/adjustment-import";

const defaultFolder = path.resolve(process.cwd(), "..", "fichier_calibrage_etalonnage");

async function main() {
  const folder = process.argv[2] ? path.resolve(process.argv[2]) : defaultFolder;
  const entries = await readdir(folder, { withFileTypes: true });
  const xmlFiles = entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".xml"))
    .map((entry) => entry.name);

  if (xmlFiles.length === 0) {
    console.log(`Aucun fichier XML trouvé dans ${folder}`);
    return;
  }

  console.log(`Import de ${xmlFiles.length} fichier(s) depuis ${folder}`);

  for (const fileName of xmlFiles) {
    const fullPath = path.join(folder, fileName);
    const buffer = await readFile(fullPath);
    const xml = buffer.toString("latin1");
    const parsed = parseAdjustmentXml(xml, fileName);

    const created = await prisma.t_ajustage.create({ data: parsed.data });
    console.log(
      `? ${fileName} -> Id_Ajustage=${created.Id_Ajustage} Sonde=${parsed.summary.sensor ?? "-"}`,
    );
  }
}

main()
  .catch((error) => {
    console.error("Erreur import ajustage:", error);
    process.exit(1);
  })
  .finally(async () => {
    await (prisma as any).$disconnect?.();
  });
