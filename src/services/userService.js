const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

class UserService {
  async createUser(data) {
    const { name, email, password, profile_ids = [] } = data;
    
    // Criptografa a senha (o '10' é o salt rounds, um padrão excelente e seguro)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Pegamos um "client" isolado para fazer uma Transação (garantir que ou salva tudo, ou não salva nada)
    const client = await db.connect();
    try {
      await client.query('BEGIN'); // Inicia a transação

      // 1. Cria o usuário
      const userQuery = `
        INSERT INTO users (name, email, password) 
        VALUES ($1, $2, $3) 
        RETURNING id, name, email, active, created_at;
      `;
      const userResult = await client.query(userQuery, [name, email, hashedPassword]);
      const user = userResult.rows[0];

      // 2. Vincula os perfis na tabela user_profiles
      if (profile_ids.length > 0) {
        for (const profileId of profile_ids) {
          await client.query(
            'INSERT INTO user_profiles (user_id, profile_id) VALUES ($1, $2)',
            [user.id, profileId]
          );
        }
      }

      await client.query('COMMIT'); // Confirma a transação
      return user; // Retorna sem a senha!
    } catch (error) {
      await client.query('ROLLBACK'); // Desfaz se der erro
      throw error;
    } finally {
      client.release(); // Devolve a conexão pro pool
    }
  }

  async login(email, password) {
    // Busca o usuário pela senha e email (trazemos a senha apenas aqui para comparar)
    const query = 'SELECT * FROM users WHERE email = $1 AND active = true;';
    const result = await db.query(query, [email]);
    const user = result.rows[0];

    if (!user) throw new Error('Usuário não encontrado ou inativo');

    // Compara a senha enviada com o hash do banco
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) throw new Error('Senha incorreta');

    // Gera o Token JWT (válido por 1 dia)
    const token = jwt.sign(
      { id: user.id, email: user.email }, 
      process.env.JWT_SECRET || 'sua_chave_super_secreta_aqui', 
      { expiresIn: '1d' }
    );

    // Remove a senha do objeto antes de devolver pro Front-end
    delete user.password;
    
    return { user, token };
  }

  async getAllUsers() {
    // Usa json_agg para trazer os perfis dentro de um array JSON nativo
    const query = `
      SELECT 
        u.id, u.name, u.email, u.active, u.created_at,
        COALESCE(
          json_agg(
            json_build_object('id', p.id, 'name', p.name, 'permissions', p.permissions)
          ) FILTER (WHERE p.id IS NOT NULL), '[]'
        ) AS profiles
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN profiles p ON up.profile_id = p.id
      WHERE u.active = true
      GROUP BY u.id
      ORDER BY u.name ASC;
    `;
    const result = await db.query(query);
    return result.rows;
  }

  // (Implementações de getById, update e delete seguem a mesma lógica, sempre omitindo a senha nos SELECTs)
  async getUserById(id) {
    // Usamos a mesma lógica do getAll para trazer os perfis junto com o usuário
    const query = `
      SELECT 
        u.id, u.name, u.email, u.active, u.created_at,
        COALESCE(
          json_agg(
            json_build_object('id', p.id, 'name', p.name, 'permissions', p.permissions)
          ) FILTER (WHERE p.id IS NOT NULL), '[]'
        ) AS profiles
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN profiles p ON up.profile_id = p.id
      WHERE u.id = $1 AND u.active = true
      GROUP BY u.id;
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  async updateUser(id, data) {
    const { name, email, active, profile_ids } = data;
    let { password } = data;

    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // 1. Monta a query dinâmica para atualizar os dados básicos
      let updateQuery = 'UPDATE users SET name = $1, email = $2, active = $3';
      let values = [name, email, active];
      let paramIndex = 4;

      // Se a senha foi enviada no update, fazemos o hash dela e adicionamos na query
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updateQuery += `, password = $${paramIndex}`;
        values.push(hashedPassword);
        paramIndex++;
      }

      updateQuery += ` WHERE id = $${paramIndex} RETURNING id, name, email, active, created_at;`;
      values.push(id);

      const userResult = await client.query(updateQuery, values);
      const user = userResult.rows[0];

      if (!user) throw new Error('Usuário não encontrado');

      // 2. Atualiza os perfis (se o array profile_ids foi enviado)
      if (profile_ids && Array.isArray(profile_ids)) {
        // Limpa os perfis antigos
        await client.query('DELETE FROM user_profiles WHERE user_id = $1', [id]);
        
        // Insere os novos perfis
        for (const profileId of profile_ids) {
          await client.query(
            'INSERT INTO user_profiles (user_id, profile_id) VALUES ($1, $2)',
            [id, profileId]
          );
        }
      }

      await client.query('COMMIT');
      return user; // Retorna sem a senha, conforme o padrão
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async deleteUser(id) {
    // Soft delete: Apenas desativa o usuário
    const query = 'UPDATE users SET active = false WHERE id = $1 RETURNING id, name, email, active;';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  async forgotPassword(email) {
    // 1. Verifica se o usuário existe
    const query = 'SELECT id, name FROM users WHERE email = $1 AND active = true;';
    const result = await db.query(query, [email]);
    const user = result.rows[0];

    if (!user) {
      // Retornamos sucesso mesmo se não existir para evitar "Email Enumeration Attack" (vazamento de dados)
      return { message: 'Se o email existir, um código foi enviado.' }; 
    }

    // 2. Gera um código de 6 dígitos e define validade (15 minutos)
    const resetCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // 3. Salva no banco de dados
    const updateQuery = `
      UPDATE users 
      SET reset_code = $1, reset_expires_at = $2 
      WHERE id = $3;
    `;
    await db.query(updateQuery, [resetCode, expiresAt, user.id]);

    // 4. Envia o email (Configuração Básica do Nodemailer)
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: '"Gestão TI Pro" <no-reply@gestaotipro.com>',
      to: email,
      subject: 'Seu código de recuperação de senha',
      text: `Olá ${user.name}, seu código de recuperação é: ${resetCode}. Ele expira em 15 minutos.`
    };

    // Aqui usamos try/catch para não travar a API caso o serviço de email caia
    try {
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Erro ao enviar email:', emailError);
      throw new Error('Falha ao enviar o email de recuperação');
    }

    return { message: 'Se o email existir, um código foi enviado.' };
  }

  async resetPassword(email, code, newPassword) {
    // 1. Busca o usuário pelo email
    const query = 'SELECT id, reset_code, reset_expires_at FROM users WHERE email = $1 AND active = true;';
    const result = await db.query(query, [email]);
    const user = result.rows[0];

    if (!user) throw new Error('Código inválido ou expirado.');

    // 2. Validações de segurança
    if (user.reset_code !== code) {
      throw new Error('Código inválido.');
    }

    if (new Date() > new Date(user.reset_expires_at)) {
      throw new Error('Código expirado. Solicite um novo.');
    }

    // 3. Tudo certo! Hasheia a nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Atualiza a senha e limpa as colunas de recuperação
    const updateQuery = `
      UPDATE users 
      SET password = $1, reset_code = NULL, reset_expires_at = NULL 
      WHERE id = $2;
    `;
    await db.query(updateQuery, [hashedPassword, user.id]);

    return { message: 'Senha atualizada com sucesso.' };
  }
}

module.exports = new UserService();