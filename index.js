const { Telegraf, Markup } = require('telegraf')
const {session} = require('telegraf')
const db = require('./db') //selectCategorias, selectSubCategoria, selectCursos
const {catObj, subcategoria,cursos, categorias_subs} = require('./listas')

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
    sub2: [],
    cursos: [],
    current_cat: 0,
    current_sub: 0,
    current_sub_name: ''
  }

  const categorias = await db.selectCategorias()
  ctx.session.categorias = categorias

 /*  let cat = ctx.session.categorias
  for(item in cat) {
    const sub2 = await db.selectSubCategoria(cat[item].id)
    ctx.session.sub2[item] = catObj(cat[item].id, cat[item].categoria, sub2)
  } */
  //categorias.then(res => ctx.session.categorias = res)
  //subcategoria.then(res => console.log(res))
  //cursos.then(res => console.log(res))
  return await ctx.reply('<b>Boas Vindas!</b>', {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard([
      Markup.button.url('🤑 Fazer doação', 'https://t.me/+JK7wnzLtPA1jZTVh'),
      Markup.button.callback('▶️ Continuar', 'categorias')
    ])
  })
})
//-1001505347688
//-1001691603480

bot.action('categorias', async (ctx) => {
  //const categorias = await db.select
  ctx.session.sub = ctx.session.categorias.map(async item => {
    const sub = db.selectSubCategoria(item.id)
    return await sub.then(r => catObj(item.id, item.categoria, r))
  }) 

 /*  ctx.session.categorias.map(async item => {
    
    return await sub.then(r => catObj(item.id, item.categoria, r))
  }) */

  /* ctx.session.sub = ctx.session.categorias.map(async item => {
    const sub = await db.selectSubCategoria(item.id)
    return await sub.map(r => catObj(item.id, item.categoria, r))
  }) */
  return await ctx.reply('<b>Escolha uma categoria:\n</b>', {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard(ctx.session.categorias.map(item => Markup.button.callback(item.categoria, `sub ${item.id}`)), {columns: 2})
  })
   }
)

bot.action(/sub (.+)/, async (ctx) => {
  const option = ctx.match[1]
  ctx.session.current_cat = option
  return await ctx.session.sub.map(r => r.then(x => {if (x.id == option) {
    ctx.reply(`<b>Cursos ${x.categoria}:</b>`, {parse_mode: 'HTML', 
  ...Markup.inlineKeyboard(x.subs.map(item => Markup.button.callback(item.subcategoria, `cursos ${item.subcategoria} ${item.id}`)), {columns: 2})})
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
  //console.log(ctx.session.sub.map(async r => await r.then(x => x)))
  const cursos = await db.selectCursos(ctx.session.current_cat, ctx.session.current_sub)
  
  ctx.session.cursos = cursos
 
  ctx.reply(`<b>Cursos ${sub_info}:</b>`, {parse_mode: 'HTML', 
  ...Markup.inlineKeyboard(cursos.map(item => Markup.button.callback(item.nome, `encaminha ${item.mid}`)), {columns: 2})})
  
})

bot.action(/encaminha (.+)/, (ctx) => {
  const mid = ctx.match[1]
  ctx.telegram.forwardMessage(ctx.chat.id, -1001691603480, mid)
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
