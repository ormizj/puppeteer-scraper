import Database from "../classes/Database.ts";
import chalk from "chalk";

export default async () => {
  const db = new Database();
  const failedRecords = db.getAllFailedRecords();

  printContainer();
  printText("redBright", "🚫", "Failed Records Summary");
  printSpacer();
  failedRecords.forEach((record, index) => {
    printText("yellowBright", "#️⃣", `${index + 1}`);
    printText("greenBright", "🆔", `ID: ${record.id}`);
    printText("blueBright", "📅", `Created: ${record.created_at}`);
    printText("cyanBright", "🔗", `URL: ${record.uid}`);
    printText("magentaBright", "💬", `Reason: ${record.failed_reason}`);
    printSpacer();
  });
  printText("redBright", "📊", `Total failed records: ${failedRecords.length}`);
  printContainer();

  db.close();
};

const printText = (
  color: keyof typeof chalk,
  icon: string | number,
  text: string | number,
) => {
  const chalkColor = chalk[color];
  if (typeof chalkColor !== "function") return;
  console.log(chalkColor[color](`  ${icon}  ${text}`));
};

const printSpacer = () => {
  console.log(chalk.blackBright("─".repeat(100)));
};

const printContainer = () => {
  console.log(chalk.whiteBright("─".repeat(100)));
};
