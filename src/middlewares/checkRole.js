export const checkRole = (requiredRole) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated and has roles
      if (!req.user || !req.user.roles || !Array.isArray(req.user.roles)) {
        return res.status(401).json({ error: "Unauthorized: No roles found." });
      }

      // Check if the required role is present in user's roles
      if (!req.user.roles.includes(requiredRole)) {
        return res
          .status(403)
          .json({ error: `Forbidden: ${requiredRole} access required.` });
      }

      // Role matched, let them pass
      next();
    } catch (error) {
      console.error("Error in checkRole middleware:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  };
};
