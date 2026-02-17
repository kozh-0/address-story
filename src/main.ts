import "dotenv/config";
import { Telegraf } from "telegraf";
import botInteractor from "./botInteractor";
const bot = new Telegraf(process.env.TG_KEY!, { handlerTimeout: 50000 });

(async function () {
  console.log(new Date().toLocaleString("ru-RU", { timeZone: "Asia/Yekaterinburg" }), "Launched!");
})();

botInteractor(bot);

bot
  .launch()
  .then(() => {
    console.log(
      "Запуск бота успешен!",
      new Date().toLocaleString("ru-RU", { timeZone: "Asia/Yekaterinburg" }),
    );
  })
  .catch((err) => {
    console.log(
      "ERR: Bot Launch:",
      new Date().toLocaleString("ru-RU", { timeZone: "Asia/Yekaterinburg" }),
      JSON.stringify(err, null, 2),
    );
  });
