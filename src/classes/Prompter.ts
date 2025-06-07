import inquirer from "inquirer";
import { testInvalidFileName } from "../utils/RegexUtil.ts";

export default class Prompter {
  private readonly menuOptions: PromptOption[] = [
    {
      key: "scrape-new",
      description:
        "Scrape new data only - stops when duplicate data is encountered",
    },
    {
      key: "scrape-all",
      description: "Scrape thoroughly - continues even if data exists",
    },
    {
      key: "failed-records",
      description: "Display entries failed to scrape",
    },
    {
      key: "show-duplicates",
      description: "Display duplicate scraped data entries",
    },
    {
      key: "reset-database",
      description:
        "Reset all scrapped data and mapping entries from the Database",
    },
    { key: "exit", description: "Exit the application" },
  ];

  async promptConfirmation(): Promise<boolean> {
    const { confirmed } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirmed",
        message: "Are you sure you want to perform this action?",
        default: false,
      },
    ]);

    return confirmed;
  }

  async promptMainMenu(): Promise<PromptKey> {
    const choices = this.menuOptions.map((option, index) => ({
      name: `${index + 1}. ${option.description}`,
      value: option.key,
    }));

    const { selectedOption } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedOption",
        message: this.generateTitle("Main Menu"),
        choices,
      },
    ]);

    return selectedOption;
  }

  async promptFolderMapping(
    categoryNames: string[],
  ): Promise<{ dataKey: string; folderName: string }> {
    // print title
    console.log("");
    console.log(this.generateTitle("Available Categories"));
    categoryNames.forEach((name, index) => {
      console.log(`${index + 1}. ${name}`);
    });
    console.log("");

    // get category
    const categoryChoices = categoryNames.map((name, index) => ({
      name: `${index + 1}. ${name}`,
      value: name,
    }));
    const { selectedCategory } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedCategory",
        message: "Select which category to map to a folder:",
        choices: categoryChoices,
      },
    ]);

    // get folder name
    const { folderName } = await inquirer.prompt([
      {
        type: "input",
        name: "folderName",
        message: `Enter the folder name for "${selectedCategory}":\n`,
        validate: (input: string) => {
          if (!testInvalidFileName(input)) return "Folder name is invalid";
          if (input.trim().length === 0) return "Folder name cannot be empty";
          return true;
        },
      },
    ]);

    return { dataKey: selectedCategory, folderName: folderName.trim() };
  }

  private generateTitle(title: string): string {
    return `===== ${title} =====`;
  }
}
