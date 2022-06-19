const mysql = require('mysql2/promise')
const env = require('./.env')

async function connect() {
  const connection = await mysql.createConnection({
    host: env.HOST,
    user: 'bot',
    password: env.PASSWORD,
    database: env.DATABASE
  });
  global.connection = connection
  return connection
}

connect()

const selectCategorias = async () => {
  const conn = await connect()
  const [rows] = await conn.query('SELECT * FROM categorias;')
  return rows
}

const selectSubCategoria = async (cat) => {
  const conn = await connect()
  const [rows] = await conn.query(`SELECT * FROM sub WHERE categoria = ${cat}`)
  return rows
}

const selectCursos = async (cat, sub) => {
  const conn = await connect()
  const [rows] = await conn.query(`SELECT * FROM cursos WHERE categoria = ${cat} AND sub = ${sub}`)
  return rows
}

module.exports = {selectCategorias, selectSubCategoria, selectCursos}



