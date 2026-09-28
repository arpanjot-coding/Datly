# Datly

Datly is a local workspace for looking at tables. Load a file or a sample, ask a question in plain language, and read the chart next to the rows it came from. Projects stay on this computer.

![Datly workspace: stock prices, two analysis threads, and the explore canvas](docs/images/workspace.png)

## About

The window has three areas.

- **Project rail.** New project, Docs, Sessions, Data, and Knowledge. The arrow collapses the rail to icons, and the arrow on that rail opens it again.
- **Analysis.** Each question becomes a thread: the words you asked, the chart, and the table behind it. The prompt sits at the bottom.
- **Canvas.** Opens on the right when you look at a chart or a table. Explore, Reports, and Dashboard live on the canvas bar, with Close on the same row.

The interface uses one typeface, Segoe UI, with Roboto Mono for code and identifiers. The mark is a forest-green tile with a rising line.

Sample data ships with the app. **Stock prices** is 6,000 daily rows, 30 September 2024 through 28 September 2026, for 12 large US companies. Columns are date, symbol, company, sector, open, high, low, close, and volume. Prices are adjusted for splits. The source is Yahoo Finance.

## Documentation

The in-app guide is **Docs**, on the left rail and in the top bar outside a workspace.

![Documentation page, with About and the guide sections](docs/images/documentation.png)

The guide covers:

1. **Start a project.** New project clears the screen and leaves the previous session in Sessions.
2. **The three areas.** Threads in the middle, the canvas on the right, the project name in the top bar.
3. **Load a table.** Open Data, expand Sample datasets, select Stock prices, and choose Load. The plus on the rail adds your own file. The plus beside Data Connectors adds a database.
4. **Ask a question.** Name the columns. For the stock table: show closing price by date for Apple and Microsoft. Pick the model on the left of the prompt, then send.
5. **Canvas.** Explore is the plot and the table. Curve, Step, and Points change the mark. Reports keeps writing with the chart. Dashboard collects pinned charts.
6. **Tables.** Data health, search, and the grid are white. Quick chart and Download CSV sit under the rows.
7. **Sessions.** Saved on this computer. Sort by recent edits, creation time, or name. New project does not delete the session you leave.
8. **Knowledge.** Rules the agent follows on later questions.
9. **What stays on this computer.** Connectors copy data into the local workspace. A language model receives small samples with the prompt, not the whole file.

## Run

Requirements: Python 3.11+, Node.js 20+, Yarn, and [uv](https://docs.astral.sh/uv/) or pip.

```bash
yarn
yarn build
uv sync
uv run data_formulator
```

Frontend development, with the backend in one terminal and Vite in another:

```bash
uv run data_formulator --dev
yarn start
```

Then open http://localhost:5173.

On Windows, `local_server.bat` starts the local server. On Unix, `./local_server.sh`.

Copy `.env.template` to `.env` to set language-model keys and server options. Do not commit `.env`.
