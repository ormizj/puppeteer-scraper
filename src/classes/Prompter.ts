import inquirer from "inquirer";
import { testInvalidFileName } from "../utils/RegexUtil.ts";

export default class Prompter {
  private readonly menuOptions: PromptOption[] = [
    { key: "scrape", description: "Start web scraping process" },
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
      description: "Reset all scrapped data entries from the Database",
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

  async promptCategory(
    names: string[],
    fallbackCategory: string,
  ): Promise<string> {
    // print title
    console.log("");
    console.log(this.generateTitle("Names"));
    names.forEach((name, index) => {
      console.log(`${index + 1}. ${name}`);
    });
    console.log("");

    // prompt user
    const choices = [
      {
        name: `Use default category: "${fallbackCategory}"`,
        value: fallbackCategory,
      },
      {
        name: "Create new category",
        value: "new-category",
      },
    ];
    const { categoryChoice } = await inquirer.prompt([
      {
        type: "list",
        name: "categoryChoice",
        message: "No matching category found. What would you like to do?",
        choices,
      },
    ]);

    // fallback category
    if (categoryChoice !== "new-category") return categoryChoice;

    // new category
    const { newCategoryName } = await inquirer.prompt([
      {
        type: "input",
        name: "newCategoryName",
        message: "Enter the name of the new category:",
        validate: (input: string) => {
          if (!testInvalidFileName(input)) return "Category name is invalid";
          return true;
        },
      },
    ]);
    return newCategoryName.trim();
  }

  private generateTitle(title: string): string {
    return `===== ${title} =====`;
  }
}
