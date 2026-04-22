const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

class UserService {
_sanitizeData(data) {
    const payload = {};
    for (const [key, value] of Object.entries(data)) {
      if (key === 'id' || key === 'profileIds' || key === 'profile_ids') continue;
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      payload[snakeKey] = value;
    }
    return payload;
  }

  async createUser(data) {
    const client = await db.connect(); // Usamos transação
    try {
      await client.query('BEGIN');
      
      const payload = this._sanitizeData(data);
      // Hash da senha se existir
      if (payload.password) {
          payload.password_hash = await bcrypt.hash(payload.password, 10);
          delete payload.password;
      }

      const fields = Object.keys(payload);
      const values = Object.values(payload);
      const placeholders = fields.map((_, index) => `$${index + 1}`).join(', ');
      
      const userResult = await client.query(
          `INSERT INTO users (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *;`, 
          values
      );
      const newUser = userResult.rows[0];

      // Salvar os perfis na tabela de junção
      const profileIds = data.profile_ids || data.profileIds || [];
      for (const profileId of profileIds) {
          await client.query(
              'INSERT INTO user_profiles (user_id, profile_id) VALUES ($1, $2)',
              [newUser.id, profileId]
          );
      }

      await client.query('COMMIT');
      return { ...newUser, profile_ids: profileIds };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

async login(email, password) {
    // 1. QUERY CORRIGIDA: Agora fazemos o JOIN e o array_agg para trazer os perfis junto com o usuário!
    const query = `
      SELECT u.*, 
             COALESCE(array_agg(up.profile_id) FILTER (WHERE up.profile_id IS NOT NULL), ARRAY[]::uuid[]) as profile_ids
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.email = $1 AND u.active = true
      GROUP BY u.id;
    `;
    const result = await db.query(query, [email]);
    const user = result.rows[0];

    if (!user) throw new Error('Usuário não encontrado ou inativo');

    // 2. Compara a senha enviada com o hash do banco
    // (Adicionei uma dupla checagem caso sua coluna no banco se chame password ou password_hash)
    const userPassword = user.password || user.password_hash; 
    const isValidPassword = await bcrypt.compare(password, userPassword);
    
    if (!isValidPassword) throw new Error('Senha incorreta');

    // 3. Gera o Token JWT (válido por 1 dia)
    const token = jwt.sign(
      { id: user.id, email: user.email }, 
      process.env.JWT_SECRET || 'sua_chave_super_secreta_aqui', 
      { expiresIn: '1d' }
    );

    // 4. Remove a senha do objeto antes de devolver pro Front-end por segurança
    delete user.password;
    delete user.password_hash;
    
    return { user, token };
  }

async getAllUsers() {
    // Usamos array_agg para agrupar os IDs dos perfis do usuário em uma única linha
    const query = `
      SELECT u.*, 
             COALESCE(array_agg(up.profile_id) FILTER (WHERE up.profile_id IS NOT NULL), ARRAY[]::uuid[]) as profile_ids
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
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
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      
      const payload = this._sanitizeData(data);
      
      // Se a senha foi enviada, atualiza o hash. Se veio vazia, removemos do payload para não sobrescrever.
      if (payload.password) {
          payload.password_hash = await bcrypt.hash(payload.password, 10);
          delete payload.password;
      } else {
          delete payload.password;
      }

      const fields = Object.keys(payload);
      const values = Object.values(payload);
      
      let updatedUser = { id };
      
      if (fields.length > 0) {
          const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
          const userResult = await client.query(
              `UPDATE users SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *;`, 
              [...values, id]
          );
          updatedUser = userResult.rows[0];
      }

      // Atualiza os perfis (Remove os antigos e insere os novos)
      if (data.profile_ids || data.profileIds) {
          const profileIds = data.profile_ids || data.profileIds;
          await client.query('DELETE FROM user_profiles WHERE user_id = $1', [id]);
          
          for (const profileId of profileIds) {
              await client.query(
                  'INSERT INTO user_profiles (user_id, profile_id) VALUES ($1, $2)',
                  [id, profileId]
              );
          }
          updatedUser.profile_ids = profileIds;
      }

      await client.query('COMMIT');
      return updatedUser;
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