const mysql = require('mysql2/promise')

async function connect() {
  const connection = await mysql.createConnection({
    host: '192.241.133.158',
    user: 'bot',
    password: '123456',
    database: 'devworldcursos'
  });
  global.connection = connection
  return connection
}

connect()

async function selectCourses() {
  const conn = await connect()
  const [rows] = await conn.query('SELECT * FROM cursos;')
  return rows
}

module.exports = {selectCourses}



