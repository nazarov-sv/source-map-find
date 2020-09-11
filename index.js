"use strict";
const fs = require("fs");
const sourceMap = require("source-map");
const program = require("commander");

const TMP_FILE_NAME = "source-map.json";

console.log(process.argv);

program
  .version("1.0.0")
  .option("-m, --source-map <path>", "The source map")
  .option("-l, --line <n>", "The line number in the generated source", parseInt)
  .option(
    "-c, --column <n>",
    "The column number in the generated source",
    parseInt
  )
  .parse(process.argv);

const http =
  program.sourceMap.indexOf("https") === -1
    ? require("http")
    : require("https");

const file = fs.createWriteStream(TMP_FILE_NAME);

http.get(`${program.sourceMap}.map`, (response) => {
  const stream = response.pipe(file);

  stream.on("finish", async () => {
    const consumer = await new sourceMap.SourceMapConsumer(
      JSON.parse(fs.readFileSync(TMP_FILE_NAME))
    );

    const originalPosition = consumer.originalPositionFor({
      line: program.line,
      column: program.column,
    });

    console.table(originalPosition);

    fs.unlinkSync(TMP_FILE_NAME);
  });
});

process.on("uncaughtException", function (err) {
  console.error("Process crashed with error");
  console.error(err);
});
