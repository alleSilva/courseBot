const Redis = require('ioredis')
const db = require('./db')

const redis = new Redis()


const getCategorias = async ()  => {
  let categorias = []

  const chave_categorias = 'categorias'
  
  let categorias_cache = await redis.get(chave_categorias)

  if(!categorias_cache) {
    const categorias_db = await db.selectCategorias()
    redis.set(chave_categorias, JSON.stringify(categorias_db), "EX", 60*5)
    categorias_cache = await redis.get(chave_categorias)
    categorias = JSON.parse(categorias_cache)
  
  } else {
    categorias = JSON.parse(categorias_cache)
  }

  return categorias
}

const getSubCategoria = async (cat)  => {
  let sub_categoria = []

  const chave_sub_categoria = `sub_categoria_${cat}`
  
  let sub_categoria_cache = await redis.get(chave_sub_categoria)

  if(!sub_categoria_cache) {
    const sub_categoria_db = await db.selectSubCategoria(cat)
    redis.set(chave_sub_categoria, JSON.stringify(sub_categoria_db), "EX", 60*5)
    sub_categoria_cache = await redis.get(chave_sub_categoria)
    sub_categoria = JSON.parse(sub_categoria_cache)
  
  } else {
    sub_categoria = JSON.parse(sub_categoria_cache)
  }

  return sub_categoria
}

const getCursos = async (cat, sub)  => {
  let cursos = []

  const chave_cursos = `cursos_${cat}_${sub}`
  
  let cursos_cache = await redis.get(chave_cursos)

  if(!cursos_cache) {
    const cursos_db = await db.selectCursos(cat, sub)
    redis.set(chave_cursos, JSON.stringify(cursos_db), "EX", 60*5)
    cursos_cache = await redis.get(chave_cursos)
    cursos = JSON.parse(cursos_cache)
  
  } else {
    cursos = JSON.parse(cursos_cache)
  }

  return cursos
}

module.exports = {getCategorias, getSubCategoria, getCursos}