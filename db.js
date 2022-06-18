const mysql = require('mysql2/promise')

async function connect() {
  const connection = await mysql.createConnection({
    host: process.env.HOST,
    user: 'bot',
    password: process.env.PASSWORD,
    database: process.env.DATABASE
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



