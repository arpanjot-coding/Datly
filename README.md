# Datly

Datly is a workspace for a table you already have. You load the rows, you write the question in ordinary language, and the chart opens beside the rows it was drawn from.

This page is the illustrated overview. The pictures are the running app. Each one is described underneath.

## About

A spreadsheet can hold the numbers and still hide the comparison. Datly keeps the question, the chart, and the table in one place. The project stays on this computer. A language model sees a small sample with the prompt, not a copy of the file uploaded to a hosted notebook.

The window is three regions. The left card is the project: a new workspace, the documentation, saved sessions, the tables, and the rules the agent should follow. The middle is the analysis. Each question becomes a thread, and the prompt that asks the next question stays at the bottom. The right side is the canvas. It appears when a chart or a table is opened, and it closes from the same bar that holds Explore, Reports, and Dashboard.

The mark in the header is a forest-green tile with a rising line. The type is Segoe UI. Code and identifiers use Roboto Mono.

The sample that ships with the app is **Stock prices**: 6,000 daily rows, 30 September 2024 through 28 September 2026, twelve large US companies. The columns are date, symbol, company, sector, open, high, low, close, and volume. Prices are adjusted for splits, so a line does not jump when the shares split. The source is Yahoo Finance.

## The window, as it is open on a stock project

The picture is one session, named Stock Prices. Sample datasets is connected, Stock prices is ticked as loaded, two questions have already been asked, and the canvas is showing the second of them.

![The Datly window: project rail, two analysis threads, and the Explore canvas for Alphabet and Microsoft](docs/images/workspace.png)

On the left, **+ New project** is the green pill. It clears the screen and starts an empty workspace. The session you leave is not deleted. It remains under Sessions. **Docs** opens the guide. The arrow to the right of Docs collapses this card to a thin rail of icons, and the arrow on that rail opens the card again.

Under those buttons, **Sessions**, **Data**, and **Knowledge** switch the body of the card. Data is the one selected here. The title is Data Connectors. The plus beside that title adds a database connection. The pin keeps the card open. Search filters the list. **Sample datasets** is marked Active. Under it, **Stock prices** has a tick, which means those rows are already in this project. A circle beside the tick refreshes the table.

The middle begins with the Datly mark and the name. **Stock Prices**, in the top bar, is the project menu. That is where the workspace is renamed. **Analysis** says there are two threads. Thread 1 is `stock-metr`. Thread 2, drawn in green, is `stock-close1`, and that is the thread the canvas is showing.

Thread 1 is the column of cards. `stock-close` is a small chart of several symbols. Under it is the question that asked for 20-day and 60-day moving averages of close, by symbol. `stock-ma` is that result. The next question asked for daily return, 20-day volatility, and volume. `stock-metr` is the chart of those series, the noisy lines at the bottom of the column. A thread is the record of one question: the words, the table it used, and the chart that came back.

The white box at the bottom of the middle is the prompt. It is aimed at `@stock-hist`, the history table. The placeholder reads “Ask questions or describe what to explore.” The model on this session is Claude Sonnet 4. The arrow sends the question. The pencil and the bulb beside it are the other actions on that box. There is no fade painted behind the prompt. The sage field of the window shows through.

The right side is the canvas. **Explore** is selected. **Reports (1)** is the written report already saved for this project. **Dashboard** is where charts are pinned. The cross on that same bar closes the canvas, and the threads then use the full width. The plot is closing price. The green line is GOOGL. It starts near 190 in early August and finishes near 330 in January. The orange line is MSFT. It stays between about 450 and 530, with a high in late October and a lower close in January. The dates along the bottom run from 3 August to 18 January. **Curve**, **Step**, and **Points** change the mark. The bin deletes the focused chart. Under the plot, the line “AI generated results can be inaccurate, inspect it!” is the reminder to read the table, not only the line.

