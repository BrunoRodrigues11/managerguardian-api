const ProfileService = require('../services/profileService');

class ProfileController {
  async create(req, res) {
    try {
      const profile = await ProfileService.createProfile(req.body);
      return res.status(201).json(profile);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao criar perfil', details: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const profiles = await ProfileService.getAllProfiles();
      return res.status(200).json(profiles);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar perfis' });
    }
  }

  async getById(req, res) {
    try {
      const profile = await ProfileService.getProfileById(req.params.id);
      if (!profile) {
        return res.status(404).json({ error: 'Perfil não encontrado' });
      }
      return res.status(200).json(profile);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar perfil' });
    }
  }

  async update(req, res) {
    try {
      const profile = await ProfileService.updateProfile(req.params.id, req.body);
      if (!profile) {
        return res.status(404).json({ error: 'Perfil não encontrado' });
      }
      return res.status(200).json(profile);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }
  }

  async delete(req, res) {
    try {
      const profile = await ProfileService.deleteProfile(req.params.id);
      if (!profile) {
        return res.status(404).json({ error: 'Perfil não encontrado' });
      }
      return res.status(200).json({ message: 'Perfil desativado com sucesso', profile });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao desativar perfil' });
    }
  }
}

module.exports = new ProfileController();