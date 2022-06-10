const { Telegraf, Markup } = require('telegraf')
const {front, back, design, dados, categorias, web, games, hacking, mobile} = require('./listas')

const token = process.env.BOT_TOKEN
if (token === undefined) {
  throw new Error('BOT_TOKEN must be provided!')
}

const bot = new Telegraf(token)

bot.command('start', (ctx) => {
  return ctx.reply('<b>Escolha uma categoria:\n</b>', {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard(categorias.map(item => Markup.button.callback(item, item)), {columns: 2})
  })
})

bot.action('Desenvolvimento Web', (ctx, next) => {
  return ctx.reply('<b>Cursos Desenvolvimento Web:</b>', {parse_mode: 'HTML',
  ...Markup.inlineKeyboard(
    web.map(item => Markup.button.callback(item.name, item.url)), {columns: 1}
  )})
})

bot.action('Ui/Ux Design', (ctx) => {
  return ctx.reply('<b>Cursos Ui/Ux Design:</b>', {parse_mode: 'HTML', 
  ...Markup.inlineKeyboard(design.map(item => Markup.button.url(item.name, item.url)), {columns: 1})})
})

bot.action('Front', (ctx) => {
  return ctx.reply('<b>Cursos Front End:</b>', {parse_mode: 'HTML', 
  ...Markup.inlineKeyboard(front.map(item => Markup.button.url(item.name, item.url)), {columns: 1})})
})

bot.action('Back', (ctx, next) => {
  return ctx.reply('<b>Cursos Back End:</b>', {parse_mode: 'HTML', 
  ...Markup.inlineKeyboard(back.map(item => Markup.button.url(item.name, item.url)), {columns: 1})})
})

bot.action('Data science & afins', (ctx, next) => {
  return ctx.reply('<b>Cursos Data Science:</b>', {parse_mode: 'HTML', 
  ...Markup.inlineKeyboard(dados.map(item => Markup.button.url(item.name, item.url)), {columns: 1})})
})

bot.action('Games', (ctx, next) => {
  return ctx.reply('<b>Cursos Games:</b>', {parse_mode: 'HTML', 
  ...Markup.inlineKeyboard(games.map(item => Markup.button.url(item.name, item.url)), {columns: 1})})
})

bot.action('Hacking', (ctx, next) => {
  return ctx.reply('<b>Cursos Hacking:</b>', {parse_mode: 'HTML', 
  ...Markup.inlineKeyboard(hacking.map(item => Markup.button.url(item.name, item.url)), {columns: 1})})
})

bot.action('Mobile', (ctx, next) => {
  return ctx.reply('<b>Cursos Mobile:</b>', {parse_mode: 'HTML', 
  ...Markup.inlineKeyboard(mobile.map(item => Markup.button.url(item.name, item.url)), {columns: 1})})
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))