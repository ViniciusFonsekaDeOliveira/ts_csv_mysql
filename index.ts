import * as readline from "readline";
import fs from "fs";
import csvParser from "csv-parser";
import { PrismaClient } from "@prisma/client";

function main(): number {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Digite o path do arquivo: ", async (myCsvFile) => {
    console.log(`Processando ${myCsvFile}...`);
    await importAndPersistCsvFile(myCsvFile);
    rl.close();
  });

  return 1;
}

const importAndPersistCsvFile = async (file: string) => {
  const prisma = new PrismaClient();
  const header = "id;firstname;lastname;email;email2;profession";
  const separator = ";";
  await prisma.$connect();
  fs.createReadStream(file)
    .pipe(csvParser())
    .on("data", async (row) => {
      const transaction = row[header].split(separator);
      try {
        await prisma.user.create({
          data: {
            id: Number(transaction[0]),
            firstname: transaction[1],
            lastname: transaction[2],
            email: transaction[3],
            email2: transaction[4],
            profession: transaction[5],
          },
        });
      } catch (err) {
        console.log(
          "Ocorreu um erro desconhecido durante a persistência do arquivo.",
          err
        );
      }
    })
    .on("end", async () => {
      console.log("Arquvio csv importado e persistido com sucesso!");
      await prisma.$disconnect();
    });
};

main();
