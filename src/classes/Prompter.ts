import inquirer from "inquirer";
import { getExistingFolders } from "../utils/downloadUtil.ts";
import { testInvalidFolderName } from "../utils/regexUtil.ts";
import chalk from "chalk";
import { EnvConfig } from "../services/EnvConfig.ts";

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
      key: "scrape-all-skip",
      description:
        "Scrape thoroughly - continues even if data exists (downloads with missing data, without confirmation)",
    },
    {
      key: "update-folder-name",
      description: "Update an existing folder's name",
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
  ): Promise<{ categoryName: string | null; folderName: string | null }> {
    // category
    const selectedCategory = await this.promptCategory(categoryNames);

    // if no category selected, return
    if (selectedCategory === null) return null;

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

  private async promptCategory(categories: string[]): Promise<string | null> {
    // print title
    console.log("");
    console.log(this.generateTitle("Available Categories"));
    categories.forEach((name, index) => {
      console.log(`${index + 1}. ${name}`);
    });
    console.log("");

    // get categories
    const categoryChoices = [
      // select category
      new inquirer.Separator(this.generateSubTitle("Available Categories")),
      ...categories.map((name, index) => ({
        name: `${index + 1}. ${name}`,
        value: name,
      })),
      // skip category mapping
      new inquirer.Separator(this.generateSubTitle("Skip Category Mapping")),
      {
        name: `${EnvConfig.APP_UNCATEGORIZED_FOLDER_NAME()} (no category mapping)`,
        value: null,
      },
    ];

    // l
    const { selectedCategory } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedCategory",
        message: "Select which category to map to a folder:",
        choices: categoryChoices,
      },
    ]);

    if (selectedCategory === null) {
      const confirmed = await this.promptConfirmation({
        message: `Confirm using folder "${this.markYellow(EnvConfig.APP_UNCATEGORIZED_FOLDER_NAME())}", without category mapping?`,
      });

      if (!confirmed) {
        return await this.promptCategory(categories);
      }
    }

    return selectedCategory;
  }

  async promptFolderList(
    folderList: string[],
    newFolderOption = true,
  ): Promise<null | string> {
    // filter default download location
    const filteredFolders = folderList.filter(
      (folder) => folder !== EnvConfig.APP_UNCATEGORIZED_FOLDER_NAME(),
    );

    const choices = [];
    if (newFolderOption) {
      choices.push(
        new inquirer.Separator(this.generateSubTitle("New Folder")),
        {
          name: "Create a new folder",
          value: null,
        },
        new inquirer.Separator(this.generateSubTitle("Existing Folders")),
      );
    }
    choices.push(
      ...filteredFolders.map((folder) => ({
        name: folder,
        value: folder,
      })),
    );

    const { selectedOption } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedOption",
        message: "Choose a folder:",
        choices,
      },
    ]);
    return selectedOption;
  }

  async promptFolderName(
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

  async promptForceDownload(data: Partial<ElementData>): Promise<boolean> {
    // print object
    console.log("");
    console.log(this.generateTitle("Current Data"));
    console.dir(data, { depth: null, colors: true });
    console.log("");

    // first confirmation
    const firstConfirmed = await this.promptConfirmation({
      message: `The element has missing data. Do you still want to save it?`,
    });
    if (!firstConfirmed) return false;

    // second confirmation
    return await this.promptConfirmation({
      message: `${this.markRed("Final confirmation:")} are you sure you want to save incomplete data into "${this.markYellow(EnvConfig.APP_UNCATEGORIZED_FOLDER_NAME())}" folder?`,
    });
  }

  generateTitle(title: string): string {
    return `===== ${title} =====`;
  }
  generateSubTitle(subTitle: string): string {
    return `----- ${subTitle} -----`;
  }

  markRed(text: string): string {
    return chalk.redBright(text);
  }

  markGreen(text: string): string {
    return chalk.greenBright(text);
  }

  markYellow(text: string): string {
    return chalk.yellowBright(text);
  }
}
