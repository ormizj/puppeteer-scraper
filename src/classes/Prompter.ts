import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";

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
    return new Promise((resolve) => {
      setTimeout(async () => {
        const rl = this.initializeReadline();

        console.log(`\nAre you sure you want to preform this action?`);
        const answer = await this.getUserInput(rl, 'Type "yes" to confirm:\n');
        rl.close();

        const isConfirmed = answer.trim().toLowerCase() === "yes";
        resolve(isConfirmed);
      });
    });
  }

  async promptMainMenu(): Promise<PromptKey> {
    return new Promise((resolve) => {
      setTimeout(async () => {
        this.printMenu();
        const rl = this.initializeReadline();
        const answer = await this.getAnswer(rl);
        rl.close();

        // check if answer valid
        try {
          this.validateAnswer(answer);
          resolve(this.menuOptions[answer].key);
        } catch (e) {
          const error = e as Error;
          console.log(error.message);
          resolve(await this.promptMainMenu());
        }
      });
    });
  }

  private validateAnswer(selectedIndex: number) {
    if (
      isNaN(selectedIndex) ||
      selectedIndex < 0 ||
      selectedIndex > this.menuOptions.length - 1
    ) {
      throw new Error("Invalid selection. Please try again");
    }
  }

  /**
   * @param rl
   * @private
   * @return {Promise} containing the index of the selected option
   */
  private async getAnswer(rl: readline.Interface): Promise<number> {
    let initialAnswer = await this.getUserInput(
      rl,
      `Please select an option (1-${this.menuOptions.length}): `,
    );
    return parseInt(initialAnswer.trim()) - 1;
  }

  private printMenu() {
    console.log("");
    console.log("");
    console.log("=== Main Menu ===");
    console.log("");
    this.menuOptions.forEach((option, index) => {
      console.log(`${index + 1}. ${option.description}`);
    });
    console.log("");
  }

  private initializeReadline() {
    return readline.createInterface({
      input,
      output,
    });
  }

  private async getUserInput(
    rl: readline.Interface,
    question: string,
  ): Promise<string> {
    const answer = await rl.question(`${question}\n`);
    console.log("");
    return answer;
  }
}
