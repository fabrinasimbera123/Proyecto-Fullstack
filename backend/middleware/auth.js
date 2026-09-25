export const protectAdmin = (req, res, next) => {
  try {
    const roles = req.kauth?.grant?.access_token?.content?.realm_access?.roles;
    if (roles && roles.includes('admin')) return next();
    return res.status(403).json({ message: 'Acceso denegado: rol admin requerido' });
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido o ausente' });
  }
};
