# Online Library - Frontend (Next.js + TypeScript)

## Overview
This is the frontend of the Online Library application, built with **Next.js** and **TypeScript**. It provides an interactive UI for browsing, editing and deleting books, as well as generating AI-powered insights.

## Prerequisites
- **Node.js** (Recommended version: `18.x` or higher)
- **npm** (or `yarn`/`pnpm` as package managers)
- A running backend instance (`http://localhost:8080` by default)

## Installation
Clone the repository and navigate to the frontend folder:
```sh
git clone https://github.com/user/online-library.git
cd online-library/frontend```

Install dependencies:
npm install

Running the Application
npm run dev

The application will be available at: http://localhost:3000

Running Tests (Playwright)
npx playwright install

npx playwright test

To run tests with a visible browser:
npx playwright test --headed
