const { Telegraf, Markup } = require('telegraf')
const {session} = require('telegraf')
const cache = require('./cache')

const token = process.env.BOT_TOKEN
const channel = process.env.CHANNEL_ID

if (token === undefined) {
  throw new Error('BOT_TOKEN must be provided!')
}

const bot = new Telegraf(token)
bot.use(session())

const catObj = (id, categoria, subs) => ({
  id: id,
  categoria: categoria,
  subs: subs
})

bot.command('start', async (ctx, next) => {
  ctx.session = {
    categorias: [],
    sub: [],
    cursos: [],
    current_cat: 0,
    current_sub: 0,
  }

  const categorias = await cache.getCategorias()
  ctx.session.categorias = categorias

  return await ctx.reply('<b>Boas Vindas!</b>', {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard([
      Markup.button.url('🤑 Fazer doação', 'https://t.me/+JK7wnzLtPA1jZTVh'),
      Markup.button.callback('▶️ Continuar', 'categorias')
    ])
  })
})

bot.action('categorias', async (ctx) => {
  ctx.session.sub = ctx.session.categorias.map(async item => {
    const sub = await cache.getSubCategoria(item.id)
    return catObj(item.id, item.categoria, sub)
  })

  return await ctx.reply('<b>Escolha uma categoria:\n</b>', {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard(ctx.session.categorias.map(
      item => Markup.button.callback(item.categoria, `sub ${item.id}`)), {columns: 2})
  })
   }
)

bot.action(/sub (.+)/, async (ctx) => {
  const option = ctx.match[1]
  ctx.session.current_cat = option
  return await ctx.session.sub.map(r => r.then(x => {if (x.id == option) {
    ctx.reply(`<b>Cursos ${x.categoria}:</b>`, {
      parse_mode: 'HTML', 
  ...Markup.inlineKeyboard(x.subs.map(
    item => Markup.button.callback(item.subcategoria, `cursos ${item.subcategoria} ${item.id}`)), {columns: 2})})
  }}))
})

bot.action(/cursos (.+)/, async (ctx) => {
  let sub_info = ""
  let option = ""
  const infos = ctx.match[0].split(" ")

  if (infos.length == 3) {
    option = infos[2]
    sub_info = infos[1]
  } else {
    option = infos[infos.length -1] 
    for(let i = 1; i < infos.length - 1; i++) {
      sub_info = sub_info + " " + infos[i]
    }
  }

  ctx.session.current_sub = option
  const cursos = await cache.getCursos(ctx.session.current_cat, ctx.session.current_sub)
  
  ctx.session.cursos = cursos
 
  ctx.reply(`<b>Cursos ${sub_info}:</b>`, {
    parse_mode: 'HTML', 
  ...Markup.inlineKeyboard(
    cursos.map(item => Markup.button.callback(item.nome, `encaminha ${item.mid}`)), {columns: 2})}
    )
})

bot.action(/encaminha (.+)/, (ctx) => {
  const mid = ctx.match[1]
  ctx.telegram.forwardMessage(ctx.chat.id, channel, mid)
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
