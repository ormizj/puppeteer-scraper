import * as readline from "readline";

export default class Prompter {
  private readonly menuOptions: MenuOption[] = [
    { key: "scrape", description: "Start web scraping process" },
    {
      key: "show-duplicates",
      description: "Display duplicate scraped data entries",
    },
    { key: "exit", description: "Exit the application" },
  ];

  async promptMainMenu(): Promise<PromptOption> {
    // initialize readline
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // print menu
    console.log("\n=== Main Menu ===");
    this.menuOptions.forEach((option, index) => {
      console.log(`${index + 1}. ${option.description}`);
    });

    // get answer
    const answer = await this.getUserInput(
      rl,
      "Please select an option (1-3): ",
    );
    rl.close();

    // check if answer valid
    const selectedIndex = parseInt(answer.trim()) - 1;
    if (selectedIndex >= 0 && selectedIndex < this.menuOptions.length) {
      return this.menuOptions[selectedIndex].key;
    } else {
      console.log("Invalid selection. Please try again");
      return await this.promptMainMenu();
    }
  }

  private getUserInput(
    rl: readline.Interface,
    question: string,
  ): Promise<string> {
    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        resolve(answer);
      });
    });
  }
}
