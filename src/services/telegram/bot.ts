import { Telegraf, Markup } from 'telegraf';
import { getDuosDealer } from '../dealer/getDealers';

// Создаем экземпляр бота
const bot = new Telegraf('6708220727:AAGfVxcx6lYVbSkEokgqrmJtCXuq4CDoUNg');

let currentState: string | null = null;

// Приветственное сообщение
bot.start((ctx) => {
    const keyboard = Markup.keyboard([
        ['Авторизоваться', 'Баланс'],
    ]).resize();

    currentState = 'waiting_for_pin';

    // Отправляем сообщение с клавиатурой
    ctx.reply('Привет! Нажми на кнопку:', keyboard);
});

bot.hears('Авторизоваться', (ctx) => {
    if (currentState === 'waiting_for_pin') {
        ctx.reply('Введите номер телефона и пин(ПРИМЕР: 0701800714,2983:)');

        currentState = 'waiting_for_pin_input';
    } else {
        ctx.reply('Пожалуйста, следуйте инструкциям.');
    }
})


bot.on('text', (ctx) => {
    if (currentState === 'waiting_for_pin_input') {
        const pinCode = ctx.message?.text;

        const [phone, id] = pinCode.split(',');
        const dealer = getDuosDealer(parseInt(id, 10), phone);
        // ctx.reply(`Ваш PIN: ${pinCode}`);
        
        currentState = null;
    }
})
// // Обработчик команды /echo
// bot.command('echo', (ctx) => {
//     const message = ctx.message;
//     if (message) {
//         const text = message.text?.replace('/echo', '').trim();
//         if (text) {
//             ctx.reply(text);
//         } else {
//             const userId = ctx.from?.id;
//             ctx.reply(`Ваш ID: ${userId}`);
//         }
//     }
// });

// Обработчик текстовых сообщений
bot.on('text', (ctx) => {
    ctx.reply('Понял ваше сообщение: ' + ctx.message?.text);
});

// Запуск бота
bot.launch().then(() => {
    console.log('Бот запущен');
}).catch(err => {
    console.error('Ошибка запуска бота:', err);
});
