const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Pega o token do cabeçalho 'Authorization'
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  // O padrão é "Bearer huf7w8yfheuiwfh...", então separamos pelo espaço
  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Erro na formatação do Token.' });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: 'Token mal formatado.' });
  }

  // Verifica se o token é real e se não expirou
  jwt.verify(token, process.env.JWT_SECRET || 'sua_chave_super_secreta_aqui', (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }

    // Pendura o ID do usuário na requisição para que os Controllers saibam quem fez a ação
    req.userId = decoded.id;
    return next(); // Deixa o usuário passar!
  });
};