import inquirer from "inquirer";
import { getExistingFolders } from "../utils/DownloadUtil.ts";
import { testInvalidFolderName } from "../utils/RegexUtil.ts";
import chalk from "chalk";

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
      key: "reset-database",
      description:
        "Reset all scrapped data and mapping entries from the Database",
    },
    { key: "exit", description: "Exit the application" },
  ];

  async promptNumber({ message, min, max }): Promise<number> {
    const { threshold } = await inquirer.prompt([
      {
        type: "input",
        name: "threshold",
        message,
        validate: (input: string) => {
          const num = parseInt(input.trim());
          if (isNaN(num)) {
            return "Please enter a valid number";
          }
          if (num < min) {
            return `Minimum is: ${min}`;
          }
          if (num > max) {
            return `Maximum is: ${max}`;
          }
          return true;
        },
      },
    ]);

    return parseInt(threshold.trim());
  }

  async promptConfirmation({
    message = "Are you sure you want to perform this action?",
    defaultAnswer = false,
  } = {}): Promise<boolean> {
    const { confirmed } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirmed",
        message,
        default: defaultAnswer,
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
    directory: string,
  ): Promise<{ categoryName: string; folderName: string }> {
    // category
    const selectedCategory = await this.promptCategory(categoryNames);

    // folder
    console.log(`Select a folder for the category: ${selectedCategory}`);
    const folderList = getExistingFolders(directory);
    const selectedFolder = await this.promptFolderList(folderList);
    const folderName = selectedFolder
      ? selectedFolder
      : await this.promptFolderName(
          folderList,
          `Enter the folder name for "${this.markYellow(selectedCategory)}":`,
        );

    // confirmation
    const confirmed = await this.promptConfirmation({
      message: `Confirm mapping category "${this.markYellow(selectedCategory)}" to folder "${this.markGreen(folderName)}"?`,
    });

    if (!confirmed) {
      return this.promptFolderMapping(categoryNames, directory);
    }
    return { categoryName: selectedCategory, folderName };
  }

  private async promptCategory(categories: string[]): Promise<string> {
    // print title
    console.log("");
    console.log(this.generateTitle("Available Categories"));
    categories.forEach((name, index) => {
      console.log(`${index + 1}. ${name}`);
    });
    console.log("");

    // get category
    const categoryChoices = categories.map((name, index) => ({
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
    return selectedCategory;
  }

  private async promptFolderList(folderList: string[]): Promise<null | string> {
    const choices = [
      {
        name: "Create a new folder",
        value: null,
      },
      new inquirer.Separator(this.generateSubTitle("Existing Categories")),
      ...folderList.map((folder) => ({
        name: folder,
        value: folder,
      })),
    ];

    const { selectedOption } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedOption",
        message: "Choose a category:",
        choices,
      },
    ]);
    return selectedOption;
  }

  private async promptFolderName(
    existingFolders: string[],
    message: string,
  ): Promise<string> {
    const { newFolderName } = await inquirer.prompt([
      {
        type: "input",
        name: "newFolderName",
        message,
        validate: (input: string) => {
          // test valid name
          if (!testInvalidFolderName(input)) return "Folder name is invalid";
          // test exists
          const folderExists = existingFolders.some(
            (folder) => folder.toLowerCase() === input.trim().toLowerCase(),
          );
          if (folderExists) {
            return "Folder already exists";
          }

          return true;
        },
      },
    ]);
    return newFolderName.trim();
  }

  private generateTitle(title: string): string {
    return `===== ${title} =====`;
  }
  private generateSubTitle(subTitle: string): string {
    return `----- ${subTitle} -----`;
  }

  private markRed(text: string): string {
    return chalk.redBright(text);
  }

  private markGreen(text: string): string {
    return chalk.greenBright(text);
  }

  private markYellow(text: string): string {
    return chalk.yellowBright(text);
  }
}
