const CompanyService = require('../services/companyService');

class CompanyController {
  async create(req, res) {
    try {
      const company = await CompanyService.createCompany(req.body);
      return res.status(201).json(company);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao criar fornecedor', details: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const companies = await CompanyService.getAllCompanies();
      return res.status(200).json(companies);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar fornecedores' });
    }
  }

  async getById(req, res) {
    try {
      const company = await CompanyService.getCompanyById(req.params.id);
      if (!company) {
        return res.status(404).json({ error: 'Fornecedor não encontrado' });
      }
      return res.status(200).json(company);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar fornecedor' });
    }
  }

  async update(req, res) {
    try {
      const company = await CompanyService.updateCompany(req.params.id, req.body);
      if (!company) {
        return res.status(404).json({ error: 'Fornecedor não encontrado' });
      }
      return res.status(200).json(company);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar fornecedor' });
    }
  }

  async delete(req, res) {
    try {
      const company = await CompanyService.deleteCompany(req.params.id);
      return res.status(200).json({ message: 'Fornecedor desativado com sucesso', company });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao desativar fornecedor' });
    }
  }
}

module.exports = new CompanyController();