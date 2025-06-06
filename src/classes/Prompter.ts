import inquirer from "inquirer";

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
        message: "=== Main Menu ===",
        choices,
      },
    ]);

    return selectedOption;
  }
}
