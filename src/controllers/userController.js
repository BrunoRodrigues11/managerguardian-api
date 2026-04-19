const UserService = require('../services/userService');

class UserController {
  async create(req, res) {
    try {
      const user = await UserService.createUser(req.body);
      return res.status(201).json(user);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao criar usuário', details: error.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const data = await UserService.login(email, password);
      return res.status(200).json(data); // Retorna { user, token }
    } catch (error) {
      return res.status(401).json({ error: 'Falha na autenticação', details: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const users = await UserService.getAllUsers();
      return res.status(200).json(users);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar usuários' });
    }
  }

  async getById(req, res) {
    try {
      const user = await UserService.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
  }

  async update(req, res) {
    try {
      const user = await UserService.updateUser(req.params.id, req.body);
      return res.status(200).json(user);
    } catch (error) {
      // Diferencia erro de não encontrado vs erro de banco
      if (error.message === 'Usuário não encontrado') {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Erro ao atualizar usuário', details: error.message });
    }
  }

  async delete(req, res) {
    try {
      const user = await UserService.deleteUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      return res.status(200).json({ message: 'Usuário desativado com sucesso', user });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao desativar usuário' });
    }
  }
}

module.exports = new UserController();