# Puppeteer Scraper

A TypeScript-based web scraper built with Puppeteer for automated content downloading from websites.

## Features

- Automated login and navigatio
- Content downloading and organization
- SQLite database integration
- Environment-based configuration
- Debug mode support

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and configure your settings:
   ```bash
   cp .env.example .env
   ```

## Configuration

Edit the `.env` file with your website credentials and preferences:

- `APP_WEBSITE_URL`: Target website URL
- `APP_WEBSITE_USERNAME`: Your username
- `APP_WEBSITE_PASSWORD`: Your password
- `APP_DOWNLOAD_PATH`: Local download directory
- `APP_DEBUG`: Enable/disable debug mode

## Usage

Run the scraper:
```npm start```

Run sandbox mode for testing:
```npm run sandbox```

## Tech Stack

- TypeScript
- Puppeteer
- SQLite (better-sqlite3)
- Node.js