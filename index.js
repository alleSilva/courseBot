const { Telegraf, Markup } = require('telegraf')
const {session} = require('telegraf')
const env = require('./.env')
const cache = require('./cache')

const token = env.BOT_TOKEN
const channel = env.CHANNEL_ID

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

bot.command('start', (ctx, next) =>{
  ctx.reply('Carregando... Selecione /categorias', Markup
    .keyboard(['/categorias'])
    .oneTime()
    .resize()
  )

  return next()}
)

bot.command('categorias', async (ctx,) => {
  ctx.session = {
    categorias: [],
    sub: [],
    cursos: [],
    current_cat: 0,
    current_sub: 0,
  }

  ctx.session.categorias = await cache.getCategorias()

  return ctx.reply('<b>Boas Vindas!</b>', {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard([
      Markup.button.url('🤑 Fazer doação', 'https://t.me/+JK7wnzLtPA1jZTVh'),
      Markup.button.callback('▶️ Categorias', 'categorias')
    ])
  })
})

bot.action('categorias', async (ctx) => {
  if(ctx.session) cache.getCategorias().then(r => ctx.session.categorias = r)
  ctx.session.sub = ctx.session.categorias.map(async item => {
    let sub = await cache.getSubCategoria(item.id)
    return catObj(item.id, item.categoria, sub)
  })

  return ctx.reply('<b>Escolha uma categoria:\n</b>', {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard(ctx.session.categorias.map(
      item => Markup.button.callback(item.categoria, `sub ${item.id}`)), {columns: 2})
  })
   }
)

bot.action(/sub (.+)/, async (ctx) => {
  if(ctx.session) ctx.session.current_cat = ctx.match[1];
  return ctx.session.sub.map(r => r.then(async x => {
    if (x.id == ctx.match[1]) {
      ctx.reply(`<b>${x.categoria}:</b>`, {
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
  ctx.session.cursos = await cache.getCursos(ctx.session.current_cat, ctx.session.current_sub)
  
  ctx.reply(`<b>Cursos ${sub_info}:</b>`, {
    parse_mode: 'HTML', 
  ...Markup.inlineKeyboard(
    ctx.session.cursos.map(item => Markup.button.callback(item.nome, `encaminha ${item.mid}`)), {columns: 2})}
    )
})

bot.action(/encaminha (.+)/, (ctx) => {
  const mid = ctx.match[1]
  ctx.telegram.forwardMessage(ctx.chat.id, channel, mid)
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
