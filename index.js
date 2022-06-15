const { Telegraf, Markup } = require('telegraf')
const {session} = require('telegraf')
const db = require('./db') //selectCategorias, selectSubCategoria, selectCursos
const {catObj, categorias, subcategoria,cursos, categorias_subs} = require('./listas')

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
    cursos: [],
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
bot.action(/cat (.+)/, async (ctx) => {
  const option = ctx.match[1]
  ctx.session.current_cat = option
  return await ctx.session.sub.map(r => r.then(x => {if (x.id == option) {
    ctx.reply(`<b>Cursos ${x.categoria}:</b>`, {parse_mode: 'HTML', 
  ...Markup.inlineKeyboard(x.subs.map(item => Markup.button.callback(item.subcategoria, `sub ${item.id}`)), {columns: 2})})
  }}))
})

bot.action(/sub (.+)/, async (ctx) => {
  const option = ctx.match[1]
  ctx.session.current_sub = option
  const cursos = await db.selectCursos(ctx.session.current_cat, ctx.session.current_sub)
  //await cursos.then(res => ctx.session.cursos = res)
  ctx.session.cursos = cursos
  console.log(ctx.session.cursos)
    
  ctx.session.sub.map(r => r.then(x => {if (x.id == option) {
    ctx.reply(`<b>Cursos ${x.categoria}:</b>`, {parse_mode: 'HTML', 
  ...Markup.inlineKeyboard(x.subs.map(item => Markup.button.callback(item.subcategoria, `cursos ${item.categoria} ${item.id}`)), {columns: 2})})
  }}))
})

bot.action(/cursos (.+)/, (ctx) => {
  const option = ctx.match[1]
  console.log(ctx.match)
  console.log('>>>', ctx.session)
    
  ctx.session.cursos.map(x => {
    ctx.reply(`<b>Cursos ${x.nome}:</b>`, {parse_mode: 'HTML', 
  ...Markup.inlineKeyboard(x.cursos.map(item => Markup.button.callback(item.nome, `curso ${item.mid}`)), {columns: 2})})
  
})
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
