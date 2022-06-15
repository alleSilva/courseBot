const { Telegraf, Markup } = require('telegraf')
const {session} = require('telegraf')
const db = require('./db') //selectCategorias, selectSubCategoria, selectCursos
const {catObj, front, back, design, dados, categorias, web, games, hacking, mobile, full_stack, subcategoria,cursos, categorias_subs} = require('./listas')

const token = process.env.BOT_TOKEN
if (token === undefined) {
  throw new Error('BOT_TOKEN must be provided!')
}

const bot = new Telegraf(token)
bot.use(session())

bot.command('start', async (ctx, next) => {
  //console.log(categorias_subs)
  ctx.session = {
    categorias: [],
    sub: [],
    current_cat: 0,
    current_sub: 0
  }

  categorias.then(res => ctx.session.categorias = res)
  //subcategoria.then(res => console.log(res))
  //cursos.then(res => console.log(res))
  return await ctx.reply('<b>Boas Vindas!</b>', {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard([
      Markup.button.url('🤑 Fazer doação', 'https://t.me/+JK7wnzLtPA1jZTVh'),
      Markup.button.callback('▶️ Continuar', 'continuar')
    ])
  })
})
//-1001505347688
//-1001691603480

/*   bot.action('continuar2', (ctx, next) => {
    lista.then(lst => {
      console.log(lst)
      return ctx.reply('<b>Escolha uma categoria:\n</b>', {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard(lst.map(item => Markup.button.callback(item.nome, 'encaminha')), {columns: 2})
    })})
  }) */

  bot.action('encaminha', (ctx) => {
    lista.then(lst =>  ctx.telegram.forwardMessage(ctx.chat.id, -1001691603480, lst[0].mid))
    })

bot.action('continuar', async (ctx) => {
  ctx.session.sub = ctx.session.categorias.map(async item => {
    const sub = db.selectSubCategoria(item.id)
    return await sub.then(r => catObj(item.id, item.categoria, r))
  })
  return await ctx.reply('<b>Escolha uma categoria:\n</b>', {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard(ctx.session.categorias.map(item => Markup.button.callback(item.categoria, `cat ${item.id}`)), {columns: 2})
  })
   }
)
//Markup.button.callback(item.categoria, `sub ${r.id}`)
bot.action(/cat (.+)/, (ctx) => {
  const option = ctx.match[1]
  ctx.session.current_cat = option
  ctx.session.sub.map(r => r.then(x => {if (x.id == option) {
    ctx.reply(`<b>Cursos ${x.categoria}:</b>`, {parse_mode: 'HTML', 
  ...Markup.inlineKeyboard(x.subs.map(item => Markup.button.callback(item.subcategoria, `sub ${item.id}`)), {columns: 2})})
  }}))
})

bot.action(/sub (.+)/, (ctx) => {
  const option = ctx.match[1]
  ctx.session.current_sub = option
  console.log(ctx.session)
  ctx.session.sub.map(r => r.then(x => {if (x.id == option) {
    ctx.reply(`<b>Cursos ${x.categoria}:</b>`, {parse_mode: 'HTML', 
  ...Markup.inlineKeyboard(x.subs.map(item => Markup.button.callback(item.subcategoria, `sub ${item.id}`)), {columns: 2})})
  }}))
})

//ctx.reply('<b>Escolha uma subcategoria:\n</b>', {
//  parse_mode: 'HTML',
//  ...Markup.inlineKeyboard(ctx.session.sub.map(item => item.then(r => Markup.button.callback(r.categoria, `sub ${r.id}`))), {columns: 2})
//})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