The table under the chart is the rows the line was drawn from. The columns in view are the row number, date, symbol, and close. The first rows are GOOGL: 31 July 2025 at 191.6, 1 August at 188.84, then 194.74, 194.37, 195.79, and on upward through December. The header of that grid is white, the same as the card, so it sits clear of the sage field. Quick chart and Download CSV sit under the rows when the table is the thing in focus, so they do not cover the cells.

## The same canvas, closer

This is the right-hand side of that window, cropped so the plot and the grid can be read.

![Explore canvas: GOOGL rising, MSFT near 500, and the close table underneath](docs/images/canvas.png)

Explore is the view for checking a result. The plot is on top. The table is on the bottom. They are the same answer. GOOGL’s close on 31 July 2025 is 191.6, and the green line leaves the axis at about that height. By 13 August the table shows 201.65, and the line has stepped up. MSFT is the orange line that never comes down to meet it. The legend is at the top right of the plot.

Curve is the smooth join between points. Step would draw the close as a staircase, one value until the next date. Points would mark each day without insisting on a line. The switch beside Points turns that layer on. The dates are trading days, so the axis skips weekends. The table is scrolled to the start of the series. Later rows continue the same three columns for both symbols.

A report, the item counted as Reports (1), keeps writing next to a chart. The dashboard is the place those charts are pinned when more than one should stay visible. Closing the canvas does not delete the thread. The chart card remains in the middle, and the canvas can be opened from it again.

## The guide

Docs is a page in the app, not a separate site. It opens from the left rail, and from the top bar when you are not inside a workspace.

![The documentation page, opened from Docs, beginning with how to start a project](docs/images/documentation.png)

The mark and the word Documentation are at the top. The sentence under them is the order of the page: open a project, bring in a table, ask for a chart, read the result. **Open workspace** returns to the window in the first picture. **Watch a short tour** plays the overview video further down the page.

The pills are the sections, in the order a first session uses them.

**Start a project.** New project clears what is on screen. The session you were in remains under Sessions. The arrow beside Docs collapses the rail. On the thin rail the arrow expands it. The folder is Sessions, the database is Data, the bulb is Knowledge, and the plus adds a file.

**The three areas.** The middle holds the threads. The prompt stays at the bottom of that area. The canvas is the right side, and it is absent until a chart or a table is opened. The project name in the top bar is the rename menu.

**Load a table.** Data, then Sample datasets, then Stock prices, then Load. The page states the size of that file: 6,000 rows, 30 September 2024 through 28 September 2026, twelve companies, and the column list above. A file of your own uses the plus on the rail, or Add more data inside a thread. A database uses the plus beside Data Connectors.

**Ask a question.** The model menu is the control on the left of the prompt. The arrow sends. A question that names the columns is the one the page suggests for this table: closing price by date for Apple and Microsoft. That is the question behind the orange and green lines in the first picture. A follow-up is typed into the same prompt. With the canvas open, the threads sit in two columns so the cards are not cut off at the edge.

**Canvas.** Explore, Reports, and Dashboard, and Close on that bar. Curve, Step, and Points are the mark controls in the picture above.

**Tables.** Data health, search, and the grid are white. Search filters the rows on screen. Download CSV saves the table you are viewing.

**Sessions.** One session is one workspace: its tables, threads, charts, and reports, stored on this computer. The list sorts by recent edits, by creation time, or by name.

**Knowledge.** Rules for the agent, opened from the bulb. They apply to later questions in that workspace.

**What stays on this computer.** Connectors copy data into the local workspace. The model receives a sample with the prompt.

Under the sections, the tour video plays in the page.

## How to run

Python 3.11 or newer, Node.js 20 or newer, Yarn, and [uv](https://docs.astral.sh/uv/) or pip.

```bash
yarn
yarn build
uv sync
uv run data_formulator
```

For interface work, run the API in one terminal and Vite in another.

```bash
uv run data_formulator --dev
yarn start
```

Open http://localhost:5173. On Windows, `local_server.bat` starts the local server. On Unix, `./local_server.sh`.

Copy `.env.template` to `.env` for language-model keys and server options. `.env` is not part of this repository.
