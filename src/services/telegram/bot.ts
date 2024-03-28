import { Telegraf, Markup, session } from "telegraf";
import { getBalance, getDealerByPhone, helloMessage, testBot } from "../dealer/getDealers";
import * as dotenv from "dotenv";
import { getAbsolutePath } from "../../utils/pathUtils";
import sequelize from "../../../config/sequelize";

const bot = new Telegraf(testBot);

bot.start((ctx) => {
  ctx.replyWithHTML(helloMessage, { parse_mode: 'HTML' });
  ctx.reply(
    "Привет! Пожалуйста, отправьте свой номер телефона для авторизации.",
    {
      reply_markup: {
        keyboard: [
          [{ text: "Отправить номер телефона", request_contact: true }],
        ],
        one_time_keyboard: true,
        resize_keyboard: true,
      },
    }
  );
});

bot.on("contact", async (ctx) => {
  const contact = ctx.message?.contact;

  if (contact) {
    const phoneNumber = contact.phone_number;
    const userId = ctx.from?.id;

    const dealer = await getDealerByPhone(phoneNumber, userId);

    if (dealer) {
      const authenticatedKeyboard = Markup.keyboard([["Баланс"]]).resize();

      ctx.reply(`Выберите действие:`);

      ctx.reply("Вы успешно прошли авторизацию!", authenticatedKeyboard);
    } else {
      ctx.replyWithHTML(
        `Вы не прошли авторизацию!\n\nВозможно у вас неправильно введен ваш номер телефона! Обратитесь к вашему менеджеру!`
      );
    }
  } else {
    ctx.reply("Что-то пошло не так. Пожалуйста, попробуйте еще раз.");
  }
});

//получить баланс
bot.hears("Баланс", async (ctx) => {
  const userId = ctx.from?.id;
  const dealer = await getBalance(userId);

  ctx.reply(dealer);
});

bot
  .launch()
  .then(() => {
    console.log("Бот запущен");
  })
  .catch((err) => {
    console.error("Ошибка запуска бота:", err);
  });
